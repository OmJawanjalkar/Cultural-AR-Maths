import React, { useState } from 'react';

const COLORS = {
  variable: '#FF8C3A',   // saffron
  number:   '#C0392B',   // maroon
  result:   '#D4A017',   // gold
  operator: '#ffffff',
  equals:   '#ffffff',
};

/**
 * Tokenises a formula string into coloured spans.
 * – Variables (single letters like r, h, l, a, R, V, π) → saffron
 * – Numbers (digits and decimal) → maroon
 * – The last "= …" on a line → result in gold
 */
function ColourLine({ line, isResult }) {
  const tokens = [];
  let i = 0;
  const str = line;

  while (i < str.length) {
    // Number (including π)
    if (/[\d.]/.test(str[i]) || (str[i] === 'π' && !/[A-Za-z]/.test(str[i - 1] ?? ''))) {
      let num = str[i++];
      while (i < str.length && /[\d.]/.test(str[i])) num += str[i++];
      tokens.push({ kind: isResult ? 'result' : 'number', text: num });
      continue;
    }
    // Single Greek / math variable
    if ('πVSA'.includes(str[i]) && !/[a-z]/.test(str[i + 1] ?? '')) {
      tokens.push({ kind: 'variable', text: str[i++] });
      continue;
    }
    // ASCII variable a-z / A-Z isolated (not part of a word like "SA", "cm")
    if (/[a-zA-Z]/.test(str[i])) {
      let word = str[i++];
      while (i < str.length && /[a-zA-Z²³]/.test(str[i])) word += str[i++];
      // Keep keywords like "cm²", "cm³" neutral; highlight single-letter vars
      if (word.length === 1 || (word.length === 2 && /[²³]/.test(word[1]))) {
        tokens.push({ kind: isResult ? 'result' : 'variable', text: word });
      } else if (word === 'SA' || word === 'SA²') {
        tokens.push({ kind: 'variable', text: word });
      } else {
        tokens.push({ kind: 'plain', text: word });
      }
      continue;
    }
    tokens.push({ kind: 'plain', text: str[i++] });
  }

  return (
    <span>
      {tokens.map((tok, idx) => (
        <span
          key={idx}
          style={{ color: COLORS[tok.kind] ?? COLORS.operator }}
        >
          {tok.text}
        </span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FormulaDisplay({ shapeType, steps, surfaceArea, volume, visible }) {
  const [activeTab, setActiveTab] = useState('vol');

  if (!visible || !steps) return null;

  const lines = activeTab === 'vol' ? steps.vol : steps.sa;

  return (
    <div
      className="absolute left-4 top-20 z-20 rounded-2xl overflow-hidden"
      style={{
        minWidth: 280,
        maxWidth: 360,
        background: 'rgba(10, 4, 0, 0.82)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 140, 60, 0.30)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,140,60,0.20)' }}
      >
        <span className="font-bold text-sm" style={{ color: '#FFD580' }}>
          {shapeType?.charAt(0).toUpperCase() + shapeType?.slice(1)} Formula
        </span>
        <div className="flex gap-1">
          {['vol', 'sa'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="text-xs px-2 py-0.5 rounded-full font-semibold transition-colors"
              style={{
                background: activeTab === tab ? '#FF6B00' : 'rgba(255,255,255,0.08)',
                color: activeTab === tab ? '#fff' : 'rgba(255,200,130,0.7)',
              }}
            >
              {tab === 'vol' ? 'Volume' : 'Surface Area'}
            </button>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 py-3 space-y-1 font-mono text-sm">
        {lines.map((line, i) => {
          const isResult = i === lines.length - 1;
          return (
            <div
              key={i}
              className="py-0.5"
              style={{
                paddingLeft: isResult ? '8px' : (i * 6) + 'px',
                opacity: i === 0 ? 1 : 0.85 + (i / lines.length) * 0.15,
                borderLeft: isResult ? '2px solid #D4A017' : 'none',
              }}
            >
              <ColourLine line={line} isResult={isResult} />
            </div>
          );
        })}
      </div>

      {/* Summary chips */}
      <div
        className="px-4 py-2 flex gap-2"
        style={{ borderTop: '1px solid rgba(255,140,60,0.20)' }}
      >
        <div
          className="flex-1 text-center rounded-lg py-1 text-xs font-semibold"
          style={{ background: 'rgba(255,107,0,0.20)', color: '#FF8C3A' }}
        >
          SA = {surfaceArea} cm²
        </div>
        <div
          className="flex-1 text-center rounded-lg py-1 text-xs font-semibold"
          style={{ background: 'rgba(212,160,23,0.20)', color: '#D4A017' }}
        >
          V = {volume} cm³
        </div>
      </div>
    </div>
  );
}
