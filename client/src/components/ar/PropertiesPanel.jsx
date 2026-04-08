import React, { useState, useEffect } from 'react';
import { calculateMeasurements } from '../../utils/threeHelpers';

const SHAPE_PARAM_CONFIG = {
  cube:       [{ key: 'width',        label: 'Side (a)',        min: 1, max: 20 }],
  cuboid:     [{ key: 'width',        label: 'Length',          min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 },
               { key: 'depth',        label: 'Depth',           min: 1, max: 20 }],
  sphere:     [{ key: 'radius',       label: 'Radius',          min: 1, max: 20 }],
  hemisphere: [{ key: 'radius',       label: 'Radius',          min: 1, max: 20 }],
  cone:       [{ key: 'radius',       label: 'Base Radius',     min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 }],
  cylinder:   [{ key: 'radiusTop',    label: 'Radius',          min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 }],
  pyramid:    [{ key: 'radius',       label: 'Base Apothem',    min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 }],
  prism:      [{ key: 'radius',       label: 'Triangle Radius', min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 }],
  frustum:    [{ key: 'radiusBottom', label: 'Base Radius (R)', min: 1, max: 20 },
               { key: 'radiusTop',    label: 'Top Radius (r)',  min: 1, max: 20 },
               { key: 'height',       label: 'Height',          min: 1, max: 20 }],
  torus:      [{ key: 'outerRadius',  label: 'Major Radius (R)',min: 2, max: 20 },
               { key: 'tube',         label: 'Tube Radius (r)', min: 0.5, max: 8 }],
};

export default function PropertiesPanel({
  shape,         // { type, params }
  onParamsChange,
  onDelete,
  onShowFormula,
  showFormula,
  expanded,
  onToggle,
}) {
  const [localParams, setLocalParams] = useState(shape?.params ?? {});

  useEffect(() => {
    if (shape) setLocalParams(shape.params);
  }, [shape]);

  if (!shape) return null;

  const { type } = shape;
  const paramConfig = SHAPE_PARAM_CONFIG[type] ?? [];
  const measurements = calculateMeasurements(type, localParams);

  const handleSlider = (key, value) => {
    let next = { ...localParams, [key]: Number(value) };
    // Keep cylinder top and bottom radii in sync so it stays a true cylinder
    if (type === 'cylinder' && key === 'radiusTop') {
      next = { ...next, radiusBottom: Number(value) };
    }
    setLocalParams(next);
    onParamsChange?.(next);
  };

  const typeName = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 rounded-t-3xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(8, 3, 0, 0.88)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,140,60,0.25)',
        maxHeight: expanded ? '75vh' : '60px',
        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Handle bar */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'rgba(255,107,0,0.25)' }}
          >
            📐
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color: '#FFD580' }}>{typeName}</span>
            {!expanded && (
              <span className="ml-2 text-xs" style={{ color: 'rgba(255,200,120,0.6)' }}>
                SA={measurements.surfaceArea} cm² · V={measurements.volume} cm³
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete?.(); }}
            className="px-2 py-1 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(239,68,68,0.20)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.30)' }}
          >
            Delete
          </button>
          <span style={{ color: 'rgba(255,200,120,0.5)', fontSize: 18 }}>
            {expanded ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 overflow-y-auto" style={{ maxHeight: '60vh' }}>

          {/* Dimensions */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,180,100,0.7)' }}>
              DIMENSIONS
            </p>
            <div className="space-y-3">
              {paramConfig.map(cfg => (
                <div key={cfg.key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs" style={{ color: 'rgba(255,220,160,0.85)' }}>
                      {cfg.label}
                    </label>
                    <span className="text-xs font-bold" style={{ color: '#FF8C3A' }}>
                      {localParams[cfg.key] ?? cfg.min} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    step={0.5}
                    value={localParams[cfg.key] ?? cfg.min}
                    onChange={e => handleSlider(cfg.key, e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF6B00 ${
                        ((localParams[cfg.key] ?? cfg.min) - cfg.min) / (cfg.max - cfg.min) * 100
                      }%, rgba(255,255,255,0.15) 0%)`,
                      accentColor: '#FF6B00',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Measurements */}
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.20)' }}
          >
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,180,100,0.7)' }}>
              MEASUREMENTS
            </p>
            <div className="flex gap-3">
              <div
                className="flex-1 rounded-lg p-2 text-center"
                style={{ background: 'rgba(255,107,0,0.15)' }}
              >
                <p className="text-xs" style={{ color: 'rgba(255,200,130,0.7)' }}>Surface Area</p>
                <p className="text-base font-bold" style={{ color: '#FF8C3A' }}>
                  {measurements.surfaceArea}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,200,130,0.5)' }}>cm²</p>
              </div>
              <div
                className="flex-1 rounded-lg p-2 text-center"
                style={{ background: 'rgba(212,160,23,0.15)' }}
              >
                <p className="text-xs" style={{ color: 'rgba(255,200,130,0.7)' }}>Volume</p>
                <p className="text-base font-bold" style={{ color: '#D4A017' }}>
                  {measurements.volume}
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,200,130,0.5)' }}>cm³</p>
              </div>
            </div>

            {/* Dimension chips */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(measurements.dimensions ?? {}).map(([k, v]) => (
                <span
                  key={k}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,220,160,0.8)' }}
                >
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>

          {/* Formula toggle */}
          <button
            onClick={() => onShowFormula?.(!showFormula)}
            className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: showFormula ? 'rgba(255,107,0,0.70)' : 'rgba(255,107,0,0.15)',
              border: '1px solid rgba(255,107,0,0.40)',
              color: showFormula ? '#fff' : '#FF8C3A',
            }}
          >
            {showFormula ? '✓ Hide Formula' : '📖 Show Formula'}
          </button>
        </div>
      )}
    </div>
  );
}
