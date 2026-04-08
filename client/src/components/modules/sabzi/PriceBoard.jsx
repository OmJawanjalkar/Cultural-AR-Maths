/**
 * PriceBoard.jsx
 * Daily price board showing today vs yesterday and a 7-day trend chart.
 * Uses recharts for the mini sparkline charts.
 *
 * Props:
 *   today      { [vegId]: number }
 *   yesterday  { [vegId]: number }
 *   weekData   [{ id, name, emoji, trend: number[7] }]  — index 0 = 6 days ago, 6 = today
 *   onClose    () => void
 */

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { VEGETABLES } from '../../../data/sabziData';

const DAY_LABELS = ['−6', '−5', '−4', '−3', '−2', '−1', 'Today'];

function pctChange(now, prev) {
  if (!prev || prev === 0) return 0;
  return (((now - prev) / prev) * 100).toFixed(1);
}

function SparkLine({ data, color }) {
  const pts = data.map((v, i) => ({ d: DAY_LABELS[i], v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={pts}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <XAxis dataKey="d" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip
          contentStyle={{
            background: 'rgba(10,5,0,0.95)',
            border: '1px solid rgba(255,107,0,0.4)',
            borderRadius: 6,
            fontSize: 11,
            color: '#FFD580',
          }}
          formatter={(v) => [`₹${v}`, 'Price']}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function PriceBoard({ today, yesterday, weekData, onClose }) {
  const [expanded, setExpanded] = useState(null); // vegId for expanded chart

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        zIndex: 30,
        maxHeight: '68vh',
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
        <div>
          <div style={{ color: '#FFD580', fontWeight: 700, fontSize: 14 }}>📋 Daily Price Board</div>
          <div style={{ color: 'rgba(255,200,100,0.5)', fontSize: 10 }}>
            Tap a row to see 7-day trend
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 6, color: 'rgba(255,255,255,0.6)', padding: '3px 8px',
          cursor: 'pointer', fontSize: 12,
        }}>
          ✕
        </button>
      </div>

      {/* Price comparison table */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,107,0,0.15)',
          borderRadius: 10,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 65px 65px 60px',
          padding: '7px 12px',
          background: 'rgba(255,107,0,0.1)',
          borderBottom: '1px solid rgba(255,107,0,0.2)',
          color: 'rgba(255,200,100,0.6)', fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
        }}>
          <span>Vegetable</span>
          <span style={{ textAlign: 'right' }}>Today</span>
          <span style={{ textAlign: 'right' }}>Yesterday</span>
          <span style={{ textAlign: 'right' }}>Change</span>
        </div>

        {VEGETABLES.map(veg => {
          const todayPx  = today?.[veg.id]     ?? veg.basePrice;
          const yestPx   = yesterday?.[veg.id] ?? veg.basePrice;
          const change   = pctChange(todayPx, yestPx);
          const up       = todayPx > yestPx;
          const same     = todayPx === yestPx;
          const changeColor = same ? 'rgba(255,200,100,0.5)' : up ? '#FF6B35' : '#00CED1';
          const vegWeekData  = weekData?.find(w => w.id === veg.id);
          const isExpanded   = expanded === veg.id;

          return (
            <div key={veg.id}>
              <div
                onClick={() => setExpanded(isExpanded ? null : veg.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 65px 65px 60px',
                  padding: '9px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,107,0,0.08)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ color: 'rgba(255,230,180,0.9)', fontSize: 12 }}>
                  {veg.emoji} {veg.name}
                </span>
                <span style={{ color: '#FFD580', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                  ₹{todayPx}
                </span>
                <span style={{ color: 'rgba(255,200,120,0.6)', fontSize: 12, textAlign: 'right' }}>
                  ₹{yestPx}
                </span>
                <span style={{ color: changeColor, fontSize: 12, fontWeight: 600, textAlign: 'right' }}>
                  {same ? '—' : `${up ? '▲' : '▼'} ${Math.abs(change)}%`}
                </span>
              </div>

              {/* Expanded 7-day chart */}
              {isExpanded && vegWeekData && (
                <div style={{
                  padding: '8px 12px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ color: 'rgba(255,200,100,0.6)', fontSize: 10, marginBottom: 4 }}>
                    7-Day Price Trend — {veg.name}
                  </div>
                  <SparkLine data={vegWeekData.trend} color={up ? '#FF6B35' : '#00CED1'} />

                  {/* Mini challenge */}
                  <div style={{
                    marginTop: 6, padding: '6px 8px', borderRadius: 6,
                    background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.2)',
                    color: 'rgba(255,220,100,0.85)', fontSize: 11,
                  }}>
                    🧮 {veg.name} price went from ₹{yestPx} to ₹{todayPx}.{' '}
                    {same
                      ? 'Price unchanged.'
                      : `Percentage ${up ? 'increase' : 'decrease'} = ${Math.abs(change)}%`}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <StatCard
          label="Most Expensive"
          value={(() => {
            const v = VEGETABLES.reduce((a, b) =>
              (today?.[a.id] ?? a.basePrice) > (today?.[b.id] ?? b.basePrice) ? a : b
            );
            return `${v.emoji} ₹${today?.[v.id] ?? v.basePrice}`;
          })()}
          color="#FF6B35"
        />
        <StatCard
          label="Most Affordable"
          value={(() => {
            const v = VEGETABLES.reduce((a, b) =>
              (today?.[a.id] ?? a.basePrice) < (today?.[b.id] ?? b.basePrice) ? a : b
            );
            return `${v.emoji} ₹${today?.[v.id] ?? v.basePrice}`;
          })()}
          color="#00CED1"
        />
        <StatCard
          label="Avg Price"
          value={`₹${(VEGETABLES.reduce((s, v) => s + (today?.[v.id] ?? v.basePrice), 0) / VEGETABLES.length).toFixed(0)}/kg`}
          color="#FFD700"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 8,
      background: color + '11', border: `1px solid ${color}33`,
      textAlign: 'center',
    }}>
      <div style={{ color: color + 'AA', fontSize: 9, marginBottom: 3 }}>{label}</div>
      <div style={{ color, fontSize: 13, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
