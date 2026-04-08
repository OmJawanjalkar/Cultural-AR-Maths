import { RefreshCw, Trophy, Wifi } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLiveData } from '../contexts/LiveDataContext'
import Navbar from '../components/ui/Navbar'
import Sidebar from '../components/ui/Sidebar'
import LeaderboardTable from '../components/gamification/Leaderboard'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const MOCK_ENTRIES = [
  { rank: 1, user_id: '1', name: 'Arjun Sharma',  karma_points: 1240, streak: 15, quizzes_taken: 89 },
  { rank: 2, user_id: '2', name: 'Priya Patel',   karma_points: 1180, streak: 12, quizzes_taken: 76 },
  { rank: 3, user_id: '3', name: 'Rahul Kumar',   karma_points:  950, streak:  8, quizzes_taken: 65 },
  { rank: 4, user_id: '4', name: 'Sneha Reddy',   karma_points:  840, streak:  6, quizzes_taken: 58 },
  { rank: 5, user_id: '5', name: 'Amit Singh',    karma_points:  720, streak:  5, quizzes_taken: 47 },
  { rank: 6, user_id: '6', name: 'Kavya Nair',    karma_points:  680, streak:  4, quizzes_taken: 42 },
  { rank: 7, user_id: '7', name: 'Vikram Gupta',  karma_points:  540, streak:  3, quizzes_taken: 38 },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const PODIUM_STYLES = {
  1: { bg: 'linear-gradient(135deg, #D4A017, #FFD700)', height: '120px', label: '🥇', zIndex: 3 },
  2: { bg: 'linear-gradient(135deg, #A0A0A0, #C0C0C0)', height:  '90px', label: '🥈', zIndex: 2 },
  3: { bg: 'linear-gradient(135deg, #CD7F32, #E8A96A)', height:  '70px', label: '🥉', zIndex: 1 },
}

function formatTime(date) {
  if (!date) return '—'
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const { leaderboard, lastUpdated, isRefreshing, fetchError, refresh } = useLiveData()

  // Use live data if available, otherwise fall back to mock
  const entries = leaderboard.length ? leaderboard : MOCK_ENTRIES
  const isUsingMock = !leaderboard.length

  const top3 = entries.slice(0, 3)
  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean)

  const currentUserRank = entries.findIndex(e => e.user_id === user?._id)

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />

        <main style={{ flex: 1, marginLeft: '240px', padding: '32px', overflowX: 'hidden' }}>
          {/* Header */}
          <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Trophy size={28} color="#D4A017" />
              <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '24px', color: '#2D2D2D', margin: 0 }}>
                Class Leaderboard 🏆
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: isRefreshing ? '#D4A017' : fetchError ? '#EF4444' : '#22C55E',
                  boxShadow: isRefreshing ? '0 0 0 3px rgba(212,160,23,0.25)' : fetchError ? 'none' : '0 0 0 3px rgba(34,197,94,0.2)',
                  animation: isRefreshing ? 'pulse 1s infinite' : 'none',
                }} />
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>
                  {isRefreshing ? 'Refreshing…' : lastUpdated ? `Updated ${formatTime(lastUpdated)}` : 'Auto-refreshes every 30s'}
                </span>
              </div>

              <button
                onClick={refresh}
                disabled={isRefreshing}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px',
                  background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.25)',
                  borderRadius: '8px', color: '#FF6B00', fontSize: '13px', fontWeight: '600',
                  cursor: isRefreshing ? 'not-allowed' : 'pointer',
                  fontFamily: '"Poppins", sans-serif',
                  opacity: isRefreshing ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <RefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
                Refresh
              </button>
            </div>
          </div>

          {/* Error banner */}
          {fetchError && (
            <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#EF4444', fontFamily: '"Noto Sans", sans-serif' }}>
              ⚠️ {fetchError} — showing {isUsingMock ? 'sample' : 'last known'} data
            </div>
          )}

          {/* Mock data notice */}
          {isUsingMock && !fetchError && !isRefreshing && (
            <div style={{ background: 'rgba(255,107,0,0.07)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', fontSize: '13px', color: '#FF6B00', fontFamily: '"Noto Sans", sans-serif' }}>
              <Wifi size={13} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
              Showing sample data — complete a quiz to appear on the live leaderboard!
            </div>
          )}

          {isRefreshing && !leaderboard.length ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Podium */}
              {top3.length >= 3 && (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '32px 24px', boxShadow: '0 2px 16px rgba(255,107,0,0.08)', textAlign: 'center' }}>
                  <h2 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 28px' }}>
                    Top 3 Champions
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', height: '180px' }}>
                    {podiumOrder.map(entry => {
                      const ps = PODIUM_STYLES[entry.rank]
                      return (
                        <div key={entry.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: ps.zIndex }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: ps.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '16px', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: '3px solid #fff' }}>
                            {getInitials(entry.name)}
                          </div>
                          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '12px', color: '#2D2D2D', margin: 0, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.name.split(' ')[0]}
                          </p>
                          <p style={{ fontSize: '11px', color: '#D4A017', fontWeight: '700', margin: 0, fontFamily: '"Poppins", sans-serif' }}>
                            ⭐ {entry.karma_points.toLocaleString()}
                          </p>
                          <div style={{ width: '80px', height: ps.height, background: ps.bg, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '8px', fontSize: '20px' }}>
                            {ps.label}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Full leaderboard table */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px 24px', boxShadow: '0 2px 12px rgba(255,107,0,0.07)' }}>
                <LeaderboardTable entries={entries} currentUserId={user?._id} />
              </div>

              {/* Current user's position (if outside top 10) */}
              {currentUserRank > 9 && (
                <div style={{ background: 'rgba(255,107,0,0.06)', border: '1.5px solid rgba(255,107,0,0.2)', borderRadius: '10px', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '15px', color: '#FF6B00' }}>
                    Your Position: #{currentUserRank + 1}
                  </span>
                  <span style={{ fontSize: '13px', color: '#6B6B6B', fontFamily: '"Noto Sans", sans-serif' }}>
                    Keep quizzing to climb the leaderboard! 💪
                  </span>
                </div>
              )}

              {/* Last updated footer */}
              <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'right', fontFamily: '"Noto Sans", sans-serif', margin: 0 }}>
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleTimeString('en-IN')} · auto-refreshes every 30s`
                  : 'Waiting for first update…'}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
