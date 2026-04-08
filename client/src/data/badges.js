/**
 * All 18 badge definitions for the Cultural AR Maths gamification system.
 * Categories: 'module' (5), 'achievement' (8), 'special' (5)
 */

export const BADGE_CATEGORIES = {
  module: 'Module Badges',
  achievement: 'Achievement Badges',
  special: 'Special Badges',
}

export const BADGES = [
  // ── Module Badges (5) ─────────────────────────────────────────────────────
  {
    id: 'temple_architect',
    icon: '🕌',
    name: 'Temple Architect',
    description: 'Complete all 10 temple challenges',
    longDescription:
      'Master the geometry of Indian temple architecture by completing all 10 challenges in the Temple Architecture module.',
    category: 'module',
  },
  {
    id: 'rangoli_master',
    icon: '🌸',
    name: 'Rangoli Master',
    description: 'Score 100% on any rangoli quiz session',
    longDescription:
      'Achieve a perfect score in any Rangoli Symmetry quiz session — 10 out of 10 correct answers.',
    category: 'module',
  },
  {
    id: 'market_genius',
    icon: '🥬',
    name: 'Market Genius',
    description: 'Solve 50 marketplace problems',
    longDescription:
      'Develop mental math mastery by solving 50 problems in the Sabzi Mandi Arithmetic module.',
    category: 'module',
  },
  {
    id: 'shape_shifter',
    icon: '📐',
    name: 'Shape Shifter',
    description: 'Interact with all 10 shape types in Geometry Playground',
    longDescription:
      'Explore all 10 different 3D shape types available in the AR Geometry Playground module.',
    category: 'module',
  },
  {
    id: 'quiz_champion',
    icon: '🧠',
    name: 'Quiz Champion',
    description: 'Score 10/10 in any quiz session',
    longDescription:
      'Answer all 10 questions correctly without a single mistake in any quiz session.',
    category: 'module',
  },

  // ── Achievement Badges (8) ────────────────────────────────────────────────
  {
    id: 'on_fire',
    icon: '🔥',
    name: 'On Fire',
    description: 'Maintain a 7-day streak',
    longDescription:
      'Log in and answer at least one question every day for 7 consecutive days.',
    category: 'achievement',
  },
  {
    id: 'speed_demon',
    icon: '⚡',
    name: 'Speed Demon',
    description: 'Answer 5 questions correctly in under 10 seconds each',
    longDescription:
      'Demonstrate lightning-fast math reflexes — get 5 correct answers, each solved in under 10 seconds.',
    category: 'achievement',
  },
  {
    id: 'perfectionist',
    icon: '💯',
    name: 'Perfectionist',
    description: 'Get 10 consecutive correct answers',
    longDescription:
      'Answer 10 questions in a row without a single mistake across any number of sessions.',
    category: 'achievement',
  },
  {
    id: 'rising_star',
    icon: '📈',
    name: 'Rising Star',
    description: 'Improve accuracy by 20% in any topic within a week',
    longDescription:
      'Show consistent improvement — raise your accuracy by 20 percentage points in any topic within 7 days.',
    category: 'achievement',
  },
  {
    id: 'all_rounder',
    icon: '🌍',
    name: 'All-Rounder',
    description: 'Score above 70% in all 5 topics',
    longDescription:
      'Prove your versatility — achieve above 70% accuracy across all five learning modules.',
    category: 'achievement',
  },
  {
    id: 'sharpshooter',
    icon: '🎯',
    name: 'Sharpshooter',
    description: '90%+ accuracy across 50 questions',
    longDescription:
      'Maintain exceptional precision — answer at least 90% of your first 50 cumulative questions correctly.',
    category: 'achievement',
  },
  {
    id: 'summit',
    icon: '🏔️',
    name: 'Summit',
    description: 'Reach difficulty level 5 in any topic',
    longDescription:
      'Climb to the highest difficulty tier in any topic through consistent correct answers.',
    category: 'achievement',
  },
  {
    id: 'guru_badge',
    icon: '👑',
    name: 'Guru',
    description: 'Earn 5000+ total karma',
    longDescription:
      'Accumulate 5000 or more karma points through dedicated learning and excellence.',
    category: 'achievement',
  },

  // ── Special Badges (5) ────────────────────────────────────────────────────
  {
    id: 'early_bird',
    icon: '🌅',
    name: 'Early Bird',
    description: 'Complete a quiz session before 8 AM',
    longDescription:
      'Start your day with math — complete a full 10-question quiz session before 8:00 AM.',
    category: 'special',
  },
  {
    id: 'night_owl',
    icon: '🦉',
    name: 'Night Owl',
    description: 'Complete a quiz session after 10 PM',
    longDescription:
      'Burn the midnight oil — complete a full quiz session after 10:00 PM.',
    category: 'special',
  },
  {
    id: 'helpful',
    icon: '🤝',
    name: 'Helpful',
    description: 'Help a classmate (coming soon)',
    longDescription:
      'A future badge for students who help their classmates understand difficult concepts.',
    category: 'special',
    comingSoon: true,
  },
  {
    id: 'curious',
    icon: '📖',
    name: 'Curious',
    description: 'Read all cultural context notes in any module',
    longDescription:
      'Expand your cultural knowledge — read every cultural context note in any single module.',
    category: 'special',
  },
  {
    id: 'artist',
    icon: '🎨',
    name: 'Artist',
    description: 'Create 10 rangoli patterns in the Symmetry Lab',
    longDescription:
      'Express your creativity — design and save 10 original rangoli patterns in the Symmetry Lab.',
    category: 'special',
  },
]

export function getBadgeById(id) {
  return BADGES.find(b => b.id === id) || null
}

export function getBadgesByCategory(category) {
  return BADGES.filter(b => b.category === category)
}
