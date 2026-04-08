import { useEffect, useRef, useState } from 'react'

/**
 * MatchingQuestion — drag-and-drop matching UI.
 * Left column: fixed items (drag sources).
 * Right column: shuffled answer chips (drop targets shown as slots).
 * Student drags a right chip and drops it on the matching left item's slot.
 *
 * question.pairs format:
 *   [{ left: 'Sphere', right: 'V = (4/3)πr³' }, ...]
 *
 * Props:
 *   question      {object}   – question object with .pairs array
 *   onComplete    {function} – called with [{left, right}] when all matched
 *   submitted     {boolean}  – true after final submit
 *   isCorrect     {boolean}  – overall result
 *   correctAnswer {array}    – correct pairs [{left, right}] for post-submit display
 */
export default function MatchingQuestion({
  question,
  onComplete,
  submitted,
  isCorrect,
  correctAnswer,
}) {
  const pairs = question?.pairs ?? []

  // Shuffle right answers on mount
  const [rightItems, setRightItems] = useState(() =>
    [...pairs.map((p, i) => ({ id: i, text: p.right }))]
      .sort(() => Math.random() - 0.5)
  )

  // matches: { leftIndex → rightText }
  const [matches, setMatches] = useState({})
  // shaking slots
  const [shaking, setShaking] = useState({})
  const draggingRef = useRef(null)

  // Check completion whenever matches changes
  useEffect(() => {
    if (pairs.length === 0) return
    const allDone = pairs.every((_, i) => matches[i] !== undefined)
    if (allDone) {
      const answer = pairs.map((p, i) => ({ left: p.left, right: matches[i] }))
      onComplete(answer)
    }
  }, [matches]) // eslint-disable-line

  // Correct answer lookup after submit
  const correctMap = {}
  if (submitted && Array.isArray(correctAnswer)) {
    correctAnswer.forEach(p => { correctMap[p.left] = p.right })
  }

  const handleDragStart = (e, item) => {
    draggingRef.current = item
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, leftIndex) => {
    e.preventDefault()
    const draggedItem = draggingRef.current
    if (!draggedItem) return
    draggingRef.current = null

    const leftText = pairs[leftIndex].left
    const isCorrectMatch = pairs[leftIndex].right === draggedItem.text

    if (!isCorrectMatch) {
      // Shake the slot
      setShaking(prev => ({ ...prev, [leftIndex]: true }))
      setTimeout(() => setShaking(prev => { const n = { ...prev }; delete n[leftIndex]; return n }), 500)
      return
    }

    setMatches(prev => ({ ...prev, [leftIndex]: draggedItem.text }))
    // Remove from rightItems pool
    setRightItems(prev => prev.filter(r => r.id !== draggedItem.id))
  }

  const handleDropRight = (e) => {
    // Allow dropping back to the right pool (unmatching)
    e.preventDefault()
  }

  // Also support touch-like click-to-match fallback
  const [selectedLeft, setSelectedLeft] = useState(null)
  const [selectedRight, setSelectedRight] = useState(null)

  useEffect(() => {
    if (selectedLeft !== null && selectedRight !== null) {
      const leftText = pairs[selectedLeft].left
      const isCorrectMatch = pairs[selectedLeft].right === selectedRight.text
      if (isCorrectMatch) {
        setMatches(prev => ({ ...prev, [selectedLeft]: selectedRight.text }))
        setRightItems(prev => prev.filter(r => r.id !== selectedRight.id))
      } else {
        setShaking(prev => ({ ...prev, [selectedLeft]: true }))
        setTimeout(() => setShaking(prev => { const n = { ...prev }; delete n[selectedLeft]; return n }), 500)
      }
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }, [selectedLeft, selectedRight]) // eslint-disable-line

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Left column: items with drop zones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '1 1 200px', minWidth: '160px' }}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', fontFamily: '"Poppins", sans-serif' }}>
          Items
        </p>
        {pairs.map((pair, i) => {
          const matchedRight = matches[i]
          const isMatchedCorrect = submitted && correctMap[pair.left] === matchedRight
          const isMatchedWrong = submitted && matchedRight && correctMap[pair.left] !== matchedRight
          const isShaking = shaking[i]
          const isLeftSelected = selectedLeft === i

          return (
            <div
              key={i}
              className={isShaking ? 'animate-shake' : ''}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              {/* Left item label */}
              <div
                onClick={() => !submitted && !matchedRight && setSelectedLeft(isLeftSelected ? null : i)}
                style={{
                  flex: '0 0 auto',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: isLeftSelected ? 'rgba(255,107,0,0.1)' : 'rgba(255,107,0,0.06)',
                  border: isLeftSelected ? '2px solid #FF6B00' : '2px solid rgba(255,107,0,0.2)',
                  fontSize: '13px',
                  fontFamily: '"Noto Sans", sans-serif',
                  fontWeight: '600',
                  color: '#2D2D2D',
                  cursor: submitted ? 'default' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                {pair.left}
              </div>

              {/* Arrow */}
              <span style={{ color: '#D1D5DB', fontSize: '16px', flexShrink: 0 }}>→</span>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={(e) => !submitted && handleDrop(e, i)}
                style={{
                  flex: 1,
                  minHeight: '44px',
                  minWidth: '100px',
                  borderRadius: '8px',
                  border: matchedRight
                    ? submitted
                      ? isMatchedCorrect ? '2px solid #22C55E' : '2px solid #EF4444'
                      : '2px solid #22C55E'
                    : isLeftSelected ? '2px dashed #FF6B00' : '2px dashed #D1D5DB',
                  background: matchedRight
                    ? submitted
                      ? isMatchedCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)'
                      : 'rgba(34,197,94,0.08)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontFamily: '"Noto Sans", sans-serif',
                  color: matchedRight
                    ? submitted
                      ? isMatchedCorrect ? '#16A34A' : '#DC2626'
                      : '#16A34A'
                    : '#9CA3AF',
                  transition: 'all 0.2s',
                }}
              >
                {matchedRight || (
                  <span style={{ fontSize: '12px' }}>Drop here</span>
                )}
                {submitted && isMatchedWrong && (
                  <span style={{ marginLeft: '6px', color: '#16A34A', fontSize: '11px' }}>
                    → {correctMap[pair.left]}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Right column: draggable answer chips */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDropRight}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: '0 0 auto', minWidth: '140px' }}
      >
        <p style={{ fontSize: '11px', fontWeight: '600', color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px', fontFamily: '"Poppins", sans-serif' }}>
          Answers
        </p>
        {rightItems.map((item) => {
          const isRightSelected = selectedRight?.id === item.id
          return (
            <div
              key={item.id}
              draggable={!submitted}
              onDragStart={(e) => !submitted && handleDragStart(e, item)}
              onClick={() => !submitted && setSelectedRight(isRightSelected ? null : item)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: isRightSelected ? '2px solid #FF6B00' : '2px solid #E5E5E5',
                background: isRightSelected ? 'rgba(255,107,0,0.07)' : '#FFFFFF',
                fontSize: '13px',
                fontFamily: '"Noto Sans", sans-serif',
                color: '#2D2D2D',
                cursor: submitted ? 'default' : 'grab',
                userSelect: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!submitted) e.currentTarget.style.borderColor = '#FF6B00' }}
              onMouseLeave={e => { if (!submitted && !isRightSelected) e.currentTarget.style.borderColor = '#E5E5E5' }}
            >
              ⠿ {item.text}
            </div>
          )
        })}
        {rightItems.length === 0 && !submitted && (
          <p style={{ fontSize: '12px', color: '#22C55E', fontFamily: '"Noto Sans", sans-serif', fontWeight: '600' }}>
            All matched! ✓
          </p>
        )}
      </div>

      {/* Instructions */}
      {!submitted && rightItems.length > 0 && (
        <p style={{ width: '100%', textAlign: 'center', fontSize: '12px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif', margin: 0 }}>
          Drag answers to the matching slots, or tap an item then tap an answer
        </p>
      )}
    </div>
  )
}
