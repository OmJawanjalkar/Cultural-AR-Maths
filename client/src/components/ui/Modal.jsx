import { useEffect } from 'react'

const sizeMap = {
  sm: '480px',
  md: '580px',
  lg: '720px',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const maxWidth = sizeMap[size] || sizeMap.md

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="animate-fade-in"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        className="animate-slide-down"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          width: '100%',
          maxWidth,
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,107,0,0.12)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: '"Poppins", sans-serif',
              fontSize: '18px',
              fontWeight: '700',
              color: '#2D2D2D',
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              color: '#6B6B6B',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'background 0.2s ease, color 0.2s ease',
              fontFamily: '"Noto Sans", sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,107,0,0.08)'
              e.currentTarget.style.color = '#FF6B00'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#6B6B6B'
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            padding: '24px',
            overflowY: 'auto',
            maxHeight: '70vh',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
