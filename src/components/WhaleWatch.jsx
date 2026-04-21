import React, { useEffect, useState, memo } from 'react'
import { getWhaleAlerts } from '@/services/providers/whales.js'
import { ChevronRight, ArrowDownLeft, ArrowUpRight, Box, DollarSign, Activity, Zap, TrendingUp, TrendingDown, Crosshair, Globe, CreditCard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function formatMoney(amount) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
}

// --- Sub-Components ---

const StatBox = ({ label, value, sub, color }) => (
    <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '4px', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ fontSize: '15px', fontWeight: 900, color: color || '#fff' }}>{value}</div>
        {sub && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{sub}</div>}
    </div>
);

const WhaleItem = memo(({ alert }) => {
    const isDumpRisk = alert.transaction_type === 'inflow';
    const color = isDumpRisk ? '#FF4560' : alert.transaction_type === 'outflow' ? '#00E396' : '#00FFFF';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '14px',
                borderLeft: `4px solid ${color}`,
                transition: 'all 0.2s ease',
                cursor: 'pointer'
            }}
            whileHover={{ background: 'rgba(255,255,255,0.04)', transform: 'translateY(-2px)' }}
        >
            <div style={{ 
                width: '32px', height: '32px', borderRadius: '10px', 
                background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
                {isDumpRisk ? <ArrowDownLeft size={16} color={color} /> : <ArrowUpRight size={16} color={color} />}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{alert.amount.toLocaleString()} {alert.symbol}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{formatMoney(alert.amount_usd)}</span>
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                    {alert.from_wallet.substring(0, 10)}... → {alert.to_wallet.substring(0, 10)}...
                </div>
            </div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '9px', fontWeight: 900, color, textTransform: 'uppercase' }}>{isDumpRisk ? 'INFLOW' : 'OUTFLOW'}</div>
                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', marginTop: '2px' }}>{Math.floor((Date.now() - alert.timestamp) / 60000)}m ago</div>
            </div>
        </motion.div>
    );
});

// --- Main Dashboard ---

export default function WhaleWatch() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState('feed') // 'feed' or 'hot'

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 45000)
        return () => clearInterval(interval)
    }, [])

    async function loadData() {
        try {
            const result = await getWhaleAlerts()
            setData(result)
        } catch (e) {
            console.error("Whale fetch error", e)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !data) {
        return (
            <div className="premium-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Activity className="animate-spin text-cyan-400" size={32} />
            </div>
        );
    }

    const { stats, alerts, hotAddresses } = data;

    return (
        <div className="premium-card" style={{ height: '100%', minHeight: '520px', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} style={{ color: '#00FFFF' }} />
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Whale Intelligence</h3>
                </div>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px' }}>
                    <button 
                        onClick={() => setView('feed')}
                        style={{ 
                            padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '10px', 
                            fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                            background: view === 'feed' ? '#00FFFF' : 'transparent',
                            color: view === 'feed' ? '#000' : 'rgba(255,255,255,0.4)'
                        }}
                    >FEED</button>
                    <button 
                        onClick={() => setView('hot')}
                        style={{ 
                            padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '10px', 
                            fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                            background: view === 'hot' ? '#00FFFF' : 'transparent',
                            color: view === 'hot' ? '#000' : 'rgba(255,255,255,0.4)'
                        }}
                    >HOT WALLETS</button>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <StatBox 
                    label="24h Net Flow" 
                    value={formatMoney(Math.abs(stats.netFlow))} 
                    sub={stats.sentiment}
                    color={stats.netFlow > 0 ? '#00E396' : '#FF4560'}
                />
                <StatBox 
                    label="Network Share" 
                    value={`${stats.distribution.solana}% SOL`} 
                    sub={`${stats.distribution.ethereum}% ETH`}
                    color="#00FFFF"
                />
            </div>

            {/* Active Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence mode="wait">
                    {view === 'feed' ? (
                        <div key="feed" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {alerts.map((alert) => (
                                <WhaleItem key={alert.id} alert={alert} />
                            ))}
                        </div>
                    ) : (
                        <div key="hot" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {hotAddresses.map((hot, i) => (
                                <motion.div
                                    key={hot.address}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{ 
                                        padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Crosshair size={18} color="#00FFFF" opacity="0.6" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{hot.address.substring(0, 12)}...</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{hot.chain} // {hot.count} txs</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>{formatMoney(hot.totalUsd)}</div>
                                        <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Volume</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>
                    On-Chain Mempool Observer // Spectr Logic v2.5
                </span>
            </div>
        </div>
    )
}
