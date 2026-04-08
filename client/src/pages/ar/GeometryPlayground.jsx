import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import ARScene, { useARContext } from '../../components/ar/ARScene';
import ARMarkerHandler from '../../components/ar/ARMarkerHandler';
import ShapeToolbar from '../../components/ar/ShapeToolbar';
import PropertiesPanel from '../../components/ar/PropertiesPanel';
import SlicingTool from '../../components/ar/SlicingTool';
import NetUnfolder from '../../components/ar/NetUnfolder';
import FormulaDisplay from '../../components/ar/FormulaDisplay';
import {
  createShape, createWireframe, createLabel,
  calculateMeasurements, disposeObject,
} from '../../utils/threeHelpers';

const MAX_SHAPES = 3;
const TRANSFORM_MODES = [
  { id: 'translate', icon: '✥', label: 'Move'   },
  { id: 'rotate',    icon: '↻', label: 'Rotate' },
  { id: 'scale',     icon: '⤢', label: 'Scale'  },
];

// ─────────────────────────────────────────────────────────────────────────────
function PlaygroundInner() {
  const navigate = useNavigate();
  const { refs, addObject, removeObject, addRenderCallback } = useARContext();

  // ── Shape state ────────────────────────────────────────────────────────────
  const [shapes, setShapes]         = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const shapesRef   = useRef([]);
  const selectedRef = useRef(null);

  const selectedShape = shapes.find(s => s.id === selectedId) ?? null;

  useEffect(() => { shapesRef.current = shapes; },    [shapes]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);

  // ── Selection helpers (glow + wireframe) ──────────────────────────────────
  // Kept OUTSIDE React state so they are never created/destroyed inside a
  // setState updater — which React 19 StrictMode calls TWICE, causing two
  // stacked BackSide glow meshes that fully occlude the shape.
  const selectionRef = useRef({ id: null, glow: null, wire: null });

  const detachSelectionHelpers = useCallback(() => {
    const { id, wire } = selectionRef.current;
    if (!id) return;
    const s = shapesRef.current.find(x => x.id === id);
    if (s?.mesh) {
      // Restore original emissive values
      if (s.mesh.material) {
        s.mesh.material.emissive.setHex(0x662200);
        s.mesh.material.emissiveIntensity = 0.6;
      }
      if (wire) { s.mesh.remove(wire); wire.geometry.dispose(); wire.material.dispose(); }
    }
    selectionRef.current = { id: null, wire: null };
  }, []);

  const attachSelectionHelpers = useCallback((id) => {
    detachSelectionHelpers();
    if (!id) return;
    const s = shapesRef.current.find(x => x.id === id);
    if (!s?.mesh) return;

    // Boost emissive to signal selection — no extra geometry, no depth-sort conflict.
    // The BackSide glow mesh approach caused the transparent render pass to
    // occlude the shape itself (depth test failure on inner-facing fragments).
    if (s.mesh.material) {
      s.mesh.material.emissive.setHex(0xFF4400);
      s.mesh.material.emissiveIntensity = 1.2;
    }

    // Yellow wireframe overlay (separate geometry — always renders on top of fill)
    const wire = createWireframe(s.mesh);
    wire.renderOrder = 1;            // render after the mesh fill
    wire.material.depthTest = false; // always visible even through mesh surface
    s.mesh.add(wire);

    selectionRef.current = { id, wire };
  }, [detachSelectionHelpers]);

  // ── Idle rotation for unselected shapes (runs inside the main render loop) ─
  useEffect(() => {
    return addRenderCallback(() => {
      shapesRef.current.forEach(s => {
        // Stop rotating when selected so TransformControls gizmo stays stable
        if (s.id !== selectedRef.current) {
          s.mesh.rotation.y += 0.004;
        }
      });
    });
  }, [addRenderCallback]);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [activeMode,     setActiveMode]     = useState('idle');
  const [transformMode,  setTransformMode]  = useState('translate');
  const [showProperties, setShowProperties] = useState(false);
  const [showFormula,    setShowFormula]    = useState(false);
  const [waterLevel,     setWaterLevel]     = useState(0);
  const waterAnimRef   = useRef(null);
  const waterMeshesRef = useRef([]);

  // ── TransformControls ─────────────────────────────────────────────────────
  const tcRef       = useRef(null);
  const tcReadyRef  = useRef(false);

  // ── Raycaster ─────────────────────────────────────────────────────────────
  const raycaster = useRef(new THREE.Raycaster());
  const mouse     = useRef(new THREE.Vector2());

  // ── Tap handler ref (always current, used from stable canvas listeners) ───
  // Defined as a ref so the canvas effect (which runs once) always calls the
  // latest version without needing to re-add listeners.
  const tapHandlerRef = useRef(null);
  tapHandlerRef.current = useCallback((clientX, clientY) => {
    const canvas = refs.current.renderer?.domElement;
    if (!canvas || !refs.current.camera) return;
    const rect = canvas.getBoundingClientRect();
    mouse.current.x =  ((clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.current.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, refs.current.camera);

    const meshes = shapesRef.current.map(s => s.mesh);
    // intersect only the top-level shape meshes (not glow/wire children)
    const hits = raycaster.current.intersectObjects(meshes, false);

    if (hits.length) {
      const found = shapesRef.current.find(s => s.mesh === hits[0].object);
      if (found) { selectShape(found.id === selectedRef.current ? null : found.id); return; }
    }
    selectShape(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refs]);

  // ──────────────────────────────────────────────────────────────────────────
  // Attach event listeners DIRECTLY to renderer.domElement (not overlay div)
  // so TransformControls and our tap/pinch logic share the same canvas events.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    let cleanup = null;

    (async () => {
      // Wait for renderer to be available
      for (let i = 0; i < 40 && mounted; i++) {
        if (refs.current.renderer?.domElement) break;
        await new Promise(r => setTimeout(r, 150));
      }
      if (!mounted) return;

      const canvas = refs.current.renderer?.domElement;
      if (!canvas) return;

      // Local gesture state (lives in closure, no re-renders)
      let pd    = { x: 0, y: 0, t: 0, moved: false };
      let pinch = { active: false, startDist: 1, startScale: 1 };

      const onPointerDown = (e) => {
        pd = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
      };

      const onPointerMove = (e) => {
        if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 6) pd.moved = true;
      };

      const onPointerUp = (e) => {
        if (pd.moved || Date.now() - pd.t > 300) return; // was a drag, not a tap
        tapHandlerRef.current?.(e.clientX, e.clientY);
      };

      // ── Touch (mobile) ────────────────────────────────────────────────────
      const onTouchStart = (e) => {
        if (e.touches.length === 1) {
          pd = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now(), moved: false };
        }
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const sel = shapesRef.current.find(s => s.id === selectedRef.current);
          pinch = { active: true, startDist: Math.hypot(dx, dy), startScale: sel?.mesh.scale.x ?? 1 };
          pd.moved = true; // two-finger start cancels tap
        }
      };

      const onTouchMove = (e) => {
        if (e.touches.length === 1) {
          const dx = e.touches[0].clientX - pd.x;
          const dy = e.touches[0].clientY - pd.y;
          if (Math.hypot(dx, dy) > 6) pd.moved = true;
        }
        if (e.touches.length === 2 && pinch.active) {
          e.preventDefault(); // block browser zoom
          const dx   = e.touches[0].clientX - e.touches[1].clientX;
          const dy   = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const s    = Math.max(0.15, Math.min(pinch.startScale * dist / pinch.startDist, 4));
          const sel  = shapesRef.current.find(x => x.id === selectedRef.current);
          if (sel) sel.mesh.scale.setScalar(s);
          pd.moved = true;
        }
      };

      const onTouchEnd = (e) => {
        pinch.active = false;
        if (pd.moved || Date.now() - pd.t > 300) return;
        const t = e.changedTouches?.[0];
        if (t) tapHandlerRef.current?.(t.clientX, t.clientY);
      };

      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup',   onPointerUp);
      canvas.addEventListener('touchstart',  onTouchStart, { passive: false });
      canvas.addEventListener('touchmove',   onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',    onTouchEnd);

      cleanup = () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup',   onPointerUp);
        canvas.removeEventListener('touchstart',  onTouchStart);
        canvas.removeEventListener('touchmove',   onTouchMove);
        canvas.removeEventListener('touchend',    onTouchEnd);
      };
    })();

    return () => { mounted = false; cleanup?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ──────────────────────────────────────────────────────────────────────────
  // Init TransformControls
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    (async () => {
      for (let i = 0; i < 40 && mounted; i++) {
        if (refs.current.renderer && refs.current.camera) break;
        await new Promise(r => setTimeout(r, 150));
      }
      if (!mounted || tcReadyRef.current) return;

      try {
        const { TransformControls } = await import(
          'three/examples/jsm/controls/TransformControls.js'
        );
        const { renderer, camera, scene } = refs.current;
        if (!renderer || !camera || !scene) return;

        const tc = new TransformControls(camera, renderer.domElement);
        tc.setSize(0.9);
        tc.setSpace('local');
        tc.visible = false;

        // Pause OrbitControls while dragging the gizmo
        tc.addEventListener('dragging-changed', e => {
          if (refs.current.controls) refs.current.controls.enabled = !e.value;
        });

        scene.add(tc);
        tcRef.current     = tc;
        tcReadyRef.current = true;

        // Attach immediately if something is already selected
        const sel = shapesRef.current.find(s => s.id === selectedRef.current);
        if (sel) { tc.attach(sel.mesh); tc.visible = true; tc.setMode(transformMode); }
      } catch (err) {
        console.warn('[TC] load failed:', err.message);
      }
    })();
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach / detach when selection changes
  useEffect(() => {
    const tc = tcRef.current;
    if (!tc) return;
    if (selectedShape) {
      tc.attach(selectedShape.mesh);
      tc.setMode(transformMode);
      tc.visible = true;
    } else {
      tc.detach();
      tc.visible = false;
    }
  }, [selectedId, transformMode]); // eslint-disable-line

  // Sync mode
  useEffect(() => {
    if (tcRef.current && selectedShape) tcRef.current.setMode(transformMode);
  }, [transformMode]); // eslint-disable-line

  // ──────────────────────────────────────────────────────────────────────────
  // Shape management
  // ──────────────────────────────────────────────────────────────────────────
  const spawnShape = useCallback((type) => {
    // NOTE: addObject() must NOT be called inside the setShapes updater.
    // React 19 StrictMode calls updater functions twice to detect side effects.
    // Calling addObject inside would add TWO meshes at the same position → z-fight → invisible.
    // Instead: build the mesh in the updater (pure), then add to scene in a useEffect below.
    setShapes(prev => {
      if (prev.length >= MAX_SHAPES) return prev;
      const id     = `shape_${Date.now()}`;
      const params = defaultParams(type);
      const mesh   = createShape(type, params);
      const SLOT_X = [-16, 0, 16];
      mesh.position.set(SLOT_X[prev.length] ?? prev.length * 16, 0, 0);

      const m          = calculateMeasurements(type, params);
      const labelGroup = new THREE.Group();
      Object.entries(m.dimensions ?? {}).forEach(([k, v], i) => {
        labelGroup.add(createLabel(`${k}: ${v}`, new THREE.Vector3(0, 8 + i * 3.5, 0)));
      });
      mesh.add(labelGroup);
      // Do NOT call addObject here — see useEffect below
      return [...prev, { id, type, params, mesh, labels: labelGroup }];
    });
  }, []);

  // Add freshly-spawned meshes to the Three.js scene AFTER React state settles.
  // mesh.parent === null means it hasn't been added yet (safe to call even on re-renders).
  useEffect(() => {
    shapes.forEach(s => {
      if (!s.mesh.parent) addObject(s.mesh);
    });
  }, [shapes, addObject]);

  const selectShape = useCallback((id) => {
    // Direct Three.js operations — NOT inside setState — so StrictMode's
    // double-invoke of state updaters can never attach duplicate helpers.
    attachSelectionHelpers(id);
    setSelectedId(id);
    setShowProperties(!!id);
    if (!id) setShowFormula(false);
  }, [attachSelectionHelpers]);

  const deleteSelected = useCallback(() => {
    if (!selectedRef.current) return;
    detachSelectionHelpers();   // remove glow + wire before mesh is disposed
    tcRef.current?.detach();
    setShapes(prev => {
      const s = prev.find(x => x.id === selectedRef.current);
      if (s) { removeObject(s.mesh); disposeObject(s.mesh); }
      return prev.filter(x => x.id !== selectedRef.current);
    });
    setSelectedId(null);
    setShowProperties(false);
    setShowFormula(false);
  }, [removeObject, detachSelectionHelpers]);

  const updateParams = useCallback((newParams) => {
    if (!selectedRef.current) return;
    setShapes(prev => prev.map(s => {
      if (s.id !== selectedRef.current) return s;
      const replacement = createShape(s.type, newParams);
      s.mesh.geometry.dispose();
      s.mesh.geometry = replacement.geometry;
      replacement.geometry.dispose = () => {};
      // Sync selection helpers to the new geometry (helpers live in selectionRef, not state)
      const { glow, wire } = selectionRef.current;
      if (glow) { glow.geometry = s.mesh.geometry; glow.scale.setScalar(1.10); }
      if (wire) {
        const wfGeo = new THREE.WireframeGeometry(s.mesh.geometry);
        wire.geometry.dispose();
        wire.geometry = wfGeo;
      }
      s.mesh.remove(s.labels);
      s.labels.traverse(c => { c.material?.map?.dispose(); c.material?.dispose(); });
      const m          = calculateMeasurements(s.type, newParams);
      const labelGroup = new THREE.Group();
      Object.entries(m.dimensions ?? {}).forEach(([k, v], i) => {
        labelGroup.add(createLabel(`${k}: ${v}`, new THREE.Vector3(0, 8 + i * 3.5, 0)));
      });
      s.mesh.add(labelGroup);
      if (tcRef.current) { tcRef.current.detach(); tcRef.current.attach(s.mesh); }
      return { ...s, params: newParams, labels: labelGroup };
    }));
  }, []);

  // ── Mode ───────────────────────────────────────────────────────────────────
  const handleModeChange = useCallback((m) => {
    setActiveMode(m);
    if (m === 'compare') startCompare();
    else stopCompare();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shapes]);

  // ── Compare water-fill ────────────────────────────────────────────────────
  function startCompare() {
    if (shapes.length < 2) return;
    const [s1, s2] = shapes;
    const m1 = calculateMeasurements(s1.type, s1.params);
    const m2 = calculateMeasurements(s2.type, s2.params);
    const maxV = Math.max(m1.volume, m2.volume);
    const waterMeshes = [s1, s2].map((s, i) => {
      const r = s.params.radius ?? s.params.width ?? 5;
      const h = s.params.height ?? r * 2;
      const wm = new THREE.Mesh(
        new THREE.CylinderGeometry(r * 0.9, r * 0.9, h, 32, 1, true),
        new THREE.MeshPhongMaterial({ color: 0x3399FF, transparent: true, opacity: 0.45, emissive: 0x001133, side: THREE.DoubleSide }),
      );
      wm.position.copy(s.mesh.position);
      wm.scale.y = 0;
      addObject(wm);
      return { mesh: wm, targetScale: (i === 0 ? m1.volume : m2.volume) / maxV };
    });
    waterMeshesRef.current = waterMeshes;
    let t = 0;
    const tick = () => {
      t = Math.min(t + 0.015, 1);
      waterMeshes.forEach(w => { w.mesh.scale.y = w.targetScale * t; });
      setWaterLevel(t);
      if (t < 1) waterAnimRef.current = requestAnimationFrame(tick);
    };
    waterAnimRef.current = requestAnimationFrame(tick);
  }

  function stopCompare() {
    cancelAnimationFrame(waterAnimRef.current);
    waterMeshesRef.current.forEach(w => {
      removeObject(w.mesh); w.mesh.geometry.dispose(); w.mesh.material.dispose();
    });
    waterMeshesRef.current = [];
    setWaterLevel(0);
  }

  // Cleanup on unmount
  useEffect(() => () => {
    detachSelectionHelpers();
    stopCompare();
    if (tcRef.current) {
      tcRef.current.detach();
      refs.current.scene?.remove(tcRef.current);
      tcRef.current.dispose();
    }
    shapesRef.current.forEach(s => { removeObject(s.mesh); disposeObject(s.mesh); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const measurements = selectedShape
    ? calculateMeasurements(selectedShape.type, selectedShape.params)
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <ARMarkerHandler onMarkerFound={() => {}} onMarkerLost={() => {}} />

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', pointerEvents: 'auto' }}
      >
        <button
          onClick={() => navigate('/modules')}
          className="text-sm font-medium"
          style={{ color: 'rgba(255,220,160,0.9)' }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">📐</span>
          <span className="font-bold text-sm" style={{ color: '#FFD580' }}>
            3D Geometry Playground
          </span>
        </div>
        <button
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,107,0,0.20)', color: '#FF8C3A', border: '1px solid rgba(255,107,0,0.35)' }}
          onClick={() => window.open('/markers/geometry-marker.html', '_blank')}
        >
          ? Help
        </button>
      </div>

      {/* ── TRANSFORM MODE BAR ──────────────────────────────────────────── */}
      {selectedShape && activeMode === 'idle' && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-2xl"
          style={{
            top: 64, pointerEvents: 'auto',
            background: 'rgba(0,0,0,0.72)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,140,60,0.30)',
          }}
        >
          {TRANSFORM_MODES.map(tm => (
            <button
              key={tm.id}
              onClick={() => setTransformMode(tm.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: transformMode === tm.id ? '#FF6B00' : 'transparent',
                color: transformMode === tm.id ? '#fff' : 'rgba(255,200,130,0.75)',
              }}
            >
              <span style={{ fontSize: 15 }}>{tm.icon}</span>
              {tm.label}
            </button>
          ))}
          <span
            className="ml-2 pl-2 text-xs"
            style={{ color: 'rgba(255,200,100,0.40)', borderLeft: '1px solid rgba(255,200,100,0.2)' }}
          >
            {transformMode === 'translate' && 'drag arrows'}
            {transformMode === 'rotate'    && 'drag arcs'}
            {transformMode === 'scale'     && 'pinch or drag'}
          </span>
        </div>
      )}

      {/* ── COMPARE PANEL ───────────────────────────────────────────────── */}
      {activeMode === 'compare' && shapes.length >= 2 && (
        <div
          className="absolute left-4 top-20 z-20 rounded-2xl overflow-hidden"
          style={{ width: 260, pointerEvents: 'auto', background: 'rgba(8,3,0,0.88)', backdropFilter: 'blur(16px)', border: '1px solid rgba(51,153,255,0.35)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(51,153,255,0.20)' }}>
            <span className="font-bold text-sm" style={{ color: '#88BBFF' }}>⚖️ Volume Comparison</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {shapes.slice(0, 2).map((s, i) => {
              const m    = calculateMeasurements(s.type, s.params);
              const maxV = Math.max(...shapes.map(x => calculateMeasurements(x.type, x.params).volume));
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span style={{ color: 'rgba(180,210,255,0.8)' }}>{s.type.charAt(0).toUpperCase() + s.type.slice(1)}</span>
                    <span style={{ color: '#88BBFF' }}>{m.volume} cm³</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${(m.volume / maxV) * 100 * waterLevel}%`, background: i === 0 ? '#3399FF' : '#FF6B00', transition: 'width 0.1s' }} />
                  </div>
                </div>
              );
            })}
            {shapes.length === 2 && (() => {
              const m1 = calculateMeasurements(shapes[0].type, shapes[0].params);
              const m2 = calculateMeasurements(shapes[1].type, shapes[1].params);
              return <p className="text-xs text-center mt-2" style={{ color: 'rgba(255,215,80,0.7)' }}>{shapes[0].type} = {(m1.volume / m2.volume).toFixed(2)}× {shapes[1].type}</p>;
            })()}
          </div>
        </div>
      )}

      {/* ── SLICING / UNFOLDING / FORMULA ───────────────────────────────── */}
      <SlicingTool  selectedShape={selectedShape} active={activeMode === 'slice'}  onClose={() => setActiveMode('idle')} />
      <NetUnfolder  selectedShape={selectedShape} active={activeMode === 'unfold'} onClose={() => setActiveMode('idle')} />
      {selectedShape && showFormula && measurements && (
        <FormulaDisplay shapeType={selectedShape.type} steps={measurements.steps} surfaceArea={measurements.surfaceArea} volume={measurements.volume} visible />
      )}

      {/* ── SHAPE TOOLBAR ───────────────────────────────────────────────── */}
      <ShapeToolbar
        onShapeSelect={spawnShape}
        activeShapeType={null}
        shapeCount={shapes.length}
        activeMode={activeMode}
        onModeChange={handleModeChange}
      />

      {/* ── PROPERTIES PANEL ────────────────────────────────────────────── */}
      <PropertiesPanel
        shape={selectedShape}
        onParamsChange={updateParams}
        onDelete={deleteSelected}
        onShowFormula={setShowFormula}
        showFormula={showFormula}
        expanded={showProperties}
        onToggle={() => setShowProperties(v => !v)}
      />

      {/* ── HINTS ───────────────────────────────────────────────────────── */}
      {shapes.length > 0 && !selectedShape && (
        <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ top: '42%' }}>
          <div className="text-center px-5 py-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,140,60,0.22)' }}>
            <p className="text-sm font-semibold" style={{ color: '#FFD580' }}>Tap a shape to select it</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,200,120,0.5)' }}>Then drag gizmo · pinch to scale</p>
          </div>
        </div>
      )}
      {shapes.length === 0 && (
        <div className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none" style={{ top: '45%' }}>
          <div className="text-center px-6 py-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,140,60,0.25)' }}>
            <p className="text-2xl mb-1">👇</p>
            <p className="text-sm font-semibold" style={{ color: '#FFD580' }}>Select a shape below to get started</p>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function defaultParams(type) {
  switch (type) {
    case 'cube':       return { width: 8 };
    case 'cuboid':     return { width: 10, height: 7, depth: 6 };
    case 'sphere':     return { radius: 5 };
    case 'hemisphere': return { radius: 5 };
    case 'cone':       return { radius: 5, height: 10 };
    case 'cylinder':   return { radiusTop: 5, radiusBottom: 5, height: 10 };
    case 'pyramid':    return { radius: 5, height: 10 };
    case 'prism':      return { radius: 5, height: 10 };
    case 'frustum':    return { radiusTop: 3, radiusBottom: 6, height: 10 };
    case 'torus':      return { outerRadius: 6, tube: 2 };
    default:           return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function GeometryPlayground() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <ARScene>
        <PlaygroundInner />
      </ARScene>
    </div>
  );
}
