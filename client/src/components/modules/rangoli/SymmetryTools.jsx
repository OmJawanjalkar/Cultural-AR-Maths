/**
 * SymmetryTools.jsx
 * UI panel for selecting symmetry drawing modes: reflect, rotate, translate.
 * Pure UI — no Three.js. Calls onConfigChange when settings change.
 *
 * Props:
 *   config         { mode, axisType, rotationOrder, isKolam, drawColor }
 *   onConfigChange (newConfig) => void
 *   onClear        () => void — clear all strokes
 */

const BTN = {
  base: {
    border: '1px solid rgba(255,107,0,0.35)',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 10px',
    background: 'rgba(0,0,0,0.4)',
    color: 'rgba(255,210,140,0.8)',
    transition: 'all 0.15s',
  },
  active: {
    background: 'rgba(255,107,0,0.25)',
    borderColor: '#FF6B00',
    color: '#FF8C3A',
  },
};

function ToolBtn({ label, active, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{ ...BTN.base, ...(active ? BTN.active : {}) }}
    >
      {label}
    </button>
  );
}

const SWATCH_COLORS = [
  '#FFFFFF', '#FF6B35', '#FFD700', '#FF1493',
  '#00CED1', '#7FFF00', '#FF8C00', '#AA00FF',
];

const MODES = [
  { id: 'none',      label: 'Free Draw', icon: '✏️' },
  { id: 'reflect',   label: 'Reflect',   icon: '↔️' },
  { id: 'rotate',    label: 'Rotate',    icon: '🔄' },
  { id: 'translate', label: 'Tile',      icon: '⬛' },
];

const AXES = [
  { id: 'vertical',    label: '|  Vertical'   },
  { id: 'horizontal',  label: '— Horizontal'  },
  { id: 'diagonal-/',  label: '/ Diagonal'    },
  { id: 'diagonal-\\', label: '\\ Diagonal'   },
];

const ROTATION_ORDERS = [2, 3, 4, 6, 8];

export default function SymmetryTools({ config, onConfigChange, onClear }) {
  const { mode, axisType, rotationOrder, isKolam, drawColor } = config;

  const update = (patch) => onConfigChange({ ...config, ...patch });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '10px 12px',
        background: 'rgba(6,3,0,0.92)',
        backdropFilter: 'blur(16px)',
        borderRight: '1.5px solid rgba(255,107,0,0.25)',
        minWidth: 130,
        overflowY: 'auto',
        maxHeight: '70vh',
      }}
    >
      {/* Mode select */}
      <div>
        <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>
          Mode
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MODES.map(m => (
            <ToolBtn
              key={m.id}
              label={`${m.icon} ${m.label}`}
              active={mode === m.id}
              onClick={() => update({ mode: m.id })}
            />
          ))}
        </div>
      </div>

      {/* Axis selector (reflect mode only) */}
      {mode === 'reflect' && (
        <div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>
            Mirror Axis
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {AXES.map(a => (
              <ToolBtn
                key={a.id}
                label={a.label}
                active={axisType === a.id}
                onClick={() => update({ axisType: a.id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rotation order (rotate mode only) */}
      {mode === 'rotate' && (
        <div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>
            Fold
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {ROTATION_ORDERS.map(n => (
              <ToolBtn
                key={n}
                label={`${n}×`}
                title={`${n}-fold (${(360 / n).toFixed(0)}° per copy)`}
                active={rotationOrder === n}
                onClick={() => update({ rotationOrder: n })}
              />
            ))}
          </div>
          {/* Angle display */}
          <div style={{
            marginTop: 6,
            padding: '5px 8px',
            background: 'rgba(255,107,0,0.1)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: 6,
            textAlign: 'center',
          }}>
            <div style={{ color: 'rgba(255,200,100,0.55)', fontSize: 9 }}>Angle</div>
            <div style={{ color: '#FFD700', fontSize: 16, fontWeight: 700 }}>
              {(360 / rotationOrder).toFixed(0)}°
            </div>
          </div>
        </div>
      )}

      {/* Colour swatches */}
      <div>
        <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>
          Colour
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {SWATCH_COLORS.map(c => (
            <button
              key={c}
              onClick={() => update({ drawColor: c })}
              title={c}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c,
                border: drawColor === c
                  ? '2.5px solid #FFD700'
                  : '1.5px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Style toggle */}
      <div>
        <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 9, marginBottom: 5, letterSpacing: 1, textTransform: 'uppercase' }}>
          Style
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ToolBtn
            label="🤍 Kolam"
            active={isKolam}
            onClick={() => update({ isKolam: true, drawColor: '#FFFFFF' })}
          />
          <ToolBtn
            label="🌈 Rangoli"
            active={!isKolam}
            onClick={() => update({ isKolam: false })}
          />
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={onClear}
        style={{
          ...BTN.base,
          background: 'rgba(255,50,50,0.15)',
          borderColor: 'rgba(255,80,80,0.4)',
          color: '#FF8080',
          marginTop: 4,
        }}
      >
        🗑 Clear
      </button>
    </div>
  );
}
