// 10 progressive measurement challenges for the Temple Architecture module
// Answers are mathematically correct; tolerance of ±2% is applied at runtime.

const π = Math.PI;

// Helpers ─────────────────────────────────────────────────────────────────────
function frustumVol(R, r, h) {
  return (π * h / 3) * (R * R + R * r + r * r);
}
function frustumLSA(R, r, h) {
  const l = Math.sqrt(h * h + (R - r) ** 2);
  return π * (R + r) * l;
}

// ─────────────────────────────────────────────────────────────────────────────
export const CHALLENGES = [
  {
    id: 1,
    difficulty: 1,
    difficultyLabel: 'Beginner',
    concept: 'Volume of a Cuboid',
    question:
      'The base platform (Adhisthana) is 12 m long, 12 m wide and 2 m tall.\nCalculate its volume.',
    partId: 'base',
    answer: 288,
    unit: 'm³',
    formula: 'V = l × w × h',
    hint: 'Multiply length × width × height.',
    steps: [
      { label: 'Formula',    text: 'V = l × w × h' },
      { label: 'Substitute', text: 'V = 12 × 12 × 2' },
      { label: 'Simplify',   text: 'V = 144 × 2' },
      { label: 'Answer',     text: 'V = 288 m³' },
    ],
    karma: 10,
  },
  {
    id: 2,
    difficulty: 2,
    difficultyLabel: 'Easy',
    concept: 'Volume of a Cylinder',
    question:
      'Each pillar (Stambha) is a cylinder with radius 0.4 m and height 6 m.\nWhat is the volume of one pillar? (Use π = 3.14159…)',
    partId: 'pillar_1',
    answer: parseFloat((π * 0.16 * 6).toFixed(4)),
    unit: 'm³',
    formula: 'V = πr²h',
    hint: 'Square the radius first, then multiply by π and height.',
    steps: [
      { label: 'Formula',      text: 'V = πr²h' },
      { label: 'Square r',     text: 'r² = (0.4)² = 0.16' },
      { label: 'Substitute',   text: 'V = π × 0.16 × 6' },
      { label: 'Multiply',     text: 'V = π × 0.96' },
      { label: 'Answer',       text: `V ≈ ${(π * 0.96).toFixed(4)} m³` },
    ],
    karma: 15,
  },
  {
    id: 3,
    difficulty: 2,
    difficultyLabel: 'Easy',
    concept: 'Scaling Volumes',
    question:
      'The Mandapa has 4 identical pillars, each with volume ≈ 3.016 m³.\nWhat is the TOTAL volume of all 4 pillars combined?',
    partId: 'pillar_1',
    answer: parseFloat((4 * π * 0.16 * 6).toFixed(4)),
    unit: 'm³',
    formula: 'Total V = 4 × V₁',
    hint: 'Multiply one pillar\'s volume by 4.',
    steps: [
      { label: 'One pillar',   text: `V₁ = π × 0.16 × 6 ≈ ${(π * 0.96).toFixed(3)} m³` },
      { label: 'Formula',      text: 'Total = 4 × V₁' },
      { label: 'Multiply',     text: `Total = 4 × ${(π * 0.96).toFixed(3)}` },
      { label: 'Answer',       text: `Total ≈ ${(4 * π * 0.96).toFixed(4)} m³` },
    ],
    karma: 15,
  },
  {
    id: 4,
    difficulty: 3,
    difficultyLabel: 'Medium',
    concept: 'Curved Surface Area of a Hemisphere',
    question:
      'The Kalasha crown is a hemisphere with radius 0.5 m.\nCalculate its curved surface area.',
    partId: 'kalasha',
    answer: parseFloat((2 * π * 0.25).toFixed(4)),
    unit: 'm²',
    formula: 'CSA = 2πr²',
    hint: 'Curved surface area of a hemisphere = 2πr² (the flat base is not included).',
    steps: [
      { label: 'Formula',    text: 'CSA = 2πr²' },
      { label: 'Square r',   text: 'r² = (0.5)² = 0.25' },
      { label: 'Substitute', text: 'CSA = 2 × π × 0.25' },
      { label: 'Answer',     text: `CSA = 0.5π ≈ ${(2 * π * 0.25).toFixed(4)} m²` },
    ],
    karma: 20,
  },
  {
    id: 5,
    difficulty: 3,
    difficultyLabel: 'Medium',
    concept: 'Volume of a Frustum',
    question:
      'Shikhara Tier 1 is a frustum with:\n  Bottom radius R = 4 m\n  Top radius r = 3.2 m\n  Height h = 3 m\nCalculate its volume.',
    partId: 'shikhara_tier_1',
    answer: parseFloat(frustumVol(4, 3.2, 3).toFixed(2)),
    unit: 'm³',
    formula: 'V = (πh/3)(R² + Rr + r²)',
    hint: 'Calculate R², R×r, and r² separately, then add them before multiplying by πh/3.',
    steps: [
      { label: 'Formula',      text: 'V = (πh/3)(R² + Rr + r²)' },
      { label: 'Substitute',   text: 'V = (π × 3/3)(4² + 4×3.2 + 3.2²)' },
      { label: 'Each term',    text: '4² = 16,   4×3.2 = 12.8,   3.2² = 10.24' },
      { label: 'Sum',          text: '16 + 12.8 + 10.24 = 39.04' },
      { label: 'Multiply',     text: 'V = π × 1 × 39.04 = π × 39.04' },
      { label: 'Answer',       text: `V ≈ ${frustumVol(4, 3.2, 3).toFixed(2)} m³` },
    ],
    karma: 25,
  },
  {
    id: 6,
    difficulty: 3,
    difficultyLabel: 'Medium',
    concept: 'Lateral Surface Area of a Frustum',
    question:
      'Calculate the lateral surface area of Shikhara Tier 1\n(R = 4 m, r = 3.2 m, h = 3 m).',
    partId: 'shikhara_tier_1',
    answer: parseFloat(frustumLSA(4, 3.2, 3).toFixed(2)),
    unit: 'm²',
    formula: 'LSA = π(R + r) × l,  l = √(h² + (R − r)²)',
    hint: 'First find slant height l = √(h² + (R−r)²), then use LSA = π(R+r)l.',
    steps: (() => {
      const R = 4, r = 3.2, h = 3;
      const l = Math.sqrt(h * h + (R - r) ** 2);
      return [
        { label: 'Slant height',  text: 'l = √(h² + (R − r)²)' },
        { label: 'Substitute',    text: `l = √(3² + (4 − 3.2)²) = √(9 + 0.64)` },
        { label: 'Calculate',     text: `l = √9.64 ≈ ${l.toFixed(4)} m` },
        { label: 'LSA formula',   text: 'LSA = π × (R + r) × l' },
        { label: 'Substitute',    text: `LSA = π × (4 + 3.2) × ${l.toFixed(4)}` },
        { label: 'Answer',        text: `LSA = π × 7.2 × ${l.toFixed(4)} ≈ ${frustumLSA(R, r, h).toFixed(2)} m²` },
      ];
    })(),
    karma: 25,
  },
  {
    id: 7,
    difficulty: 4,
    difficultyLabel: 'Hard',
    concept: 'Geometric Progressions',
    question:
      'The bottom diameters of the 4 Shikhara tiers are approximately:\n  8 m, 6.4 m, 5.12 m, 4.096 m\nWhat is the common ratio of this geometric progression?',
    partId: 'shikhara_tier_1',
    answer: 0.8,
    unit: '',
    formula: 'r = a₂ ÷ a₁',
    hint: 'Divide any term by the term before it.',
    steps: [
      { label: 'Sequence',     text: '8,  6.4,  5.12,  4.096, …' },
      { label: 'Ratio check',  text: 'r = 6.4 ÷ 8 = 0.8' },
      { label: 'Verify',       text: '5.12 ÷ 6.4 = 0.8  ✓' },
      { label: 'Verify again', text: '4.096 ÷ 5.12 = 0.8  ✓' },
      { label: 'Answer',       text: 'Common ratio r = 0.8' },
    ],
    karma: 30,
  },
  {
    id: 8,
    difficulty: 4,
    difficultyLabel: 'Hard',
    concept: 'Infinite Geometric Series',
    question:
      'If the Gopuram tier diameters continue as an infinite GP\n(first term a = 8 m, ratio r = 0.8), what is the sum of ALL tier diameters?',
    partId: 'shikhara_tier_1',
    answer: 40,
    unit: 'm',
    formula: 'S∞ = a ÷ (1 − r)',
    hint: 'The infinite GP sum formula S = a/(1−r) is valid when |r| < 1.',
    steps: [
      { label: 'Formula',    text: 'S∞ = a / (1 − r),  valid when |r| < 1' },
      { label: 'Given',      text: 'a = 8 (first term),  r = 0.8' },
      { label: 'Substitute', text: 'S∞ = 8 / (1 − 0.8)' },
      { label: 'Simplify',   text: 'S∞ = 8 / 0.2' },
      { label: 'Answer',     text: 'S∞ = 40 m' },
    ],
    karma: 35,
  },
  {
    id: 9,
    difficulty: 4,
    difficultyLabel: 'Hard',
    concept: 'Comparing Volumes',
    question:
      'Compare two temple crowns:\n  • Dome: hemisphere with r = 5 m\n  • Cone: r = 4 m, h = 9 m\nEnter the volume of the LARGER one.',
    partId: 'dome',
    answer: parseFloat(((2 / 3) * π * 125).toFixed(2)),
    unit: 'm³',
    formula: 'Hemisphere: V = (2/3)πr³   |   Cone: V = (1/3)πr²h',
    hint: 'Calculate both volumes separately using their formulas, then compare.',
    steps: (() => {
      const vDome = (2 / 3) * π * 125;
      const vCone = (1 / 3) * π * 144;
      return [
        { label: 'Dome volume', text: `V = (2/3)π(5)³ = (2/3)π × 125 ≈ ${vDome.toFixed(2)} m³` },
        { label: 'Cone volume', text: `V = (1/3)π(4)²(9) = (1/3)π × 144 ≈ ${vCone.toFixed(2)} m³` },
        { label: 'Compare',     text: `${vDome.toFixed(2)} m³  >  ${vCone.toFixed(2)} m³` },
        { label: 'Difference',  text: `Dome is larger by ${(vDome - vCone).toFixed(2)} m³` },
        { label: 'Answer',      text: `Dome (hemisphere) has greater volume: ${vDome.toFixed(2)} m³` },
      ];
    })(),
    karma: 35,
  },
  {
    id: 10,
    difficulty: 5,
    difficultyLabel: 'Expert',
    concept: 'Total Surface Area of a Cuboid',
    question:
      'Calculate the TOTAL surface area of the base platform (Adhisthana):\n  Length = 12 m,  Width = 12 m,  Height = 2 m',
    partId: 'base',
    answer: 2 * (12 * 12 + 12 * 2 + 12 * 2),
    unit: 'm²',
    formula: 'TSA = 2(lw + wh + lh)',
    hint: 'Find the area of each pair of opposite faces, sum them, and multiply by 2.',
    steps: [
      { label: 'Formula',    text: 'TSA = 2(lw + wh + lh)' },
      { label: 'Top/bottom', text: '2 × (12 × 12) = 2 × 144 = 288 m²' },
      { label: 'Front/back', text: '2 × (12 × 2) = 2 × 24 = 48 m²' },
      { label: 'Left/right', text: '2 × (12 × 2) = 2 × 24 = 48 m²' },
      { label: 'Sum',        text: '288 + 48 + 48 = 384 m²' },
      { label: 'Answer',     text: 'TSA = 384 m²' },
    ],
    karma: 50,
  },
];

export const TOTAL_KARMA = CHALLENGES.reduce((s, c) => s + c.karma, 0);
