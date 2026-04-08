import { createContext, useContext, useRef, useCallback, useEffect } from 'react';
import { useAR } from '../../hooks/useAR';

// ── Shared context ────────────────────────────────────────────────────────────
export const ARContext = createContext(null);
export const useARContext = () => {
  const ctx = useContext(ARContext);
  if (!ctx) throw new Error('useARContext must be used inside <ARScene>');
  return ctx;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function ARScene({ children, onModeChange }) {
  const canvasRef  = useRef(null);
  const videoRef   = useRef(null);
  const pipVideoRef = useRef(null);

  const arState = useAR({ canvasRef, videoRef });
  const { mode, isMarkerDetected, isCameraReady, initialized, cameraError } = arState;

  // Assign the live stream to the PiP <video> as soon as the camera is ready.
  // Both the full-screen video and the PiP reference the same MediaStream object —
  // browsers share the hardware decode, so there is no second camera capture.
  useEffect(() => {
    if (!isCameraReady || !pipVideoRef.current) return;
    const stream = arState.refs.current.stream;
    if (!stream) return;
    pipVideoRef.current.srcObject = stream;
    pipVideoRef.current.play().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraReady]);

  // Notify parent of mode changes
  useEffect(() => {
    onModeChange?.(mode);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Screenshot ──────────────────────────────────────────────────────────────
  const handleScreenshot = useCallback(() => {
    const { renderer, scene, camera } = arState.refs.current;
    if (!renderer) return;
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanskriti-ar-${Date.now()}.png`;
    a.click();
  }, [arState.refs]);

  return (
    <ARContext.Provider value={arState}>
      <div className="relative w-full h-full overflow-hidden bg-black">

        {/* Camera feed (visible behind transparent canvas in AR mode) */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ display: isCameraReady ? 'block' : 'none' }}
        />

        {/* Solid background for fallback/loading modes */}
        {!isCameraReady && (
          <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-zinc-900 to-stone-800" />
        )}

        {/* Three.js canvas – always on top with transparent background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ background: 'transparent' }}
        />

        {/* Camera error banner */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center px-6 py-5 rounded-2xl mx-4" style={{ background: 'rgba(30,0,0,0.90)', border: '1px solid rgba(255,80,80,0.5)' }}>
              <div className="text-4xl mb-3">📷</div>
              <p className="text-base font-semibold mb-1" style={{ color: '#FF8080' }}>Camera not available</p>
              <p className="text-sm" style={{ color: 'rgba(255,180,180,0.75)' }}>{cameraError}</p>
              <p className="text-xs mt-3" style={{ color: 'rgba(255,200,100,0.6)' }}>AR features require HTTPS. 3D mode is still available.</p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {!initialized && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="text-center text-white">
              <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-semibold text-orange-300">Initialising AR…</p>
              <p className="text-sm text-gray-400 mt-1">Requesting camera access</p>
            </div>
          </div>
        )}

        {/* "Point at marker" overlay – only in AR mode before detection */}
        {initialized && mode === 'ar' && !isMarkerDetected && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div
              className="text-center px-6 py-5 rounded-2xl border"
              style={{
                background: 'rgba(0,0,0,0.60)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,107,0,0.4)',
              }}
            >
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-lg font-semibold text-orange-300">Point your camera at the marker</p>
              <p className="text-sm text-gray-400 mt-1">
                Print the Hiro marker or visit{' '}
                <span className="text-orange-400">/markers/geometry-marker.html</span>
              </p>
            </div>
          </div>
        )}

        {/* Fallback viewer banner */}
        {initialized && mode === 'fallback' && (
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-medium z-10 pointer-events-none"
            style={{
              background: 'rgba(255,107,0,0.20)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,107,0,0.4)',
              color: '#FFD580',
            }}
          >
            AR not available — viewing in 3D mode
          </div>
        )}

        {/* AR active badge */}
        {initialized && mode === 'ar' && isMarkerDetected && (
          <div
            className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold z-10 pointer-events-none"
            style={{
              background: 'rgba(34,197,94,0.25)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(34,197,94,0.5)',
              color: '#86efac',
            }}
          >
            ● AR Active — marker detected
          </div>
        )}

        {/* Screenshot button */}
        {initialized && (
          <button
            onClick={handleScreenshot}
            title="Take Screenshot"
            className="absolute top-4 right-16 z-20 p-2 rounded-xl transition-colors"
            style={{
              background: 'rgba(0,0,0,0.50)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.20)',
              color: 'white',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        )}

        {/* ── PiP camera viewport ─────────────────────────────────────────── */}
        {isCameraReady && (
          <div
            className="absolute z-30"
            style={{
              bottom: 120,
              right: 12,
              width: 140,
              height: 100,
              borderRadius: 12,
              overflow: 'hidden',
              border: '2px solid rgba(255,107,0,0.75)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.55)',
            }}
          >
            <video
              ref={pipVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* LIVE badge */}
            <div style={{
              position: 'absolute', top: 5, left: 5,
              background: 'rgba(0,0,0,0.60)', borderRadius: 4,
              padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <div
                className="animate-pulse"
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }}
              />
              <span style={{ color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>LIVE</span>
            </div>
          </div>
        )}

        {/* UI overlay children */}
        {children}
      </div>
    </ARContext.Provider>
  );
}
