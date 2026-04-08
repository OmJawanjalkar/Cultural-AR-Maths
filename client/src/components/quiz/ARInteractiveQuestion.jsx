import { useState } from 'react'
import MCQQuestion from './MCQQuestion'

/**
 * ARInteractiveQuestion — an AR-prompted question followed by MCQ/numeric answer.
 * Shows an AR scene prompt, a "I've explored it" button, then reveals the question.
 *
 * question fields:
 *   question_text   {string}  – the actual math/science question
 *   ar_prompt       {string}  – instruction for what to do in AR (optional)
 *   ar_object       {string}  – which 3D model to display (optional)
 *   options         {array}   – MCQ options
 *   correct_answer  {string}
 *
 * Props:
 *   question        {object}
 *   selectedAnswer  {string}
 *   onSelect        {function}
 *   submitted       {boolean}
 *   isCorrect       {boolean}
 *   correctAnswer   {string}
 */
export default function ARInteractiveQuestion({
  question,
  selectedAnswer,
  onSelect,
  submitted,
  isCorrect,
  correctAnswer,
}) {
  const [arExplored, setArExplored] = useState(false)
  const arPrompt = question?.ar_prompt || 'Explore the 3D model in augmented reality'
  const arObject = question?.ar_object || '3d-shape'

  // Shape icon map for visual representation
  const SHAPE_ICONS = {
    cone: '🔺',
    sphere: '🔵',
    cube: '🟦',
    cylinder: '🛢️',
    pyramid: '⬆️',
    prism: '🔷',
    default: '📐',
  }
  const icon = SHAPE_ICONS[arObject?.toLowerCase()] || SHAPE_ICONS.default

  if (!arExplored) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        {/* AR Scene Simulation Panel */}
        <div
          style={{
            width: '100%',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            padding: '32px 24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          {/* Animated AR grid background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,107,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.08) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }}
          />

          {/* Floating 3D object icon */}
          <div
            className="animate-spin-slow"
            style={{
              fontSize: '64px',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 16px rgba(255,107,0,0.6))',
            }}
          >
            {icon}
          </div>

          <p
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '600',
              fontSize: '14px',
              margin: 0,
              zIndex: 1,
            }}
          >
            {arPrompt}
          </p>

          {/* AR badge */}
          <span
            style={{
              background: 'rgba(255,107,0,0.25)',
              border: '1px solid rgba(255,107,0,0.5)',
              color: '#FF8C3A',
              borderRadius: '99px',
              padding: '3px 10px',
              fontSize: '11px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              letterSpacing: '0.06em',
              zIndex: 1,
            }}
          >
            AR INTERACTIVE
          </span>
        </div>

        {/* Instructions */}
        <div
          style={{
            background: 'rgba(255,107,0,0.05)',
            border: '1px solid rgba(255,107,0,0.15)',
            borderRadius: '10px',
            padding: '14px 16px',
            width: '100%',
            fontSize: '13px',
            fontFamily: '"Noto Sans", sans-serif',
            color: '#6B6B6B',
            lineHeight: '1.6',
          }}
        >
          📱 <strong>How to interact:</strong> Point your camera at a flat surface. The 3D model will appear.
          Rotate it by swiping, zoom with pinch. Once you've explored it, tap the button below to answer the question.
        </div>

        <button
          onClick={() => setArExplored(true)}
          style={{
            padding: '14px 32px',
            background: '#FF6B00',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'filter 0.15s',
            boxShadow: '0 4px 16px rgba(255,107,0,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          ✅ I've explored it — Show Question
        </button>
      </div>
    )
  }

  // After AR exploration — render the MCQ answer
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Reminder of what they did */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(34,197,94,0.07)',
          border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: '"Noto Sans", sans-serif',
          color: '#16A34A',
        }}
      >
        <span>✅</span>
        <span>AR exploration complete — now answer based on what you observed</span>
      </div>

      <MCQQuestion
        question={question}
        selectedAnswer={selectedAnswer}
        onSelect={onSelect}
        submitted={submitted}
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
      />
    </div>
  )
}
