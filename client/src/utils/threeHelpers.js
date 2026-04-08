import * as THREE from 'three';

// ─── Cultural material palette ───────────────────────────────────────────────
// emissive is boosted so shapes remain visible even in dim / unlit conditions.
const MAT_DEFAULTS = {
  color: 0xFF6B00,
  emissive: 0x662200,     // warm self-glow — visible even without ambient light
  emissiveIntensity: 0.6,
  specular: 0xFFAA44,
  shininess: 60,
  transparent: true,
  opacity: 0.93,
};

function culturalMaterial(overrides = {}) {
  return new THREE.MeshPhongMaterial({ ...MAT_DEFAULTS, ...overrides });
}

// ─── Shape creation ───────────────────────────────────────────────────────────
const SHAPE_DEFAULTS = {
  radius: 5, height: 10, width: 10, depth: 10,
  radiusTop: 5, radiusBottom: 5,
  outerRadius: 5, tube: 2,
};

export function createShape(type, params = {}) {
  const p = { ...SHAPE_DEFAULTS, ...params };
  let geometry;

  switch (type) {
    case 'cube':
      geometry = new THREE.BoxGeometry(p.width, p.width, p.width, 2, 2, 2);
      break;
    case 'cuboid':
      geometry = new THREE.BoxGeometry(p.width, p.height, p.depth, 2, 2, 2);
      break;
    case 'sphere':
      geometry = new THREE.SphereGeometry(p.radius, 32, 32);
      break;
    case 'hemisphere':
      geometry = new THREE.SphereGeometry(p.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      break;
    case 'cone':
      geometry = new THREE.ConeGeometry(p.radius, p.height, 32, 1);
      break;
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 32, 1);
      break;
    case 'pyramid':
      geometry = new THREE.ConeGeometry(p.radius, p.height, 4, 1);
      break;
    case 'prism':
      geometry = new THREE.CylinderGeometry(p.radius, p.radius, p.height, 3, 1);
      break;
    case 'frustum':
      geometry = new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, 32, 1);
      break;
    case 'torus':
      geometry = new THREE.TorusGeometry(p.outerRadius, p.tube, 16, 48);
      break;
    default:
      geometry = new THREE.BoxGeometry(10, 10, 10, 2, 2, 2);
  }

  const mesh = new THREE.Mesh(geometry, culturalMaterial());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { shapeType: type, params: { ...p } };
  return mesh;
}

// ─── Wireframe overlay ────────────────────────────────────────────────────────
// Geometry is a NEW WireframeGeometry (safe to dispose independently).
export function createWireframe(mesh) {
  const geo = new THREE.WireframeGeometry(mesh.geometry);
  const mat = new THREE.LineBasicMaterial({ color: 0xFFDD00, transparent: true, opacity: 0.55 });
  const wf = new THREE.LineSegments(geo, mat);
  wf.userData.isWireframe = true;
  return wf;
}

// ─── Selection glow ───────────────────────────────────────────────────────────
// IMPORTANT: geometry is SHARED with the parent mesh (not cloned).
// Callers must NOT call glow.geometry.dispose() — dispose only glow.material.
export function createSelectionGlow(mesh) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xFF9900, transparent: true, opacity: 0.30, side: THREE.BackSide,
    depthWrite: false,
  });
  // Share geometry reference — do NOT clone, and do NOT dispose via this handle.
  const glow = new THREE.Mesh(mesh.geometry, mat);
  glow.scale.setScalar(1.10);
  glow.userData.isGlow = true;
  glow.userData.sharedGeometry = true; // sentinel: do not dispose geometry
  return glow;
}

// ─── Canvas-sprite label ──────────────────────────────────────────────────────
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function createLabel(text, position = new THREE.Vector3()) {
  const W = 512, H = 128;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  roundRectPath(ctx, 6, 6, W - 12, H - 12, 20);
  ctx.fillStyle = 'rgba(20, 8, 0, 0.80)';
  ctx.fill();
  ctx.strokeStyle = '#FF8C3A';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = 'bold 42px Arial, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  const tex = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
  sprite.position.copy(position);
  sprite.scale.set(10, 2.5, 1);
  sprite.userData.isLabel = true;
  return sprite;
}

// ─── Angle arc ────────────────────────────────────────────────────────────────
export function createAngleArc(vertex, ray1Dir, ray2Dir, arcRadius = 3) {
  const a1 = Math.atan2(ray1Dir.y, ray1Dir.x);
  const a2 = Math.atan2(ray2Dir.y, ray2Dir.x);
  const pts = [];
  for (let i = 0; i <= 32; i++) {
    const a = a1 + ((a2 - a1) * i) / 32;
    pts.push(new THREE.Vector3(
      vertex.x + Math.cos(a) * arcRadius,
      vertex.y + Math.sin(a) * arcRadius,
      vertex.z,
    ));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xD4A017, linewidth: 2 }));
}

// ─── Animations ───────────────────────────────────────────────────────────────
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function animateExplode(group, duration = 900) {
  const meshes = group.children.filter(c => c.isMesh);
  const starts = meshes.map(m => m.position.clone());
  const ends = meshes.map(m => {
    let dir = m.position.clone();
    if (dir.length() < 0.1) dir.set(Math.random() - 0.5, 1, Math.random() - 0.5);
    return dir.normalize().multiplyScalar(18);
  });
  const t0 = performance.now();
  (function tick() {
    const t = Math.min((performance.now() - t0) / duration, 1);
    meshes.forEach((m, i) => m.position.lerpVectors(starts[i], ends[i], easeInOut(t)));
    if (t < 1) requestAnimationFrame(tick);
  })();
}

export function animateAssemble(group, duration = 900) {
  const meshes = group.children.filter(c => c.isMesh);
  const starts = meshes.map(m => m.position.clone());
  const ends = meshes.map(() => new THREE.Vector3());
  const t0 = performance.now();
  (function tick() {
    const t = Math.min((performance.now() - t0) / duration, 1);
    meshes.forEach((m, i) => m.position.lerpVectors(starts[i], ends[i], easeInOut(t)));
    if (t < 1) requestAnimationFrame(tick);
  })();
}

// ─── Measurement calculations ─────────────────────────────────────────────────
export function calculateMeasurements(type, params) {
  const p = params;
  const π = Math.PI;

  switch (type) {
    case 'cube': {
      const a = p.width ?? 10;
      return {
        surfaceArea: +(6 * a * a).toFixed(2),
        volume: +(a ** 3).toFixed(2),
        dimensions: { 'Side (a)': a },
        steps: {
          sa: [`SA = 6a²`, `SA = 6 × ${a}²`, `SA = 6 × ${(a*a)}`, `SA = ${(6*a*a).toFixed(2)} cm²`],
          vol: [`V = a³`, `V = ${a}³`, `V = ${(a**3).toFixed(2)} cm³`],
        },
      };
    }
    case 'cuboid': {
      const l = p.width ?? 10, h = p.height ?? 8, d = p.depth ?? 6;
      const sa = 2*(l*h + h*d + d*l);
      return {
        surfaceArea: +sa.toFixed(2),
        volume: +(l*h*d).toFixed(2),
        dimensions: { 'Length (l)': l, 'Height (h)': h, 'Depth (d)': d },
        steps: {
          sa: [`SA = 2(lh + hd + dl)`, `SA = 2(${l}×${h} + ${h}×${d} + ${d}×${l})`, `SA = 2(${l*h + h*d + d*l})`, `SA = ${sa.toFixed(2)} cm²`],
          vol: [`V = l × h × d`, `V = ${l} × ${h} × ${d}`, `V = ${(l*h*d).toFixed(2)} cm³`],
        },
      };
    }
    case 'sphere': {
      const r = p.radius ?? 5;
      return {
        surfaceArea: +(4*π*r*r).toFixed(2),
        volume: +((4/3)*π*r**3).toFixed(2),
        dimensions: { 'Radius (r)': r },
        steps: {
          sa: [`SA = 4πr²`, `SA = 4π × ${r}²`, `SA = 4π × ${r*r}`, `SA = ${(4*π*r*r).toFixed(2)} cm²`],
          vol: [`V = (4/3)πr³`, `V = (4/3)π × ${r}³`, `V = (4/3) × ${(π*r**3).toFixed(2)}`, `V = ${((4/3)*π*r**3).toFixed(2)} cm³`],
        },
      };
    }
    case 'hemisphere': {
      const r = p.radius ?? 5;
      return {
        surfaceArea: +(3*π*r*r).toFixed(2),
        volume: +((2/3)*π*r**3).toFixed(2),
        dimensions: { 'Radius (r)': r },
        steps: {
          sa: [`SA = 3πr² (curved + base)`, `SA = 3π × ${r}²`, `SA = ${(3*π*r*r).toFixed(2)} cm²`],
          vol: [`V = (2/3)πr³`, `V = (2/3)π × ${r}³`, `V = ${((2/3)*π*r**3).toFixed(2)} cm³`],
        },
      };
    }
    case 'cone': {
      const r = p.radius ?? 5, h = p.height ?? 10;
      const l = Math.sqrt(r*r + h*h);
      return {
        surfaceArea: +(π*r*(r+l)).toFixed(2),
        volume: +((1/3)*π*r*r*h).toFixed(2),
        dimensions: { 'Radius (r)': r, 'Height (h)': h, 'Slant (l)': +l.toFixed(2) },
        steps: {
          sa: [`SA = πr(r + l)`, `l = √(r² + h²) = √(${r*r} + ${h*h}) = ${l.toFixed(2)}`, `SA = π × ${r} × (${r} + ${l.toFixed(2)})`, `SA = ${(π*r*(r+l)).toFixed(2)} cm²`],
          vol: [`V = (1/3)πr²h`, `V = (1/3)π × ${r}² × ${h}`, `V = (1/3) × π × ${r*r} × ${h}`, `V = ${((1/3)*π*r*r*h).toFixed(2)} cm³`],
        },
      };
    }
    case 'cylinder': {
      const r = p.radiusTop ?? p.radius ?? 5, h = p.height ?? 10;
      return {
        surfaceArea: +(2*π*r*(r+h)).toFixed(2),
        volume: +(π*r*r*h).toFixed(2),
        dimensions: { 'Radius (r)': r, 'Height (h)': h },
        steps: {
          sa: [`SA = 2πr(r + h)`, `SA = 2π × ${r} × (${r} + ${h})`, `SA = 2π × ${r} × ${r+h}`, `SA = ${(2*π*r*(r+h)).toFixed(2)} cm²`],
          vol: [`V = πr²h`, `V = π × ${r}² × ${h}`, `V = π × ${r*r} × ${h}`, `V = ${(π*r*r*h).toFixed(2)} cm³`],
        },
      };
    }
    case 'pyramid': {
      const r = p.radius ?? 5, h = p.height ?? 10;
      const a = r * Math.SQRT2;
      const sl = Math.sqrt(h*h + (a/2)**2);
      const sa = a*a + 2*a*sl;
      return {
        surfaceArea: +sa.toFixed(2),
        volume: +((1/3)*a*a*h).toFixed(2),
        dimensions: { 'Base side (a)': +a.toFixed(2), 'Height (h)': h },
        steps: {
          sa: [`SA = a² + 2al (base + 4 triangles)`, `a = ${a.toFixed(2)}, slant = ${sl.toFixed(2)}`, `SA = ${(a*a).toFixed(2)} + ${(2*a*sl).toFixed(2)}`, `SA = ${sa.toFixed(2)} cm²`],
          vol: [`V = (1/3)a²h`, `V = (1/3) × ${a.toFixed(2)}² × ${h}`, `V = ${((1/3)*a*a*h).toFixed(2)} cm³`],
        },
      };
    }
    case 'prism': {
      const r = p.radius ?? 5, h = p.height ?? 10;
      const a = r * Math.sqrt(3);
      const triArea = (Math.sqrt(3)/4) * a * a;
      const sa = 2*triArea + 3*a*h;
      return {
        surfaceArea: +sa.toFixed(2),
        volume: +(triArea*h).toFixed(2),
        dimensions: { 'Triangle side (a)': +a.toFixed(2), 'Height (h)': h },
        steps: {
          sa: [`SA = 2×(√3/4)a² + 3ah`, `a = ${a.toFixed(2)}, base area = ${triArea.toFixed(2)}`, `SA = ${(2*triArea).toFixed(2)} + ${(3*a*h).toFixed(2)}`, `SA = ${sa.toFixed(2)} cm²`],
          vol: [`V = (√3/4)a²h`, `V = ${triArea.toFixed(2)} × ${h}`, `V = ${(triArea*h).toFixed(2)} cm³`],
        },
      };
    }
    case 'frustum': {
      const R = p.radiusBottom ?? 5, r = p.radiusTop ?? 2.5, h = p.height ?? 10;
      const sl = Math.sqrt(h*h + (R-r)**2);
      const sa = π*(R*R + r*r + (R+r)*sl);
      const vol = (π*h/3)*(R*R + r*r + R*r);
      return {
        surfaceArea: +sa.toFixed(2),
        volume: +vol.toFixed(2),
        dimensions: { 'Base radius (R)': R, 'Top radius (r)': r, 'Height (h)': h },
        steps: {
          sa: [`SA = π(R² + r² + (R+r)l)`, `l = √(h² + (R-r)²) = ${sl.toFixed(2)}`, `SA = π(${R*R} + ${r*r} + ${(R+r).toFixed(2)} × ${sl.toFixed(2)})`, `SA = ${sa.toFixed(2)} cm²`],
          vol: [`V = (πh/3)(R² + r² + Rr)`, `V = (π×${h}/3)(${R*R} + ${r*r} + ${R*r})`, `V = ${vol.toFixed(2)} cm³`],
        },
      };
    }
    case 'torus': {
      const R = p.outerRadius ?? 5, r = p.tube ?? 2;
      return {
        surfaceArea: +(4*π*π*R*r).toFixed(2),
        volume: +(2*π*π*R*r*r).toFixed(2),
        dimensions: { 'Major radius (R)': R, 'Tube radius (r)': r },
        steps: {
          sa: [`SA = 4π²Rr`, `SA = 4π² × ${R} × ${r}`, `SA = ${(4*π*π*R*r).toFixed(2)} cm²`],
          vol: [`V = 2π²Rr²`, `V = 2π² × ${R} × ${r}²`, `V = 2π² × ${R} × ${r*r}`, `V = ${(2*π*π*R*r*r).toFixed(2)} cm³`],
        },
      };
    }
    default:
      return { surfaceArea: 0, volume: 0, dimensions: {}, steps: { sa: [], vol: [] } };
  }
}

// ─── Cross-section geometry for slicing ──────────────────────────────────────
export function getCrossSection(type, params, sliceY) {
  // sliceY is -0.5..+0.5 (fraction of height from center)
  const p = params;
  switch (type) {
    case 'sphere': {
      const r = p.radius ?? 5;
      const y = sliceY * 2 * r;
      const cr = Math.sqrt(Math.max(0, r*r - y*y));
      return { shape: 'circle', radius: cr, area: +(Math.PI*cr*cr).toFixed(2) };
    }
    case 'hemisphere': {
      const r = p.radius ?? 5;
      const y = (sliceY + 0.5) * r;
      const cr = Math.sqrt(Math.max(0, r*r - y*y));
      return { shape: 'circle', radius: cr, area: +(Math.PI*cr*cr).toFixed(2) };
    }
    case 'cone': {
      const r = p.radius ?? 5;
      const frac = 0.5 - sliceY; // 0 at top, 1 at base
      const cr = r * frac;
      return { shape: 'circle', radius: cr, area: +(Math.PI*cr*cr).toFixed(2) };
    }
    case 'cylinder': {
      const r = p.radiusTop ?? p.radius ?? 5;
      return { shape: 'circle', radius: r, area: +(Math.PI*r*r).toFixed(2) };
    }
    case 'cube': {
      const a = p.width ?? 10;
      return { shape: 'square', side: a, area: +(a*a).toFixed(2) };
    }
    case 'cuboid': {
      const l = p.width ?? 10, d = p.depth ?? 6;
      return { shape: 'rectangle', width: l, depth: d, area: +(l*d).toFixed(2) };
    }
    case 'frustum': {
      const R = p.radiusBottom ?? 5, r = p.radiusTop ?? 2.5;
      const frac = 0.5 - sliceY; // 0 at top, 1 at base
      const cr = r + (R - r) * frac;
      return { shape: 'circle', radius: cr, area: +(Math.PI*cr*cr).toFixed(2) };
    }
    default:
      return { shape: 'unknown', area: 0 };
  }
}

// ─── Memory disposal ──────────────────────────────────────────────────────────
export function disposeObject(obj) {
  if (!obj) return;
  obj.traverse(child => {
    // Skip geometry disposal for glow meshes that share the parent mesh's geometry.
    // The shared geometry will be disposed when the parent mesh is processed.
    if (!child.userData.sharedGeometry) {
      child.geometry?.dispose();
    }
    if (Array.isArray(child.material)) {
      child.material.forEach(m => { m.map?.dispose(); m.dispose(); });
    } else if (child.material) {
      child.material.map?.dispose();
      child.material.dispose();
    }
  });
}
