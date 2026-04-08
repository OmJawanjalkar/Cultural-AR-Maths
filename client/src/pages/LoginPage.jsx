import { useNavigate, Link } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'

const culturalQuotes = [
  {
    text: '"गणितं सर्वशास्त्राणां मूलम्"',
    translation: 'Mathematics is the root of all sciences.',
    source: '— Vedic Proverb',
  },
  {
    text: '"शून्यं सर्वं च शून्यात् जायते"',
    translation: 'Zero is everything, and everything arises from zero.',
    source: '— Brahmasphutasiddhanta',
  },
]

const quote = culturalQuotes[0]

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSuccess = (user) => {
    if (user?.role === 'teacher') {
      navigate('/teacher-dashboard')
    } else {
      navigate('/student-dashboard')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF8E7',
        display: 'flex',
        alignItems: 'stretch',
      }}
    >
      {/* ── Left Decorative Panel (hidden on mobile via CSS) ── */}
      <div
        className="auth-decorative-panel animate-fade-in"
        aria-hidden="true"
        style={{
          flex: '0 0 45%',
          background: 'linear-gradient(145deg, #FF6B00 0%, #CC5500 40%, #800020 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative geometric circles */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '-30px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />

        {/* Large decorative number */}
        <div
          style={{
            fontSize: '120px',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '900',
            color: 'rgba(255,255,255,0.08)',
            lineHeight: 1,
            position: 'absolute',
            bottom: '60px',
            right: '20px',
            userSelect: 'none',
          }}
        >
          ∞
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px', zIndex: 1 }}>
          <div
            style={{
              fontSize: '52px',
              marginBottom: '12px',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
          >
            📐
          </div>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '22px',
              color: '#fff',
              margin: '0 0 4px',
            }}
          >
            Cultural AR Maths
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              fontFamily: '"Noto Sans", sans-serif',
            }}
          >
            AR-powered learning for Indian students
          </p>
        </div>

        {/* Quote */}
        <div
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '12px',
            padding: '24px 28px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            maxWidth: '340px',
            zIndex: 1,
          }}
        >
          <p
            style={{
              fontFamily: '"Noto Sans", sans-serif',
              fontSize: '17px',
              color: '#fff',
              margin: '0 0 10px',
              lineHeight: 1.5,
              fontStyle: 'italic',
            }}
          >
            {quote.text}
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)',
              margin: '0 0 8px',
              fontStyle: 'italic',
            }}
          >
            "{quote.translation}"
          </p>
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              margin: 0,
              fontWeight: '500',
            }}
          >
            {quote.source}
          </p>
        </div>

        {/* Cultural fact */}
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            zIndex: 1,
          }}
        >
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            🇮🇳 Did you know? Aryabhata invented the concept of{' '}
            <strong style={{ color: '#fff' }}>zero</strong> in 5th century CE.
          </p>
        </div>
      </div>

      {/* ── Right Side — Login Card ─────────────────── */}
      <div
        className="auth-form-side"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            position: 'relative',
          }}
        >
          {/* Rangoli border wrapper */}
          <div
            className="rangoli-border"
            style={{
              position: 'relative',
              borderRadius: '16px',
            }}
          >
            <div
              className="animate-fade-in-up auth-card-inner"
              style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '40px 40px 36px',
                boxShadow: '0 8px 40px rgba(255,107,0,0.12)',
                position: 'relative',
              }}
            >
              {/* Logo in card */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Link
                  to="/"
                  aria-label="Cultural AR Maths — Home"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#FF6B00',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                    }}
                    aria-hidden="true"
                  >
                    📐
                  </div>
                  <span
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: '700',
                      fontSize: '18px',
                      color: '#FF6B00',
                    }}
                  >
                    Cultural AR Maths
                  </span>
                </Link>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '700',
                  fontSize: '26px',
                  color: '#2D2D2D',
                  margin: '0 0 6px',
                  textAlign: 'center',
                }}
              >
                Welcome Back 🙏
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6B6B6B',
                  textAlign: 'center',
                  margin: '0 0 28px',
                }}
              >
                Sign in to continue your learning journey
              </p>

              {/* LoginForm */}
              <LoginForm onSuccess={handleSuccess} />

              {/* Register link */}
              <p
                style={{
                  textAlign: 'center',
                  marginTop: '20px',
                  fontSize: '14px',
                  color: '#6B6B6B',
                  margin: '20px 0 0',
                }}
              >
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#FF6B00',
                    fontWeight: '600',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                >
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
