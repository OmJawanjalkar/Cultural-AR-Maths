/**
 * ShoppingChallenges.jsx
 * Bottom panel for displaying and answering Sabzi Mandi arithmetic challenges.
 *
 * Props:
 *   level           1..5
 *   onLevelChange   (l) => void
 *   earnedKarma     number
 *   onKarmaEarn     (id, karma) => void
 *   walletBalance   number
 *   onWalletChange  (newBalance) => void
 *   onClose         () => void
 *   onQuestionChange (question) => void  — updates shopkeeper speech bubble
 */

import { useState, useEffect } from 'react';
import { CHALLENGES_BY_LEVEL, TOTAL_KARMA } from '../../../data/sabziChallenges';

const LEVEL_LABELS = {
  1: { label: 'Basic', color: '#00CED1' },
  2: { label: 'Discount', color: '#7FFF00' },
  3: { label: 'Profit', color: '#FFD700' },
  4: { label: 'Ratio', color: '#FF8C00' },
  5: { label: 'Advanced', color: '#FF1493' },
};

export default function ShoppingChallenges({
  level,
  onLevelChange,
  earnedKarma,
  onKarmaEarn,
  walletBalance,
  onWalletChange,
  onClose,
  onQuestionChange,
}) {
  const challenges = CHALLENGES_BY_LEVEL[level] ?? [];
  const [qIndex,    setQIndex]    = useState(0);
  const [answer,    setAnswer]    = useState('');
  const [feedback,  setFeedback]  = useState(null);
  const [showHint,  setShowHint]  = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [completed, setCompleted] = useState(new Set());

  const challenge = challenges[qIndex];

  // Notify parent (shopkeeper bubble) whenever question changes
  useEffect(() => {
    if (challenge) onQuestionChange?.(challenge.question);
  }, [challenge, onQuestionChange]);

  // Reset when level changes
  useEffect(() => {
    setQIndex(0);
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
    setShowSteps(false);
  }, [level]);

  if (!challenge) return null;

  const { id, question, answer: correctAnswer, unit, steps, karma } = challenge;
  const levelInfo = LEVEL_LABELS[level] ?? LEVEL_LABELS[1];

  const checkAnswer = () => {
    const num = parseFloat(answer.replace(',', '.'));
    if (isNaN(num)) {
      setFeedback('invalid');
      return;
    }
    const tolerance = Math.max(0.5, Math.abs(correctAnswer) * 0.02);
    const correct = Math.abs(num - correctAnswer) <= tolerance;
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct && !completed.has(id)) {
      setCompleted(prev => new Set(prev).add(id));
      onKarmaEarn?.(id, karma);
      // Deduct from wallet for "buy" questions
      if (unit === '₹' && correctAnswer > 0 && correctAnswer <= walletBalance) {
        onWalletChange?.(Math.max(0, walletBalance - correctAnswer));
      }
    }

    if (correct) {
      setTimeout(() => {
        setFeedback(null);
        setShowSteps(true);
      }, 900);
    }
  };

  const go = (dir) => {
    const next = (qIndex + dir + challenges.length) % challenges.length;
    setQIndex(next);
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
    setShowSteps(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '58vh',
        overflowY: 'auto',
        background: 'rgba(6,3,0,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1.5px solid rgba(255,107,0,0.3)',
        borderRadius: '16px 16px 0 0',
        padding: '12px 14px 10px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        {/* Level tabs */}
        <div style={{ display: 'flex', gap: 5 }}>
          {[1, 2, 3, 4, 5].map(l => {
            const li = LEVEL_LABELS[l];
            return (
              <button
                key={l}
                onClick={() => onLevelChange(l)}
                style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  border: `1px solid ${l === level ? li.color : 'rgba(255,255,255,0.12)'}`,
                  background: l === level ? li.color + '22' : 'rgba(0,0,0,0.3)',
                  color: l === level ? li.color : 'rgba(255,220,160,0.5)',
                  fontSize: 11,
                  fontWeight: l === level ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                L{l}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#D4A017', fontSize: 12, fontWeight: 700 }}>
            ✨ {earnedKarma}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6, color: 'rgba(255,255,255,0.6)', padding: '3px 8px',
              cursor: 'pointer', fontSize: 12,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Level label + question counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span
          style={{
            background: levelInfo.color + '22',
            border: `1px solid ${levelInfo.color}55`,
            color: levelInfo.color,
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 8,
          }}
        >
          Level {level} — {levelInfo.label}
        </span>
        <span style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
          {qIndex + 1} / {challenges.length}
        </span>
        {completed.has(id) && (
          <span style={{ color: '#00FF88', fontSize: 12 }}>✓</span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 12 }}>
        <div
          style={{
            height: '100%',
            width: `${((qIndex + 1) / challenges.length) * 100}%`,
            background: levelInfo.color,
            borderRadius: 2,
            transition: 'width 0.3s',
          }}
        />
      </div>

      {/* Question */}
      <div
        style={{
          color: 'rgba(255,230,180,0.92)',
          fontSize: 13,
          lineHeight: 1.55,
          whiteSpace: 'pre-line',
          padding: '9px 11px',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          border: '1px solid rgba(255,107,0,0.15)',
          marginBottom: 12,
        }}
      >
        {question}
      </div>

      {/* Answer input row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input
          type="number"
          step="0.01"
          placeholder={`Answer in ${unit}…`}
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkAnswer()}
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,107,0,0.35)',
            borderRadius: 8,
            color: '#FFD580',
            fontSize: 15,
            padding: '8px 12px',
            outline: 'none',
          }}
        />
        <span style={{ color: 'rgba(255,200,100,0.6)', fontSize: 12, minWidth: 28 }}>{unit}</span>
        <button onClick={checkAnswer} style={primaryBtn}>Check</button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: feedback === 'correct'
              ? 'rgba(0,255,100,0.10)'
              : feedback === 'invalid'
                ? 'rgba(255,200,0,0.10)'
                : 'rgba(255,50,50,0.10)',
            border: `1px solid ${feedback === 'correct' ? 'rgba(0,255,100,0.35)' : feedback === 'invalid' ? 'rgba(255,200,0,0.35)' : 'rgba(255,80,80,0.35)'}`,
            color: feedback === 'correct' ? '#00FF88' : feedback === 'invalid' ? '#FFD700' : '#FF8080',
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          {feedback === 'correct'
            ? `✓ Correct! +${karma} karma`
            : feedback === 'invalid'
              ? '⚠ Please enter a number'
              : `✗ Incorrect. Correct answer: ${correctAnswer} ${unit}`}
        </div>
      )}

      {/* Step-by-step solution */}
      {showSteps && steps && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(0,200,255,0.06)',
            border: '1px solid rgba(0,200,255,0.2)',
            marginBottom: 10,
          }}
        >
          <div style={{ color: '#00CFFF', fontWeight: 700, fontSize: 12, marginBottom: 5 }}>
            Step-by-step
          </div>
          {steps.map((s, i) => (
            <div key={i} style={{ color: 'rgba(200,240,255,0.8)', fontSize: 12, marginBottom: 3 }}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div style={{
          padding: '7px 10px', borderRadius: 8, marginBottom: 10,
          background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.2)',
          color: 'rgba(255,220,100,0.85)', fontSize: 12,
        }}>
          💡 {steps?.[0] ?? 'Re-read the question carefully.'}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={() => setShowHint(v => !v)} style={secondaryBtn}>
          {showHint ? 'Hide Hint' : '💡 Hint'}
        </button>
        <button onClick={() => setShowSteps(v => !v)} style={secondaryBtn}>
          📋 Steps
        </button>
        <button onClick={() => go(-1)} style={secondaryBtn}>← Prev</button>
        <button onClick={() => go(1)} style={secondaryBtn}>Next →</button>
      </div>
    </div>
  );
}

const primaryBtn = {
  background: 'rgba(255,107,0,0.22)',
  border: '1px solid rgba(255,107,0,0.5)',
  borderRadius: 8,
  color: '#FF8C3A',
  fontSize: 13,
  fontWeight: 700,
  padding: '8px 14px',
  cursor: 'pointer',
};

const secondaryBtn = {
  background: 'rgba(0,0,0,0.35)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'rgba(255,220,160,0.7)',
  fontSize: 12,
  padding: '6px 12px',
  cursor: 'pointer',
};
