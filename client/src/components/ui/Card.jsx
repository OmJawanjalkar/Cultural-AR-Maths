export default function Card({
  children,
  className = '',
  style,
  onClick,
  hover = true,
  padding = '24px',
}) {
  return (
    <div
      onClick={onClick}
      className={`${hover ? 'card-hover' : ''} ${className}`.trim()}
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        boxShadow: '0 2px 16px rgba(255,107,0,0.08)',
        padding,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
