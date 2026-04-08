/**
 * rangoliChallenges.js
 * Ten progressive symmetry challenges for the Rangoli & Kolam Symmetry Lab.
 * Types:
 *   'draw'       — student draws freely with constraints
 *   'complete'   — student completes a half-pattern
 *   'mcq'        — multiple-choice question
 *   'coordinate' — coordinate geometry calculation
 *   'identify'   — tap the wrong element
 *   'create'     — create with specific constraints
 */

export const RANGOLI_CHALLENGES = [
  {
    id: 1,
    difficulty: 1,
    difficultyLabel: 'Beginner',
    type: 'draw',
    title: 'Single Line of Symmetry',
    question:
      'Draw any pattern that has EXACTLY 1 line of symmetry.\n' +
      'Hint: Think of a butterfly or a leaf shape.',
    hint: 'A vertical or horizontal line can divide your pattern into two mirror halves.',
    answer: null, // checked programmatically by symmetry detection
    checkType: 'symmetry_count',
    expectedSymmetryCount: 1,
    karma: 10,
    concept: 'Line of symmetry',
    explanation:
      'A shape has a line of symmetry when one half is the mirror image of the other. ' +
      'A leaf has exactly one such line — running down the centre vein.',
  },

  {
    id: 2,
    difficulty: 2,
    difficultyLabel: 'Easy',
    type: 'complete',
    title: 'Complete the Half-Rangoli',
    question:
      'The left half of a rangoli is shown. Complete the right half using VERTICAL line symmetry.',
    hint: 'Each dot on the left at position (x, y) should have a mirror dot at (12−x, y).',
    answer: null, // checked by comparing drawn points against computed mirror
    checkType: 'mirror_completion',
    axis: 'vertical',
    givenHalf: 'left',
    // Pre-drawn half (left side, x ≤ 6)
    givenPaths: [
      [[0,4],[2,2],[4,0],[6,2],[6,4]],
      [[2,4],[4,6],[6,6]],
      [[4,4],[4,8],[6,8]],
    ],
    karma: 15,
    concept: 'Vertical reflection symmetry',
    explanation:
      'Vertical symmetry: every point (x, y) maps to (W − x, y), where W is the canvas width.',
  },

  {
    id: 3,
    difficulty: 2,
    difficultyLabel: 'Easy',
    type: 'mcq',
    title: '4-Fold Rotation Angle',
    question:
      'This kolam has 4-fold rotational symmetry.\n' +
      'What is the minimum angle of rotation that maps it onto itself?',
    options: ['45°', '60°', '90°', '120°'],
    answer: '90°',
    answerIndex: 2,
    karma: 15,
    concept: 'Rotational symmetry',
    explanation:
      '4-fold symmetry means the pattern fits itself 4 times in 360°.\n' +
      'Minimum angle = 360° ÷ 4 = 90°.',
    steps: [
      'A pattern has N-fold rotational symmetry if rotating it by 360°/N looks identical.',
      'Here N = 4, so the angle = 360° ÷ 4 = 90°.',
    ],
  },

  {
    id: 4,
    difficulty: 2,
    difficultyLabel: 'Easy',
    type: 'identify',
    title: 'Find the Line of Symmetry',
    question:
      'The pattern below has one line of symmetry. Draw/tap to mark the axis.',
    hint: 'Look for the line that divides the pattern into two identical halves.',
    answer: 'vertical',
    checkType: 'axis_selection',
    patternId: 'maharashtrian_rangoli',
    karma: 15,
    concept: 'Identifying symmetry axes',
    explanation:
      'The line of symmetry is the vertical axis through the centre of the pattern.',
  },

  {
    id: 5,
    difficulty: 3,
    difficultyLabel: 'Medium',
    type: 'identify',
    title: 'Spot the Symmetry Error',
    question:
      'This pattern SHOULD have 4-fold rotational symmetry, but one element is wrong. Tap it.',
    hint: 'Rotate the pattern mentally by 90°. Which part does NOT match its rotated copy?',
    answer: null,  // runtime checks the tapped element against injected error
    checkType: 'error_tap',
    errorElementIndex: 2, // index of the deliberately broken element
    karma: 20,
    concept: 'Symmetry verification',
    explanation:
      'When a pattern claims N-fold symmetry, every section should look the same after rotating 360°/N.',
  },

  {
    id: 6,
    difficulty: 3,
    difficultyLabel: 'Medium',
    type: 'draw',
    title: 'Both-Axis Symmetry',
    question:
      'Create a pattern with BOTH vertical AND horizontal symmetry (D2 symmetry).',
    hint:
      'Use the reflection tool twice — once on each axis. Your drawing in one quadrant will fill all four.',
    answer: null,
    checkType: 'symmetry_axes',
    expectedAxes: ['vertical', 'horizontal'],
    karma: 25,
    concept: 'D2 dihedral symmetry',
    explanation:
      'D2 symmetry means a pattern is symmetric about both vertical and horizontal axes. ' +
      'A rectangle has this property — but a square additionally has diagonal symmetry.',
  },

  {
    id: 7,
    difficulty: 3,
    difficultyLabel: 'Medium',
    type: 'mcq',
    title: 'Order of Rotational Symmetry',
    question:
      'A regular hexagonal rangoli tile has how many fold rotational symmetry?',
    options: ['3', '4', '6', '8'],
    answer: '6',
    answerIndex: 2,
    karma: 20,
    concept: 'Rotational symmetry of regular polygons',
    explanation:
      'A regular n-gon has n-fold rotational symmetry.\n' +
      'A regular hexagon (6 sides) fits onto itself after rotating 360°/6 = 60°.\n' +
      'So it has 6-fold (order 6) rotational symmetry.',
    steps: [
      'Regular n-gon → n-fold rotational symmetry.',
      'Hexagon: n = 6, so 6-fold symmetry.',
      'Minimum angle = 360° ÷ 6 = 60°.',
    ],
  },

  {
    id: 8,
    difficulty: 3,
    difficultyLabel: 'Medium',
    type: 'coordinate',
    title: 'Reflect Across Y-Axis',
    question:
      'Reflect the point (3, 4) across the Y-axis.\nWhat are the new coordinates?',
    inputType: 'coordinate_pair',
    answer: { x: -3, y: 4 },
    answerDisplay: '(-3, 4)',
    karma: 25,
    concept: 'Coordinate reflection across Y-axis',
    explanation:
      'Reflection across the Y-axis: (x, y) → (−x, y).\n' +
      'The y-coordinate stays the same; the x-coordinate changes sign.\n' +
      '(3, 4) → (−3, 4)',
    steps: [
      'Rule: reflection across Y-axis sends (x, y) to (−x, y).',
      'Apply: (3, 4) → (−3, 4).',
      'Check: the x-distance from the Y-axis is 3 on both sides. ✓',
    ],
  },

  {
    id: 9,
    difficulty: 4,
    difficultyLabel: 'Hard',
    type: 'mcq',
    title: 'Tessellation Interior Angle',
    question:
      'A kolam tile is a regular hexagon that tessellates the plane.\n' +
      'What is the interior angle of each tile?',
    options: ['90°', '108°', '120°', '135°'],
    answer: '120°',
    answerIndex: 2,
    karma: 30,
    concept: 'Interior angles and tessellation',
    explanation:
      'Interior angle of a regular hexagon = (6 − 2) × 180° ÷ 6 = 720° ÷ 6 = 120°.\n' +
      'Three hexagons meet at each vertex: 3 × 120° = 360°, which is why they tile perfectly.',
    steps: [
      'Interior angle of regular n-gon = (n − 2) × 180° / n',
      'For hexagon (n = 6): (6 − 2) × 180° / 6 = 4 × 30° = 120°',
      'Tessellation check: angles at each vertex must sum to 360°.',
      '3 × 120° = 360° ✓',
    ],
  },

  {
    id: 10,
    difficulty: 5,
    difficultyLabel: 'Expert',
    type: 'create',
    title: '6-Fold Rangoli',
    question:
      'Create a rangoli with EXACTLY 6-fold rotational symmetry using at least 3 colours.\n' +
      'Use the Rotation tool with 6-fold setting and colour at least 3 segments differently.',
    hint:
      'Activate the Rotation tool → set order to 6. Draw one petal segment in one colour, then repeat with different colours.',
    answer: null,
    checkType: 'rotation_order_and_colors',
    expectedRotationOrder: 6,
    minColors: 3,
    karma: 50,
    concept: '6-fold rotational symmetry (D6)',
    explanation:
      'Your rangoli has 6-fold symmetry when rotating it by 60° maps the entire design onto itself.\n' +
      'This is the symmetry of a snowflake or a regular hexagon.',
  },
];

export const TOTAL_KARMA = RANGOLI_CHALLENGES.reduce((s, c) => s + c.karma, 0);

/** Look up a challenge by id */
export const CHALLENGE_MAP = Object.fromEntries(
  RANGOLI_CHALLENGES.map(c => [c.id, c])
);
