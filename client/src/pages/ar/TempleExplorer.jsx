/**
 * TempleExplorer.jsx
 * Full-screen AR page for the Temple Architecture Math Explorer module.
 *
 * Layout:
 *   - ARScene wraps everything (provides Three.js canvas + camera feed)
 *   - TempleModel manages the 3D temple (returns null / pure Three.js)
 *   - Top bar: title + back button + utility icons
 *   - Bottom tab bar: primary mode switcher (always visible)
 *   - Bottom panel: context-aware content per mode
 */
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ARScene from '../../components/ar/ARScene';
import TempleModel from '../../components/modules/temple/TempleModel';
import TempleInfoCard from '../../components/modules/temple/TempleInfoCard';
import TempleChallenges from '../../components/modules/temple/TempleChallenges';
import DecomposeView from '../../components/modules/temple/DecomposeView';
import AngleOverlay from '../../components/modules/temple/AngleOverlay';
import StyleComparison from '../../components/modules/temple/StyleComparison';
import CulturalNotes from '../../components/modules/temple/CulturalNotes';
import { CHALLENGES } from '../../data/templeChallenges';

// ─── Mode definitions ─────────────────────────────────────────────────────────
const MODES = [
  { id: 'explore',    label: 'Explore',    icon: '🔍' },
  { id: 'decompose',  label: 'Decompose',  icon: '⬜' },
  { id: 'challenges', label: 'Challenges', icon: '🏆' },
  { id: 'angles',     label: 'Overlays',   icon: '∠'  },
  { id: 'compare',    label: 'Compare',    icon: '⚖️'  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Inner component — rendered inside ARScene so useARContext() is available
// ─────────────────────────────────────────────────────────────────────────────
function TempleExplorerInner() {
  const navigate = useNavigate();

  // Mode state
  const [activeMode, setActiveMode]         = useState('explore');
  const [modePanelOpen, setModePanelOpen]   = useState(false);

  // Rotate hint — auto-hides after 4 s on first load
  const [showRotateHint, setShowRotateHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowRotateHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Part selection
  const [selectedPartId, setSelectedPartId] = useState(null);

  // Decompose
  const [decomposed, setDecomposed]         = useState(false);

  // Overlay toggles
  const [showAngles, setShowAngles]         = useState(false);
  const [showSymmetry, setShowSymmetry]     = useState(false);
  const [showProportions, setShowProportions] = useState(false);

  // Temple style
  const [activeStyle, setActiveStyle]       = useState('gopuram');

  // Challenges
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [earnedKarma, setEarnedKarma]       = useState(0);
  const [completedIds, setCompletedIds]     = useState(new Set());

  // Measurements toggle
  const [showMeasurements, setShowMeasurements] = useState(true);

  // Cultural notes panel
  const [showNotes, setShowNotes]           = useState(false);

  // ── Callbacks ───────────────────────────────────────────────────────────────
  const handlePartSelect = useCallback((partId) => {
    setSelectedPartId(partId);
    if (partId && activeMode === 'explore') {
      // Ensure info card is visible
    }
  }, [activeMode]);

  const handleModeChange = useCallback((mode) => {
    setActiveMode(mode);
    setModePanelOpen(false);
    // Reset decompose when switching away
    if (mode !== 'decompose' && decomposed) setDecomposed(false);
    // Close info card when mode changes
    if (mode !== 'explore') setSelectedPartId(null);
  }, [decomposed]);

  const handleOverlayToggle = useCallback((key) => {
    if (key === 'showAngles')      setShowAngles(v => !v);
    if (key === 'showSymmetry')    setShowSymmetry(v => !v);
    if (key === 'showProportions') setShowProportions(v => !v);
  }, []);

  const handleKarmaEarn = useCallback((challengeId, karma) => {
    if (!completedIds.has(challengeId)) {
      setCompletedIds(prev => new Set(prev).add(challengeId));
      setEarnedKarma(prev => prev + karma);
    }
  }, [completedIds]);

  // The part to highlight/pulse for the current challenge
  const challengePartId = activeMode === 'challenges'
    ? (CHALLENGES[challengeIndex]?.partId ?? null)
    : null;

  // Bottom panel logic
  const showInfoCard    = activeMode === 'explore' && selectedPartId;
  const showDecompose   = activeMode === 'decompose';
  const showChallenges  = activeMode === 'challenges';
  const showAnglesPanel = activeMode === 'angles';
  const showCompare     = activeMode === 'compare';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Three.js Temple Model (invisible React wrapper) ──────────────────── */}
      <TempleModel
        onPartSelect={handlePartSelect}
        selectedPartId={selectedPartId}
        decomposed={decomposed}
        showAngles={showAngles}
        showSymmetry={showSymmetry}
        showProportions={showProportions}
        activeStyle={activeStyle}
        challengePartId={challengePartId}
        showMeasurements={showMeasurements}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,107,0,0.25)',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,107,0,0.18)',
            border: '1px solid rgba(255,107,0,0.35)',
            borderRadius: 8,
            color: '#FF8C3A',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          ← Back
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>
            Temple Architecture Explorer
          </div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            {activeStyle === 'gopuram' ? 'South Indian Gopuram' :
             activeStyle === 'shikhara' ? 'North Indian Nagara' : 'Indo-Islamic Dome'}
          </div>
        </div>

        {/* Notes + Mode toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setShowMeasurements(v => !v)}
            title="Toggle Measurements"
            style={{
              background: showMeasurements ? 'rgba(0,255,170,0.2)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${showMeasurements ? '#00FFAA' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8,
              color: showMeasurements ? '#00FFAA' : 'rgba(255,255,255,0.7)',
              width: 34,
              height: 34,
              cursor: 'pointer',
              fontSize: 15,
            }}
          >
            📏
          </button>
          <button
            onClick={() => setShowNotes(v => !v)}
            title="Cultural Notes"
            style={{
              background: showNotes ? 'rgba(212,160,23,0.25)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${showNotes ? '#D4A017' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8,
              color: showNotes ? '#D4A017' : 'rgba(255,255,255,0.7)',
              width: 34,
              height: 34,
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            📜
          </button>
          <button
            onClick={() => setModePanelOpen(v => !v)}
            style={{
              background: modePanelOpen ? 'rgba(255,107,0,0.25)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${modePanelOpen ? '#FF6B00' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 8,
              color: modePanelOpen ? '#FF8C3A' : 'rgba(255,255,255,0.7)',
              width: 34,
              height: 34,
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            ☰
          </button>
        </div>
      </div>

      {/* ── Mode selector panel (right side slide-in) ────────────────────────── */}
      {modePanelOpen && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            right: 0,
            width: 180,
            zIndex: 35,
            background: 'rgba(8,4,0,0.93)',
            backdropFilter: 'blur(14px)',
            borderLeft: '1.5px solid rgba(255,107,0,0.35)',
            borderBottom: '1.5px solid rgba(255,107,0,0.35)',
            borderRadius: '0 0 0 14px',
            padding: '8px 0 10px',
          }}
        >
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 16px',
                background: activeMode === mode.id ? 'rgba(255,107,0,0.18)' : 'transparent',
                border: 'none',
                borderLeft: activeMode === mode.id
                  ? '3px solid #FF6B00'
                  : '3px solid transparent',
                cursor: 'pointer',
                color: activeMode === mode.id ? '#FF8C3A' : 'rgba(255,220,160,0.75)',
                fontSize: 14,
                fontWeight: activeMode === mode.id ? 700 : 400,
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{mode.icon}</span>
              {mode.label}
            </button>
          ))}

          {/* Karma mini display */}
          <div
            style={{
              margin: '8px 14px 0',
              padding: '8px 10px',
              background: 'rgba(212,160,23,0.1)',
              border: '1px solid rgba(212,160,23,0.25)',
              borderRadius: 8,
            }}
          >
            <div style={{ color: 'rgba(212,160,23,0.6)', fontSize: 10, marginBottom: 2 }}>Karma</div>
            <div style={{ color: '#D4A017', fontWeight: 700, fontSize: 16 }}>{earnedKarma} pts</div>
          </div>
        </div>
      )}

      {/* ── Challenge progress badge (visible in challenges mode) ────────────── */}
      {activeMode === 'challenges' && (
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,107,0,0.35)',
            borderRadius: 20,
            padding: '4px 14px',
            color: '#FFD580',
            fontSize: 12,
            fontWeight: 600,
            pointerEvents: 'none',
          }}
        >
          Challenge {challengeIndex + 1} of {CHALLENGES.length}
        </div>
      )}

      {/* ── Overlay active badges ────────────────────────────────────────────── */}
      {activeMode === 'angles' && (showAngles || showSymmetry || showProportions) && (
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            display: 'flex',
            gap: 6,
            pointerEvents: 'none',
          }}
        >
          {showAngles && (
            <span style={{ background: 'rgba(0,255,255,0.15)', border: '1px solid cyan', borderRadius: 10, padding: '2px 8px', color: 'cyan', fontSize: 11 }}>Angles</span>
          )}
          {showSymmetry && (
            <span style={{ background: 'rgba(255,100,255,0.15)', border: '1px solid #FF66FF', borderRadius: 10, padding: '2px 8px', color: '#FF66FF', fontSize: 11 }}>Symmetry</span>
          )}
          {showProportions && (
            <span style={{ background: 'rgba(255,255,0,0.15)', border: '1px solid yellow', borderRadius: 10, padding: '2px 8px', color: 'yellow', fontSize: 11 }}>Proportions</span>
          )}
        </div>
      )}

      {/* ── Rotate / pinch hint (auto-hides after 4 s) ──────────────────────── */}
      {showRotateHint && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(0,0,0,0.60)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,107,0,0.35)',
            borderRadius: 20,
            padding: '7px 18px',
            color: 'rgba(255,220,160,0.85)',
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'opacity 0.4s',
          }}
        >
          <span style={{ fontSize: 16 }}>🖱️</span>
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </div>
      )}

      {/* ── Tap-to-explore hint (explore mode, nothing selected, hint gone) ──── */}
      {activeMode === 'explore' && !selectedPartId && !showRotateHint && (
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: 20,
            padding: '6px 16px',
            color: 'rgba(255,220,160,0.75)',
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Tap any part of the temple to learn about it
        </div>
      )}

      {/* ── Bottom mode tab bar (always visible) ────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          display: 'flex',
          background: 'rgba(6,3,0,0.92)',
          backdropFilter: 'blur(16px)',
          borderTop: '1.5px solid rgba(255,107,0,0.3)',
        }}
      >
        {MODES.map(m => {
          const active = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                padding: '8px 2px 10px',
                background: active ? 'rgba(255,107,0,0.18)' : 'transparent',
                border: 'none',
                borderTop: active ? '2px solid #FF6B00' : '2px solid transparent',
                cursor: 'pointer',
                color: active ? '#FF8C3A' : 'rgba(255,200,140,0.55)',
                fontSize: 10,
                fontWeight: active ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 17 }}>{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Bottom panels ────────────────────────────────────────────────────── */}

      {/* Explore mode: info card */}
      <TempleInfoCard
        partId={showInfoCard ? selectedPartId : null}
        onClose={() => setSelectedPartId(null)}
      />

      {/* Decompose mode */}
      {showDecompose && (
        <DecomposeView
          decomposed={decomposed}
          onToggle={() => setDecomposed(v => !v)}
        />
      )}

      {/* Challenges mode */}
      {showChallenges && (
        <TempleChallenges
          currentIndex={challengeIndex}
          onIndexChange={setChallengeIndex}
          earnedKarma={earnedKarma}
          onKarmaEarn={handleKarmaEarn}
          onClose={() => handleModeChange('explore')}
        />
      )}

      {/* Angles / overlays mode */}
      {showAnglesPanel && (
        <AngleOverlay
          showAngles={showAngles}
          showSymmetry={showSymmetry}
          showProportions={showProportions}
          onToggle={handleOverlayToggle}
          onClose={() => handleModeChange('explore')}
        />
      )}

      {/* Compare / style mode */}
      {showCompare && (
        <StyleComparison
          activeStyle={activeStyle}
          onStyleChange={(style) => { setActiveStyle(style); setModePanelOpen(false); }}
          onClose={() => handleModeChange('explore')}
        />
      )}

      {/* Cultural notes side panel */}
      {showNotes && (
        <CulturalNotes onClose={() => setShowNotes(false)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page wrapper
// ─────────────────────────────────────────────────────────────────────────────
export default function TempleExplorer() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ARScene>
        <TempleExplorerInner />
      </ARScene>
    </div>
  );
}
