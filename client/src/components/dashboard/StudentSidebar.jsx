import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, BookOpen, Brain, Trophy, Award, User, LogOut,
} from 'lucide-react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/student-dashboard', emoji: '📊' },
  { icon: BookOpen, label: 'My Modules', to: '/modules', emoji: '📚' },
  { icon: Brain, label: 'Quiz', to: '/quiz/all', emoji: '🧠' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard', emoji: '🏆' },
  { icon: Award, label: 'Badges', to: '/profile', emoji: '🏅' },
  { icon: User, label: 'Profile', to: '/profile', emoji: '👤' },
]

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function getLevelTitle(karma = 0) {
  if (karma >= 2000) return 'Grand Master 🧙'
  if (karma >= 1000) return 'Scholar 📚'
  if (karma >= 500) return 'Apprentice ⭐'
  if (karma >= 100) return 'Explorer 🔍'
  return 'Beginner 🌱'
}

export default function StudentSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const karma = user?.karma_points ?? 0
  const name = user?.name || 'Student'
  const initials = getInitials(name)
  const level = getLevelTitle(karma)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="app-sidebar"
      aria-label="Student navigation"
      style={{
        width: '240px',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        top: '64px',
        left: 0,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(255,107,0,0.12)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
        fontFamily: '"Noto Sans", sans-serif',
      }}
    >
      {/* User card */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,107,0,0.08)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B00, #FF8C3A)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '800',
          color: '#FFFFFF',
          fontFamily: '"Poppins", sans-serif',
          marginBottom: '12px',
          boxShadow: '0 4px 12px rgba(255,107,0,0.3)',
        }}>
          {initials}
        </div>

        {/* Name */}
        <p style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '700',
          fontSize: '14px',
          color: '#2D2D2D',
          margin: '0 0 2px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {name}
        </p>

        {/* Level */}
        <p style={{
          fontSize: '12px',
          color: '#FF6B00',
          margin: '0 0 10px',
          fontWeight: '600',
        }}>
          {level}
        </p>

        {/* Karma counter */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(212,160,23,0.1)',
          border: '1px solid rgba(212,160,23,0.25)',
          borderRadius: '20px',
          padding: '4px 12px',
        }}>
          <span style={{ fontSize: '14px' }}>⭐</span>
          <span style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '700',
            fontSize: '13px',
            color: '#D4A017',
          }}>
            {karma.toLocaleString()} karma
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              fontSize: '14px',
              fontFamily: '"Noto Sans", sans-serif',
              fontWeight: isActive ? '700' : '400',
              color: isActive ? '#FF6B00' : '#4B5563',
              background: 'transparent',
              borderLeft: isActive ? '3px solid #FF6B00' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget
              if (!el.style.borderLeft.includes('#FF6B00')) {
                el.style.background = 'rgba(255,107,0,0.05)'
                el.style.color = '#FF6B00'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              if (!el.style.borderLeft.includes('#FF6B00')) {
                el.style.background = 'transparent'
                el.style.color = '#4B5563'
              }
            }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.emoji}</span>
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
            gap: '10px',
            padding: '10px 16px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: '8px',
            color: '#EF4444',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: '"Noto Sans", sans-serif',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)' }}
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
