function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ScoreBadge({ score, total }) {
  const pct = total > 0 ? (score / total) * 100 : 0
  let bg, color
  if (pct >= 70) { bg = 'rgba(34,197,94,0.12)'; color = '#16A34A' }
  else if (pct >= 50) { bg = 'rgba(255,107,0,0.12)'; color = '#FF6B00' }
  else { bg = 'rgba(239,68,68,0.1)'; color = '#EF4444' }
  return (
    <span style={{
      background: bg,
      color,
      fontFamily: '"Poppins", sans-serif',
      fontWeight: '700',
      fontSize: '13px',
      padding: '4px 10px',
      borderRadius: '20px',
      whiteSpace: 'nowrap',
    }}>
      {score}/{total}
    </span>
  )
}

const MODULE_COLORS = [
  '#FF6B00', '#800020', '#D4A017', '#22C55E', '#6366F1',
  '#EC4899', '#14B8A6', '#F59E0B',
]

function moduleColor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return MODULE_COLORS[Math.abs(hash) % MODULE_COLORS.length]
}

function moduleInitial(name = '') {
  return name.trim().charAt(0).toUpperCase() || '?'
}

export default function RecentActivity({ activities = [] }) {
  const list = activities.slice(0, 10)

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(255,107,0,0.08)',
    }}>
      <h3 style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '600',
        fontSize: '16px',
        color: '#2D2D2D',
        margin: '0 0 16px 0',
      }}>
        Recent Activity
      </h3>

      {list.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 16px',
          color: '#6B6B6B',
          fontFamily: '"Noto Sans", sans-serif',
          fontSize: '14px',
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
          <p style={{ margin: 0 }}>No quizzes yet! Start your learning journey.</p>
        </div>
      ) : (
        <div className="stagger-children">
          {list.map((activity, i) => {
            const color = moduleColor(activity.module_name)
            return (
              <div
                key={i}
                className="animate-fade-in-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  borderBottom: i < list.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                  animationDelay: `${i * 0.06}s`,
                  animationFillMode: 'both',
                }}
              >
                {/* Module avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `${color}20`,
                  border: `2px solid ${color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '700',
                  color,
                  fontFamily: '"Poppins", sans-serif',
                  flexShrink: 0,
                }}>
                  {moduleInitial(activity.module_name)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: '"Noto Sans", sans-serif',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: '#2D2D2D',
                    margin: '0 0 2px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {activity.module_name}
                  </p>
                  <p style={{
                    fontFamily: '"Noto Sans", sans-serif',
                    fontSize: '12px',
                    color: '#6B6B6B',
                    margin: 0,
                  }}>
                    {activity.difficulty && (
                      <span style={{ marginRight: '6px', textTransform: 'capitalize' }}>
                        {activity.difficulty} ·
                      </span>
                    )}
                    {formatDate(activity.timestamp)}
                  </p>
                </div>

                {/* Score badge */}
                <ScoreBadge score={activity.score} total={activity.total} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
