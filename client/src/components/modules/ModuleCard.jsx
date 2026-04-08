import { useState } from 'react'
import { Lock, Layers, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * ModuleCard
 *
 * module fields used here:
 *   id          {string}  – frontend module id
 *   icon        {string}  – emoji
 *   title       {string}
 *   description {string}
 *   color       {string}  – accent hex
 *   progress    {number}  – 0-100
 *   isLocked    {boolean}
 *   arRoute     {string}  – e.g. '/ar/temple'. When present, shows "Launch AR" button.
 *   quizRoute   {string}  – explicit quiz path. Falls back to '/quiz/' + id.
 *   categories  {array}   – [{label, icon, route}]. When present, "Launch" reveals
 *                           an inline category picker instead of navigating directly.
 */
export default function ModuleCard({ module }) {
  const navigate = useNavigate()
  const [pickerOpen, setPickerOpen] = useState(false)

  const {
    id,
    icon = '📖',
    title = 'Module',
    description = '',
    color = '#FF6B00',
    progress = 0,
    isLocked = false,
    arRoute = null,
    quizRoute = null,
    categories = null,
  } = module || {}

  const resolvedQuizRoute = quizRoute || '/quiz/' + id

  const handleLaunchAR = (e) => {
    e.stopPropagation()
    if (!isLocked && arRoute) navigate(arRoute)
  }

  const handleStartQuiz = (e) => {
    e.stopPropagation()
    if (isLocked) return
    if (categories) {
      setPickerOpen(v => !v)
    } else {
      navigate(resolvedQuizRoute)
    }
  }

  const handleCategoryPick = (e, route) => {
    e.stopPropagation()
    navigate(route)
  }

  // ── Shared button base style ─────────────────────────────────────────────
  const btnBase = {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: '"Poppins", sans-serif',
    fontWeight: '600',
    cursor: isLocked ? 'not-allowed' : 'pointer',
    opacity: isLocked ? 0.55 : 1,
    transition: 'all 0.2s ease',
    border: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    userSelect: 'none',
  }

  const arBtnStyle = {
    ...btnBase,
    background: color,
    color: '#FFFFFF',
  }

  const quizBtnStyle = {
    ...btnBase,
    background: 'transparent',
    color: color,
    border: `2px solid ${color}`,
  }

  // Single-button case (no AR route): quiz button goes full-width
  const singleBtnStyle = {
    ...quizBtnStyle,
    flex: 'none',
    width: '100%',
  }

  return (
    <div
      className="card-hover"
      style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(255,107,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        opacity: isLocked ? 0.85 : 1,
        cursor: isLocked ? 'default' : 'default',
      }}
    >
      {/* ── Module icon ──────────────────────────── */}
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* ── Title + description ──────────────────── */}
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '15px',
          color: '#2D2D2D',
          margin: '0 0 6px',
          lineHeight: '1.3',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: '"Noto Sans", sans-serif',
          fontSize: '13px',
          color: '#6B6B6B',
          margin: 0,
          lineHeight: '1.5',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {description}
        </p>
      </div>

      {/* ── Progress bar ─────────────────────────── */}
      <div>
        <div style={{
          height: '6px',
          background: '#F0EDE8',
          borderRadius: '3px',
          overflow: 'hidden',
          marginBottom: '6px',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, progress))}%`,
            background: color,
            borderRadius: '3px',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <span style={{
          fontSize: '12px',
          color: '#6B6B6B',
          fontFamily: '"Noto Sans", sans-serif',
        }}>
          {Math.round(progress)}% Complete
        </span>
      </div>

      {/* ── Action buttons ───────────────────────── */}
      {arRoute ? (
        /* AR module: two equal-width buttons side by side */
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={arBtnStyle}
            disabled={isLocked}
            onClick={handleLaunchAR}
            onMouseEnter={e => { if (!isLocked) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
          >
            <Layers size={14} />
            Launch AR
          </button>

          <button
            style={quizBtnStyle}
            disabled={isLocked}
            onClick={handleStartQuiz}
            onMouseEnter={e => {
              if (!isLocked) {
                e.currentTarget.style.background = color
                e.currentTarget.style.color = '#FFFFFF'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = color
            }}
          >
            <BookOpen size={14} />
            Start Quiz
          </button>
        </div>
      ) : (
        /* Quick Quiz / non-AR module: single full-width button */
        <button
          style={singleBtnStyle}
          disabled={isLocked}
          onClick={handleStartQuiz}
          onMouseEnter={e => {
            if (!isLocked) {
              e.currentTarget.style.background = color
              e.currentTarget.style.color = '#FFFFFF'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = color
          }}
        >
          <BookOpen size={14} />
          {categories ? (pickerOpen ? 'Close ✕' : 'Launch Quiz') : 'Start Quiz'}
        </button>
      )}

      {/* ── Category picker (Quick Quiz inline panel) ── */}
      {categories && pickerOpen && (
        <div
          className="animate-slide-down"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '14px',
            background: '#FFF8E7',
            borderRadius: '10px',
            border: `1px solid ${color}28`,
            marginTop: '-4px',
          }}
        >
          <p style={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: '600',
            fontSize: '11px',
            color: '#6B6B6B',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 6px',
          }}>
            Choose a category
          </p>

          {categories.map(cat => (
            <button
              key={cat.route}
              onClick={(e) => handleCategoryPick(e, cat.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: `1.5px solid ${color}30`,
                background: '#FFFFFF',
                cursor: 'pointer',
                fontFamily: '"Poppins", sans-serif',
                fontWeight: '500',
                fontSize: '13px',
                color: '#2D2D2D',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = color
                e.currentTarget.style.color = '#FFFFFF'
                e.currentTarget.style.borderColor = color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#FFFFFF'
                e.currentTarget.style.color = '#2D2D2D'
                e.currentTarget.style.borderColor = `${color}30`
              }}
            >
              <span style={{ fontSize: '16px', lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.label}</span>
              <span style={{ fontSize: '12px', opacity: 0.45 }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Locked overlay ───────────────────────── */}
      {isLocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backdropFilter: 'blur(1px)',
        }}>
          <Lock size={28} color="#6B6B6B" />
          <p style={{
            fontSize: '13px',
            color: '#6B6B6B',
            fontFamily: '"Noto Sans", sans-serif',
            fontWeight: '600',
            margin: 0,
            textAlign: 'center',
            padding: '0 16px',
          }}>
            Complete previous module
          </p>
        </div>
      )}
    </div>
  )
}
