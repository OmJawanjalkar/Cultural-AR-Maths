/**
 * DecomposeView.jsx
 * UI panel controlling the decompose / reassemble animation of the temple.
 * Actual Three.js animation is driven by TempleModel receiving the `decomposed` prop.
 */

export default function DecomposeView({ decomposed, onToggle }) {
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
        padding: '22px 20px 32px',
      }}
    >
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ color: '#FFD580', fontSize: 18, fontWeight: 700, margin: 0 }}>
          Decompose Mode
        </h3>
        <p style={{ color: 'rgba(255,200,120,0.65)', fontSize: 13, margin: '4px 0 0' }}>
          Explode the temple into its geometric parts to see each shape individually.
        </p>
      </div>

      {/* Info cards (visible when decomposed) */}
      {decomposed && (
        <div
          style={{
            background: 'rgba(255,107,0,0.08)',
            border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 16,
          }}
        >
          <p style={{ color: 'rgba(255,220,160,0.85)', fontSize: 13, lineHeight: 1.55, margin: 0 }}>
            Each floating part is a distinct geometric solid. Tap any part in the AR view to see its
            shape, dimensions, formula, and cultural significance.
          </p>
          <ul style={{ color: '#FFD580', fontSize: 12, margin: '10px 0 0', paddingLeft: 18, lineHeight: 1.9 }}>
            <li>Base — Cuboid (Rectangular Prism)</li>
            <li>Main Hall — Cuboid</li>
            <li>Pillars — Cylinders (×4)</li>
            <li>Inner Sanctum — Cuboid</li>
            <li>Tower Tiers — Frustums of Cones (×4)</li>
            <li>Crown — Hemisphere + Cylinder</li>
          </ul>
        </div>
      )}

      {/* Main CTA button */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 12,
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 16,
          letterSpacing: 0.3,
          transition: 'all 0.2s ease',
          background: decomposed
            ? 'linear-gradient(135deg, #1e6b3a, #0d4025)'
            : 'linear-gradient(135deg, #FF6B00, #C45000)',
          color: '#fff',
          boxShadow: decomposed
            ? '0 4px 16px rgba(74,222,128,0.2)'
            : '0 4px 16px rgba(255,107,0,0.35)',
        }}
      >
        {decomposed ? '⬛ Reassemble Temple' : '⬜ Decompose Temple'}
      </button>

      {/* Instruction hint */}
      <p
        style={{
          color: 'rgba(255,200,120,0.45)',
          fontSize: 12,
          textAlign: 'center',
          marginTop: 10,
          marginBottom: 0,
        }}
      >
        {decomposed
          ? 'Parts fly back to their original positions'
          : 'Parts will fly outward and float in space'}
      </p>
    </div>
  );
}
