import { useNavigate, Link } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF8E7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
        fontFamily: '"Noto Sans", sans-serif',
      }}
    >
      {/* Decorative geometric shapes */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            left: '-60px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            border: '2px dashed rgba(255,107,0,0.2)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            right: '-50px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            border: '2px dashed rgba(212,160,23,0.3)',
            pointerEvents: 'none',
          }}
        />

        {/* 404 number */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '900',
            fontSize: 'clamp(80px, 18vw, 140px)',
            color: '#FF6B00',
            margin: 0,
            lineHeight: 1,
            letterSpacing: '-4px',
            animationFillMode: 'both',
          }}
        >
          404
        </h1>
      </div>

      {/* Cultural emoji */}
      <div
        className="animate-fade-in-up"
        style={{ fontSize: '56px', marginBottom: '16px', animationDelay: '0.1s', animationFillMode: 'both' }}
      >
        🙏
      </div>

      {/* Error message */}
      <h2
        className="animate-fade-in-up"
        style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '700',
          fontSize: '22px',
          color: '#2D2D2D',
          margin: '0 0 12px',
          animationDelay: '0.15s',
          animationFillMode: 'both',
        }}
      >
        Oops! This page has gone to find moksha 🕉️
      </h2>

      <p
        className="animate-fade-in-up"
        style={{
          fontSize: '15px',
          color: '#6B6B6B',
          margin: '0 0 12px',
          maxWidth: '420px',
          lineHeight: 1.6,
          animationDelay: '0.2s',
          animationFillMode: 'both',
        }}
      >
        Like a student who wandered off during recess — this page cannot be found.
      </p>

      {/* Fun math riddle */}
      <div
        className="animate-fade-in-up"
        style={{
          background: 'rgba(255,107,0,0.06)',
          border: '1px solid rgba(255,107,0,0.18)',
          borderRadius: '12px',
          padding: '16px 24px',
          maxWidth: '380px',
          marginBottom: '32px',
          animationDelay: '0.25s',
          animationFillMode: 'both',
        }}
      >
        <p style={{ fontSize: '13px', color: '#FF6B00', fontWeight: '600', margin: '0 0 6px', fontFamily: '"Poppins", sans-serif' }}>
          🧮 Quick Riddle while you're here:
        </p>
        <p style={{ fontSize: '13px', color: '#2D2D2D', margin: 0, lineHeight: 1.5 }}>
          If a rangoli has 8 axes of symmetry, and each petal covers 45°, how many petals complete the full circle?
        </p>
        <p style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '6px', fontStyle: 'italic' }}>
          Answer: 8 petals (360° ÷ 45° = 8)
        </p>
      </div>

      {/* CTA buttons */}
      <div
        className="animate-fade-in-up"
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animationDelay: '0.3s',
          animationFillMode: 'both',
        }}
      >
        <Link
          to="/"
          style={{
            padding: '12px 28px',
            background: '#FF6B00',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            textDecoration: 'none',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid #FF6B00',
            transition: 'filter 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
        >
          🏠 Take me Home
        </Link>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 28px',
            background: 'transparent',
            color: '#6B6B6B',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '14px',
            border: '2px solid #E5E5E5',
            cursor: 'pointer',
            fontFamily: '"Noto Sans", sans-serif',
            transition: 'border-color 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#FF6B00' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#6B6B6B' }}
        >
          ← Go Back
        </button>
      </div>

      {/* Decorative footer pattern */}
      <div style={{ marginTop: '48px', letterSpacing: '12px', fontSize: '20px', opacity: 0.25 }}>
        ✿ ❋ ✿ ❋ ✿
      </div>
    </div>
  )
}
