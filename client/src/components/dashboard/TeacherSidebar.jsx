import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Users, ClipboardList, BarChart2, Settings, LogOut, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Class Overview', to: '/teacher-dashboard', emoji: '📊' },
  { icon: Users, label: 'Students', to: '/teacher-dashboard', emoji: '👥' },
  { icon: ClipboardList, label: 'Assignments', to: '/teacher-dashboard', emoji: '📋' },
  { icon: BarChart2, label: 'Analytics', to: '/teacher-dashboard', emoji: '📈' },
  { icon: Settings, label: 'Settings', to: '/profile', emoji: '⚙️' },
]

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export default function TeacherSidebar({ classCode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const name = user?.name || 'Teacher'
  const initials = getInitials(name)
  const code = classCode || user?.class_code || '—'

  const handleCopy = () => {
    navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className="app-sidebar"
      aria-label="Teacher navigation"
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
      {/* Teacher card */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,107,0,0.08)',
      }}>
        {/* Avatar */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #800020, #B00030)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '800',
          color: '#FFFFFF',
          fontFamily: '"Poppins", sans-serif',
          marginBottom: '12px',
          boxShadow: '0 4px 12px rgba(128,0,32,0.3)',
        }}>
          {initials}
        </div>

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
        <p style={{
          fontSize: '12px',
          color: '#800020',
          margin: '0 0 12px',
          fontWeight: '600',
        }}>
          Teacher 👩‍🏫
        </p>

        {/* Class code */}
        <div style={{
          background: 'rgba(255,107,0,0.05)',
          border: '1px dashed rgba(255,107,0,0.25)',
          borderRadius: '8px',
          padding: '8px 12px',
        }}>
          <p style={{
            fontSize: '10px',
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 4px',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '600',
          }}>
            Class Code
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '800',
              fontSize: '15px',
              color: '#FF6B00',
              letterSpacing: '2px',
            }}>
              {code}
            </span>
            <button
              onClick={handleCopy}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#22C55E' : '#9CA3AF',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Copy class code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
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
              color: isActive ? '#800020' : '#4B5563',
              background: 'transparent',
              borderLeft: isActive ? '3px solid #800020' : '3px solid transparent',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
            onMouseEnter={e => {
              const el = e.currentTarget
              if (!el.style.borderLeft.includes('#800020')) {
                el.style.background = 'rgba(128,0,32,0.05)'
                el.style.color = '#800020'
              }
            }}
            onMouseLeave={e => {
              const el = e.currentTarget
              if (!el.style.borderLeft.includes('#800020')) {
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
