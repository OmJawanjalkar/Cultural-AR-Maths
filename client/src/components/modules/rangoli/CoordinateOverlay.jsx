/**
 * CoordinateOverlay.jsx
 * Toggleable X-Y coordinate grid overlaid on the rangoli canvas.
 * Adds Three.js grid lines + origin axes to the shared scene.
 *
 * Props:
 *   show          bool
 *   onToggle      () => void
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useARContext } from '../../ar/ARScene';

const GRID_SIZE  = 12;
const SPACING    = 0.35;
const CANVAS_LEN = GRID_SIZE * SPACING;
const Y          = 0.015; // slightly above the canvas plane

function makeLabel(text, color = '#00FFAA') {
  const W = 96, H = 36;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.0)';
  ctx.clearRect(0, 0, W, H);
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);
  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.18, 0.067, 1);
  return sprite;
}

export default function CoordinateOverlay({ show, onToggle }) {
  const { refs } = useARContext();
  const groupRef = useRef(null);

  useEffect(() => {
    const { scene } = refs.current;
    if (!scene) return;

    // Build the group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const half = CANVAS_LEN / 2;

    // ── Grid lines ───────────────────────────────────────────────────────────
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x004444,
      transparent: true,
      opacity: 0.45,
    });

    for (let i = -GRID_SIZE / 2; i <= GRID_SIZE / 2; i++) {
      const x = i * SPACING;
      // Vertical lines (along Z)
      const vGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, Y, -half),
        new THREE.Vector3(x, Y,  half),
      ]);
      group.add(new THREE.Line(vGeo, gridMat.clone()));

      // Horizontal lines (along X)
      const hGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-half, Y, x),
        new THREE.Vector3( half, Y, x),
      ]);
      group.add(new THREE.Line(hGeo, gridMat.clone()));
    }

    // ── Primary axes (X and Y = Z in grid space) ─────────────────────────
    const xAxisMat = new THREE.LineBasicMaterial({ color: 0xFF3333, linewidth: 2 });
    const zAxisMat = new THREE.LineBasicMaterial({ color: 0x33FF33, linewidth: 2 });

    const xGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-half - 0.1, Y, 0),
      new THREE.Vector3( half + 0.1, Y, 0),
    ]);
    group.add(new THREE.Line(xGeo, xAxisMat));

    const zGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, Y, -half - 0.1),
      new THREE.Vector3(0, Y,  half + 0.1),
    ]);
    group.add(new THREE.Line(zGeo, zAxisMat));

    // ── Axis labels ───────────────────────────────────────────────────────
    const xLabel = makeLabel('X →', '#FF6666');
    xLabel.position.set(half + 0.18, Y + 0.05, 0);
    group.add(xLabel);

    const yLabel = makeLabel('Y ↑', '#66FF66');
    yLabel.position.set(0, Y + 0.05, -(half + 0.18));
    group.add(yLabel);

    const origin = makeLabel('(0,0)', '#FFFFFF');
    origin.position.set(0.06, Y + 0.05, 0.06);
    group.add(origin);

    // ── Coordinate labels at each integer intersection ─────────────────────
    for (let col = -GRID_SIZE / 2; col <= GRID_SIZE / 2; col += 2) {
      for (let row = -GRID_SIZE / 2; row <= GRID_SIZE / 2; row += 2) {
        if (col === 0 && row === 0) continue;
        const lbl = makeLabel(`${col},${row}`, 'rgba(0,255,200,0.7)');
        lbl.position.set(col * SPACING, Y + 0.04, row * SPACING);
        lbl.scale.set(0.13, 0.05, 1);
        group.add(lbl);
      }
    }

    group.visible = show;

    return () => {
      scene.remove(group);
      group.traverse(child => {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(m => { m.map?.dispose(); m.dispose(); });
        } else {
          child.material?.map?.dispose();
          child.material?.dispose();
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle visibility
  useEffect(() => {
    if (groupRef.current) groupRef.current.visible = show;
  }, [show]);

  return (
    <button
      onClick={onToggle}
      title="Toggle Coordinate Grid"
      style={{
        position: 'absolute',
        bottom: 68,
        right: 10,
        zIndex: 28,
        background: show ? 'rgba(0,255,170,0.18)' : 'rgba(0,0,0,0.45)',
        border: `1px solid ${show ? '#00FFAA' : 'rgba(255,255,255,0.2)'}`,
        borderRadius: 8,
        color: show ? '#00FFAA' : 'rgba(255,255,255,0.65)',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 600,
        backdropFilter: 'blur(8px)',
      }}
    >
      𝑥𝑦 Grid
    </button>
  );
}
