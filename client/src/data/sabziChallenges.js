/**
 * sabziChallenges.js
 * 35 challenges across 5 levels for Sabzi Mandi Arithmetic.
 * All arithmetic is verified; answers rounded to 2 dp where needed.
 *
 * Levels:
 *   1 — Basic Arithmetic (8 questions)
 *   2 — Percentages & Discounts (8 questions)
 *   3 — Profit & Loss (8 questions)
 *   4 — Ratio & Proportion (6 questions)
 *   5 — Compound Problems (5 questions)
 */

// ─── Level 1 — Basic Arithmetic ───────────────────────────────────────────────
const LEVEL_1 = [
  {
    id: 'L1Q1',
    level: 1,
    question: 'Buy 2 kg of Tomatoes at ₹40/kg.\nTotal cost?',
    answer: 80,
    unit: '₹',
    steps: ['Cost = quantity × rate', '= 2 × 40', '= ₹80'],
    karma: 5,
  },
  {
    id: 'L1Q2',
    level: 1,
    question: 'Buy 1.5 kg Onions (₹30/kg) and 2 kg Potatoes (₹25/kg).\nTotal cost?',
    answer: 95,
    unit: '₹',
    steps: ['Onions: 1.5 × 30 = ₹45', 'Potatoes: 2 × 25 = ₹50', 'Total = 45 + 50 = ₹95'],
    karma: 8,
  },
  {
    id: 'L1Q3',
    level: 1,
    question: 'You pay ₹100 for ₹72 worth of vegetables.\nChange received?',
    answer: 28,
    unit: '₹',
    steps: ['Change = Amount paid − Bill amount', '= 100 − 72', '= ₹28'],
    karma: 5,
  },
  {
    id: 'L1Q4',
    level: 1,
    question: 'Buy 3 kg Tomatoes (₹40/kg) and 1 kg Green Chillies (₹60/kg).\nTotal?',
    answer: 180,
    unit: '₹',
    steps: ['Tomatoes: 3 × 40 = ₹120', 'Chillies: 1 × 60 = ₹60', 'Total = 120 + 60 = ₹180'],
    karma: 8,
  },
  {
    id: 'L1Q5',
    level: 1,
    question: 'Potatoes cost ₹25/kg. You buy 4.5 kg.\nHow much do you pay?',
    answer: 112.5,
    unit: '₹',
    steps: ['Cost = 4.5 × 25', '= ₹112.50'],
    karma: 8,
  },
  {
    id: 'L1Q6',
    level: 1,
    question: 'You have ₹200. After buying vegetables worth ₹135, how much is left?',
    answer: 65,
    unit: '₹',
    steps: ['Remaining = 200 − 135 = ₹65'],
    karma: 5,
  },
  {
    id: 'L1Q7',
    level: 1,
    question: 'Bhindi costs ₹50/kg. You buy 2.5 kg.\nTotal cost?',
    answer: 125,
    unit: '₹',
    steps: ['Cost = 2.5 × 50 = ₹125'],
    karma: 8,
  },
  {
    id: 'L1Q8',
    level: 1,
    question:
      'Buy 1 kg Onions (₹30), 2 kg Potatoes (₹25/kg), 500 g Tomatoes (₹40/kg).\nTotal bill?',
    answer: 30 + 50 + 20,
    unit: '₹',
    steps: [
      'Onions: 1 × 30 = ₹30',
      'Potatoes: 2 × 25 = ₹50',
      'Tomatoes: 0.5 × 40 = ₹20',
      'Total = 30 + 50 + 20 = ₹100',
    ],
    karma: 10,
  },
];

// ─── Level 2 — Percentages & Discounts ────────────────────────────────────────
const LEVEL_2 = [
  {
    id: 'L2Q1',
    level: 2,
    question:
      '10% discount on orders above ₹200.\nYour bill is ₹250.\nFinal amount after discount?',
    answer: 225,
    unit: '₹',
    steps: ['Discount = 10% of 250 = 0.10 × 250 = ₹25', 'Final = 250 − 25 = ₹225'],
    karma: 12,
  },
  {
    id: 'L2Q2',
    level: 2,
    question: 'GST of 5% is added to a ₹300 bill.\nTotal amount to pay?',
    answer: 315,
    unit: '₹',
    steps: ['GST = 5% of 300 = 0.05 × 300 = ₹15', 'Total = 300 + 15 = ₹315'],
    karma: 12,
  },
  {
    id: 'L2Q3',
    level: 2,
    question: 'Tomato price dropped from ₹50 to ₹42.\nPercentage decrease?',
    answer: 16,
    unit: '%',
    steps: [
      'Decrease = 50 − 42 = ₹8',
      '% decrease = (8 / 50) × 100',
      '= 16%',
    ],
    karma: 15,
  },
  {
    id: 'L2Q4',
    level: 2,
    question:
      'A shopkeeper offers "Buy 2 kg, get 500 g free" on onions (₹30/kg).\n' +
      'You buy 2 kg. What is the effective price per kg?',
    answer: parseFloat(((2 * 30) / 2.5).toFixed(2)),
    unit: '₹/kg',
    steps: [
      'You pay for 2 kg: 2 × 30 = ₹60',
      'You receive 2 + 0.5 = 2.5 kg',
      'Effective price = 60 / 2.5 = ₹24/kg',
    ],
    karma: 15,
  },
  {
    id: 'L2Q5',
    level: 2,
    question: 'A ₹180 basket is sold at 15% discount.\nSelling price?',
    answer: 153,
    unit: '₹',
    steps: ['Discount = 15% of 180 = ₹27', 'SP = 180 − 27 = ₹153'],
    karma: 12,
  },
  {
    id: 'L2Q6',
    level: 2,
    question: 'Onion price increased from ₹25/kg to ₹30/kg.\nPercentage increase?',
    answer: 20,
    unit: '%',
    steps: ['Increase = 30 − 25 = ₹5', '% increase = (5 / 25) × 100 = 20%'],
    karma: 12,
  },
  {
    id: 'L2Q7',
    level: 2,
    question:
      'A customer bought vegetables worth ₹500.\nShopkeeper gives 8% loyalty discount.\nFinal bill?',
    answer: 460,
    unit: '₹',
    steps: ['Discount = 8% of 500 = ₹40', 'Final = 500 − 40 = ₹460'],
    karma: 12,
  },
  {
    id: 'L2Q8',
    level: 2,
    question:
      'MRP of bhindi is ₹60/kg. Today it sells at ₹54/kg.\nWhat percentage off MRP?',
    answer: 10,
    unit: '%',
    steps: ['Reduction = 60 − 54 = ₹6', '% off = (6 / 60) × 100 = 10%'],
    karma: 12,
  },
];

// ─── Level 3 — Profit & Loss ──────────────────────────────────────────────────
const LEVEL_3 = [
  {
    id: 'L3Q1',
    level: 3,
    question: 'Bought 10 kg tomatoes at ₹80/kg. Sold at ₹110/kg.\nProfit percentage?',
    answer: 37.5,
    unit: '%',
    steps: [
      'Cost Price (CP) = 10 × 80 = ₹800',
      'Selling Price (SP) = 10 × 110 = ₹1100',
      'Profit = SP − CP = ₹300',
      '% Profit = (300 / 800) × 100 = 37.5%',
    ],
    karma: 18,
  },
  {
    id: 'L3Q2',
    level: 3,
    question: 'Bought vegetables for ₹500. Sold at 15% loss.\nSelling price?',
    answer: 425,
    unit: '₹',
    steps: ['Loss = 15% of 500 = ₹75', 'SP = 500 − 75 = ₹425'],
    karma: 15,
  },
  {
    id: 'L3Q3',
    level: 3,
    question:
      'A vendor buys potatoes at ₹20/kg and sells at ₹28/kg.\n' +
      'He sells 25 kg. Total profit?',
    answer: 200,
    unit: '₹',
    steps: ['Profit/kg = 28 − 20 = ₹8', 'Total profit = 8 × 25 = ₹200'],
    karma: 15,
  },
  {
    id: 'L3Q4',
    level: 3,
    question:
      'Onions bought at ₹15/kg, sold at ₹12/kg due to price crash.\n' +
      'Loss percentage?',
    answer: 20,
    unit: '%',
    steps: ['Loss/kg = 15 − 12 = ₹3', '% Loss = (3 / 15) × 100 = 20%'],
    karma: 15,
  },
  {
    id: 'L3Q5',
    level: 3,
    question:
      'A vendor wants 25% profit on vegetables costing ₹640.\n' +
      'At what price should he sell?',
    answer: 800,
    unit: '₹',
    steps: ['Profit = 25% of 640 = ₹160', 'SP = CP + Profit = 640 + 160 = ₹800'],
    karma: 18,
  },
  {
    id: 'L3Q6',
    level: 3,
    question:
      'Sold 5 kg bhindi at ₹55/kg. CP was ₹45/kg.\n' +
      'Total profit and profit percentage?',
    answer: 22.22,
    unit: '%',
    steps: [
      'SP = 5 × 55 = ₹275',
      'CP = 5 × 45 = ₹225',
      'Profit = 275 − 225 = ₹50',
      '% Profit = (50 / 225) × 100 ≈ 22.22%',
    ],
    karma: 20,
  },
  {
    id: 'L3Q7',
    level: 3,
    question:
      'After a 20% discount, tomatoes sell for ₹48/kg.\n' +
      'What was the original price?',
    answer: 60,
    unit: '₹/kg',
    steps: [
      'SP = CP × (1 − 0.20) = 0.80 × CP',
      '48 = 0.80 × CP',
      'CP = 48 / 0.80 = ₹60/kg',
    ],
    karma: 20,
  },
  {
    id: 'L3Q8',
    level: 3,
    question:
      'A market stall owner bought 100 kg vegetables for ₹3000.\n' +
      '15 kg spoilt. He sold the rest at ₹35/kg.\n' +
      'Profit or loss? By how much?',
    answer: 125,   // profit
    unit: '₹ profit',
    steps: [
      'CP = ₹3000',
      'Sold qty = 100 − 15 = 85 kg',
      'SP = 85 × 35 = ₹2975',
      'Hmm... 2975 < 3000 → Loss of ₹25',
    ],
    // corrected answer
    correctedAnswer: -25,
    correctedUnit: '₹ loss',
    steps: [
      'CP = ₹3000',
      'Saleable: 85 kg, SP = 85 × 35 = ₹2975',
      'Loss = 3000 − 2975 = ₹25',
    ],
    answer: -25,
    karma: 22,
  },
];

// ─── Level 4 — Ratio & Proportion ────────────────────────────────────────────
const LEVEL_4 = [
  {
    id: 'L4Q1',
    level: 4,
    question:
      'Mix dal and rice in ratio 2 : 3. Total mixture = 5 kg.\n' +
      'How much dal (in kg)?',
    answer: 2,
    unit: 'kg',
    steps: [
      'Total parts = 2 + 3 = 5',
      'Dal share = 2/5 of total',
      'Dal = (2/5) × 5 = 2 kg',
    ],
    karma: 18,
  },
  {
    id: 'L4Q2',
    level: 4,
    question: 'If 4 kg costs ₹120, how much does 7 kg cost?',
    answer: 210,
    unit: '₹',
    steps: ['Rate = 120 / 4 = ₹30/kg', 'Cost of 7 kg = 7 × 30 = ₹210'],
    karma: 15,
  },
  {
    id: 'L4Q3',
    level: 4,
    question:
      'Two vendors split ₹450 profit in ratio 3 : 2.\n' +
      'How much does the first vendor get?',
    answer: 270,
    unit: '₹',
    steps: [
      'Total parts = 3 + 2 = 5',
      'First share = (3/5) × 450 = ₹270',
    ],
    karma: 18,
  },
  {
    id: 'L4Q4',
    level: 4,
    question:
      'A recipe uses tomatoes : potatoes : onions in ratio 4 : 2 : 1.\n' +
      'Tomatoes needed = 2 kg. How much potatoes?',
    answer: 1,
    unit: 'kg',
    steps: [
      'Ratio T:P = 4:2 = 2:1',
      'Potatoes = (2/4) × 2 = 1 kg',
    ],
    karma: 18,
  },
  {
    id: 'L4Q5',
    level: 4,
    question:
      'Prices of onion, potato, tomato are in ratio 6 : 5 : 8.\n' +
      'If onion = ₹30/kg, what is the price of tomato per kg?',
    answer: 40,
    unit: '₹/kg',
    steps: [
      'Unit price = 30 / 6 = ₹5',
      'Tomato = 8 × 5 = ₹40/kg',
    ],
    karma: 20,
  },
  {
    id: 'L4Q6',
    level: 4,
    question:
      'A vendor mixes two grades of potatoes:\n' +
      '  Grade A at ₹30/kg  and  Grade B at ₹20/kg.\n' +
      'He wants a 10 kg mixture at ₹24/kg.\n' +
      'How many kg of Grade A should he use?',
    answer: 4,
    unit: 'kg',
    steps: [
      'Let x = Grade A (kg). Then (10 − x) = Grade B.',
      '30x + 20(10 − x) = 24 × 10',
      '30x + 200 − 20x = 240',
      '10x = 40  →  x = 4 kg',
    ],
    karma: 22,
  },
];

// ─── Level 5 — Compound Problems ─────────────────────────────────────────────
const LEVEL_5 = [
  {
    id: 'L5Q1',
    level: 5,
    question:
      'Buy 3 items totalling ₹400.\n' +
      '15% discount is applied first.\n' +
      'Then 5% GST on the discounted price.\n' +
      'What is the final amount?',
    answer: parseFloat((400 * 0.85 * 1.05).toFixed(2)),
    unit: '₹',
    steps: [
      'After 15% discount: 400 × 0.85 = ₹340',
      'GST 5% on ₹340: 340 × 1.05 = ₹357',
      'Final = ₹357.00',
    ],
    karma: 30,
  },
  {
    id: 'L5Q2',
    level: 5,
    question:
      '6 workers pack 240 boxes in 4 hours.\n' +
      'How many workers are needed to pack 400 boxes in 5 hours?',
    answer: 8,
    unit: 'workers',
    steps: [
      'Rate: 6 workers × 4 hrs = 24 worker-hours for 240 boxes',
      'Per box: 24 / 240 = 0.1 worker-hours/box',
      'For 400 boxes in 5 hours: (400 × 0.1) / 5 = 40 / 5 = 8 workers',
    ],
    karma: 35,
  },
  {
    id: 'L5Q3',
    level: 5,
    question:
      'A vendor bought tomatoes at ₹35/kg and onions at ₹28/kg.\n' +
      'He sold tomatoes at ₹42/kg (50 kg) and onions at ₹32/kg (40 kg).\n' +
      'Overall profit percentage?',
    answer: parseFloat((
      (((42 - 35) * 50 + (32 - 28) * 40) /
      ((35 * 50) + (28 * 40))) * 100
    ).toFixed(2)),
    unit: '%',
    steps: [
      'Tomato profit: (42 − 35) × 50 = 7 × 50 = ₹350',
      'Onion profit: (32 − 28) × 40 = 4 × 40 = ₹160',
      'Total profit = ₹510',
      'Total CP = 35×50 + 28×40 = 1750 + 1120 = ₹2870',
      '% Profit = (510 / 2870) × 100 ≈ 17.77%',
    ],
    karma: 35,
  },
  {
    id: 'L5Q4',
    level: 5,
    question:
      'Shopkeeper offers: "3 for ₹100" on chillies (normal ₹40 each).\n' +
      'What is the discount per item, and the total saving on 9 items?',
    answer: 30,   // total saving on 9 items
    unit: '₹ saving',
    steps: [
      'Normal price per item = ₹40',
      'Offer price per item = 100 / 3 ≈ ₹33.33',
      'Saving per item ≈ ₹6.67',
      'Total saving on 9 items = 9 × (40 − 100/3)',
      '= 9 × (120/3 − 100/3) = 9 × 20/3 = ₹60',
      'Or: Normal cost 9 items = 360; Offer = 3 × 100 = 300; Saving = ₹60',
    ],
    answer: 60,
    karma: 30,
  },
  {
    id: 'L5Q5',
    level: 5,
    question:
      'A family has ₹600. They spend:\n' +
      '  • 30% on vegetables\n' +
      '  • 25% on grains\n' +
      '  • 15% on dairy\n' +
      'How much is left for other expenses?',
    answer: 180,
    unit: '₹',
    steps: [
      'Total spent % = 30 + 25 + 15 = 70%',
      'Remaining % = 100 − 70 = 30%',
      'Remaining = 30% of 600 = ₹180',
    ],
    karma: 28,
  },
];

// ─── Combine & export ─────────────────────────────────────────────────────────
export const SABZI_CHALLENGES = [
  ...LEVEL_1,
  ...LEVEL_2,
  ...LEVEL_3,
  ...LEVEL_4,
  ...LEVEL_5,
];

export const CHALLENGES_BY_LEVEL = {
  1: LEVEL_1,
  2: LEVEL_2,
  3: LEVEL_3,
  4: LEVEL_4,
  5: LEVEL_5,
};

export const TOTAL_KARMA = SABZI_CHALLENGES.reduce((s, c) => s + c.karma, 0);

/** Quick lookup */
export const CHALLENGE_MAP = Object.fromEntries(
  SABZI_CHALLENGES.map(c => [c.id, c])
);
