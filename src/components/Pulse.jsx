import React, { useEffect, useRef, useState } from 'react'
import { Activity, Zap, TrendingUp, TrendingDown, Clock, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/context/WebSocketContext'

export default function Pulse() {
    const canvasRef = useRef(null)
    const { tickers } = useWebSocket()
    const [marketStatus, setMarketStatus] = useState({ state: 'NEUTRAL', color: '#00FFFF', bpm: 60 })

    // Calculate market heart rate from real data
    useEffect(() => {
        if (!tickers || Object.keys(tickers).length === 0) return

        let totalChange = 0
        let totalVol = 0
        let count = 0

        // Analyze top pairs
        const pairs = ['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt']
        pairs.forEach(p => {
            const t = tickers[p]
            if (t) {
                totalChange += parseFloat(t.changePercent || 0)
                totalVol += parseFloat(t.volume || 0)
                count++
            }
        })

        if (count === 0) return

        const avgChange = totalChange / count
        const absChange = Math.abs(avgChange)

        let newState = 'NEUTRAL'
        let newColor = '#00FFFF' // Cyan (Calm)
        let newBpm = 60

        // Logic for market state
        if (avgChange > 0.5) {
            newState = 'BULLISH'
            newColor = '#00E396' // Green
            newBpm = 80 + (absChange * 10)
        } else if (avgChange < -0.5) {
            newState = 'BEARISH'
            newColor = '#FF4560' // Red
            newBpm = 90 + (absChange * 15) // Panic is faster
        } else if (absChange < 0.1) {
            newState = 'STAGNANT'
            newColor = '#667eea' // Blue/Purple
            newBpm = 45
        } else {
            // Normal volatility
            newBpm = 60 + (absChange * 20)
        }

        // Cap BPM
        newBpm = Math.min(160, Math.max(40, newBpm))

        setMarketStatus({ state: newState, color: newColor, bpm: Math.round(newBpm) })

    }, [tickers])


    // Canvas Animation Loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        let animationFrameId
        let time = 0

        // Resize handler
        const resize = () => {
            const parent = canvas.parentElement
            canvas.width = parent.clientWidth
            canvas.height = 160 // Fixed height
        }
        window.addEventListener('resize', resize)
        resize()

        const points = []
        const MAX_POINTS = canvas.width / 2

        const render = () => {
            time += 1
            const { color, bpm } = marketStatus

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Scroll speed based on BPM
            const speed = bpm / 20

            // Generate heart beat pattern
            // P-Q-R-S-T complex simulation
            const beatInterval = 3600 / bpm // frames per beat (at 60fps)
            const phase = time % beatInterval

            let y = canvas.height / 2
            const amplitude = 30 + (bpm / 4) // Higher BPM = higher spikes

            // Complex Heartbeat Logic
            if (phase < 10) y -= 0 // Flat
            else if (phase < 15) y -= amplitude * 0.1 // P wave (small up)
            else if (phase < 20) y += amplitude * 0.1
            else if (phase < 30) y -= 0
            else if (phase < 35) y += amplitude * 0.1 // Q wave (small down)
            else if (phase < 40) y -= amplitude * 1.2 // R wave (HUGE UP) - The Pulse
            else if (phase < 45) y += amplitude * 0.4 // S wave (down)
            else if (phase < 55) y -= 0
            else if (phase < 65) y -= amplitude * 0.2 // T wave (medium up)
            else if (phase < 75) y += amplitude * 0.2

            // Add jitter noise for "realism" based on bpm (volatility)
            const noise = (Math.random() - 0.5) * (bpm > 100 ? 4 : 1)
            y += noise

            // Add new point
            points.push({ x: canvas.width, y })

            // Scroll points
            for (let i = 0; i < points.length; i++) {
                points[i].x -= speed
            }

            // Remove off-screen points
            if (points.length > 0 && points[0].x < 0) points.shift()

            // Draw Line
            ctx.beginPath()
            ctx.lineJoin = 'round'
            ctx.lineCap = 'round'

            // Gradient Stroke
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
            gradient.addColorStop(0, `${color}00`) // Transparent fade out
            gradient.addColorStop(0.1, `${color}20`)
            gradient.addColorStop(0.8, color)
            gradient.addColorStop(1, '#FFFFFF') // White hot tip

            ctx.strokeStyle = gradient
            ctx.lineWidth = 3
            // Shadow / Glow
            ctx.shadowBlur = 10
            ctx.shadowColor = color

            // Draw path
            if (points.length > 1) {
                ctx.moveTo(points[0].x, points[0].y)
                for (let i = 1; i < points.length; i++) {
                    // Smooth curve
                    const xc = (points[i].x + points[i - 1].x) / 2
                    const yc = (points[i].y + points[i - 1].y) / 2
                    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc)
                }
                ctx.stroke()
            }

            // Draw "Lead" Dot
            if (points.length > 0) {
                const last = points[points.length - 1]
                ctx.beginPath()
                ctx.arc(last.x, last.y, 4, 0, Math.PI * 2)
                ctx.fillStyle = '#fff'
                ctx.fill()

                // Emitting Pulse Ring
                if (phase > 38 && phase < 42) {
                    // During R-wave peak
                    const ringRadius = (phase - 38) * 8
                    ctx.beginPath()
                    ctx.arc(last.x, last.y, ringRadius, 0, Math.PI * 2)
                    ctx.strokeStyle = `${color}80`
                    ctx.lineWidth = 2
                    ctx.stroke()
                }
            }

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [marketStatus])

    return (
        <div className="dx-card pulse-container" style={{
            position: 'relative',
            height: 200,
            padding: 0,
            overflow: 'hidden',
            marginBottom: 20,
            border: `1px solid ${marketStatus.color}40`,
            boxShadow: `0 0 30px ${marketStatus.color}10`
        }}>
            {/* Background Grid */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                opacity: 0.5
            }} />

            <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

            {/* Overlay UI */}
            <div style={{ position: 'absolute', top: 20, left: 24, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: marketStatus.color,
                        boxShadow: `0 0 10px ${marketStatus.color}`,
                        animation: 'pulseGlow 1s infinite'
                    }} />
                    <h3 style={{ margin: 0, fontSize: 13, letterSpacing: 2, color: 'var(--muted)' }}>SPECTR PULSE</h3>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: marketStatus.color, fontFamily: 'var(--font-mono)' }}>
                    {marketStatus.state}
                </div>
            </div>

            <div style={{ position: 'absolute', top: 20, right: 24, padding: '8px 16px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                    <Activity size={14} color={marketStatus.color} />
                    <span style={{ color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{marketStatus.bpm}</span> BPM
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: 16, right: 24, display: 'flex', gap: 16, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                <span>SCAN: 12ms</span>
                <span>NODES: 4</span>
                <span>VOL: {(marketStatus.bpm > 80 ? 'HIGH' : 'NORMAL')}</span>
            </div>

        </div>
    )
}
