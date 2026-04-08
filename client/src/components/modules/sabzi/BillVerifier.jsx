/**
 * BillVerifier.jsx
 * Students examine itemized bills and tap incorrect line items.
 *
 * Props:
 *   prices   { [vegId]: number }
 *   onClose  () => void
 */

import { useState } from 'react';
import { VEGETABLES } from '../../../data/sabziData';

// ─── Generate 10 bills with some intentional errors ───────────────────────────
function makeBills(prices) {
  const p = { ...prices };
  // Ensure all veg have a price
  VEGETABLES.forEach(v => { if (!p[v.id]) p[v.id] = v.basePrice; });

  return [
    // Bill 1 — error on tomatoes
    {
      id: 'b1',
      title: 'Receipt #1',
      items: [
        { veg: 'tomato', qty: 2.5, rate: p.tomato, stated: 110, correct: 2.5 * p.tomato },
        { veg: 'onion',  qty: 1,   rate: p.onion,  stated: p.onion,       correct: p.onion },
        { veg: 'potato', qty: 2,   rate: p.potato, stated: 2 * p.potato,  correct: 2 * p.potato },
      ],
      errorIndex: 0,
      errorExplanation: `2.5 kg × ₹${p.tomato}/kg = ₹${2.5 * p.tomato}, not ₹110`,
    },
    // Bill 2 — error on onion
    {
      id: 'b2',
      title: 'Receipt #2',
      items: [
        { veg: 'tomato', qty: 1, rate: p.tomato, stated: p.tomato,   correct: p.tomato },
        { veg: 'onion',  qty: 3, rate: p.onion,  stated: p.onion * 2, correct: 3 * p.onion },
        { veg: 'chilli', qty: 0.5, rate: p.chilli, stated: 0.5 * p.chilli, correct: 0.5 * p.chilli },
      ],
      errorIndex: 1,
      errorExplanation: `3 kg × ₹${p.onion}/kg = ₹${3 * p.onion}, not ₹${p.onion * 2}`,
    },
    // Bill 3 — all correct
    {
      id: 'b3',
      title: 'Receipt #3 ✓',
      items: [
        { veg: 'potato', qty: 2,   rate: p.potato, stated: 2 * p.potato, correct: 2 * p.potato },
        { veg: 'okra',   qty: 0.5, rate: p.okra,   stated: 0.5 * p.okra, correct: 0.5 * p.okra },
      ],
      errorIndex: -1, // no error
      errorExplanation: 'All calculations are correct.',
    },
    // Bill 4 — error on total
    {
      id: 'b4',
      title: 'Receipt #4',
      items: [
        { veg: 'tomato', qty: 4, rate: p.tomato, stated: 4 * p.tomato,   correct: 4 * p.tomato },
        { veg: 'onion',  qty: 2, rate: p.onion,  stated: 2 * p.onion,    correct: 2 * p.onion },
        { veg: 'chilli', qty: 1, rate: p.chilli, stated: p.chilli + 10,  correct: p.chilli },
      ],
      errorIndex: 2,
      errorExplanation: `1 kg × ₹${p.chilli}/kg = ₹${p.chilli}, not ₹${p.chilli + 10}`,
    },
    // Bill 5 — discount error
    {
      id: 'b5',
      title: 'Receipt #5',
      items: [
        { veg: 'potato', qty: 5, rate: p.potato, stated: 5 * p.potato, correct: 5 * p.potato },
        { veg: 'onion',  qty: 2, rate: p.onion,  stated: 2 * p.onion,  correct: 2 * p.onion },
      ],
      discount: { stated: 5, applied: Math.round((5 * p.potato + 2 * p.onion) * 0.08), correct: Math.round((5 * p.potato + 2 * p.onion) * 0.05) },
      errorIndex: 'discount',
      errorExplanation: `5% discount should be ₹${Math.round((5 * p.potato + 2 * p.onion) * 0.05)}, not ₹${Math.round((5 * p.potato + 2 * p.onion) * 0.08)}`,
    },
    // Bill 6 — GST error
    {
      id: 'b6',
      title: 'Receipt #6',
      items: [
        { veg: 'tomato', qty: 3, rate: p.tomato, stated: 3 * p.tomato, correct: 3 * p.tomato },
        { veg: 'okra',   qty: 1, rate: p.okra,   stated: p.okra,       correct: p.okra },
      ],
      gst: { rate: 5, stated: Math.round((3 * p.tomato + p.okra) * 0.08), correct: Math.round((3 * p.tomato + p.okra) * 0.05) },
      errorIndex: 'gst',
      errorExplanation: `5% GST = ₹${Math.round((3 * p.tomato + p.okra) * 0.05)}, not ₹${Math.round((3 * p.tomato + p.okra) * 0.08)}`,
    },
    // Bill 7 — wrong unit price
    {
      id: 'b7',
      title: 'Receipt #7',
      items: [
        { veg: 'chilli', qty: 0.25, rate: p.chilli, stated: 0.25 * p.chilli, correct: 0.25 * p.chilli },
        { veg: 'potato', qty: 3,    rate: p.potato,  stated: 3 * (p.potato + 5), correct: 3 * p.potato },
        { veg: 'onion',  qty: 1.5,  rate: p.onion,   stated: 1.5 * p.onion,  correct: 1.5 * p.onion },
      ],
      errorIndex: 1,
      errorExplanation: `Potato rate should be ₹${p.potato}/kg, not ₹${p.potato + 5}/kg`,
    },
    // Bill 8 — all correct
    {
      id: 'b8',
      title: 'Receipt #8 ✓',
      items: [
        { veg: 'tomato', qty: 0.5, rate: p.tomato, stated: 0.5 * p.tomato, correct: 0.5 * p.tomato },
        { veg: 'chilli', qty: 0.25, rate: p.chilli, stated: 0.25 * p.chilli, correct: 0.25 * p.chilli },
        { veg: 'okra',   qty: 1,   rate: p.okra,   stated: p.okra,          correct: p.okra },
      ],
      errorIndex: -1,
      errorExplanation: 'All calculations are correct.',
    },
    // Bill 9 — quantity error
    {
      id: 'b9',
      title: 'Receipt #9',
      items: [
        { veg: 'potato', qty: 4, rate: p.potato, stated: 3 * p.potato, correct: 4 * p.potato },
        { veg: 'onion',  qty: 2, rate: p.onion,  stated: 2 * p.onion,  correct: 2 * p.onion },
      ],
      errorIndex: 0,
      errorExplanation: `4 kg × ₹${p.potato}/kg = ₹${4 * p.potato}, not ₹${3 * p.potato} (wrong qty used)`,
    },
    // Bill 10 — compound error
    {
      id: 'b10',
      title: 'Receipt #10',
      items: [
        { veg: 'tomato', qty: 2, rate: p.tomato, stated: 2 * p.tomato, correct: 2 * p.tomato },
        { veg: 'chilli', qty: 1, rate: p.chilli, stated: p.chilli,     correct: p.chilli },
        { veg: 'okra',   qty: 1.5, rate: p.okra, stated: Math.round(1.5 * p.okra * 1.1), correct: Math.round(1.5 * p.okra) },
      ],
      errorIndex: 2,
      errorExplanation: `1.5 × ₹${p.okra} = ₹${Math.round(1.5 * p.okra)}, not ₹${Math.round(1.5 * p.okra * 1.1)}`,
    },
  ];
}

export default function BillVerifier({ prices, onClose }) {
  const bills = makeBills(prices);
  const [billIdx,       setBillIdx]       = useState(0);
  const [tappedIndex,   setTappedIndex]   = useState(null); // item index tapped
  const [tappedSection, setTappedSection] = useState(null); // 'discount' | 'gst' | null
  const [revealed,      setRevealed]      = useState(false);
  const [score,         setScore]         = useState(0);
  const [attempted,     setAttempted]     = useState(new Set());

  const bill = bills[billIdx];

  const checkTap = (index, section = null) => {
    setTappedIndex(index);
    setTappedSection(section);

    const actualError = bill.errorIndex;
    const isMatch = section
      ? actualError === section
      : (actualError === index);

    setRevealed(true);

    if (isMatch && !attempted.has(bill.id)) {
      setAttempted(prev => new Set(prev).add(bill.id));
      setScore(s => s + 10);
    }
  };

  const next = () => {
    setBillIdx(i => (i + 1) % bills.length);
    setTappedIndex(null);
    setTappedSection(null);
    setRevealed(false);
  };

  const prev = () => {
    setBillIdx(i => (i - 1 + bills.length) % bills.length);
    setTappedIndex(null);
    setTappedSection(null);
    setRevealed(false);
  };

  const getVeg = (id) => VEGETABLES.find(v => v.id === id);
  const subtotal = bill.items.reduce((s, it) => s + it.stated, 0);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '65vh',
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
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>🧾 Bill Verifier</div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            {billIdx + 1}/{bills.length} · Score: {score} pts
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={prev} style={navBtn}>←</button>
          <button onClick={next} style={navBtn}>→</button>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
      </div>

      {/* Instruction */}
      {!revealed && (
        <div style={{
          padding: '7px 10px', borderRadius: 8, marginBottom: 10,
          background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.2)',
          color: 'rgba(255,220,100,0.85)', fontSize: 12,
        }}>
          🔍 Tap the incorrect line item (if any). One bill may be error-free!
        </div>
      )}

      {/* Bill receipt */}
      <div
        style={{
          background: 'rgba(255,255,250,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        {/* Bill header */}
        <div style={{
          textAlign: 'center', padding: '8px 10px',
          background: 'rgba(255,107,0,0.12)',
          borderBottom: '1px solid rgba(255,107,0,0.2)',
          color: '#FFD580', fontWeight: 700, fontSize: 13,
        }}>
          {bill.title}
        </div>

        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px',
          padding: '5px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,200,100,0.5)', fontSize: 10, fontWeight: 600,
        }}>
          <span>Item</span>
          <span style={{ textAlign: 'right' }}>Qty</span>
          <span style={{ textAlign: 'right' }}>Rate</span>
          <span style={{ textAlign: 'right' }}>Amount</span>
        </div>

        {/* Line items */}
        {bill.items.map((item, i) => {
          const v = getVeg(item.veg);
          const isError = bill.errorIndex === i;
          const isTapped = tappedIndex === i && tappedSection === null;
          const correctAmt = item.correct;
          const isWrong = Math.abs(item.stated - correctAmt) > 0.01;

          let rowBg = 'transparent';
          if (revealed) {
            if (isError) rowBg = isWrong ? 'rgba(255,50,50,0.15)' : 'rgba(255,200,0,0.12)';
          } else if (isTapped) {
            rowBg = 'rgba(255,215,0,0.12)';
          }

          return (
            <div
              key={i}
              onClick={() => !revealed && checkTap(i)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px',
                padding: '8px 10px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                background: rowBg,
                cursor: revealed ? 'default' : 'pointer',
                transition: 'background 0.2s',
                border: isTapped && !revealed ? '1px solid rgba(255,215,0,0.5)' : 'none',
              }}
            >
              <span style={{ color: 'rgba(255,230,180,0.9)', fontSize: 12 }}>
                {v?.emoji} {v?.name}
              </span>
              <span style={{ color: 'rgba(255,220,160,0.7)', fontSize: 12, textAlign: 'right' }}>
                {item.qty} kg
              </span>
              <span style={{ color: 'rgba(255,220,160,0.7)', fontSize: 12, textAlign: 'right' }}>
                ₹{item.rate}
              </span>
              <span style={{
                textAlign: 'right', fontSize: 12, fontWeight: 600,
                color: revealed && isError ? '#FF8080' : '#FFD580',
              }}>
                ₹{item.stated}
                {revealed && isError && (
                  <div style={{ color: '#00FF88', fontSize: 10, fontWeight: 400 }}>
                    ✓ ₹{correctAmt}
                  </div>
                )}
              </span>
            </div>
          );
        })}

        {/* Discount row (some bills) */}
        {bill.discount && (
          <div
            onClick={() => !revealed && checkTap(null, 'discount')}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px',
              padding: '6px 10px',
              background: revealed && bill.errorIndex === 'discount'
                ? 'rgba(255,50,50,0.15)' : tappedSection === 'discount' ? 'rgba(255,215,0,0.12)' : 'transparent',
              cursor: revealed ? 'default' : 'pointer',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ color: 'rgba(255,180,100,0.7)', fontSize: 11, gridColumn: '1 / 4' }}>
              Discount ({bill.discount.stated}%)
            </span>
            <span style={{ color: revealed && bill.errorIndex === 'discount' ? '#FF8080' : 'rgba(255,200,100,0.8)', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
              -₹{bill.discount.applied}
              {revealed && bill.errorIndex === 'discount' && (
                <div style={{ color: '#00FF88', fontSize: 10, fontWeight: 400 }}>✓ -₹{bill.discount.correct}</div>
              )}
            </span>
          </div>
        )}

        {/* GST row */}
        {bill.gst && (
          <div
            onClick={() => !revealed && checkTap(null, 'gst')}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px 70px',
              padding: '6px 10px',
              background: revealed && bill.errorIndex === 'gst'
                ? 'rgba(255,50,50,0.15)' : tappedSection === 'gst' ? 'rgba(255,215,0,0.12)' : 'transparent',
              cursor: revealed ? 'default' : 'pointer',
            }}
          >
            <span style={{ color: 'rgba(255,180,100,0.7)', fontSize: 11, gridColumn: '1 / 4' }}>
              GST ({bill.gst.rate}%)
            </span>
            <span style={{ color: revealed && bill.errorIndex === 'gst' ? '#FF8080' : 'rgba(255,200,100,0.8)', fontSize: 12, textAlign: 'right', fontWeight: 600 }}>
              +₹{bill.gst.stated}
              {revealed && bill.errorIndex === 'gst' && (
                <div style={{ color: '#00FF88', fontSize: 10, fontWeight: 400 }}>✓ +₹{bill.gst.correct}</div>
              )}
            </span>
          </div>
        )}

        {/* Total row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 70px',
          padding: '8px 10px',
          background: 'rgba(255,107,0,0.1)',
          borderTop: '1px solid rgba(255,107,0,0.25)',
        }}>
          <span style={{ color: '#FFD580', fontSize: 13, fontWeight: 700 }}>TOTAL</span>
          <span style={{ color: '#FFD580', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
            ₹{subtotal}
          </span>
        </div>

        {/* No-error option */}
        {!revealed && (
          <button
            onClick={() => checkTap(-1)}
            style={{
              width: '100%', padding: '8px', background: 'rgba(0,255,100,0.07)',
              border: 'none', borderTop: '1px solid rgba(0,255,100,0.15)',
              color: 'rgba(100,255,150,0.7)', fontSize: 12, cursor: 'pointer',
            }}
          >
            ✓ This bill is correct — no errors
          </button>
        )}
      </div>

      {/* Result after reveal */}
      {revealed && (
        <div style={{
          padding: '8px 12px', borderRadius: 8, marginBottom: 10,
          background: bill.errorIndex === -1 && tappedIndex === -1
            ? 'rgba(0,255,100,0.10)' : bill.errorIndex === (tappedSection ?? tappedIndex)
              ? 'rgba(0,255,100,0.10)' : 'rgba(255,50,50,0.10)',
          border: `1px solid ${
            (bill.errorIndex === -1 && tappedIndex === -1) || bill.errorIndex === (tappedSection ?? tappedIndex)
              ? 'rgba(0,255,100,0.35)' : 'rgba(255,80,80,0.35)'}`,
          color: (bill.errorIndex === -1 && tappedIndex === -1) || bill.errorIndex === (tappedSection ?? tappedIndex)
            ? '#00FF88' : '#FF8080',
          fontSize: 13, fontWeight: 600,
        }}>
          {(bill.errorIndex === -1 && tappedIndex === -1) || bill.errorIndex === (tappedSection ?? tappedIndex)
            ? '✓ Correct! +10 pts'
            : '✗ Not quite…'}
          <div style={{ fontWeight: 400, fontSize: 11, marginTop: 4, color: 'rgba(255,220,180,0.75)' }}>
            {bill.errorExplanation}
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = {
  background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6, color: 'rgba(255,220,160,0.75)', padding: '3px 10px',
  cursor: 'pointer', fontSize: 13,
};
const closeBtn = {
  background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: 6, color: 'rgba(255,255,255,0.6)', padding: '3px 8px',
  cursor: 'pointer', fontSize: 12,
};
