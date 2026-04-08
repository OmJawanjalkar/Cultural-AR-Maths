/**
 * RangoliCanvas.jsx
 * Three.js 12×12 dot grid canvas for drawing rangoli / kolam patterns.
 * All Three.js objects are added to the shared ARScene and cleaned up on unmount.
 *
 * Props:
 *   symmetryMode   'none' | 'reflect' | 'rotate' | 'translate'
 *   axisType       'vertical' | 'horizontal' | 'diagonal-/' | 'diagonal-\\'
 *   rotationOrder  2 | 3 | 4 | 6 | 8
 *   isKolam        bool — white-on-dark (kolam) vs colourful (rangoli)
 *   drawColor      hex string for current colour
 *   showCoords     bool — show coordinate labels
 *   loadedPaths    array of pre-loaded path arrays to render
 *   onDotsUpdated  (paths) => void — callback when user adds a stroke
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useARContext } from '../../ar/ARScene';

// Canvas sits at y≈0 — camera looks down at a gentle angle from here
const CAM_POS    = new THREE.Vector3(0, 4.5, 4.5);
const CAM_TARGET = new THREE.Vector3(0, 0,   0);

// ─── Grid constants ───────────────────────────────────────────────────────────
const GRID_COLS   = 12;
const GRID_ROWS   = 12;
const SPACING     = 0.35;          // world units between dots
const CANVAS_SIZE = GRID_COLS * SPACING;
const ORIGIN_X    = -CANVAS_SIZE / 2;
const ORIGIN_Z    = -CANVAS_SIZE / 2;
const CANVAS_Y    = 0.01;          // just above the AR ground plane

// Convert grid coords [col, row] → Three.js Vector3
function dotToVec3(col, row) {
  return new THREE.Vector3(
    ORIGIN_X + col * SPACING,
    CANVAS_Y + 0.001,
    ORIGIN_Z + row * SPACING,
  );
}

// ─── Material helpers ─────────────────────────────────────────────────────────
function dotMat(lit = false) {
  return new THREE.MeshBasicMaterial({
    color: lit ? 0xFFD700 : 0x888888,
    transparent: true,
    opacity: lit ? 1.0 : 0.55,
  });
}

function lineMat(color = '#FFFFFF', opacity = 1.0) {
  return new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: opacity < 1,
    opacity,
    linewidth: 2,
  });
}

function axisMat(color = 0xFF6B35) {
  return new THREE.LineDashedMaterial({
    color,
    dashSize: 0.1,
    gapSize: 0.05,
    linewidth: 2,
  });
}

// ─── Symmetry helpers ─────────────────────────────────────────────────────────
function reflectPoint(p, axis) {
  // p is [col, row]; canvas centre is [6, 6]
  const cx = GRID_COLS / 2, cy = GRID_ROWS / 2;
  switch (axis) {
    case 'vertical':      return [2 * cx - p[0], p[1]];
    case 'horizontal':    return [p[0], 2 * cy - p[1]];
    case 'diagonal-/':   return [cy - p[1] + cx, cx - p[0] + cy];
    case 'diagonal-\\':  return [p[1], p[0]];
    default:              return p;
  }
}

function rotatePath(path, n, k) {
  // Rotate path around centre [6,6] by angle k * (360/n)
  const cx = GRID_COLS / 2, cy = GRID_ROWS / 2;
  const angle = (2 * Math.PI * k) / n;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return path.map(([col, row]) => {
    const dx = col - cx, dy = row - cy;
    return [
      cx + dx * cos - dy * sin,
      cy + dx * sin + dy * cos,
    ];
  });
}

// Build a CatmullRomCurve path (smooth Bezier-like) from [col,row] points
function buildCurve(path) {
  if (path.length < 2) return null;
  const pts = path.map(([col, row]) => dotToVec3(col, row));
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  const numPts = Math.max(path.length * 6, 16);
  const points = curve.getPoints(numPts);
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return geo;
}

// ─── Dispose helper ───────────────────────────────────────────────────────────
function disposeGroup(group) {
  if (!group) return;
  group.traverse(child => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach(m => m.dispose());
    } else {
      child.material?.dispose();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
export default function RangoliCanvas({
  symmetryMode  = 'none',
  axisType      = 'vertical',
  rotationOrder = 4,
  isKolam       = false,
  drawColor     = '#FFFFFF',
  showCoords    = false,
  loadedPaths   = null,
  onDotsUpdated = null,
}) {
  const { refs, mode } = useARContext();

  // Three.js object groups — stored in refs so they don't trigger re-renders
  const groupRef       = useRef(null);  // root group added to scene
  const dotMeshes      = useRef([]);    // flat 2D array of dot spheres
  const strokeGroup    = useRef(null);  // Lines for strokes
  const axisGroup      = useRef(null);  // Axis dashed lines
  const coordGroup     = useRef(null);  // Coord label sprites
  const selectedDot    = useRef(null);  // currently selected [col, row]
  const currentPath    = useRef([]);    // dots in the current in-progress stroke
  const allPaths       = useRef([]);    // committed strokes: array of {path, color}

  // ── Scene setup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const { scene } = refs.current;
    if (!scene) return;

    // Root group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // ── Canvas base plane ──────────────────────────────────────────────────────
    const planeGeo = new THREE.PlaneGeometry(CANVAS_SIZE + 0.1, CANVAS_SIZE + 0.1);
    const planeMat = new THREE.MeshBasicMaterial({
      color: isKolam ? 0x0A0A0A : 0x1A0A2A,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = CANVAS_Y - 0.002;
    group.add(plane);

    // ── 13×13 dot grid (0..12 inclusive) ──────────────────────────────────────
    const dots = [];
    for (let row = 0; row <= GRID_ROWS; row++) {
      const rowArr = [];
      for (let col = 0; col <= GRID_COLS; col++) {
        const geo = new THREE.SphereGeometry(0.025, 8, 8);
        const mat = dotMat(false);
        const mesh = new THREE.Mesh(geo, mat);
        const pos = dotToVec3(col, row);
        mesh.position.copy(pos);
        mesh.userData = { col, row, isDot: true };
        group.add(mesh);
        rowArr.push(mesh);
      }
      dots.push(rowArr);
    }
    dotMeshes.current = dots;

    // ── Stroke group ───────────────────────────────────────────────────────────
    const sg = new THREE.Group();
    strokeGroup.current = sg;
    group.add(sg);

    // ── Axis group ─────────────────────────────────────────────────────────────
    const ag = new THREE.Group();
    axisGroup.current = ag;
    group.add(ag);

    // ── Coord group ────────────────────────────────────────────────────────────
    const cg = new THREE.Group();
    coordGroup.current = cg;
    group.add(cg);

    // Position camera + OrbitControls target for the rangoli canvas.
    // OrbitControls is initialised asynchronously (after camera permission),
    // so we retry at several intervals — same pattern as TempleModel.jsx.
    function positionCamera() {
      const cam  = refs.current.camera;
      const ctrl = refs.current.controls;
      if (cam && mode !== 'ar') {
        cam.position.copy(CAM_POS);
        cam.lookAt(CAM_TARGET);
      }
      if (ctrl) {
        ctrl.target.copy(CAM_TARGET);
        ctrl.minDistance = 1;
        ctrl.maxDistance = 30;
        ctrl.update();
      }
    }
    const t1 = setTimeout(positionCamera,  80);
    const t2 = setTimeout(positionCamera, 600);
    const t3 = setTimeout(positionCamera, 1600);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      scene.remove(group);
      disposeGroup(group);
      dotMeshes.current = [];
      strokeGroup.current = null;
      axisGroup.current = null;
      coordGroup.current = null;
      currentPath.current = [];
      allPaths.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isKolam]);

  // ── Redraw axis line when symmetryMode/axis changes ───────────────────────
  useEffect(() => {
    const ag = axisGroup.current;
    if (!ag) return;

    // Clear previous
    while (ag.children.length) {
      const c = ag.children[0];
      c.geometry?.dispose();
      c.material?.dispose();
      ag.remove(c);
    }

    if (symmetryMode === 'none') return;

    const cx = 0, cy = CANVAS_Y + 0.003, cz = 0;
    const half = CANVAS_SIZE / 2 + 0.05;

    let points = [];
    if (symmetryMode === 'reflect') {
      switch (axisType) {
        case 'vertical':
          points = [new THREE.Vector3(cx, cy, -half), new THREE.Vector3(cx, cy, half)];
          break;
        case 'horizontal':
          points = [new THREE.Vector3(-half, cy, cz), new THREE.Vector3(half, cy, cz)];
          break;
        case 'diagonal-/':
          points = [new THREE.Vector3(-half, cy, half), new THREE.Vector3(half, cy, -half)];
          break;
        case 'diagonal-\\':
          points = [new THREE.Vector3(-half, cy, -half), new THREE.Vector3(half, cy, half)];
          break;
        default: break;
      }
      if (points.length) {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geo, axisMat(0xFF6B35));
        line.computeLineDistances();
        ag.add(line);
      }
    } else if (symmetryMode === 'rotate') {
      // Draw rotation centre marker
      const markerGeo = new THREE.RingGeometry(0.06, 0.10, 16);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0xFF6B35, side: THREE.DoubleSide });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.rotation.x = -Math.PI / 2;
      marker.position.set(0, CANVAS_Y + 0.003, 0);
      ag.add(marker);

      // Draw rotation sector lines
      for (let k = 0; k < rotationOrder; k++) {
        const angle = (2 * Math.PI * k) / rotationOrder;
        const end = new THREE.Vector3(
          Math.cos(angle) * half,
          CANVAS_Y + 0.003,
          Math.sin(angle) * half,
        );
        const geo2 = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, CANVAS_Y + 0.003, 0),
          end,
        ]);
        const line2 = new THREE.Line(geo2, axisMat(0xFFAA00));
        line2.computeLineDistances();
        ag.add(line2);
      }
    }
  }, [symmetryMode, axisType, rotationOrder]);

  // ── Redraw strokes from allPaths ──────────────────────────────────────────
  const redrawStrokes = useCallback(() => {
    const sg = strokeGroup.current;
    if (!sg) return;

    // Clear
    while (sg.children.length) {
      const c = sg.children[0];
      c.geometry?.dispose();
      c.material?.dispose();
      sg.remove(c);
    }

    const paths = loadedPaths
      ? loadedPaths.map(p => ({ path: p, color: drawColor }))
      : allPaths.current;

    paths.forEach(({ path, color }) => {
      // Original stroke
      const geo = buildCurve(path);
      if (geo) {
        const line = new THREE.Line(geo, lineMat(color));
        sg.add(line);
      }

      // Symmetry copies
      if (symmetryMode === 'reflect') {
        const mirrored = path.map(pt => reflectPoint(pt, axisType));
        const mgeo = buildCurve(mirrored);
        if (mgeo) {
          const mline = new THREE.Line(mgeo, lineMat(color, 0.75));
          sg.add(mline);
        }
      } else if (symmetryMode === 'rotate') {
        for (let k = 1; k < rotationOrder; k++) {
          const rotated = rotatePath(path, rotationOrder, k);
          const rgeo = buildCurve(rotated);
          if (rgeo) {
            const rline = new THREE.Line(rgeo, lineMat(color, 0.85));
            sg.add(rline);
          }
        }
      } else if (symmetryMode === 'translate') {
        // Tile in a 3×3 grid around origin
        for (let dx = -1; dx <= 1; dx++) {
          for (let dz = -1; dz <= 1; dz++) {
            if (dx === 0 && dz === 0) continue;
            const shifted = path.map(([col, row]) => [col + dx * GRID_COLS, row + dz * GRID_ROWS]);
            const sgeo = buildCurve(shifted);
            if (sgeo) {
              sg.add(new THREE.Line(sgeo, lineMat(color, 0.55)));
            }
          }
        }
      }
    });
  }, [symmetryMode, axisType, rotationOrder, drawColor, loadedPaths]);

  // Redraw whenever paths, symmetry, or colour changes
  useEffect(() => {
    redrawStrokes();
  }, [redrawStrokes]);

  // ── Coord label sprites ───────────────────────────────────────────────────
  useEffect(() => {
    const cg = coordGroup.current;
    if (!cg) return;

    while (cg.children.length) {
      const c = cg.children[0];
      c.material?.map?.dispose();
      c.material?.dispose();
      cg.remove(c);
    }

    if (!showCoords) return;

    // Only label every 2nd dot to avoid clutter
    for (let row = 0; row <= GRID_ROWS; row += 2) {
      for (let col = 0; col <= GRID_COLS; col += 2) {
        const cx = col - GRID_COLS / 2;
        const cy = GRID_ROWS / 2 - row;
        const label = `(${cx},${cy})`;

        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 48;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 128, 48);
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = '#00FFAA';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 64, 24);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
        const sprite = new THREE.Sprite(mat);
        const pos = dotToVec3(col, row);
        sprite.position.set(pos.x, CANVAS_Y + 0.08, pos.z);
        sprite.scale.set(0.25, 0.09, 1);
        cg.add(sprite);
      }
    }
  }, [showCoords]);

  // ── Pointer / click interaction ───────────────────────────────────────────
  useEffect(() => {
    const { renderer, scene, camera } = refs.current;
    if (!renderer || !scene) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerDown = (e) => {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.x = ((clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((clientY - rect.top)  / rect.height) * 2 + 1;

      if (!camera) return;
      raycaster.setFromCamera(mouse, camera);

      // Collect all dot meshes
      const allDotMeshes = dotMeshes.current.flat();
      const hits = raycaster.intersectObjects(allDotMeshes, false);

      if (hits.length === 0) return;

      const hit = hits[0].object;
      const { col, row } = hit.userData;

      if (!selectedDot.current) {
        // Start new path segment
        selectedDot.current = [col, row];
        currentPath.current = [[col, row]];
        hit.material.color.setHex(0xFFD700);
        hit.material.opacity = 1.0;
      } else {
        // Extend current path
        const prev = selectedDot.current;
        if (prev[0] === col && prev[1] === row) {
          // Same dot — commit the path if it has ≥ 2 points
          if (currentPath.current.length >= 2) {
            allPaths.current.push({ path: [...currentPath.current], color: drawColor });
            onDotsUpdated?.(allPaths.current.map(s => s.path));
          }
          selectedDot.current = null;
          currentPath.current = [];
          // Reset dot color
          dotMeshes.current.flat().forEach(m => {
            m.material.color.setHex(0x888888);
            m.material.opacity = 0.55;
          });
        } else {
          currentPath.current.push([col, row]);
          selectedDot.current = [col, row];
          hit.material.color.setHex(0xFFD700);
          hit.material.opacity = 1.0;
        }
        redrawStrokes();
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: true });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('touchstart', onPointerDown);
    };
  }, [refs, drawColor, redrawStrokes, onDotsUpdated]);

  return null; // Pure Three.js — no React DOM output
}
