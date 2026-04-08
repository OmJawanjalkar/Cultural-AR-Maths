/**
 * PatternLibrary.jsx
 * Scrollable library of 6 cultural rangoli/kolam patterns.
 * Selecting a pattern loads it onto the RangoliCanvas.
 *
 * Props:
 *   onLoad   (paths, colors) => void
 *   onClose  () => void
 */

import { useState } from 'react';
import { RANGOLI_PATTERNS } from '../../../data/rangoliPatterns';

const SYMMETRY_BADGE_COLORS = {
  'D4': '#FF6B35',
  'D6': '#FFD700',
  'D8': '#FF1493',
  'D2': '#00CED1',
};

function getBadgeColor(symmetryType) {
  for (const [key, color] of Object.entries(SYMMETRY_BADGE_COLORS)) {
    if (symmetryType.startsWith(key)) return color;
  }
  return '#888888';
}

function PatternCard({ pattern, isSelected, onSelect, onLoad, onAnalyze }) {
  const badgeColor = getBadgeColor(pattern.symmetryType);

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        border: `1.5px solid ${isSelected ? '#FFD700' : 'rgba(255,107,0,0.2)'}`,
        background: isSelected ? 'rgba(255,215,0,0.08)' : 'rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        marginBottom: 8,
      }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ color: '#FFD580', fontSize: 13, fontWeight: 700 }}>
            {pattern.name}
          </div>
          <div style={{ color: 'rgba(255,200,100,0.55)', fontSize: 10 }}>
            📍 {pattern.region}
          </div>
        </div>

        <span
          style={{
            background: badgeColor + '22',
            border: `1px solid ${badgeColor}66`,
            color: badgeColor,
            fontSize: 9,
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
          }}
        >
          {pattern.symmetryType.split(' — ')[0]}
        </span>
      </div>

      {/* Description */}
      <div style={{ color: 'rgba(255,220,180,0.65)', fontSize: 11, marginBottom: 6 }}>
        {pattern.description}
      </div>

      {/* Math fact */}
      {isSelected && (
        <div
          style={{
            padding: '6px 8px',
            background: 'rgba(0,200,255,0.07)',
            borderRadius: 6,
            border: '1px solid rgba(0,200,255,0.2)',
            color: 'rgba(180,230,255,0.85)',
            fontSize: 11,
            marginBottom: 8,
          }}
        >
          🧮 {pattern.mathFact}
        </div>
      )}

      {/* Symmetry details */}
      {isSelected && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 3 }}>
            ROTATION ORDER
          </div>
          <div style={{ color: '#FFD700', fontSize: 13, fontWeight: 700 }}>
            {pattern.rotationOrder}-fold
            <span style={{ color: 'rgba(255,200,100,0.5)', fontWeight: 400, fontSize: 10 }}>
              {' '}(min angle {(360 / pattern.rotationOrder).toFixed(0)}°)
            </span>
          </div>

          {pattern.reflectionAxes.length > 0 && (
            <>
              <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginTop: 5, marginBottom: 3 }}>
                REFLECTION AXES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {pattern.reflectionAxes.map(ax => (
                  <span
                    key={ax}
                    style={{
                      background: 'rgba(255,107,0,0.12)',
                      border: '1px solid rgba(255,107,0,0.3)',
                      color: '#FF8C3A',
                      fontSize: 9,
                      padding: '1px 6px',
                      borderRadius: 6,
                    }}
                  >
                    {ax}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isSelected && (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onLoad(pattern); }}
            style={{
              flex: 1,
              background: 'rgba(255,107,0,0.22)',
              border: '1px solid rgba(255,107,0,0.5)',
              borderRadius: 7,
              color: '#FF8C3A',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 0',
              cursor: 'pointer',
            }}
          >
            Load Pattern
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAnalyze(pattern); }}
            style={{
              flex: 1,
              background: 'rgba(0,200,255,0.12)',
              border: '1px solid rgba(0,200,255,0.35)',
              borderRadius: 7,
              color: '#00CFFF',
              fontSize: 12,
              fontWeight: 700,
              padding: '6px 0',
              cursor: 'pointer',
            }}
          >
            Analyze
          </button>
        </div>
      )}
    </div>
  );
}

export default function PatternLibrary({ onLoad, onClose }) {
  const [selectedId,  setSelectedId]  = useState(null);
  const [analysisId,  setAnalysisId]  = useState(null);

  const handleLoad = (pattern) => {
    onLoad?.(pattern.paths, pattern.colors);
  };

  const handleAnalyze = (pattern) => {
    setAnalysisId(pattern.id === analysisId ? null : pattern.id);
  };

  const analysis = analysisId ? RANGOLI_PATTERNS.find(p => p.id === analysisId) : null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(6,3,0,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(255,107,0,0.3)',
        borderRadius: '16px 16px 0 0',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px 8px',
          borderBottom: '1px solid rgba(255,107,0,0.15)',
        }}
      >
        <div>
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>
            Cultural Pattern Library
          </div>
          <div style={{ color: 'rgba(255,200,100,0.45)', fontSize: 10 }}>
            {RANGOLI_PATTERNS.length} patterns · Tap to expand
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '3px 8px',
            cursor: 'pointer', fontSize: 12,
          }}
        >
          ✕
        </button>
      </div>

      {/* Pattern list */}
      <div style={{ overflowY: 'auto', padding: '10px 14px', flex: 1 }}>
        {RANGOLI_PATTERNS.map(pattern => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            isSelected={selectedId === pattern.id}
            onSelect={() => setSelectedId(pattern.id === selectedId ? null : pattern.id)}
            onLoad={handleLoad}
            onAnalyze={handleAnalyze}
          />
        ))}
      </div>

      {/* Analysis panel */}
      {analysis && (
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid rgba(0,200,255,0.2)',
            background: 'rgba(0,10,20,0.5)',
          }}
        >
          <div style={{ color: '#00CFFF', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>
            🔬 Analysis: {analysis.name}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              fontSize: 11,
            }}
          >
            <AnalysisItem label="Symmetry Group" value={analysis.symmetryType.split(' — ')[0]} />
            <AnalysisItem label="Full Description" value={analysis.symmetryType.split(' — ')[1] ?? '—'} />
            <AnalysisItem label="Rotation Order" value={`${analysis.rotationOrder}-fold`} />
            <AnalysisItem label="Minimum Angle" value={`${(360 / analysis.rotationOrder).toFixed(0)}°`} />
            <AnalysisItem label="Reflection Axes" value={`${analysis.reflectionAxes.length}`} />
            <AnalysisItem label="Dihedral Group" value={`D${analysis.rotationOrder}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisItem({ label, value }) {
  return (
    <div
      style={{
        padding: '6px 8px',
        background: 'rgba(0,200,255,0.06)',
        borderRadius: 6,
        border: '1px solid rgba(0,200,255,0.15)',
      }}
    >
      <div style={{ color: 'rgba(180,230,255,0.5)', fontSize: 9, marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'rgba(180,230,255,0.9)', fontWeight: 600 }}>{value}</div>
    </div>
  );
}
