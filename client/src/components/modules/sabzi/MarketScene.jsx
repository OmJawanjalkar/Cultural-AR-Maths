/**
 * MarketScene.jsx
 * Procedural Three.js vegetable market stall.
 * Built entirely from Three.js primitives; all objects properly cleaned up on unmount.
 *
 * Props:
 *   prices          { [vegId]: number }  — today's prices
 *   activeChallengeQuestion  string | null
 *   onVegClick      (vegId) => void
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useARContext } from '../../ar/ARScene';
import { VEGETABLES } from '../../../data/sabziData';

// ─── Material helpers ─────────────────────────────────────────────────────────
const m = (color, roughness = 0.7, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function disposeGroup(obj) {
  if (!obj) return;
  obj.traverse(child => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) {
      child.material.forEach(mat => { mat.map?.dispose(); mat.dispose(); });
    } else {
      child.material?.map?.dispose();
      child.material?.dispose();
    }
  });
}

// ─── Canvas sprite helper ─────────────────────────────────────────────────────
function makeSprite(lines, bgColor = 'rgba(20,10,0,0.85)', textColor = '#FFD700') {
  const W = 256, H = 80 + (lines.length - 1) * 28;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background pill
  ctx.beginPath();
  ctx.roundRect(4, 4, W - 8, H - 8, 10);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,107,0,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  lines.forEach((line, i) => {
    ctx.font = `bold ${i === 0 ? 22 : 18}px Arial, sans-serif`;
    ctx.fillStyle = i === 0 ? textColor : 'rgba(255,220,160,0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(line, W / 2, 30 + i * 28);
  });

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
  const sprite = new THREE.Sprite(mat);
  const aspect = W / H;
  sprite.scale.set(aspect * 0.45, 0.45, 1);
  return sprite;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MarketScene({ prices = {}, activeChallengeQuestion, onVegClick }) {
  const { refs, mode } = useARContext();
  const groupRef    = useRef(null);
  const vegMeshes   = useRef([]);
  const shopSprite  = useRef(null);
  const rafId       = useRef(null);

  useEffect(() => {
    const { scene } = refs.current;
    if (!scene) return;

    const root = new THREE.Group();
    groupRef.current = root;
    scene.add(root);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const hemi = new THREE.HemisphereLight(0xFFF5E0, 0x303010, 0.8);
    root.add(hemi);
    const sun = new THREE.DirectionalLight(0xFFEAC8, 1.2);
    sun.position.set(3, 8, 5);
    sun.castShadow = true;
    root.add(sun);

    // ── Ground ────────────────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(8, 8);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xC8A87A, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    root.add(ground);

    // ── Stall Frame (4 wooden posts + cross beams) ────────────────────────────
    const woodMat = m(0x6B3A1F, 0.85);
    const postGeo = new THREE.CylinderGeometry(0.05, 0.06, 2.2, 8);

    const postPositions = [[-1.2, 1.1, -0.6], [1.2, 1.1, -0.6], [-1.2, 1.1, 0.6], [1.2, 1.1, 0.6]];
    postPositions.forEach(([x, y, z]) => {
      const post = new THREE.Mesh(postGeo, woodMat);
      post.position.set(x, y, z);
      post.castShadow = true;
      root.add(post);
    });

    // Top beams
    const beamGeo = new THREE.BoxGeometry(2.5, 0.07, 0.07);
    [[-0.6], [0.6]].forEach(([z]) => {
      const beam = new THREE.Mesh(beamGeo, woodMat);
      beam.position.set(0, 2.2, z);
      root.add(beam);
    });
    const sideBeamGeo = new THREE.BoxGeometry(0.07, 0.07, 1.3);
    [[-1.2], [1.2]].forEach(([x]) => {
      const sb = new THREE.Mesh(sideBeamGeo, woodMat);
      sb.position.set(x, 2.2, 0);
      root.add(sb);
    });

    // ── Cloth Roof (saffron) ──────────────────────────────────────────────────
    const roofGeo = new THREE.PlaneGeometry(2.6, 1.4);
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xFF8C00,
      side: THREE.DoubleSide,
      roughness: 0.8,
    });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.position.set(0, 2.22, 0);
    roof.receiveShadow = true;
    root.add(roof);

    // ── Counter table ─────────────────────────────────────────────────────────
    const tableTopGeo = new THREE.BoxGeometry(2.6, 0.06, 1.0);
    const tableTopMat = m(0x8B5E3C, 0.75);
    const tableTop = new THREE.Mesh(tableTopGeo, tableTopMat);
    tableTop.position.set(0, 0.85, 0);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    root.add(tableTop);

    const legGeo = new THREE.BoxGeometry(0.05, 0.85, 0.05);
    [[- 1.25, 0, -0.45], [1.25, 0, -0.45], [-1.25, 0, 0.45], [1.25, 0, 0.45]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(x, y + 0.425, z);
      root.add(leg);
    });

    // ── Vegetable Baskets ─────────────────────────────────────────────────────
    const basketMat = m(0xD2A679, 0.9);
    const vegMeshArr = [];

    VEGETABLES.forEach((veg, i) => {
      const bx = -1.1 + i * 0.56;
      const by = 0.89;
      const bz = 0;

      // Basket (flat cylinder)
      const basketGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.12, 16);
      const basket = new THREE.Mesh(basketGeo, basketMat.clone());
      basket.position.set(bx, by, bz);
      basket.castShadow = true;
      root.add(basket);

      // Basket edge ring
      const ringGeo = new THREE.TorusGeometry(0.18, 0.015, 6, 24);
      const ring = new THREE.Mesh(ringGeo, m(0xA0724A));
      ring.rotation.x = Math.PI / 2;
      ring.position.set(bx, by + 0.06, bz);
      root.add(ring);

      // Vegetables inside the basket
      const vegMat = new THREE.MeshStandardMaterial({ color: veg.color, roughness: 0.65 });
      const vegGroup = new THREE.Group();
      vegGroup.position.set(bx, by + 0.1, bz);
      vegGroup.userData = { vegId: veg.id, isVeg: true };

      for (let j = 0; j < 6; j++) {
        let geo;
        const p = veg.geometryParams;
        if (veg.geometry === 'sphere') {
          geo = new THREE.SphereGeometry(p.radius, 10, 10);
        } else {
          geo = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 8);
        }
        const v = new THREE.Mesh(geo, vegMat);
        const angle = (j / 6) * Math.PI * 2;
        const r = 0.08;
        v.position.set(Math.cos(angle) * r, (j % 2) * 0.04, Math.sin(angle) * r);
        if (veg.geometry === 'cylinder') {
          v.rotation.z = Math.PI / 2 + (Math.random() - 0.5) * 0.4;
          v.rotation.y = angle;
        }
        vegGroup.add(v);
      }
      root.add(vegGroup);
      vegMeshArr.push(vegGroup);

      // Price tag sprite
      const price = prices[veg.id] ?? veg.basePrice;
      const sprite = makeSprite([
        `${veg.emoji} ${veg.name}`,
        `₹${price}/kg`,
      ]);
      sprite.position.set(bx, by + 0.38, bz);
      root.add(sprite);
    });

    vegMeshes.current = vegMeshArr;

    // ── Weighing Scale (Tarazu) ───────────────────────────────────────────────
    const scaleMat = m(0xC0A060, 0.4, 0.6);

    // Base stand
    const standGeo = new THREE.CylinderGeometry(0.06, 0.10, 0.35, 12);
    const stand = new THREE.Mesh(standGeo, scaleMat);
    stand.position.set(1.5, 0.18, -0.2);
    root.add(stand);

    // Beam
    const beamScaleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8);
    const scaleBeam = new THREE.Mesh(beamScaleGeo, scaleMat);
    scaleBeam.rotation.z = Math.PI / 2;
    scaleBeam.position.set(1.5, 0.55, -0.2);
    root.add(scaleBeam);

    // Two pans (flat cylinders on strings)
    const panGeo  = new THREE.CylinderGeometry(0.13, 0.10, 0.03, 16);
    const panMat  = scaleMat.clone();

    const panL = new THREE.Mesh(panGeo, panMat);
    panL.position.set(1.15, 0.38, -0.2);
    root.add(panL);

    const panR = new THREE.Mesh(panGeo, panMat.clone());
    panR.position.set(1.85, 0.38, -0.2);
    root.add(panR);

    // Strings (lines from beam ends to pans)
    [[1.15, 0.38, -0.2, 1.15, 0.55], [1.85, 0.38, -0.2, 1.85, 0.55]].forEach(
      ([x, y, z, bx2, by2]) => {
        const pts = [
          new THREE.Vector3(bx2, by2, z),
          new THREE.Vector3(x, y + 0.015, z),
        ];
        const geo2 = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo2, new THREE.LineBasicMaterial({ color: 0xAA8844 }));
        root.add(line);
      }
    );

    // ── Shopkeeper Character ──────────────────────────────────────────────────
    // Body (cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.16, 0.20, 0.55, 12);
    const bodyMat = m(0x3B5998, 0.7); // blue kurta
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(-1.6, 0.28, 0);
    body.castShadow = true;
    root.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.15, 14, 14);
    const headMat = m(0xDEB887, 0.5);
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(-1.6, 0.72, 0);
    head.castShadow = true;
    root.add(head);

    // Turban
    const turbanGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.1, 12);
    const turbanMat = m(0xCC3300, 0.8);
    const turban = new THREE.Mesh(turbanGeo, turbanMat);
    turban.position.set(-1.6, 0.87, 0);
    root.add(turban);

    // Speech bubble
    const question = activeChallengeQuestion ?? 'Welcome! What would you like to buy today?';
    const bubble = makeSprite(
      [question.slice(0, 30), question.length > 30 ? question.slice(30, 60) : ''],
      'rgba(255,250,220,0.95)',
      '#333333',
    );
    bubble.position.set(-1.4, 1.2, 0);
    bubble.scale.set(1.6, 0.7, 1);
    shopSprite.current = bubble;
    root.add(bubble);

    // ── Camera + OrbitControls target for the market scene ───────────────────
    // OrbitControls is set up asynchronously, so retry at intervals.
    function positionCamera() {
      const cam  = refs.current.camera;
      const ctrl = refs.current.controls;
      if (cam && mode !== 'ar') {
        cam.position.set(0, 2.5, 4);
        cam.lookAt(0, 0.8, 0);
      }
      if (ctrl) {
        ctrl.target.set(0, 0.8, 0);
        ctrl.minDistance = 1;
        ctrl.maxDistance = 20;
        ctrl.update();
      }
    }
    const pt1 = setTimeout(positionCamera,  80);
    const pt2 = setTimeout(positionCamera, 600);
    const pt3 = setTimeout(positionCamera, 1600);

    // ── Float animation for veg items (gentle bob) ───────────────────────────
    const t0 = performance.now();
    const animate = () => {
      const t = (performance.now() - t0) / 1000;
      vegMeshArr.forEach((vg, i) => {
        vg.position.y = 0.89 + 0.1 + Math.sin(t * 1.2 + i) * 0.012;
      });
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      clearTimeout(pt1); clearTimeout(pt2); clearTimeout(pt3);
      cancelAnimationFrame(rafId.current);
      scene.remove(root);
      disposeGroup(root);
      vegMeshes.current = [];
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update speech bubble when challenge changes
  useEffect(() => {
    if (!shopSprite.current) return;
    const q = activeChallengeQuestion ?? 'Welcome! What would you like to buy today?';
    // Rebuild the sprite texture
    const newSprite = makeSprite(
      [q.slice(0, 32), q.length > 32 ? q.slice(32, 64) : ''],
      'rgba(255,250,220,0.95)',
      '#333333',
    );
    shopSprite.current.material.map?.dispose();
    shopSprite.current.material.map = newSprite.material.map;
    shopSprite.current.material.needsUpdate = true;
    newSprite.material.dispose();
  }, [activeChallengeQuestion]);

  // Pointer interaction for veggie clicking
  useEffect(() => {
    const { renderer, camera } = refs.current;
    if (!renderer || !camera) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointer = (e) => {
      const canvas = renderer.domElement;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.x = ((clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      // Flatten veg group children
      const allMeshes = vegMeshes.current.flatMap(g => g.children);
      const hits = raycaster.intersectObjects(allMeshes, false);
      if (hits.length) {
        const hitGroup = hits[0].object.parent;
        if (hitGroup?.userData?.isVeg) {
          onVegClick?.(hitGroup.userData.vegId);
        }
      }
    };

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', onPointer);
    canvas.addEventListener('touchstart', onPointer, { passive: true });
    return () => {
      canvas.removeEventListener('pointerdown', onPointer);
      canvas.removeEventListener('touchstart', onPointer);
    };
  }, [refs, onVegClick]);

  return null;
}
