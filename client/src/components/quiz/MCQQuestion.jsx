/**
 * MCQQuestion — renders a 2×2 grid of multiple-choice option buttons.
 *
 * Props:
 *   question        {object}   – question object (options array required)
 *   selectedAnswer  {string}   – currently selected option text
 *   onSelect        {function} – called with option text when user clicks
 *   submitted       {boolean}  – true after submit (disables buttons, shows result colours)
 *   isCorrect       {boolean}  – whether the submitted answer was correct
 *   correctAnswer   {string}   – the correct option text (shown after submit)
 */
export default function MCQQuestion({
  question,
  selectedAnswer,
  onSelect,
  submitted,
  isCorrect,
  correctAnswer,
}) {
  const options = question?.options ?? []

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}
    >
      {options.map((opt, i) => {
        const isSelected = selectedAnswer === opt
        const isCorrectOpt = submitted && String(opt) === String(correctAnswer)
        const isWrongSelected = submitted && isSelected && !isCorrect

        let bg = '#FFFFFF'
        let border = '2px solid #E5E5E5'
        let color = '#2D2D2D'
        let shadow = 'none'

        if (!submitted && isSelected) {
          bg = 'rgba(255,107,0,0.07)'
          border = '2px solid #FF6B00'
          color = '#FF6B00'
          shadow = '0 0 0 3px rgba(255,107,0,0.12)'
        } else if (submitted && isCorrectOpt) {
          bg = 'rgba(34,197,94,0.1)'
          border = '2px solid #22C55E'
          color = '#16A34A'
        } else if (submitted && isWrongSelected) {
          bg = 'rgba(239,68,68,0.08)'
          border = '2px solid #EF4444'
          color = '#EF4444'
        }

        return (
          <button
            key={i}
            disabled={submitted}
            onClick={() => !submitted && onSelect(opt)}
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '72px',
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: '10px',
              border,
              background: bg,
              color,
              fontSize: '14px',
              fontFamily: '"Noto Sans", sans-serif',
              fontWeight: isSelected && !submitted ? '600' : '400',
              cursor: submitted ? 'default' : 'pointer',
              boxShadow: shadow,
              transition: 'all 0.18s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              lineHeight: '1.4',
            }}
            onMouseEnter={e => {
              if (!submitted && !isSelected) {
                e.currentTarget.style.borderColor = '#FF6B00'
                e.currentTarget.style.background = 'rgba(255,107,0,0.04)'
              }
            }}
            onMouseLeave={e => {
              if (!submitted && !isSelected) {
                e.currentTarget.style.borderColor = '#E5E5E5'
                e.currentTarget.style.background = '#FFFFFF'
              }
            }}
          >
            {/* Option letter badge */}
            <span
              style={{
                flexShrink: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: submitted && isCorrectOpt
                  ? 'rgba(34,197,94,0.2)'
                  : submitted && isWrongSelected
                  ? 'rgba(239,68,68,0.15)'
                  : isSelected && !submitted
                  ? 'rgba(255,107,0,0.15)'
                  : 'rgba(255,107,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '700',
                color: submitted && isCorrectOpt
                  ? '#16A34A'
                  : submitted && isWrongSelected
                  ? '#EF4444'
                  : '#FF6B00',
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              {submitted && isCorrectOpt ? '✓' : submitted && isWrongSelected ? '✗' : String.fromCharCode(65 + i)}
            </span>

            <span style={{ flex: 1 }}>{opt}</span>
          </button>
        )
      })}
    </div>
  )
}
