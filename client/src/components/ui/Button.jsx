import LoadingSpinner from './LoadingSpinner'

const variants = {
  primary: {
    background: '#FF6B00', color: '#fff', border: '2px solid #FF6B00',
  },
  secondary: {
    background: '#800020', color: '#fff', border: '2px solid #800020',
  },
  outline: {
    background: 'transparent', color: '#FF6B00', border: '2px solid #FF6B00',
  },
  ghost: {
    background: 'transparent', color: '#6B6B6B', border: '2px solid transparent',
  },
  accent: {
    background: '#D4A017', color: '#fff', border: '2px solid #D4A017',
  },
  danger: {
    background: '#EF4444', color: '#fff', border: '2px solid #EF4444',
  },
}

const sizes = {
  sm: { padding: '6px 14px', fontSize: '13px', borderRadius: '8px' },
  md: { padding: '10px 20px', fontSize: '15px', borderRadius: '8px' },
  lg: { padding: '13px 28px', fontSize: '16px', borderRadius: '8px' },
  xl: { padding: '15px 36px', fontSize: '17px', borderRadius: '10px' },
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  onClick, type = 'button', className = '', ...props
}) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        ...v, ...s,
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        fontFamily: '"Noto Sans", sans-serif', fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.3s ease',
        outline: 'none',
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.filter = 'brightness(1.1)' }}
      onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}
