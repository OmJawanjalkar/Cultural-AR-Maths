import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'

const SIZE_MAP = {
  sm: { fontSize: '20px', iconSize: 16 },
  md: { fontSize: '32px', iconSize: 20 },
  lg: { fontSize: '48px', iconSize: 28 },
}

export default function KarmaCounter({ karma = 0, size = 'md' }) {
  const { fontSize, iconSize } = SIZE_MAP[size] || SIZE_MAP.md
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (karma === 0) { setCount(0); return }
    const duration = 1500
    const startTime = performance.now()
    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * karma))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [karma])

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
    }}>
      <Star
        size={iconSize}
        color="#D4A017"
        fill="#D4A017"
      />
      <span style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '700',
        fontSize,
        color: '#D4A017',
        lineHeight: 1,
      }}>
        {count.toLocaleString()}
      </span>
    </div>
  )
}
