import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { calculateLeveragePnL } from '@/services/ai/opportunityEngine';

const PRESETS = [
    { symbol: 'BTC', price: 97500, label: 'Bitcoin' },
    { symbol: 'ETH', price: 3420, label: 'Ethereum' },
    { symbol: 'SOL', price: 148, label: 'Solana' },
];

export default function LeverageCalculator() {
    const { t } = useTranslation();
    const [investment, setInvestment] = useState(1000);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const [direction, setDirection] = useState('LONG');
    const [movePercent, setMovePercent] = useState(5);

    const preset = PRESETS[selectedPreset];
    const entry = preset.price;
    const target = direction === 'LONG'
        ? Math.round(entry * (1 + movePercent / 100) * 100) / 100
        : Math.round(entry * (1 - movePercent / 100) * 100) / 100;

    const scenarios = useMemo(() =>
        calculateLeveragePnL({ entry, target, investment, direction }),
        [entry, target, investment, direction]
    );

    const getRiskColor = (risk) => {
        switch (risk) {
            case 'LOW': return '#00E396';
            case 'MEDIUM': return '#00FFFF';
            case 'HIGH': return '#FEB019';
            case 'EXTREME': return '#FF4560';
            default: return '#8899A6';
        }
    };

    return (
        <div className="action-card" style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calculator size={18} color="#00FFFF" />
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>{t('ui.leverage_calc') || 'Leverage PnL Calculator'}</h3>
                </div>
                <span style={{
                    fontSize: '9px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px',
                    background: 'rgba(0,255,255,0.08)', color: '#00FFFF',
                    border: '1px solid rgba(0,255,255,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>{t('ui.pro_tool') || 'PRO TOOL'}</span>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-3 mb-4">
                {/* Asset selector */}
                <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t('ui.asset_label') || 'Asset'}</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {PRESETS.map((p, i) => (
                            <button
                                key={p.symbol}
                                onClick={() => setSelectedPreset(i)}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${i === selectedPreset ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                                    background: i === selectedPreset ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                                    color: i === selectedPreset ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >{p.symbol}</button>
                        ))}
                    </div>
                </div>

                {/* Direction */}
                <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t('ui.direction_label') || 'Direction'}</label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {['LONG', 'SHORT'].map(d => (
                            <button
                                key={d}
                                onClick={() => setDirection(d)}
                                style={{
                                    flex: 1,
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: `1px solid ${direction === d ? (d === 'LONG' ? 'rgba(0,227,150,0.4)' : 'rgba(255,69,96,0.4)') : 'rgba(255,255,255,0.08)'}`,
                                    background: direction === d ? (d === 'LONG' ? 'rgba(0,227,150,0.1)' : 'rgba(255,69,96,0.1)') : 'rgba(255,255,255,0.03)',
                                    color: direction === d ? (d === 'LONG' ? '#00E396' : '#FF4560') : 'rgba(255,255,255,0.5)',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: "'Inter', sans-serif",
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                }}
                            >
                                {d === 'LONG' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Investment */}
                <div>
                    <label style={{ display: 'block', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{t('ui.investment_label') || 'Investment ($)'}</label>
                    <input
                        type="number"
                        value={investment}
                        onChange={e => setInvestment(Number(e.target.value) || 0)}
                        style={{
                            width: '100%',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#fff',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            </div>

            {/* Target Move Slider */}
            <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('ui.target_move') || 'Target Move'}</span>
                    <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: direction === 'LONG' ? '#00E396' : '#FF4560' }}>
                        {direction === 'LONG' ? '+' : '-'}{movePercent}% → ${target.toLocaleString()}
                    </span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="20"
                    value={movePercent}
                    onChange={e => setMovePercent(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#00FFFF' }}
                />
                <div className="font-mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
                    <span>1%</span>
                    <span>Entry: ${entry.toLocaleString()}</span>
                    <span>20%</span>
                </div>
            </div>

            {/* PnL Table */}
            <div className="overflow-x-auto" style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ minWidth: '420px' }}>
                    {/* Header Row */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.03)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        {[t('ui.leverage') || 'Leverage', t('ui.position') || 'Position', t('ui.pnl') || 'PnL', t('ui.roi') || 'ROI', t('ui.liquidation') || 'Liquidation'].map(h => (
                            <span key={h} style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
                        ))}
                    </div>

                    {/* Data Rows */}
                    {scenarios.map((s, i) => (
                        <div
                            key={s.leverage}
                            style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                padding: '10px 14px',
                                borderBottom: i < scenarios.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                background: s.pnl > 0 ? `rgba(0,227,150,${0.02 + i * 0.01})` : `rgba(255,69,96,${0.02 + i * 0.01})`,
                                transition: 'background 0.3s',
                            }}
                        >
                            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{s.leverage}x</span>
                            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>${s.positionSize.toLocaleString()}</span>
                            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: s.pnl >= 0 ? '#00E396' : '#FF4560' }}>
                                {s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}
                            </span>
                            <span className="font-mono" style={{ fontSize: '11px', fontWeight: 700, color: s.pnlPercent >= 0 ? '#00E396' : '#FF4560' }}>
                                {s.pnlPercent >= 0 ? '+' : ''}{s.pnlPercent}%
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="font-mono" style={{ fontSize: '11px', fontWeight: 600, color: getRiskColor(s.risk) }}>
                                    ${s.liquidationPrice.toLocaleString()}
                                </span>
                                {(s.risk === 'HIGH' || s.risk === 'EXTREME') && <AlertTriangle size={10} color={getRiskColor(s.risk)} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Risk Warning */}
            <div style={{
                marginTop: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(255,69,96,0.05)',
                border: '1px solid rgba(255,69,96,0.1)',
                display: 'flex', alignItems: 'center', gap: '8px',
            }}>
                <AlertTriangle size={14} color="#FF4560" />
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Inter', sans-serif" }}>
                    {t('ui.leverage_warning') || 'High leverage amplifies both gains and losses. Never risk more than you can afford to lose.'}
                </span>
            </div>
        </div>
    );
}
