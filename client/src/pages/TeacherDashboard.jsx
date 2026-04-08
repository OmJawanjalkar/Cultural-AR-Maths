import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLiveData } from '../contexts/LiveDataContext'
import { NavLink } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import TeacherSidebar from '../components/dashboard/TeacherSidebar'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ClassOverview from '../components/dashboard/ClassOverview'
import ClassPerformanceChart from '../components/dashboard/ClassPerformanceChart'
import StudentTable from '../components/dashboard/StudentTable'
import StudentDetailModal from '../components/dashboard/StudentDetailModal'
import AssignmentManager from '../components/dashboard/AssignmentManager'
import ProblemAnalysis from '../components/dashboard/ProblemAnalysis'
import ExportReports from '../components/dashboard/ExportReports'

// Fallback data shown when the backend hasn't responded yet
const MOCK_STUDENTS = [
  { _id: '1', name: 'Arjun Sharma',  karma_points: 450, streak: 7, avg_score: 85, quizzes_taken: 34, weak_topic: 'Percentages', last_active: new Date().toISOString() },
  { _id: '2', name: 'Priya Patel',   karma_points: 380, streak: 5, avg_score: 78, quizzes_taken: 28, weak_topic: 'Mensuration', last_active: new Date(Date.now() - 86400000).toISOString() },
  { _id: '3', name: 'Rahul Kumar',   karma_points: 220, streak: 2, avg_score: 62, quizzes_taken: 19, weak_topic: 'Symmetry',   last_active: new Date(Date.now() - 172800000).toISOString() },
  { _id: '4', name: 'Sneha Reddy',   karma_points: 310, streak: 4, avg_score: 71, quizzes_taken: 25, weak_topic: 'Geometry',   last_active: new Date().toISOString() },
  { _id: '5', name: 'Amit Singh',    karma_points: 180, streak: 1, avg_score: 45, quizzes_taken: 14, weak_topic: 'Arithmetic', last_active: new Date(Date.now() - 259200000).toISOString() },
  { _id: '6', name: 'Kavya Nair',    karma_points: 520, streak: 9, avg_score: 92, quizzes_taken: 42, weak_topic: 'Mensuration', last_active: new Date().toISOString() },
  { _id: '7', name: 'Vikas Gupta',   karma_points: 150, streak: 0, avg_score: 38, quizzes_taken:  9, weak_topic: 'Geometry',   last_active: new Date(Date.now() - 432000000).toISOString() },
  { _id: '8', name: 'Ananya Iyer',   karma_points: 290, streak: 3, avg_score: 67, quizzes_taken: 22, weak_topic: 'Percentages', last_active: new Date(Date.now() - 86400000).toISOString() },
]
const MOCK_STATS = { classCode: 'SKT2024', totalStudents: 28, avgScore: 68, activeToday: 12, assignmentsSet: 3 }

const CARD = {
  background: '#fff',
  borderRadius: '12px',
  padding: '24px',
  boxShadow: '0 2px 12px rgba(255,107,0,0.07)',
  border: '1px solid rgba(255,107,0,0.07)',
}

function formatTime(date) {
  if (!date) return null
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { students, classStats, lastUpdated, isRefreshing, fetchError, refresh } = useLiveData()
  const [selectedStudent, setSelectedStudent] = useState(null)

  const firstName = user?.name?.split(' ')[0] || 'Teacher'

  // Use live data from context; fall back to mock when context hasn't loaded yet
  const displayStudents = students.length ? students : MOCK_STUDENTS
  const displayStats    = Object.keys(classStats).length ? classStats : MOCK_STATS
  const isUsingMock     = !students.length
  const isLoading       = isRefreshing && !students.length  // only block UI on first load

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <TeacherSidebar classCode={displayStats.classCode} />

        <main className="dashboard-main" style={{ flex: 1, marginLeft: '240px', padding: '32px', overflowX: 'hidden' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '24px', color: '#2D2D2D', margin: '0 0 4px' }}>
                Welcome, {firstName}! 👩‍🏫
              </h1>
              <p style={{ color: '#6B6B6B', fontSize: '14px', margin: 0, fontFamily: '"Noto Sans", sans-serif' }}>
                Manage your class and track student progress.
              </p>
            </div>

            {/* Live status + refresh */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: isRefreshing ? '#D4A017' : fetchError ? '#EF4444' : '#22C55E',
                  boxShadow: isRefreshing ? '0 0 0 3px rgba(212,160,23,0.25)' : fetchError ? 'none' : '0 0 0 3px rgba(34,197,94,0.2)',
                }} />
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>
                  {isRefreshing
                    ? 'Refreshing…'
                    : lastUpdated
                    ? `Updated ${formatTime(lastUpdated)}`
                    : 'Auto-refreshes every 30s'}
                </span>
              </div>
              <button
                onClick={refresh}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px',
                  background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.25)',
                  borderRadius: '8px', color: '#FF6B00', fontSize: '12px', fontWeight: '600',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontFamily: '"Poppins", sans-serif',
                  opacity: isRefreshing ? 0.6 : 1,
                }}
              >
                <RefreshCw size={12} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error banner */}
          {fetchError && (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: '#EF4444', fontFamily: '"Noto Sans", sans-serif' }}>
                ⚠️ {fetchError} — {isUsingMock ? 'showing sample data' : 'showing last known data'}
              </span>
              <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600', fontFamily: '"Poppins", sans-serif', padding: 0 }}>
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Section 1: Class Overview */}
              <ClassOverview stats={{
                totalStudents:  displayStats.totalStudents,
                avgScore:       displayStats.avgScore,
                activeToday:    displayStats.activeToday,
                assignmentsSet: displayStats.assignmentsSet,
              }} />

              {/* Section 2: Class Performance Chart */}
              <div style={CARD}>
                <ClassPerformanceChart />
              </div>

              {/* Section 3: Student Table */}
              <div style={CARD}>
                <StudentTable
                  students={displayStudents}
                  onSelectStudent={setSelectedStudent}
                />
              </div>

              {/* Section 5: Assignment Manager */}
              <div style={CARD}>
                <AssignmentManager totalStudents={displayStats.totalStudents} />
              </div>

              {/* Section 6: Problem Analysis */}
              <div style={CARD}>
                <ProblemAnalysis />
              </div>

              {/* Section 7: Export Reports */}
              <div style={CARD}>
                <ExportReports
                  students={displayStudents}
                  classStats={{
                    className:      `${firstName}'s Class`,
                    classCode:      displayStats.classCode,
                    totalStudents:  displayStats.totalStudents,
                    avgScore:       displayStats.avgScore,
                    activeToday:    displayStats.activeToday,
                  }}
                />
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Section 4: Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* ── Mobile Bottom Navigation (visible only on mobile via CSS) ── */}
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {[
          { to: '/teacher-dashboard', emoji: '📊', label: 'Dashboard' },
          { to: '/teacher-dashboard', emoji: '👥', label: 'Class' },
          { to: '/teacher-dashboard', emoji: '📈', label: 'Analytics' },
          { to: '/profile',           emoji: '👤', label: 'Profile' },
        ].map((item) => (
          <NavLink
            key={item.label}
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
