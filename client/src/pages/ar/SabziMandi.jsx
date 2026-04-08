/**
 * SabziMandi.jsx
 * Full-screen AR page for the Sabzi Mandi Arithmetic module.
 *
 * Layout:
 *   ARScene
 *   └─ SabziMandiInner
 *       ├─ MarketScene      (Three.js market stall)
 *       ├─ Top bar          (title, back, wallet)
 *       ├─ Bottom tab bar   (Challenges / Scale / Bills / Prices)
 *       └─ Panels: ShoppingChallenges | WeighingScale | BillVerifier | PriceBoard
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ARScene from '../../components/ar/ARScene';
import MarketScene from '../../components/modules/sabzi/MarketScene';
import ShoppingChallenges from '../../components/modules/sabzi/ShoppingChallenges';
import WeighingScale from '../../components/modules/sabzi/WeighingScale';
import BillVerifier from '../../components/modules/sabzi/BillVerifier';
import PriceBoard from '../../components/modules/sabzi/PriceBoard';
import { generateDailyPrices, INITIAL_WALLET } from '../../data/sabziData';

const TABS = [
  { id: 'challenges', label: 'Challenges', icon: '🛒' },
  { id: 'scale',      label: 'Scale',      icon: '⚖️'  },
  { id: 'bills',      label: 'Bills',      icon: '🧾'  },
  { id: 'prices',     label: 'Prices',     icon: '📋'  },
];

// ─────────────────────────────────────────────────────────────────────────────
function SabziMandiInner() {
  const navigate = useNavigate();

  // Generate prices once per session (seeded by date)
  const { today, yesterday, week } = useMemo(() => {
    return generateDailyPrices(new Date().toISOString().slice(0, 10));
  }, []);

  // State
  const [activeTab,     setActiveTab]     = useState('challenges');
  const [level,         setLevel]         = useState(1);
  const [earnedKarma,   setEarnedKarma]   = useState(0);
  const [walletBalance, setWalletBalance] = useState(INITIAL_WALLET);
  const [shopQuestion,  setShopQuestion]  = useState(null);
  const [showHint,      setShowHint]      = useState(true);

  // Rotate hint auto-hide
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Karma earn
  const handleKarmaEarn = useCallback((id, karma) => {
    setEarnedKarma(prev => prev + karma);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Three.js market scene ──────────────────────────────────────────── */}
      <MarketScene
        prices={today}
        activeChallengeQuestion={shopQuestion}
        onVegClick={(id) => console.log('Veg tapped:', id)}
      />

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)',
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
            Sabzi Mandi — Arithmetic Market
          </div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            Level {level} · {earnedKarma} karma earned
          </div>
        </div>

        {/* Wallet balance */}
        <div
          style={{
            background: 'rgba(0,200,100,0.12)', border: '1px solid rgba(0,200,100,0.3)',
            borderRadius: 8, padding: '4px 10px', textAlign: 'center',
          }}
        >
          <div style={{ color: 'rgba(0,200,100,0.6)', fontSize: 9 }}>Wallet</div>
          <div style={{ color: '#00FF88', fontWeight: 700, fontSize: 13 }}>
            ₹{walletBalance}
          </div>
        </div>
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
          🖱️ Drag to rotate · Tap vegetables to interact
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
              onClick={() => setActiveTab(active ? 'none' : t.id)}
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
        <ShoppingChallenges
          level={level}
          onLevelChange={setLevel}
          earnedKarma={earnedKarma}
          onKarmaEarn={handleKarmaEarn}
          walletBalance={walletBalance}
          onWalletChange={setWalletBalance}
          onClose={() => setActiveTab('none')}
          onQuestionChange={setShopQuestion}
        />
      )}

      {activeTab === 'scale' && (
        <WeighingScale
          prices={today}
          onClose={() => setActiveTab('none')}
        />
      )}

      {activeTab === 'bills' && (
        <BillVerifier
          prices={today}
          onClose={() => setActiveTab('none')}
        />
      )}

      {activeTab === 'prices' && (
        <PriceBoard
          today={today}
          yesterday={yesterday}
          weekData={week}
          onClose={() => setActiveTab('none')}
        />
      )}
    </div>
  );
}

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export default function SabziMandi() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <ARScene>
        <SabziMandiInner />
      </ARScene>
    </div>
  );
}
