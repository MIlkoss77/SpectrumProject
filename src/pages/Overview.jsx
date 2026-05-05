// src/pages/Overview.jsx — Command Center Redesign v2
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTopActions, calculateSuperScore } from '@/services/ai/superScore'
import { useWebSocket } from '@/context/WebSocketContext'
import { useAuth } from '@/context/AuthContext'
import { useTrade } from '@/context/TradeContext'
import NumberTicker from '@/components/NumberTicker'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Zap, Target, Scale, GraduationCap, Newspaper,
  TrendingUp, TrendingDown, ChevronRight, Layers, ArrowRight,
  Brain, Flame, BarChart3
} from 'lucide-react'
import './dashboard.css'
import './overview.css'

// ── Animation variants ──
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } }
}

// ── Gauge SVG Component ──
function SentimentGauge({ score = 50, size = 140 }) {
  const radius = (size / 2) - 12
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, score))
  const offset = circumference - (progress / 100) * circumference

  const color = useMemo(() => {
    if (score >= 70) return '#00E396'
    if (score >= 45) return '#00FFFF'
    return '#FF4560'
  }, [score])

  const label = useMemo(() => {
    if (score >= 70) return 'FAVORABLE'
    if (score >= 45) return 'NEUTRAL'
    return 'CAUTION'
  }, [score])

  return (
    <div className="ov-gauge-wrap" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ov-gauge-track"
          cx={size / 2} cy={size / 2} r={radius}
        />
        <motion.circle
          className="ov-gauge-fill"
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </svg>
      <div className="ov-gauge-center">
        <span className="ov-gauge-num" style={{ color }}>
          <NumberTicker value={score} decimals={0} />
        </span>
        <span className="ov-gauge-label" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

// ── Main Overview Component ──
export default function Overview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openTrade } = useTrade()
  const { tickers } = useWebSocket()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [topActions, setTopActions] = useState([])
  const [superScore, setSuperScore] = useState(null)

  const [intelStream] = useState([
    { id: 1, type: 'BULLISH', msg: 'Neural Engine detects whale accumulation on BTC @ $68.4k', time: 'JUST NOW' },
    { id: 2, type: 'NEUTRAL', msg: 'Volatility expansion expected in ETH within 4 hours', time: '2m ago' },
    { id: 3, type: 'BEARISH', msg: 'Liquidity gap identified for SOL below $142.50', time: '5m ago' },
    { id: 4, type: 'BULLISH', msg: 'Institutional inflow detected on ETH perpetuals', time: '8m ago' }
  ])

  const [predictions] = useState([
    { id: 1, question: 'BTC > $75,000 by June 2026?', probability: 73, volume: '$42.1K' },
    { id: 2, question: 'ETH 2.0 staking yield > 5% Q3?', probability: 58, volume: '$18.7K' },
    { id: 3, question: 'SOL flips BNB by market cap?', probability: 41, volume: '$31.2K' }
  ])

  const [news] = useState([
    { id: 1, title: 'Bitcoin ETF inflows hit $2.1B weekly record as institutional demand surges', sentiment: 'BULLISH', impact: 'HIGH', time: '12m' },
    { id: 2, title: 'Federal Reserve signals potential rate pause in upcoming meeting', sentiment: 'NEUTRAL', impact: 'HIGH', time: '34m' },
    { id: 3, title: 'Major exchange reports security breach affecting cold wallets', sentiment: 'BEARISH', impact: 'MED', time: '1h' }
  ])

  // Academy mock data
  const academyProgress = 40
  const academyBadges = 3
  const academyLevel = 'Intermediate'

  useEffect(() => {
    const init = async () => {
      try {
        const [actions, score] = await Promise.all([
          getTopActions(),
          calculateSuperScore('BTCUSDT')
        ])
        setTopActions(actions || [])
        setSuperScore(score)
      } catch (e) {
        console.error('Overview init error:', e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Derive hero metrics from superScore
  const sentimentScore = superScore?.details?.sentiment ?? 68
  const whaleScore = superScore?.details?.whales ?? 55
  const marketScore = superScore?.score ?? 65
  const opportunityCount = topActions.length || 3

  const sentimentLabel = sentimentScore >= 65 ? 'Optimistic' : sentimentScore >= 40 ? 'Neutral' : 'Bearish'
  const whaleLabel = whaleScore >= 60 ? 'Accumulating' : whaleScore >= 40 ? 'Stable' : 'Distributing'

  // Quick Action cards
  const quickActions = [
    {
      label: 'Signals',
      icon: <Activity size={20} />,
      color: '#00FFFF',
      bg: 'rgba(0,255,255,0.08)',
      border: 'rgba(0,255,255,0.15)',
      badge: `${opportunityCount}`,
      badgeBg: 'rgba(0,255,255,0.15)',
      badgeColor: '#00FFFF',
      to: '/signals'
    },
    {
      label: 'Arbitrage',
      icon: <Scale size={20} />,
      color: '#00E396',
      bg: 'rgba(0,227,150,0.08)',
      border: 'rgba(0,227,150,0.15)',
      badge: '>0.3%',
      badgeBg: 'rgba(0,227,150,0.15)',
      badgeColor: '#00E396',
      to: '/arbitrage'
    },
    {
      label: 'Predictions',
      icon: <Layers size={20} />,
      color: '#A78BFA',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.15)',
      badge: '5',
      badgeBg: 'rgba(139,92,246,0.15)',
      badgeColor: '#A78BFA',
      to: '/polymarket'
    },
    {
      label: 'Academy',
      icon: <GraduationCap size={20} />,
      color: '#FEB019',
      bg: 'rgba(254,176,25,0.08)',
      border: 'rgba(254,176,25,0.15)',
      badge: `${academyProgress}%`,
      badgeBg: 'rgba(254,176,25,0.15)',
      badgeColor: '#FEB019',
      to: '/academy'
    }
  ]

  const sentimentColor = sentimentScore >= 65 ? '#00E396' : sentimentScore >= 40 ? '#FEB019' : '#FF4560'
  const newsColors = { BULLISH: '#00E396', BEARISH: '#FF4560', NEUTRAL: '#FEB019' }
  const impactColors = {
    HIGH: { bg: 'rgba(255,69,96,0.12)', color: '#FF4560' },
    MED: { bg: 'rgba(254,176,25,0.12)', color: '#FEB019' },
    LOW: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
  }

  return (
    <div style={{ padding: 'var(--panel-padding)', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ═══ S1: HERO — Command Center ═══ */}
      <motion.div
        className="ov-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="ov-hero-top">
          <div className="ov-engine-badge">
            <div className="ov-engine-dot" />
            Neural Engine Active
          </div>
        </div>

        <div className="ov-hero-body">
          <div className="ov-hero-left">
            <h1 className="ov-hero-headline">
              {marketScore >= 60 ? 'Ready to Trade' : marketScore >= 40 ? 'Market Stabilizing' : 'Exercise Caution'}
            </h1>
            <p className="ov-hero-sub">
              <span className="ov-hero-sub-dot" />
              {opportunityCount} Alpha Opportunities Detected
            </p>

            <div className="ov-hero-metrics">
              <div className="ov-metric-pill">
                Sentiment: <span className="val" style={{ color: sentimentColor }}>{sentimentLabel} {sentimentScore}%</span>
              </div>
              <div className="ov-metric-pill">
                Whales: <span className="val">{whaleLabel}</span>
              </div>
              <div className="ov-metric-pill">
                Volatility: <span className="val">Low</span>
              </div>
            </div>

            <button className="ov-hero-cta" onClick={() => navigate('/signals')}>
              View Top Signals <ArrowRight size={16} />
            </button>
          </div>

          <div className="ov-hero-right">
            <SentimentGauge score={marketScore} />
          </div>
        </div>
      </motion.div>

      {/* ═══ S2: QUICK ACTIONS ═══ */}
      <motion.div
        className="ov-quick-actions"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {quickActions.map((qa, i) => (
          <motion.div
            key={qa.label}
            className="ov-qa-card"
            variants={fadeUp}
            custom={i}
            onClick={() => navigate(qa.to)}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="ov-qa-badge" style={{ background: qa.badgeBg, color: qa.badgeColor }}>
              {qa.badge}
            </div>
            <div className="ov-qa-icon" style={{ background: qa.bg, border: `1px solid ${qa.border}`, color: qa.color }}>
              {qa.icon}
            </div>
            <span className="ov-qa-label">{qa.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ S3: YOUR NEXT MOVE ═══ */}
      <motion.section
        initial="hidden" animate="visible" variants={stagger}
      >
        <motion.div className="ov-section-header" variants={fadeUp} custom={0}>
          <Zap size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="ov-section-title">Your Next Move</h2>
          <span className="ov-section-badge" style={{ background: 'rgba(0,255,255,0.08)', color: 'var(--accent)' }}>LIVE</span>
        </motion.div>

        <div className="ov-next-move-scroll">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="ov-move-card ov-skeleton" style={{ minHeight: '180px' }} />
            ))
          ) : (
            (topActions.length > 0 ? topActions : [
              { symbol: 'BTCUSDT', score: 78, status: 'STRONG BUY', details: {} },
              { symbol: 'SOLUSDT', score: 71, status: 'BUY', details: {} },
              { symbol: 'ETHUSDT', score: 45, status: 'NEUTRAL', details: {} }
            ]).slice(0, 3).map((action, i) => {
              const isBuy = action.status.includes('BUY')
              const color = isBuy ? '#00FFFF' : action.status.includes('SELL') ? '#FF4560' : '#FEB019'
              const sym = action.symbol?.replace('USDT', '') || 'BTC'
              const ticker = tickers[`${sym.toLowerCase()}usdt`]

              return (
                <motion.div
                  key={i}
                  className="ov-move-card"
                  variants={fadeUp}
                  custom={i + 1}
                  whileHover={{ y: -4, borderColor: `${color}30` }}
                >
                  <div className="ov-move-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="ov-move-icon" style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
                        <Zap size={20} fill={isBuy ? 'currentColor' : 'none'} />
                      </div>
                      <div>
                        <div className="ov-move-sym">{sym}</div>
                        <div className="ov-move-status" style={{ color }}>{action.status}</div>
                      </div>
                    </div>
                    <div className="ov-move-score">
                      <span className="ov-move-score-label">Confidence</span>
                      <span className="ov-move-score-val">{action.score}%</span>
                    </div>
                  </div>

                  {ticker && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)' }}>
                        ${ticker.price?.toLocaleString()}
                      </span>
                      <span style={{ color: ticker.changePercent >= 0 ? '#00E396' : '#FF4560', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  )}

                  <div className="ov-move-bar">
                    <motion.div
                      className="ov-move-bar-fill"
                      style={{ background: color, boxShadow: `0 0 8px ${color}40` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${action.score}%` }}
                      transition={{ duration: 1, delay: 0.4 + i * 0.15 }}
                    />
                  </div>

                  <button
                    className="ov-move-btn"
                    style={{ background: color }}
                    onClick={() => openTrade({ symbol: action.symbol, action: isBuy ? 'BUY' : 'SELL' })}
                  >
                    Execute {isBuy ? 'Long' : action.status.includes('SELL') ? 'Short' : 'Trade'}
                  </button>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.section>

      {/* ═══ S4: TRENDING PREDICTIONS ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
        <motion.div className="ov-section-header" variants={fadeUp}>
          <Layers size={18} style={{ color: '#A78BFA' }} />
          <h2 className="ov-section-title">Trending Predictions</h2>
        </motion.div>

        <div className="ov-predictions">
          {predictions.map((p, i) => (
            <motion.div
              key={p.id}
              className="ov-pred-card"
              variants={fadeUp}
              custom={i}
              onClick={() => navigate('/polymarket')}
              whileHover={{ scale: 1.01 }}
            >
              <div className="ov-pred-q">{p.question}</div>
              <div className="ov-pred-prob">
                <span className="ov-pred-prob-val" style={{ color: p.probability >= 60 ? '#00E396' : p.probability >= 40 ? '#FEB019' : '#FF4560' }}>
                  {p.probability}%
                </span>
                <div className="ov-pred-prob-bar">
                  <motion.div
                    className="ov-pred-prob-fill"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.probability}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>
              <button className="ov-pred-btn" onClick={(e) => { e.stopPropagation(); navigate('/polymarket') }}>
                Predict
              </button>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ S5: NEWS SENTIMENT DIGEST ═══ */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}>
        <motion.div className="ov-section-header" variants={fadeUp}>
          <Newspaper size={18} style={{ color: '#FEB019' }} />
          <h2 className="ov-section-title">News Sentiment</h2>
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => navigate('/news')}
          >
            View All <ChevronRight size={14} />
          </button>
        </motion.div>

        <div className="ov-news-list">
          {news.map((n, i) => (
            <motion.div
              key={n.id}
              className="ov-news-item"
              variants={fadeUp}
              custom={i}
              onClick={() => navigate('/news')}
            >
              <div className="ov-news-dot" style={{ background: newsColors[n.sentiment] }} />
              <div className="ov-news-content">
                <p className="ov-news-title">{n.title}</p>
                <div className="ov-news-meta">
                  <span className="ov-news-time">{n.time} ago</span>
                  <span
                    className="ov-news-impact"
                    style={{ background: impactColors[n.impact]?.bg, color: impactColors[n.impact]?.color }}
                  >
                    {n.impact}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══ S6: ACADEMY & ACHIEVEMENTS ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
      >
        <div className="ov-academy">
          <div className="ov-academy-top">
            <div className="ov-academy-info">
              <div className="ov-academy-icon">
                <GraduationCap size={20} />
              </div>
              <div>
                <div className="ov-academy-label">Spectr Academy</div>
                <div className="ov-academy-level">{academyLevel} · {academyBadges} Badges</div>
              </div>
            </div>
          </div>

          <div className="ov-academy-progress">
            <motion.div
              className="ov-academy-progress-fill"
              initial={{ width: 0 }}
              whileInView={{ width: `${academyProgress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>

          <div className="ov-academy-footer">
            <span className="ov-academy-stat">{academyProgress}% Complete</span>
            <button className="ov-academy-btn" onClick={() => navigate('/academy')}>
              Continue Learning <ChevronRight size={14} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* ═══ S7: ALPHA PULSE (Intel Stream) ═══ */}
      <motion.section
        className="ov-intel"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={stagger}
      >
        <motion.div className="ov-section-header" variants={fadeUp}>
          <Activity size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="ov-section-title">Alpha Pulse</h2>
          <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', animation: 'dot-pulse 2s infinite' }} />
        </motion.div>

        <AnimatePresence>
          {intelStream.map((item, i) => (
            <motion.div
              key={item.id}
              className="ov-intel-item"
              style={{ borderLeftColor: item.type === 'BULLISH' ? '#00FFFF20' : item.type === 'BEARISH' ? '#FF456020' : 'rgba(255,255,255,0.06)' }}
              variants={fadeUp}
              custom={i}
            >
              <div className="ov-intel-header">
                <span className="ov-intel-type" style={{ color: item.type === 'BULLISH' ? '#00FFFF' : item.type === 'BEARISH' ? '#FF4560' : '#FEB019' }}>
                  {item.type}
                </span>
                <span className="ov-intel-time">{item.time}</span>
              </div>
              <p className="ov-intel-msg">{item.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.section>

    </div>
  )
}
