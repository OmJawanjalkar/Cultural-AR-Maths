/**
 * CulturalNotes.jsx
 * Floating panel displaying scrollable cultural / historical notes
 * about temple architecture and its mathematical foundations.
 */

const NOTES = [
  {
    title: 'Vastu Shastra & Sacred Geometry',
    icon: '🔱',
    body: 'Vastu Shastra is an ancient Hindu treatise on architecture. Every temple is laid out on a Vastu Purusha Mandala — a 8×8 or 9×9 grid overlaid on the plan. The grid divides the temple into 64 or 81 energy zones, each governed by a deity. This grid is the basis of all proportional relationships in the temple.',
  },
  {
    title: 'Agama Shastras — Instruction Manuals',
    icon: '📜',
    body: 'The Agama Shastras are ancient Sanskrit texts that specify exact proportions for every element of a temple: the height-to-width ratio of the tower, the spacing of pillars, the diameter of the Kalasha. Architects (Sthapatis) memorised these texts as mathematical laws. The specifications are so precise they can be computed exactly.',
  },
  {
    title: 'Geometric Progressions in the Gopuram',
    icon: '📐',
    body: 'Each tier of a South Indian Gopuram has a width that is a constant fraction of the tier below. This creates a geometric progression. The ancient architects discovered that with a ratio slightly less than 1, the visual impression is of a tower that tapers to infinity — even though the actual height is finite. This is an intuitive grasp of convergent series, formalised mathematically millennia later.',
  },
  {
    title: 'The Hemisphere as Optimal Form',
    icon: '⭕',
    body: 'For a given surface area, the sphere encloses the maximum volume. The hemisphere, being half a sphere, shares this property. Indo-Islamic architects selected the dome form not only for religious symbolism but because it is structurally efficient — it distributes load evenly along curved surfaces, minimising tensile stress. This is the same principle used in modern shell structures.',
  },
  {
    title: 'Pillar Mathematics',
    icon: '🏛️',
    body: 'The spacing between temple pillars was calculated using precise ratios to ensure that the load-bearing capacity was maximised while the visual rhythm was harmonious. Cylindrical pillars were preferred over square pillars because the circle distributes compressive stress evenly around its perimeter. Ancient builders empirically derived the same result that structural mechanics proves analytically.',
  },
  {
    title: 'Fractal Self-Similarity',
    icon: '✨',
    body: 'In many Indian temple styles, the overall form of the tower is replicated at smaller scales on its own surface — small "miniature towers" (Urushringa) appear on the sides of the main tower. This deliberate self-similar structure is a precursor to the mathematical concept of fractals, formalised by Benoit Mandelbrot in 1975. Scholars argue that ancient Indian temple architects intuitively understood scale invariance.',
  },
];

export default function CulturalNotes({ onClose }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        right: 0,
        width: 'min(340px, 90vw)',
        bottom: 0,
        zIndex: 40,
        background: 'rgba(8, 4, 0, 0.94)',
        backdropFilter: 'blur(16px)',
        borderLeft: '2px solid rgba(212,160,23,0.4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 18px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div>
          <h3 style={{ color: '#D4A017', fontSize: 16, fontWeight: 700, margin: 0 }}>
            Cultural Notes
          </h3>
          <p style={{ color: 'rgba(255,200,100,0.5)', fontSize: 11, margin: '2px 0 0' }}>
            Maths behind the architecture
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(212,160,23,0.15)',
            border: '1px solid rgba(212,160,23,0.3)',
            borderRadius: 8,
            color: '#D4A017',
            width: 30,
            height: 30,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable notes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 24px' }}>
        {NOTES.map((note, i) => (
          <div
            key={i}
            style={{
              marginBottom: 16,
              background: 'rgba(212,160,23,0.06)',
              border: '1px solid rgba(212,160,23,0.15)',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 18 }}>{note.icon}</span>
              <h4 style={{ color: '#FFD580', fontSize: 13, fontWeight: 700, margin: 0 }}>
                {note.title}
              </h4>
            </div>
            <p style={{ color: 'rgba(255,220,160,0.8)', fontSize: 12, lineHeight: 1.65, margin: 0 }}>
              {note.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
