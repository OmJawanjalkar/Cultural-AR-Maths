import { TrendingDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

function ScoreBar({ score }) {
  const clamped = Math.min(100, Math.max(0, score))
  const color = clamped >= 50 ? '#FF6B00' : '#EF4444'
  return (
    <div style={{
      height: '5px',
      background: '#F0EDE8',
      borderRadius: '3px',
      overflow: 'hidden',
      flex: 1,
    }}>
      <div style={{
        height: '100%',
        width: `${clamped}%`,
        background: color,
        borderRadius: '3px',
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

export default function WeakAreas({ weakAreas = [] }) {
  const navigate = useNavigate()

  return (
    <div style={{
      background: 'rgba(255,107,0,0.03)',
      border: '1px solid rgba(255,107,0,0.1)',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <TrendingDown size={18} color="#EF4444" />
        <h3 style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: '600',
          fontSize: '16px',
          color: '#2D2D2D',
          margin: 0,
        }}>
          Areas to Improve
        </h3>
      </div>

      {weakAreas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 16px',
          fontFamily: '"Noto Sans", sans-serif',
          fontSize: '14px',
          color: '#22C55E',
          fontWeight: '600',
        }}>
          Great job! No weak areas detected. 🎉
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {weakAreas.map((area, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '12px 14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
            >
              {/* Topic name */}
              <p style={{
                fontFamily: '"Noto Sans", sans-serif',
                fontSize: '14px',
                color: '#2D2D2D',
                margin: 0,
                minWidth: '110px',
                maxWidth: '130px',
                flexShrink: 0,
                fontWeight: '500',
              }}>
                {area.topic}
              </p>

              {/* Score bar */}
              <ScoreBar score={area.score} />

              {/* Score label */}
              <span style={{
                fontSize: '12px',
                color: '#6B6B6B',
                fontFamily: '"Noto Sans", sans-serif',
                minWidth: '34px',
                textAlign: 'right',
                flexShrink: 0,
              }}>
                {Math.round(area.score)}%
              </span>

              {/* Practice button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/quiz/' + area.module_id)}
                style={{ flexShrink: 0 }}
              >
                Practice
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
