import React, { useEffect, useState } from 'react'
import { getWhaleAlerts } from '@/services/providers/whales.js'
import { ArrowRight, ArrowDownLeft, ArrowUpRight, Box, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import NumberTicker from './NumberTicker'

function formatMoney(amount) {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount}`
}

export default function WhaleWatch() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
        const interval = setInterval(loadData, 30000) // Refresh every 30s
        return () => clearInterval(interval)
    }, [])

    async function loadData() {
        try {
            const data = await getWhaleAlerts()
            setAlerts(data)
        } catch (e) {
            console.error("Whale fetch error", e)
        } finally {
            setLoading(false)
        }
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'inflow': return <ArrowDownLeft size={16} color="#ff3b30" /> // Exchange Inflow (Bearish usually)
            case 'outflow': return <ArrowUpRight size={16} color="#4caf50" /> // Exchange Outflow (Bullish)
            case 'mint': return <DollarSign size={16} color="#00FFFF" /> // Minting
            default: return <ArrowRight size={16} color="#888" /> // Transfer
        }
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'inflow': return 'Exchange Inflow'
            case 'outflow': return 'Exchange Outflow'
            case 'mint': return 'Minted'
            default: return 'Transfer'
        }
    }

    const getExplorerLink = (alert) => {
        if (alert.blockchain === 'ethereum') {
            return `https://etherscan.io/tx/${alert.txHash}`;
        } else if (alert.blockchain === 'solana') {
            return `https://solscan.io/tx/${alert.txHash}`;
        }
        return '#';
    }

    return (
        <div className="premium-card" style={{ height: '100%', minHeight: 400 }}>
            <div className="card-header">
                <h3>🐋 Whale Watch</h3>
                <span className="badge live">LIVE ON-CHAIN</span>
            </div>

            <div className="whale-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {loading && <div className="dx-empty">Scanning mempool...</div>}

                <AnimatePresence>
                    {!loading && alerts.map((alert, i) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: 8,
                                borderLeft: `3px solid ${alert.transaction_type === 'inflow' ? '#ff3b30' : alert.transaction_type === 'outflow' ? '#4caf50' : '#00FFFF'}`
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                                    {getTypeIcon(alert.transaction_type)}
                                    <span>{alert.amount.toLocaleString()} {alert.symbol}</span>
                                    <span style={{ color: '#888', fontWeight: 400 }}>({formatMoney(alert.amount_usd)})</span>
                                </div>
                                <div style={{ fontSize: 11, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {alert.from_wallet} <ArrowRight size={10} /> {alert.to_wallet}
                                </div>
                                {alert.txHash && (
                                    <a
                                        href={getExplorerLink(alert)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: 10, color: 'var(--accent)', textDecoration: 'none' }}
                                    >
                                        View on {alert.blockchain === 'ethereum' ? 'Etherscan' : 'Solscan'} →
                                    </a>
                                )}
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontSize: 10,
                                    textTransform: 'uppercase',
                                    color: alert.transaction_type === 'inflow' ? '#ff3b30' : alert.transaction_type === 'outflow' ? '#4caf50' : '#888',
                                    fontWeight: 700,
                                    marginBottom: 2
                                }}>
                                    {getTypeLabel(alert.transaction_type)}
                                </div>
                                <div style={{ fontSize: 10, color: '#444' }}>
                                    {Math.floor((Date.now() - alert.timestamp) / 60000)}m ago
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}
