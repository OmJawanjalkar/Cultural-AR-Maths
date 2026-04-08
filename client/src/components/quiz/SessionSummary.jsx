import { useRef } from 'react'

/**
 * SessionSummary — end-of-session screen shown after 10 questions or early exit.
 *
 * Props:
 *   score          {number}   – correct answers count
 *   total          {number}   – total questions answered (usually 10)
 *   timeElapsed    {number}   – total seconds for the session
 *   karmaEarned    {number}   – total karma earned this session
 *   maxStreak      {number}   – highest streak this session
 *   questionHistory {array}   – [{question_text, topic, isCorrect, timeTaken, difficulty}]
 *   moduleName     {string}
 *   badgesEarned   {array}    – [{icon, name}] badges unlocked this session
 *   onPlayAgain    {function}
 *   onWeakTopics   {function}
 *   onBack         {function}
 */
export default function SessionSummary({
  score = 0,
  total = 10,
  timeElapsed = 0,
  karmaEarned = 0,
  maxStreak = 0,
  questionHistory = [],
  moduleName = 'Quiz',
  badgesEarned = [],
  onPlayAgain,
  onWeakTopics,
  onBack,
}) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0
  const avgTime = total > 0 ? Math.round(timeElapsed / total) : 0
  const summaryRef = useRef(null)

  const emoji = accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🌟' : accuracy >= 50 ? '📚' : '💪'
  const message =
    accuracy >= 90 ? 'Outstanding! You\'re a master!' :
    accuracy >= 70 ? 'Great job! Keep it up!' :
    accuracy >= 50 ? 'Good effort! Practice makes perfect.' :
    'Don\'t give up — every mistake is a lesson!'

  // Compute topic-wise accuracy
  const topicMap = {}
  questionHistory.forEach(q => {
    if (!q.topic) return
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 }
    topicMap[q.topic].total++
    if (q.isCorrect) topicMap[q.topic].correct++
  })
  const topics = Object.entries(topicMap).map(([topic, data]) => ({
    topic,
    accuracy: Math.round((data.correct / data.total) * 100),
    correct: data.correct,
    total: data.total,
  }))

  // Weak areas: topics where accuracy < 70%
  const weakAreas = topics.filter(t => t.accuracy < 70).map(t => t.topic)

  // Topic display names
  const TOPIC_NAMES = {
    temple: '🕌 Temple',
    rangoli: '🌸 Rangoli',
    sabzi_mandi: '🥬 Sabzi Mandi',
    geometry_3d: '📐 3D Geometry',
    general: '🧠 General',
  }

  return (
    <div
      ref={summaryRef}
      className="animate-fade-in-up"
      style={{
        minHeight: '100vh',
        background: '#FFF8E7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '"Noto Sans", sans-serif',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px 36px',
          maxWidth: '580px',
          width: '100%',
          boxShadow: '0 8px 48px rgba(255,107,0,0.12)',
        }}
      >
        {/* ── Header ────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px', lineHeight: 1 }}>{emoji}</div>
          <h2
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '24px',
              color: '#2D2D2D',
              margin: '0 0 6px',
            }}
          >
            Session Complete!
          </h2>
          <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 8px' }}>{moduleName}</p>
          <p style={{ color: '#FF6B00', fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', margin: 0 }}>
            {message}
          </p>
        </div>

        {/* ── Stats Grid ────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            marginBottom: '24px',
          }}
        >
          {[
            { label: 'Score',    value: `${score}/${total}`,         icon: '🎯' },
            { label: 'Accuracy', value: `${accuracy}%`,              icon: '📊' },
            { label: 'Avg Time', value: `${avgTime}s`,               icon: '⏱️' },
            { label: 'Karma',    value: `+${karmaEarned}`,           icon: '⭐' },
          ].map(stat => (
            <div
              key={stat.label}
              style={{
                background: '#FFF8E7',
                borderRadius: '12px',
                padding: '14px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '700',
                  fontSize: '18px',
                  color: '#FF6B00',
                  margin: '0 0 2px',
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#6B6B6B', margin: 0 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Badges earned ─────────────────────────── */}
        {badgesEarned.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                color: '#2D2D2D',
                margin: '0 0 10px',
              }}
            >
              🏅 Badges Earned This Session
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {badgesEarned.map((b, i) => (
                <div
                  key={i}
                  className="animate-scale-in"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '99px',
                    background: 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(255,107,0,0.1))',
                    border: '1px solid rgba(212,160,23,0.4)',
                    fontSize: '13px',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: '600',
                    color: '#92700A',
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{b.icon}</span>
                  {b.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Max streak ────────────────────────────── */}
        {maxStreak >= 3 && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255,107,0,0.06)',
              border: '1px solid rgba(255,107,0,0.2)',
              fontSize: '13px',
              fontFamily: '"Noto Sans", sans-serif',
              color: '#FF6B00',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            🔥 Best streak this session: {maxStreak} in a row!
          </div>
        )}

        {/* ── Topic-wise performance ─────────────────── */}
        {topics.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                color: '#2D2D2D',
                margin: '0 0 12px',
              }}
            >
              Topic Performance
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topics.map(t => (
                <div key={t.topic}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                      fontSize: '12px',
                      fontFamily: '"Noto Sans", sans-serif',
                      color: '#374151',
                    }}
                  >
                    <span>{TOPIC_NAMES[t.topic] || t.topic}</span>
                    <span style={{ fontWeight: '600', color: t.accuracy >= 70 ? '#16A34A' : '#DC2626' }}>
                      {t.correct}/{t.total} ({t.accuracy}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#F0EDE8', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${t.accuracy}%`,
                        background: t.accuracy >= 70
                          ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                          : 'linear-gradient(90deg, #FF6B00, #EF4444)',
                        borderRadius: '99px',
                        transition: 'width 0.8s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Per-question breakdown ─────────────────── */}
        {questionHistory.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h3
              style={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                color: '#2D2D2D',
                margin: '0 0 10px',
              }}
            >
              Question Breakdown
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '220px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {questionHistory.map((q, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: q.isCorrect ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.04)',
                    border: `1px solid ${q.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>{q.isCorrect ? '✓' : '✗'}</span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: '12px',
                      fontFamily: '"Noto Sans", sans-serif',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Q{i + 1}: {q.question_text}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>{q.timeTaken}s</span>
                  <span
                    style={{
                      fontSize: '10px',
                      color: '#D4A017',
                      flexShrink: 0,
                      fontFamily: '"Noto Sans", sans-serif',
                    }}
                  >
                    {'★'.repeat(q.difficulty || 1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Weak areas ────────────────────────────── */}
        {weakAreas.length > 0 && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              marginBottom: '24px',
              fontSize: '13px',
              fontFamily: '"Noto Sans", sans-serif',
            }}
          >
            <p style={{ fontWeight: '700', color: '#DC2626', margin: '0 0 6px' }}>
              📌 Practice more:
            </p>
            <p style={{ color: '#374151', margin: 0 }}>
              {weakAreas.map(w => TOPIC_NAMES[w] || w).join(', ')}
            </p>
          </div>
        )}

        {/* ── Action buttons ────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={onPlayAgain}
            style={{
              flex: 2,
              padding: '14px 20px',
              background: '#FF6B00',
              color: '#FFFFFF',
              border: '2px solid #FF6B00',
              borderRadius: '10px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            🔄 Play Again
          </button>

          {weakAreas.length > 0 && (
            <button
              onClick={onWeakTopics}
              style={{
                flex: 2,
                padding: '14px 20px',
                background: 'transparent',
                color: '#FF6B00',
                border: '2px solid #FF6B00',
                borderRadius: '10px',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              🎯 Try Weak Topics
            </button>
          )}

          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: '14px 16px',
              background: 'transparent',
              color: '#6B6B6B',
              border: '2px solid #E5E5E5',
              borderRadius: '10px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '500',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#9CA3AF' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5' }}
          >
            ← Modules
          </button>
        </div>
      </div>
    </div>
  )
}
