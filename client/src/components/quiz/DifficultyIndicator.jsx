import { useEffect, useRef, useState } from 'react'

const DIFFICULTY_LABELS = ['', 'Easy', 'Easy', 'Medium', 'Hard', 'Expert']

/**
 * DifficultyIndicator — 5-star visual difficulty gauge.
 * Animates smoothly when difficulty changes.
 *
 * Props:
 *   difficulty  {number} – current difficulty 1–5 (supports decimals like 3.5)
 *   showTooltip {boolean} – show "Difficulty: X/5" tooltip text (default true)
 *   size        {'sm'|'md'} – star size (default 'md')
 */
export default function DifficultyIndicator({
  difficulty = 3,
  showTooltip = true,
  size = 'md',
}) {
  const [displayDifficulty, setDisplayDifficulty] = useState(difficulty)
  const [animating, setAnimating] = useState(false)
  const prevRef = useRef(difficulty)

  useEffect(() => {
    if (prevRef.current === difficulty) return
    setAnimating(true)
    prevRef.current = difficulty
    // Smoothly tween from old to new
    const start = displayDifficulty
    const end = difficulty
    const duration = 500
    const startTime = performance.now()
    let raf

    const tick = (now) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setDisplayDifficulty(start + (end - start) * eased)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDisplayDifficulty(end)
        setAnimating(false)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [difficulty]) // eslint-disable-line

  const starSize = size === 'sm' ? 14 : 18
  const d = displayDifficulty
  const label = DIFFICULTY_LABELS[Math.round(d)] || 'Medium'
  const tooltipText = `Difficulty: ${Number(d).toFixed(1)}/5 · ${label}`

  // Color: silver for low (≤2), gold for high (≥4), orange for mid
  const starColor =
    d >= 4 ? '#D4A017' : d >= 3 ? '#FF6B00' : '#9CA3AF'

  return (
    <div
      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'default' }}
      title={showTooltip ? tooltipText : undefined}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = Math.min(1, Math.max(0, d - i)) // 0→1 fill fraction for this star
        return (
          <span
            key={i}
            style={{
              position: 'relative',
              display: 'inline-block',
              fontSize: `${starSize}px`,
              lineHeight: 1,
              transition: 'transform 0.3s ease',
              transform: animating && Math.round(d) === i + 1 ? 'scale(1.3)' : 'scale(1)',
            }}
          >
            {/* Grey base star */}
            <span style={{ color: '#E5E5E5' }}>★</span>
            {/* Coloured fill clipped to the fill fraction */}
            {filled > 0 && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  color: starColor,
                  width: `${filled * 100}%`,
                  overflow: 'hidden',
                  display: 'block',
                  transition: 'color 0.4s ease, width 0.4s ease',
                }}
              >
                ★
              </span>
            )}
          </span>
        )
      })}
      {showTooltip && (
        <span
          style={{
            fontSize: '11px',
            color: '#6B6B6B',
            fontFamily: '"Noto Sans", sans-serif',
            marginLeft: '4px',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
