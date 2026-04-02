import React, { useEffect, useState } from 'react'
import { alertService, ALERT_TYPES, ALERT_ACTIONS } from '@/services/alerts/aggregator'
import { useTrade } from '@/context/TradeContext'
import { Bell, Activity, ChevronRight, Zap, TrendingUp, TrendingDown, DollarSign, X, Calculator, Coins } from 'lucide-react'
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

const getPriorityColor = (p) => {
    if (p >= 9) return 'linear-gradient(90deg, #FF3B30 0%, #FF9500 100%)' // Critical
    if (p >= 7) return 'rgba(255, 149, 0, 0.2)' // High
    return 'rgba(255, 255, 255, 0.05)' // Normal
}

export default function Alerts() {
    const [alerts, setAlerts] = useState([])
    const { openTrade } = useTrade()

    useEffect(() => {
        const unsub = alertService.subscribe(setAlerts)
        return unsub
    }, [])

    const topAlerts = alerts.filter(a => a.priority >= 8)
    const feedAlerts = alerts.filter(a => a.priority < 8)

    return (
        <div className="w-full animate-in">
            {/* ═══ Hero ═══ */}
            <div className="overview-hero">
                <div className="hero-header">
                    <div className="hero-title">
                        <Bell size={18} className="text-cyan-400" />
                        <span>Smart Alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            LIVE NEURAL FEED
                        </div>
                    </div>
                </div>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">Market Intelligence</h1>
                <p className="text-sm text-white/40 max-w-xl">
                    Real-time AI curated opportunities detected from whale flows, social sentiment, and cross-exchange arbitrage patterns.
                </p>
            </div>

            {/* ═══ Alerts Feed ═══ */}
            <div className="dx-grid-premium mt-8">
                {alerts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/20 font-bold italic">
                        No active alerts. Neural engines are scanning the deep-well...
                    </div>
                )}

                {alerts.map((alert, idx) => {
                    const isHigh = alert.priority >= 8
                    const glowColor = isHigh ? (alert.priority >= 9 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)') : 'rgba(34, 211, 238, 0.2)'
                    const borderColor = isHigh ? (alert.priority >= 9 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)') : 'rgba(255,255,255,0.05)'

                    return (
                        <div key={alert.id}
                            className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                            style={{
                                borderColor: borderColor,
                                background: 'rgba(20, 20, 25, 0.7)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                minHeight: '280px'
                            }}>

                            {/* Priority Glow */}
                            <div className="absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl" style={{ background: glowColor }} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                                            {getIcon(alert.type)}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-widest">{alert.symbol}</div>
                                            <div className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">{alert.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-white/30 font-mono">{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <div className={`dx-tag ${isHigh ? 'text-amber-400 border-amber-500/20' : 'text-white/40 border-white/10'}`}>
                                            {alert.priority}/10
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm font-bold text-white mb-2 leading-tight">{alert.title}</h3>
                                    <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">
                                        {alert.description}
                                    </p>
                                    {/* Opportunity: Lever PnL Preview */}
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

                                <div className="mt-auto pt-6 flex gap-2">
                                    <button
                                        onClick={() => openTrade({ symbol: alert.symbol, price: alert.metadata?.price || 0, action: alert.action })}
                                        className="flex-1 py-2 rounded-lg text-black font-black text-[10px] uppercase tracking-tighter transition-all flex items-center justify-center gap-1"
                                        style={{
                                            background: alert.metadata?.opportunityType ? 'linear-gradient(135deg, #00FFFF, #6366f1)' : '#00FFFF',
                                            boxShadow: '0 0 15px rgba(0,255,255,0.2)',
                                        }}
                                    >
                                        {alert.action === 'STAKE' ? <><Coins size={14} /> Stake Now</> : <>Execute Trade <ChevronRight size={14} /></>}
                                    </button>
                                    <button
                                        onClick={() => alertService.dismiss(alert.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                    >
                                        <X size={14} className="text-white/40" />
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
