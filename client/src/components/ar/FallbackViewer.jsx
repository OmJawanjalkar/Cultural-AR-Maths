import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * FallbackViewer – self-contained Three.js canvas with OrbitControls.
 * Used when ARScene is unavailable (e.g. embedded in a non-AR context).
 *
 * Exposes imperative handle:
 *   ref.scene   – THREE.Scene
 *   ref.camera  – THREE.Camera
 *   ref.renderer – THREE.WebGLRenderer
 *   ref.addObject(obj) / ref.removeObject(obj)
 */
const FallbackViewer = forwardRef(function FallbackViewer(
  { children, className = '', style = {} },
  ref
) {
  const canvasRef = useRef(null);
  const internals = useRef({
    scene: null, camera: null, renderer: null,
    controls: null, animId: null,
  });

  useImperativeHandle(ref, () => ({
    get scene()    { return internals.current.scene; },
    get camera()   { return internals.current.camera; },
    get renderer() { return internals.current.renderer; },
    addObject(obj) { internals.current.scene?.add(obj); },
    removeObject(obj) { obj?.parent?.remove(obj); },
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.clientWidth || 800;
    const H = canvas.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0e04);
    scene.fog = new THREE.FogExp2(0x1a0e04, 0.008);

    // Camera
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1000);
    camera.position.set(0, 25, 55);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Lights
    scene.add(new THREE.AmbientLight(0xfff5e0, 0.6));
    const sun = new THREE.DirectionalLight(0xFFE0A0, 1.3);
    sun.position.set(30, 50, 30);
    sun.castShadow = true;
    scene.add(sun);
    const fill = new THREE.PointLight(0xFF6B00, 0.30, 80);
    fill.position.set(-25, 20, 15);
    scene.add(fill);

    // Ground grid
    const grid = new THREE.GridHelper(100, 20, 0x442200, 0x221100);
    grid.position.y = -12;
    scene.add(grid);

    Object.assign(internals.current, { scene, camera, renderer });

    // OrbitControls
    let controls;
    import('three/examples/jsm/controls/OrbitControls.js').then(({ OrbitControls }) => {
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.maxDistance = 200;
      controls.minDistance = 8;
      internals.current.controls = controls;
    });

    // Resize
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize);

    // Loop
    function tick() {
      internals.current.animId = requestAnimationFrame(tick);
      internals.current.controls?.update();
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(internals.current.animId);
      window.removeEventListener('resize', onResize);
      internals.current.controls?.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={style}>
      {/* Banner */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full text-sm font-medium pointer-events-none"
        style={{
          background: 'rgba(255,107,0,0.18)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,107,0,0.40)',
          color: '#FFD580',
          whiteSpace: 'nowrap',
        }}
      >
        AR not available — viewing in 3D mode
      </div>

      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Orbit hint */}
      <p
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs pointer-events-none"
        style={{ color: 'rgba(255,200,120,0.6)' }}
      >
        Drag to rotate · Scroll to zoom · Right-drag to pan
      </p>

      {children}
    </div>
  );
});

export default FallbackViewer;
