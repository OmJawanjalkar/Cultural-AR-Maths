import { useState } from 'react'
import { Check, Clock, AlertTriangle } from 'lucide-react'

const MODULES = [
  { id: 'geometry', label: '🕌 Temple Architecture' },
  { id: 'symmetry', label: '🌸 Rangoli Symmetry' },
  { id: 'arithmetic', label: '🥬 Sabzi Mandi Arithmetic' },
  { id: '3d-geometry', label: '📐 3D Geometry Playground' },
  { id: 'all', label: '🧠 Mixed (All Topics)' },
]

const Q_OPTIONS = [5, 10, 15, 20]

// Mock active assignments
const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    module: 'geometry',
    moduleLabel: '🕌 Temple Architecture',
    difficulty: '2 – 4',
    questions: 10,
    deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
    completed: 18,
    total: 32,
    avatars: ['AR', 'PS', 'RK', 'SN'],
  },
  {
    id: 2,
    module: 'arithmetic',
    moduleLabel: '🥬 Sabzi Mandi Arithmetic',
    difficulty: '1 – 3',
    questions: 15,
    deadline: new Date(Date.now() - 86400000).toISOString(), // overdue
    completed: 30,
    total: 32,
    avatars: ['AR', 'PS', 'RK'],
  },
]

function isoToDateValue(iso) {
  return iso ? iso.split('T')[0] : ''
}

function formatDeadline(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isOverdue(iso) {
  return iso && new Date(iso).getTime() < Date.now()
}

function CompletionBar({ completed, total, overdue }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0
  const color = overdue ? '#EF4444' : pct >= 80 ? '#22C55E' : '#FF6B00'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: '"Noto Sans", sans-serif' }}>
          {completed}/{total} students completed
        </span>
        <span style={{ fontSize: '11px', fontWeight: '700', color, fontFamily: '"Poppins", sans-serif' }}>
          {pct}%
        </span>
      </div>
      <div style={{ background: '#F0EDE8', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

export default function AssignmentManager({ totalStudents = 32 }) {
  const [module, setModule] = useState('geometry')
  const [minDiff, setMinDiff] = useState(1)
  const [maxDiff, setMaxDiff] = useState(3)
  const [numQ, setNumQ] = useState(10)
  const [deadline, setDeadline] = useState('')
  const [success, setSuccess] = useState(false)
  const [assignments, setAssignments] = useState(MOCK_ASSIGNMENTS)

  const handleCreate = () => {
    if (!deadline) {
      alert('Please set a deadline.')
      return
    }
    const mod = MODULES.find(m => m.id === module)
    const newAssignment = {
      id: Date.now(),
      module,
      moduleLabel: mod?.label || module,
      difficulty: `${minDiff} – ${maxDiff}`,
      questions: numQ,
      deadline: new Date(deadline).toISOString(),
      completed: 0,
      total: totalStudents,
      avatars: [],
    }
    setAssignments(prev => [newAssignment, ...prev])
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div>
      <h3 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '16px', color: '#2D2D2D', margin: '0 0 20px' }}>
        📋 Assignment Manager
      </h3>

      {/* Create form */}
      <div style={{
        background: '#FFF8E7',
        border: '1px solid rgba(255,107,0,0.15)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
      }}>
        <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 16px' }}>
          Create New Assignment
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Module */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Module
            </label>
            <select
              value={module}
              onChange={e => setModule(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: '"Noto Sans", sans-serif', color: '#2D2D2D', background: '#FFFFFF', outline: 'none', cursor: 'pointer' }}
            >
              {MODULES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          {/* Number of questions */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Questions
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Q_OPTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => setNumQ(q)}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    background: numQ === q ? '#FF6B00' : '#FFFFFF',
                    border: `1.5px solid ${numQ === q ? '#FF6B00' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: numQ === q ? '#FFFFFF' : '#4B5563',
                    cursor: 'pointer',
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setDeadline(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', fontFamily: '"Noto Sans", sans-serif', color: '#2D2D2D', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Difficulty slider */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '8px', fontFamily: '"Poppins", sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Difficulty Range: Level {minDiff} – {maxDiff}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>Min: {minDiff}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={minDiff}
                onChange={e => {
                  const v = Number(e.target.value)
                  setMinDiff(v)
                  if (v > maxDiff) setMaxDiff(v)
                }}
                style={{ width: '100%', accentColor: '#FF6B00', display: 'block', marginTop: '4px' }}
              />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif' }}>Max: {maxDiff}</span>
              <input
                type="range"
                min="1"
                max="5"
                value={maxDiff}
                onChange={e => {
                  const v = Number(e.target.value)
                  setMaxDiff(v)
                  if (v < minDiff) setMinDiff(v)
                }}
                style={{ width: '100%', accentColor: '#FF6B00', display: 'block', marginTop: '4px' }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          style={{
            padding: '10px 28px',
            background: '#FF6B00',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: '"Poppins", sans-serif',
            transition: 'filter 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}
        >
          Assign to Class →
        </button>

        {success && (
          <div style={{
            marginTop: '12px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            color: '#16A34A',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: '"Noto Sans", sans-serif',
          }}>
            <Check size={14} /> Assignment created! Students will see it in their dashboard.
          </div>
        )}
      </div>

      {/* Active assignments */}
      <div>
        <h4 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '600', fontSize: '14px', color: '#2D2D2D', margin: '0 0 12px' }}>
          Active Assignments
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map(a => {
            const overdue = isOverdue(a.deadline)
            return (
              <div
                key={a.id}
                style={{
                  background: '#FFFFFF',
                  border: `1.5px solid ${overdue ? 'rgba(239,68,68,0.3)' : 'rgba(255,107,0,0.1)'}`,
                  borderRadius: '10px',
                  padding: '16px 18px',
                  background: overdue ? 'rgba(239,68,68,0.03)' : '#FFFFFF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '14px', color: '#2D2D2D', margin: '0 0 4px' }}>
                      {a.moduleLabel}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', fontFamily: '"Noto Sans", sans-serif' }}>
                        Level {a.difficulty} · {a.questions} questions
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {overdue ? <AlertTriangle size={13} color="#EF4444" /> : <Clock size={13} color="#9CA3AF" />}
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: overdue ? '#EF4444' : '#6B7280',
                      fontFamily: '"Noto Sans", sans-serif',
                    }}>
                      {overdue ? 'Overdue · ' : 'Due '}{formatDeadline(a.deadline)}
                    </span>
                  </div>
                </div>
                <CompletionBar completed={a.completed} total={a.total} overdue={overdue} />
                {/* Student avatars */}
                {a.avatars.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
                    {a.avatars.map((av, i) => (
                      <div key={i} style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,107,0,0.15)',
                        border: '2px solid #FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: '700',
                        color: '#FF6B00',
                        fontFamily: '"Poppins", sans-serif',
                        marginLeft: i > 0 ? '-6px' : 0,
                      }}>
                        {av}
                      </div>
                    ))}
                    <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '8px', alignSelf: 'center', fontFamily: '"Noto Sans", sans-serif' }}>
                      {a.completed} completed
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
