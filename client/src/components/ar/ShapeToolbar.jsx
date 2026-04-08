import React from 'react';

const SHAPES = [
  { type: 'cube',      label: 'Cube',      emoji: '⬛' },
  { type: 'cuboid',    label: 'Cuboid',    emoji: '📦' },
  { type: 'sphere',    label: 'Sphere',    emoji: '🔵' },
  { type: 'hemisphere',label: 'Hemi',      emoji: '🌐' },
  { type: 'cone',      label: 'Cone',      emoji: '🔺' },
  { type: 'cylinder',  label: 'Cylinder',  emoji: '🥫' },
  { type: 'pyramid',   label: 'Pyramid',   emoji: '🔷' },
  { type: 'prism',     label: 'Prism',     emoji: '📐' },
  { type: 'frustum',   label: 'Frustum',   emoji: '🏺' },
  { type: 'torus',     label: 'Torus',     emoji: '🍩' },
];

const MAX_SHAPES = 3;

export default function ShapeToolbar({
  onShapeSelect,
  activeShapeType,
  shapeCount = 0,
  activeMode,
  onModeChange,
}) {
  const full = shapeCount >= MAX_SHAPES;

  const ACTION_BTNS = [
    { id: 'idle',    icon: '✋', label: 'Select' },
    { id: 'slice',   icon: '✂️',  label: 'Slice'  },
    { id: 'unfold',  icon: '📄', label: 'Unfold' },
    { id: 'compare', icon: '⚖️',  label: 'Compare'},
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col gap-2 pb-4 px-4">

      {/* Action buttons row */}
      <div className="flex justify-center gap-2">
        {ACTION_BTNS.map(btn => (
          <button
            key={btn.id}
            onClick={() => onModeChange?.(btn.id)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: activeMode === btn.id
                ? 'rgba(255,107,0,0.80)'
                : 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${activeMode === btn.id ? '#FF6B00' : 'rgba(255,255,255,0.18)'}`,
              color: activeMode === btn.id ? '#fff' : 'rgba(255,220,160,0.9)',
              minWidth: 60,
            }}
          >
            <span className="text-lg leading-none">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      {/* Shape strip */}
      <div
        className="rounded-2xl overflow-x-auto"
        style={{
          background: 'rgba(0,0,0,0.60)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.14)',
        }}
      >
        {/* Capacity indicator */}
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <span className="text-xs font-medium" style={{ color: 'rgba(255,200,120,0.8)' }}>
            Tap a shape to spawn
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: full ? 'rgba(239,68,68,0.25)' : 'rgba(255,107,0,0.20)',
              color: full ? '#fca5a5' : '#FFD580',
              border: `1px solid ${full ? 'rgba(239,68,68,0.4)' : 'rgba(255,107,0,0.4)'}`,
            }}
          >
            {shapeCount}/{MAX_SHAPES} shapes
          </span>
        </div>

        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-thin">
          {SHAPES.map(shape => {
            const isActive = activeShapeType === shape.type;
            return (
              <button
                key={shape.type}
                onClick={() => {
                  if (full && !isActive) return;
                  onShapeSelect?.(shape.type);
                }}
                disabled={full && !isActive}
                className="flex flex-col items-center gap-1 flex-shrink-0 px-3 py-2 rounded-xl transition-all"
                style={{
                  minWidth: 62,
                  background: isActive
                    ? 'rgba(255,107,0,0.75)'
                    : full
                      ? 'rgba(50,20,10,0.60)'
                      : 'rgba(60,25,5,0.55)',
                  border: `1px solid ${isActive ? '#FF6B00' : 'rgba(255,140,60,0.25)'}`,
                  opacity: full && !isActive ? 0.45 : 1,
                  transform: isActive ? 'translateY(-2px)' : 'none',
                  boxShadow: isActive ? '0 4px 16px rgba(255,107,0,0.4)' : 'none',
                  cursor: full && !isActive ? 'not-allowed' : 'pointer',
                }}
                title={full && !isActive ? 'Remove a shape first' : `Add ${shape.label}`}
              >
                <span className="text-2xl leading-none">{shape.emoji}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: isActive ? '#fff' : 'rgba(255,200,140,0.85)' }}
                >
                  {shape.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overflow warning */}
      {full && (
        <p
          className="text-center text-xs font-medium py-1 rounded-lg"
          style={{
            background: 'rgba(239,68,68,0.20)',
            color: '#fca5a5',
            border: '1px solid rgba(239,68,68,0.35)',
          }}
        >
          Remove a shape first (tap selected shape → Delete)
        </p>
      )}
    </div>
  );
}
