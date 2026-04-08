import { useMemo, useState } from 'react'

/**
 * StreakTracker — current streak display + 30-day activity calendar.
 *
 * Props:
 *   activityData  {array}  – [{date: 'YYYY-MM-DD', count: 5, accuracy: 80}]
 *   currentStreak {number} – current consecutive days streak
 */
export default function StreakTracker({ activityData = [], currentStreak = 0 }) {
  const [tooltip, setTooltip] = useState(null) // { date, count, accuracy, x, y }

  // Build lookup map
  const activityMap = useMemo(() => {
    const map = {}
    activityData.forEach(d => { map[d.date] = d })
    return map
  }, [activityData])

  // Build last 30 days
  const days = useMemo(() => {
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = formatDate(d)
      result.push({ date: key, day: d })
    }
    return result
  }, [])

  const isBroken = currentStreak === 0

  // Color based on question count
  function getDayColor(count) {
    if (!count) return '#F0EDE8'
    if (count >= 6) return '#FF6B00'      // gold/dark saffron
    if (count >= 3) return '#FF8C3A'      // saffron
    return '#FFD4A8'                       // light saffron
  }

  // Day-of-week labels (Sun=0 … Sat=6) abbreviated
  const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px 24px',
        boxShadow: '0 2px 16px rgba(255,107,0,0.08)',
        fontFamily: '"Noto Sans", sans-serif',
        position: 'relative',
      }}
    >
      {/* ── Header ────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h3
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '600',
              fontSize: '15px',
              color: '#2D2D2D',
              margin: '0 0 2px',
            }}
          >
            Daily Streak
          </h3>
          <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Last 30 days</p>
        </div>

        {/* Streak badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '99px',
            background: isBroken ? 'rgba(156,163,175,0.1)' : 'rgba(255,107,0,0.08)',
            border: `1.5px solid ${isBroken ? 'rgba(156,163,175,0.3)' : 'rgba(255,107,0,0.25)'}`,
          }}
        >
          <span
            style={{
              fontSize: '20px',
              animation: !isBroken && currentStreak >= 3 ? 'animate-spin-slow' : 'none',
            }}
          >
            {isBroken ? '💧' : '🔥'}
          </span>
          <div>
            <p
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '800',
                fontSize: '20px',
                color: isBroken ? '#9CA3AF' : '#FF6B00',
                margin: 0,
                lineHeight: 1,
              }}
            >
              {currentStreak}
            </p>
            <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0 }}>
              {isBroken ? 'days' : currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Streak broken message ─────────────────── */}
      {isBroken && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '13px',
            color: '#DC2626',
            fontFamily: '"Noto Sans", sans-serif',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          😢 Streak broken — answer a question today to start a new one!
        </div>
      )}

      {/* ── 30-day Calendar ──────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(30, minmax(20px, 1fr))',
            gap: '4px',
            minWidth: '400px',
          }}
        >
          {days.map((day, i) => {
            const data = activityMap[day.date]
            const count = data?.count || 0
            const accuracy = data?.accuracy || 0
            const isToday = i === 29

            return (
              <div key={day.date} style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                {/* DOW label for Mon, Wed, Fri */}
                <span
                  style={{
                    fontSize: '8px',
                    color: '#D1D5DB',
                    fontFamily: '"Poppins", sans-serif',
                    height: '10px',
                    lineHeight: '10px',
                  }}
                >
                  {[1, 3, 5].includes(day.day.getDay()) ? DOW[day.day.getDay()] : ''}
                </span>

                {/* Day cell */}
                <div
                  title={count
                    ? `${day.date}: ${count} question${count > 1 ? 's' : ''}, ${accuracy}% accuracy`
                    : day.date}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '4px',
                    background: getDayColor(count),
                    border: isToday ? '2px solid #FF6B00' : '2px solid transparent',
                    cursor: count ? 'pointer' : 'default',
                    transition: 'transform 0.1s',
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (count) e.currentTarget.style.transform = 'scale(1.3)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Legend ───────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '10px',
          color: '#9CA3AF',
          fontFamily: '"Noto Sans", sans-serif',
          justifyContent: 'flex-end',
        }}
      >
        <span>Less</span>
        {['#F0EDE8', '#FFD4A8', '#FF8C3A', '#FF6B00'].map(c => (
          <div
            key={c}
            style={{ width: '12px', height: '12px', borderRadius: '3px', background: c }}
          />
        ))}
        <span>More</span>
      </div>

      {/* ── Stats row ────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginTop: '16px',
        }}
      >
        {[
          { label: 'Active days', value: activityData.filter(d => d.count > 0).length },
          { label: 'Total Qs', value: activityData.reduce((s, d) => s + (d.count || 0), 0) },
          { label: 'Avg accuracy', value: activityData.length > 0 ? `${Math.round(activityData.reduce((s, d) => s + (d.accuracy || 0), 0) / activityData.length)}%` : '—' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: '#FFF8E7',
              borderRadius: '8px',
              padding: '10px 8px',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '700',
                fontSize: '16px',
                color: '#FF6B00',
                margin: '0 0 2px',
              }}
            >
              {stat.value}
            </p>
            <p style={{ fontSize: '10px', color: '#6B6B6B', margin: 0 }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
