/**
 * RangoliChallenges.jsx
 * Bottom panel that displays the current challenge and handles answer input.
 *
 * Props:
 *   currentIndex    number
 *   onIndexChange   (i) => void
 *   earnedKarma     number
 *   onKarmaEarn     (id, karma) => void
 *   onClose         () => void
 *   symmetryConfig  { mode, axisType, rotationOrder }
 */

import { useState } from 'react';
import { RANGOLI_CHALLENGES, TOTAL_KARMA } from '../../../data/rangoliChallenges';

const DIFF_COLORS = {
  1: '#00CED1',
  2: '#7FFF00',
  3: '#FFD700',
  4: '#FF8C00',
  5: '#FF1493',
};

export default function RangoliChallenges({
  currentIndex,
  onIndexChange,
  earnedKarma,
  onKarmaEarn,
  onClose,
  symmetryConfig,
}) {
  const [answer,     setAnswer]     = useState('');
  const [answerX,    setAnswerX]    = useState('');
  const [answerY,    setAnswerY]    = useState('');
  const [feedback,   setFeedback]   = useState(null); // 'correct' | 'wrong' | null
  const [showHint,   setShowHint]   = useState(false);
  const [showExpl,   setShowExpl]   = useState(false);
  const [completed,  setCompleted]  = useState(new Set());
  const [selectedOpt, setSelectedOpt] = useState(null);

  const challenge = RANGOLI_CHALLENGES[currentIndex];
  if (!challenge) return null;

  const totalChallenges = RANGOLI_CHALLENGES.length;
  const diffColor = DIFF_COLORS[challenge.difficulty] ?? '#FFD700';

  // ── Answer checking ────────────────────────────────────────────────────────
  const checkAnswer = () => {
    let correct = false;

    if (challenge.type === 'mcq') {
      correct = selectedOpt === challenge.answerIndex;

    } else if (challenge.type === 'coordinate') {
      const x = parseFloat(answerX), y = parseFloat(answerY);
      if (!isNaN(x) && !isNaN(y)) {
        correct =
          Math.abs(x - challenge.answer.x) < 0.01 &&
          Math.abs(y - challenge.answer.y) < 0.01;
      }
    } else if (challenge.type === 'draw' || challenge.type === 'create') {
      // For draw/create challenges, check symmetry config matches expectation
      if (challenge.checkType === 'symmetry_count' && symmetryConfig) {
        correct = symmetryConfig.mode !== 'none';
      } else if (challenge.checkType === 'rotation_order_and_colors' && symmetryConfig) {
        correct =
          symmetryConfig.mode === 'rotate' &&
          symmetryConfig.rotationOrder === challenge.expectedRotationOrder;
      } else {
        correct = answer.trim().length > 0;
      }
    } else {
      // Numeric answer
      const num = parseFloat(answer.replace(',', '.'));
      if (!isNaN(num)) {
        correct = Math.abs(num - challenge.answer) / Math.max(1, Math.abs(challenge.answer)) < 0.025;
      }
    }

    setFeedback(correct ? 'correct' : 'wrong');

    if (correct && !completed.has(challenge.id)) {
      setCompleted(prev => new Set(prev).add(challenge.id));
      onKarmaEarn?.(challenge.id, challenge.karma);
    }

    if (correct) {
      setTimeout(() => {
        setFeedback(null);
        setShowExpl(true);
      }, 1000);
    }
  };

  const nextChallenge = () => {
    setAnswer('');
    setAnswerX('');
    setAnswerY('');
    setFeedback(null);
    setShowHint(false);
    setShowExpl(false);
    setSelectedOpt(null);
    onIndexChange((currentIndex + 1) % totalChallenges);
  };

  const prevChallenge = () => {
    setAnswer('');
    setAnswerX('');
    setAnswerY('');
    setFeedback(null);
    setShowHint(false);
    setShowExpl(false);
    setSelectedOpt(null);
    onIndexChange((currentIndex - 1 + totalChallenges) % totalChallenges);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '55vh',
        overflowY: 'auto',
        background: 'rgba(6,3,0,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(255,107,0,0.3)',
        borderRadius: '16px 16px 0 0',
        padding: '14px 14px 10px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              background: diffColor + '22',
              border: `1px solid ${diffColor}66`,
              color: diffColor,
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 10,
            }}
          >
            {challenge.difficultyLabel}
          </span>
          <span style={{ color: 'rgba(255,200,100,0.6)', fontSize: 11 }}>
            {currentIndex + 1} / {totalChallenges}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Karma */}
          <span style={{ color: '#D4A017', fontSize: 12, fontWeight: 700 }}>
            ✨ {earnedKarma} / {TOTAL_KARMA}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)', borderRadius: 6, padding: '3px 8px',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 12 }}>
        <div
          style={{
            height: '100%',
            width: `${(completed.size / totalChallenges) * 100}%`,
            background: '#FFD700',
            borderRadius: 2,
            transition: 'width 0.4s',
          }}
        />
      </div>

      {/* Challenge title + concept */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>
          {challenge.title}
        </div>
        <div style={{ color: 'rgba(255,150,80,0.6)', fontSize: 10 }}>
          Concept: {challenge.concept}
        </div>
      </div>

      {/* Question text */}
      <div
        style={{
          color: 'rgba(255,230,180,0.9)',
          fontSize: 13,
          lineHeight: 1.5,
          whiteSpace: 'pre-line',
          marginBottom: 12,
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          border: '1px solid rgba(255,107,0,0.15)',
        }}
      >
        {challenge.question}
      </div>

      {/* MCQ options */}
      {challenge.type === 'mcq' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {challenge.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelectedOpt(i)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${selectedOpt === i ? '#FFD700' : 'rgba(255,255,255,0.2)'}`,
                background: selectedOpt === i ? 'rgba(255,215,0,0.15)' : 'rgba(0,0,0,0.4)',
                color: selectedOpt === i ? '#FFD700' : 'rgba(255,220,160,0.8)',
                fontSize: 14,
                fontWeight: selectedOpt === i ? 700 : 400,
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Coordinate input */}
      {challenge.type === 'coordinate' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,200,100,0.7)', fontSize: 13 }}>(</span>
          <input
            type="number"
            placeholder="x"
            value={answerX}
            onChange={e => setAnswerX(e.target.value)}
            style={inputStyle}
          />
          <span style={{ color: 'rgba(255,200,100,0.7)', fontSize: 13 }}>,</span>
          <input
            type="number"
            placeholder="y"
            value={answerY}
            onChange={e => setAnswerY(e.target.value)}
            style={inputStyle}
          />
          <span style={{ color: 'rgba(255,200,100,0.7)', fontSize: 13 }}>)</span>
        </div>
      )}

      {/* Numeric input */}
      {(challenge.type !== 'mcq' && challenge.type !== 'coordinate' &&
        challenge.type !== 'draw' && challenge.type !== 'create' && challenge.type !== 'identify') && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            type="number"
            placeholder="Your answer…"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
        </div>
      )}

      {/* Draw/create: show symmetry config info */}
      {(challenge.type === 'draw' || challenge.type === 'create') && (
        <div
          style={{
            marginBottom: 12,
            padding: '7px 10px',
            background: 'rgba(255,215,0,0.08)',
            borderRadius: 8,
            border: '1px solid rgba(255,215,0,0.2)',
            fontSize: 11,
            color: 'rgba(255,220,160,0.8)',
          }}
        >
          Active: {symmetryConfig?.mode === 'rotate'
            ? `${symmetryConfig.rotationOrder}-fold rotation`
            : symmetryConfig?.mode === 'reflect'
              ? `Reflect (${symmetryConfig.axisType})`
              : symmetryConfig?.mode === 'translate'
                ? 'Tessellation tile'
                : 'Free draw'}
        </div>
      )}

      {/* Feedback banner */}
      {feedback && (
        <div
          style={{
            marginBottom: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: feedback === 'correct' ? 'rgba(0,255,100,0.12)' : 'rgba(255,50,50,0.12)',
            border: `1px solid ${feedback === 'correct' ? 'rgba(0,255,100,0.4)' : 'rgba(255,80,80,0.4)'}`,
            color: feedback === 'correct' ? '#00FF88' : '#FF8080',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {feedback === 'correct' ? `✓ Correct! +${challenge.karma} karma` : '✗ Try again…'}
        </div>
      )}

      {/* Explanation */}
      {showExpl && challenge.explanation && (
        <div
          style={{
            marginBottom: 10,
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(0,200,255,0.08)',
            border: '1px solid rgba(0,200,255,0.25)',
            color: 'rgba(200,240,255,0.9)',
            fontSize: 12,
            lineHeight: 1.5,
            whiteSpace: 'pre-line',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</div>
          {challenge.explanation}
          {challenge.steps?.map((s, i) => (
            <div key={i} style={{ marginTop: 3, color: 'rgba(200,240,255,0.7)', fontSize: 11 }}>
              {`${i + 1}. ${s}`}
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div
          style={{
            marginBottom: 10,
            padding: '7px 10px',
            borderRadius: 8,
            background: 'rgba(255,200,0,0.08)',
            border: '1px solid rgba(255,200,0,0.25)',
            color: 'rgba(255,220,100,0.85)',
            fontSize: 12,
          }}
        >
          💡 {challenge.hint}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setShowHint(v => !v)} style={secondaryBtn}>
          {showHint ? 'Hide Hint' : '💡 Hint'}
        </button>
        <button onClick={checkAnswer} style={primaryBtn}>
          Check Answer
        </button>
        <button onClick={prevChallenge} style={secondaryBtn}>
          ← Prev
        </button>
        <button onClick={nextChallenge} style={secondaryBtn}>
          Next →
        </button>
      </div>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────────
const inputStyle = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,107,0,0.35)',
  borderRadius: 8,
  color: '#FFD580',
  fontSize: 15,
  padding: '7px 10px',
  width: 80,
  outline: 'none',
};

const primaryBtn = {
  background: 'rgba(255,107,0,0.22)',
  border: '1px solid rgba(255,107,0,0.5)',
  borderRadius: 8,
  color: '#FF8C3A',
  fontSize: 13,
  fontWeight: 700,
  padding: '8px 16px',
  cursor: 'pointer',
};

const secondaryBtn = {
  background: 'rgba(0,0,0,0.4)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: 'rgba(255,220,160,0.75)',
  fontSize: 12,
  padding: '7px 12px',
  cursor: 'pointer',
};
