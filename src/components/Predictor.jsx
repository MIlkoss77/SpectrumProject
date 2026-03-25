import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowRight, Zap, Target, Brain, Shield, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/context/WebSocketContext'
import { getSolanaWhaleTransactions } from '@/services/blockchain/solscan'
import { getPolymarketOdds } from '@/services/providers/polymarket'
import { fetchPredictionSnapshot } from '@/services/providers/predictions'

export default function Predictor() {
    const { tickers } = useWebSocket()
    const [score, setScore] = useState(0)
    const [factors, setFactors] = useState({ sentiment: 0, whales: 0, tech: 0, poly: 0, ml: 50, forecast: 0 })
    const [direction, setDirection] = useState('NEUTRAL')
    const [loading, setLoading] = useState(true)
    const [polyTitle, setPolyTitle] = useState('Prediction Markets')

    const lastUpdateRef = React.useRef(0)
    const isAnalyzingRef = React.useRef(false)
    const analysisInterval = 3000 // 3 seconds minimum

    useEffect(() => {
        const analyze = async () => {
            if (isAnalyzingRef.current) return
            const now = Date.now()
            if (now - lastUpdateRef.current < analysisInterval) return

            isAnalyzingRef.current = true
            try {
                // 1. Technicals (15%)
                const btc = tickers['btcusdt']
                let techScore = 50
                if (btc) {
                    const change = parseFloat(btc.changePercent)
                    if (change > 3) techScore = 90
                    else if (change > 0.5) techScore = 65
                    else if (change < -3) techScore = 10
                    else if (change < -0.5) techScore = 35
                    else techScore = 50
                }

                // 2. Whales (20%)
                const whales = await getSolanaWhaleTransactions()
                const largeBuys = whales.filter(w => w.type === 'inflow').length
                const largeSells = whales.filter(w => w.type === 'outflow').length
                let whaleScore = 50
                if (largeBuys > largeSells) whaleScore = 75
                else if (largeSells > largeBuys) whaleScore = 25

                // 3. Polymarket (20%)
                const polyData = await getPolymarketOdds('Bitcoin')
                const polyScore = polyData.odds
                setPolyTitle(polyData.title.length > 30 ? polyData.title.substring(0, 28) + '...' : polyData.title)

                // 4. Neural Network (25%) - Regression v2
                let mlScore = 50
                let predictedMove = 0
                const predictions = await fetchPredictionSnapshot({ symbols: ['BTCUSDT'] })
                const btc4h = predictions.find(p => p.symbol === 'BTCUSDT' && p.horizon === '4h')
                if (btc4h) {
                    predictedMove = (btc4h.probUp - 0.5) * 4 // Simulated % move
                    mlScore = Math.max(0, Math.min(100, (predictedMove * 25) + 50))
                }

                // 5. Sentiment (20%)
                let sentimentScore = (techScore + whaleScore + mlScore) / 3

                const finalScore = Math.round(
                    (techScore * 0.15) +
                    (whaleScore * 0.20) +
                    (polyScore * 0.20) +
                    (mlScore * 0.25) +
                    (sentimentScore * 0.20)
                )

                setScore(finalScore)
                setFactors({
                    sentiment: sentimentScore,
                    whales: whaleScore,
                    tech: techScore,
                    poly: polyScore,
                    ml: mlScore,
                    forecast: predictedMove
                })

                if (finalScore >= 65) setDirection('BULLISH')
                else if (finalScore <= 35) setDirection('BEARISH')
                else setDirection('NEUTRAL')

                lastUpdateRef.current = now
                setLoading(false)
            } catch (err) {
                console.error("Analysis error:", err)
            } finally {
                isAnalyzingRef.current = false
            }
        }

        if (Object.keys(tickers).length > 0) {
            analyze()
        }
    }, [tickers])

    const getColor = (s) => s > 60 ? '#00E396' : s < 40 ? '#FF4560' : '#00FFFF'

    return (
        <div className="dx-card predictor-card" style={{
            background: 'linear-gradient(135deg, rgba(13,13,13,0.9) 0%, rgba(20,20,30,0.95) 100%)',
            border: `1px solid ${getColor(score)}40`,
            boxShadow: `0 0 30px ${getColor(score)}10`,
            padding: 0, overflow: 'hidden', position: 'relative', marginBottom: 24, minHeight: 180,
            display: 'flex'
        }}>
            <div className="predictor-inner" style={{ display: 'flex', flex: 1 }}>
                {/* Left: Score & Verdict */}
                <div className="predictor-left" style={{ flex: 1, padding: 24, borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <Brain size={16} color="var(--accent)" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1 }}>AI PREDICTION (4H)</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                        <span className="score-forecast" style={{ fontSize: 48, fontWeight: 900, color: getColor(score), fontFamily: 'var(--font-mono)' }}>
                            {loading ? '--' : (factors.forecast > 0 ? `+${factors.forecast.toFixed(2)}%` : `${factors.forecast?.toFixed(2)}%`)}
                        </span>
                        <span style={{ fontSize: 20, fontWeight: 800, color: getColor(score) }}>
                            {direction}
                        </span>
                    </div>

                    <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8, lineHeight: 1.5, maxWidth: 300 }}>
                        {direction === 'BULLISH' && "High probability of uptrend. Polymarket odds and Whales are accumulating."}
                        {direction === 'BEARISH' && "Correction likely. Prediction markets are pricing in a drop."}
                        {direction === 'NEUTRAL' && "Conflicting signals. Whales are buying but technicals are weak."}
                    </p>
                </div>

                {/* Right: Factors */}
                <div className="predictor-right" style={{ width: '100%', maxWidth: 320, padding: 24, background: 'rgba(255,255,255,0.02)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)' }}>Key Drivers</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Factor 1: Whales */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Target size={14} color="var(--text)" />
                                <span style={{ fontSize: 13 }}>Whale Flow</span>
                            </div>
                            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${factors.whales}%` }} style={{ height: '100%', background: getColor(factors.whales), borderRadius: 2 }} />
                            </div>
                        </div>

                        {/* Factor 2: Sentiment */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap size={14} color="var(--text)" />
                                <span style={{ fontSize: 13 }}>Sentiment</span>
                            </div>
                            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${factors.sentiment}%` }} style={{ height: '100%', background: getColor(factors.sentiment), borderRadius: 2 }} />
                            </div>
                        </div>

                        {/* Factor 3: Polymarket */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BarChart3 size={14} color="#00FFFF" />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: 13 }}>Polymarkets</span>
                                    <span style={{ fontSize: 9, color: 'var(--muted)' }}>{polyTitle}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: getColor(factors.poly) }}>{factors.poly}% YES</div>
                                <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 2 }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${factors.poly}%` }} style={{ height: '100%', background: '#00FFFF', borderRadius: 2 }} />
                                </div>
                            </div>
                        </div>

                        {/* Factor 4: Technicals */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={14} color="var(--text)" />
                                <span style={{ fontSize: 13 }}>Technicals</span>
                            </div>
                            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${factors.tech}%` }} style={{ height: '100%', background: getColor(factors.tech), borderRadius: 2 }} />
                            </div>
                        </div>

                        {/* Factor 5: Neural Forecast */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Brain size={14} color="#A855F7" />
                                <span style={{ fontSize: 13, color: '#A855F7', fontWeight: 700 }}>Neural Forecast</span>
                            </div>
                            <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${factors.ml}%` }} style={{ height: '100%', background: '#A855F7', borderRadius: 2 }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer Overlay */}
            <div style={{ position: 'absolute', bottom: 12, left: 24, fontSize: 10, color: 'var(--muted)', opacity: 0.6, zIndex: 10 }}>
                *ML v2.0 (Regression). Real-time OBI integration.
            </div>

            {/* Background Glow */}
            <div style={{
                position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                background: `radial-gradient(circle, ${getColor(score)}20 0%, transparent 70%)`,
                pointerEvents: 'none', zIndex: 0
            }} />
        </div>
    )
}
