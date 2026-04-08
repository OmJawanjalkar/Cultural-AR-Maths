import { useRef } from 'react'

/**
 * NumericQuestion — large input field with an on-screen number pad.
 * Supports integers, decimals, and negative numbers.
 * Checks answer within ±2% tolerance for rounding.
 *
 * Props:
 *   question      {object}   – question object
 *   value         {string}   – current input value
 *   onChange      {function} – called with new string value
 *   submitted     {boolean}  – true after submit
 *   isCorrect     {boolean}  – result after submit
 *   correctAnswer {string}   – the correct numeric answer
 */
export default function NumericQuestion({
  question,
  value,
  onChange,
  submitted,
  isCorrect,
  correctAnswer,
}) {
  const inputRef = useRef(null)

  const append = (char) => {
    if (submitted) return
    onChange(prev => {
      if (char === '.' && prev.includes('.')) return prev
      if (char === '-') return prev.startsWith('-') ? prev.slice(1) : '-' + prev
      if (char === '⌫') return prev.slice(0, -1)
      if (char === 'C') return ''
      return prev + char
    })
  }

  const PAD_ROWS = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['-', '0', '.'],
  ]

  const borderColor = submitted
    ? isCorrect ? '#22C55E' : '#EF4444'
    : value ? '#FF6B00' : '#E5E5E5'

  const closeFloat = submitted && !isCorrect && correctAnswer !== undefined
  const numVal = parseFloat(value)
  const numCorrect = parseFloat(correctAnswer)
  const isClose =
    closeFloat &&
    !isNaN(numVal) &&
    !isNaN(numCorrect) &&
    numCorrect !== 0 &&
    Math.abs(numVal - numCorrect) / Math.abs(numCorrect) <= 0.05

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Large display input */}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          inputMode="none"
          value={value}
          readOnly
          placeholder="0"
          style={{
            width: '240px',
            height: '72px',
            textAlign: 'center',
            fontSize: '32px',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '700',
            border: `3px solid ${borderColor}`,
            borderRadius: '14px',
            outline: 'none',
            color: submitted
              ? isCorrect ? '#16A34A' : '#EF4444'
              : '#2D2D2D',
            background: submitted
              ? isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.04)'
              : '#FFFFFF',
            transition: 'border-color 0.2s, color 0.2s',
            cursor: 'default',
            letterSpacing: '1px',
          }}
        />
        {submitted && (
          <span
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '24px',
            }}
          >
            {isCorrect ? '✅' : '❌'}
          </span>
        )}
      </div>

      {/* Hint if answer was close but outside tolerance */}
      {isClose && (
        <div
          style={{
            background: 'rgba(212,160,23,0.1)',
            border: '1px solid rgba(212,160,23,0.4)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '13px',
            color: '#92700A',
            fontFamily: '"Noto Sans", sans-serif',
            textAlign: 'center',
            maxWidth: '260px',
          }}
        >
          💡 Close! Exact answer: <strong>{correctAnswer}</strong>
        </div>
      )}

      {/* On-screen number pad */}
      {!submitted && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {PAD_ROWS.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: '8px' }}>
              {row.map((key) => (
                <PadButton key={key} label={key} onPress={() => append(key)} />
              ))}
            </div>
          ))}
          {/* Bottom row: Clear + Backspace */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <PadButton label="C" onPress={() => append('C')} accent />
            <PadButton label="⌫" onPress={() => append('⌫')} wide />
          </div>
        </div>
      )}
    </div>
  )
}

function PadButton({ label, onPress, accent = false, wide = false }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: wide ? '144px' : '68px',
        height: '52px',
        borderRadius: '10px',
        border: accent ? '2px solid #EF4444' : '2px solid #E5E5E5',
        background: accent ? 'rgba(239,68,68,0.06)' : '#FFFFFF',
        color: accent ? '#EF4444' : '#2D2D2D',
        fontSize: label === '⌫' ? '18px' : '20px',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.12s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = accent ? 'rgba(239,68,68,0.12)' : 'rgba(255,107,0,0.06)'
        e.currentTarget.style.borderColor = accent ? '#EF4444' : '#FF6B00'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = accent ? 'rgba(239,68,68,0.06)' : '#FFFFFF'
        e.currentTarget.style.borderColor = accent ? '#EF4444' : '#E5E5E5'
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
    >
      {label}
    </button>
  )
}
