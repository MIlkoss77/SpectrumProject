import React, { useEffect, useState } from 'react'
import { alertService, ALERT_TYPES, ALERT_ACTIONS } from '@/services/alerts/aggregator'
import { useTrade } from '@/context/TradeContext'
import { Bell, Activity, ChevronRight, Zap, TrendingUp, TrendingDown, DollarSign, X, Calculator, Coins, Brain } from 'lucide-react'
import './dashboard.css'

// Helper for icons
const getIcon = (type) => {
    switch (type) {
        case ALERT_TYPES.WHALE: return <Activity size={20} color="#34C759" />
        case ALERT_TYPES.SENTIMENT: return <Zap size={20} color="#FFD700" />
        case ALERT_TYPES.TA: return <TrendingUp size={20} color="#00C7BE" />
        case ALERT_TYPES.ARBITRAGE: return <DollarSign size={20} color="#FF9500" />
        case ALERT_TYPES.OPPORTUNITY: return <Calculator size={20} color="#00FFFF" />
        default: return <Bell size={20} />
    }
}

const getTypeColor = (type) => {
    switch (type) {
        case ALERT_TYPES.WHALE: return '#34C759'
        case ALERT_TYPES.SENTIMENT: return '#FFD700'
        case ALERT_TYPES.TA: return '#00C7BE'
        case ALERT_TYPES.ARBITRAGE: return '#FF9500'
        case ALERT_TYPES.OPPORTUNITY: return '#00FFFF'
        default: return '#00FFFF'
    }
}

export default function Alerts() {
    const [alerts, setAlerts] = useState([])
    const { openTrade } = useTrade()

    useEffect(() => {
        const unsub = alertService.subscribe(setAlerts)
        return unsub
    }, [])

    return (
        <div className="w-full animate-in">
            {/* ═══ Hero ═══ */}
            <div className="overview-hero">
                <div className="hero-header">
                    <div className="hero-title">
                        <Bell size={20} className="text-cyan-400" />
                        <span className="tracking-widest font-bold text-sm uppercase">Smart Alerts</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 bg-cyan-500/5 border-cyan-500/20 text-cyan-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00FFFF]" />
                        LIVE NEURAL FEED
                    </div>
                </div>
                <p className="text-white/40 text-sm max-w-xl">
                    Real-time AI curated opportunities detected from whale flows, social sentiment, and cross-exchange arbitrage patterns.
                </p>
            </div>

            {/* ═══ Alerts Feed ═══ */}
            <div className="dx-grid-premium">
                {alerts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/20 font-bold italic">
                        No active alerts. Neural engines are scanning the deep-well...
                    </div>
                )}

                {alerts.map((alert) => {
                    const isHigh = alert.priority >= 8
                    const isCritical = alert.priority >= 9
                    const accentColor = isCritical
                        ? '#FF4560'
                        : isHigh
                        ? '#FEB019'
                        : getTypeColor(alert.type)

                    const borderColor = isCritical
                        ? 'rgba(255,69,96,0.2)'
                        : isHigh
                        ? 'rgba(254,176,25,0.2)'
                        : 'rgba(0,255,255,0.1)'

                    return (
                        <div
                            key={alert.id}
                            className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                            style={{
                                background: 'rgba(10, 10, 15, 0.6)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '16px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}
                        >
                            {/* Corner Glow */}
                            <div style={{
                                position: 'absolute',
                                top: -20,
                                left: -20,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: accentColor,
                                filter: 'blur(40px)',
                                opacity: isCritical ? 0.2 : 0.1,
                                pointerEvents: 'none'
                            }} />

                            {/* Top Row: Icon + Symbol + Time + Priority */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                                {/* Left: Icon & Symbol */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '12px',
                                        background: `${accentColor}18`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `1px solid ${accentColor}30`
                                    }}>
                                        {getIcon(alert.type)}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                                                {alert.symbol}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            <span style={{ color: accentColor }}>{alert.type}</span>
                                            <span style={{ color: 'rgba(255,255,255,0.3)' }}>• Alert</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Time + Priority badge */}
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>
                                        {alert.priority}/10
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Title & Description */}
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>
                                    {alert.title}
                                </h3>
                                <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}
                                   className="line-clamp-2">
                                    {alert.description}
                                </p>

                                {/* PnL Scenarios */}
                                {alert.metadata?.pnlScenarios && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px' }}>
                                        {alert.metadata.pnlScenarios.filter(s => [5, 25, 100].includes(s.leverage)).map(s => (
                                            <div key={s.leverage} style={{
                                                padding: '8px', borderRadius: '10px', textAlign: 'center',
                                                background: s.pnl >= 0 ? 'rgba(0,227,150,0.06)' : 'rgba(255,69,96,0.06)',
                                                border: `1px solid ${s.pnl >= 0 ? 'rgba(0,227,150,0.15)' : 'rgba(255,69,96,0.15)'}`,
                                            }}>
                                                <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>{s.leverage}x</div>
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: s.pnl >= 0 ? '#00E396' : '#FF4560', fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {s.pnl >= 0 ? '+' : ''}${s.pnl.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Funding Rate Info */}
                                {alert.metadata?.fundingImpact && (
                                    <div style={{
                                        marginTop: '10px', padding: '8px 12px', borderRadius: '10px',
                                        background: 'rgba(0,255,255,0.04)', border: '1px solid rgba(0,255,255,0.1)',
                                        fontSize: '11px', color: 'rgba(255,255,255,0.5)',
                                    }}>
                                        💰 Earn <strong style={{ color: '#00E396' }}>${alert.metadata.fundingImpact.total}/day</strong> on $10K position
                                    </div>
                                )}
                            </div>

                            {/* Priority Bar + Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, gap: '16px' }}>
                                {/* Priority confidence bar */}
                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Brain size={10} color="rgba(255,255,255,0.4)" />
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Priority</span>
                                        </div>
                                        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>{alert.priority * 10}%</span>
                                    </div>
                                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                        <div style={{ width: `${alert.priority * 10}%`, height: '100%', background: accentColor, borderRadius: '2px' }} />
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => openTrade({ symbol: alert.symbol, price: alert.metadata?.price || 0, action: alert.action })}
                                        style={{
                                            padding: '10px 16px',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${accentColor}40`,
                                            color: accentColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '10px',
                                            fontWeight: 800,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = `${accentColor}18`; e.currentTarget.style.borderColor = accentColor; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${accentColor}40`; }}
                                    >
                                        {alert.action === 'STAKE' ? <><Coins size={14} /> Stake</> : <><Zap size={14} color={accentColor} /> Execute</>}
                                    </button>
                                    <button
                                        onClick={() => alertService.dismiss(alert.id)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: 'rgba(255,255,255,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,69,96,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,69,96,0.3)'; e.currentTarget.style.color = '#FF4560'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
