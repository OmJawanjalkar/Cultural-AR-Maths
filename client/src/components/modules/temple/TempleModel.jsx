/**
 * TempleModel.jsx
 * Three.js temple in the AR / fallback scene.
 *
 * Fixes & improvements over v1:
 *  - Camera + OrbitControls target repositioned to temple centre after build
 *  - Ground plane added for shadow and depth perception
 *  - 3D measurement labels (arrows + sprites) with toggle
 *  - Improved lighting (hemisphere + directional + point)
 *  - Scene fog for depth
 *  - All objects properly disposed on unmount / style-change
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useARContext } from '../../ar/ARScene';

// ─── Temple centre (geometric centre of the full temple assembly) ─────────────
// Gopuram: x=0, y=0→22+, z=-7.5→+10.5  →  centre ≈ (0, 11, -1)
const TEMPLE_CENTER = new THREE.Vector3(0, 11, -1);

// ─── Materials ────────────────────────────────────────────────────────────────
function stoneMat(color = 0xD2B48C, roughness = 0.78) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 });
}
function goldMat() {
  return new THREE.MeshStandardMaterial({ color: 0xD4A017, metalness: 0.85, roughness: 0.18 });
}
function lineMat(color = 0xFFD700) {
  return new THREE.LineBasicMaterial({ color, linewidth: 2, depthTest: false, transparent: true, opacity: 0.9 });
}

// ─── Dispose ──────────────────────────────────────────────────────────────────
function disposeGroup(obj) {
  if (!obj) return;
  obj.traverse(child => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach(m => { m.map?.dispose(); m.dispose(); });
    } else if (child.material) {
      child.material.map?.dispose();
      child.material.dispose();
    }
  });
}

// ─── Easing ───────────────────────────────────────────────────────────────────
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function animateParts(parts, fromMap, toMap, duration = 1800) {
  const ids = Object.keys(parts).filter(id => toMap[id] && fromMap[id]);
  const t0 = performance.now();
  function tick() {
    const p = Math.min((performance.now() - t0) / duration, 1);
    const e = easeInOut(p);
    ids.forEach(id => parts[id].position.lerpVectors(fromMap[id], toMap[id], e));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Grid layout: 3 columns × rows, all at z=6 (toward camera at z≈30)
// so every part stays visible without moving the camera during decompose
function buildSpreadPositions(partIds) {
  const spread = {};
  const cols     = 3;
  const spacingX = 14;
  const spacingY = 10;
  const baseZ    = 6;
  partIds.forEach((id, i) => {
    const col = (i % cols) - 1; // -1, 0, 1
    const row = Math.floor(i / cols);
    spread[id] = new THREE.Vector3(
      col * spacingX,
      3 + row * spacingY,
      baseZ,
    );
  });
  return spread;
}

// ─── Camera animation ─────────────────────────────────────────────────────────
function animateCamera(camera, controls, toPos, toTarget, duration = 1400) {
  if (!camera) return;
  const fromPos    = camera.position.clone();
  const fromTarget = controls ? controls.target.clone() : toTarget.clone();
  const t0 = performance.now();
  function tick() {
    const p = Math.min((performance.now() - t0) / duration, 1);
    const e = easeInOut(p);
    camera.position.lerpVectors(fromPos, toPos, e);
    if (controls) {
      controls.target.lerpVectors(fromTarget, toTarget, e);
      controls.update();
    }
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Rectangular frustum (proper shape for gopuram/shikhara tiers) ────────────
// Creates an 8-vertex tapered box — correct architectural frustum cross-section.
function makeRectFrustumGeo(wBot, dBot, wTop, dTop, h) {
  const hWB = wBot / 2, hDB = dBot / 2;
  const hWT = wTop / 2, hDT = dTop / 2;
  const pos = new Float32Array([
    -hWB, 0, -hDB,  hWB, 0, -hDB,  hWB, 0,  hDB,  -hWB, 0,  hDB,  // bottom ring
    -hWT, h, -hDT,  hWT, h, -hDT,  hWT, h,  hDT,  -hWT, h,  hDT,  // top ring
  ]);
  const idx = [
    0, 2, 1,  0, 3, 2,   // bottom
    4, 5, 6,  4, 6, 7,   // top
    3, 7, 6,  3, 6, 2,   // front  (+z)
    0, 1, 5,  0, 5, 4,   // back   (-z)
    1, 2, 6,  1, 6, 5,   // right  (+x)
    0, 4, 7,  0, 7, 3,   // left   (-x)
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ─── Canvas sprite label ───────────────────────────────────────────────────────
function makeLabel(text, bgColor = 'rgba(0,0,0,0.75)', textColor = '#FFD700') {
  const W = 320, H = 80;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Rounded rect background
  const r = 12;
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.lineTo(W - r, 0);
  ctx.quadraticCurveTo(W, 0, W, r);
  ctx.lineTo(W, H - r); ctx.quadraticCurveTo(W, H, W - r, H);
  ctx.lineTo(r, H); ctx.quadraticCurveTo(0, H, 0, H - r);
  ctx.lineTo(0, r); ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,160,50,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }),
  );
  sprite.scale.set(6, 1.5, 1);
  sprite.userData.isOverlay = true;
  return sprite;
}

// ─── Measurement arrows + labels ──────────────────────────────────────────────
function buildMeasurementLabels(scene, style) {
  const objects = [];

  function addArrow(from, to, color, label) {
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    const len = from.distanceTo(to);
    const arrow = new THREE.ArrowHelper(dir, from, len, color, len * 0.08, len * 0.06);
    arrow.userData.isOverlay = true;
    arrow.line.material.depthTest = false;
    arrow.line.material.transparent = true;
    arrow.cone.material.depthTest = false;
    arrow.cone.material.transparent = true;
    scene.add(arrow);
    objects.push(arrow);

    // Midpoint label sprite
    const mid = new THREE.Vector3().lerpVectors(from, to, 0.5);
    mid.x += 0.5; // slight offset so label doesn't overlap line
    const sprite = makeLabel(label);
    sprite.position.copy(mid);
    scene.add(sprite);
    objects.push(sprite);
  }

  function addDimLine(p1, p2, color) {
    const pts = [p1, p2];
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const line = new THREE.Line(geo, lineMat(color));
    line.userData.isOverlay = true;
    scene.add(line);
    objects.push(line);
  }

  if (style === 'gopuram') {
    // ── Height: 17.3m (right side of tower at x=5) ─────────────────────────
    addDimLine(new THREE.Vector3(5.5, 0, -4), new THREE.Vector3(7, 0, -4), 0x00FFAA);
    addDimLine(new THREE.Vector3(5.5, 17.3, -4), new THREE.Vector3(7, 17.3, -4), 0x00FFAA);
    addArrow(
      new THREE.Vector3(7, 0, -4),
      new THREE.Vector3(7, 17.3, -4),
      0x00FFAA,
      'Height: 17.3 m',
    );

    // ── Base width: 12m (front face) ────────────────────────────────────────
    addDimLine(new THREE.Vector3(-6, 0, 6.5), new THREE.Vector3(-6, -1, 6.5), 0xFF6B00);
    addDimLine(new THREE.Vector3( 6, 0, 6.5), new THREE.Vector3( 6, -1, 6.5), 0xFF6B00);
    addArrow(
      new THREE.Vector3(-6, -1.2, 6.5),
      new THREE.Vector3( 6, -1.2, 6.5),
      0xFF6B00,
      'Width: 12 m',
    );

    // ── Base depth: 14m (side face from front to back of garbhagriha) ───────
    addDimLine(new THREE.Vector3(-7, 0, 6),  new THREE.Vector3(-8, 0,  6), 0xAA88FF);
    addDimLine(new THREE.Vector3(-7, 0, -6), new THREE.Vector3(-8, 0, -6), 0xAA88FF);
    addArrow(
      new THREE.Vector3(-8, 0, 6),
      new THREE.Vector3(-8, 0, -6),
      0xAA88FF,
      'Depth: 14 m',
    );

    // ── Pillar height: 6m ───────────────────────────────────────────────────
    addArrow(
      new THREE.Vector3(4.2, 2, 5.5),
      new THREE.Vector3(4.2, 8, 5.5),
      0xFFDD00,
      'Pillar: 6 m',
    );

  } else if (style === 'indo_islamic') {
    // Height 16.5m
    addDimLine(new THREE.Vector3(8, 0, 0), new THREE.Vector3(9.5, 0, 0), 0x00FFAA);
    addDimLine(new THREE.Vector3(8, 16.5, 0), new THREE.Vector3(9.5, 16.5, 0), 0x00FFAA);
    addArrow(new THREE.Vector3(9.5, 0, 0), new THREE.Vector3(9.5, 16.5, 0), 0x00FFAA, 'Height: 16.5 m');

    // Dome radius
    addArrow(new THREE.Vector3(0, 11, 0), new THREE.Vector3(5, 11, 0), 0xAA88FF, 'Dome r: 5 m');

    // Base width
    addArrow(new THREE.Vector3(-7, -1, 0), new THREE.Vector3(7, -1, 0), 0xFF6B00, 'Width: 14 m');

  } else {
    // Nagara shikhara
    addArrow(new THREE.Vector3(5, 0, -4), new THREE.Vector3(5, 18.5, -4), 0x00FFAA, 'Height: 18.5 m');
    addArrow(new THREE.Vector3(-6, -1, 0), new THREE.Vector3(6, -1, 0), 0xFF6B00, 'Width: 12 m');
  }

  return objects;
}

// ─── Ground plane ─────────────────────────────────────────────────────────────
function buildGround(scene) {
  const geo = new THREE.PlaneGeometry(80, 80, 8, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x5C4A32,
    roughness: 0.95,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.02;
  mesh.receiveShadow = true;
  mesh.userData.isGround = true;
  scene.add(mesh);

  // Grid lines on ground
  const grid = new THREE.GridHelper(60, 20, 0x3A2E1E, 0x3A2E1E);
  grid.position.y = 0.01;
  grid.userData.isGround = true;
  scene.add(grid);

  return [mesh, grid];
}

// ─── Scene lighting setup ─────────────────────────────────────────────────────
function setupSceneLighting(scene) {
  const lights = [];

  // Hemisphere light (sky/ground gradient)
  const hemi = new THREE.HemisphereLight(0xFFF4E0, 0x4A3000, 0.8);
  scene.add(hemi);
  lights.push(hemi);

  // Main sun — warm directional with shadows
  const sun = new THREE.DirectionalLight(0xFFE0A0, 2.5);
  sun.position.set(20, 40, 25);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 150;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -40;
  sun.shadow.camera.right = sun.shadow.camera.top = 40;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  lights.push(sun);

  // Fill light — cool opposite side
  const fill = new THREE.DirectionalLight(0xA0C8FF, 0.6);
  fill.position.set(-25, 20, -15);
  scene.add(fill);
  lights.push(fill);

  // Golden point light near Kalasha
  const glow = new THREE.PointLight(0xD4A017, 3, 20);
  glow.position.set(0, 18, -4);
  scene.add(glow);
  lights.push(glow);

  return lights;
}

// ─────────────────────────────────────────────────────────────────────────────
// GOPURAM builder  — South Indian Dravidian temple
// Each named part keeps the same ID as in templeData.js so info-cards work.
// Extra decorative meshes (moldings, pilasters, porch details) are added to
// their nearest named group so they move with it during decompose.
// ─────────────────────────────────────────────────────────────────────────────
function buildGopuram(parentGroup, state) {
  const { parts, meshToPart } = state;

  // Register each mesh in the part map and set shadow flags
  function addPart(id, meshes, position) {
    const g = new THREE.Group();
    g.name = id; g.userData.partId = id;
    meshes.forEach(m => {
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); meshToPart.set(m.uuid, id);
    });
    g.position.set(position.x, position.y, position.z);
    parentGroup.add(g);
    parts[id] = g;
    return g;
  }

  // Shorthand mesh factories
  const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  const B  = (w, h, d, c, r = 0.78) => sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat(c, r)));
  const C  = (rT, rB, h, c, s = 22) => sh(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, s), stoneMat(c)));
  const T  = (r1, r2, c) => { const m = sh(new THREE.Mesh(new THREE.TorusGeometry(r1, r2, 8, 26), stoneMat(c, 0.55))); m.rotation.x = Math.PI / 2; return m; };

  // ── 1. ADHISTHANA (Base Platform) ──────────────────────────────────────────
  // 3-step tiered platform + top cornice + two mid-height molding bands
  const bStep2 = B(15.6, 0.55, 21.6, 0xA8906A);  bStep2.position.y = -1.27;  // lowest step
  const bStep1 = B(14.6, 0.65, 20.6, 0xBB9B72);  bStep1.position.y = -0.68;  // middle step
  const bMain  = B(13.4, 2.2,  19.4, 0xD0AD80);                               // main slab
  const bTopC  = B(13.8, 0.28, 19.8, 0xDCBA88);  bTopC.position.y  =  1.24;  // top cornice
  const bMid1  = B(13.1, 0.2,  19.1, 0xBB9870);  bMid1.position.y  =  0.2;   // lower band
  const bMid2  = B(12.8, 0.2,  18.8, 0xBB9870);  bMid2.position.y  =  0.7;   // upper band
  addPart('base', [bStep2, bStep1, bMain, bTopC, bMid1, bMid2], { x: 0, y: 1.6, z: -1 });

  // ── 2. MANDAPA (Main Congregation Hall) ────────────────────────────────────
  // Hall body + roof system + entrance porch (ardha-mandapa) + vestibule (antarala)
  const mHall   = B(10, 7, 10, 0xD2AB82);                             // main hall
  // Wall horizontal bands
  const mBand1  = B(10.5, 0.28, 10.5, 0xC8A278); mBand1.position.y = -1.8;
  const mBand2  = B(10.5, 0.28, 10.5, 0xC8A278); mBand2.position.y =  1.8;
  // Flat roof slab
  const mRoof   = B(11, 0.48, 11, 0xBB9060);     mRoof.position.y  =  3.74;
  // Barrel-ridge on roof (approximates the traditional brick-vaulted roof)
  const mRidge  = B(2.4, 0.85, 11.5, 0xA07850);  mRidge.position.y =  4.25;
  // Side hip ridges
  const mHipL   = B(4.8, 0.5, 0.8, 0xA07850);   mHipL.position.set(-3.4,  4.0, 0);
  const mHipR   = B(4.8, 0.5, 0.8, 0xA07850);   mHipR.position.set( 3.4,  4.0, 0);
  // Roof-edge cornices (four sides)
  const mCornF  = B(11, 0.3, 0.35, 0xC09060);   mCornF.position.set(0,  3.38,  5.17);
  const mCornB  = B(11, 0.3, 0.35, 0xC09060);   mCornB.position.set(0,  3.38, -5.17);
  const mCornL  = B(0.35, 0.3, 11, 0xC09060);   mCornL.position.set(-5.17, 3.38, 0);
  const mCornR  = B(0.35, 0.3, 11, 0xC09060);   mCornR.position.set( 5.17, 3.38, 0);
  // Entrance porch (ardha-mandapa) attached to front face
  const mPorch  = B(6.5, 5, 4, 0xCAA880);        mPorch.position.set(0, -1.0, 7.0);
  const mPRoof  = B(7.2, 0.4, 4.8, 0xAA8858);   mPRoof.position.set(0,  1.8, 7.0);
  // Porch pilasters (flat vertical panels flanking doorway)
  const mPPilL  = B(0.45, 5, 0.45, 0xB89062);   mPPilL.position.set(-2.9, -1.0, 8.85);
  const mPPilR  = B(0.45, 5, 0.45, 0xB89062);   mPPilR.position.set( 2.9, -1.0, 8.85);
  // Entry arch lintel
  const mLintel = B(6.6, 0.35, 0.3, 0xA07840);  mLintel.position.set(0,  1.25, 9.0);
  // 3 entrance steps
  const mStp1   = B(7.0, 0.4, 1.0, 0xAA8850);   mStp1.position.set(0, -3.3, 9.6);
  const mStp2   = B(7.6, 0.4, 1.0, 0xAA8850);   mStp2.position.set(0, -3.7, 10.1);
  const mStp3   = B(8.2, 0.4, 1.0, 0xAA8850);   mStp3.position.set(0, -4.1, 10.6);
  // Antarala (vestibule) connecting mandapa to garbhagriha
  const mAntara = B(5.5, 6.5, 3, 0xC4966A);     mAntara.position.set(0, -0.25, -6.5);

  addPart('mandapa', [
    mHall, mBand1, mBand2,
    mRoof, mRidge, mHipL, mHipR,
    mCornF, mCornB, mCornL, mCornR,
    mPorch, mPRoof, mPPilL, mPPilR, mLintel,
    mStp1, mStp2, mStp3,
    mAntara,
  ], { x: 0, y: 6, z: 2 });

  // ── 3. PILLARS (Stambha) — 4 named pillars at the four mandapa corners ─────
  [
    { id: 'pillar_1', x:  4.5, z:  5.2 },
    { id: 'pillar_2', x: -4.5, z:  5.2 },
    { id: 'pillar_3', x:  4.5, z: -2.2 },
    { id: 'pillar_4', x: -4.5, z: -2.2 },
  ].forEach(({ id, x, z }) => {
    const plinth  = B(1.1, 0.45, 1.1, 0xAA8052);  plinth.position.y  = -3.27;
    const shaft   = C(0.37, 0.44, 6.0, 0xCEA878, 20);
    const capital = B(1.1, 0.45, 1.1, 0xAA8052);  capital.position.y =  3.27;
    const capTop  = B(0.9, 0.55, 0.9, 0x9A7042);  capTop.position.y  =  3.65;
    const ringT   = T(0.43, 0.06, 0xAA7840);       ringT.position.y   =  2.6;
    const ringB   = T(0.43, 0.06, 0xAA7840);       ringB.position.y   = -2.6;
    // Mid-shaft decorative ring
    const ringM   = T(0.40, 0.05, 0xBB8850);       ringM.position.y   =  0;
    addPart(id, [plinth, shaft, capital, capTop, ringT, ringB, ringM], { x, y: 6, z });
  });

  // ── 4. GARBHAGRIHA (Inner Sanctum) ─────────────────────────────────────────
  // Larger, heavier box — thick walls symbolise sacredness
  const gBody  = B(7.5, 9, 7.5, 0xC4905A);
  // Three horizontal wall molding bands
  const gBnd1  = B(8.0, 0.3, 8.0, 0xAA7840);  gBnd1.position.y  = -2.5;
  const gBnd2  = B(8.0, 0.3, 8.0, 0xAA7840);  gBnd2.position.y  =  0;
  const gBnd3  = B(8.0, 0.3, 8.0, 0xAA7840);  gBnd3.position.y  =  2.5;
  // Corner pilasters (vertical projecting strips at all 4 corners)
  const mkGPil = (px, pz) => { const p = B(0.6, 9, 0.6, 0xBB8850); p.position.set(px, 0, pz); return p; };
  // Mid-face decorative panel (niche/shrine panel approximation)
  const mkFace = (px, pz, ry) => {
    const f = B(1.8, 3.5, 0.3, 0xD0A070); f.position.set(px, 1, pz); f.rotation.y = ry; return f;
  };
  addPart('garbhagriha', [
    gBody, gBnd1, gBnd2, gBnd3,
    mkGPil( 3.9,  3.9), mkGPil(-3.9,  3.9), mkGPil( 3.9, -3.9), mkGPil(-3.9, -3.9),
    mkFace(0,  4.05, 0), mkFace(0, -4.05, Math.PI),
    mkFace( 4.05, 0, Math.PI / 2), mkFace(-4.05, 0, -Math.PI / 2),
  ], { x: 0, y: 5, z: -4 });
  // Garbhagriha top = 5 + 9/2 = 9.5  (tower starts here)

  // ── 5. SHIKHARA TIERS — rectangular frustums (proper gopuram cross-section) ─
  // Each tier: bottom at world-Y of previous top, step inward in both X and Z.
  // Added decorative elements: base cornice strip + corner finials (amalakas).
  const tierDefs = [
    // worldY = bottom of this tier in world space
    { id: 'shikhara_tier_1', wB:10,  dB:10,  wT:8.0, dT:8.0, h:3.5, color:0xD49955, worldY:  9.5 },
    { id: 'shikhara_tier_2', wB: 8,  dB: 8,  wT:6.2, dT:6.2, h:3.0, color:0xC48745, worldY: 13.0 },
    { id: 'shikhara_tier_3', wB: 6.2,dB: 6.2,wT:4.5, dT:4.5, h:2.5, color:0xB47538, worldY: 16.0 },
    { id: 'shikhara_tier_4', wB: 4.5,dB: 4.5,wT:2.8, dT:2.8, h:2.0, color:0xA46530, worldY: 18.5 },
  ];

  tierDefs.forEach(t => {
    // Main frustum (bottom at local y=0, top at local y=h → group placed at worldY)
    const frust = new THREE.Mesh(makeRectFrustumGeo(t.wB, t.dB, t.wT, t.dT, t.h), stoneMat(t.color));
    frust.castShadow = true; frust.receiveShadow = true;
    // Base cornice (horizontal projecting strip wrapping the tier bottom)
    const corn  = B(t.wB + 0.5, 0.28, t.dB + 0.5, 0x8B7355, 0.6);  corn.position.y = 0.14;
    // Top cap cornice
    const topC  = B(t.wT + 0.2, 0.2, t.dT + 0.2, 0x9A7860, 0.6);   topC.position.y = t.h - 0.1;
    // Amalaka-style corner finials at tier base
    const mkAm = (sx, sz) => {
      const a = C(0.22, 0.28, 0.55, 0x9B8050, 12);
      a.position.set(sx * (t.wB / 2 + 0.15), 0.28, sz * (t.dB / 2 + 0.15));
      return a;
    };
    // Central vertical panel on each face (creates visual relief/depth)
    const mkFP  = (ox, oz) => { const p = B(0.4, t.h * 0.75, 0.28, 0xBB9060); p.position.set(ox, t.h * 0.5, oz); return p; };

    addPart(t.id, [
      frust, corn, topC,
      mkAm( 1,  1), mkAm(-1,  1), mkAm( 1, -1), mkAm(-1, -1),
      mkFP(0,  t.dB / 2 + 0.01), mkFP(0, -(t.dB / 2 + 0.01)),
      mkFP( t.wB / 2 + 0.01, 0), mkFP(-(t.wB / 2 + 0.01), 0),
    ], { x: 0, y: t.worldY, z: -4 });
  });

  // 5th tier (stupi/final taper) — attached to tier-4 group so it moves with it
  // Tier-4 top = 18.5 + 2.0 = 20.5.  Local y relative to tier-4 group = 2.0.
  const stupi = new THREE.Mesh(makeRectFrustumGeo(2.8, 2.8, 1.0, 1.0, 1.5), stoneMat(0x946020));
  stupi.castShadow = true;
  stupi.position.set(0, 2.0 + 0.75, 0);   // bottom at local y=2, center at 2.75
  parts['shikhara_tier_4'].add(stupi);
  // Tier-4 + stupi top = 18.5 + 2 + 1.5 = 22.0

  // ── 6. KALASHA (Crown Finial) ───────────────────────────────────────────────
  // Multi-element golden crown: rings + pot + dome cap + staff
  const kRing1 = T(0.55, 0.08, 0xD4A017);  kRing1.material = goldMat();  kRing1.position.y =  0.5;
  const kRing2 = T(0.52, 0.07, 0xD4A017);  kRing2.material = goldMat();  kRing2.position.y =  0.15;
  const kRing3 = T(0.50, 0.07, 0xD4A017);  kRing3.material = goldMat();  kRing3.position.y = -0.15;
  const kPot   = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.4, 1.1, 22), goldMat());
  kPot.castShadow = true;
  const kNeck  = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.5, 16), goldMat());
  kNeck.position.y = 0.8;
  const kDome  = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), goldMat());
  kDome.position.y = 1.38;
  const kStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.3, 8), goldMat());
  kStaff.position.y = 2.25;
  addPart('kalasha', [kRing1, kRing2, kRing3, kPot, kNeck, kDome, kStaff],
          { x: 0, y: 22.0, z: -4 });
}

// ─────────────────────────────────────────────────────────────────────────────
// NAGARA builder  — North Indian curvilinear shikhara
// Shikhara uses stacked square-cross-section segments whose half-width follows
// a parabolic curve, faithfully reproducing the "beehive" silhouette.
// ─────────────────────────────────────────────────────────────────────────────
function buildNagara(parentGroup, state) {
  const { parts, meshToPart } = state;

  function addPart(id, meshes, position) {
    const g = new THREE.Group();
    g.name = id; g.userData.partId = id;
    meshes.forEach(m => {
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); meshToPart.set(m.uuid, id);
    });
    g.position.set(position.x, position.y, position.z);
    parentGroup.add(g);
    parts[id] = g;
    return g;
  }
  const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  const B  = (w, h, d, c, r = 0.78) => sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat(c, r)));
  const C  = (rT, rB, h, c, s = 20) => sh(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, s), stoneMat(c)));
  const T  = (r1, r2, c) => { const m = sh(new THREE.Mesh(new THREE.TorusGeometry(r1, r2, 8, 24), stoneMat(c, 0.5))); m.rotation.x = Math.PI / 2; return m; };

  // ── 1. ADHISTHANA — 2-step platform ──────────────────────────────────────
  const bStep = B(13.6, 0.6, 13.6, 0xA8906A); bStep.position.y = -1.2;
  const bMain = B(12.4, 2.2, 12.4, 0xD0AB80);
  const bTopC = B(12.8, 0.25, 12.8, 0xDDB888); bTopC.position.y = 1.22;
  addPart('base', [bStep, bMain, bTopC], { x: 0, y: 1.6, z: 0 });

  // ── 2. MANDAPA ───────────────────────────────────────────────────────────
  const mHall  = B(9, 6, 9, 0xD0AB82);
  const mBnd1  = B(9.4, 0.28, 9.4, 0xC0986A); mBnd1.position.y = -1.5;
  const mBnd2  = B(9.4, 0.28, 9.4, 0xC0986A); mBnd2.position.y =  1.5;
  const mRoof  = B(9.8, 0.45, 9.8, 0xB89060); mRoof.position.y =  3.22;
  // Curvilinear mandapa roof ridge (pyramidal)
  const mPyrB  = B(6,   0.55, 6,   0xA07850); mPyrB.position.y = 3.72;
  const mPyrM  = B(3.5, 0.55, 3.5, 0x907040); mPyrM.position.y = 4.27;
  const mPyrT  = B(1.5, 0.5,  1.5, 0x805030); mPyrT.position.y = 4.72;
  // Front porch
  const mPorch = B(5.5, 5, 3.5, 0xCBA882);   mPorch.position.set(0, -0.5, 6.25);
  const mPRoof = B(6.2, 0.4, 4, 0xA88855);   mPRoof.position.set(0,  2.1, 6.25);
  const mStep1 = B(6, 0.4, 1, 0xAA8850);     mStep1.position.set(0, -3.2, 8.3);
  const mStep2 = B(6.6, 0.4, 1, 0xAA8850);   mStep2.position.set(0, -3.6, 8.8);
  addPart('mandapa', [mHall, mBnd1, mBnd2, mRoof, mPyrB, mPyrM, mPyrT, mPorch, mPRoof, mStep1, mStep2],
          { x: 0, y: 5.5, z: 2 });

  // ── 3. PILLARS ───────────────────────────────────────────────────────────
  [
    { id: 'pillar_1', x:  4, z:  4.5 },
    { id: 'pillar_2', x: -4, z:  4.5 },
    { id: 'pillar_3', x:  4, z: -1.5 },
    { id: 'pillar_4', x: -4, z: -1.5 },
  ].forEach(({ id, x, z }) => {
    const plinth  = B(1.0, 0.4, 1.0, 0xAA8050); plinth.position.y  = -2.8;
    const shaft   = C(0.36, 0.42, 5.4, 0xCEA070, 18);
    const capital = B(1.0, 0.4, 1.0, 0xAA8050); capital.position.y =  2.8;
    const rT = T(0.41, 0.06, 0xAA7840); rT.position.y =  2.2;
    const rB = T(0.41, 0.06, 0xAA7840); rB.position.y = -2.2;
    addPart(id, [plinth, shaft, capital, rT, rB], { x, y: 5.5, z });
  });

  // ── 4. GARBHAGRIHA ───────────────────────────────────────────────────────
  const gBody = B(7, 8.5, 7, 0xC4905A);
  const gBnd1 = B(7.5, 0.28, 7.5, 0xAA7840); gBnd1.position.y = -2;
  const gBnd2 = B(7.5, 0.28, 7.5, 0xAA7840); gBnd2.position.y =  2;
  // Corner pilasters
  const mkGPil = (px, pz) => { const p = B(0.55, 8.5, 0.55, 0xBB8850); p.position.set(px, 0, pz); return p; };
  addPart('garbhagriha', [
    gBody, gBnd1, gBnd2,
    mkGPil( 3.77,  3.77), mkGPil(-3.77,  3.77),
    mkGPil( 3.77, -3.77), mkGPil(-3.77, -3.77),
  ], { x: 0, y: 5, z: -4 });
  // Garbhagriha top at y = 5 + 4.25 = 9.25

  // ── 5. NAGARA SHIKHARA ───────────────────────────────────────────────────
  // 28 stacked square-section segments following a parabolic width curve.
  // All segments share the 'shikhara_tier_1' part ID.
  // Separate named tiers (2, 3, 4) are represented by visual colour bands.
  const nagBaseY = 9.25, nagZ = -4;
  const segCount = 28, segH = 0.52, baseW = 7.5;

  // We'll build all segments inside one named group for decompose compatibility.
  const shikGroup = new THREE.Group();
  shikGroup.name = 'shikhara_tier_1'; shikGroup.userData.partId = 'shikhara_tier_1';
  shikGroup.position.set(0, nagBaseY, nagZ);
  parentGroup.add(shikGroup);
  parts['shikhara_tier_1'] = shikGroup;

  for (let i = 0; i < segCount; i++) {
    const t = i / (segCount - 1);
    // Parabolic curve: wide at base, narrow at apex
    const w = baseW * Math.pow(1 - t, 0.65) + 0.35;
    // Slight projection on N/S faces (rathas) creates the characteristic ribbed look
    const dRatha = w * 0.06;
    const hue = Math.floor(0xC4956A + i * 0x000800);
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(w, segH, w + dRatha), stoneMat(hue > 0xC4FF6A ? 0xC4956A : hue),
    );
    seg.castShadow = true;
    seg.position.y = i * segH + segH / 2;
    meshToPart.set(seg.uuid, 'shikhara_tier_1');
    shikGroup.add(seg);
  }
  // Colour-coded tier labels (dummy groups for decompose spread — same pos as shikGroup)
  // Reuse the shikhara_tier_1 group for tiers 2-4 lookup (they're visual-only here)
  parts['shikhara_tier_2'] = shikGroup;
  parts['shikhara_tier_3'] = shikGroup;
  parts['shikhara_tier_4'] = shikGroup;

  // Amalaka (ribbed disc) at apex of shikhara
  const amalakaY = nagBaseY + segCount * segH;
  const amalaka = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.38, 12, 32), stoneMat(0xA07040));
  amalaka.castShadow = true;
  amalaka.rotation.x = Math.PI / 2;
  amalaka.position.set(0, amalakaY + 0.38, nagZ);
  parentGroup.add(amalaka);

  // ── 6. KALASHA ───────────────────────────────────────────────────────────
  const kY = amalakaY + 0.76 + 0.4;
  const kPot  = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 0.9, 20), goldMat());
  const kNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 0.45, 16), goldMat());
  kNeck.position.y = 0.67;
  const kDome = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 12, 0, Math.PI*2, 0, Math.PI/2), goldMat());
  kDome.position.y = 1.15;
  const kStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 1.1, 8), goldMat());
  kStaff.position.y = 2.0;
  addPart('kalasha', [kPot, kNeck, kDome, kStaff], { x: 0, y: kY, z: nagZ });
}

// ─────────────────────────────────────────────────────────────────────────────
// INDO-ISLAMIC builder  — Mughal / Indo-Islamic dome complex
// Features: multi-step platform, iwan gateway, cylindrical drum, slightly
// pointed onion dome, 4 corner chhatri minarets, ornate kalasha finial.
// ─────────────────────────────────────────────────────────────────────────────
function buildIndoIslamic(parentGroup, state) {
  const { parts, meshToPart } = state;

  function addPart(id, meshes, position) {
    const g = new THREE.Group();
    g.name = id; g.userData.partId = id;
    meshes.forEach(m => {
      m.castShadow = true; m.receiveShadow = true;
      g.add(m); meshToPart.set(m.uuid, id);
    });
    g.position.set(position.x, position.y, position.z);
    parentGroup.add(g);
    parts[id] = g;
    return g;
  }
  const sh = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  const B  = (w, h, d, c, r = 0.72) => sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat(c, r)));
  const C  = (rT, rB, h, c, s = 28) => sh(new THREE.Mesh(new THREE.CylinderGeometry(rT, rB, h, s), stoneMat(c)));

  // ── 1. PLATFORM ──────────────────────────────────────────────────────────
  const bStep2 = B(16.8, 0.55, 16.8, 0xB8A888); bStep2.position.y = -1.28;
  const bStep1 = B(15.6, 0.65, 15.6, 0xC8B898); bStep1.position.y = -0.68;
  const bMain  = B(14.2, 2.2,  14.2, 0xDDD0B0);
  const bTopC  = B(14.7, 0.28, 14.7, 0xEEDFBF); bTopC.position.y  =  1.24;
  // Ornamental band / dado course
  const bDado  = B(14.4, 0.55, 14.4, 0xD0C0A0, 0.55); bDado.position.y = 0.12;
  addPart('base', [bStep2, bStep1, bMain, bTopC, bDado], { x: 0, y: 1.6, z: 0 });

  // ── 2. MAIN HALL (Diwan-i-Khas body + iwan entrance gateway) ─────────────
  const mBody  = B(12, 5.5, 12, 0xD8CBB0);
  // Iwan gateway (pointed arched entrance recess) — front face projection
  const mIwan  = B(5, 7, 1.2, 0xCCBFA0);         mIwan.position.set(0,  0.75, 6.6);
  // Iwan arch lintel strip
  const mArch  = B(5.2, 0.4, 1.3, 0xBBAA90);     mArch.position.set(0,  4.0,  6.6);
  // Side projecting bays
  const mBayL  = B(1.4, 5.5, 12, 0xCFC2A2);      mBayL.position.x  = -6.7;
  const mBayR  = B(1.4, 5.5, 12, 0xCFC2A2);      mBayR.position.x  =  6.7;
  // Roof parapet
  const mPara  = B(14, 0.6, 14, 0xC8BC9A);        mPara.position.y  =  3.05;
  // Battlement (merlons — alternating tooth parapet)
  for (let i = -3; i <= 3; i++) {
    const mL = sh(B(0.7, 0.8, 0.7, 0xBDB090)); mL.position.set(i * 2, 3.65, -6.85);
    const mR = sh(B(0.7, 0.8, 0.7, 0xBDB090));  mR.position.set(i * 2, 3.65,  6.85);
    mBody.geometry; // just to not be unused — merlons go into the part list below
    parentGroup.add(mL); parentGroup.add(mR); // static (not a named part)
  }
  // Transition octagonal zone between hall roof and drum
  const mOct   = C(4.8, 5.2, 1.0, 0xCDC0A0, 8); mOct.position.y  = 3.8;
  addPart('mandapa', [mBody, mIwan, mArch, mBayL, mBayR, mPara, mOct], { x: 0, y: 4.25, z: 0 });

  // ── 3. PILLARS — octagonal minaret-style columns ─────────────────────────
  [
    { id: 'pillar_1', x:  5, z:  5 },
    { id: 'pillar_2', x: -5, z:  5 },
    { id: 'pillar_3', x:  5, z: -5 },
    { id: 'pillar_4', x: -5, z: -5 },
  ].forEach(({ id, x, z }) => {
    const base   = C(0.62, 0.68, 0.5, 0xC8BC9A, 8); base.position.y   = -2.5;
    const shaft  = C(0.52, 0.60, 4.5, 0xD2C8A8, 8);
    const cap    = C(0.70, 0.58, 0.6, 0xBEB088, 8); cap.position.y    =  2.55;
    const chapCh = sh(new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 16, 8, 0, Math.PI*2, 0, Math.PI/2), stoneMat(0xD0C8A8, 0.5)));
    chapCh.position.y = 3.0;
    addPart(id, [base, shaft, cap, chapCh], { x, y: 4.25, z });
  });

  // ── 4. GARBHAGRIHA — cylindrical drum ────────────────────────────────────
  const dOuter = C(5.4, 5.6, 4.5, 0xD0C8A8, 40);
  // Decorative arched panel strips on drum (8 shallow niches)
  const drumBnd = C(5.65, 5.65, 0.28, 0xC8BC98, 40); drumBnd.position.y = -1.6;
  const drumBn2 = C(5.65, 5.65, 0.28, 0xC8BC98, 40); drumBn2.position.y =  1.6;
  addPart('garbhagriha', [dOuter, drumBnd, drumBn2], { x: 0, y: 9.5, z: 0 });
  // Drum top at y = 9.5 + 2.25 = 11.75

  // ── 5. DOME — slightly pointed "onion" profile ────────────────────────────
  // Approximate by combining a hemisphere (lower) + tapering cone (upper).
  // The SphereGeometry is scaled in Y to create the characteristic pointed tip.
  const domeGeo = new THREE.SphereGeometry(5, 48, 32, 0, Math.PI*2, 0, Math.PI * 0.6);
  const domeMesh = new THREE.Mesh(domeGeo, stoneMat(0x8BA07A, 0.48));
  domeMesh.scale.y = 1.25;   // taller than hemisphere → subtle onion/pointed shape
  domeMesh.castShadow = true;
  // Dome neck ring
  const dNeck   = C(5.2, 5.2, 0.4, 0xBDB098, 40); dNeck.position.y = -0.2;
  addPart('dome', [domeMesh, dNeck], { x: 0, y: 11.75, z: 0 });

  // 4 corner chhatri (small domed kiosks at platform corners)
  [[ 6.5,  6.5], [-6.5,  6.5], [ 6.5, -6.5], [-6.5, -6.5]].forEach(([cx, cz]) => {
    const chShaft = sh(C(0.42, 0.46, 3.5, 0xCFC0A0, 12));
    const chDome  = sh(new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 20, 12, 0, Math.PI*2, 0, Math.PI/2), stoneMat(0x8BA07A, 0.48)));
    chDome.position.y = 1.75;
    const chG = new THREE.Group();
    chG.add(chShaft, chDome);
    chG.position.set(cx, 3.0, cz);   // on top of the platform/hall
    parentGroup.add(chG);             // static decoration
  });

  // ── 6. KALASHA — layered finial + crescent ────────────────────────────────
  // Dome pointed tip is at y ≈ 11.75 + 5 * 1.25 = 18.0
  const kBase  = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.9, 20), goldMat());
  const kRing  = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.08, 8, 24), goldMat());
  kRing.rotation.x = Math.PI / 2; kRing.position.y = 0.5;
  const kNeck  = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.55, 16), goldMat());
  kNeck.position.y = 0.9;
  const kDome  = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 12, 0, Math.PI*2, 0, Math.PI/2), goldMat());
  kDome.position.y = 1.38;
  const kStaff = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 1.2, 8), goldMat());
  kStaff.position.y = 2.25;
  addPart('kalasha', [kBase, kRing, kNeck, kDome, kStaff], { x: 0, y: 18.0, z: 0 });
}

// ─────────────────────────────────────────────────────────────────────────────
// Highlight helper
// ─────────────────────────────────────────────────────────────────────────────
function setHighlight(partGroup, on) {
  if (!partGroup) return;
  partGroup.traverse(child => {
    if (child.isMesh && child.material && !child.userData.isOverlay) {
      child.material.emissive = new THREE.Color(on ? 0xFF6B00 : 0x000000);
      child.material.emissiveIntensity = on ? 0.55 : 0;
    }
  });
}

// ─── Overlay builders ─────────────────────────────────────────────────────────
function buildAngleOverlays(scene) {
  const objs = [];
  const corners = [[6, 0, 6], [-6, 0, 6], [6, 0, -6], [-6, 0, -6]];
  corners.forEach(([cx, , cz]) => {
    const s = 1.4;
    const pts = [
      new THREE.Vector3(cx, 0.08, cz - Math.sign(cz) * s),
      new THREE.Vector3(cx, 0.08, cz),
      new THREE.Vector3(cx - Math.sign(cx) * s, 0.08, cz),
    ];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0x00FFFF));
    line.userData.isOverlay = true;
    scene.add(line); objs.push(line);

    const sq = [
      new THREE.Vector3(cx - Math.sign(cx) * 0.5, 0.08, cz - Math.sign(cz) * 0.5),
      new THREE.Vector3(cx - Math.sign(cx) * 0.5, 0.08, cz),
      new THREE.Vector3(cx, 0.08, cz),
      new THREE.Vector3(cx, 0.08, cz - Math.sign(cz) * 0.5),
      new THREE.Vector3(cx - Math.sign(cx) * 0.5, 0.08, cz - Math.sign(cz) * 0.5),
    ];
    const sqLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(sq), lineMat(0x00FFFF));
    sqLine.userData.isOverlay = true;
    scene.add(sqLine); objs.push(sqLine);
  });

  const arcPts = [];
  for (let i = 0; i <= 28; i++) {
    const a = (i / 28) * (Math.PI / 2);
    arcPts.push(new THREE.Vector3(Math.cos(a) * 2.8, 7 + Math.sin(a) * 2.8, -4));
  }
  const arc = new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), lineMat(0xFFAA00));
  arc.userData.isOverlay = true;
  scene.add(arc); objs.push(arc);

  // 90° label
  const sp = makeLabel('90°', 'rgba(0,60,60,0.8)', '#00FFFF');
  sp.position.set(6.8, 0.5, 6.8);
  sp.scale.set(4, 1, 1);
  scene.add(sp); objs.push(sp);

  return objs;
}

function buildSymmetryOverlays(scene) {
  const objs = [];

  const axis = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 20, 0)]),
    lineMat(0xFF66FF),
  );
  axis.userData.isOverlay = true;
  scene.add(axis); objs.push(axis);

  const hLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-9, 2.1, 0), new THREE.Vector3(9, 2.1, 0)]),
    lineMat(0x66FFFF),
  );
  const vLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 2.1, -9), new THREE.Vector3(0, 2.1, 9)]),
    lineMat(0x66FFFF),
  );
  hLine.userData.isOverlay = true;
  vLine.userData.isOverlay = true;
  scene.add(hLine, vLine);
  objs.push(hLine, vLine);

  const sp = makeLabel('4-fold symmetry', 'rgba(40,0,60,0.85)', '#FF66FF');
  sp.position.set(0, 3.5, 0);
  sp.scale.set(7, 1.4, 1);
  scene.add(sp); objs.push(sp);

  return objs;
}

function buildProportionOverlays(scene) {
  const objs = [];

  const pts = [new THREE.Vector3(-6, 0, -4), new THREE.Vector3(0, 17.3, -4)];
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0xFFFF00));
  line.userData.isOverlay = true;
  scene.add(line); objs.push(line);

  const baseLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6, 0.2, 0), new THREE.Vector3(6, 0.2, 0)]),
    lineMat(0xFFFF00),
  );
  baseLine.userData.isOverlay = true;
  scene.add(baseLine); objs.push(baseLine);

  const sp = makeLabel('H/W ≈ 1.44', 'rgba(60,60,0,0.85)', '#FFFF00');
  sp.position.set(-4, 9, -4);
  sp.scale.set(5.5, 1.2, 1);
  scene.add(sp); objs.push(sp);

  return objs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function TempleModel({
  onPartSelect,
  selectedPartId,
  decomposed = false,
  showAngles = false,
  showSymmetry = false,
  showProportions = false,
  showMeasurements = true,
  activeStyle = 'gopuram',
  challengePartId = null,
}) {
  const { addObject, removeObject, addRenderCallback, refs, mode } = useARContext();

  const stateRef = useRef({
    templeGroup: null,
    parts: {},
    meshToPart: new Map(),
    originalPositions: {},
    spreadPositions: {},
    currentlyDecomposed: false,
    overlayObjects: [],
    measurementObjects: [],
    groundObjects: [],
    sceneLights: [],
    pulseTime: 0,
    raycaster: new THREE.Raycaster(),
    pointer: new THREE.Vector2(),
  });

  // ── Build temple + scene ────────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    s.parts = {};
    s.meshToPart = new Map();
    s.originalPositions = {};
    s.spreadPositions = {};
    s.currentlyDecomposed = false;

    const group = new THREE.Group();
    group.name = 'templeRoot';

    if (activeStyle === 'indo_islamic') buildIndoIslamic(group, s);
    else if (activeStyle === 'shikhara') buildNagara(group, s);
    else buildGopuram(group, s);

    s.templeGroup = group;

    Object.entries(s.parts).forEach(([, pg]) => {
      s.originalPositions[pg.userData.partId] = pg.position.clone();
    });
    // use part ids from keys
    Object.entries(s.parts).forEach(([id, pg]) => {
      s.originalPositions[id] = pg.position.clone();
    });
    s.spreadPositions = buildSpreadPositions(Object.keys(s.parts));

    addObject(group);

    // Setup scene extras (ground, lights) directly on the Three.js scene
    const scene = refs.current.scene;
    if (scene) {
      // Only set opaque background/fog in non-AR mode; AR mode needs transparency
      if (mode !== 'ar') {
        scene.background = new THREE.Color(0x0d0a06);
        scene.fog = new THREE.FogExp2(0x0d0a06, 0.012);
      }

      // Ground
      s.groundObjects = buildGround(scene);

      // Scene-wide lights (supplement the per-temple lights in each builder)
      s.sceneLights = setupSceneLighting(scene);

      // Measurements
      if (showMeasurements) {
        s.measurementObjects = buildMeasurementLabels(scene, activeStyle);
      }
    }

    // Reposition camera + OrbitControls target to the temple centre.
    // OrbitControls is set up asynchronously (after camera permission prompt),
    // so we retry at multiple intervals until controls are available.
    function positionCamera() {
      const camera   = refs.current.camera;
      const controls = refs.current.controls;
      if (camera && mode !== 'ar') {
        // Pull back further to frame the taller temple (tower ~22 m, porch z≈10)
        camera.position.set(26, 18, 40);
        camera.lookAt(TEMPLE_CENTER);
      }
      if (controls) {
        controls.target.copy(TEMPLE_CENTER);
        controls.minDistance = 5;
        controls.maxDistance = 150;
        controls.update();
      }
    }
    const tid  = setTimeout(positionCamera,  80);
    const tid2 = setTimeout(positionCamera, 600);
    const tid3 = setTimeout(positionCamera, 1600);

    return () => {
      clearTimeout(tid); clearTimeout(tid2); clearTimeout(tid3);
      removeObject(group);
      disposeGroup(group);
      s.templeGroup = null;

      // Clean up scene extras
      const sc = refs.current.scene;
      if (sc) {
        [...s.groundObjects, ...s.sceneLights, ...s.measurementObjects].forEach(o => {
          sc.remove(o);
          disposeGroup(o);
        });
        s.groundObjects = [];
        s.sceneLights = [];
        s.measurementObjects = [];
        sc.fog = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStyle]);

  // ── Toggle measurement labels ───────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    const scene = refs.current.scene;
    if (!scene) return;

    s.measurementObjects.forEach(o => { scene.remove(o); disposeGroup(o); });
    s.measurementObjects = [];

    if (showMeasurements) {
      s.measurementObjects = buildMeasurementLabels(scene, activeStyle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMeasurements, activeStyle]);

  // ── Highlight selected part ─────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    Object.values(s.parts).forEach(g => setHighlight(g, false));
    if (selectedPartId && s.parts[selectedPartId]) {
      setHighlight(s.parts[selectedPartId], true);
    }
  }, [selectedPartId]);

  // ── Decompose / reassemble ──────────────────────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    if (!s.templeGroup) return;
    const camera   = refs.current.camera;
    const controls = refs.current.controls;

    if (decomposed && !s.currentlyDecomposed) {
      s.currentlyDecomposed = true;
      const from = Object.fromEntries(Object.entries(s.parts).map(([id, g]) => [id, g.position.clone()]));
      animateParts(s.parts, from, s.spreadPositions, 1800);
      // Zoom camera out so all grid-spread parts are in view
      if (mode !== 'ar') {
        animateCamera(camera, controls,
          new THREE.Vector3(0, 24, 80),
          new THREE.Vector3(0, 16, 6),
        );
      }
    } else if (!decomposed && s.currentlyDecomposed) {
      s.currentlyDecomposed = false;
      const from = Object.fromEntries(Object.entries(s.parts).map(([id, g]) => [id, g.position.clone()]));
      animateParts(s.parts, from, s.originalPositions, 1800);
      // Return camera to temple view
      if (mode !== 'ar') {
        animateCamera(camera, controls,
          new THREE.Vector3(26, 18, 40),
          TEMPLE_CENTER.clone(),
        );
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decomposed, mode]);

  // ── Angle / symmetry / proportion overlays ──────────────────────────────────
  useEffect(() => {
    const s = stateRef.current;
    const scene = refs.current.scene;
    if (!scene) return;

    s.overlayObjects.forEach(o => { scene.remove(o); disposeGroup(o); });
    s.overlayObjects = [];

    if (showAngles)      s.overlayObjects.push(...buildAngleOverlays(scene));
    if (showSymmetry)    s.overlayObjects.push(...buildSymmetryOverlays(scene));
    if (showProportions) s.overlayObjects.push(...buildProportionOverlays(scene));

    return () => {
      s.overlayObjects.forEach(o => { scene.remove(o); disposeGroup(o); });
      s.overlayObjects = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAngles, showSymmetry, showProportions]);

  // ── Challenge part pulsing ──────────────────────────────────────────────────
  useEffect(() => {
    if (!challengePartId) return;
    const cleanup = addRenderCallback(() => {
      const s = stateRef.current;
      const pg = s.parts[challengePartId];
      if (!pg) return;
      s.pulseTime += 0.05;
      pg.traverse(child => {
        if (child.isMesh && child.material && !child.userData.isOverlay) {
          child.material.emissive = new THREE.Color(0xFF8C00);
          child.material.emissiveIntensity = 0.3 + 0.3 * Math.sin(s.pulseTime);
        }
      });
    });
    return () => {
      cleanup();
      const s = stateRef.current;
      if (s.parts[challengePartId]) {
        setHighlight(s.parts[challengePartId], challengePartId === selectedPartId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengePartId]);

  // ── Pointer / touch raycasting ──────────────────────────────────────────────
  useEffect(() => {
    function onPointer(e) {
      if (e.button !== undefined && e.button !== 0) return; // left click only
      const c = refs.current.renderer?.domElement;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      const s = stateRef.current;
      s.pointer.set(
        ((cx - rect.left) / rect.width) * 2 - 1,
        -((cy - rect.top) / rect.height) * 2 + 1,
      );
      const camera = refs.current.camera;
      if (!camera || !s.templeGroup) return;
      s.raycaster.setFromCamera(s.pointer, camera);
      const meshes = [];
      s.templeGroup.traverse(child => { if (child.isMesh && !child.userData.isOverlay) meshes.push(child); });
      const hits = s.raycaster.intersectObjects(meshes, false);
      onPartSelect?.(hits.length > 0 ? (s.meshToPart.get(hits[0].object.uuid) ?? null) : null);
    }

    // Attach once the renderer canvas is available; retry if not yet ready
    let detach = null;
    function attach() {
      const c = refs.current.renderer?.domElement;
      if (!c) return;
      c.addEventListener('pointerdown', onPointer);
      detach = () => c.removeEventListener('pointerdown', onPointer);
    }

    attach();
    // Renderer initialises asynchronously — retry in case it wasn't ready above
    const tid = setTimeout(attach, 600);

    return () => {
      clearTimeout(tid);
      detach?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPartSelect]);

  return null;
}
