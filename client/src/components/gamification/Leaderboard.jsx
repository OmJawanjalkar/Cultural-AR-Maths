import { useState } from 'react'
import { Star } from 'lucide-react'
import { getLevel } from '../../utils/karmaCalculator'

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

const RANK_AVATAR_BG = {
  1: 'linear-gradient(135deg, #D4A017, #FFD700)',
  2: 'linear-gradient(135deg, #A0A0A0, #C0C0C0)',
  3: 'linear-gradient(135deg, #CD7F32, #E8A96A)',
}

const TABS = [
  { id: 'week',  label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'all',   label: 'All Time' },
]

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/**
 * Leaderboard — ranked table with time-period tabs and rank-change indicators.
 *
 * Props:
 *   entries       {object} – { week: [...], month: [...], all: [...] }
 *                            OR array (treated as 'all time')
 *   currentUserId {string}
 */
export default function Leaderboard({ entries = {}, currentUserId = null }) {
  const [activeTab, setActiveTab] = useState('week')

  // Support both array (legacy) and object (tabbed)
  const tabData = Array.isArray(entries)
    ? { week: entries, month: entries, all: entries }
    : entries

  const rows = tabData[activeTab] || []

  const isEmpty = rows.length === 0

  return (
    <div style={{ fontFamily: '"Noto Sans", sans-serif' }}>
      {/* ── Tabs ───────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '16px',
          background: '#F9F7F4',
          borderRadius: '10px',
          padding: '4px',
          border: '1px solid #F0EDE8',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              color: activeTab === tab.id ? '#FF6B00' : '#6B6B6B',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: activeTab === tab.id ? '700' : '500',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Empty state ───────────────────────────── */}
      {isEmpty ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: '#6B6B6B',
            fontSize: '14px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</div>
          No data yet for {TABS.find(t => t.id === activeTab)?.label.toLowerCase()}.
          <br />Start quizzing to earn your rank!
        </div>
      ) : (
        <div
          style={{
            borderRadius: '12px',
            border: '1px solid rgba(255,107,0,0.1)',
            overflow: 'hidden',
            background: '#FFFFFF',
          }}
        >
          {/* Header row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 100px 80px 80px 70px',
              padding: '10px 16px',
              background: 'rgba(255,107,0,0.04)',
              borderBottom: '1px solid rgba(255,107,0,0.08)',
              gap: '8px',
            }}
          >
            {['Rank', 'Student', 'Karma', 'Streak', 'Quizzes', 'Level'].map(h => (
              <span
                key={h}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#9CA3AF',
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Data rows */}
          {rows.map((entry, idx) => {
            const isCurrentUser = entry.user_id === currentUserId
            const isTop3 = entry.rank <= 3
            const level = getLevel(entry.karma_points || 0)

            // Rank change: if entry.prev_rank is provided
            const rankChange = entry.prev_rank ? entry.prev_rank - entry.rank : 0

            return (
              <div
                key={entry.user_id || idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 100px 80px 80px 70px',
                  padding: '12px 16px',
                  gap: '8px',
                  alignItems: 'center',
                  background: isCurrentUser
                    ? 'rgba(255,107,0,0.06)'
                    : idx % 2 === 0 ? '#FFFFFF' : 'rgba(255,107,0,0.012)',
                  borderLeft: isCurrentUser ? '3px solid #FF6B00' : '3px solid transparent',
                  borderBottom: '1px solid rgba(0,0,0,0.04)',
                  transition: 'background 0.2s',
                }}
              >
                {/* Rank + change indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: '700',
                      fontSize: isTop3 ? '20px' : '14px',
                      color: isTop3 ? undefined : '#6B6B6B',
                    }}
                  >
                    {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                  </span>
                  {rankChange > 0 && (
                    <span style={{ fontSize: '10px', color: '#22C55E', fontWeight: '700' }}>↑{rankChange}</span>
                  )}
                  {rankChange < 0 && (
                    <span style={{ fontSize: '10px', color: '#EF4444', fontWeight: '700' }}>↓{Math.abs(rankChange)}</span>
                  )}
                </div>

                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isTop3 ? RANK_AVATAR_BG[entry.rank] : 'rgba(255,107,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isTop3 ? '#FFFFFF' : '#FF6B00',
                      fontFamily: '"Poppins", sans-serif',
                    }}
                  >
                    {getInitials(entry.name)}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <p
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: isCurrentUser ? '700' : '500',
                        fontSize: '13px',
                        color: '#2D2D2D',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {entry.name}
                      {isCurrentUser && (
                        <span
                          style={{
                            marginLeft: '6px',
                            fontSize: '9px',
                            background: 'rgba(255,107,0,0.12)',
                            color: '#FF6B00',
                            borderRadius: '99px',
                            padding: '1px 6px',
                            fontWeight: '700',
                            verticalAlign: 'middle',
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Karma */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={12} fill="#D4A017" color="#D4A017" />
                  <span
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: '600',
                      fontSize: '13px',
                      color: '#D4A017',
                    }}
                  >
                    {(entry.karma_points || 0).toLocaleString()}
                  </span>
                </div>

                {/* Streak */}
                <span style={{ fontSize: '13px', color: '#2D2D2D' }}>
                  🔥 {entry.streak || 0}
                </span>

                {/* Quizzes */}
                <span style={{ fontSize: '13px', color: '#6B6B6B' }}>
                  {entry.quizzes_taken || 0}
                </span>

                {/* Level */}
                <span
                  style={{
                    fontSize: '12px',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600',
                    color: level.color,
                    whiteSpace: 'nowrap',
                  }}
                  title={level.name}
                >
                  {level.emoji}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
