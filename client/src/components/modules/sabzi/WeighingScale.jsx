/**
 * WeighingScale.jsx
 * Interactive tarazu (balance scale) — tap/click to add vegetables or weights
 * to each pan and compare.
 *
 * Props:
 *   prices     { [vegId]: number }
 *   onClose    () => void
 */

import { useState } from 'react';
import { VEGETABLES, WEIGHT_PIECES } from '../../../data/sabziData';

const CHALLENGES = [
  {
    id: 'w1',
    text: 'Balance exactly 1.7 kg of tomatoes using the available weights.',
    targetVeg: 'tomato',
    targetKg: 1.7,
    solutionWeights: ['w1kg', 'w500g', 'w200g'],
    hint: '1 kg + 500 g + 200 g = 1700 g = 1.7 kg',
  },
  {
    id: 'w2',
    text: 'Balance 2.3 kg of onions.',
    targetVeg: 'onion',
    targetKg: 2.3,
    solutionWeights: ['w2kg', 'w200g', 'w100g'],
    hint: '2 kg + 200 g + 100 g = 2300 g = 2.3 kg',
  },
  {
    id: 'w3',
    text: 'Balance 750 g of green chillies.',
    targetVeg: 'chilli',
    targetKg: 0.75,
    solutionWeights: ['w500g', 'w200g', 'w100g'],
    hint: '500 g + 200 g + 100 g = 800 g ≠ 750 g. Try: 500 g + 200 g + 50 g? Only use provided weights.',
  },
  {
    id: 'w4',
    text: 'Balance 1.2 kg of lady finger (okra).',
    targetVeg: 'okra',
    targetKg: 1.2,
    solutionWeights: ['w1kg', 'w200g'],
    hint: '1 kg + 200 g = 1200 g = 1.2 kg',
  },
];

// Tilt angle in degrees based on imbalance
function getTilt(vegKg, weightKg) {
  const diff = vegKg - weightKg;
  // Max tilt = 30° at 1 kg difference
  return Math.max(-30, Math.min(30, diff * 30));
}

export default function WeighingScale({ prices, onClose }) {
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [vegKg,          setVegKg]          = useState(0);
  const [selectedWeights, setSelectedWeights] = useState([]); // array of weight ids
  const [showHint,       setShowHint]       = useState(false);
  const [showSolution,   setShowSolution]   = useState(false);

  const challenge = CHALLENGES[challengeIndex];
  const weightKg  = selectedWeights.reduce((sum, wid) => {
    const w = WEIGHT_PIECES.find(p => p.id === wid);
    return sum + (w?.value ?? 0);
  }, 0);

  const tilt = getTilt(vegKg, weightKg);
  const balanced = Math.abs(vegKg - weightKg) < 0.001;
  const correct  = balanced && Math.abs(vegKg - challenge.targetKg) < 0.001;

  const veg = VEGETABLES.find(v => v.id === challenge.targetVeg);

  const addWeight = (wid) => {
    setSelectedWeights(prev => [...prev, wid]);
  };

  const removeWeight = (wid) => {
    setSelectedWeights(prev => {
      const idx = prev.indexOf(wid);
      if (idx === -1) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const setVegAmount = (kg) => {
    setVegKg(Math.max(0, Math.min(5, kg)));
  };

  const reset = () => {
    setVegKg(0);
    setSelectedWeights([]);
    setShowHint(false);
    setShowSolution(false);
  };

  const goChallenge = (dir) => {
    setChallengeIndex(i => (i + dir + CHALLENGES.length) % CHALLENGES.length);
    reset();
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '62vh',
        overflowY: 'auto',
        background: 'rgba(6,3,0,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(255,107,0,0.3)',
        borderRadius: '16px 16px 0 0',
        padding: '12px 14px 10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div>
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>⚖️ Weighing Scale</div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            Challenge {challengeIndex + 1} / {CHALLENGES.length}
          </div>
        </div>
        <button onClick={onClose} style={closeBtn}>✕</button>
      </div>

      {/* Challenge text */}
      <div style={{
        padding: '8px 10px', borderRadius: 8, marginBottom: 12,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,107,0,0.15)',
        color: 'rgba(255,230,180,0.9)', fontSize: 13,
      }}>
        {challenge.text}
      </div>

      {/* Scale visual */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 14, gap: 4 }}>
        {/* Left pan (vegetable side) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${tilt > 0 ? Math.abs(tilt) * 1.5 : 0}px)`,
            transition: 'transform 0.4s ease',
          }}
        >
          <div style={{
            width: 80, height: 50, background: 'rgba(255,107,0,0.12)',
            border: `2px solid ${vegKg > 0 ? 'rgba(255,107,0,0.6)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '0 0 40px 40px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
          }}>
            {vegKg > 0 && (
              <>
                <span style={{ fontSize: 18 }}>{veg?.emoji ?? '🥦'}</span>
                <span style={{ color: '#FF8C3A', fontSize: 10, fontWeight: 700 }}>{vegKg} kg</span>
              </>
            )}
          </div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginTop: 3 }}>Vegetables</div>
        </div>

        {/* Beam */}
        <div style={{
          width: 120, height: 6, background: 'rgba(192,160,96,0.9)',
          borderRadius: 3, transform: `rotate(${-tilt * 0.6}deg)`,
          transition: 'transform 0.4s ease', transformOrigin: 'center',
          alignSelf: 'center', position: 'relative',
        }}>
          {/* Pivot */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%,-50%)',
            width: 12, height: 12, borderRadius: '50%',
            background: '#C0A060', border: '2px solid #FFD700',
          }} />
        </div>

        {/* Right pan (weights side) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `translateY(${tilt < 0 ? Math.abs(tilt) * 1.5 : 0}px)`,
            transition: 'transform 0.4s ease',
          }}
        >
          <div style={{
            width: 80, height: 50, background: 'rgba(0,200,255,0.10)',
            border: `2px solid ${weightKg > 0 ? 'rgba(0,200,255,0.55)' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '0 0 40px 40px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column',
          }}>
            {weightKg > 0 && (
              <>
                <span style={{ color: '#00CFFF', fontSize: 12, fontWeight: 700 }}>{weightKg} kg</span>
                <span style={{ color: 'rgba(0,200,255,0.6)', fontSize: 9 }}>
                  {selectedWeights.length} piece{selectedWeights.length !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </div>
          <div style={{ color: 'rgba(0,200,255,0.5)', fontSize: 9, marginTop: 3 }}>Weights</div>
        </div>
      </div>

      {/* Balance status */}
      <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
        {correct ? (
          <span style={{ color: '#00FF88' }}>✓ Perfectly balanced!</span>
        ) : balanced ? (
          <span style={{ color: '#FFD700' }}>⚖ Balanced, but wrong amount</span>
        ) : vegKg > weightKg ? (
          <span style={{ color: '#FF8C3A' }}>Vegetables heavier by {(vegKg - weightKg).toFixed(3)} kg</span>
        ) : weightKg > vegKg ? (
          <span style={{ color: '#00CFFF' }}>Weights heavier by {(weightKg - vegKg).toFixed(3)} kg</span>
        ) : (
          <span style={{ color: 'rgba(255,200,100,0.5)' }}>Add vegetables and weights</span>
        )}
      </div>

      {/* Veg amount selector */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1 }}>
          VEGETABLE AMOUNT (target: {challenge.targetKg} kg)
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => setVegAmount(vegKg - 0.1)} style={adjBtn}>−</button>
          <div style={{
            flex: 1, textAlign: 'center', color: '#FFD580', fontSize: 15, fontWeight: 700,
            padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: 8,
            border: '1px solid rgba(255,107,0,0.25)',
          }}>
            {veg?.emoji} {vegKg.toFixed(3)} kg
          </div>
          <button onClick={() => setVegAmount(vegKg + 0.1)} style={adjBtn}>+</button>
          <button
            onClick={() => setVegAmount(challenge.targetKg)}
            style={{ ...adjBtn, background: 'rgba(255,107,0,0.15)', color: '#FF8C3A', padding: '5px 8px', fontSize: 10 }}
          >
            Set exact
          </button>
        </div>
      </div>

      {/* Weight pieces */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1 }}>
          ADD WEIGHTS TO RIGHT PAN
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {WEIGHT_PIECES.map(w => {
            const count = selectedWeights.filter(id => id === w.id).length;
            return (
              <div key={w.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <button
                  onClick={() => addWeight(w.id)}
                  style={{
                    padding: '7px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                    background: count > 0 ? 'rgba(0,200,255,0.18)' : 'rgba(0,0,0,0.4)',
                    border: `1px solid ${count > 0 ? 'rgba(0,200,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                    color: count > 0 ? '#00CFFF' : 'rgba(255,220,160,0.7)',
                    fontWeight: 600,
                  }}
                >
                  {w.label}
                </button>
                {count > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: 'rgba(0,200,255,0.7)', fontSize: 10 }}>×{count}</span>
                    <button
                      onClick={() => removeWeight(w.id)}
                      style={{
                        background: 'rgba(255,50,50,0.15)', border: '1px solid rgba(255,80,80,0.3)',
                        color: '#FF8080', borderRadius: 4, padding: '1px 4px', cursor: 'pointer', fontSize: 10,
                      }}
                    >
                      −
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      {showHint && (
        <div style={{
          padding: '7px 10px', borderRadius: 8, marginBottom: 10,
          background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.2)',
          color: 'rgba(255,220,100,0.85)', fontSize: 12,
        }}>
          💡 {challenge.hint}
        </div>
      )}

      {/* Solution */}
      {showSolution && (
        <div style={{
          padding: '7px 10px', borderRadius: 8, marginBottom: 10,
          background: 'rgba(0,200,100,0.07)', border: '1px solid rgba(0,200,100,0.2)',
          color: 'rgba(150,255,200,0.85)', fontSize: 12,
        }}>
          ✅ Solution: {challenge.solutionWeights.map(id =>
            WEIGHT_PIECES.find(w => w.id === id)?.label
          ).join(' + ')}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button onClick={() => setShowHint(v => !v)} style={secBtn}>
          💡 {showHint ? 'Hide' : 'Hint'}
        </button>
        <button onClick={() => setShowSolution(v => !v)} style={secBtn}>
          🔑 Solution
        </button>
        <button onClick={reset} style={secBtn}>🔄 Reset</button>
        <button onClick={() => goChallenge(-1)} style={secBtn}>← Prev</button>
        <button onClick={() => goChallenge(1)} style={secBtn}>Next →</button>
      </div>
    </div>
  );
}

const closeBtn = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: 'rgba(255,255,255,0.6)', padding: '3px 8px',
  cursor: 'pointer', fontSize: 12,
};
const adjBtn = {
  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,107,0,0.3)',
  borderRadius: 8, color: '#FF8C3A', fontSize: 18, fontWeight: 700,
  padding: '4px 10px', cursor: 'pointer', width: 36,
};
const secBtn = {
  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, color: 'rgba(255,220,160,0.7)', fontSize: 12,
  padding: '6px 12px', cursor: 'pointer',
};
