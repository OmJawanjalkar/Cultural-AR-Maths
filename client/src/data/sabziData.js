/**
 * sabziData.js
 * Vegetable market data: vegetables, prices, weight options, and session utilities.
 */

// ─── Vegetables ───────────────────────────────────────────────────────────────
export const VEGETABLES = [
  {
    id: 'tomato',
    name: 'Tomatoes',
    hindiName: 'Tamatar',
    emoji: '🍅',
    basePrice: 40,        // ₹ per kg
    priceRange: [28, 60], // realistic daily fluctuation
    color: 0xCC2200,
    geometry: 'sphere',
    geometryParams: { radius: 0.12 },
    description: 'Fresh red tomatoes from Nashik',
    unit: 'kg',
  },
  {
    id: 'onion',
    name: 'Onions',
    hindiName: 'Pyaaz',
    emoji: '🧅',
    basePrice: 30,
    priceRange: [20, 80],
    color: 0x8B4513,
    geometry: 'sphere',
    geometryParams: { radius: 0.11 },
    description: 'Large onions from Pune',
    unit: 'kg',
  },
  {
    id: 'potato',
    name: 'Potatoes',
    hindiName: 'Aloo',
    emoji: '🥔',
    basePrice: 25,
    priceRange: [18, 40],
    color: 0xA0785A,
    geometry: 'sphere',
    geometryParams: { radius: 0.10 },
    description: 'Agra potatoes, good quality',
    unit: 'kg',
  },
  {
    id: 'chilli',
    name: 'Green Chillies',
    hindiName: 'Hari Mirchi',
    emoji: '🌶️',
    basePrice: 60,
    priceRange: [40, 120],
    color: 0x228B22,
    geometry: 'cylinder',
    geometryParams: { radiusTop: 0.02, radiusBottom: 0.03, height: 0.14 },
    description: 'Spicy green chillies',
    unit: 'kg',
  },
  {
    id: 'okra',
    name: 'Lady Finger (Okra)',
    hindiName: 'Bhindi',
    emoji: '🥒',
    basePrice: 50,
    priceRange: [35, 90],
    color: 0x4A7C59,
    geometry: 'cylinder',
    geometryParams: { radiusTop: 0.025, radiusBottom: 0.04, height: 0.15 },
    description: 'Tender bhindi from Maharashtra',
    unit: 'kg',
  },
];

/** Quick lookup by vegetable id */
export const VEG_MAP = Object.fromEntries(VEGETABLES.map(v => [v.id, v]));

// ─── Weight pieces for the tarazu ────────────────────────────────────────────
export const WEIGHT_PIECES = [
  { id: 'w100g',  label: '100 g',  value: 0.1,  color: 0xC0C0C0 },
  { id: 'w200g',  label: '200 g',  value: 0.2,  color: 0xA0A0A0 },
  { id: 'w500g',  label: '500 g',  value: 0.5,  color: 0x808080 },
  { id: 'w1kg',   label: '1 kg',   value: 1.0,  color: 0x606060 },
  { id: 'w2kg',   label: '2 kg',   value: 2.0,  color: 0x404040 },
];

// ─── Session price generator ──────────────────────────────────────────────────
/**
 * Generate today's and yesterday's prices with realistic variance.
 * Uses a seeded random based on the date so prices are consistent
 * within the same day.
 */
export function generateDailyPrices(dateStr) {
  // Simple seeded random — we just need consistency for a day
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);
  const rng = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  const today = {};
  const yesterday = {};
  const week = [];

  VEGETABLES.forEach(v => {
    const [lo, hi] = v.priceRange;
    const todayPrice   = Math.round(lo + rng() * (hi - lo));
    const yestPrice    = Math.round(lo + rng() * (hi - lo));
    today[v.id]        = todayPrice;
    yesterday[v.id]    = yestPrice;

    const trend = [yestPrice];
    for (let d = 1; d < 7; d++) {
      const prev = trend[trend.length - 1];
      const delta = Math.round((rng() - 0.5) * 12);
      trend.push(Math.max(lo, Math.min(hi, prev + delta)));
    }
    // Reverse so index 0 = 6 days ago, index 6 = today
    week.push({ id: v.id, name: v.name, emoji: v.emoji, trend: [...trend].reverse() });
  });

  return { today, yesterday, week };
}

// Starting wallet amount
export const INITIAL_WALLET = 500;
