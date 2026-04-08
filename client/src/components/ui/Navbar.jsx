import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, BookOpen, Star, Menu, X, LayoutDashboard, Grid, Brain, Trophy, User, Users, BarChart2 } from 'lucide-react'

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/student-dashboard', emoji: '📊' },
  { icon: Grid, label: 'Modules', to: '/modules', emoji: '📚' },
  { icon: Brain, label: 'Quiz', to: '/quiz/all', emoji: '🧠' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard', emoji: '🏆' },
  { icon: User, label: 'Profile', to: '/profile', emoji: '👤' },
]

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/teacher-dashboard', emoji: '📊' },
  { icon: Users, label: 'My Class', to: '/teacher-dashboard', emoji: '👥' },
  { icon: BarChart2, label: 'Analytics', to: '/teacher-dashboard', emoji: '📈' },
  { icon: User, label: 'Profile', to: '/profile', emoji: '👤' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const firstName = user?.name?.split(' ')[0] || ''
  const navItems = user?.role === 'teacher' ? teacherNavItems : studentNavItems

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'sticky',
          top: 0,
          height: '64px',
          background: '#FFFFFF',
          borderBottom: '1px solid rgba(255,107,0,0.15)',
          boxShadow: '0 2px 8px rgba(255,107,0,0.08)',
          zIndex: 100,
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Hamburger (mobile only) + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Hamburger — only shown when user is logged in (CSS controls visibility) */}
          {user && (
            <button
              className="hamburger-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-drawer"
            >
              <Menu size={22} />
            </button>
          )}

          {/* Logo */}
          <Link
            to="/"
            aria-label="Cultural AR Maths — Home"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                background: '#FF6B00',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <BookOpen size={20} color="#FFFFFF" />
            </div>
            <span className="navbar-logo-text">
              Cultural AR Maths
            </span>
          </Link>
        </div>

        {/* Right side */}
        {user ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Karma badge */}
            <span
              className="navbar-karma-badge"
              aria-label={`${user.karma_points ?? 0} karma points`}
            >
              <Star size={14} fill="#D4A017" color="#D4A017" aria-hidden="true" />
              {user.karma_points ?? 0}
            </span>

            {/* Greeting (hidden on mobile via CSS) */}
            <span className="navbar-user-greeting" aria-live="polite">
              Namaste, {firstName}! 🙏
            </span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="touch-target"
              aria-label="Logout"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: '1.5px solid #FF6B00',
                color: '#FF6B00',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontFamily: '"Noto Sans", sans-serif',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,107,0,0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <LogOut size={15} aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="landing-header-nav">
            <Link
              to="/login"
              className="login-link touch-target"
              style={{
                fontFamily: '"Noto Sans", sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#6B6B6B',
                textDecoration: 'none',
                padding: '7px 14px',
                borderRadius: '8px',
                transition: 'color 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                minHeight: '44px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF6B00' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B6B' }}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="get-started-btn touch-target"
              style={{
                fontFamily: '"Noto Sans", sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                color: '#FFFFFF',
                background: '#FF6B00',
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: '8px',
                border: '2px solid #FF6B00',
                transition: 'filter 0.3s ease',
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
        )}
      </nav>

      {/* ── Mobile Slide-In Drawer (logged-in users) ─── */}
      {user && menuOpen && (
        <div
          className="mobile-menu-overlay is-open"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onClick={() => setMenuOpen(false)}
          style={{ display: 'block' }}
        >
          <div
            id="mobile-nav-drawer"
            className="mobile-menu-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255,107,0,0.12)',
                background: 'linear-gradient(135deg, #FF6B00, #CC5500)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden="true"
                >
                  <BookOpen size={18} color="#FFFFFF" />
                </div>
                <span
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#FFFFFF',
                  }}
                >
                  Cultural AR Maths
                </span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  minHeight: '44px',
                  minWidth: '44px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(255,107,0,0.08)',
                background: 'rgba(255,248,231,0.5)',
              }}
            >
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '700',
                  fontSize: '15px',
                  color: '#2D2D2D',
                  margin: '0 0 4px',
                }}
              >
                {user.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'rgba(212,160,23,0.12)',
                    color: '#D4A017',
                    border: '1px solid rgba(212,160,23,0.3)',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  <Star size={12} fill="#D4A017" color="#D4A017" aria-hidden="true" />
                  {user.karma_points ?? 0} karma
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#6B6B6B',
                    textTransform: 'capitalize',
                    background: 'rgba(107,107,107,0.1)',
                    padding: '3px 8px',
                    borderRadius: '10px',
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>

            {/* Nav links */}
            <nav
              style={{ flex: 1, padding: '8px 0' }}
              aria-label="Mobile navigation"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px 20px',
                    fontSize: '15px',
                    fontFamily: '"Noto Sans", sans-serif',
                    fontWeight: isActive ? '700' : '400',
                    color: isActive ? '#FF6B00' : '#2D2D2D',
                    background: isActive ? 'rgba(255,107,0,0.08)' : 'transparent',
                    borderLeft: isActive ? '3px solid #FF6B00' : '3px solid transparent',
                    textDecoration: 'none',
                    minHeight: '52px',
                  })}
                >
                  <span style={{ fontSize: '20px' }} aria-hidden="true">{item.emoji}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Logout */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,107,0,0.08)' }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  color: '#EF4444',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Noto Sans", sans-serif',
                  minHeight: '48px',
                }}
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
