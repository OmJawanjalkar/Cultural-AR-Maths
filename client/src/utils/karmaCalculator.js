/**
 * Karma point calculation logic for Cultural AR Maths.
 * Points awarded:
 *   Correct answer:        10 × difficulty_level
 *   Streak bonus:          +5 per consecutive correct answer
 *   Speed bonus:           +10 if answered in < 10 seconds
 *   Module completion:     +100 karma
 *   Daily login:           +20 karma
 */

export const LEVELS = [
  { min: 0,    max: 100,      name: 'Beginner',      emoji: '🌱', color: '#6B6B6B' },
  { min: 101,  max: 500,      name: 'Explorer',      emoji: '🔍', color: '#22C55E' },
  { min: 501,  max: 1500,     name: 'Scholar',       emoji: '📚', color: '#3B82F6' },
  { min: 1501, max: 3000,     name: 'Mathematician', emoji: '🧮', color: '#8B5CF6' },
  { min: 3001, max: 5000,     name: 'Master',        emoji: '🏆', color: '#D4A017' },
  { min: 5001, max: Infinity, name: 'Guru',          emoji: '🕉️', color: '#FF6B00' },
]

/**
 * Returns the level object for a given total karma amount.
 */
export function getLevel(totalKarma) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalKarma >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

/**
 * Returns the next level object (null if already at max).
 */
export function getNextLevel(totalKarma) {
  const current = getLevel(totalKarma)
  const idx = LEVELS.indexOf(current)
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null
}

/**
 * Returns 0–100 progress percentage within the current level.
 */
export function getLevelProgress(totalKarma) {
  const level = getLevel(totalKarma)
  if (level.max === Infinity) return 100
  const range = level.max - level.min
  const progress = totalKarma - level.min
  return Math.min(100, Math.round((progress / range) * 100))
}

/**
 * Calculate karma earned for a single answered question.
 *
 * @param {object} opts
 * @param {number}  opts.difficulty       - 1–5 difficulty level
 * @param {boolean} opts.isCorrect        - whether the answer was correct
 * @param {number}  opts.streak           - consecutive correct answers *before* this one
 * @param {number}  opts.timeTaken        - seconds taken for this question
 * @param {boolean} opts.isModuleComplete - true if this answer completed a module
 * @param {boolean} opts.isDailyLogin     - true for first login of the day
 * @returns {number} karma points earned
 */
export function calculateKarma({
  difficulty = 1,
  isCorrect = false,
  streak = 0,
  timeTaken = 99,
  isModuleComplete = false,
  isDailyLogin = false,
}) {
  if (!isCorrect) return 0

  let karma = 10 * Math.max(1, Math.min(5, difficulty)) // base: 10 × difficulty (clamped 1–5)
  if (streak > 0) karma += streak * 5                    // streak bonus: +5 per streak level
  if (timeTaken < 10) karma += 10                        // speed bonus: answered in < 10s
  if (isModuleComplete) karma += 100                     // module completion bonus
  if (isDailyLogin) karma += 20                          // daily login bonus

  return karma
}

/**
 * Returns a breakdown of karma components for display purposes.
 */
export function formatKarmaBreakdown({ difficulty = 1, streak = 0, timeTaken = 99 }) {
  const base = 10 * Math.max(1, Math.min(5, difficulty))
  const streakBonus = streak > 0 ? streak * 5 : 0
  const speedBonus = timeTaken < 10 ? 10 : 0
  const total = base + streakBonus + speedBonus
  return { base, streakBonus, speedBonus, total }
}
