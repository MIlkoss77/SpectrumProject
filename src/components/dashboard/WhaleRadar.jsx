import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ArrowRightLeft, ExternalLink } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

// Simulated whale transactions — in production, this would come from Etherscan/Solscan APIs
const BASE_TXS = [
    { asset: 'BTC', from: 'Unknown', to: 'Binance', type: 'DEPOSIT', signal: 'BEARISH' },
    { asset: 'ETH', from: 'Unknown', to: 'Kraken', type: 'DEPOSIT', signal: 'BEARISH' },
    { asset: 'SOL', from: 'FTX Estate', to: 'Coinbase', type: 'DEPOSIT', signal: 'BEARISH' },
    { asset: 'USDT', from: 'Tether Treasury', to: 'Unknown', type: 'MINT', signal: 'BULLISH' },
    { asset: 'PEPE', from: 'Unknown', to: 'Uniswap v3', type: 'DEX SWAP', signal: 'NEUTRAL' },
    { asset: 'BTC', from: 'MicroStrategy', to: 'Custody', type: 'WITHDRAWAL', signal: 'BULLISH' },
    { asset: 'USDC', from: 'Circle', to: 'OKX', type: 'MINT', signal: 'NEUTRAL' },
    { asset: 'ETH', from: 'Whale 0x7a2', to: 'Binance', type: 'DEPOSIT', signal: 'BEARISH' },
    { asset: 'BTC', from: 'MicroStrategy', to: 'Custody', type: 'WITHDRAWAL', signal: 'BULLISH' },
    { asset: 'USDC', from: 'Circle', to: 'OKX', type: 'MINT', signal: 'NEUTRAL' },
];

function generateTx(template) {
    const amounts = {
        BTC: () => +(50 + Math.random() * 2000).toFixed(2),
        ETH: () => +(500 + Math.random() * 15000).toFixed(1),
        SOL: () => +(5000 + Math.random() * 200000).toFixed(0),
        USDT: () => +(1000000 + Math.random() * 50000000).toFixed(0),
        USDC: () => +(500000 + Math.random() * 20000000).toFixed(0),
        PEPE: () => +(1000000000 + Math.random() * 50000000000).toFixed(0),
    };
    const prices = { BTC: 97500, ETH: 3420, SOL: 148, USDT: 1, USDC: 1, PEPE: 0.000007 };
    const amount = amounts[template.asset]();
    const usdValue = amount * prices[template.asset];

    return {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        ...template,
        amount,
        usdValue,
        time: Date.now() - Math.random() * 3600000, // within last hour
        hash: '0x' + [...Array(8)].map(() => Math.floor(Math.random() * 16).toString(16)).join('') + '...',
    };
}

export default function WhaleRadar({ symbol }) {
    // Generate initial state
    const [transactions, setTransactions] = useState(() =>
        BASE_TXS.slice(0, 5).map(t => generateTx(t))
    );
    const [filter, setFilter] = useState('ALL');

    // Live Event Simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setTransactions(prev => {
                const randomBase = BASE_TXS[Math.floor(Math.random() * BASE_TXS.length)];
                const newTx = generateTx(randomBase);
                // Keep the list to 5 items, adding the new one to the front
                return [newTx, ...prev.slice(0, 4)];
            });
        }, 4500); // 4.5 seconds
        return () => clearInterval(interval);
    }, []);

    const filteredTxs = symbol
        ? transactions.filter(t => t.asset.includes(symbol.replace('USDT', '')))
        : transactions;

    const formatUsd = (v) => {
        if (v >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
        if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
        if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
        return '$' + v.toFixed(0);
    };

    const timeAgo = (ts) => {
        const mins = Math.floor((Date.now() - ts) / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        return `${Math.floor(mins / 60)}h ago`;
    };

    const signalStyles = {
        BULLISH: { color: '#00E396', bg: 'rgba(0,227,150,0.08)', border: 'rgba(0,227,150,0.2)', icon: <TrendingUp size={10} /> },
        BEARISH: { color: '#FF4560', bg: 'rgba(255,69,96,0.08)', border: 'rgba(255,69,96,0.2)', icon: <TrendingDown size={10} /> },
        NEUTRAL: { color: '#8899A6', bg: 'rgba(136,153,166,0.08)', border: 'rgba(136,153,166,0.2)', icon: <ArrowRightLeft size={10} /> },
    };

    const typeLabels = {
        WITHDRAWAL: '🏦→👛', DEPOSIT: '👛→🏦', DEX: '🔄 DEX', DEFI: '📦 DeFi', MINT: '🖨️ Mint', STAKE: '📌 Stake', 'DEX SWAP': '🔄 DEX'
    };

    return (
        <div className="action-card" style={{ padding: '20px', minHeight: '300px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🐋</span>
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: 0, fontFamily: "'Inter', sans-serif" }}>Whale Transactions</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00E396', animation: 'pulse 2s infinite', boxShadow: '0 0 6px #00E396' }} />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#00E396', textTransform: 'uppercase', letterSpacing: '0.5px' }}>LIVE</span>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                {['ALL', 'BULLISH', 'BEARISH'].map(f => {
                    const active = filter === f;
                    const col = f === 'BULLISH' ? '#00E396' : f === 'BEARISH' ? '#FF4560' : '#ffffff';
                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '4px 10px', borderRadius: '6px', fontSize: '9px', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer',
                                background: active ? col + '15' : 'transparent',
                                border: `1px solid ${active ? col + '40' : 'rgba(255,255,255,0.06)'}`,
                                color: active ? col : 'rgba(255,255,255,0.3)',
                                transition: 'all 0.2s', fontFamily: "'Inter', sans-serif",
                            }}
                        >{f}</button>
                    );
                })}
            </div>

            {/* Transactions List */}
            <div style={{ padding: '0 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
                <AnimatePresence initial={false}>
                    {filteredTxs.length > 0 ? filteredTxs.map((tx, i) => {
                        const s = signalStyles[tx.signal] || signalStyles.NEUTRAL;
                        return (
                            <motion.div
                                key={tx.id}
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="group relative"
                                style={{
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Hover Gradient */}
                                <div style={{
                                    position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.3s',
                                    background: `linear-gradient(90deg, ${s.bg} 0%, transparent 100%)`,
                                    pointerEvents: 'none'
                                }} className="group-hover:opacity-100" />

                                {/* Asset badge */}
                                <div className="font-mono" style={{
                                    minWidth: '36px', height: '36px', borderRadius: '10px',
                                    background: s.bg, border: `1px solid ${s.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '12px', fontWeight: 800, color: s.color,
                                    position: 'relative', zIndex: 1
                                }}>
                                    {tx.asset}
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                        <span className="font-mono" style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                                            {tx.amount.toLocaleString()} {tx.asset}
                                        </span>
                                        <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                                            ({formatUsd(tx.usdValue)})
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {typeLabels[tx.type]} {tx.from} &rarr; {tx.to}
                                    </div>
                                </div>

                                {/* Signal + time */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', position: 'relative', zIndex: 1 }}>
                                    <span style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '3px',
                                        padding: '2px 8px', borderRadius: '5px', fontSize: '8px', fontWeight: 700,
                                        textTransform: 'uppercase', letterSpacing: '0.5px',
                                        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                                    }}>
                                        {s.icon} {tx.signal}
                                    </span>
                                    <span className="font-mono" style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>
                                        {timeAgo(tx.time)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    }) : (
                        <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Searching the mempool...
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
