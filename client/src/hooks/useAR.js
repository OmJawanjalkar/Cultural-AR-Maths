import { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

export function useAR({ canvasRef, videoRef }) {
  const r = useRef({
    scene: null, camera: null, renderer: null,
    markerRoot: null, arSource: null, arContext: null,
    controls: null, animId: null, markerInterval: null,
    renderCallbacks: new Set(), stream: null,
  });

  const [mode,             setMode]             = useState('loading');
  const [isMarkerDetected, setIsMarkerDetected] = useState(false);
  const [isCameraReady,    setIsCameraReady]    = useState(false);
  const [initialized,      setInitialized]      = useState(false);
  const [cameraError,      setCameraError]      = useState(null);

  // ── Public API ──────────────────────────────────────────────────────────────
  const addObject = useCallback((obj) => {
    const target = r.current.markerRoot ?? r.current.scene;
    if (target) target.add(obj);
    else console.warn('[useAR] addObject called before scene is ready');
  }, []);

  const removeObject      = useCallback((obj) => { obj?.parent?.remove(obj); }, []);
  const addRenderCallback = useCallback((fn) => {
    r.current.renderCallbacks.add(fn);
    return () => r.current.renderCallbacks.delete(fn);
  }, []);
  const getRefs = useCallback(() => r.current, []);

  // ── Main effect ─────────────────────────────────────────────────────────────
  // NOTE: We intentionally do NOT use an initDoneRef guard here.
  // React 18 StrictMode mounts → cleans up → remounts every effect.
  // The `alive` flag in each closure ensures stale async callbacks from the
  // first mount bail out after cleanup, and the second mount starts fresh.
  useEffect(() => {
    let alive = true;   // ← guards all async continuations in THIS mount

    const canvas = canvasRef.current;
    if (!canvas) return; // should never happen (effect runs after render)

    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    // ── Three.js scene ──────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);   // solid dark bg for fallback

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 2000);
    // Start already looking at the temple centre so the first frame isn't blank
    camera.position.set(26, 18, 40);
    camera.lookAt(0, 11, -1);

    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true,
      alpha: true,                          // must be true so canvas turns transparent in AR mode
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H, false);          // false = don't override CSS size
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;

    // Lights – intensities scaled for Three.js physical-light mode (r155+)
    scene.add(new THREE.AmbientLight(0xfff0e0, 2.5));
    const sun = new THREE.DirectionalLight(0xffe8b0, 4.5);
    sun.position.set(25, 50, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.setScalar(1024);
    sun.shadow.camera.near   = 1;
    sun.shadow.camera.far    = 200;
    sun.shadow.camera.left   = sun.shadow.camera.bottom = -50;
    sun.shadow.camera.right  = sun.shadow.camera.top   =  50;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xffc0a0, 1.5);
    fill.position.set(-20, -10, 20);
    scene.add(fill);
    scene.add(new THREE.PointLight(0xff6b00, 1.1, 100));

    // Ground grid
    const grid = new THREE.GridHelper(120, 24, 0x334466, 0x1e2a3a);
    grid.position.y = -12;
    scene.add(grid);

    // Marker / content root – AR shapes live here
    const markerRoot = new THREE.Group();
    scene.add(markerRoot);

    // Publish to shared ref BEFORE any await so addObject() works immediately
    Object.assign(r.current, { scene, camera, renderer, markerRoot });

    // ── Resize ──────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      if (!alive) return;
      const w = canvas.clientWidth  || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });
    ro.observe(canvas);

    // ── Render loop ─────────────────────────────────────────────────────────
    function tick() {
      if (!alive) return;           // stop loop after cleanup
      r.current.animId = requestAnimationFrame(tick);
      r.current.controls?.update();
      const { arSource: src, arContext: ctx } = r.current;
      if (src && ctx) ctx.update(src.domElement);  // .ready is never set in AR.js 2.x
      r.current.renderCallbacks.forEach(fn => fn());
      renderer.render(scene, camera);
    }
    tick();

    // ── Async: camera → AR → OrbitControls ──────────────────────────────────
    (async () => {
      const camOk = await tryCamera(videoRef, r, setIsCameraReady, setCameraError);
      if (!alive) return;   // cleanup ran during getUserMedia → abort

      let arOk = false;
      if (camOk) {
        // Make the canvas transparent immediately so the video feed is visible
        // while AR.js loads from CDN (can take 1-3 s). Without this the opaque
        // scene background blocks the <video> element the entire time.
        scene.background = null;
        renderer.setClearColor(0x000000, 0);

        arOk = await tryAR(camera, markerRoot, r, setMode, setIsMarkerDetected, renderer);
        if (!alive) return;

        if (!arOk) {
          // AR.js failed — restore solid background for the fallback 3D viewer
          scene.background = new THREE.Color(0x0f172a);
          renderer.setClearColor(0x000000, 1);
        }
      }

      if (!arOk) {
        await tryOrbit(camera, canvas, r);
        if (!alive) return;
        setMode('fallback');
      }

      setInitialized(true);
    })();

    // ── Cleanup ─────────────────────────────────────────────────────────────
    // Runs when:
    //   a) React StrictMode tears down the first mount before remounting
    //   b) Component unmounts for real (navigation away)
    return () => {
      alive = false;                         // signal all async callbacks to stop
      cancelAnimationFrame(r.current.animId);
      clearInterval(r.current.markerInterval);
      ro.disconnect();
      r.current.controls?.dispose();
      renderer.dispose();
      r.current.stream?.getTracks().forEach(t => t.stop());

      // Null out refs so the next mount (StrictMode remount or real remount)
      // doesn't accidentally use stale / disposed objects.
      r.current.scene      = null;
      r.current.camera     = null;
      r.current.renderer   = null;
      r.current.markerRoot = null;
      r.current.controls   = null;
      r.current.stream     = null;
      r.current.arSource   = null;
      r.current.arContext  = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once per mount lifecycle

  return {
    refs: r, getRefs, mode,
    isMarkerDetected, isCameraReady, initialized, cameraError,
    addObject, removeObject, addRenderCallback,
  };
}

// ─── Helpers (outside hook so closures don't capture stale state) ─────────────

async function tryCamera(videoRef, r, setIsCameraReady, setCameraError) {
  if (!videoRef?.current) return false;
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraError('Camera API not available. Open the app over HTTPS to enable AR.');
    return false;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    r.current.stream = stream;
    videoRef.current.srcObject = stream;

    // Flip the order: make the video display:block BEFORE calling play().
    // Mobile browsers (especially Safari) silently reject play() on display:none elements.
    // setIsCameraReady schedules a React re-render; the metadata wait below gives the
    // browser enough time to process that re-render before play() is invoked.
    setIsCameraReady(true);

    // Wait for the video to have dimension metadata (skip wait if already loaded)
    if (videoRef.current.readyState < 1) {
      await new Promise(ok => {
        videoRef.current.addEventListener('loadedmetadata', ok, { once: true });
        setTimeout(ok, 3000);
      });
    }

    // play() may still be blocked by autoplay policy on some browsers;
    // the autoPlay attribute on the element acts as the fallback in that case.
    await videoRef.current.play().catch(err => {
      console.warn('[useAR] play() blocked by browser:', err.message);
    });

    return true;
  } catch (err) {
    console.warn('[useAR] Camera:', err.message);
    if (err.name === 'NotAllowedError') {
      setCameraError('Camera permission denied. Please allow camera access and reload.');
    } else if (err.name === 'NotFoundError') {
      setCameraError('No camera found on this device.');
    } else {
      setCameraError(`Camera unavailable: ${err.message}`);
    }
    return false;
  }
}

async function tryAR(camera, markerRoot, r, setMode, setIsMarkerDetected, renderer) {
  if (!window.THREEx?.ArToolkitSource) {
    try {
      await new Promise((res, rej) => {
        if (document.querySelector('[data-arjs]')) return res();
        const s = document.createElement('script');
        s.src = '/ar/ar-threex.js';  // served locally — no CDN dependency
        s.dataset.arjs = '1';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    } catch { return false; }
  }
  if (!window.THREEx?.ArToolkitSource) return false;

  try {
    const arSource = new window.THREEx.ArToolkitSource({ sourceType: 'webcam' });
    await new Promise((ok, fail) => arSource.init(ok, fail));

    // Move AR.js's injected <video> off-screen but keep it FULL SIZE (320×240).
    // 1×1 px caused mobile browsers to throttle/suspend the video decoder — ctx.update()
    // was drawing an empty frame and could never match the Hiro pattern.
    const arVideo = arSource.domElement;
    if (arVideo) {
      Object.assign(arVideo.style, {
        position: 'fixed', top: '-200vh', left: '-200vw',
        width: '320px', height: '240px',
        opacity: '0', pointerEvents: 'none',
      });
    }

    // Stop the front-camera stream AR.js opened during init (no facingMode constraint
    // means it grabbed the front camera on mobile). Leaving it running wastes CPU and
    // causes the rear-camera stream below to stutter.
    if (arVideo?.srcObject) {
      arVideo.srcObject.getTracks().forEach(t => t.stop());
    }

    // Replace with a clone of our rear-camera stream so AR.js processes the same feed
    // the user sees. clone() gives independent decode pipeline — no frame-grab stalls.
    if (arVideo && r.current.stream) {
      arVideo.srcObject = r.current.stream.clone();
      await arVideo.play().catch(() => {});
    }

    const arContext = new window.THREEx.ArToolkitContext({
      cameraParametersUrl: '/ar/camera_para.dat',  // served locally
      detectionMode: 'mono',
    });
    // Add a 10-second timeout — without it, a CDN failure for camera_para.dat causes
    // this Promise to hang forever, freezing the app on the loading spinner.
    await new Promise((ok, fail) => {
      const t = setTimeout(() => fail(new Error('arContext init timed out')), 10000);
      arContext.init(() => { clearTimeout(t); ok(); });
    });
    camera.projectionMatrix.copy(arContext.getProjectionMatrix());

    new window.THREEx.ArMarkerControls(arContext, markerRoot, {
      type: 'pattern',
      patternUrl: '/ar/patt.hiro',  // served locally
    });

    r.current.arSource  = arSource;
    r.current.arContext = arContext;

    // Transparent background so camera feed shows through canvas
    r.current.scene.background = null;
    renderer.setClearColor(0x000000, 0);

    let last = false;
    r.current.markerInterval = setInterval(() => {
      const vis = markerRoot.visible;
      if (vis !== last) { last = vis; setIsMarkerDetected(vis); }
    }, 100);

    setMode('ar');
    return true;
  } catch (err) {
    console.warn('[useAR] AR.js:', err.message);
    return false;
  }
}

async function tryOrbit(camera, canvas, r) {
  try {
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
    const ctrl = new OrbitControls(camera, canvas);
    ctrl.enableDamping  = true;
    ctrl.dampingFactor  = 0.08;
    ctrl.maxDistance    = 1000;
    ctrl.minDistance    = 1;
    // Generic origin target — each module's component overrides this via
    // its own positionCamera() call once the controls ref is populated.
    ctrl.target.set(0, 0, 0);
    r.current.controls = ctrl;
  } catch (e) {
    console.warn('[useAR] OrbitControls:', e.message);
  }
}
