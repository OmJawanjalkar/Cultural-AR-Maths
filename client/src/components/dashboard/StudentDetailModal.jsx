import { X } from 'lucide-react'
import { useEffect } from 'react'
import TopicRadarChart from './TopicRadarChart'

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function ModuleBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: '#4B5563', fontFamily: '"Noto Sans", sans-serif' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color, fontFamily: '"Poppins", sans-serif' }}>{pct}%</span>
      </div>
      <div style={{ background: '#F0EDE8', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

// Mock per-module progress for a student
function getMockModuleProgress(student) {
  const seed = (student?.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const rand = (min, max) => min + ((seed * 9301 + 49297) % max)
  return [
    { label: '🕌 Temple Architecture', pct: rand(40, 60) },
    { label: '🌸 Rangoli Symmetry', pct: rand(55, 45) },
    { label: '🥬 Sabzi Mandi', pct: rand(30, 70) },
    { label: '📐 3D Geometry', pct: rand(20, 80) },
  ]
}

// Mock recent quiz attempts
function getMockAttempts(student) {
  const modules = ['Temple Quiz', 'Symmetry Quiz', 'Sabzi Mandi Quiz', '3D Geometry Quiz', 'General Quiz']
  const seed = (student?.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 42)
  return Array.from({ length: 8 }, (_, i) => ({
    module: modules[i % modules.length],
    score: Math.round(((seed * (i + 1) * 17) % 40) + 60),
    total: 100,
    date: new Date(Date.now() - i * 86400000 * (i + 1)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }))
}

// Build mock topic scores for radar
function getMockTopicScores(student) {
  const base = student?.avg_score ?? 60
  const variance = 25
  const seed = (student?.name || '').split('').reduce((s, c) => s + c.charCodeAt(0), 7)
  const r = (i) => Math.min(100, Math.max(20, base + ((seed * (i + 3) * 13) % variance) - variance / 2))
  return {
    geometry: r(0),
    symmetry: r(1),
    arithmetic: r(2),
    mensuration: r(3),
    percentages: r(4),
  }
}

export default function StudentDetailModal({ student, onClose }) {
  if (!student) return null

  const moduleProgress = getMockModuleProgress(student)
  const attempts = getMockAttempts(student)
  const topicScores = student.topicScores || getMockTopicScores(student)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(3px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
    >
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '88vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,107,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF6B00, #FF8C3A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '800',
              color: '#FFFFFF',
              fontFamily: '"Poppins", sans-serif',
              flexShrink: 0,
            }}>
              {getInitials(student.name)}
            </div>
            <div>
              <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '17px', color: '#2D2D2D', margin: 0 }}>
                {student.name}
              </h2>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '2px 0 0', fontFamily: '"Noto Sans", sans-serif' }}>
                Last active: {timeAgo(student.last_active)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2D2D2D' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { label: 'Karma Points', value: `⭐ ${(student.karma_points ?? 0).toLocaleString()}` },
              { label: 'Current Streak', value: `🔥 ${student.streak ?? 0} days` },
              { label: 'Average Score', value: `${student.avg_score ?? 0}%`, color: student.avg_score >= 70 ? '#22C55E' : student.avg_score >= 50 ? '#FF6B00' : '#EF4444' },
              { label: 'Weak Topic', value: student.weak_topic || '—' },
            ].map(item => (
              <div key={item.label} style={{
                background: '#FFF8E7',
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <p style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px', fontFamily: '"Poppins", sans-serif', fontWeight: '600' }}>
                  {item.label}
                </p>
                <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '15px', color: item.color || '#2D2D2D', margin: 0 }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Topic radar */}
          <div>
            <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 8px' }}>
              Topic Strengths
            </h4>
            <TopicRadarChart data={topicScores} />
          </div>

          {/* Module progress */}
          <div>
            <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 12px' }}>
              Module Progress
            </h4>
            {moduleProgress.map(m => (
              <ModuleBar
                key={m.label}
                label={m.label}
                pct={m.pct}
                color={m.pct >= 70 ? '#22C55E' : m.pct >= 50 ? '#FF6B00' : '#EF4444'}
              />
            ))}
          </div>

          {/* Recent quiz attempts */}
          <div>
            <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 10px' }}>
              Recent Quiz Attempts
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {attempts.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: i % 2 === 0 ? '#FAFAFA' : '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}>
                  <span style={{ color: '#4B5563', fontFamily: '"Noto Sans", sans-serif' }}>{a.module}</span>
                  <span style={{ color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>{a.date}</span>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '700',
                    color: a.score >= 70 ? '#22C55E' : a.score >= 50 ? '#FF6B00' : '#EF4444',
                    background: a.score >= 70 ? 'rgba(34,197,94,0.1)' : a.score >= 50 ? 'rgba(255,107,0,0.1)' : 'rgba(239,68,68,0.1)',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}>
                    {a.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Send reminder button */}
          <button
            style={{
              padding: '10px 20px',
              background: 'rgba(128,0,32,0.08)',
              border: '1.5px solid rgba(128,0,32,0.2)',
              borderRadius: '8px',
              color: '#800020',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Poppins", sans-serif',
              transition: 'background 0.15s',
            }}
            onClick={() => alert('Reminder feature coming soon!')}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(128,0,32,0.13)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(128,0,32,0.08)' }}
          >
            📩 Send Reminder to {student.name.split(' ')[0]}
          </button>
        </div>
      </div>
    </div>
  )
}
