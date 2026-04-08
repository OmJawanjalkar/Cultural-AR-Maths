import { Link } from 'react-router-dom'

const featureCards = [
  {
    icon: '🕌',
    title: 'Temple Architecture Explorer',
    description:
      'Learn geometry through sacred architecture. Measure domes, calculate areas of mandapas, and discover the mathematics of ancient India.',
    color: '#FF6B00',
    bg: 'rgba(255,107,0,0.08)',
  },
  {
    icon: '🌸',
    title: 'Rangoli & Kolam Symmetry',
    description:
      'Discover axes of symmetry and rotational patterns in traditional Indian art. Make math beautiful through cultural craft.',
    color: '#800020',
    bg: 'rgba(128,0,32,0.07)',
  },
  {
    icon: '🥬',
    title: 'Sabzi Mandi Arithmetic',
    description:
      'Practice mental math in a virtual Indian market with real-world context. Buy, sell, and calculate like a seasoned trader.',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.08)',
  },
]

const stats = [
  { value: '500+', label: 'Students' },
  { value: '5', label: 'AR Modules' },
  { value: '10,000+', label: 'Questions' },
  { value: 'NCERT', label: 'Aligned' },
]

const floatingCards = [
  { icon: '🕌', label: 'Temple Geometry', delay: '0s' },
  { icon: '🌸', label: 'Rangoli Symmetry', delay: '0.15s' },
  { icon: '🥬', label: 'Market Math', delay: '0.3s' },
]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', fontFamily: '"Noto Sans", sans-serif' }}>
      {/* ── Sticky Top Bar ─────────────────────────── */}
      <header
        className="landing-header"
        role="banner"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: 'rgba(255,248,231,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,107,0,0.12)',
          padding: '0 32px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="Cultural AR Maths — Home"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #FF6B00, #CC5500)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            📐
          </div>
          <span
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '20px',
              color: '#FF6B00',
            }}
          >
            Cultural AR Maths
          </span>
        </Link>

        {/* Nav Buttons */}
        <div className="landing-header-nav" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link
            to="/login"
            className="login-link touch-target"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '1.5px solid rgba(255,107,0,0.35)',
              color: '#FF6B00',
              fontWeight: '500',
              fontSize: '14px',
              textDecoration: 'none',
              background: 'transparent',
              transition: 'all 0.2s',
              fontFamily: '"Noto Sans", sans-serif',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,107,0,0.07)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="get-started-btn touch-target"
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: '2px solid #FF6B00',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              textDecoration: 'none',
              background: '#FF6B00',
              fontFamily: '"Noto Sans", sans-serif',
              transition: 'filter 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────── */}
      <section
        className="hero-section"
        aria-label="Hero"
        style={{
          minHeight: '80vh',
          background: 'linear-gradient(135deg, #FFF8E7 0%, #FFE8C0 40%, #FFF8E7 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: '60px 32px',
          maxWidth: '1200px',
          margin: '0 auto',
          gap: '48px',
        }}
      >
        {/* Left Column */}
        <div className="hero-left" style={{ flex: '0 0 58%', maxWidth: '58%' }}>
          {/* Eyebrow badge */}
          <span
            className="animate-fade-in-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,107,0,0.12)',
              color: '#FF6B00',
              border: '1px solid rgba(255,107,0,0.3)',
              borderRadius: '24px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px',
              animationDelay: '0s',
              animationFillMode: 'both',
            }}
          >
            🇮🇳 Made for Indian Students
          </span>

          {/* H1 */}
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: 'clamp(28px, 5vw, 52px)',
              color: '#2D2D2D',
              lineHeight: 1.15,
              margin: '0 0 20px 0',
              animationDelay: '0.1s',
              animationFillMode: 'both',
            }}
          >
            Learn Mathematics{' '}
            <span style={{ color: '#FF6B00' }}>Through</span>{' '}
            Indian Culture
          </h1>

          {/* Subtext */}
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: 'clamp(15px, 2vw, 18px)',
              color: '#6B6B6B',
              lineHeight: 1.6,
              margin: '0 0 36px 0',
              maxWidth: '520px',
              animationDelay: '0.2s',
              animationFillMode: 'both',
            }}
          >
            AR-powered lessons using temple architecture, rangoli patterns, and
            market arithmetic — contextual math the Indian way.
          </p>

          {/* CTA buttons */}
          <div
            className="animate-fade-in-up"
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginBottom: '28px',
              animationDelay: '0.3s',
              animationFillMode: 'both',
            }}
          >
            <Link
              to="/register"
              style={{
                padding: '14px 28px',
                background: '#FF6B00',
                color: '#fff',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: 'clamp(14px, 2vw, 16px)',
                textDecoration: 'none',
                border: '2px solid #FF6B00',
                fontFamily: '"Poppins", sans-serif',
                transition: 'filter 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'none' }}
            >
              Start Learning Free →
            </Link>
            <Link
              to="/register"
              style={{
                padding: '14px 28px',
                background: 'transparent',
                color: '#800020',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: 'clamp(14px, 2vw, 16px)',
                textDecoration: 'none',
                border: '2px solid #800020',
                fontFamily: '"Poppins", sans-serif',
                transition: 'background 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '48px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(128,0,32,0.06)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              I'm a Teacher
            </Link>
          </div>

          {/* Trust text */}
          <p
            className="animate-fade-in-up"
            style={{
              fontSize: '13px',
              color: '#6B6B6B',
              margin: 0,
              animationDelay: '0.4s',
              animationFillMode: 'both',
              lineHeight: 1.8,
            }}
          >
            <span style={{ color: '#22C55E', fontWeight: '600' }}>✓</span> Free to use&nbsp;&nbsp;
            <span style={{ color: '#22C55E', fontWeight: '600' }}>✓</span> No credit card&nbsp;&nbsp;
            <span style={{ color: '#22C55E', fontWeight: '600' }}>✓</span> Built for NCERT curriculum
          </p>
        </div>

        {/* Right Column — Decorative floating cards (hidden on mobile via CSS) */}
        <div
          className="hero-right"
          aria-hidden="true"
          style={{
            flex: '0 0 40%',
            maxWidth: '40%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            position: 'relative',
          }}
        >
          {/* Decorative background blob */}
          <div
            style={{
              position: 'absolute',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(255,107,0,0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />

          {/* Cultural illustration card */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 8px 32px rgba(255,107,0,0.18)',
              textAlign: 'center',
              width: '240px',
              border: '1px solid rgba(255,107,0,0.12)',
            }}
          >
            <div style={{ fontSize: '56px', marginBottom: '12px', lineHeight: 1 }}>🕌</div>
            <p
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '700',
                fontSize: '15px',
                color: '#2D2D2D',
                margin: '0 0 4px',
              }}
            >
              Brihadeeswarar Temple
            </p>
            <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>
              Height = 66m · Ratio = 1:√2
            </p>
          </div>

          {/* Staggered small floating cards */}
          <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '240px' }}>
            {floatingCards.map((card) => (
              <div
                key={card.label}
                className="animate-fade-in-up card-hover"
                style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  boxShadow: '0 2px 12px rgba(255,107,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  border: '1px solid rgba(255,107,0,0.1)',
                  animationDelay: card.delay,
                  animationFillMode: 'both',
                }}
              >
                <span style={{ fontSize: '24px' }}>{card.icon}</span>
                <span
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#2D2D2D',
                  }}
                >
                  {card.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ───────────────────────── */}
      <section style={{ background: '#fff', padding: 'clamp(40px, 8vw, 72px) clamp(16px, 5vw, 32px)' }} aria-label="Features">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: 'clamp(24px, 4vw, 32px)',
              color: '#2D2D2D',
              textAlign: 'center',
              margin: '0 0 12px',
            }}
          >
            Learning through Culture
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: '#6B6B6B',
              fontSize: '16px',
              margin: '0 0 48px',
            }}
          >
            Every concept grounded in India's rich heritage
          </p>

          <div
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
            }}
          >
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="animate-fade-in-up card-hover"
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '28px',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  animationFillMode: 'both',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: card.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    marginBottom: '18px',
                  }}
                  aria-hidden="true"
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600',
                    fontSize: '17px',
                    color: '#2D2D2D',
                    margin: '0 0 10px',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: '#6B6B6B',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────── */}
      <section
        style={{
          background: 'linear-gradient(135deg, #FF6B00, #CC5500)',
          padding: 'clamp(28px, 5vw, 36px) clamp(16px, 5vw, 32px)',
        }}
        aria-label="Statistics"
      >
        <div
          className="stats-bar-inner"
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="stats-bar-item"
              style={{
                textAlign: 'center',
                padding: '12px 40px',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.3)' : 'none',
              }}
            >
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '800',
                  fontSize: 'clamp(22px, 4vw, 28px)',
                  color: '#fff',
                  margin: '0 0 4px',
                }}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  fontWeight: '500',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer
        role="contentinfo"
        style={{
          background: '#2D2D2D',
          padding: 'clamp(28px, 5vw, 36px) clamp(16px, 5vw, 32px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative kolam pattern */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background:
              'repeating-linear-gradient(90deg, #FF6B00 0px, #FF6B00 12px, #D4A017 12px, #D4A017 24px, #800020 24px, #800020 36px, #D4A017 36px, #D4A017 48px)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            fontSize: '24px',
            marginBottom: '12px',
            letterSpacing: '8px',
            opacity: 0.4,
          }}
        >
          ✿ ❋ ✿ ❋ ✿
        </div>
        <p
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '14px',
            margin: '0 0 8px',
            fontFamily: '"Noto Sans", sans-serif',
          }}
        >
          © 2024 Cultural AR Maths | Built with ❤️ for Indian students
        </p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: 0 }}>
          AR-powered culturally contextual mathematics learning
        </p>
      </footer>
    </div>
  )
}
