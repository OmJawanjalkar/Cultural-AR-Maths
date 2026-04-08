/**
 * AngleOverlay.jsx
 * UI controls for toggling angle, symmetry, and proportion overlays.
 * Actual Three.js overlay objects are created in TempleModel.
 */

const TOGGLE_ITEMS = [
  {
    key: 'showAngles',
    label: 'Angles',
    icon: '∠',
    description: 'Draws right-angle markers at base corners and slant-angle arcs on the shikhara.',
    color: '#00FFFF',
  },
  {
    key: 'showSymmetry',
    label: 'Symmetry Axes',
    icon: '⊕',
    description: 'Shows the vertical axis of symmetry and 4-fold rotational symmetry cross.',
    color: '#FF66FF',
  },
  {
    key: 'showProportions',
    label: 'Proportions',
    icon: '∝',
    description: 'Highlights the proportional relationship between the base width and tower height.',
    color: '#FFFF00',
  },
];

function OverlayToggle({ item, active, onToggle }) {
  return (
    <button
      onClick={() => onToggle(item.key)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${active ? item.color + '55' : 'rgba(255,255,255,0.1)'}`,
        background: active
          ? `rgba(${hexToRgb(item.color)}, 0.1)`
          : 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s ease',
        marginBottom: 8,
      }}
    >
      {/* Icon circle */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: active ? `rgba(${hexToRgb(item.color)}, 0.2)` : 'rgba(255,255,255,0.06)',
          border: `1.5px solid ${active ? item.color : 'rgba(255,255,255,0.15)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: active ? item.color : 'rgba(255,255,255,0.4)',
          flexShrink: 0,
        }}
      >
        {item.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: active ? item.color : '#FFD580',
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 3,
          }}
        >
          {item.label}
          {active && (
            <span
              style={{
                marginLeft: 8,
                fontSize: 10,
                background: `rgba(${hexToRgb(item.color)}, 0.2)`,
                border: `1px solid ${item.color}`,
                borderRadius: 10,
                padding: '1px 6px',
                color: item.color,
              }}
            >
              ON
            </span>
          )}
        </div>
        <div style={{ color: 'rgba(255,220,160,0.6)', fontSize: 12, lineHeight: 1.4 }}>
          {item.description}
        </div>
      </div>
    </button>
  );
}

// Simple hex → "r,g,b" converter for rgba usage
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export default function AngleOverlay({ showAngles, showSymmetry, showProportions, onToggle, onClose }) {
  const anyActive = showAngles || showSymmetry || showProportions;

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
        padding: '20px 18px 30px',
        maxHeight: '60vh',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ color: '#FFD580', fontSize: 18, fontWeight: 700, margin: 0 }}>
            Geometric Overlays
          </h3>
          <p style={{ color: 'rgba(255,200,120,0.55)', fontSize: 12, margin: '3px 0 0' }}>
            Toggle visualisations on the AR temple
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

      {/* Toggle items */}
      {TOGGLE_ITEMS.map(item => (
        <OverlayToggle
          key={item.key}
          item={item}
          active={
            item.key === 'showAngles'      ? showAngles :
            item.key === 'showSymmetry'    ? showSymmetry :
            item.key === 'showProportions' ? showProportions : false
          }
          onToggle={onToggle}
        />
      ))}

      {/* Clear all */}
      {anyActive && (
        <button
          onClick={() => {
            if (showAngles)      onToggle('showAngles');
            if (showSymmetry)    onToggle('showSymmetry');
            if (showProportions) onToggle('showProportions');
          }}
          style={{
            marginTop: 4,
            width: '100%',
            padding: '9px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent',
            color: 'rgba(255,200,100,0.5)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Clear all overlays
        </button>
      )}
    </div>
  );
}
