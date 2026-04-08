import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { NavLink } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import StudentSidebar from '../components/dashboard/StudentSidebar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import StatsOverview from '../components/dashboard/StatsOverview'
import TopicRadarChart from '../components/dashboard/TopicRadarChart'
import ProgressTimeline from '../components/dashboard/ProgressTimeline'
import ModuleProgress from '../components/dashboard/ModuleProgress'
import RecentActivity from '../components/dashboard/RecentActivity'
import WeakAreas from '../components/dashboard/WeakAreas'
import StreakCalendar from '../components/dashboard/StreakCalendar'
import BadgeShowcase from '../components/gamification/BadgeShowcase'
import { dashboardService } from '../services/dashboardService'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// Backend module names → display labels
const MODULE_LABELS = {
  temple: 'Temple Architecture',
  rangoli: 'Rangoli Symmetry',
  sabzi_mandi: 'Sabzi Mandi',
  geometry_3d: '3D Geometry',
  general: 'Quick Quiz',
}

// Backend topic keys → radar chart keys
const TOPIC_TO_RADAR = {
  surface_area: 'geometry',
  symmetry: 'symmetry',
  profit_loss: 'arithmetic',
  volume: 'mensuration',
  arithmetic: 'percentages',
  geometry: 'geometry',
  mensuration: 'mensuration',
  percentages: 'percentages',
}

// Backend topic → frontend module id (for "Practice" button)
const TOPIC_TO_MODULE = {
  surface_area: 'geometry',
  symmetry: 'symmetry',
  profit_loss: 'arithmetic',
  volume: '3d-geometry',
  arithmetic: 'all',
  geometry: 'geometry',
  mensuration: '3d-geometry',
  percentages: 'all',
}

function generateMockDates() {
  const dates = []
  for (let i = 0; i < 60; i++) {
    if (Math.random() > 0.55) {
      const d = new Date(Date.now() - i * 86400000)
      dates.push(d.toISOString().split('T')[0])
    }
  }
  return dates
}

const MOCK = {
  karma: 0,
  streak: 0,
  badges: 0,
  quizzes: 0,
  topicScores: { geometry: 0, symmetry: 0, arithmetic: 0, mensuration: 0, percentages: 0 },
  recentActivities: [],
  weakAreas: [],
  activityDates: generateMockDates(),
  badgeList: [],
}

function transformDashboard(d) {
  const rawTopics = d.topic_scores || {}
  const topicScores = { geometry: 0, symmetry: 0, arithmetic: 0, mensuration: 0, percentages: 0 }
  Object.entries(rawTopics).forEach(([key, val]) => {
    const radarKey = TOPIC_TO_RADAR[key]
    if (radarKey) topicScores[radarKey] = Math.round(val)
  })

  const recentActivities = (d.recent_activity || []).map((a) => ({
    module_name: MODULE_LABELS[a.module] || a.module || 'Quiz',
    score: a.is_correct ? 1 : 0,
    total: 1,
    timestamp: a.timestamp,
    difficulty: null,
  }))

  const weakAreas = (d.weak_topics || []).map((topic) => ({
    topic: topic.charAt(0).toUpperCase() + topic.slice(1).replace(/_/g, ' '),
    score: Math.round(rawTopics[topic] || 0),
    module_id: TOPIC_TO_MODULE[topic] || 'all',
  }))

  const activityDates = [
    ...new Set(
      (d.recent_activity || [])
        .filter((a) => a.timestamp)
        .map((a) => a.timestamp.split('T')[0])
    ),
  ]
  const allDates = activityDates.length >= 3 ? activityDates : generateMockDates()

  return {
    karma: d.karma ?? 0,
    streak: d.streak ?? 0,
    badges: Array.isArray(d.badges) ? d.badges.length : (d.badges_count ?? 0),
    quizzes: recentActivities.length,
    topicScores,
    recentActivities,
    weakAreas,
    activityDates: allDates,
    badgeList: Array.isArray(d.badges) ? d.badges : [],
  }
}

const CARD = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(255,107,0,0.07)',
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await dashboardService.getStudentDashboard()
      const d = res?.data?.data || res?.data || {}
      setData(transformDashboard(d))
    } catch {
      setError('Could not load dashboard. Showing sample data.')
      setData(MOCK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const firstName = user?.name?.split(' ')[0] || 'Student'

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <StudentSidebar />

        {/* Main content */}
        <main
          className="dashboard-main"
          style={{ flex: 1, marginLeft: '240px', padding: '32px', overflowX: 'hidden' }}
        >
          {/* Welcome header */}
          <div className="animate-fade-in-up" style={{ marginBottom: '24px' }}>
            <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '24px', color: '#2D2D2D', margin: '0 0 4px' }}>
              {getGreeting()}, {firstName}! {new Date().getHours() < 12 ? '🌅' : new Date().getHours() < 17 ? '☀️' : '🌙'}
            </h1>
            <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0, fontFamily: '"Noto Sans", sans-serif' }}>
              Here's your learning progress at a glance.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#FF6B00', fontFamily: '"Noto Sans", sans-serif' }}>⚠️ {error}</span>
              <button onClick={fetchData} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6B00', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', fontFamily: '"Poppins", sans-serif', padding: 0 }}>
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Section 1: Stats Overview */}
              <StatsOverview
                stats={{
                  karma: data.karma,
                  streak: data.streak,
                  badges: data.badges,
                  quizzes: data.quizzes,
                }}
              />

              {/* Section 2 & 7: Radar + Streak Calendar */}
              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={CARD}>
                  <TopicRadarChart data={data.topicScores} />
                </div>
                <div style={CARD}>
                  <StreakCalendar activityDates={data.activityDates} streak={data.streak} />
                </div>
              </div>

              {/* Section 3: Progress Timeline */}
              <div style={CARD}>
                <ProgressTimeline />
              </div>

              {/* Section 4: Module Progress */}
              <div style={CARD}>
                <ModuleProgress />
              </div>

              {/* Section 5 & 6: Recent Activity + Weak Areas */}
              <div className="responsive-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={CARD}>
                  <RecentActivity activities={data.recentActivities} />
                </div>
                <div style={CARD}>
                  <WeakAreas weakAreas={data.weakAreas} />
                </div>
              </div>

              {/* Badge Showcase */}
              <div style={CARD}>
                <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
                  🏅 My Badge Collection
                </h2>
                <BadgeShowcase badges={data.badgeList} />
              </div>

            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation (visible only on mobile via CSS) ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          { to: '/student-dashboard', emoji: '📊', label: 'Dashboard' },
          { to: '/modules',           emoji: '📚', label: 'Modules' },
          { to: '/quiz/all',          emoji: '🧠', label: 'Quiz' },
          { to: '/leaderboard',       emoji: '🏆', label: 'Ranks' },
          { to: '/profile',           emoji: '👤', label: 'Profile' },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            aria-label={item.label}
          >
            <span className="nav-emoji" aria-hidden="true">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
