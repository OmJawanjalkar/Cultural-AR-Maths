import { useEffect, useState } from 'react'
import { LogOut, Edit2, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BadgeShowcase from '../components/gamification/BadgeShowcase'
import Modal from '../components/ui/Modal'
import { dashboardService } from '../services/dashboardService'

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const TOPIC_COLORS = {
  Geometry: '#FF6B00',
  Symmetry: '#800020',
  Arithmetic: '#22C55E',
  Mensuration: '#D4A017',
  Percentages: '#6B6B6B',
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (user?.role === 'student') {
          const res = await dashboardService.getStudentDashboard()
          const d = res?.data?.data || res?.data || {}
          if (mounted) setStatsData(d)
        }
      } catch {
        // use user data as fallback
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.role])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSaveName = async () => {
    if (!editName.trim()) return
    setEditSaving(true)
    try {
      // Optimistic update — real API would be PUT /auth/me
      updateUser({ ...user, name: editName.trim() })
      setEditOpen(false)
    } catch {
      // ignore
    } finally {
      setEditSaving(false)
    }
  }

  const karma = statsData?.karma_points ?? user?.karma_points ?? 0
  const streak = statsData?.streak ?? user?.streak ?? 0
  const badgesCount = statsData?.badges_count ?? (statsData?.badges?.length) ?? 0
  const quizzes = statsData?.quizzes_taken ?? 0
  const topicScores = statsData?.topic_scores ?? null
  const badgeList = statsData?.badges ?? user?.badges ?? []

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : '2024'

  const roleLabel = user?.role === 'teacher' ? 'Teacher' : 'Student'
  const roleColor = user?.role === 'teacher' ? '#800020' : '#FF6B00'

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, marginLeft: '240px', padding: '32px', overflowX: 'hidden' }}>
          <h1 className="animate-fade-in-up" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '24px', color: '#2D2D2D', margin: '0 0 24px' }}>
            My Profile
          </h1>

          {/* Profile header card */}
          <div
            className="animate-fade-in-up"
            style={{ background: '#fff', borderRadius: '16px', padding: '28px 32px', boxShadow: '0 2px 16px rgba(255,107,0,0.08)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}
          >
            {/* Avatar */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B00, #CC5500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Poppins", sans-serif', fontWeight: '800', fontSize: '28px', color: '#fff', boxShadow: '0 4px 16px rgba(255,107,0,0.3)', flexShrink: 0 }}>
              {getInitials(user?.name || 'U')}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '22px', color: '#2D2D2D', margin: 0 }}>
                  {user?.name}
                </h2>
                <span style={{ padding: '3px 12px', borderRadius: '24px', background: `rgba(${roleColor === '#FF6B00' ? '255,107,0' : '128,0,32'},0.1)`, color: roleColor, fontSize: '12px', fontWeight: '600', fontFamily: '"Poppins", sans-serif' }}>
                  {roleLabel}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6B6B6B', margin: '0 0 6px', fontFamily: '"Noto Sans", sans-serif' }}>{user?.email}</p>
              <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>Member since {memberSince}</p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={() => { setEditName(user?.name || ''); setEditOpen(true) }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'transparent', border: '1.5px solid #FF6B00', borderRadius: '8px', color: '#FF6B00', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: '"Poppins", sans-serif', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                <Edit2 size={13} /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: '"Poppins", sans-serif', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              >
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: '⭐', label: 'Karma', value: karma.toLocaleString(), color: '#D4A017', bg: 'rgba(212,160,23,0.1)' },
              { icon: '🔥', label: 'Streak', value: `${streak} days`, color: '#FF6B00', bg: 'rgba(255,107,0,0.1)' },
              { icon: '🏅', label: 'Badges', value: badgesCount, color: '#800020', bg: 'rgba(128,0,32,0.08)' },
              { icon: '📚', label: 'Quizzes', value: quizzes, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
            ].map(item => (
              <div key={item.label} className="animate-fade-in-up" style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 12px rgba(255,107,0,0.07)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '20px', color: '#2D2D2D', margin: 0, lineHeight: 1 }}>{item.value}</p>
                  <p style={{ fontSize: '12px', color: '#6B6B6B', margin: '3px 0 0' }}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Topic Strengths */}
            {topicScores && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(255,107,0,0.07)' }}>
                <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
                  📊 Topic Strengths
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {Object.entries({ Geometry: topicScores.geometry, Symmetry: topicScores.symmetry, Arithmetic: topicScores.arithmetic, Mensuration: topicScores.mensuration, Percentages: topicScores.percentages }).map(([topic, score]) => {
                    const pct = score ?? 0
                    const color = TOPIC_COLORS[topic] || '#FF6B00'
                    return (
                      <div key={topic}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '500', color: '#2D2D2D', fontFamily: '"Noto Sans", sans-serif' }}>{topic}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color, fontFamily: '"Poppins", sans-serif' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#F0EDE8', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}CC)`, borderRadius: '99px', transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Account info */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(255,107,0,0.07)' }}>
              <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
                ⚙️ Account Settings
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Role', value: roleLabel },
                  { label: 'Member since', value: memberSince },
                  ...(user?.class_code ? [{ label: 'Class Code', value: user.class_code }] : []),
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '13px', color: '#6B6B6B', fontFamily: '"Noto Sans", sans-serif' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#2D2D2D', fontFamily: '"Poppins", sans-serif' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleLogout}
                style={{ width: '100%', marginTop: '20px', padding: '11px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#EF4444', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: '"Poppins", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>

          {/* Badge Collection */}
          <div style={{ marginTop: '24px', background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(255,107,0,0.07)' }}>
            <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
              🏅 My Badges
            </h2>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                <LoadingSpinner size="md" />
              </div>
            ) : (
              <BadgeShowcase badges={badgeList} />
            )}
          </div>
        </main>
      </div>

      {/* Edit Name Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile" size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: '"Noto Sans", sans-serif' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#2D2D2D', marginBottom: '6px', fontFamily: '"Poppins", sans-serif' }}>
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E5E5E5', borderRadius: '8px', fontSize: '14px', fontFamily: '"Noto Sans", sans-serif', color: '#2D2D2D', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#FF6B00' }}
              onBlur={e => { e.target.style.borderColor = '#E5E5E5' }}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setEditOpen(false)}
              style={{ padding: '9px 20px', background: 'transparent', border: '1.5px solid #E5E5E5', borderRadius: '8px', color: '#6B6B6B', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: '"Noto Sans", sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveName}
              disabled={editSaving || !editName.trim()}
              style={{ padding: '9px 20px', background: '#FF6B00', border: '2px solid #FF6B00', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: editSaving ? 'not-allowed' : 'pointer', fontFamily: '"Poppins", sans-serif', opacity: editSaving ? 0.7 : 1 }}
            >
              {editSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
