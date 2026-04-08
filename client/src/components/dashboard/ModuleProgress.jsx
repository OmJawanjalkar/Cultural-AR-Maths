import { useNavigate } from 'react-router-dom'

const MODULES = [
  {
    id: 'temple',
    route: '/ar/temple',
    quizRoute: '/quiz/geometry',
    icon: '🕌',
    name: 'Temple Architecture',
    description: 'Geometry & Surface Area',
    color: '#FF6B00',
    bg: 'rgba(255,107,0,0.08)',
  },
  {
    id: 'rangoli',
    route: '/ar/rangoli',
    quizRoute: '/quiz/symmetry',
    icon: '🌸',
    name: 'Rangoli Symmetry',
    description: 'Symmetry & Patterns',
    color: '#800020',
    bg: 'rgba(128,0,32,0.07)',
  },
  {
    id: 'sabzi',
    route: '/ar/sabzi',
    quizRoute: '/quiz/arithmetic',
    icon: '🥬',
    name: 'Sabzi Mandi',
    description: 'Arithmetic & Percentages',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.08)',
  },
  {
    id: 'geometry',
    route: '/ar/geometry',
    quizRoute: '/quiz/3d-geometry',
    icon: '📐',
    name: '3D Geometry',
    description: 'Volume & Mensuration',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.08)',
  },
  {
    id: 'all',
    route: '/quiz/all',
    quizRoute: '/quiz/all',
    icon: '🧠',
    name: 'Quick Quiz',
    description: 'All Topics Mixed',
    color: '#D4A017',
    bg: 'rgba(212,160,23,0.08)',
  },
]

// Mock module data
const MOCK_PROGRESS = {
  temple: { completed: 7, total: 10, accuracy: 82, timeSpent: '2h 15m' },
  rangoli: { completed: 10, total: 10, accuracy: 91, timeSpent: '3h 40m' },
  sabzi: { completed: 4, total: 10, accuracy: 67, timeSpent: '1h 20m' },
  geometry: { completed: 2, total: 10, accuracy: 73, timeSpent: '45m' },
  all: { completed: 0, total: 10, accuracy: 0, timeSpent: '0m' },
}

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ background: '#F0EDE8', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: color,
        borderRadius: '99px',
        transition: 'width 0.8s ease',
      }} />
    </div>
  )
}

function PulseButton({ label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        background: `${color}15`,
        border: `1.5px solid ${color}40`,
        borderRadius: '20px',
        color,
        fontSize: '12px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: '"Poppins", sans-serif',
        animation: 'pulseBtn 2s infinite',
        transition: 'background 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = `${color}25` }}
      onMouseLeave={e => { e.currentTarget.style.background = `${color}15` }}
    >
      {label}
    </button>
  )
}

export default function ModuleProgress({ moduleData }) {
  const navigate = useNavigate()

  // Merge backend data with mock fallback
  const progressMap = { ...MOCK_PROGRESS, ...(moduleData || {}) }

  return (
    <div>
      <style>{`
        @keyframes pulseBtn {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,107,0,0.3); }
          50% { box-shadow: 0 0 0 5px rgba(255,107,0,0); }
        }
      `}</style>

      <h3 style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '600',
        fontSize: '16px',
        color: '#2D2D2D',
        margin: '0 0 16px',
      }}>
        Module Progress
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
      }}>
        {MODULES.map((mod) => {
          const prog = progressMap[mod.id] || { completed: 0, total: 10, accuracy: 0, timeSpent: '0m' }
          const isDone = prog.completed >= prog.total
          const isNew = prog.completed === 0

          return (
            <div
              key={mod.id}
              style={{
                background: '#FFFFFF',
                border: `1.5px solid ${isDone ? mod.color + '40' : '#F0EDE8'}`,
                borderRadius: '12px',
                padding: '16px 18px',
                position: 'relative',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = `0 4px 20px ${mod.color}20`
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Completed badge */}
              {isDone && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  fontSize: '18px',
                }}>
                  🏆
                </div>
              )}

              {/* Module header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: mod.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                }}>
                  {mod.icon}
                </div>
                <div>
                  <p style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#2D2D2D',
                    margin: 0,
                  }}>
                    {mod.name}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#6B7280',
                    margin: 0,
                    fontFamily: '"Noto Sans", sans-serif',
                  }}>
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: '"Noto Sans", sans-serif' }}>
                    {prog.completed}/{prog.total} challenges
                  </span>
                  {prog.accuracy > 0 && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: prog.accuracy >= 70 ? '#22C55E' : '#FF6B00',
                      fontFamily: '"Poppins", sans-serif',
                    }}>
                      {prog.accuracy}% accuracy
                    </span>
                  )}
                </div>
                <ProgressBar value={prog.completed} max={prog.total} color={mod.color} />
              </div>

              {/* Meta row + action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>
                  ⏱ {prog.timeSpent}
                </span>
                {isNew ? (
                  <PulseButton
                    label="Start →"
                    onClick={() => navigate(mod.route)}
                    color={mod.color}
                  />
                ) : (
                  <button
                    onClick={() => navigate(isDone ? mod.quizRoute : mod.route)}
                    style={{
                      padding: '6px 14px',
                      background: mod.color,
                      border: 'none',
                      borderRadius: '20px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      fontFamily: '"Poppins", sans-serif',
                      transition: 'filter 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                  >
                    {isDone ? 'Review' : 'Continue'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
