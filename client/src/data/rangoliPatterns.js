/**
 * rangoliPatterns.js
 * Six pre-loaded cultural patterns for the Rangoli & Kolam Symmetry Lab.
 * Coordinates are in the 12×12 dot grid: [col, row] each 0..12
 * Each path is a sequence of [col, row] pairs forming a connected stroke.
 */

export const RANGOLI_PATTERNS = [
  {
    id: 'tamil_kolam',
    name: 'Tamil Pulli Kolam',
    region: 'Tamil Nadu',
    symmetryType: 'D4 — 4-fold rotational + 4 reflection axes',
    rotationOrder: 4,
    reflectionAxes: ['vertical', 'horizontal', 'diagonal-/', 'diagonal-\\'],
    colors: ['#FFFFFF'],
    description:
      'Traditional dot-and-loop kolam drawn around dots (pulli). Lines weave around dots without crossing them.',
    mathFact:
      'This pattern has D4 symmetry (dihedral group of order 8): 4 rotations × 2 reflections.',
    paths: [
      // Outer diamond frame
      [[6,0],[10,4],[6,8],[2,4],[6,0]],
      // Inner rotated square
      [[6,2],[8,4],[6,6],[4,4],[6,2]],
      // Center cross
      [[6,3],[6,5]],
      [[5,4],[7,4]],
      // Corner loops (simplified)
      [[4,2],[3,3],[4,4]],
      [[8,2],[9,3],[8,4]],
      [[4,6],[3,5],[4,4]],
      [[8,6],[9,5],[8,4]],
    ],
  },

  {
    id: 'maharashtrian_rangoli',
    name: 'Maharashtrian Rangoli',
    region: 'Maharashtra',
    symmetryType: 'D6 — 6-fold rotational + 6 reflection axes',
    rotationOrder: 6,
    reflectionAxes: ['0°', '30°', '60°', '90°', '120°', '150°'],
    colors: ['#FF6B35', '#FFD700', '#FF1493', '#00CED1', '#7FFF00', '#FF8C00'],
    description:
      'Colourful geometric rangoli with concentric hexagonal shapes and floral motifs.',
    mathFact:
      'The 6-fold symmetry means rotating by 60° maps the pattern onto itself.',
    paths: [
      // Outer hexagon
      [[6,0],[9,2],[9,6],[6,8],[3,6],[3,2],[6,0]],
      // Inner hexagon
      [[6,2],[8,3],[8,5],[6,6],[4,5],[4,3],[6,2]],
      // Six spokes
      [[6,0],[6,2]],
      [[9,2],[8,3]],
      [[9,6],[8,5]],
      [[6,8],[6,6]],
      [[3,6],[4,5]],
      [[3,2],[4,3]],
      // Center dot ring
      [[6,3],[7,4],[6,5],[5,4],[6,3]],
    ],
  },

  {
    id: 'rajasthani_mandana',
    name: 'Rajasthani Mandana',
    region: 'Rajasthan',
    symmetryType: 'D4 — 4-fold rotational symmetry',
    rotationOrder: 4,
    reflectionAxes: ['vertical', 'horizontal'],
    colors: ['#DC143C', '#FFD700'],
    description:
      'Floor art made with red clay and white lime. Features bold triangles, chevrons, and stepped patterns.',
    mathFact:
      'The repeated triangular motif demonstrates tessellation with 90° rotational symmetry.',
    paths: [
      // Large outer square
      [[2,2],[10,2],[10,10],[2,10],[2,2]],
      // Diagonal cross
      [[2,2],[10,10]],
      [[10,2],[2,10]],
      // Inner stepped diamond
      [[6,1],[9,4],[6,7],[3,4],[6,1]],
      // Center motif
      [[5,5],[6,4],[7,5],[6,6],[5,5]],
      // Corner triangles
      [[2,2],[4,2],[2,4]],
      [[10,2],[8,2],[10,4]],
      [[2,10],[4,10],[2,8]],
      [[10,10],[8,10],[10,8]],
    ],
  },

  {
    id: 'bengali_alpona',
    name: 'Bengali Alpona',
    region: 'West Bengal',
    symmetryType: 'D2 — bilateral + vertical/horizontal symmetry',
    rotationOrder: 2,
    reflectionAxes: ['vertical', 'horizontal'],
    colors: ['#FFFFFF', '#FFD700'],
    description:
      'Rice-paste patterns drawn for auspicious occasions. Features fish, conch shells, and floral motifs.',
    mathFact:
      'Alpona demonstrates bilateral (D2) symmetry — reflection about two perpendicular axes.',
    paths: [
      // Outer lotus petal ring
      [[6,0],[8,2],[10,6],[8,10],[6,12],[4,10],[2,6],[4,2],[6,0]],
      // Inner circle
      [[6,3],[8,4],[9,6],[8,8],[6,9],[4,8],[3,6],[4,4],[6,3]],
      // Fish motif (right)
      [[8,5],[10,6],[8,7],[9,6]],
      // Fish motif (left, mirrored)
      [[4,5],[2,6],[4,7],[3,6]],
      // Conch shape (top)
      [[5,2],[6,1],[7,2],[6,4]],
      // Conch shape (bottom)
      [[5,10],[6,11],[7,10],[6,8]],
      // Center dot
      [[5,5],[7,5],[7,7],[5,7],[5,5]],
    ],
  },

  {
    id: 'star_pattern',
    name: 'Six-Pointed Star (Shatkoṇa)',
    region: 'Pan-Indian',
    symmetryType: 'D6 — 6-fold rotational + 6 reflection axes',
    rotationOrder: 6,
    reflectionAxes: ['0°', '30°', '60°', '90°', '120°', '150°'],
    colors: ['#FFD700', '#FF6B35'],
    description:
      'Two overlapping equilateral triangles forming a Star of David / Shatkoṇa. Found across Indian temple art.',
    mathFact:
      'The star is formed by two equilateral triangles — both have 3-fold symmetry, but together they form 6-fold (D6).',
    paths: [
      // Upward triangle
      [[6,0],[10,7],[2,7],[6,0]],
      // Downward triangle
      [[6,12],[2,5],[10,5],[6,12]],
      // Inner hexagon (intersection)
      [[6,3],[8,5],[8,7],[6,9],[4,7],[4,5],[6,3]],
    ],
  },

  {
    id: 'lotus_mandala',
    name: 'Lotus Mandala',
    region: 'All India — sacred geometry',
    symmetryType: 'D8 — 8-fold rotational + 8 reflection axes',
    rotationOrder: 8,
    reflectionAxes: ['0°', '22.5°', '45°', '67.5°', '90°', '112.5°', '135°', '157.5°'],
    colors: ['#FF1493', '#FFD700', '#FF6B35', '#00CED1'],
    description:
      'Sacred lotus mandala with 8 petals radiating from a central circle. Used in temple ceilings and yantras.',
    mathFact:
      'The 8-fold rotational symmetry means the pattern looks identical after rotating 45°. The group is D8 (dihedral of order 16).',
    paths: [
      // Outer ring
      [[6,0],[8,1],[10,2],[11,4],[12,6],[11,8],[10,10],[8,11],[6,12],
       [4,11],[2,10],[1,8],[0,6],[1,4],[2,2],[4,1],[6,0]],
      // 8 large petals (simplified as 4 diamonds)
      [[6,0],[9,3],[6,6],[3,3],[6,0]],
      [[6,6],[9,9],[6,12],[3,9],[6,6]],
      [[0,6],[3,3],[6,6],[3,9],[0,6]],
      [[6,6],[9,3],[12,6],[9,9],[6,6]],
      // Inner circle
      [[6,4],[7,5],[8,6],[7,7],[6,8],[5,7],[4,6],[5,5],[6,4]],
      // Center dot
      [[5,6],[6,5],[7,6],[6,7],[5,6]],
    ],
  },
];

/** Quick lookup by id */
export const PATTERN_MAP = Object.fromEntries(
  RANGOLI_PATTERNS.map(p => [p.id, p])
);
