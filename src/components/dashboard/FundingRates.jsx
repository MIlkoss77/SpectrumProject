import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

const FUNDING_DATA = [
    { symbol: 'BTC', rate: 0.0001, predicted: 0.00012, history: [] },
    { symbol: 'ETH', rate: 0.00015, predicted: 0.0001, history: [] },
    { symbol: 'SOL', rate: -0.0003, predicted: -0.00025, history: [] },
    { symbol: 'BNB', rate: 0.00008, predicted: 0.0001, history: [] },
    { symbol: 'TON', rate: 0.0005, predicted: 0.0004, history: [] },
];

// Generate mock funding history
function generateHistory() {
    return Array.from({ length: 24 }, (_, i) => ({
        time: i,
        rate: (Math.random() - 0.45) * 0.001,
    }));
}

export default function FundingRates() {
    const [data, setData] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);

    useEffect(() => {
        // Simulate live funding data
        const enriched = FUNDING_DATA.map(d => ({
            ...d,
            rate: d.rate + (Math.random() - 0.5) * 0.0001,
            predicted: d.predicted + (Math.random() - 0.5) * 0.0001,
            history: generateHistory(),
            annualized: 0,
        }));
        enriched.forEach(d => {
            d.annualized = Math.round(d.rate * 3 * 365 * 100 * 100) / 100;
        });
        setData(enriched);

        const interval = setInterval(() => {
            setData(prev => prev.map(d => ({
                ...d,
                rate: d.rate + (Math.random() - 0.5) * 0.00005,
                annualized: Math.round((d.rate + (Math.random() - 0.5) * 0.00005) * 3 * 365 * 100 * 100) / 100,
            })));
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const selected = data[selectedIdx];

    // Mini sparkline for history
    const HistoryChart = ({ history, width = 120, height = 32 }) => {
        if (!history || history.length < 2) return null;
        const rates = history.map(h => h.rate);
        const min = Math.min(...rates);
        const max = Math.max(...rates);
        const range = max - min || 0.0001;

        const points = rates.map((r, i) => {
            const x = (i / (rates.length - 1)) * width;
            const y = height - ((r - min) / range) * (height - 4) - 2;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');

        return (
            <svg width={width} height={height} style={{ display: 'block' }}>
                <polyline points={points} fill="none" stroke={rates[rates.length - 1] >= 0 ? '#00E396' : '#FF4560'} strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
        );
    };

    const getFundingColor = (rate) => {
        const abs = Math.abs(rate);
        if (abs > 0.0005) return '#FF4560';
        if (abs > 0.0002) return '#FEB019';
        return '#00E396';
    };

    const getFundingLabel = (rate) => {
        const abs = Math.abs(rate);
        if (abs > 0.0005) return 'EXTREME';
        if (abs > 0.0002) return 'ELEVATED';
        return 'NORMAL';
    };

    if (data.length === 0) return null;

    return (
        <div className="action-card" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DollarSign size={18} color="#FEB019" />
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>Funding Rates Monitor</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} color="rgba(255,255,255,0.3)" />
                    <span className="font-mono" style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                        Next: 4h 23m
                    </span>
                </div>
            </div>

            {/* Asset Rates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '16px' }}>
                {data.map((d, i) => {
                    const color = getFundingColor(d.rate);
                    const isSelected = i === selectedIdx;
                    return (
                        <button
                            key={d.symbol}
                            onClick={() => setSelectedIdx(i)}
                            style={{
                                padding: '10px 8px',
                                borderRadius: '12px',
                                border: `1px solid ${isSelected ? color + '40' : 'rgba(255,255,255,0.06)'}`,
                                background: isSelected ? color + '10' : 'rgba(255,255,255,0.02)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '4px', fontFamily: "'Inter', sans-serif" }}>{d.symbol}</div>
                            <div className="font-mono" style={{
                                fontSize: '13px', fontWeight: 800, color: color,
                            }}>
                                {d.rate >= 0 ? '+' : ''}{(d.rate * 100).toFixed(4)}%
                            </div>
                            <div style={{ fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', marginTop: '2px' }}>
                                {d.rate > 0 ? 'L→S' : 'S→L'}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Selected Detail */}
            {selected && (
                <div style={{
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: "'Inter', sans-serif" }}>
                                {selected.symbol}/USDT Perp
                            </div>
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                                {selected.rate > 0 ? 'Longs pay Shorts' : 'Shorts pay Longs'} • {getFundingLabel(selected.rate)}
                            </div>
                        </div>
                        <HistoryChart history={selected.history} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: getFundingColor(selected.rate) + '08', border: `1px solid ${getFundingColor(selected.rate)}15` }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Current</div>
                            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: getFundingColor(selected.rate) }}>
                                {(selected.rate * 100).toFixed(4)}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Predicted</div>
                            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: getFundingColor(selected.predicted) }}>
                                {(selected.predicted * 100).toFixed(4)}%
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Annualized</div>
                            <div className="font-mono" style={{ fontSize: '16px', fontWeight: 800, color: selected.annualized >= 0 ? '#00E396' : '#FF4560' }}>
                                {selected.annualized >= 0 ? '+' : ''}{selected.annualized}%
                            </div>
                        </div>
                    </div>

                    {/* Income calculator */}
                    <div style={{
                        marginTop: '12px', padding: '12px 14px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(0,255,255,0.04) 0%, rgba(99,102,241,0.04) 100%)',
                        border: '1px solid rgba(0,255,255,0.1)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <Zap size={12} color="#00FFFF" />
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#00FFFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Earning Potential</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
                            {selected.rate < 0 ? (
                                <>Hold <strong style={{ color: '#00E396' }}>Long $10K</strong> → Earn <strong style={{ color: '#00E396' }}>${Math.abs(Math.round(10000 * selected.rate * 100) / 100)}</strong> every 8h from shorts paying you. That's <strong style={{ color: '#00E396' }}>${Math.abs(Math.round(10000 * selected.rate * 3 * 100) / 100)}/day</strong>.</>
                            ) : (
                                <>Hold <strong style={{ color: '#FF4560' }}>Short $10K</strong> → Earn <strong style={{ color: '#00E396' }}>${Math.abs(Math.round(10000 * selected.rate * 100) / 100)}</strong> every 8h from longs paying you. That's <strong style={{ color: '#00E396' }}>${Math.abs(Math.round(10000 * selected.rate * 3 * 100) / 100)}/day</strong>.</>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
