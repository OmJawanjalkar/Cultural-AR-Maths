import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { COLORS, tooltipStyle, tooltipLabelStyle, axisTickStyle, gridStroke, performanceColor, ANIMATION_DURATION } from '../../utils/chartConfig'

const MOCK_DATA = {
  week: [
    { topic: 'Geometry', correct: 68, incorrect: 32 },
    { topic: 'Symmetry', correct: 81, incorrect: 19 },
    { topic: 'Arithmetic', correct: 74, incorrect: 26 },
    { topic: 'Mensuration', correct: 52, incorrect: 48 },
    { topic: 'Percentages', correct: 63, incorrect: 37 },
  ],
  month: [
    { topic: 'Geometry', correct: 72, incorrect: 28 },
    { topic: 'Symmetry', correct: 85, incorrect: 15 },
    { topic: 'Arithmetic', correct: 71, incorrect: 29 },
    { topic: 'Mensuration', correct: 55, incorrect: 45 },
    { topic: 'Percentages', correct: 68, incorrect: 32 },
  ],
  all: [
    { topic: 'Geometry', correct: 70, incorrect: 30 },
    { topic: 'Symmetry', correct: 83, incorrect: 17 },
    { topic: 'Arithmetic', correct: 73, incorrect: 27 },
    { topic: 'Mensuration', correct: 58, incorrect: 42 },
    { topic: 'Percentages', correct: 65, incorrect: 35 },
  ],
}

const PERIODS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const correct = payload.find(p => p.dataKey === 'correct')?.value ?? 0
  const incorrect = payload.find(p => p.dataKey === 'incorrect')?.value ?? 0
  const total = correct + incorrect
  return (
    <div style={{ ...tooltipStyle, minWidth: '150px' }}>
      <p style={{ ...tooltipLabelStyle, fontSize: '12px' }}>{label}</p>
      <p style={{ color: COLORS.saffron, margin: '2px 0', fontSize: '12px' }}>
        Avg Accuracy: <strong>{total > 0 ? Math.round((correct / total) * 100) : 0}%</strong>
      </p>
      <p style={{ color: COLORS.green, margin: '2px 0', fontSize: '11px' }}>✓ Correct: {correct}%</p>
      <p style={{ color: COLORS.red, margin: '2px 0', fontSize: '11px' }}>✗ Incorrect: {incorrect}%</p>
    </div>
  )
}

export default function ClassPerformanceChart({ data }) {
  const [period, setPeriod] = useState('month')
  const [stacked, setStacked] = useState(false)

  const chartData = (data?.[period] && data[period].length)
    ? data[period]
    : MOCK_DATA[period]

  return (
    <div>
      {/* Header row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Class Performance by Topic
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Stacked toggle */}
          <button
            onClick={() => setStacked(s => !s)}
            style={{
              padding: '5px 12px',
              background: stacked ? 'rgba(128,0,32,0.1)' : 'transparent',
              border: `1px solid ${stacked ? '#800020' : '#E5E7EB'}`,
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              color: stacked ? '#800020' : '#6B7280',
              cursor: 'pointer',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            {stacked ? 'Stacked ✓' : 'Stacked'}
          </button>

          {/* Period toggle */}
          <div style={{
            display: 'flex',
            background: '#F3F4F6',
            borderRadius: '20px',
            padding: '3px',
          }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: '4px 12px',
                  background: period === p.key ? '#FFFFFF' : 'transparent',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: period === p.key ? '700' : '500',
                  color: period === p.key ? '#FF6B00' : '#6B7280',
                  cursor: 'pointer',
                  fontFamily: '"Poppins", sans-serif',
                  boxShadow: period === p.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={chartData}
          margin={{ top: 0, right: 8, left: -10, bottom: 0 }}
          barSize={stacked ? 28 : 20}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="topic"
            tick={axisTickStyle}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={axisTickStyle}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: '"Noto Sans", sans-serif', paddingTop: '8px' }}
          />
          {stacked ? (
            <>
              <Bar
                dataKey="correct"
                name="Correct %"
                stackId="a"
                fill={COLORS.saffron}
                radius={[0, 0, 4, 4]}
                animationDuration={ANIMATION_DURATION}
              />
              <Bar
                dataKey="incorrect"
                name="Incorrect %"
                stackId="a"
                fill="rgba(239,68,68,0.4)"
                radius={[4, 4, 0, 0]}
                animationDuration={ANIMATION_DURATION}
              />
            </>
          ) : (
            <Bar
              dataKey="correct"
              name="Accuracy %"
              radius={[6, 6, 0, 0]}
              animationDuration={ANIMATION_DURATION}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={performanceColor(entry.correct)}
                />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>

      <p style={{
        fontSize: '11px',
        color: '#9CA3AF',
        textAlign: 'center',
        margin: '6px 0 0',
        fontFamily: '"Noto Sans", sans-serif',
      }}>
        Green &gt;80% · Saffron 60–80% · Red &lt;60%
      </p>
    </div>
  )
}
