/**
 * TempleInfoCard.jsx
 * Bottom slide-up panel showing geometry info for the selected temple part.
 */
import { useEffect, useRef } from 'react';
import { PART_BY_ID } from '../../../data/templeData';

const DIFFICULTY_STARS = { 1: '★', 2: '★★', 3: '★★★' };

export default function TempleInfoCard({ partId, onClose }) {
  const data = partId ? PART_BY_ID[partId] : null;
  const cardRef = useRef(null);

  // Slide in when data changes
  useEffect(() => {
    if (!cardRef.current) return;
    if (data) {
      cardRef.current.style.transform = 'translateY(0)';
    } else {
      cardRef.current.style.transform = 'translateY(110%)';
    }
  }, [data]);

  const dimEntries = data ? Object.entries(data.dimensions) : [];

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: 'translateY(110%)',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 40,
        background: 'rgba(12, 6, 0, 0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(255,107,0,0.5)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 28px',
        maxHeight: '55vh',
        overflowY: 'auto',
      }}
    >
      {data && (
        <>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#FF6B00', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
                  {data.shape}
                </span>
              </div>
              <h2 style={{ color: '#FFD580', fontSize: 20, fontWeight: 700, margin: '4px 0 2px' }}>
                {data.name}
              </h2>
              <p style={{ color: 'rgba(255,180,80,0.7)', fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                {data.sanskrit}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,107,0,0.2)',
                border: '1px solid rgba(255,107,0,0.4)',
                borderRadius: 8,
                color: '#FF8C3A',
                width: 32,
                height: 32,
                cursor: 'pointer',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>

          {/* Dimensions grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: 14 }}>
            {dimEntries.map(([key, val]) => (
              <div
                key={key}
                style={{
                  background: 'rgba(255,107,0,0.12)',
                  border: '1px solid rgba(255,107,0,0.25)',
                  borderRadius: 8,
                  padding: '6px 10px',
                }}
              >
                <div style={{ color: 'rgba(255,200,120,0.65)', fontSize: 10, marginBottom: 2 }}>{key}</div>
                <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 15 }}>{val} m</div>
              </div>
            ))}
          </div>

          {/* Formula card */}
          <div
            style={{
              background: 'rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.35)',
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 14,
            }}
          >
            <div style={{ color: 'rgba(255,215,90,0.6)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Formula
            </div>
            <code style={{ color: '#FFD700', fontSize: 15, fontWeight: 700 }}>{data.formula}</code>
            <div style={{ marginTop: 6, display: 'flex', gap: 16 }}>
              {data.volume && (
                <span style={{ color: 'rgba(255,220,120,0.8)', fontSize: 12 }}>
                  <b style={{ color: '#FFD580' }}>V =</b> {data.volume}
                </span>
              )}
              {data.surfaceArea && (
                <span style={{ color: 'rgba(255,220,120,0.8)', fontSize: 12 }}>
                  <b style={{ color: '#FFD580' }}>SA =</b> {data.surfaceArea}
                </span>
              )}
            </div>
          </div>

          {/* Cultural note */}
          <div
            style={{
              background: 'rgba(100,60,20,0.25)',
              border: '1px solid rgba(200,140,60,0.25)',
              borderRadius: 10,
              padding: '10px 14px',
            }}
          >
            <div style={{ color: '#D4A017', fontSize: 11, fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Cultural Significance
            </div>
            <p style={{ color: 'rgba(255,220,160,0.85)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
              {data.culturalNote}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
