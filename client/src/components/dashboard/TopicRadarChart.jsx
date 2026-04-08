const DEFAULT_DATA = {
  geometry: 50,
  symmetry: 50,
  arithmetic: 50,
  mensuration: 50,
  percentages: 50,
}

const AXES = [
  { key: 'geometry', label: 'Geometry' },
  { key: 'symmetry', label: 'Symmetry' },
  { key: 'arithmetic', label: 'Arithmetic' },
  { key: 'mensuration', label: 'Mensuration' },
  { key: 'percentages', label: 'Percentages' },
]

const CX = 150
const CY = 150
const RADIUS = 100

function toRadians(deg) {
  return (deg * Math.PI) / 180
}

function getPoint(angleRad, r) {
  return {
    x: CX + r * Math.sin(angleRad),
    y: CY - r * Math.cos(angleRad),
  }
}

function polygonPoints(r) {
  return AXES.map((_, i) => {
    const angle = toRadians(-90 + i * 72)
    const p = getPoint(angle, r)
    return `${p.x},${p.y}`
  }).join(' ')
}

export default function TopicRadarChart({ data }) {
  const values = { ...DEFAULT_DATA, ...data }

  // Axis label positions (at r=RADIUS + 20 for padding)
  const labelPositions = AXES.map((axis, i) => {
    const angle = toRadians(-90 + i * 72)
    const r = RADIUS + 24
    const p = getPoint(angle, r)
    return { ...p, label: axis.label }
  })

  // Data polygon
  const dataPoints = AXES.map((axis, i) => {
    const angle = toRadians(-90 + i * 72)
    const r = RADIUS * (Math.min(100, Math.max(0, values[axis.key])) / 100)
    return getPoint(angle, r)
  })

  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  // Concentric rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <h3 style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '600',
        fontSize: '16px',
        color: '#2D2D2D',
        margin: 0,
      }}>
        Topic Strengths
      </h3>
      <svg
        viewBox="0 0 300 300"
        style={{ width: '100%', maxWidth: '300px' }}
        aria-label="Topic radar chart"
      >
        {/* Concentric polygon rings */}
        {rings.map((scale, i) => (
          <polygon
            key={i}
            points={polygonPoints(RADIUS * scale)}
            fill="none"
            stroke="#E5E5E5"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines from center to outer ring */}
        {AXES.map((axis, i) => {
          const angle = toRadians(-90 + i * 72)
          const outer = getPoint(angle, RADIUS)
          return (
            <line
              key={axis.key}
              x1={CX} y1={CY}
              x2={outer.x} y2={outer.y}
              stroke="#E5E5E5"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={dataPolygon}
          fill="rgba(255,107,0,0.2)"
          stroke="#FF6B00"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="6"
            fill="#FF6B00"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}

        {/* Axis labels */}
        {labelPositions.map(({ x, y, label }, i) => {
          // Adjust text-anchor based on position
          let textAnchor = 'middle'
          const angle = -90 + i * 72
          if (angle > -80 && angle < 80) textAnchor = 'middle'
          if (angle >= 10 && angle <= 170) textAnchor = 'start'
          if (angle >= -170 && angle <= -10) textAnchor = 'end'
          if (Math.abs(angle) < 10 || Math.abs(angle) > 170) textAnchor = 'middle'

          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              style={{
                fontSize: '11px',
                fill: '#2D2D2D',
                fontFamily: '"Noto Sans", sans-serif',
                fontWeight: '600',
              }}
            >
              {label}
            </text>
          )
        })}

        {/* Percentage labels on rings */}
        {[25, 50, 75, 100].map(pct => {
          const p = getPoint(toRadians(-90), RADIUS * (pct / 100))
          return (
            <text
              key={pct}
              x={p.x + 4}
              y={p.y}
              style={{
                fontSize: '9px',
                fill: '#6B6B6B',
                fontFamily: '"Noto Sans", sans-serif',
              }}
            >
              {pct}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
