const variants = {
  gold: {
    background: 'rgba(212,160,23,0.12)',
    color: '#D4A017',
    border: '1px solid rgba(212,160,23,0.3)',
  },
  saffron: {
    background: 'rgba(255,107,0,0.1)',
    color: '#FF6B00',
    border: '1px solid rgba(255,107,0,0.3)',
  },
  maroon: {
    background: 'rgba(128,0,32,0.1)',
    color: '#800020',
    border: '1px solid rgba(128,0,32,0.3)',
  },
  success: {
    background: 'rgba(34,197,94,0.1)',
    color: '#22C55E',
    border: '1px solid rgba(34,197,94,0.3)',
  },
  muted: {
    background: 'rgba(107,107,107,0.1)',
    color: '#6B6B6B',
    border: '1px solid rgba(107,107,107,0.2)',
  },
}

const sizes = {
  sm: { fontSize: '11px', padding: '4px 10px' },
  md: { fontSize: '13px', padding: '6px 14px' },
  lg: { fontSize: '15px', padding: '8px 18px' },
}

export default function Badge({
  children,
  variant = 'saffron',
  size = 'md',
  icon,
}) {
  const v = variants[variant] || variants.saffron
  const s = sizes[size] || sizes.md

  return (
    <span
      style={{
        ...v,
        ...s,
        borderRadius: '24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: '"Noto Sans", sans-serif',
        fontWeight: '500',
        lineHeight: 1.2,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  )
}
