import { useMemo } from 'react'

function formatDate(d) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function calculateStreak(activitySet) {
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let cursor = new Date(today)
  while (true) {
    const key = formatDate(cursor)
    if (activitySet.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function StreakCalendar({ activityDates = [] }) {
  const activitySet = useMemo(() => new Set(activityDates), [activityDates])
  const streak = useMemo(() => calculateStreak(activitySet), [activitySet])

  // Build 12 weeks (84 days) ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the start: 84 days ago, adjusted so first column starts on Monday
  const endDate = new Date(today)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 83)
  // Align to Monday (day 1)
  const dow = startDate.getDay() // 0=Sun
  const offset = dow === 0 ? 6 : dow - 1
  startDate.setDate(startDate.getDate() - offset)

  // Build week columns
  const weeks = []
  let cursor = new Date(startDate)
  while (cursor <= endDate) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date(cursor)
      week.push(dayDate)
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  // Month labels: detect when month changes across weeks
  const monthLabels = weeks.map((week, i) => {
    const firstDay = week[0]
    if (i === 0) return MONTH_NAMES[firstDay.getMonth()]
    const prevWeekFirst = weeks[i - 1][0]
    if (firstDay.getMonth() !== prevWeekFirst.getMonth()) {
      return MONTH_NAMES[firstDay.getMonth()]
    }
    return null
  })

  const CELL = 12
  const GAP = 2

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 2px 12px rgba(255,107,0,0.08)',
    }}>
      {/* Streak header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Activity
        </h3>
        <span style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '700',
          fontSize: '14px',
          color: '#FF6B00',
        }}>
          🔥 {streak} day streak
        </span>
      </div>

      {/* Calendar grid wrapper */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: `${GAP}px` }}>

          {/* Month row */}
          <div style={{ display: 'flex', gap: `${GAP}px`, paddingLeft: '20px' }}>
            {weeks.map((week, i) => (
              <div
                key={i}
                style={{
                  width: `${CELL}px`,
                  fontSize: '9px',
                  color: '#6B6B6B',
                  fontFamily: '"Noto Sans", sans-serif',
                  overflow: 'visible',
                  whiteSpace: 'nowrap',
                }}
              >
                {monthLabels[i] || ''}
              </div>
            ))}
          </div>

          {/* Main grid: day labels + week columns */}
          <div style={{ display: 'flex', gap: `${GAP}px` }}>
            {/* Day labels column */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${GAP}px`,
            }}>
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{
                    width: '16px',
                    height: `${CELL}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    fontSize: '9px',
                    color: '#6B6B6B',
                    fontFamily: '"Noto Sans", sans-serif',
                    paddingRight: '2px',
                  }}
                >
                  {/* Show M, W, F only to save space */}
                  {[0, 2, 4].includes(i) ? label : ''}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((week, wi) => (
              <div
                key={wi}
                style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}
              >
                {week.map((day, di) => {
                  const key = formatDate(day)
                  const isActive = activitySet.has(key)
                  const isFuture = day > today
                  return (
                    <div
                      key={di}
                      title={key}
                      style={{
                        width: `${CELL}px`,
                        height: `${CELL}px`,
                        borderRadius: '3px',
                        background: isFuture ? 'transparent' : isActive ? '#FF6B00' : '#F0EDE8',
                        cursor: 'default',
                        transition: 'background 0.15s ease',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingLeft: '20px',
            marginTop: '4px',
          }}>
            <span style={{ fontSize: '10px', color: '#6B6B6B', fontFamily: '"Noto Sans", sans-serif' }}>Less</span>
            <div style={{ width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px', background: '#F0EDE8' }} />
            <div style={{ width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px', background: '#FF6B00', opacity: 0.4 }} />
            <div style={{ width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px', background: '#FF6B00' }} />
            <span style={{ fontSize: '10px', color: '#6B6B6B', fontFamily: '"Noto Sans", sans-serif' }}>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
