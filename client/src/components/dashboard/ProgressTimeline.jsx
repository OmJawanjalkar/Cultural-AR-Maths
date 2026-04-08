import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
} from 'recharts'
import { COLORS, tooltipStyle, tooltipLabelStyle, axisTickStyle, gridStroke, ANIMATION_DURATION } from '../../utils/chartConfig'

// Generate 30 days of mock timeline data
function generateMockTimeline() {
  const data = []
  const today = new Date()
  let base = 55
  let classBase = 62
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    base = Math.min(100, Math.max(20, base + (Math.random() - 0.42) * 12))
    classBase = Math.min(95, Math.max(40, classBase + (Math.random() - 0.45) * 8))
    data.push({
      date: label,
      accuracy: Math.round(base),
      classAvg: Math.round(classBase),
      correct: Math.round(base * 0.2),
      total: 20,
    })
  }
  return data
}

const MOCK_TIMELINE = generateMockTimeline()

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...tooltipStyle, minWidth: '160px' }}>
      <p style={{ ...tooltipLabelStyle, fontSize: '11px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontSize: '12px' }}>
          {p.name}: <strong>{p.value}%</strong>
          {p.dataKey === 'accuracy' && p.payload.total
            ? ` (${p.payload.correct}/${p.payload.total})`
            : ''}
        </p>
      ))}
    </div>
  )
}

function calcTrend(data) {
  if (!data || data.length < 2) return null
  const first = data.slice(0, 7).reduce((s, d) => s + d.accuracy, 0) / Math.min(7, data.length)
  const last = data.slice(-7).reduce((s, d) => s + d.accuracy, 0) / Math.min(7, data.length)
  const delta = Math.round(last - first)
  return delta
}

export default function ProgressTimeline({ data }) {
  const chartData = (data && data.length >= 3) ? data : MOCK_TIMELINE
  const trend = calcTrend(chartData)

  const trendText = trend === null
    ? null
    : trend > 0
    ? `↑ ${trend}% improvement this month`
    : trend < 0
    ? `↓ ${Math.abs(trend)}% — keep practicing!`
    : 'Stable performance this month'

  const trendColor = trend > 0 ? COLORS.green : trend < 0 ? COLORS.red : COLORS.grey

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Accuracy Over Time
        </h3>
        {trendText && (
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: trendColor,
            background: `${trendColor}15`,
            padding: '4px 10px',
            borderRadius: '20px',
            fontFamily: '"Noto Sans", sans-serif',
          }}>
            {trendText}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.saffron} stopOpacity={0.25} />
              <stop offset="95%" stopColor={COLORS.saffron} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="date"
            tick={axisTickStyle}
            interval={4}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={axisTickStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: '"Noto Sans", sans-serif', paddingTop: '8px' }}
          />
          <ReferenceLine y={60} stroke={COLORS.red} strokeDasharray="4 4" strokeWidth={1} label={{ value: '60%', fill: COLORS.red, fontSize: 9 }} />
          <Area
            type="monotone"
            dataKey="accuracy"
            name="My Accuracy"
            stroke={COLORS.saffron}
            strokeWidth={2.5}
            fill="url(#accGrad)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.saffron, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={ANIMATION_DURATION}
          />
          <Line
            type="monotone"
            dataKey="classAvg"
            name="Class Avg"
            stroke={COLORS.grey}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4, fill: COLORS.grey }}
            animationDuration={ANIMATION_DURATION}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        textAlign: 'center',
        margin: '8px 0 0',
        fontFamily: '"Noto Sans", sans-serif',
      }}>
        Last 30 days · Dashed line = class average
      </p>
    </div>
  )
}
