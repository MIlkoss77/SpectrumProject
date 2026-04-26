import React, { useEffect, useState, useMemo, useRef, memo } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, Target, Brain, Shield, BarChart3, AlertCircle, Info, ArrowRight, Gauge, Activity, Radio, Cpu, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/context/WebSocketContext'
import { getSolanaWhaleTransactions } from '@/services/blockchain/solscan'
import { getPolymarketOdds } from '@/services/providers/polymarket'
import { fetchPredictionSnapshot } from '@/services/providers/predictions'

// --- Bloomberg Style: Alpha Gap Bar ---
const AlphaGapBar = ({ polyVal, aiVal, edgeColor }) => {
    // Both are 0-100
    const mPos = `${polyVal}%`;
    const aPos = `${aiVal}%`;
    const gapWidth = Math.abs(aiVal - polyVal);
    const gapLeft = Math.min(aiVal, polyVal);

    return (
        <div style={{ width: '100%', padding: '40px 0 20px', position: 'relative' }}>
            {/* Axis Labels */}
            <div style={{ position: 'absolute', top: '10px', left: 0, fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Probability Spectrum</div>
            <div style={{ position: 'absolute', top: '10px', right: 0, fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>0% - 100%</div>

            {/* Main Axis Line */}
            <div style={{ height: '2px', width: '100%', background: 'rgba(255,255,255,0.05)', position: 'relative', borderRadius: '4px' }}>
                
                {/* The Alpha Gap Highlight */}
                <motion.div 
                    animate={{ 
                        opacity: gapWidth > 5 ? 1 : 0.3,
                        left: `${gapLeft}%`,
                        width: `${gapWidth}%`,
                        background: `linear-gradient(90deg, transparent 0%, ${edgeColor}44 50%, transparent 100%)`
                    }}
                    transition={{ type: 'spring', stiffness: 40, damping: 20 }}
                    style={{ position: 'absolute', height: '16px', top: '-7px', borderRadius: '8px', zIndex: 1 }}
                />

                {/* Market Marker [M] */}
                <motion.div 
                    animate={{ left: mPos }}
                    transition={{ type: 'spring', stiffness: 50, damping: 25 }}
                    style={{ position: 'absolute', top: '-22px', marginLeft: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
                >
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#00FFFF', background: 'rgba(0,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(0,255,255,0.2)', marginBottom: '4px' }}>MARKET</div>
                    <div style={{ width: '2px', height: '12px', background: '#00FFFF' }} />
                </motion.div>

                {/* AI Marker [A] */}
                <motion.div 
                    animate={{ left: aPos }}
                    transition={{ type: 'spring', stiffness: 50, damping: 25 }}
                    style={{ position: 'absolute', top: '12px', marginLeft: '-15px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}
                >
                    <div style={{ width: '2px', height: '12px', background: '#fff', boxShadow: '0 0 10px #fff' }} />
                    <div style={{ fontSize: '9px', fontWeight: 900, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', marginTop: '4px' }}>SPECTR</div>
                </motion.div>
            </div>
        </div>
    );
};

export default function Predictor() {
    const { tickers } = useWebSocket()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState({
        aiTrueProb: 50,
        polyProb: 50,
        valueIndex: 0,
        verdict: 'CONSENSUS CALIBRATING',
        polyTitle: 'Bitcoin Prediction Market',
        status: 'STANDBY'
    })

    const isAnalyzingRef = useRef(false)
    const lastUpdateRef = useRef(0)
    const historyRef = useRef([])

    useEffect(() => {
        const analyze = async () => {
            if (isAnalyzingRef.current) return
            const now = Date.now()
            if (now - lastUpdateRef.current < 12000) return // Throttled to 12s for institutional stability

            isAnalyzingRef.current = true
            try {
                // 1. Data Ingestion
                const [whales, polyData, predictions] = await Promise.all([
                    getSolanaWhaleTransactions(),
                    getPolymarketOdds('Bitcoin'),
                    fetchPredictionSnapshot({ symbols: ['BTCUSDT'] })
                ]);

                // 2. Consensus Engine Logic
                // a) Technical Delta
                const btc = tickers['btcusdt']
                let techScore = 50
                if (btc) {
                    const change = parseFloat(btc.changePercent)
                    techScore = 50 + (change * 12)
                }

                // b) Whale Acceleration (Mocked complexity)
                const inflow = whales.filter(w => w.transaction_type === 'inflow').length
                const outflow = whales.filter(w => w.transaction_type === 'outflow').length
                const whaleMomentum = (outflow - inflow) * 10 + 50
                
                // c) Neural Weight
                let mlScore = 50
                const btc4h = predictions.find(p => p.symbol === 'BTCUSDT' && p.horizon === '4h')
                if (btc4h) mlScore = btc4h.probUp * 100

                // 3. Narrative consensus calculation (Bloomberg standard)
                const baseAIP = (techScore * 0.20) + (whaleMomentum * 0.30) + (mlScore * 0.50);
                
                // Narrative context simulation (using poly discrepancy to simulate finding edge)
                const polyMarketProb = polyData.odds;
                const aiTrueProb = Math.round(Math.max(0, Math.min(100, baseAIP)));
                const valueIndex = aiTrueProb - polyMarketProb;

                // Final Verdict Logic
                let verdict = 'NEUTRAL CONSENSUS';
                if (valueIndex > 15) verdict = 'MAJOR INFO GAP (BUY)';
                else if (valueIndex > 7) verdict = 'ALPHA DISCOVERY';
                else if (valueIndex < -15) verdict = 'SPECULATIVE BUBBLE (SELL)';
                else if (valueIndex < -7) verdict = 'MARKET OVEREXTENDED';

                setData({
                    aiTrueProb,
                    polyProb: polyMarketProb,
                    valueIndex,
                    verdict,
                    polyTitle: polyData.title.length > 40 ? polyData.title.substring(0, 38) + '...' : polyData.title,
                    status: 'LIVE DATA FEED'
                });

                lastUpdateRef.current = now
                setLoading(false)
            } catch (err) {
                console.error("Consensus Error:", err)
            } finally {
                isAnalyzingRef.current = false
            }
        }

        if (Object.keys(tickers).length > 0) analyze()
    }, [tickers])

    const edgeColor = data.valueIndex > 7 ? '#00E396' : data.valueIndex < -7 ? '#FF4560' : '#00FFFF';

    return (
        <div className="dx-card" style={{
            background: 'rgba(10, 10, 15, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${edgeColor}30`,
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '24px',
            boxShadow: `0 0 40px ${edgeColor}10`
        }}>
            {/* Visual focal point glow */}
            <div style={{ position: 'absolute', top: -50, right: -50, width: '150px', height: '150px', background: `${edgeColor}15`, filter: 'blur(60px)', borderRadius: '100%', pointerEvents: 'none' }} />

            {/* Header Line - More compact */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '3px' }}>
                        <div style={{ width: '3px', height: '12px', background: '#fff', borderRadius: '1px' }} />
                        <div style={{ width: '3px', height: '12px', background: edgeColor, borderRadius: '1px' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.2em', opacity: 0.8 }}>CONSENSUS TERMINAL v4.5</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: edgeColor, boxShadow: `0 0 8px ${edgeColor}` }} />
                        <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{data.status}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: { base: '1fr', lg: '1fr 0.8fr' }, gap: '24px' }}>
                {/* Visual Section: The Alpha Bar */}
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                       <div>
                            <h2 style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>Gap Analysis</h2>
                            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                                {data.verdict}
                            </h1>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Discrepancy</div>
                            <div style={{ fontSize: '18px', fontWeight: 900, color: edgeColor, fontFamily: 'var(--font-mono)' }}>{data.valueIndex > 0 ? '+' : ''}{data.valueIndex}%</div>
                       </div>
                    </div>
                    
                    <AlphaGapBar polyVal={data.polyProb} aiVal={data.aiTrueProb} edgeColor={edgeColor} />
                </div>

                {/* Data Section: Factor breakdown - More compact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Spectr AI</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{data.aiTrueProb}%</span>
                                <Cpu size={12} color={edgeColor} />
                            </div>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '8px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: '4px' }}>Market</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#00FFFF', fontFamily: 'var(--font-mono)' }}>{data.polyProb}%</span>
                                <Globe size={12} color="#00FFFF" />
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div animate={{ width: `${Math.min(Math.abs(data.valueIndex) * 3, 100)}%` }} style={{ height: '100%', background: edgeColor, borderRadius: '4px', boxShadow: `0 0 10px ${edgeColor}` }} />
                    </div>
                </div>
            </div>

            {loading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,15,0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Activity className="animate-spin" size={24} color={edgeColor} />
                        <span style={{ fontSize: '9px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.3em' }}>Calibrating Consensus...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
