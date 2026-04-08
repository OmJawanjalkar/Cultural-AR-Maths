import { useEffect, useRef, useState } from 'react'
import { getLevel, getNextLevel, getLevelProgress } from '../../utils/karmaCalculator'

/**
 * KarmaSystem — animated karma counter with level system and progress bar.
 *
 * Props:
 *   karma      {number} – total karma points
 *   compact    {boolean} – minimal display for navbar (default false)
 *   showLevel  {boolean} – show level row (default true)
 */
export default function KarmaSystem({ karma = 0, compact = false, showLevel = true }) {
  const [displayKarma, setDisplayKarma] = useState(0)
  const [sparkle, setSparkle] = useState(false)
  const rafRef = useRef(null)
  const prevKarmaRef = useRef(0)

  // Animate counter when karma changes
  useEffect(() => {
    if (karma === prevKarmaRef.current) return
    const from = prevKarmaRef.current
    prevKarmaRef.current = karma
    const diff = karma - from
    if (diff > 0) { setSparkle(true); setTimeout(() => setSparkle(false), 900) }

    const duration = Math.min(1500, 400 + Math.abs(diff) * 2)
    const startTime = performance.now()
    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayKarma(Math.round(from + diff * eased))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [karma])

  const level = getLevel(karma)
  const nextLevel = getNextLevel(karma)
  const progress = getLevelProgress(karma)

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '99px',
          background: 'rgba(212,160,23,0.1)',
          border: '1px solid rgba(212,160,23,0.3)',
          cursor: 'default',
        }}
        title={`${level.emoji} ${level.name} · ${karma.toLocaleString()} karma`}
      >
        <span
          style={{
            fontSize: '15px',
            animation: sparkle ? 'sparkle 0.6s ease' : 'none',
          }}
        >
          ⭐
        </span>
        <span
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '700',
            fontSize: '13px',
            color: '#D4A017',
          }}
        >
          {displayKarma.toLocaleString()}
        </span>
        <span style={{ fontSize: '13px', lineHeight: 1 }}>{level.emoji}</span>
      </div>
    )
  }

  // ── Full display ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(212,160,23,0.12)',
        border: '1px solid rgba(212,160,23,0.2)',
        fontFamily: '"Noto Sans", sans-serif',
      }}
    >
      {/* ── Karma total ─────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: '"Poppins", sans-serif', fontWeight: '600' }}>
            Total Karma
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '32px',
                lineHeight: 1,
                animation: sparkle ? 'sparkle 0.7s ease' : 'none',
                display: 'inline-block',
              }}
            >
              ⭐
            </span>
            <span
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '800',
                fontSize: '36px',
                color: '#D4A017',
                lineHeight: 1,
                letterSpacing: '-0.5px',
              }}
            >
              {displayKarma.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Sparkle particles */}
        {sparkle && (
          <div style={{ position: 'relative', width: '40px', height: '40px' }}>
            {['10px', '-8px', '24px', '-4px'].map((top, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  top,
                  left: `${i * 10}px`,
                  fontSize: '14px',
                  animation: 'floatUp 0.9s ease forwards',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                ✨
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Level ───────────────────────────── */}
      {showLevel && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '22px' }}>{level.emoji}</span>
              <div>
                <p
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700',
                    fontSize: '15px',
                    color: level.color,
                    margin: 0,
                  }}
                >
                  {level.name}
                </p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Current level</p>
              </div>
            </div>
            {nextLevel && (
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 2px' }}>Next level</p>
                <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '13px', color: nextLevel.color, margin: 0 }}>
                  {nextLevel.emoji} {nextLevel.name}
                </p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', margin: 0 }}>
                  {(nextLevel.min - karma).toLocaleString()} karma to go
                </p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: '8px',
              background: '#F0EDE8',
              borderRadius: '99px',
              overflow: 'hidden',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${level.color}, ${level.color}cc)`,
                borderRadius: '99px',
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `0 0 8px ${level.color}66`,
              }}
            />
          </div>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, textAlign: 'right' }}>
            {progress}% to {nextLevel ? nextLevel.name : 'Max Level'}
          </p>
        </>
      )}

      {/* ── Earning guide ────────────────────── */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px 14px',
          background: '#FFF8E7',
          borderRadius: '10px',
          fontSize: '11px',
          fontFamily: '"Noto Sans", sans-serif',
          color: '#6B6B6B',
          lineHeight: '1.8',
        }}
      >
        <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '12px', color: '#2D2D2D', margin: '0 0 6px' }}>
          How to earn karma
        </p>
        {[
          ['✅ Correct answer', '10 × difficulty'],
          ['🔥 Streak bonus', '+5 per streak'],
          ['⚡ Speed bonus (&lt;10s)', '+10'],
          ['🏁 Module completion', '+100'],
          ['🌅 Daily login', '+20'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span dangerouslySetInnerHTML={{ __html: label }} />
            <span style={{ fontWeight: '600', color: '#D4A017' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
