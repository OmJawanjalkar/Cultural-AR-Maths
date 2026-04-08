export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 32, md: 48, lg: 72 }
  const s = sizes[size] || 48
  const r = s / 2 - 6

  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label="Loading">
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className="animate-spin-slow">
        {/* Outer ring segments — chakra spokes */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const cx = s / 2, cy = s / 2
          const x1 = cx + (r - 8) * Math.cos(angle)
          const y1 = cy + (r - 8) * Math.sin(angle)
          const x2 = cx + r * Math.cos(angle)
          const y2 = cy + r * Math.sin(angle)
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round"
              opacity={0.3 + (i / 8) * 0.7}
            />
          )
        })}
        {/* Centre lotus */}
        <circle cx={s / 2} cy={s / 2} r="6" fill="#FF6B00" opacity="0.9" />
        <circle cx={s / 2} cy={s / 2} r="3" fill="#D4A017" />
      </svg>
      {text && <p className="text-sm font-medium" style={{ color: '#6B6B6B' }}>{text}</p>}
    </div>
  )
}
