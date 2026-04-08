import { useAuth } from '../../contexts/AuthContext'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Grid,
  BookOpen,
  Trophy,
  User,
  Users,
  BarChart2,
} from 'lucide-react'

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/student-dashboard' },
  { icon: Grid, label: 'Modules', to: '/modules' },
  { icon: BookOpen, label: 'Quiz', to: '/quiz/all' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
  { icon: User, label: 'Profile', to: '/profile' },
]

const teacherNav = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/teacher-dashboard' },
  { icon: Users, label: 'My Class', to: '/teacher-dashboard' },
  { icon: BarChart2, label: 'Analytics', to: '/teacher-dashboard' },
  { icon: User, label: 'Profile', to: '/profile' },
]

function NavItem({ icon: Icon, label, to }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        borderRadius: '0 24px 24px 0',
        marginRight: '12px',
        fontSize: '14px',
        fontFamily: '"Noto Sans", sans-serif',
        fontWeight: isActive ? '600' : '400',
        color: isActive ? '#FF6B00' : '#6B6B6B',
        background: isActive ? 'rgba(255,107,0,0.1)' : 'transparent',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        userSelect: 'none',
      })}
      onMouseEnter={(e) => {
        // Only dim if not already active-styled (active bg overrides hover)
        if (e.currentTarget.style.background === 'transparent') {
          e.currentTarget.style.background = 'rgba(255,107,0,0.06)'
        }
      }}
      onMouseLeave={(e) => {
        if (e.currentTarget.style.background === 'rgba(255,107,0,0.06)') {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  )
}

export default function Sidebar() {
  const { user } = useAuth()

  const navItems = user?.role === 'teacher' ? teacherNav : studentNav

  return (
    <aside
      className="app-sidebar"
      aria-label="Sidebar navigation"
      style={{
        width: '240px',
        height: 'calc(100vh - 64px)',
        position: 'fixed',
        top: '64px',
        left: 0,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(255,107,0,0.12)',
        overflowY: 'auto',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 90,
      }}
    >
      {/* Navigation items */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          flex: 1,
        }}
      >
        {navItems.map((item) => (
          <NavItem key={item.label} {...item} />
        ))}
      </nav>

      {/* Bottom decorative element */}
      <div
        style={{
          textAlign: 'center',
          padding: '16px 20px 8px',
          color: '#6B6B6B',
          fontSize: '18px',
          userSelect: 'none',
        }}
        title="Cultural AR Maths"
      >
        ✿
      </div>
    </aside>
  )
}
