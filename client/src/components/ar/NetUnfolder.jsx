


import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useARContext } from './ARScene';

function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function lerp(a, b, t) { return a + (b - a) * t; }

/**
 * Build the net geometry for a given shape.
 * Returns an array of { mesh, foldedPos, foldedRot, unfoldedPos, unfoldedRot, label }
 */
function buildNetParts(type, params) {
  const p = params;
  const mat = (color) => new THREE.MeshPhongMaterial({
    color, transparent: true, opacity: 0.85, side: THREE.DoubleSide,
    emissive: new THREE.Color(color).multiplyScalar(0.15),
  });

  switch (type) {
    case 'cube':
    case 'cuboid': {
      const W = p.width ?? 10, H = p.height ?? p.width ?? 10, D = p.depth ?? p.width ?? 10;
      const FACE_COLORS = [0xFF6B00, 0xCC5500, 0xFF8C3A, 0xD4A017, 0xFF6B00, 0xAA4400];
      // 6 faces: front, back, left, right, top, bottom
      const faces = [
        { geo: [W, H], label: 'Front', folded: [0, 0, D/2], unfold: [0, 0, -(H + D/2 + 1)],     foldedRot: [0,0,0],           unfoldedRot: [0,0,0] },
        { geo: [W, H], label: 'Back',  folded: [0, 0, -D/2], unfold: [0, 0, H + D/2 + 1],        foldedRot: [0, Math.PI, 0],   unfoldedRot: [0,0,0] },
        { geo: [D, H], label: 'Left',  folded: [-W/2, 0, 0], unfold: [-(W/2 + D/2 + 1), 0, 0],  foldedRot: [0, Math.PI/2, 0], unfoldedRot: [0,0,0] },
        { geo: [D, H], label: 'Right', folded: [W/2, 0, 0],  unfold: [(W/2 + D/2 + 1), 0, 0],   foldedRot: [0, -Math.PI/2, 0],unfoldedRot: [0,0,0] },
        { geo: [W, D], label: 'Top',   folded: [0, H/2, 0],  unfold: [0, -(D/2 + H/2 + 1), 0],  foldedRot: [Math.PI/2, 0, 0], unfoldedRot: [0,0,0] },
        { geo: [W, D], label: 'Bot',   folded: [0, -H/2, 0], unfold: [0, (D/2 + H/2 + 1), 0],   foldedRot: [-Math.PI/2, 0, 0],unfoldedRot: [0,0,0] },
      ];
      return faces.map((f, i) => {
        const geo = new THREE.PlaneGeometry(...f.geo);
        const mesh = new THREE.Mesh(geo, mat(FACE_COLORS[i]));
        mesh.position.set(...f.folded);
        mesh.rotation.set(...f.foldedRot);
        return {
          mesh,
          foldedPos: new THREE.Vector3(...f.folded),
          foldedRot: new THREE.Euler(...f.foldedRot),
          unfoldedPos: new THREE.Vector3(...f.unfold),
          unfoldedRot: new THREE.Euler(...f.unfoldedRot),
          label: f.label,
          dims: `${f.geo[0].toFixed(1)}×${f.geo[1].toFixed(1)}`,
        };
      });
    }

    case 'cylinder': {
      const r = p.radiusTop ?? p.radius ?? 5, h = p.height ?? 10;
      const circ = 2 * Math.PI * r;
      const parts = [
        {
          geo: new THREE.CircleGeometry(r, 48),
          label: 'Top', dims: `r=${r}`,
          foldedPos: new THREE.Vector3(0, h/2, 0),
          foldedRot: new THREE.Euler(-Math.PI/2, 0, 0),
          unfoldedPos: new THREE.Vector3(0, r + h/2 + 1, 0),
          unfoldedRot: new THREE.Euler(0, 0, 0),
          color: 0xFF8C3A,
        },
        {
          geo: new THREE.PlaneGeometry(circ, h),
          label: 'Lateral', dims: `${circ.toFixed(1)}×${h}`,
          foldedPos: new THREE.Vector3(0, 0, r),
          foldedRot: new THREE.Euler(0, 0, 0),
          unfoldedPos: new THREE.Vector3(0, 0, 0),
          unfoldedRot: new THREE.Euler(0, 0, 0),
          color: 0xFF6B00,
        },
        {
          geo: new THREE.CircleGeometry(r, 48),
          label: 'Bottom', dims: `r=${r}`,
          foldedPos: new THREE.Vector3(0, -h/2, 0),
          foldedRot: new THREE.Euler(Math.PI/2, 0, 0),
          unfoldedPos: new THREE.Vector3(0, -(r + h/2 + 1), 0),
          unfoldedRot: new THREE.Euler(0, 0, 0),
          color: 0xCC5500,
        },
      ];
      return parts.map(f => {
        const mesh = new THREE.Mesh(f.geo, mat(f.color));
        mesh.position.copy(f.foldedPos);
        mesh.rotation.copy(f.foldedRot);
        return { mesh, ...f };
      });
    }

    case 'cone': {
      const r = p.radius ?? 5, h = p.height ?? 10;
      const slant = Math.sqrt(r*r + h*h);
      const sectorR = slant;
      const sectorAngle = (r / slant) * 2 * Math.PI;
      // Sector (lateral)
      const sectorPts = [new THREE.Vector2(0, 0)];
      for (let i = 0; i <= 48; i++) {
        const a = -sectorAngle/2 + (i / 48) * sectorAngle;
        sectorPts.push(new THREE.Vector2(Math.cos(a) * sectorR, Math.sin(a) * sectorR));
      }
      const sectorShape = new THREE.Shape(sectorPts);
      const sectorGeo = new THREE.ShapeGeometry(sectorShape);
      const circGeo = new THREE.CircleGeometry(r, 48);

      return [
        {
          mesh: new THREE.Mesh(sectorGeo, mat(0xFF6B00)),
          foldedPos: new THREE.Vector3(0, h/2 - slant/2, 0),
          foldedRot: new THREE.Euler(-Math.PI/2, 0, 0),
          unfoldedPos: new THREE.Vector3(sectorR/2 + 1, 0, 0),
          unfoldedRot: new THREE.Euler(0, 0, 0),
          label: 'Lateral', dims: `l=${slant.toFixed(1)}`,
        },
        {
          mesh: new THREE.Mesh(circGeo, mat(0xFF8C3A)),
          foldedPos: new THREE.Vector3(0, -h/2, 0),
          foldedRot: new THREE.Euler(-Math.PI/2, 0, 0),
          unfoldedPos: new THREE.Vector3(-(r + 1), 0, 0),
          unfoldedRot: new THREE.Euler(0, 0, 0),
          label: 'Base', dims: `r=${r}`,
        },
      ].map(f => {
        f.mesh.position.copy(f.foldedPos);
        f.mesh.rotation.copy(f.foldedRot);
        return f;
      });
    }

    default: {
      // Generic: show a placeholder rectangle
      const s = p.width ?? p.radius ?? 10;
      const geo = new THREE.PlaneGeometry(s, s);
      const mesh = new THREE.Mesh(geo, mat(0xFF6B00));
      return [{
        mesh,
        foldedPos: new THREE.Vector3(0, 0, 0),
        foldedRot: new THREE.Euler(0, 0, 0),
        unfoldedPos: new THREE.Vector3(0, 0, 0),
        unfoldedRot: new THREE.Euler(0, 0, 0),
        label: 'Face', dims: `${s}×${s}`,
      }];
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NetUnfolder({ selectedShape, active, onClose }) {
  const { refs } = useARContext();
  const netGroupRef = useRef(null);
  const partsRef = useRef([]);

  const [isUnfolded, setIsUnfolded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [netVisible, setNetVisible] = useState(false);

  // ── Build net ──────────────────────────────────────────────────────────────
  const buildNet = useCallback(() => {
    if (!selectedShape) return;
    const { scene, markerRoot } = refs.current;
    const root = markerRoot ?? scene;
    if (!root) return;

    // Remove old
    if (netGroupRef.current) {
      root.remove(netGroupRef.current);
      netGroupRef.current.traverse(c => {
        c.geometry?.dispose();
        c.material?.dispose();
      });
    }

    const parts = buildNetParts(selectedShape.type, selectedShape.params);
    partsRef.current = parts;

    const group = new THREE.Group();
    // Offset the net beside the 3D shape
    group.position.copy(selectedShape.mesh.position);
    group.position.x += (selectedShape.params.width ?? selectedShape.params.radius ?? 10) + 5;

    parts.forEach(({ mesh }) => group.add(mesh));
    root.add(group);
    netGroupRef.current = group;
    setNetVisible(true);
    setIsUnfolded(false);
  }, [selectedShape, refs]);

  // ── Animate ────────────────────────────────────────────────────────────────
  const animate = useCallback((toUnfolded) => {
    if (animating || partsRef.current.length === 0) return;
    setAnimating(true);
    const parts = partsRef.current;
    const duration = 900;
    const t0 = performance.now();

    function tick() {
      const t = Math.min((performance.now() - t0) / duration, 1);
      const e = easeInOut(t);

      parts.forEach(part => {
        const from = toUnfolded ? part.foldedPos : part.unfoldedPos;
        const to   = toUnfolded ? part.unfoldedPos : part.foldedPos;
        const fromR = toUnfolded ? part.foldedRot : part.unfoldedRot;
        const toR   = toUnfolded ? part.unfoldedRot : part.foldedRot;

        part.mesh.position.lerpVectors(from, to, e);
        part.mesh.rotation.x = lerp(fromR.x, toR.x, e);
        part.mesh.rotation.y = lerp(fromR.y, toR.y, e);
        part.mesh.rotation.z = lerp(fromR.z, toR.z, e);
      });

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setAnimating(false);
        setIsUnfolded(toUnfolded);
      }
    }
    tick();
  }, [animating]);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (active && selectedShape) {
      buildNet();
    }
    return () => {
      const { scene, markerRoot } = refs.current;
      const root = markerRoot ?? scene;
      if (netGroupRef.current) {
        root?.remove(netGroupRef.current);
        netGroupRef.current.traverse(c => {
          c.geometry?.dispose();
          c.material?.dispose();
        });
        netGroupRef.current = null;
      }
      setNetVisible(false);
      setIsUnfolded(false);
    };
  }, [active, selectedShape, buildNet, refs]);

  if (!active || !selectedShape) return null;

  const measurements = partsRef.current.map(p => p.label + ' ' + p.dims).join(', ');

  return (
    <div
      className="absolute right-4 top-20 z-20 rounded-2xl overflow-hidden"
      style={{
        width: 280,
        background: 'rgba(8,3,0,0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(34,197,94,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(34,197,94,0.20)' }}
      >
        <span className="font-bold text-sm" style={{ color: '#86efac' }}>📄 Net Unfolder</span>
        <button onClick={onClose} style={{ color: 'rgba(255,200,150,0.6)', fontSize: 18 }}>✕</button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Shape info */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}
        >
          <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(134,239,172,0.7)' }}>
            {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} Net
          </p>
          <p className="text-xs" style={{ color: 'rgba(180,255,200,0.7)', lineHeight: 1.6 }}>
            {measurements}
          </p>
        </div>

        {/* Net label */}
        {partsRef.current.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {partsRef.current.map((p, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `hsl(${(i * 40) % 360}, 70%, 30%)`,
                  color: `hsl(${(i * 40) % 360}, 90%, 85%)`,
                  border: `1px solid hsl(${(i * 40) % 360}, 70%, 50%)`,
                }}
              >
                {p.label}: {p.dims}
              </span>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => animate(true)}
            disabled={isUnfolded || animating || !netVisible}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: !isUnfolded && !animating ? 'rgba(34,197,94,0.60)' : 'rgba(34,197,94,0.15)',
              color: !isUnfolded && !animating ? '#fff' : 'rgba(134,239,172,0.5)',
              border: '1px solid rgba(34,197,94,0.40)',
            }}
          >
            📄 Unfold
          </button>
          <button
            onClick={() => animate(false)}
            disabled={!isUnfolded || animating}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: isUnfolded && !animating ? 'rgba(255,107,0,0.60)' : 'rgba(255,107,0,0.15)',
              color: isUnfolded && !animating ? '#fff' : 'rgba(255,150,80,0.5)',
              border: '1px solid rgba(255,107,0,0.40)',
            }}
          >
            📦 Fold Back
          </button>
        </div>

        {animating && (
          <p className="text-center text-xs" style={{ color: 'rgba(134,239,172,0.6)' }}>
            Animating…
          </p>
        )}

        {/* SA breakdown hint */}
        <div
          className="rounded-xl p-2 text-center"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid rgba(212,160,23,0.25)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,215,80,0.8)' }}>
            Each face in the net contributes to the total Surface Area
          </p>
        </div>
      </div>
    </div>
  );
}
