import { useNavigate, Link } from 'react-router-dom'
import RegisterForm from '../components/auth/RegisterForm'

const features = [
  { icon: '🕌', title: 'Temple Architecture Explorer', desc: 'Learn geometry through sacred architecture' },
  { icon: '🌸', title: 'Rangoli & Kolam Symmetry', desc: 'Discover patterns in traditional Indian art' },
  { icon: '🥬', title: 'Sabzi Mandi Arithmetic', desc: 'Practice math in a virtual Indian market' },
  { icon: '🧠', title: 'Adaptive Quiz Engine', desc: 'Questions that adapt to your skill level' },
]

export default function RegisterPage() {
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
          background: 'linear-gradient(145deg, #800020 0%, #CC5500 60%, #FF6B00 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.08)', pointerEvents: 'none' }} />

        {/* Decorative number */}
        <div style={{ position: 'absolute', bottom: '40px', right: '24px', fontSize: '100px', fontFamily: '"Poppins", sans-serif', fontWeight: '900', color: 'rgba(255,255,255,0.07)', lineHeight: 1, userSelect: 'none' }}>
          π
        </div>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px', zIndex: 1 }}>
          <div style={{ fontSize: '48px', marginBottom: '10px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>📐</div>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '22px', color: '#fff', margin: '0 0 4px' }}>
            Cultural AR Maths
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0 0', fontFamily: '"Noto Sans", sans-serif' }}>
            AR-powered learning for Indian students
          </p>
        </div>

        {/* Feature list */}
        <div className="stagger-children" style={{ width: '100%', maxWidth: '340px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {features.map((f) => (
            <div
              key={f.title}
              className="animate-fade-in-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '12px 16px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                animationFillMode: 'both',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '13px', color: '#fff', margin: '0 0 2px' }}>{f.title}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: '"Noto Sans", sans-serif' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Side — Register Card ── */}
      <div
        className="auth-form-side"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {/* Rangoli border wrapper */}
          <div className="rangoli-border" style={{ position: 'relative', borderRadius: '16px' }}>
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
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Link
                  to="/"
                  aria-label="Cultural AR Maths — Home"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <div
                    style={{ width: '32px', height: '32px', background: '#FF6B00', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}
                    aria-hidden="true"
                  >
                    📐
                  </div>
                  <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '18px', color: '#FF6B00' }}>
                    Cultural AR Maths
                  </span>
                </Link>
              </div>

              {/* RegisterForm */}
              <RegisterForm onSuccess={handleSuccess} />

              {/* Login link */}
              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6B6B6B', margin: '20px 0 0', fontFamily: '"Noto Sans", sans-serif' }}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  style={{ color: '#FF6B00', fontWeight: '600', textDecoration: 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline' }}
                  onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                >
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
