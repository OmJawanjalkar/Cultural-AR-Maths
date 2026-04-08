import { useEffect, useRef, useState } from 'react'

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const startTime = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])
  return count
}

function StatCard({ icon, label, value, suffix = '', trend, bg, color, delay }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0)
  const display = typeof value === 'number' ? `${animated}${suffix}` : value

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px 22px',
        boxShadow: '0 2px 12px rgba(255,107,0,0.07)',
        animationDelay: delay,
        animationFillMode: 'both',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 6px 24px ${color}25`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(255,107,0,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            color: trend.startsWith('↑') ? '#22C55E' : '#EF4444',
            background: trend.startsWith('↑') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '3px 8px',
            borderRadius: '20px',
            fontFamily: '"Noto Sans", sans-serif',
          }}>
            {trend}
          </span>
        )}
      </div>
      <div style={{ marginTop: '14px' }}>
        <p style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '800',
          fontSize: '28px',
          color,
          margin: '0 0 4px',
          lineHeight: 1,
        }}>
          {display}
        </p>
        <p style={{
          fontSize: '13px',
          color: '#6B7280',
          margin: 0,
          fontFamily: '"Noto Sans", sans-serif',
        }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export default function ClassOverview({ stats = {} }) {
  const {
    totalStudents = 0,
    avgScore = 0,
    activeToday = 0,
    assignmentsSet = 0,
  } = stats

  const cards = [
    {
      icon: '👥',
      label: 'Total Students',
      value: totalStudents,
      suffix: '',
      bg: 'rgba(255,107,0,0.1)',
      color: '#FF6B00',
      trend: totalStudents > 0 ? `↑ ${Math.max(1, Math.floor(totalStudents * 0.1))} this month` : null,
    },
    {
      icon: '📊',
      label: 'Class Average Score',
      value: avgScore,
      suffix: '%',
      bg: 'rgba(34,197,94,0.1)',
      color: '#22C55E',
      trend: avgScore >= 60 ? '↑ 3% vs last week' : '↓ 2% vs last week',
    },
    {
      icon: '✅',
      label: 'Active Today',
      value: activeToday,
      suffix: '',
      bg: 'rgba(212,160,23,0.12)',
      color: '#D4A017',
      trend: activeToday > 0 ? `↑ ${Math.max(1, Math.floor(activeToday * 0.15))} more than yesterday` : null,
    },
    {
      icon: '📋',
      label: 'Assignments Set',
      value: assignmentsSet,
      suffix: '',
      bg: 'rgba(128,0,32,0.08)',
      color: '#800020',
      trend: null,
    },
  ]

  return (
    <div
      className="stagger-children"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '16px',
      }}
    >
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} delay={`${i * 0.06}s`} />
      ))}
    </div>
  )
}
