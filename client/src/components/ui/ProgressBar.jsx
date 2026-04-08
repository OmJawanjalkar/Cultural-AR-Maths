import { useState, useEffect } from 'react'

export default function ProgressBar({
  value = 0,
  max = 100,
  color = '#FF6B00',
  height = 8,
  label,
  showPercentage = false,
  animated = true,
}) {
  const clampedValue = Math.min(Math.max(value, 0), max)
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0

  const [displayWidth, setDisplayWidth] = useState(animated ? 0 : percentage)

  useEffect(() => {
    if (!animated) {
      setDisplayWidth(percentage)
      return
    }
    // Trigger animation on mount / value change
    const raf = requestAnimationFrame(() => {
      setDisplayWidth(percentage)
    })
    return () => cancelAnimationFrame(raf)
  }, [percentage, animated])

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: label && showPercentage ? 'space-between' : label ? 'flex-start' : 'flex-end',
            alignItems: 'center',
            marginBottom: '6px',
          }}
        >
          {label && (
            <span
              style={{
                fontSize: '13px',
                fontFamily: '"Noto Sans", sans-serif',
                color: '#2D2D2D',
                fontWeight: '500',
              }}
            >
              {label}
            </span>
          )}
          {showPercentage && (
            <span
              style={{
                fontSize: '13px',
                fontFamily: '"Noto Sans", sans-serif',
                color: '#6B6B6B',
                fontWeight: '500',
              }}
            >
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          background: '#F0F0F0',
          borderRadius: '99px',
          height: `${height}px`,
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${displayWidth}%`,
            background: `linear-gradient(90deg, ${color}, #FF8C3A)`,
            borderRadius: '99px',
            transition: animated ? 'width 0.6s ease' : 'none',
          }}
        />
      </div>
    </div>
  )
}
