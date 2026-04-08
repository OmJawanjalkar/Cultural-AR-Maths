import { useEffect, useRef, useState } from 'react'
import { Star, Flame, Award, BookOpen } from 'lucide-react'

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return count
}

function StatCard({ icon: Icon, iconBg, iconColor, value, label, delay }) {
  const animated = useCountUp(value)

  return (
    <div
      className="animate-fade-in-up"
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 2px 12px rgba(255,107,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animationDelay: delay,
        animationFillMode: 'both',
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} />
      </div>
      <div>
        <p style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '700',
          fontSize: '28px',
          color: '#2D2D2D',
          margin: '0 0 2px 0',
          lineHeight: 1,
        }}>
          {animated.toLocaleString()}
        </p>
        <p style={{
          fontSize: '13px',
          color: '#6B6B6B',
          margin: 0,
          fontFamily: '"Noto Sans", sans-serif',
        }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export default function StatsOverview({ stats = {} }) {
  const { karma = 0, streak = 0, badges = 0, quizzes = 0 } = stats

  const cards = [
    {
      icon: Star,
      iconBg: 'rgba(212,160,23,0.15)',
      iconColor: '#D4A017',
      value: karma,
      label: 'Total Karma',
    },
    {
      icon: Flame,
      iconBg: 'rgba(255,107,0,0.12)',
      iconColor: '#FF6B00',
      value: streak,
      label: 'Current Streak',
    },
    {
      icon: Award,
      iconBg: 'rgba(128,0,32,0.1)',
      iconColor: '#800020',
      value: badges,
      label: 'Badges Earned',
    },
    {
      icon: BookOpen,
      iconBg: 'rgba(34,197,94,0.1)',
      iconColor: '#22C55E',
      value: quizzes,
      label: 'Quizzes Taken',
    },
  ]

  return (
    <div
      className="stagger-children"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
      }}
    >
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} delay={`${i * 0.05}s`} />
      ))}
    </div>
  )
}
