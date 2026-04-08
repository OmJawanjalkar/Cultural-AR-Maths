import { useState, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return mins < 2 ? 'Just now' : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function ScorePill({ score }) {
  const color = score >= 70 ? '#22C55E' : score >= 50 ? '#FF6B00' : '#EF4444'
  const bg = score >= 70 ? 'rgba(34,197,94,0.1)' : score >= 50 ? 'rgba(255,107,0,0.1)' : 'rgba(239,68,68,0.1)'
  return (
    <span style={{
      background: bg,
      color,
      fontFamily: '"Poppins", sans-serif',
      fontWeight: '700',
      fontSize: '12px',
      padding: '3px 10px',
      borderRadius: '20px',
    }}>
      {score}%
    </span>
  )
}

const COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'karma_points', label: 'Karma', sortable: true },
  { key: 'streak', label: 'Streak', sortable: true },
  { key: 'avg_score', label: 'Avg Score', sortable: true },
  { key: 'quizzes_taken', label: 'Quizzes', sortable: true },
  { key: 'weak_topic', label: 'Weak Topic', sortable: false },
  { key: 'last_active', label: 'Last Active', sortable: true },
]

export default function StudentTable({ students = [], onSelectStudent }) {
  const [sortKey, setSortKey] = useState('karma_points')
  const [sortAsc, setSortAsc] = useState(false)
  const [search, setSearch] = useState('')

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(a => !a)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return q
      ? students.filter(s => (s.name || '').toLowerCase().includes(q))
      : students
  }, [students, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va = a[sortKey]
      let vb = b[sortKey]
      if (typeof va === 'string') va = va.toLowerCase()
      if (typeof vb === 'string') vb = vb.toLowerCase()
      if (va === undefined) return 1
      if (vb === undefined) return -1
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortAsc])

  const SortIcon = ({ col }) => {
    if (!col.sortable) return null
    if (sortKey !== col.key) return <ChevronUp size={11} color="#D1D5DB" />
    return sortAsc
      ? <ChevronUp size={11} color="#FF6B00" />
      : <ChevronDown size={11} color="#FF6B00" />
  }

  return (
    <div>
      {/* Header + search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Student List
          <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '400', marginLeft: '8px' }}>
            ({sorted.length} students)
          </span>
        </h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#F9F9F9',
          border: '1.5px solid #E5E7EB',
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: '200px',
        }}>
          <Search size={14} color="#9CA3AF" />
          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: '#2D2D2D',
              fontFamily: '"Noto Sans", sans-serif',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Table wrapper */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(255,107,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: 'rgba(255,107,0,0.04)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', width: '36px' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: '"Poppins", sans-serif', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>#</span>
              </th>
              {COLUMNS.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  style={{
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      color: sortKey === col.key ? '#FF6B00' : '#6B7280',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {col.label}
                    </span>
                    <SortIcon col={col} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1} style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif', fontSize: '14px' }}>
                  No students found
                </td>
              </tr>
            ) : sorted.map((s, idx) => {
              const isLow = (s.avg_score ?? 0) < 50
              return (
                <tr
                  key={s._id || idx}
                  onClick={() => onSelectStudent?.(s)}
                  style={{
                    background: isLow
                      ? 'rgba(239,68,68,0.04)'
                      : idx % 2 === 0 ? '#FFFFFF' : 'rgba(255,107,0,0.015)',
                    borderBottom: '1px solid rgba(0,0,0,0.04)',
                    cursor: onSelectStudent ? 'pointer' : 'default',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,0,0.06)' }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isLow
                      ? 'rgba(239,68,68,0.04)'
                      : idx % 2 === 0 ? '#FFFFFF' : 'rgba(255,107,0,0.015)'
                  }}
                >
                  <td style={{ padding: '10px 16px', fontSize: '12px', color: '#9CA3AF', fontWeight: '600' }}>
                    {idx + 1}
                  </td>
                  {/* Name */}
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: 'rgba(255,107,0,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#FF6B00',
                        fontFamily: '"Poppins", sans-serif',
                        flexShrink: 0,
                      }}>
                        {getInitials(s.name)}
                      </div>
                      <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '500', fontSize: '13px', color: '#2D2D2D' }}>
                        {s.name}
                      </span>
                      {isLow && <span title="Needs attention" style={{ fontSize: '14px' }}>⚠️</span>}
                    </div>
                  </td>
                  {/* Karma */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: '700', fontSize: '13px', color: '#D4A017' }}>
                      ⭐ {(s.karma_points ?? 0).toLocaleString()}
                    </span>
                  </td>
                  {/* Streak */}
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#2D2D2D' }}>
                    🔥 {s.streak ?? 0}d
                  </td>
                  {/* Avg score */}
                  <td style={{ padding: '10px 12px' }}>
                    <ScorePill score={s.avg_score ?? 0} />
                  </td>
                  {/* Quizzes taken */}
                  <td style={{ padding: '10px 12px', fontSize: '13px', color: '#4B5563', fontFamily: '"Noto Sans", sans-serif' }}>
                    {s.quizzes_taken ?? '—'}
                  </td>
                  {/* Weak topic */}
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      background: 'rgba(239,68,68,0.08)',
                      color: '#EF4444',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      fontFamily: '"Noto Sans", sans-serif',
                    }}>
                      {s.weak_topic || '—'}
                    </span>
                  </td>
                  {/* Last active */}
                  <td style={{ padding: '10px 12px', fontSize: '12px', color: '#9CA3AF', fontFamily: '"Noto Sans", sans-serif', whiteSpace: 'nowrap' }}>
                    {timeAgo(s.last_active)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
