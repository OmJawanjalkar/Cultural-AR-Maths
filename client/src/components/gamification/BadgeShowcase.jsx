import { useState } from 'react'
import { BADGES, BADGE_CATEGORIES, getBadgesByCategory } from '../../data/badges'

/**
 * BadgeShowcase — displays all 18 badges grouped by category.
 * Earned: full color, gold border, glow effect.
 * Unearned: greyscale with lock icon and hover criteria text.
 *
 * Props:
 *   earnedBadgeIds {array} – list of earned badge id strings, e.g. ['on_fire', 'quiz_champion']
 *                            OR array of badge objects with .id field
 */
export default function BadgeShowcase({ earnedBadgeIds = [] }) {
  const [hoveredId, setHoveredId] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  // Normalise: accept string ids or objects with .id
  const earnedSet = new Set(
    earnedBadgeIds.map(b => (typeof b === 'string' ? b : b?.id)).filter(Boolean)
  )

  const categories = ['all', 'module', 'achievement', 'special']

  const visibleBadges =
    activeCategory === 'all'
      ? BADGES
      : getBadgesByCategory(activeCategory)

  const earnedCount = BADGES.filter(b => earnedSet.has(b.id)).length

  return (
    <div style={{ fontFamily: '"Noto Sans", sans-serif' }}>
      {/* ── Header stats ─────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <p
            style={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: '700',
              fontSize: '16px',
              color: '#2D2D2D',
              margin: '0 0 2px',
            }}
          >
            Badges
          </p>
          <p style={{ fontSize: '12px', color: '#6B6B6B', margin: 0 }}>
            {earnedCount} / {BADGES.length} earned
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ flex: '0 0 120px' }}>
          <div style={{ height: '6px', background: '#F0EDE8', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${(earnedCount / BADGES.length) * 100}%`,
                background: 'linear-gradient(90deg, #D4A017, #FF6B00)',
                borderRadius: '99px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <p style={{ fontSize: '10px', color: '#9CA3AF', margin: '3px 0 0', textAlign: 'right' }}>
            {Math.round((earnedCount / BADGES.length) * 100)}% complete
          </p>
        </div>
      </div>

      {/* ── Category tabs ─────────────────────────── */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 14px',
              borderRadius: '99px',
              border: `1.5px solid ${activeCategory === cat ? '#FF6B00' : '#E5E5E5'}`,
              background: activeCategory === cat ? 'rgba(255,107,0,0.08)' : 'transparent',
              color: activeCategory === cat ? '#FF6B00' : '#6B6B6B',
              fontSize: '12px',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: activeCategory === cat ? '700' : '500',
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {cat === 'all' ? '✨ All' : BADGE_CATEGORIES[cat]}
          </button>
        ))}
      </div>

      {/* ── Badge grid ───────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        {visibleBadges.map(badge => {
          const isEarned = earnedSet.has(badge.id)
          const isHovered = hoveredId === badge.id

          return (
            <div
              key={badge.id}
              onMouseEnter={() => setHoveredId(badge.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative',
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '18px 12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'default',
                transition: 'all 0.25s ease',
                // Earned: gold glow border
                border: isEarned
                  ? '2px solid rgba(212,160,23,0.6)'
                  : '2px solid #F0EDE8',
                boxShadow: isEarned
                  ? '0 4px 20px rgba(212,160,23,0.18), inset 0 0 0 1px rgba(212,160,23,0.1)'
                  : '0 2px 8px rgba(0,0,0,0.04)',
                filter: isEarned ? 'none' : 'grayscale(1)',
                opacity: isEarned ? 1 : badge.comingSoon ? 0.3 : 0.45,
                transform: isHovered && isEarned ? 'translateY(-4px)' : 'translateY(0)',
              }}
            >
              {/* Icon */}
              <div
                style={{
                  fontSize: '36px',
                  lineHeight: 1,
                  filter: isEarned ? 'drop-shadow(0 2px 8px rgba(212,160,23,0.4))' : 'none',
                }}
              >
                {badge.icon}
              </div>

              {/* Name */}
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: '600',
                  fontSize: '11px',
                  color: isEarned ? '#2D2D2D' : '#6B6B6B',
                  margin: 0,
                  lineHeight: '1.4',
                }}
              >
                {badge.name}
              </p>

              {/* "Coming soon" tag */}
              {badge.comingSoon && (
                <span
                  style={{
                    fontSize: '9px',
                    color: '#9CA3AF',
                    background: '#F0EDE8',
                    borderRadius: '99px',
                    padding: '2px 7px',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  Coming soon
                </span>
              )}

              {/* Lock icon for unearned (non-coming-soon) */}
              {!isEarned && !badge.comingSoon && (
                <span style={{ fontSize: '14px', lineHeight: 1 }}>🔒</span>
              )}

              {/* Earned checkmark */}
              {isEarned && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D4A017, #FF6B00)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    color: '#FFFFFF',
                    fontWeight: '700',
                  }}
                >
                  ✓
                </div>
              )}

              {/* Hover tooltip: criteria */}
              {isHovered && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1F2937',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '11px',
                    fontFamily: '"Noto Sans", sans-serif',
                    lineHeight: '1.5',
                    width: '180px',
                    zIndex: 50,
                    textAlign: 'left',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                  }}
                >
                  <p style={{ fontWeight: '700', margin: '0 0 4px', color: '#FCD34D' }}>{badge.name}</p>
                  {badge.description}
                  {/* Tooltip arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-5px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '6px solid #1F2937',
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
