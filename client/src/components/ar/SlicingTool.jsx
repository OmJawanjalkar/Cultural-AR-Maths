import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useARContext } from './ARScene';
import { getCrossSection } from '../../utils/threeHelpers';

const CROSS_SECTION_NAMES = {
  circle:    'Circle',
  ellipse:   'Ellipse',
  square:    'Square',
  rectangle: 'Rectangle',
  triangle:  'Triangle',
  hexagon:   'Hexagon',
  unknown:   'Unknown',
};

const CHALLENGE_OPTIONS = ['Circle', 'Square', 'Triangle', 'Ellipse', 'Rectangle', 'Hexagon'];

export default function SlicingTool({ selectedShape, active, onClose }) {
  const { refs, addRenderCallback } = useARContext();
  const planeRef = useRef(null);
  const clippingRef = useRef(null);
  const crossRef = useRef(null);

  const [sliceY, setSliceY] = useState(0);       // -0.5 .. +0.5
  const [sliceAngle, setSliceAngle] = useState(0); // degrees 0..90
  const [challengeMode, setChallengeMode] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const crossSection = selectedShape
    ? getCrossSection(selectedShape.type, selectedShape.params, sliceY)
    : null;

  // ── Build / update slice plane ─────────────────────────────────────────────
  const buildSlicePlane = useCallback(() => {
    const { scene, markerRoot } = refs.current;
    if (!scene || !selectedShape) return;

    const root = markerRoot ?? scene;

    // Remove old
    if (planeRef.current) {
      root.remove(planeRef.current);
      planeRef.current.geometry.dispose();
      planeRef.current.material.dispose();
    }
    if (crossRef.current) {
      root.remove(crossRef.current);
      crossRef.current.geometry.dispose();
      crossRef.current.material.dispose();
    }

    const p = selectedShape.params;
    const halfH = (p.height ?? p.width ?? p.radius ?? 10) / 2;
    const planeSize = Math.max(p.width ?? 0, p.radius ?? 0, p.outerRadius ?? 0, p.height ?? 0) * 1.6 + 4;
    const yPos = sliceY * halfH * 2;
    const angleRad = (sliceAngle * Math.PI) / 180;

    // Slice plane visual
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x4488FF,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.set(
      selectedShape.mesh.position.x,
      selectedShape.mesh.position.y + yPos,
      selectedShape.mesh.position.z,
    );
    plane.rotation.x = Math.PI / 2 + angleRad;
    plane.userData.isSlicePlane = true;
    root.add(plane);
    planeRef.current = plane;

    // Cross-section highlight circle/rect
    if (crossSection) {
      let crossGeo;
      if (crossSection.shape === 'circle') {
        const r = crossSection.radius;
        if (r > 0.01) {
          crossGeo = new THREE.CircleGeometry(r, 48);
        }
      } else if (crossSection.shape === 'square') {
        const a = crossSection.side;
        crossGeo = new THREE.PlaneGeometry(a, a);
      } else if (crossSection.shape === 'rectangle') {
        crossGeo = new THREE.PlaneGeometry(crossSection.width, crossSection.depth);
      }

      if (crossGeo) {
        const crossMat = new THREE.MeshBasicMaterial({
          color: 0xFF4400,
          transparent: true,
          opacity: 0.55,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const cross = new THREE.Mesh(crossGeo, crossMat);
        cross.position.copy(plane.position);
        cross.rotation.x = Math.PI / 2 + angleRad;
        cross.position.y += 0.05; // tiny offset to avoid z-fight
        cross.userData.isCrossSection = true;
        root.add(cross);
        crossRef.current = cross;
      }
    }

    // Apply renderer clipping plane
    const renderer = refs.current.renderer;
    if (renderer) {
      renderer.localClippingEnabled = true;
      const normal = new THREE.Vector3(0, 1, 0);
      normal.applyEuler(new THREE.Euler(angleRad, 0, 0));
      clippingRef.current = new THREE.Plane(normal, -(selectedShape.mesh.position.y + yPos));
      // Apply clipping to the shape's material only
      if (selectedShape.mesh?.material) {
        selectedShape.mesh.material.clippingPlanes = [clippingRef.current];
        selectedShape.mesh.material.clipShadows = true;
      }
    }
  }, [refs, selectedShape, sliceY, sliceAngle, crossSection]);

  useEffect(() => {
    if (!active || !selectedShape) return;
    buildSlicePlane();

    return () => {
      // Cleanup on deactivate
      const { scene, markerRoot, renderer } = refs.current;
      const root = markerRoot ?? scene;
      if (planeRef.current) {
        root?.remove(planeRef.current);
        planeRef.current.geometry.dispose();
        planeRef.current.material.dispose();
        planeRef.current = null;
      }
      if (crossRef.current) {
        root?.remove(crossRef.current);
        crossRef.current.geometry.dispose();
        crossRef.current.material.dispose();
        crossRef.current = null;
      }
      if (selectedShape?.mesh?.material) {
        selectedShape.mesh.material.clippingPlanes = [];
      }
      if (renderer) renderer.localClippingEnabled = false;
    };
  }, [active, buildSlicePlane, refs, selectedShape]);

  // Rebuild on param changes
  useEffect(() => {
    if (active) buildSlicePlane();
  }, [sliceY, sliceAngle, active, buildSlicePlane]);

  if (!active || !selectedShape) return null;

  const correctAnswer = crossSection ? CROSS_SECTION_NAMES[crossSection.shape] : '?';

  return (
    <div
      className="absolute right-4 top-20 z-20 rounded-2xl overflow-hidden"
      style={{
        width: 280,
        background: 'rgba(8,3,0,0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(68,136,255,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(68,136,255,0.20)' }}
      >
        <span className="font-bold text-sm" style={{ color: '#88BBFF' }}>✂️ Slice Tool</span>
        <button onClick={onClose} style={{ color: 'rgba(255,200,150,0.6)', fontSize: 18 }}>✕</button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Slice position */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs" style={{ color: 'rgba(180,210,255,0.8)' }}>Slice Position</label>
            <span className="text-xs font-bold" style={{ color: '#88BBFF' }}>
              {sliceY > 0 ? '+' : ''}{(sliceY * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range" min="-0.49" max="0.49" step="0.01"
            value={sliceY}
            onChange={e => setSliceY(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{ accentColor: '#4488FF' }}
          />
        </div>

        {/* Slice angle */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-xs" style={{ color: 'rgba(180,210,255,0.8)' }}>Angle</label>
            <span className="text-xs font-bold" style={{ color: '#88BBFF' }}>{sliceAngle}°</span>
          </div>
          <div className="flex gap-2">
            {[0, 30, 45, 60, 90].map(a => (
              <button
                key={a}
                onClick={() => setSliceAngle(a)}
                className="flex-1 py-1 rounded-lg text-xs font-semibold transition-colors"
                style={{
                  background: sliceAngle === a ? 'rgba(68,136,255,0.60)' : 'rgba(68,136,255,0.12)',
                  color: sliceAngle === a ? '#fff' : '#88BBFF',
                  border: `1px solid ${sliceAngle === a ? '#4488FF' : 'rgba(68,136,255,0.25)'}`,
                }}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>

        {/* Cross-section result */}
        {crossSection && !challengeMode && (
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(68,136,255,0.12)', border: '1px solid rgba(68,136,255,0.25)' }}
          >
            <p className="text-xs mb-1" style={{ color: 'rgba(180,210,255,0.7)' }}>Cross-Section Shape</p>
            <p className="text-xl font-bold" style={{ color: '#88BBFF' }}>
              {correctAnswer}
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(180,210,255,0.6)' }}>
              Area ≈ {crossSection.area} cm²
            </p>
          </div>
        )}

        {/* Challenge mode */}
        {!challengeMode ? (
          <button
            onClick={() => { setChallengeMode(true); setChosen(null); setRevealed(false); }}
            className="w-full py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(212,160,23,0.20)', color: '#D4A017', border: '1px solid rgba(212,160,23,0.35)' }}
          >
            🎯 Challenge Mode
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-center font-semibold" style={{ color: '#D4A017' }}>
              What shape is the cross-section?
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {CHALLENGE_OPTIONS.map(opt => {
                const isCorrect = opt === correctAnswer;
                const isChosen = opt === chosen;
                let bg = 'rgba(60,25,5,0.55)';
                let border = 'rgba(255,140,60,0.20)';
                let color = 'rgba(255,200,140,0.85)';
                if (revealed && isChosen && isCorrect) {
                  bg = 'rgba(34,197,94,0.25)'; border = '#22c55e'; color = '#86efac';
                } else if (revealed && isChosen && !isCorrect) {
                  bg = 'rgba(239,68,68,0.25)'; border = '#ef4444'; color = '#fca5a5';
                } else if (revealed && isCorrect) {
                  bg = 'rgba(34,197,94,0.20)'; border = '#22c55e'; color = '#86efac';
                } else if (isChosen) {
                  bg = 'rgba(212,160,23,0.30)'; border = '#D4A017'; color = '#FFD580';
                }
                return (
                  <button
                    key={opt}
                    onClick={() => !revealed && setChosen(opt)}
                    disabled={revealed}
                    className="py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: bg, border: `1px solid ${border}`, color }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => chosen && setRevealed(true)}
                disabled={!chosen || revealed}
                className="flex-1 py-1.5 rounded-xl text-sm font-semibold"
                style={{
                  background: chosen && !revealed ? '#FF6B00' : 'rgba(255,107,0,0.20)',
                  color: chosen && !revealed ? '#fff' : 'rgba(255,150,80,0.5)',
                }}
              >
                Reveal
              </button>
              <button
                onClick={() => { setChallengeMode(false); setChosen(null); setRevealed(false); }}
                className="flex-1 py-1.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,200,140,0.7)' }}
              >
                Exit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
