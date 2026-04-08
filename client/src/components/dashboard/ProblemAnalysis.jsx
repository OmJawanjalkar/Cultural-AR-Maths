import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { COLORS, tooltipStyle, tooltipLabelStyle, ANIMATION_DURATION } from '../../utils/chartConfig'

const MOCK_FAILED_QUESTIONS = [
  { question: 'What is the surface area of a cylinder with r=7, h=10?', module: 'Temple', difficulty: 4, failRate: 72, attempts: 156 },
  { question: 'Find the line of symmetry in this Rangoli pattern', module: 'Rangoli', difficulty: 3, failRate: 65, attempts: 134 },
  { question: 'If 40% of 250 vegetables are sold, how many remain?', module: 'Sabzi Mandi', difficulty: 2, failRate: 58, attempts: 198 },
  { question: 'Calculate the volume of a cone with r=5, h=12', module: '3D Geometry', difficulty: 4, failRate: 81, attempts: 112 },
  { question: 'What is the perimeter of a semicircle with diameter 14?', module: 'Temple', difficulty: 3, failRate: 54, attempts: 167 },
  { question: 'A vendor earns 20% profit. Cost price = ₹80. Selling price?', module: 'Sabzi Mandi', difficulty: 2, failRate: 47, attempts: 210 },
  { question: 'How many axes of symmetry does a regular hexagon have?', module: 'Rangoli', difficulty: 1, failRate: 35, attempts: 245 },
]

const MOCK_PIE_DATA = [
  { name: 'Temple Architecture', value: 38, color: COLORS.saffron },
  { name: 'Rangoli Symmetry', value: 22, color: COLORS.maroon },
  { name: 'Sabzi Mandi', value: 25, color: COLORS.green },
  { name: '3D Geometry', value: 15, color: COLORS.blue },
]

const DIFFICULTY_LABELS = ['', 'Very Easy', 'Easy', 'Medium', 'Hard', 'Expert']

function FailRateBadge({ rate }) {
  const color = rate >= 70 ? '#EF4444' : rate >= 50 ? '#FF6B00' : '#D4A017'
  const bg = rate >= 70 ? 'rgba(239,68,68,0.1)' : rate >= 50 ? 'rgba(255,107,0,0.1)' : 'rgba(212,160,23,0.12)'
  return (
    <span style={{
      background: bg,
      color,
      fontFamily: '"Poppins", sans-serif',
      fontWeight: '700',
      fontSize: '12px',
      padding: '2px 8px',
      borderRadius: '12px',
      whiteSpace: 'nowrap',
    }}>
      {rate}% fail
    </span>
  )
}

function DiffDots({ level }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: i < level ? '#FF6B00' : '#E5E7EB',
        }} />
      ))}
    </div>
  )
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...tooltipStyle }}>
      <p style={{ ...tooltipLabelStyle, fontSize: '12px' }}>{payload[0].name}</p>
      <p style={{ color: payload[0].fill, margin: 0, fontSize: '12px' }}>
        Wrong answers: <strong>{payload[0].value}%</strong>
      </p>
    </div>
  )
}

export default function ProblemAnalysis({ data }) {
  const questions = data?.failedQuestions || MOCK_FAILED_QUESTIONS
  const pieData = data?.topicDifficulty || MOCK_PIE_DATA

  const sorted = [...questions].sort((a, b) => b.failRate - a.failRate)

  return (
    <div>
      <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
        Problem Analysis
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(220px, 280px)', gap: '24px', alignItems: 'start' }}>
        {/* Failed questions table */}
        <div>
          <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 10px' }}>
            Most Failed Questions
          </h4>
          <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,107,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,107,0,0.04)' }}>
                  {['Question', 'Module', 'Difficulty', 'Fail Rate', 'Attempts'].map(h => (
                    <th key={h} style={{
                      padding: '9px 12px',
                      textAlign: 'left',
                      fontSize: '10px',
                      color: '#6B7280',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((q, i) => (
                  <tr
                    key={i}
                    style={{
                      background: i % 2 === 0 ? '#FFFFFF' : 'rgba(255,107,0,0.012)',
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                    }}
                  >
                    <td style={{ padding: '10px 12px', maxWidth: '280px' }}>
                      <p style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#2D2D2D',
                        fontFamily: '"Noto Sans", sans-serif',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '280px',
                      }}
                        title={q.question}
                      >
                        {q.question}
                      </p>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: '"Noto Sans", sans-serif' }}>
                        {q.module}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div title={DIFFICULTY_LABELS[q.difficulty]}>
                        <DiffDots level={q.difficulty} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <FailRateBadge rate={q.failRate} />
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: '#4B5563', fontFamily: '"Noto Sans", sans-serif' }}>
                      {q.attempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pie chart */}
        <div>
          <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 10px' }}>
            Wrong Answers by Topic
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                animationDuration={ANIMATION_DURATION}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: '11px', color: '#4B5563', fontFamily: '"Noto Sans", sans-serif' }}>
                    {value}
                  </span>
                )}
                iconSize={10}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
