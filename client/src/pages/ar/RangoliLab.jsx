/**
 * RangoliLab.jsx
 * Full-screen AR page for the Rangoli & Kolam Symmetry Lab.
 *
 * Layout:
 *   ARScene (camera + Three.js canvas)
 *   └─ RangoliLabInner (all UI + Three.js sub-components)
 *       ├─ RangoliCanvas    (Three.js dot grid + drawing engine)
 *       ├─ CoordinateOverlay (Three.js X-Y grid)
 *       ├─ Top bar          (title, back, hints)
 *       ├─ Left toolbar     (SymmetryTools)
 *       ├─ Bottom tabs      (Challenges / Library / Free Draw)
 *       ├─ RangoliChallenges (bottom panel)
 *       └─ PatternLibrary   (bottom panel)
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ARScene from '../../components/ar/ARScene';
import RangoliCanvas from '../../components/modules/rangoli/RangoliCanvas';
import SymmetryTools from '../../components/modules/rangoli/SymmetryTools';
import RangoliChallenges from '../../components/modules/rangoli/RangoliChallenges';
import CoordinateOverlay from '../../components/modules/rangoli/CoordinateOverlay';
import PatternLibrary from '../../components/modules/rangoli/PatternLibrary';

// Bottom tab definitions
const TABS = [
  { id: 'draw',       label: 'Draw',      icon: '✏️' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
  { id: 'library',    label: 'Patterns',  icon: '🌸' },
];

// ─────────────────────────────────────────────────────────────────────────────
function RangoliLabInner() {
  const navigate = useNavigate();

  // Bottom tab
  const [activeTab, setActiveTab]         = useState('draw');

  // Symmetry tool config (passed to both SymmetryTools UI and RangoliCanvas)
  const [symConfig, setSymConfig] = useState({
    mode: 'none',
    axisType: 'vertical',
    rotationOrder: 4,
    isKolam: false,
    drawColor: '#FF6B35',
  });

  // Coordinate overlay toggle
  const [showCoords,    setShowCoords]    = useState(false);

  // Loaded pattern (from PatternLibrary)
  const [loadedPaths,   setLoadedPaths]   = useState(null);

  // Challenge state
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [earnedKarma,    setEarnedKarma]    = useState(0);
  const [completedIds,   setCompletedIds]   = useState(new Set());

  // Rotate hint auto-hide
  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // ── Callbacks ──────────────────────────────────────────────────────────────
  const handleKarmaEarn = useCallback((id, karma) => {
    if (!completedIds.has(id)) {
      setCompletedIds(prev => new Set(prev).add(id));
      setEarnedKarma(prev => prev + karma);
    }
  }, [completedIds]);

  const handlePatternLoad = useCallback((paths, colors) => {
    setLoadedPaths(paths);
    setActiveTab('draw');
    // Auto-set to kolam style if white
    if (colors?.[0] === '#FFFFFF') {
      setSymConfig(c => ({ ...c, isKolam: true, drawColor: '#FFFFFF' }));
    }
  }, []);

  const handleClear = useCallback(() => {
    setLoadedPaths(null);
    // Changing isKolam key forces RangoliCanvas to remount
    setSymConfig(c => ({ ...c }));
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Three.js canvas components ──────────────────────────────────────── */}
      <RangoliCanvas
        key={symConfig.isKolam ? 'kolam' : 'rangoli'}
        symmetryMode={symConfig.mode}
        axisType={symConfig.axisType}
        rotationOrder={symConfig.rotationOrder}
        isKolam={symConfig.isKolam}
        drawColor={symConfig.drawColor}
        showCoords={showCoords}
        loadedPaths={loadedPaths}
      />

      <CoordinateOverlay show={showCoords} onToggle={() => setShowCoords(v => !v)} />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,107,0,0.25)',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,107,0,0.18)', border: '1px solid rgba(255,107,0,0.35)',
            borderRadius: 8, color: '#FF8C3A', padding: '6px 12px', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          ← Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>
            Rangoli & Kolam Symmetry Lab
          </div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            {symConfig.mode === 'reflect'   ? `Reflect — ${symConfig.axisType} axis` :
             symConfig.mode === 'rotate'    ? `${symConfig.rotationOrder}-fold rotation (${(360/symConfig.rotationOrder).toFixed(0)}°)` :
             symConfig.mode === 'translate' ? 'Tessellation mode' :
             'Free draw'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {/* Karma display */}
          <div style={{
            background: 'rgba(212,160,23,0.15)', border: '1px solid rgba(212,160,23,0.3)',
            borderRadius: 8, padding: '4px 10px', textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(212,160,23,0.6)', fontSize: 9 }}>Karma</div>
            <div style={{ color: '#D4A017', fontWeight: 700, fontSize: 13 }}>{earnedKarma}</div>
          </div>
        </div>
      </div>

      {/* ── Left toolbar: Symmetry Tools ──────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 55,
          left: 0,
          bottom: 55,
          zIndex: 28,
        }}
      >
        <SymmetryTools
          config={symConfig}
          onConfigChange={setSymConfig}
          onClear={handleClear}
        />
      </div>

      {/* ── Rotate hint ───────────────────────────────────────────────────────── */}
      {showHint && (
        <div
          style={{
            position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, background: 'rgba(0,0,0,0.60)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,107,0,0.35)', borderRadius: 20,
            padding: '7px 18px', color: 'rgba(255,220,160,0.85)', fontSize: 12,
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}
        >
          🖱️ Drag to rotate · Tap dots to draw lines
        </div>
      )}

      {/* ── Bottom tab bar ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex',
          background: 'rgba(6,3,0,0.92)', backdropFilter: 'blur(16px)',
          borderTop: '1.5px solid rgba(255,107,0,0.3)',
        }}
      >
        {TABS.map(t => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(active ? 'draw' : t.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 3, padding: '8px 2px 10px',
                background: active ? 'rgba(255,107,0,0.18)' : 'transparent',
                border: 'none', borderTop: active ? '2px solid #FF6B00' : '2px solid transparent',
                cursor: 'pointer',
                color: active ? '#FF8C3A' : 'rgba(255,200,140,0.55)',
                fontSize: 10, fontWeight: active ? 700 : 400, transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 17 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Bottom panels ─────────────────────────────────────────────────────── */}

      {activeTab === 'challenges' && (
        <RangoliChallenges
          currentIndex={challengeIndex}
          onIndexChange={setChallengeIndex}
          earnedKarma={earnedKarma}
          onKarmaEarn={handleKarmaEarn}
          onClose={() => setActiveTab('draw')}
          symmetryConfig={symConfig}
        />
      )}

      {activeTab === 'library' && (
        <PatternLibrary
          onLoad={handlePatternLoad}
          onClose={() => setActiveTab('draw')}
        />
      )}
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function RangoliLab() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ARScene>
        <RangoliLabInner />
      </ARScene>
    </div>
  );
}
