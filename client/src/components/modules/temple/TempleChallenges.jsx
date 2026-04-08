/**
 * TempleChallenges.jsx
 * Side panel for the 10 progressive measurement challenges.
 */
import { useState, useRef } from 'react';
import { CHALLENGES, TOTAL_KARMA } from '../../../data/templeChallenges';

const DIFF_COLORS = {
  'Beginner': '#4ADE80',
  'Easy':     '#86EFAC',
  'Medium':   '#FCD34D',
  'Hard':     '#FB923C',
  'Expert':   '#F87171',
};

function StepList({ steps }) {
  return (
    <div style={{ marginTop: 12 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 10,
            marginBottom: 6,
            opacity: 0,
            animation: `fadeIn 0.3s ease ${i * 0.12}s forwards`,
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(255,107,0,0.25)',
              border: '1px solid rgba(255,107,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#FF8C3A',
              fontWeight: 700,
            }}
          >
            {i + 1}
          </div>
          <div>
            <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {step.label}
            </div>
            <div style={{ color: '#FFE580', fontSize: 13, fontFamily: 'monospace' }}>
              {step.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TempleChallenges({ currentIndex, onIndexChange, earnedKarma, onKarmaEarn, onClose }) {
  const challenge = CHALLENGES[currentIndex];
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('idle'); // idle | correct | wrong | revealed
  const [showSolution, setShowSolution] = useState(false);
  const inputRef = useRef(null);

  function handleNext() {
    const next = Math.min(currentIndex + 1, CHALLENGES.length - 1);
    onIndexChange(next);
    setAnswer('');
    setStatus('idle');
    setShowSolution(false);
  }

  function handlePrev() {
    const prev = Math.max(currentIndex - 1, 0);
    onIndexChange(prev);
    setAnswer('');
    setStatus('idle');
    setShowSolution(false);
  }

  function handleCheck() {
    const val = parseFloat(answer.replace(',', '.'));
    if (isNaN(val)) {
      setStatus('wrong');
      return;
    }
    const expected = challenge.answer;
    const tolerance = 0.02; // ±2%
    const diff = Math.abs(val - expected) / (Math.abs(expected) || 1);
    if (diff <= tolerance) {
      setStatus('correct');
      setShowSolution(true);
      onKarmaEarn?.(challenge.id, challenge.karma);
    } else {
      setStatus('wrong');
    }
  }

  function handleReveal() {
    setStatus('revealed');
    setShowSolution(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleCheck();
  }

  const diffColor = DIFF_COLORS[challenge.difficultyLabel] || '#FCD34D';
  const progress = ((currentIndex + 1) / CHALLENGES.length) * 100;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(8, 4, 0, 0.94)',
        backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(255,107,0,0.5)',
        borderRadius: '20px 20px 0 0',
        maxHeight: '70vh',
        overflowY: 'auto',
        padding: '16px 18px 28px',
      }}
    >
      {/* Style tag for fade-in animation */}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#FFD580', fontWeight: 700, fontSize: 15 }}>
            Challenge {currentIndex + 1} <span style={{ color: 'rgba(255,200,100,0.4)' }}>/ {CHALLENGES.length}</span>
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              border: `1px solid ${diffColor}`,
              color: diffColor,
            }}
          >
            {challenge.difficultyLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,107,0,0.15)',
            border: '1px solid rgba(255,107,0,0.3)',
            borderRadius: 8,
            color: '#FF8C3A',
            width: 30,
            height: 30,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 14 }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #FF6B00, #D4A017)',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Concept tag */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontSize: 10,
            color: '#FF8C3A',
            background: 'rgba(255,107,0,0.12)',
            border: '1px solid rgba(255,107,0,0.25)',
            borderRadius: 12,
            padding: '3px 9px',
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {challenge.concept}
        </span>
      </div>

      {/* Question */}
      <div
        style={{
          color: '#FFE8B0',
          fontSize: 14,
          lineHeight: 1.6,
          marginBottom: 14,
          whiteSpace: 'pre-line',
        }}
      >
        {challenge.question}
      </div>

      {/* Formula hint */}
      <div
        style={{
          background: 'rgba(212,160,23,0.1)',
          border: '1px solid rgba(212,160,23,0.25)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#D4A017', fontSize: 11, textTransform: 'uppercase', fontWeight: 700, flexShrink: 0 }}>Formula:</span>
        <code style={{ color: '#FFD700', fontSize: 13 }}>{challenge.formula}</code>
      </div>

      {/* Answer input */}
      {status !== 'correct' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            ref={inputRef}
            type="number"
            step="any"
            placeholder={`Answer in ${challenge.unit || 'units'}`}
            value={answer}
            onChange={e => { setAnswer(e.target.value); setStatus('idle'); }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${status === 'wrong' ? '#F87171' : 'rgba(255,107,0,0.35)'}`,
              borderRadius: 10,
              padding: '10px 14px',
              color: '#FFE8B0',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button
            onClick={handleCheck}
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #D4A017)',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              padding: '10px 18px',
              cursor: 'pointer',
            }}
          >
            Check
          </button>
        </div>
      )}

      {/* Status messages */}
      {status === 'wrong' && (
        <div style={{ color: '#F87171', fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>✗</span>
          <span>Not quite. Hint: {challenge.hint}</span>
        </div>
      )}
      {status === 'correct' && (
        <div
          style={{
            background: 'rgba(74,222,128,0.12)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 10,
            padding: '10px 14px',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontSize: 22 }}>✓</span>
          <div>
            <div style={{ color: '#4ADE80', fontWeight: 700, fontSize: 14 }}>Correct!</div>
            <div style={{ color: 'rgba(74,222,128,0.7)', fontSize: 12 }}>+{challenge.karma} karma earned</div>
          </div>
        </div>
      )}

      {/* Solution steps */}
      {showSolution && (
        <div
          style={{
            background: 'rgba(255,107,0,0.06)',
            border: '1px solid rgba(255,107,0,0.2)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 12,
          }}
        >
          <div style={{ color: '#FF8C3A', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
            Step-by-step solution
          </div>
          <StepList steps={challenge.steps} />
        </div>
      )}

      {/* Actions row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            color: currentIndex === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
            padding: '7px 14px',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13,
          }}
        >
          ← Prev
        </button>

        {!showSolution && status !== 'correct' && (
          <button
            onClick={handleReveal}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,200,100,0.25)',
              borderRadius: 8,
              color: 'rgba(255,200,100,0.55)',
              padding: '7px 14px',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Show Answer
          </button>
        )}

        <button
          onClick={handleNext}
          disabled={currentIndex === CHALLENGES.length - 1}
          style={{
            background: currentIndex === CHALLENGES.length - 1
              ? 'rgba(255,107,0,0.2)'
              : 'linear-gradient(135deg, #FF6B00, #C45000)',
            border: 'none',
            borderRadius: 8,
            color: currentIndex === CHALLENGES.length - 1 ? 'rgba(255,107,0,0.5)' : '#fff',
            padding: '7px 14px',
            cursor: currentIndex === CHALLENGES.length - 1 ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          Next →
        </button>
      </div>

      {/* Overall karma progress */}
      <div
        style={{
          marginTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ color: '#D4A017', fontSize: 12 }}>Total Karma:</span>
        <span style={{ color: '#FFD700', fontWeight: 700, fontSize: 14 }}>{earnedKarma} / {TOTAL_KARMA}</span>
        <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
          <div
            style={{
              height: '100%',
              width: `${(earnedKarma / TOTAL_KARMA) * 100}%`,
              background: '#D4A017',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
