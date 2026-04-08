import { useEffect, useState } from 'react'

/**
 * AchievementPopup — full-screen overlay shown when a badge is earned.
 * Zoom-in badge icon with golden particle burst, auto-dismisses after 5s.
 *
 * Props:
 *   badge       {object}   – { icon, name, description, longDescription }
 *   onDismiss   {function} – called when user dismisses or timer expires
 *   onShare     {function} – optional share callback
 */
export default function AchievementPopup({ badge, onDismiss, onShare }) {
  const [visible, setVisible] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!badge) return
    // Mount with slight delay so CSS animation plays
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [badge])

  useEffect(() => {
    if (!badge) return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          handleDismiss()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [badge]) // eslint-disable-line

  if (!badge) return null

  const handleDismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 300)
  }

  // Generate particle positions
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * 360
    const distance = 80 + Math.random() * 60
    const x = Math.cos((angle * Math.PI) / 180) * distance
    const y = Math.sin((angle * Math.PI) / 180) * distance
    const colors = ['#D4A017', '#FF6B00', '#FFD700', '#800020', '#22C55E']
    return { x, y, color: colors[i % colors.length], size: 6 + Math.random() * 8, delay: Math.random() * 0.3 }
  })

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
        padding: '24px',
      }}
      onClick={handleDismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1A0A00, #2D1500)',
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          border: '2px solid rgba(212,160,23,0.5)',
          boxShadow: '0 0 60px rgba(212,160,23,0.25), 0 24px 80px rgba(0,0,0,0.5)',
          transform: visible ? 'scale(1)' : 'scale(0.7)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          overflow: 'visible',
        }}
      >
        {/* ── Particle burst ────────────────────── */}
        <div
          style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none' }}
        >
          {visible && particles.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                background: p.color,
                top: 0,
                left: 0,
                transform: 'translate(-50%, -50%)',
                animation: `particleBurst 0.9s ease-out ${p.delay}s forwards`,
                '--tx': `${p.x}px`,
                '--ty': `${p.y}px`,
                boxShadow: `0 0 6px ${p.color}`,
              }}
            />
          ))}
        </div>

        {/* ── Badge icon ───────────────────────── */}
        <div
          style={{
            fontSize: '72px',
            lineHeight: 1,
            marginBottom: '16px',
            display: 'block',
            animation: visible ? 'badgeZoom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
            filter: 'drop-shadow(0 0 20px rgba(212,160,23,0.7))',
          }}
        >
          {badge.icon}
        </div>

        {/* ── "Badge Unlocked!" header ─────────── */}
        <p
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '700',
            fontSize: '13px',
            color: '#D4A017',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            margin: '0 0 10px',
          }}
        >
          🏅 Badge Unlocked!
        </p>

        {/* ── Badge name ───────────────────────── */}
        <h2
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '800',
            fontSize: '26px',
            color: '#FFFFFF',
            margin: '0 0 10px',
            textShadow: '0 0 20px rgba(212,160,23,0.4)',
          }}
        >
          {badge.name}
        </h2>

        {/* ── Description ──────────────────────── */}
        <p
          style={{
            fontFamily: '"Noto Sans", sans-serif',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            margin: '0 0 28px',
            lineHeight: '1.6',
          }}
        >
          {badge.longDescription || badge.description}
        </p>

        {/* ── Progress bar countdown ───────────── */}
        <div
          style={{
            height: '3px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '99px',
            overflow: 'hidden',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#D4A017',
              borderRadius: '99px',
              width: `${(countdown / 5) * 100}%`,
              transition: 'width 1s linear',
            }}
          />
        </div>

        {/* ── Buttons ──────────────────────────── */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {onShare && (
            <button
              onClick={onShare}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(255,255,255,0.08)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: '10px',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            >
              🔗 Share
            </button>
          )}
          <button
            onClick={handleDismiss}
            style={{
              flex: 2,
              padding: '12px',
              background: 'linear-gradient(135deg, #D4A017, #FF6B00)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'filter 0.15s',
              boxShadow: '0 4px 16px rgba(212,160,23,0.35)',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            Continue ({countdown}s)
          </button>
        </div>
      </div>
    </div>
  )
}
