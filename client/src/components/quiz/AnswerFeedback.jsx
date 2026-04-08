import { useEffect, useState } from 'react'

/**
 * AnswerFeedback — shown immediately after submitting an answer.
 *
 * Correct:  green flash, animated checkmark, floating "+X Karma!", streak fire counter,
 *           expandable explanation, cultural note, "Next Question →" button.
 *
 * Wrong:    card-shake (handled by parent), red ✗, correct answer reveal,
 *           yellow hint callout, full explanation, "Next Question →" button.
 *
 * Props:
 *   isCorrect       {boolean}
 *   karmaEarned     {number}
 *   streak          {number}  – consecutive correct including this one
 *   explanation     {string}
 *   culturalContext {string}
 *   correctAnswer   {string|number}
 *   hint            {string}
 *   difficulty      {number}  – 1-5
 *   onNext          {function}
 *   isLastQuestion  {boolean}
 */
export default function AnswerFeedback({
  isCorrect,
  karmaEarned = 0,
  streak = 0,
  explanation = '',
  culturalContext = '',
  correctAnswer,
  hint = '',
  difficulty = 3,
  onNext,
  isLastQuestion = false,
}) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [karmaAnimDone, setKarmaAnimDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setKarmaAnimDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      className={`animate-slide-down ${isCorrect ? 'animate-pulse-green' : ''}`}
      style={{
        marginTop: '20px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: `2px solid ${isCorrect ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.3)'}`,
        background: isCorrect ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.04)',
      }}
    >
      {/* ── Header ────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          borderBottom: `1px solid ${isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.12)'}`,
          position: 'relative',
        }}
      >
        {/* Big icon */}
        <span
          className="animate-scale-in"
          style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0 }}
        >
          {isCorrect ? '✅' : '❌'}
        </span>

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '16px',
              color: isCorrect ? '#16A34A' : '#DC2626',
              margin: '0 0 4px',
            }}
          >
            {isCorrect
              ? streak >= 5 ? `Incredible! ${streak} in a row! 🔥` : 'Correct! Well done! 🎉'
              : 'Not quite — keep going!'}
          </p>

          {/* Streak badge */}
          {isCorrect && streak >= 2 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(255,107,0,0.1)',
                border: '1px solid rgba(255,107,0,0.3)',
                borderRadius: '99px',
                padding: '2px 10px',
                fontSize: '12px',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                color: '#FF6B00',
              }}
            >
              🔥 {streak} streak!
            </span>
          )}
        </div>

        {/* Floating karma animation */}
        {isCorrect && karmaEarned > 0 && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '700',
                fontSize: '14px',
                color: '#D4A017',
                animation: karmaAnimDone ? 'none' : 'floatUp 1s ease forwards',
              }}
            >
              ⭐ +{karmaEarned} Karma!
            </span>
          </div>
        )}
      </div>

      {/* ── Body ──────────────────────────────────────── */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Wrong answer → reveal correct */}
        {!isCorrect && correctAnswer !== undefined && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              fontSize: '14px',
              fontFamily: '"Noto Sans", sans-serif',
              color: '#2D2D2D',
            }}
          >
            Correct answer:{' '}
            <strong style={{ color: '#16A34A' }}>{String(correctAnswer)}</strong>
          </div>
        )}

        {/* Hint callout */}
        {hint && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(212,160,23,0.08)',
              border: '1px solid rgba(212,160,23,0.3)',
              fontSize: '13px',
              fontFamily: '"Noto Sans", sans-serif',
              color: '#78520A',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}
          >
            <span style={{ flexShrink: 0 }}>💡</span>
            <span><strong>Hint:</strong> {hint}</span>
          </div>
        )}

        {/* Explanation (collapsible) */}
        {explanation && (
          <div>
            <button
              onClick={() => setShowExplanation(v => !v)}
              style={{
                background: 'none',
                border: 'none',
                color: '#FF6B00',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0,
                fontFamily: '"Poppins", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {showExplanation ? '▲' : '▼'} {showExplanation ? 'Hide' : 'Show'} Explanation
            </button>
            {showExplanation && (
              <div
                className="animate-slide-down"
                style={{
                  marginTop: '8px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,107,0,0.04)',
                  border: '1px solid rgba(255,107,0,0.12)',
                  fontSize: '13px',
                  fontFamily: '"Noto Sans", sans-serif',
                  color: '#374151',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {explanation}
              </div>
            )}
          </div>
        )}

        {/* Cultural context note */}
        {culturalContext && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(128,0,32,0.05)',
              border: '1px solid rgba(128,0,32,0.15)',
              fontSize: '12px',
              fontFamily: '"Noto Sans", sans-serif',
              color: '#6B6B6B',
              fontStyle: 'italic',
              lineHeight: '1.6',
              display: 'flex',
              gap: '8px',
            }}
          >
            <span>📖</span>
            <span>{culturalContext}</span>
          </div>
        )}

        {/* Karma breakdown (for correct answers) */}
        {isCorrect && karmaEarned > 0 && (
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>
            Base ({difficulty}×10) + bonuses = {karmaEarned} karma
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
          {!isCorrect && (
            <button
              onClick={onNext}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: 'transparent',
                color: '#6B6B6B',
                border: '2px solid #E5E5E5',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#FF6B00' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#6B6B6B' }}
            >
              Try Similar →
            </button>
          )}
          <button
            onClick={onNext}
            style={{
              flex: 2,
              padding: '12px 20px',
              background: '#FF6B00',
              color: '#FFFFFF',
              border: '2px solid #FF6B00',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'filter 0.15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            {isLastQuestion ? '📊 View Results' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}
