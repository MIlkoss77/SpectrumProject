import React from 'react';
import { Target } from 'lucide-react';

export default function NeuralConfidence({ value = 82 }) {
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / 100) * circumference;
    const offset = circumference - progress;

    const getStatusColor = (v) => {
        if (v >= 80) return '#00E396';
        if (v >= 60) return '#00FFFF';
        if (v >= 40) return '#FEB019';
        return '#FF4560';
    };

    const getStatus = (v) => {
        if (v >= 80) return 'HIGH CONVICTION';
        if (v >= 60) return 'MODERATE';
        if (v >= 40) return 'CAUTIOUS';
        return 'LOW CONFIDENCE';
    };

    const color = getStatusColor(value);

    return (
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', minHeight: '320px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Target size={18} color="#00FFFF" />
                <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>Neural Confidence</h3>
            </div>

            {/* Gauge */}
            <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                    <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00FFFF" />
                            <stop offset="50%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                    </defs>
                    {/* Background */}
                    <circle cx="90" cy="90" r={radius} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                    {/* Progress */}
                    <circle
                        cx="90" cy="90" r={radius}
                        fill="transparent"
                        stroke="url(#gaugeGrad)"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                </svg>

                {/* Center Value */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center'
                }}>
                    <div className="font-mono" style={{
                        fontSize: '40px', fontWeight: 800,
                        color: '#fff',
                        lineHeight: 1
                    }}>{value}%</div>
                    <div style={{
                        fontSize: '9px', fontWeight: 700,
                        color: color,
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        marginTop: '4px',
                        fontFamily: "'Inter', sans-serif"
                    }}>Probability</div>
                </div>
            </div>

            {/* Status Details */}
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Model State</div>
                    <div style={{
                        fontSize: '11px', fontWeight: 700, color: color,
                        padding: '3px 10px', borderRadius: '6px',
                        background: color + '15', border: `1px solid ${color}30`
                    }}>{getStatus(value)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Signal Strength</div>
                    <div style={{
                        fontSize: '11px', fontWeight: 700, color: '#fff',
                        padding: '3px 10px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)'
                    }}>STRONG</div>
                </div>
            </div>
        </div>
    );
}
