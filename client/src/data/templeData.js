// Temple part definitions, dimensions, formulas, and cultural notes
// All dimensions in metres (1 unit = 1m in Three.js scene)

export const TEMPLE_PARTS = [
  {
    id: 'base',
    name: 'Base Platform',
    sanskrit: 'Adhisthana',
    shape: 'Rectangular Prism (Cuboid)',
    dimensions: { 'Length (l)': 12, 'Width (w)': 12, 'Height (h)': 2 },
    formula: 'V = l × w × h',
    volume: '288 m³',
    surfaceArea: '432 m²',
    culturalNote:
      'The Adhisthana (base/foundation) represents the earth element (Prithvi) and the grounding of sacred space. Its precise horizontal proportions follow the Vastu Shastra grid system — a Hindu science of spatial arrangement ensuring the temple is perfectly aligned with cardinal directions.',
    color: 0xD2B48C,
  },
  {
    id: 'mandapa',
    name: 'Main Hall',
    sanskrit: 'Mandapa',
    shape: 'Rectangular Prism (Cuboid)',
    dimensions: { 'Length (l)': 8, 'Width (w)': 8, 'Height (h)': 6 },
    formula: 'V = l × w × h',
    volume: '384 m³',
    surfaceArea: '320 m²',
    culturalNote:
      'The Mandapa is the pillared congregation hall where devotees gather before entering the sanctum. Its square plan (8 × 8 m) reflects the Vastu Purusha Mandala — the cosmic grid governing all Hindu temple proportions. The 6 m ceiling height allows mantras to resonate with sacred acoustics.',
    color: 0xCBA882,
  },
  {
    id: 'pillar_1',
    name: 'Pillar (NE Corner)',
    sanskrit: 'Stambha',
    shape: 'Cylinder',
    dimensions: { 'Radius (r)': 0.4, 'Height (h)': 6 },
    formula: 'V = πr²h',
    volume: '3.016 m³',
    surfaceArea: '28.15 m²',
    culturalNote:
      'The Stambha (pillar) symbolises the cosmic axis (axis mundi) connecting earth to heaven. In South Indian temples, each pillar is individually carved with divine figures, geometric patterns, and mythological scenes — transforming a structural element into a mathematical meditation on form.',
    color: 0xBF9B6A,
  },
  {
    id: 'pillar_2',
    name: 'Pillar (NW Corner)',
    sanskrit: 'Stambha',
    shape: 'Cylinder',
    dimensions: { 'Radius (r)': 0.4, 'Height (h)': 6 },
    formula: 'V = πr²h',
    volume: '3.016 m³',
    surfaceArea: '28.15 m²',
    culturalNote:
      'The four pillars correspond to the four cardinal directions (Chatur Dikpalas). Their circular cross-section was chosen over square for its deep symbolic resonance: a circle has no beginning and no end — representing the infinite, unchanging nature of the divine.',
    color: 0xBF9B6A,
  },
  {
    id: 'pillar_3',
    name: 'Pillar (SE Corner)',
    sanskrit: 'Stambha',
    shape: 'Cylinder',
    dimensions: { 'Radius (r)': 0.4, 'Height (h)': 6 },
    formula: 'V = πr²h',
    volume: '3.016 m³',
    surfaceArea: '28.15 m²',
    culturalNote:
      'The spacing of temple pillars follows precise mathematical ratios derived from ancient texts like the Manasara and Mayamata. The distance between pillars was calculated to carry structural loads while creating harmonious visual rhythms — early structural engineering.',
    color: 0xBF9B6A,
  },
  {
    id: 'pillar_4',
    name: 'Pillar (SW Corner)',
    sanskrit: 'Stambha',
    shape: 'Cylinder',
    dimensions: { 'Radius (r)': 0.4, 'Height (h)': 6 },
    formula: 'V = πr²h',
    volume: '3.016 m³',
    surfaceArea: '28.15 m²',
    culturalNote:
      'Cylindrical pillars maximise strength with minimal material — the circular cross-section distributes compressive forces evenly. Ancient Dravidian architects understood this before calculus existed, empirically discovering principles we now prove mathematically.',
    color: 0xBF9B6A,
  },
  {
    id: 'garbhagriha',
    name: 'Inner Sanctum',
    sanskrit: 'Garbhagriha',
    shape: 'Rectangular Prism (Cuboid)',
    dimensions: { 'Length (l)': 4, 'Width (w)': 4, 'Height (h)': 5 },
    formula: 'V = l × w × h',
    volume: '80 m³',
    surfaceArea: '128 m²',
    culturalNote:
      'The Garbhagriha (literally "womb-chamber") houses the primary deity. It is intentionally small, dark, and simple — a sacred cave representing the cosmic womb (Yoni) from which all creation emerges. Its precise square plan (4 × 4 m) symbolises the grounded, stable form of the manifest universe.',
    color: 0xC4956A,
  },
  {
    id: 'shikhara_tier_1',
    name: 'Tower — Tier 1',
    sanskrit: 'Vimana / Shikhara',
    shape: 'Frustum of a Cone',
    dimensions: { 'Bottom radius (R)': 4, 'Top radius (r)': 3.2, 'Height (h)': 3 },
    formula: 'V = (πh/3)(R² + Rr + r²)',
    volume: '122.64 m³',
    surfaceArea: '72.38 m²',
    culturalNote:
      'The Shikhara (tower) represents Mount Meru, the mythical cosmic mountain at the universe\'s centre in Hindu-Buddhist cosmology. Each tier is a smaller frustum of a cone, creating a soaring geometric progression that guides the eye — and the spirit — skyward.',
    color: 0xD4955A,
  },
  {
    id: 'shikhara_tier_2',
    name: 'Tower — Tier 2',
    sanskrit: 'Tala',
    shape: 'Frustum of a Cone',
    dimensions: { 'Bottom radius (R)': 3.2, 'Top radius (r)': 2.4, 'Height (h)': 2.5 },
    formula: 'V = (πh/3)(R² + Rr + r²)',
    volume: '64.14 m³',
    surfaceArea: '50.27 m²',
    culturalNote:
      'Each "Tala" (storey) of the Gopuram follows a strict geometric ratio. The diameters form a geometric progression — a mathematical pattern the ancient architects codified in the Agama Shastras, temple-building manuals over 2 000 years old.',
    color: 0xC4854A,
  },
  {
    id: 'shikhara_tier_3',
    name: 'Tower — Tier 3',
    sanskrit: 'Tala',
    shape: 'Frustum of a Cone',
    dimensions: { 'Bottom radius (R)': 2.4, 'Top radius (r)': 1.6, 'Height (h)': 2 },
    formula: 'V = (πh/3)(R² + Rr + r²)',
    volume: '33.51 m³',
    surfaceArea: '31.42 m²',
    culturalNote:
      'As you ascend the Gopuram, each tier gets narrower AND shorter, creating the illusion of infinite height. This is an architectural application of a convergent geometric series — the sum converges, giving the tower a mathematically defined "infinite" quality.',
    color: 0xB47540,
  },
  {
    id: 'shikhara_tier_4',
    name: 'Tower — Tier 4',
    sanskrit: 'Tala',
    shape: 'Frustum of a Cone',
    dimensions: { 'Bottom radius (R)': 1.6, 'Top radius (r)': 0.8, 'Height (h)': 1.5 },
    formula: 'V = (πh/3)(R² + Rr + r²)',
    volume: '13.19 m³',
    surfaceArea: '17.28 m²',
    culturalNote:
      'The final tier of the Gopuram maintains the same proportional relationship to tier 3 as tier 1 does to tier 2. This self-similar structure — recognised by mathematicians as fractal-like — was a hallmark of Indian classical art long before fractal geometry was formalised.',
    color: 0xA46530,
  },
  {
    id: 'kalasha',
    name: 'Crown Finial',
    sanskrit: 'Kalasha',
    shape: 'Hemisphere + Cylinder',
    dimensions: { 'Hemisphere radius': 0.5, 'Cylinder radius': 0.3, 'Cylinder height': 0.8 },
    formula: 'CSA = 2πr²',
    volume: '0.49 m³',
    surfaceArea: '1.571 m²',
    culturalNote:
      'The Kalasha (golden finial-pot) crowns the entire structure, representing the divine vessel of cosmic fullness (Purna Kumbha). Traditionally cast in pure gold or copper-gilt, it channels cosmic energy (Prana) into the temple. Its hemisphere symbolises the celestial dome of heaven.',
    color: 0xD4A017,
  },
  {
    id: 'dome',
    name: 'Dome',
    sanskrit: 'Shikhara (Nagara)',
    shape: 'Hemisphere',
    dimensions: { 'Radius (r)': 5 },
    formula: 'V = (2/3)πr³',
    volume: '261.80 m³',
    surfaceArea: '157.08 m²',
    culturalNote:
      'The North Indian Nagara-style dome is a pure hemisphere. Unlike the South Indian Gopuram\'s layered frustums, this single flowing curve represents the Brahmanda (cosmic egg) from which the universe was born. Mathematically, a hemisphere maximises enclosed volume relative to surface area — a principle independently discovered by multiple ancient civilisations.',
    color: 0xD2B48C,
  },
];

export const PART_BY_ID = Object.fromEntries(TEMPLE_PARTS.map(p => [p.id, p]));

// Layout positions for each part in Three.js scene (centred, 1 unit = 1m)
export const PART_POSITIONS = {
  base:            { x: 0,   y: 1,     z: 0  },
  mandapa:         { x: 0,   y: 5,     z: 2  },
  pillar_1:        { x: 3.5, y: 5,     z: 5.5},
  pillar_2:        { x:-3.5, y: 5,     z: 5.5},
  pillar_3:        { x: 3.5, y: 5,     z:-1.5},
  pillar_4:        { x:-3.5, y: 5,     z:-1.5},
  garbhagriha:     { x: 0,   y: 4.5,   z:-4  },
  shikhara_tier_1: { x: 0,   y: 8.5,   z:-4  },
  shikhara_tier_2: { x: 0,   y: 11.25, z:-4  },
  shikhara_tier_3: { x: 0,   y: 13.5,  z:-4  },
  shikhara_tier_4: { x: 0,   y: 15.25, z:-4  },
  kalasha:         { x: 0,   y: 16.4,  z:-4  },
  dome:            { x: 0,   y: 7,     z:-4  },
};

export const TEMPLE_STYLES = [
  {
    id: 'gopuram',
    name: 'South Indian Gopuram',
    region: 'Tamil Nadu · Kerala · Andhra',
    dominantShapes: ['Frustum of Cone', 'Cuboid', 'Cylinder'],
    totalHeight: '~17.3 m',
    description:
      'The Dravidian Gopuram is characterised by its pyramidal tower of stacked frustum tiers, each smaller than the one below. Famous examples: Meenakshi Amman Temple (Madurai), Brihadeeswara Temple (Thanjavur).',
    color: 0xD4955A,
  },
  {
    id: 'shikhara',
    name: 'North Indian Nagara',
    region: 'Rajasthan · Madhya Pradesh · Odisha',
    dominantShapes: ['Curvilinear Cone (Parabolic)', 'Cuboid'],
    totalHeight: '~14 m',
    description:
      'The Nagara Shikhara features a curvilinear tower with a characteristic "beehive" profile whose surface approximates a mathematical parabola. Famous examples: Khajuraho Group of Temples, Konark Sun Temple.',
    color: 0xC4956A,
  },
  {
    id: 'indo_islamic',
    name: 'Indo-Islamic Dome',
    region: 'Delhi · Agra · Hyderabad',
    dominantShapes: ['Hemisphere', 'Cylinder', 'Cuboid'],
    totalHeight: '~16 m',
    description:
      'The Indo-Islamic style uses a large hemispherical dome on a cylindrical drum. The hemisphere maximises enclosed volume relative to surface area — a mathematical optimisation independently discovered by multiple civilisations. Famous examples: Taj Mahal, Gol Gumbaz.',
    color: 0x8B9E7A,
  },
];
