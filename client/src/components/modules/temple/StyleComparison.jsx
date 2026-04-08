/**
 * StyleComparison.jsx
 * UI panel for switching between and comparing temple architectural styles.
 */
import { TEMPLE_STYLES } from '../../../data/templeData';

const SHAPE_COLORS = {
  'Frustum of Cone': '#FF6B00',
  'Cuboid': '#4ADE80',
  'Cylinder': '#60A5FA',
  'Curvilinear Cone (Parabolic)': '#F472B6',
  'Hemisphere': '#A78BFA',
};

function StyleCard({ style, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px',
        borderRadius: 12,
        border: `1.5px solid ${active ? '#FF6B00' : 'rgba(255,255,255,0.1)'}`,
        background: active
          ? 'rgba(255,107,0,0.12)'
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        marginBottom: 10,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ color: active ? '#FF8C3A' : '#FFD580', fontWeight: 700, fontSize: 14 }}>
            {style.name}
            {active && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 10,
                  background: 'rgba(255,107,0,0.2)',
                  border: '1px solid rgba(255,107,0,0.5)',
                  borderRadius: 10,
                  padding: '1px 6px',
                  color: '#FF8C3A',
                }}
              >
                ACTIVE
              </span>
            )}
          </div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 11, marginTop: 2 }}>
            {style.region}
          </div>
        </div>
        <div style={{ color: 'rgba(255,220,160,0.6)', fontSize: 12, textAlign: 'right' }}>
          Height: {style.totalHeight}
        </div>
      </div>

      {/* Dominant shapes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
        {style.dominantShapes.map(shape => (
          <span
            key={shape}
            style={{
              fontSize: 10,
              padding: '2px 8px',
              borderRadius: 10,
              background: `rgba(${colorToRgb(SHAPE_COLORS[shape] || '#FFD580')}, 0.15)`,
              border: `1px solid rgba(${colorToRgb(SHAPE_COLORS[shape] || '#FFD580')}, 0.35)`,
              color: SHAPE_COLORS[shape] || '#FFD580',
              fontWeight: 600,
            }}
          >
            {shape}
          </span>
        ))}
      </div>

      {/* Description */}
      <p style={{ color: 'rgba(255,220,160,0.7)', fontSize: 12, lineHeight: 1.5, margin: 0 }}>
        {style.description}
      </p>
    </button>
  );
}

function colorToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default function StyleComparison({ activeStyle, onStyleChange, onClose }) {
  const current = TEMPLE_STYLES.find(s => s.id === activeStyle);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(8, 4, 0, 0.93)',
        backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(255,107,0,0.45)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 18px 32px',
        maxHeight: '75vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ color: '#FFD580', fontSize: 18, fontWeight: 700, margin: 0 }}>
            Temple Styles
          </h3>
          <p style={{ color: 'rgba(255,200,120,0.55)', fontSize: 12, margin: '3px 0 0' }}>
            Compare three major traditions of Indian sacred architecture
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,107,0,0.15)',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: 8,
            color: '#FF8C3A',
            width: 30,
            height: 30,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Style cards */}
      {TEMPLE_STYLES.map(style => (
        <StyleCard
          key={style.id}
          style={style}
          active={style.id === activeStyle}
          onClick={() => onStyleChange(style.id)}
        />
      ))}

      {/* Comparison table */}
      {current && (
        <div
          style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginTop: 4,
          }}
        >
          <div style={{ color: '#FF8C3A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
            {current.name} — Key Facts
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>Total Height</div>
              <div style={{ color: '#FFD580', fontWeight: 700 }}>{current.totalHeight}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>Region</div>
              <div style={{ color: '#FFD580', fontSize: 12 }}>{current.region}</div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10, marginBottom: 4 }}>Primary Shapes</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {current.dominantShapes.map(s => (
                  <span key={s} style={{ color: SHAPE_COLORS[s] || '#FFD580', fontSize: 12, fontWeight: 600 }}>
                    {s}
                  </span>
                )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} style={{ color: 'rgba(255,255,255,0.3)' }}> · </span>, el], [])}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
