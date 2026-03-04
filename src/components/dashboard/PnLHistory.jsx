import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

const SAMPLE_DATA = [
    100, 102, 98, 105, 110, 108, 115, 120, 118, 125,
    130, 128, 135, 140, 138, 145, 142, 150, 155, 160,
    158, 165, 170, 168, 175, 180, 178, 185, 190, 195
];

export default function PnLHistory() {
    const data = SAMPLE_DATA;
    const w = 600, h = 160;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = useMemo(() => {
        return data.map((v, i) => ({
            x: (i / (data.length - 1)) * w,
            y: h - ((v - min) / range) * (h - 20) - 10,
        }));
    }, [data]);

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const fillPath = linePath + ` L${w},${h} L0,${h} Z`;

    const totalReturn = ((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(1);

    return (
        <div className="action-card" style={{ minHeight: '320px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#00E396" />
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>PnL Analytics</h3>
                </div>
                <span className="font-mono" style={{
                    fontSize: '14px', fontWeight: 800, color: '#00E396',
                }}>+{totalReturn}%</span>
            </div>

            {/* Chart */}
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.02)', padding: '8px 0' }}>
                <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
                    <defs>
                        <linearGradient id="pnlGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00FFFF" stopOpacity="0.3" />
                            <stop offset="40%" stopColor="#6366f1" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FFFF" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                    {/* Fill */}
                    <path d={fillPath} fill="url(#pnlGrad)" />
                    {/* Line */}
                    <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {/* End dot */}
                    <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                </svg>
            </div>

            {/* Metrics */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                {[
                    { label: 'Max Drawdown', value: '-4.2%', color: '#FF4560' },
                    { label: 'Sharpe Ratio', value: '2.84', color: '#00FFFF' },
                    { label: 'Win Rate', value: '68%', color: '#00E396' },
                ].map(m => (
                    <div key={m.label} style={{
                        padding: '10px',
                        borderRadius: '12px',
                        background: `linear-gradient(145deg, ${m.color}08 0%, transparent 100%)`,
                        border: `1px solid ${m.color}15`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>{m.label}</div>
                        <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: m.color }}>{m.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
