import { useCallback, useEffect, useRef, useState } from 'react'
import { Clock, Pause, X } from 'lucide-react'
import LoadingSpinner from '../ui/LoadingSpinner'
import MCQQuestion from './MCQQuestion'
import NumericQuestion from './NumericQuestion'
import MatchingQuestion from './MatchingQuestion'
import ARInteractiveQuestion from './ARInteractiveQuestion'
import DifficultyIndicator from './DifficultyIndicator'
import AnswerFeedback from './AnswerFeedback'
import SessionSummary from './SessionSummary'
import { quizService } from '../../services/quizService'
import { calculateKarma } from '../../utils/karmaCalculator'
import { useAuth } from '../../contexts/AuthContext'

const MAX_QUESTIONS = 10
const NUMERIC_TOLERANCE = 0.02 // ±2%

// Frontend module IDs → backend module names
const MODULE_ID_MAP = {
  geometry:     'temple',
  symmetry:     'rangoli',
  arithmetic:   'sabzi_mandi',
  all:          'general',
  'all-topics': 'general',
  '3d-geometry':'geometry_3d',
}

// ── sessionStorage helpers ────────────────────────────────────────────────────
// Persist seen question IDs across unmount/remount so navigating away and back
// doesn't reset deduplication within the same browser tab session.

function sessionKey(module) { return `quiz_seen_${module}` }

function loadSeenIds(module) {
  try {
    const raw = sessionStorage.getItem(sessionKey(module))
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch { return new Set() }
}

function saveSeenIds(module, set) {
  try { sessionStorage.setItem(sessionKey(module), JSON.stringify([...set])) } catch {}
}

function clearSeenIds(module) {
  try { sessionStorage.removeItem(sessionKey(module)) } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/**
 * Normalize a raw API question so all fields are consistent regardless of
 * which backend field names were used.
 */
function normalizeQuestion(q) {
  const qtype =
    q.question_type ||
    q.type ||
    (Array.isArray(q.options) && q.options.length ? 'mcq' : 'numeric')

  return {
    ...q,
    question_type:    qtype,
    correct_answer:   q.correct_answer   ?? q.answer        ?? q.correctAnswer  ?? '',
    options:          Array.isArray(q.options) ? q.options : [],
    difficulty:       q.difficulty       ?? q.difficulty_level ?? 1,
    explanation:      q.explanation      ?? q.solution      ?? '',
    hint:             q.hint             ?? '',
    cultural_context: q.cultural_context ?? q.culturalContext ?? '',
    topic:            q.topic            ?? q.module        ?? '',
  }
}

function isAnswerCorrect(question, studentAnswer) {
  const correct = question.correct_answer
  if (question.question_type === 'numeric') {
    const n = parseFloat(studentAnswer)
    const c = parseFloat(correct)
    if (isNaN(n) || isNaN(c)) return false
    if (c === 0) return n === 0
    return Math.abs(n - c) / Math.abs(c) <= NUMERIC_TOLERANCE
  }
  if (question.question_type === 'matching') {
    if (!Array.isArray(studentAnswer) || !Array.isArray(question.pairs)) return false
    return question.pairs.every(pair =>
      studentAnswer.some(a => a.left === pair.left && a.right === pair.right)
    )
  }
  return String(studentAnswer).trim() === String(correct).trim()
}

// ── Mock question bank (10 per module, shuffled each session) ─────────────────
const MOCK_BANK = {
  temple: [
    { question_text: 'The Brihadeeswarar Temple tower is 66 m tall. Its shadow at noon is 33 m. What is the angle of elevation of the sun?', question_type: 'mcq', options: ['30°','45°','60°','90°'], correct_answer: '60°', difficulty: 3, explanation: 'tan(θ) = 66/33 = 2 → θ ≈ 63.4°. Closest option is 60°.', cultural_context: 'The Brihadeeswarar Temple in Thanjavur (1010 CE) is a UNESCO World Heritage Site.', topic: 'temple' },
    { question_text: 'A temple courtyard is rectangular: length 48 m, width 36 m. What is the diagonal pathway length?', question_type: 'numeric', correct_answer: '60', difficulty: 2, explanation: '√(48² + 36²) = √(2304 + 1296) = √3600 = 60 m', cultural_context: 'Temple courtyards (mandapas) were measured using Sulbasutra mathematics.', topic: 'temple' },
    { question_text: 'A gopuram (temple tower) casts a shadow of 40 m. The angle of elevation is 30°. How tall is the gopuram?', question_type: 'mcq', options: ['20 m','23.1 m','40 m','69.3 m'], correct_answer: '23.1 m', difficulty: 3, explanation: 'height = tan(30°) × 40 = (1/√3) × 40 ≈ 23.1 m', topic: 'temple' },
    { question_text: 'A temple tank is square with side 50 m. What is its perimeter?', question_type: 'numeric', correct_answer: '200', difficulty: 1, explanation: 'Perimeter of square = 4 × side = 4 × 50 = 200 m', topic: 'temple' },
    { question_text: 'A circular temple dome has radius 7 m. What is its circumference? (π ≈ 22/7)', question_type: 'mcq', options: ['22 m','44 m','154 m','308 m'], correct_answer: '44 m', difficulty: 2, explanation: 'Circumference = 2πr = 2 × (22/7) × 7 = 44 m', topic: 'temple' },
    { question_text: 'A temple floor has 8 identical square tiles per row and 8 rows. Each tile is 0.5 m × 0.5 m. What is the total floor area?', question_type: 'numeric', correct_answer: '16', difficulty: 2, explanation: '8 × 8 = 64 tiles. Each tile area = 0.25 m². Total = 64 × 0.25 = 16 m²', topic: 'temple' },
    { question_text: 'A temple pillar is a cylinder with radius 0.5 m and height 10 m. What is its curved surface area? (π ≈ 3.14)', question_type: 'mcq', options: ['15.7 m²','31.4 m²','62.8 m²','78.5 m²'], correct_answer: '31.4 m²', difficulty: 3, explanation: 'CSA = 2πrh = 2 × 3.14 × 0.5 × 10 = 31.4 m²', topic: 'temple' },
    { question_text: 'The Konark Sun Temple has 24 wheels. If each wheel has 8 spokes, how many spokes are there in total?', question_type: 'numeric', correct_answer: '192', difficulty: 1, explanation: '24 wheels × 8 spokes = 192 spokes', cultural_context: 'The 24 wheels of the Konark Sun Temple represent 24 hours, and the 8 spokes represent the 3-hour intervals of a day.', topic: 'temple' },
    { question_text: 'A temple wall is 12 m long and 4 m high. How many square bricks (0.3 m × 0.3 m) are needed to cover it?', question_type: 'mcq', options: ['160','444','533','640'], correct_answer: '533', difficulty: 3, explanation: 'Wall area = 12 × 4 = 48 m². Brick area = 0.09 m². Count = 48 ÷ 0.09 ≈ 533', topic: 'temple' },
    { question_text: 'A triangular pediment of a temple has a base of 14 m and height of 6 m. What is its area?', question_type: 'numeric', correct_answer: '42', difficulty: 2, explanation: 'Area = ½ × base × height = ½ × 14 × 6 = 42 m²', topic: 'temple' },
  ],
  rangoli: [
    { question_text: 'A rangoli has 8 petals arranged symmetrically in a circle. How many lines of symmetry does it have?', question_type: 'mcq', options: ['4','6','8','16'], correct_answer: '8', difficulty: 2, explanation: 'A figure with n evenly-spaced identical parts has n lines of symmetry.', cultural_context: 'Rangoli is one of the oldest Indian art forms, demonstrating reflection symmetry.', topic: 'rangoli' },
    { question_text: 'A kolam pattern is made of a 6 × 6 dot grid. How many dots are there in total?', question_type: 'numeric', correct_answer: '36', difficulty: 1, explanation: '6 × 6 = 36 dots', cultural_context: 'Kolam (also called Muggu) is a South Indian floor art form drawn with rice powder.', topic: 'rangoli' },
    { question_text: 'A circular rangoli has a diameter of 2 m. What is its area? (π ≈ 3.14)', question_type: 'mcq', options: ['3.14 m²','6.28 m²','12.56 m²','25.12 m²'], correct_answer: '3.14 m²', difficulty: 2, explanation: 'radius = 1 m. Area = πr² = 3.14 × 1² = 3.14 m²', topic: 'rangoli' },
    { question_text: 'A rangoli has rotational symmetry of order 6. By how many degrees is each rotation?', question_type: 'numeric', correct_answer: '60', difficulty: 2, explanation: '360° ÷ 6 = 60°', topic: 'rangoli' },
    { question_text: 'A square rangoli has a side of 1.5 m. What is its perimeter?', question_type: 'mcq', options: ['3 m','4.5 m','6 m','9 m'], correct_answer: '6 m', difficulty: 1, explanation: 'Perimeter = 4 × 1.5 = 6 m', topic: 'rangoli' },
    { question_text: 'A star rangoli is formed by overlapping two equilateral triangles. How many points does the star have?', question_type: 'numeric', correct_answer: '6', difficulty: 1, explanation: 'Two overlapping equilateral triangles form a 6-pointed Star of David / hexagram.', topic: 'rangoli' },
    { question_text: 'A rangoli pattern repeats every 45°. How many times does it repeat in a full circle?', question_type: 'mcq', options: ['4','6','8','10'], correct_answer: '8', difficulty: 2, explanation: '360° ÷ 45° = 8 repetitions', topic: 'rangoli' },
    { question_text: 'A hexagonal rangoli has 6 equal sides of 20 cm each. What is its perimeter?', question_type: 'numeric', correct_answer: '120', difficulty: 1, explanation: 'Perimeter = 6 × 20 = 120 cm', topic: 'rangoli' },
    { question_text: 'A rangoli is made inside a square of side 2 m. If the rangoli covers 78.5% of the square, what is its area? (round to 2 decimal places)', question_type: 'mcq', options: ['1.57 m²','3.14 m²','4 m²','6.28 m²'], correct_answer: '3.14 m²', difficulty: 3, explanation: 'Square area = 4 m². 78.5% × 4 = 3.14 m². (This is the area of the inscribed circle: π × 1² ≈ 3.14 m²)', topic: 'rangoli' },
    { question_text: 'A kolam grid has 5 rows and 5 columns of dots. How many dots lie on the border of this grid?', question_type: 'numeric', correct_answer: '16', difficulty: 3, explanation: 'Border dots = 4 × (n-1) = 4 × 4 = 16 for a 5×5 grid.', topic: 'rangoli' },
  ],
  sabzi_mandi: [
    { question_text: 'Tomatoes cost ₹40/kg and onions cost ₹25/kg. What is the total cost for 2.5 kg tomatoes and 3 kg onions?', question_type: 'mcq', options: ['₹150','₹175','₹185','₹200'], correct_answer: '₹175', difficulty: 2, explanation: '(2.5 × 40) + (3 × 25) = 100 + 75 = ₹175', cultural_context: 'Sabzi mandis have been the heart of Indian commerce for centuries.', topic: 'sabzi_mandi' },
    { question_text: 'A vendor sells 15 kg of potatoes at ₹20/kg. What is the total revenue?', question_type: 'numeric', correct_answer: '300', difficulty: 1, explanation: '15 × 20 = ₹300', topic: 'sabzi_mandi' },
    { question_text: 'Spinach is sold at 3 bunches for ₹15. How much do 7 bunches cost?', question_type: 'mcq', options: ['₹30','₹35','₹40','₹45'], correct_answer: '₹35', difficulty: 2, explanation: '1 bunch = ₹15 ÷ 3 = ₹5. 7 bunches = 7 × ₹5 = ₹35', topic: 'sabzi_mandi' },
    { question_text: 'A vendor bought 50 kg of carrots at ₹18/kg and sold them at ₹25/kg. What is the profit?', question_type: 'numeric', correct_answer: '350', difficulty: 2, explanation: 'Cost = 50 × 18 = ₹900. Revenue = 50 × 25 = ₹1250. Profit = 1250 - 900 = ₹350', topic: 'sabzi_mandi' },
    { question_text: 'Green chillies are sold at ₹80/kg. A customer wants 250 g. How much do they pay?', question_type: 'mcq', options: ['₹10','₹15','₹20','₹25'], correct_answer: '₹20', difficulty: 2, explanation: '250 g = 0.25 kg. Cost = 0.25 × 80 = ₹20', topic: 'sabzi_mandi' },
    { question_text: 'A vendor gives 5% discount on a ₹200 purchase. What is the final price?', question_type: 'numeric', correct_answer: '190', difficulty: 2, explanation: 'Discount = 5% of 200 = ₹10. Final price = 200 - 10 = ₹190', topic: 'sabzi_mandi' },
    { question_text: 'A customer pays ₹500 for vegetables worth ₹375. How much change should they get?', question_type: 'mcq', options: ['₹75','₹100','₹125','₹150'], correct_answer: '₹125', difficulty: 1, explanation: '500 - 375 = ₹125', topic: 'sabzi_mandi' },
    { question_text: 'A mango vendor sold 120 mangoes. 30% were class A (₹8 each) and the rest class B (₹5 each). What was the total revenue?', question_type: 'numeric', correct_answer: '708', difficulty: 3, explanation: 'Class A: 0.3 × 120 = 36 mangoes × ₹8 = ₹288. Class B: 84 × ₹5 = ₹420. Total = ₹708', topic: 'sabzi_mandi' },
    { question_text: 'Cucumbers cost ₹30/kg. If you buy 1.5 kg and pay with a ₹100 note, how much change do you get?', question_type: 'mcq', options: ['₹45','₹50','₹55','₹70'], correct_answer: '₹55', difficulty: 1, explanation: 'Cost = 1.5 × 30 = ₹45. Change = 100 - 45 = ₹55', topic: 'sabzi_mandi' },
    { question_text: 'A vendor marks up cost price by 25% to set the selling price. If cost price is ₹160/kg, what is the selling price?', question_type: 'numeric', correct_answer: '200', difficulty: 2, explanation: 'Markup = 25% of 160 = ₹40. Selling price = 160 + 40 = ₹200', topic: 'sabzi_mandi' },
  ],
  geometry_3d: [
    { question_text: 'A cone cut horizontally (parallel to its base) reveals which shape?', question_type: 'ar_interactive', ar_prompt: 'Rotate the 3D cone and observe its cross-section', ar_object: 'cone', options: ['Circle','Triangle','Square','Ellipse'], correct_answer: 'Circle', difficulty: 2, explanation: 'A horizontal cut parallel to the base always yields a circle.', topic: 'geometry_3d' },
    { question_text: 'A cube has side length 5 cm. What is its total surface area?', question_type: 'numeric', correct_answer: '150', difficulty: 2, explanation: '6 faces × (5²) = 6 × 25 = 150 cm²', topic: 'geometry_3d' },
    { question_text: 'A sphere has radius 7 cm. What is its volume? (π ≈ 22/7)', question_type: 'mcq', options: ['616 cm³','1437 cm³','1548 cm³','4312/3 cm³'], correct_answer: '1437 cm³', difficulty: 3, explanation: 'V = (4/3)πr³ = (4/3) × (22/7) × 343 ≈ 1437 cm³', topic: 'geometry_3d' },
    { question_text: 'A cylinder has radius 3 cm and height 10 cm. What is its volume? (π ≈ 3.14)', question_type: 'numeric', correct_answer: '282.6', difficulty: 3, explanation: 'V = πr²h = 3.14 × 9 × 10 = 282.6 cm³', topic: 'geometry_3d' },
    { question_text: 'How many faces does a triangular prism have?', question_type: 'mcq', options: ['3','4','5','6'], correct_answer: '5', difficulty: 1, explanation: 'A triangular prism has 2 triangular faces + 3 rectangular faces = 5 faces.', topic: 'geometry_3d' },
    { question_text: 'A cube has 8 vertices. How many edges does it have?', question_type: 'numeric', correct_answer: '12', difficulty: 1, explanation: 'A cube has 12 edges (4 on top, 4 on bottom, 4 vertical).', topic: 'geometry_3d' },
    { question_text: 'A cone has radius 6 cm and slant height 10 cm. What is its curved surface area? (π ≈ 3.14)', question_type: 'mcq', options: ['113.04 cm²','188.4 cm²','226.08 cm²','376.8 cm²'], correct_answer: '188.4 cm²', difficulty: 3, explanation: 'CSA = πrl = 3.14 × 6 × 10 = 188.4 cm²', topic: 'geometry_3d' },
    { question_text: 'A cuboid is 5 cm × 4 cm × 3 cm. What is its volume?', question_type: 'numeric', correct_answer: '60', difficulty: 1, explanation: 'Volume = l × w × h = 5 × 4 × 3 = 60 cm³', topic: 'geometry_3d' },
    { question_text: 'Which solid has exactly 1 curved face, 1 flat circular face, and 1 vertex (apex)?', question_type: 'mcq', options: ['Sphere','Cylinder','Cone','Hemisphere'], correct_answer: 'Cone', difficulty: 2, explanation: 'A cone has one circular base, one curved lateral surface, and one apex vertex.', topic: 'geometry_3d' },
    { question_text: 'A hemisphere has radius 7 cm. What is the total surface area? (π ≈ 22/7)', question_type: 'numeric', correct_answer: '462', difficulty: 3, explanation: 'TSA = 3πr² = 3 × (22/7) × 49 = 3 × 154 = 462 cm²', topic: 'geometry_3d' },
  ],
  general: [
    { question_text: 'A cube has 6 faces, each with area 25 cm². What is its total surface area?', question_type: 'mcq', options: ['25 cm²','100 cm²','125 cm²','150 cm²'], correct_answer: '150 cm²', difficulty: 2, explanation: '6 × 25 = 150 cm²', topic: 'general' },
    { question_text: 'Which Indian festival is most associated with rangoli patterns?', question_type: 'mcq', options: ['Holi','Diwali','Eid','Christmas'], correct_answer: 'Diwali', difficulty: 1, explanation: 'Rangoli is traditionally made during Diwali to welcome Goddess Lakshmi.', cultural_context: 'During Diwali, rangoli is drawn at the entrance of homes with coloured powders, flowers, or rice flour.', topic: 'general' },
    { question_text: 'If 12 books cost ₹360, what is the cost of 5 books?', question_type: 'numeric', correct_answer: '150', difficulty: 2, explanation: 'Cost per book = 360 ÷ 12 = ₹30. 5 books = 5 × 30 = ₹150', topic: 'general' },
    { question_text: 'A train travels 240 km in 3 hours. What is its average speed?', question_type: 'mcq', options: ['60 km/h','70 km/h','80 km/h','90 km/h'], correct_answer: '80 km/h', difficulty: 2, explanation: 'Speed = Distance ÷ Time = 240 ÷ 3 = 80 km/h', topic: 'general' },
    { question_text: 'What is 15% of 800?', question_type: 'numeric', correct_answer: '120', difficulty: 1, explanation: '15% × 800 = 0.15 × 800 = 120', topic: 'general' },
    { question_text: 'The ratio of boys to girls in a class is 3:2. If there are 30 students, how many are girls?', question_type: 'mcq', options: ['10','12','15','18'], correct_answer: '12', difficulty: 2, explanation: 'Girls = (2/5) × 30 = 12', topic: 'general' },
    { question_text: 'A square has perimeter 48 cm. What is its area?', question_type: 'numeric', correct_answer: '144', difficulty: 2, explanation: 'Side = 48 ÷ 4 = 12 cm. Area = 12² = 144 cm²', topic: 'general' },
    { question_text: 'Simplify: 2/3 + 3/4', question_type: 'mcq', options: ['5/7','17/12','5/12','1 1/12'], correct_answer: '17/12', difficulty: 2, explanation: 'LCM(3,4)=12. 8/12 + 9/12 = 17/12', topic: 'general' },
    { question_text: 'If a shirt costs ₹450 after a 10% discount, what was the original price?', question_type: 'numeric', correct_answer: '500', difficulty: 3, explanation: '90% of original = 450. Original = 450 ÷ 0.9 = ₹500', topic: 'general' },
    { question_text: 'A triangle has angles in ratio 2:3:5. What is the largest angle?', question_type: 'mcq', options: ['60°','72°','90°','108°'], correct_answer: '90°', difficulty: 2, explanation: 'Angles: 2x+3x+5x=180°. x=18°. Largest = 5×18 = 90°', topic: 'general' },
  ],
}

/**
 * Returns a shuffled copy of the mock bank for a given backend module,
 * filtering out any question IDs already seen.
 */
function buildMockQueue(module, seenIds) {
  const bank = MOCK_BANK[module] || MOCK_BANK.general
  // Assign stable IDs to mocks (not Date.now() so they're deduplicable)
  const stamped = bank.map((q, i) => ({ ...q, _id: `mock-${module}-${i}` }))
  // Shuffle
  const shuffled = [...stamped].sort(() => Math.random() - 0.5)
  // Filter out already-seen
  return shuffled.filter(q => !seenIds.has(q._id))
}

// ── Confetti ──────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#FF6B00', '#D4A017', '#22C55E', '#800020', '#FFD700']

function ConfettiPieces() {
  const pieces = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${5 + (i / 20) * 90}%`,
    delay: `${(i % 5) * 0.12}s`,
    size: `${7 + (i % 4) * 2}px`,
  }))
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{ left: p.left, top: '-12px', background: p.color, animationDelay: p.delay, width: p.size, height: p.size }}
        />
      ))}
    </div>
  )
}

// ── Pause Modal ───────────────────────────────────────────────────────────────
function PauseModal({ onResume, onExit }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="animate-scale-in" style={{ background: '#FFFFFF', borderRadius: '16px', padding: '36px 32px', maxWidth: '360px', width: '100%', textAlign: 'center', boxShadow: '0 16px 64px rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏸️</div>
        <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '20px', color: '#2D2D2D', margin: '0 0 8px' }}>Quiz Paused</h3>
        <p style={{ color: '#6B6B6B', fontSize: '14px', margin: '0 0 28px', fontFamily: '"Noto Sans", sans-serif' }}>Your progress is saved. Ready to continue?</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onExit} style={{ flex: 1, padding: '12px', background: 'transparent', color: '#EF4444', border: '2px solid #EF4444', borderRadius: '8px', fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Exit</button>
          <button onClick={onResume} style={{ flex: 2, padding: '12px', background: '#FF6B00', color: '#FFFFFF', border: '2px solid #FF6B00', borderRadius: '8px', fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>
            ▶ Resume
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// QuizSession — main component
// ─────────────────────────────────────────────────────────────────────────────
export default function QuizSession({ module, moduleName, onExit }) {
  const { user, updateUser } = useAuth()
  const backendModule = MODULE_ID_MAP[module] || module

  // ── Deduplication ─────────────────────────────────
  // seenIds: persisted in sessionStorage across unmounts
  const seenIdsRef = useRef(loadSeenIds(backendModule))
  // Mock question queue: shuffled slice that doesn't repeat
  const mockQueueRef = useRef(buildMockQueue(backendModule, seenIdsRef.current))

  // ── Phase ─────────────────────────────────────────
  const [phase, setPhase] = useState('loading')

  // ── Current question ──────────────────────────────
  const [question, setQuestion] = useState(null)

  // ── Answer state (reset per question) ────────────
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [numericAnswer, setNumericAnswer] = useState('')
  const [matchingAnswer, setMatchingAnswer] = useState(null)

  // ── Session data ──────────────────────────────────
  const [questionHistory, setQuestionHistory] = useState([])
  const [sessionKarma, setSessionKarma] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  // ── Feedback data ────────────────────────────────
  const [feedbackData, setFeedbackData] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // ── UI ────────────────────────────────────────────
  const [paused, setPaused] = useState(false)
  const [questionTimer, setQuestionTimer] = useState(0)
  const [totalTimer, setTotalTimer] = useState(0)

  const questionTimerRef = useRef(null)
  const totalTimerRef = useRef(null)

  // ── Timers ────────────────────────────────────────
  const startQuestionTimer = () => {
    clearInterval(questionTimerRef.current)
    setQuestionTimer(0)
    questionTimerRef.current = setInterval(() => setQuestionTimer(t => t + 1), 1000)
  }
  const stopQuestionTimer = () => clearInterval(questionTimerRef.current)

  const startTotalTimer = () => {
    clearInterval(totalTimerRef.current)
    totalTimerRef.current = setInterval(() => setTotalTimer(t => t + 1), 1000)
  }
  const stopTotalTimer = () => clearInterval(totalTimerRef.current)

  useEffect(() => {
    startTotalTimer()
    return () => { stopQuestionTimer(); stopTotalTimer() }
  }, []) // eslint-disable-line

  // ── Fetch next question (with deduplication) ──────
  const fetchQuestion = useCallback(async () => {
    setPhase('loading')
    setSelectedAnswer(null)
    setNumericAnswer('')
    setMatchingAnswer(null)
    setFeedbackData(null)
    setShowConfetti(false)

    const seenIds = seenIdsRef.current
    const excludeList = [...seenIds]

    let nextQuestion = null

    // 1. Try backend (with exclude_ids so it never repeats)
    try {
      const res = await quizService.getNextQuestion(backendModule, excludeList)
      const raw = res?.data?.data || res?.data
      if (raw?.question_text) {
        nextQuestion = normalizeQuestion(raw)
      }
    } catch {
      // backend down — fall through to mock
    }

    // 2. Fallback to local mock queue
    if (!nextQuestion) {
      // Refill queue if exhausted (all mocks seen — reshuffle)
      if (mockQueueRef.current.length === 0) {
        mockQueueRef.current = buildMockQueue(backendModule, new Set())
      }
      nextQuestion = mockQueueRef.current.shift()
    }

    // 3. Mark as seen
    if (nextQuestion?._id) {
      seenIdsRef.current.add(nextQuestion._id)
      saveSeenIds(backendModule, seenIdsRef.current)
    }

    setQuestion(nextQuestion)
    startQuestionTimer()
    setPhase('answering')
  }, [backendModule])

  useEffect(() => { fetchQuestion() }, [fetchQuestion])

  // ── Submit answer ─────────────────────────────────
  const handleSubmit = async () => {
    if (phase !== 'answering') return

    const type = question.question_type
    const answer =
      type === 'numeric'  ? numericAnswer  :
      type === 'matching' ? matchingAnswer :
      selectedAnswer

    if (!answer && answer !== 0) return

    stopQuestionTimer()

    let isCorrect = false
    let correctAnswer = question.correct_answer
    let explanation = question.explanation || ''
    let hint = question.hint || ''
    let karmaEarned = 0
    let newStreak = streak

    try {
      const res = await quizService.submitAnswer({
        question_id: question._id,
        answer,
        module: backendModule,
        time_taken_seconds: questionTimer,
      })
      const d = res?.data?.data || res?.data || {}
      isCorrect    = d.is_correct    ?? isAnswerCorrect(question, answer)
      correctAnswer = d.correct_answer ?? question.correct_answer
      explanation  = d.explanation   ?? explanation
      hint         = d.hint          ?? hint
      karmaEarned  = d.karma_earned  ??
        calculateKarma({ difficulty: question.difficulty || 1, isCorrect, streak, timeTaken: questionTimer })
    } catch {
      isCorrect   = isAnswerCorrect(question, answer)
      karmaEarned = calculateKarma({ difficulty: question.difficulty || 1, isCorrect, streak, timeTaken: questionTimer })
    }

    if (isCorrect) {
      newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(prev => Math.max(prev, newStreak))
      setSessionKarma(prev => prev + karmaEarned)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1400)

      // ── Real-time gamification: update karma in AuthContext ──
      if (user && updateUser && karmaEarned > 0) {
        updateUser({
          ...user,
          karma_points: (user.karma_points || 0) + karmaEarned,
        })
      }
    } else {
      newStreak = 0
      setStreak(0)
    }

    setQuestionHistory(prev => [
      ...prev,
      {
        question_text: question.question_text,
        topic:         question.topic || backendModule,
        isCorrect,
        timeTaken:     questionTimer,
        difficulty:    question.difficulty || 1,
        userAnswer:    answer,
        correctAnswer,
      },
    ])

    setFeedbackData({ isCorrect, karmaEarned, correctAnswer, explanation, hint, streak: newStreak })
    setPhase('feedback')
  }

  // ── Next question or summary ──────────────────────
  const handleNext = () => {
    // questionHistory is already updated (state settled before user clicks Next)
    if (questionHistory.length >= MAX_QUESTIONS) {
      stopTotalTimer()
      stopQuestionTimer()

      const score = questionHistory.filter(q => q.isCorrect).length

      // Persist the completed session to the backend (fire-and-forget)
      quizService.logSession({
        module:        backendModule,
        score,
        total:         questionHistory.length,
        karma_earned:  sessionKarma,
        max_streak:    maxStreak,
        time_elapsed:  totalTimer,
        questions:     questionHistory.map(q => ({
          topic:      q.topic,
          is_correct: q.isCorrect,
          difficulty: q.difficulty,
          time_taken: q.timeTaken,
        })),
      }).catch(() => { /* backend may be down — ignore */ })

      // Notify LiveDataContext and AuthContext so both refresh immediately
      window.dispatchEvent(
        new CustomEvent('sanskritimath:quiz_complete', {
          detail: {
            karmaEarned: sessionKarma,
            score,
            total:  questionHistory.length,
            module: backendModule,
            userId: user?._id,
          },
        })
      )

      setPhase('summary')
    } else {
      fetchQuestion()
    }
  }

  // ── Session restart (clears deduplication) ────────
  const handleRestart = () => {
    clearSeenIds(backendModule)
    seenIdsRef.current = new Set()
    mockQueueRef.current = buildMockQueue(backendModule, new Set())
    setQuestionHistory([])
    setSessionKarma(0)
    setStreak(0)
    setMaxStreak(0)
    setTotalTimer(0)
    startTotalTimer()
    fetchQuestion()
  }

  // ── Pause / resume ────────────────────────────────
  const handlePause = () => {
    setPaused(true)
    stopQuestionTimer()
    stopTotalTimer()
  }

  const handleResume = () => {
    setPaused(false)
    if (phase === 'answering') {
      questionTimerRef.current = setInterval(() => setQuestionTimer(t => t + 1), 1000)
    }
    startTotalTimer()
  }

  const handleExitSession = () => {
    stopTotalTimer()
    stopQuestionTimer()
    setPaused(false)
    onExit()
  }

  // ── Summary screen ────────────────────────────────
  if (phase === 'summary') {
    const score = questionHistory.filter(q => q.isCorrect).length
    return (
      <SessionSummary
        score={score}
        total={questionHistory.length}
        timeElapsed={totalTimer}
        karmaEarned={sessionKarma}
        maxStreak={maxStreak}
        questionHistory={questionHistory}
        moduleName={moduleName}
        badgesEarned={[]}
        onPlayAgain={handleRestart}
        onWeakTopics={() => onExit('/modules')}
        onBack={onExit}
      />
    )
  }

  // ── canSubmit ─────────────────────────────────────
  const canSubmit = (() => {
    const type = question?.question_type
    if (!type) return false
    if (type === 'numeric') return numericAnswer !== '' && numericAnswer !== '-'
    if (type === 'matching') return matchingAnswer !== null
    return selectedAnswer !== null
  })()

  const questionCount = questionHistory.length
  const progress = Math.round((questionCount / MAX_QUESTIONS) * 100)
  const isLastQuestion = questionCount + 1 >= MAX_QUESTIONS

  // ── Render ────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FFF8E7', fontFamily: '"Noto Sans", sans-serif' }}>
      {paused && <PauseModal onResume={handleResume} onExit={handleExitSession} />}

      {/* ── Top Bar ──────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,248,231,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,107,0,0.12)', padding: '0 20px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <button onClick={handleExitSession} title="Exit quiz" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B6B', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <X size={20} />
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: 0, lineHeight: 1.2 }}>{moduleName}</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Question {questionCount + 1} of {MAX_QUESTIONS}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B6B6B', fontSize: '13px' }}>
            <Clock size={13} />
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', minWidth: '40px' }}>{formatTime(totalTimer)}</span>
          </div>
          <button onClick={handlePause} title="Pause"
            style={{ background: 'none', border: '1.5px solid #E5E5E5', borderRadius: '6px', cursor: 'pointer', color: '#6B6B6B', padding: '4px 6px', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#FF6B00' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.color = '#6B6B6B' }}>
            <Pause size={14} />
          </button>
        </div>
      </header>

      {/* ── Progress Bar ─────────────────────────── */}
      <div style={{ height: '4px', background: '#F0EDE8' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FF6B00, #FF8C3A)', transition: 'width 0.5s ease' }} />
      </div>

      {/* ── Main Content ─────────────────────────── */}
      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 20px 60px' }}>
        {phase === 'loading' ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <LoadingSpinner size="lg" />
          </div>
        ) : question ? (
          <div style={{ position: 'relative' }}>
            {showConfetti && <ConfettiPieces />}

            {/* ── Question Card ────────────────────── */}
            <div
              className={`animate-fade-in-up${phase === 'feedback' && feedbackData && !feedbackData.isCorrect ? ' animate-shake' : ''}`}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 4px 24px rgba(255,107,0,0.08)',
                border: phase === 'feedback'
                  ? `2px solid ${feedbackData?.isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.25)'}`
                  : '2px solid transparent',
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Difficulty + per-question timer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <DifficultyIndicator difficulty={question.difficulty || 1} size="sm" />
                <span style={{ fontSize: '12px', color: '#9CA3AF', fontFamily: '"Poppins", sans-serif', fontWeight: '500' }}>
                  <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                  {questionTimer}s
                </span>
              </div>

              {/* Cultural context */}
              {question.cultural_context && (
                <div style={{ padding: '10px 14px', background: 'rgba(255,107,0,0.04)', borderLeft: '3px solid rgba(255,107,0,0.35)', borderRadius: '0 6px 6px 0', marginBottom: '16px', fontSize: '12px', fontFamily: '"Noto Sans", sans-serif', color: '#6B6B6B', fontStyle: 'italic', lineHeight: '1.6' }}>
                  📖 {question.cultural_context}
                </div>
              )}

              {/* Question text */}
              <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '17px', color: '#2D2D2D', lineHeight: '1.55', margin: '0 0 22px' }}>
                {question.question_text}
              </p>

              {/* ── Question renderer ─────────────── */}
              {question.question_type === 'mcq' && (
                <MCQQuestion
                  question={question}
                  selectedAnswer={selectedAnswer}
                  onSelect={setSelectedAnswer}
                  submitted={phase === 'feedback'}
                  isCorrect={feedbackData?.isCorrect ?? false}
                  correctAnswer={feedbackData?.correctAnswer ?? question.correct_answer}
                />
              )}
              {question.question_type === 'numeric' && (
                <NumericQuestion
                  question={question}
                  value={numericAnswer}
                  onChange={setNumericAnswer}
                  submitted={phase === 'feedback'}
                  isCorrect={feedbackData?.isCorrect ?? false}
                  correctAnswer={feedbackData?.correctAnswer ?? question.correct_answer}
                />
              )}
              {question.question_type === 'matching' && (
                <MatchingQuestion
                  question={question}
                  onComplete={pairs => setMatchingAnswer(pairs)}
                  submitted={phase === 'feedback'}
                  isCorrect={feedbackData?.isCorrect ?? false}
                  correctAnswer={feedbackData?.correctAnswer}
                />
              )}
              {question.question_type === 'ar_interactive' && (
                <ARInteractiveQuestion
                  question={question}
                  selectedAnswer={selectedAnswer}
                  onSelect={setSelectedAnswer}
                  submitted={phase === 'feedback'}
                  isCorrect={feedbackData?.isCorrect ?? false}
                  correctAnswer={feedbackData?.correctAnswer ?? question.correct_answer}
                />
              )}

              {/* ── Submit button ─────────────────── */}
              {phase === 'answering' && (
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{ width: '100%', marginTop: '22px', padding: '14px', background: '#FF6B00', color: '#FFFFFF', border: '2px solid #FF6B00', borderRadius: '10px', fontSize: '15px', fontFamily: '"Poppins", sans-serif', fontWeight: '700', cursor: canSubmit ? 'pointer' : 'not-allowed', opacity: canSubmit ? 1 : 0.45, transition: 'opacity 0.2s, filter 0.15s' }}
                  onMouseEnter={e => { if (canSubmit) e.currentTarget.style.filter = 'brightness(1.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
                >
                  Submit Answer
                </button>
              )}

              {/* ── Answer feedback ───────────────── */}
              {phase === 'feedback' && feedbackData && (
                <AnswerFeedback
                  isCorrect={feedbackData.isCorrect}
                  karmaEarned={feedbackData.karmaEarned}
                  streak={feedbackData.streak}
                  explanation={feedbackData.explanation}
                  culturalContext={question.cultural_context}
                  correctAnswer={feedbackData.correctAnswer}
                  hint={feedbackData.hint}
                  difficulty={question.difficulty || 1}
                  onNext={handleNext}
                  isLastQuestion={isLastQuestion}
                />
              )}
            </div>

            {/* Session mini-score */}
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#6B6B6B', fontFamily: '"Noto Sans", sans-serif' }}>
              {questionHistory.filter(q => q.isCorrect).length} correct out of {questionHistory.length} answered
              {streak >= 2 && (
                <span style={{ marginLeft: '10px', color: '#FF6B00', fontWeight: '600' }}>🔥 {streak} streak</span>
              )}
              {sessionKarma > 0 && (
                <span style={{ marginLeft: '10px', color: '#D4A017', fontWeight: '600' }}>⭐ +{sessionKarma} karma</span>
              )}
            </div>
          </div>
        ) : (
          // Rare: question is null after loading (all questions seen + mock bank empty — shouldn't happen)
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <p style={{ fontSize: '16px', color: '#6B6B6B', fontFamily: '"Poppins", sans-serif' }}>
              No more questions available. Great job!
            </p>
            <button onClick={handleExitSession} style={{ marginTop: '16px', padding: '12px 28px', background: '#FF6B00', color: '#fff', border: 'none', borderRadius: '8px', fontFamily: '"Poppins", sans-serif', fontWeight: '700', cursor: 'pointer' }}>
              Back to Modules
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
