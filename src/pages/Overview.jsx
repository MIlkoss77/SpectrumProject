// src/pages/Overview.jsx — Command Center Redesign v2
import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTopActions, calculateSuperScore } from '@/services/ai/superScore'
import { useWebSocket } from '@/context/WebSocketContext'
import { useAuth } from '@/context/AuthContext'
import { useTrade } from '@/context/TradeContext'
import { useAppMode } from '@/context/AppModeContext'
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

import MiniChart from '@/components/MiniChart'

// ── Gauge SVG Component ──
function SentimentGauge({ score = 50, size = 100 }) {
  const radius = (size / 2) - 8
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
        <span className="ov-gauge-num" style={{ color, fontSize: '24px' }}>
          <NumberTicker value={score} decimals={0} />
        </span>
        <span className="ov-gauge-label" style={{ color, fontSize: '7px' }}>{label}</span>
      </div>
    </div>
  )
}

function AssetChartCard({ symbol = 'BTC', price = 0, change = 0, data = [], timeframe = '1D', setTimeframe }) {
  return (
    <motion.div 
      className="ov-hero" 
      style={{ 
        padding: '16px', 
        flex: 1, 
        minWidth: '300px', 
        background: 'rgba(10,10,18,0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: '24px'
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Activity size={16} color="#00FFFF" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{symbol}/USDT</div>
            <div style={{ fontSize: '9px', fontWeight: 800, color: change >= 0 ? '#00E396' : '#FF4560' }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
             $<NumberTicker value={price} decimals={2} />
           </div>
           <div style={{ fontSize: '7px', fontWeight: 900, color: '#00FFFF', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural: LONG (84%)</div>
        </div>
      </div>
      
      <MiniChart data={data} color="#00FFFF" height={70} />
      
      <div className="flex gap-2">
         {['1H', '1D', '1W', '1M'].map(tf => (
           <button 
             key={tf} 
             onClick={() => setTimeframe?.(tf)}
             style={{ 
               flex: 1, 
               padding: '6px 0', 
               borderRadius: '8px', 
               border: '1px solid rgba(255,255,255,0.05)', 
               background: tf === timeframe ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.02)', 
               color: tf === timeframe ? '#00FFFF' : 'rgba(255,255,255,0.3)', 
               fontSize: '9px', 
               fontWeight: 900, 
               cursor: 'pointer',
               transition: 'all 0.2s ease'
             }}
           >
             {tf}
           </button>
         ))}
      </div>
    </motion.div>
  )
}

// ── Main Overview Component ──
export default function Overview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { openTrade } = useTrade()
  const { tickers, subscribe, unsubscribe } = useWebSocket()
  const { user } = useAuth()
  const { appMode } = useAppMode()

  useEffect(() => {
    if (appMode === 'academy') {
      navigate('/tracker', { replace: true })
    }
  }, [appMode, navigate])

  const [loading, setLoading] = useState(true)
  const [topActions, setTopActions] = useState([])
  const [superScore, setSuperScore] = useState(null)
  
  const btcTicker = tickers['btcusdt'] || tickers['BTCUSDT'] || { price: 0, changePercent: 0 }
  const ethTicker = tickers['ethusdt'] || tickers['ETHUSDT'] || { price: 0, changePercent: 0 }
  const solTicker = tickers['solusdt'] || tickers['SOLUSDT'] || { price: 0, changePercent: 0 }

  // Use real price if available (> 0), otherwise use a slightly varied mock to detect updates
  const btcPrice = btcTicker.price > 0 ? btcTicker.price : 64280.40
  
  const intelStream = useMemo(() => [
    { id: 1, type: 'BULLISH', msg: `Neural Engine detects whale accumulation on BTC @ $${btcPrice.toLocaleString()}`, time: 'JUST NOW' },
    { id: 2, type: 'NEUTRAL', msg: `Volatility expansion expected in ETH within 4 hours`, time: '2m ago' },
    { id: 3, type: 'BEARISH', msg: `Liquidity gap identified for SOL below $${(solTicker.price || 142).toFixed(2)}`, time: '5m ago' },
    { id: 4, type: 'BULLISH', msg: 'Institutional inflow detected on ETH perpetuals', time: '8m ago' }
  ], [btcPrice, solTicker.price])

  useEffect(() => {
    const streams = ['btcusdt@ticker', 'ethusdt@ticker', 'solusdt@ticker']
    subscribe(streams)
    return () => unsubscribe(streams)
  }, [])

  const [predictions] = useState([
    { id: 1, question: 'BTC > $100,000 by end of year?', probability: 73, volume: '$42.1K' },
    { id: 2, question: 'ETH staking yield > 5% Q4?', probability: 58, volume: '$18.7K' },
    { id: 3, question: 'SOL flips BNB by market cap?', probability: 41, volume: '$31.2K' }
  ])

  const [news] = useState([
    { id: 1, title: 'Institutional crypto adoption accelerates with new regulatory clarity', sentiment: 'BULLISH', impact: 'HIGH', time: '12m' },
    { id: 2, title: 'Global central banks signal shift in digital asset strategy', sentiment: 'NEUTRAL', impact: 'HIGH', time: '34m' },
    { id: 3, title: 'Network upgrade successfully deployed on major L1 blockchain', sentiment: 'BULLISH', impact: 'MED', time: '1h' }
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
      label: 'Polymarket',
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

  const [timeframe, setTimeframe] = useState('1D')
  // Dynamic mock data based on timeframe
  const chartDataMap = {
    '1H': [67800, 67950, 67850, 68100, 68050, 68200, 68150, 68300, 68250, 68430],
    '1D': [64200, 64500, 64100, 64800, 65200, 64900, 65800, 66400, 66100, 67200, 68100, 67900, 68430],
    '1W': [61000, 62500, 60800, 63000, 64500, 63800, 65000, 66200, 65500, 68430],
    '1M': [58000, 60000, 59500, 62000, 61500, 64000, 63500, 66000, 65500, 68430]
  }

  const chartData = useMemo(() => chartDataMap[timeframe], [timeframe])

  // Scout mock data from bot
  const scoutAlpha = [
    { id: 's1', time: '12:57:25 AM', msg: 'Significant activity detected on SOLANA. $3ATDSKXQJ9 contract recently received visibility boosts.', score: 92, sym: 'SOL' },
    { id: 's2', time: '12:55:25 AM', msg: 'High-velocity accumulation detected on SOLANA. $JA2OZ7TQSQ smart money inflow increasing.', score: 90, sym: 'SOL' }
  ]

  return (
    <div style={{ padding: 'var(--panel-padding)', maxWidth: '1400px', margin: '0 auto' }}>

      {/* ═══ S1: HERO — Price Pulse ═══ */}
      <div className="mb-8">
        <AssetChartCard 
          symbol="BTC" 
          price={btcPrice} 
          change={btcTicker.changePercent || 0} 
          data={chartData} 
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
      </div>

      {/* ═══ S2: QUICK ACTIONS ═══ */}
      <motion.div
        className="ov-quick-actions"
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '32px' }}
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
            style={{ minWidth: '85px', padding: '10px' }}
          >
            <div className="ov-qa-badge" style={{ background: qa.badgeBg, color: qa.badgeColor }}>
              {qa.badge}
            </div>
            <div className="ov-qa-icon" style={{ width: '28px', height: '28px', background: qa.bg, border: `1px solid ${qa.border}`, color: qa.color }}>
              {React.cloneElement(qa.icon, { size: 14 })}
            </div>
            <span className="ov-qa-label" style={{ fontSize: '9px', fontWeight: 900 }}>{qa.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ S3: FEROCIOUS SCOUT ALPHA ═══ */}
      <motion.section
        initial="hidden" animate="visible" variants={stagger}
        style={{ marginBottom: '32px' }}
      >
        <motion.div className="ov-section-header" variants={fadeUp} custom={0}>
          <Flame size={18} style={{ color: '#FF4560' }} />
          <h2 className="ov-section-title">Ferocious Scout Alpha</h2>
          <span className="ov-section-badge" style={{ background: 'rgba(255,69,96,0.08)', color: '#FF4560' }}>LATEST</span>
        </motion.div>

        <div className="ov-next-move-scroll">
          {scoutAlpha.map((item, i) => (
            <motion.div
              key={item.id}
              className="ov-move-card"
              variants={fadeUp}
              custom={i + 1}
              style={{ minWidth: '280px', padding: '14px', borderRadius: '16px' }}
            >
              <div className="ov-move-top" style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="ov-move-icon" style={{ background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.2)', color: '#FF4560', width: '32px', height: '32px' }}>
                    <Zap size={16} fill="#FF4560" />
                  </div>
                  <div>
                    <div className="ov-move-sym" style={{ fontSize: '13px' }}>{item.sym} ALPHA</div>
                    <div className="ov-move-status" style={{ color: '#FF4560', fontSize: '8px' }}>HIGH VELOCITY</div>
                  </div>
                </div>
                <div className="ov-move-score">
                  <span className="ov-move-score-label" style={{ fontSize: '7px' }}>Intel Score</span>
                  <span className="ov-move-score-val" style={{ fontSize: '16px' }}>{item.score}/100</span>
                </div>
              </div>

              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4, marginBottom: '12px', height: '30px', overflow: 'hidden' }}>
                {item.msg}
              </p>

              <div className="ov-move-bar" style={{ height: '2px', marginBottom: '12px' }}>
                <motion.div
                  className="ov-move-bar-fill"
                  style={{ background: '#FF4560', boxShadow: '0 0 8px rgba(255,69,96,0.4)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                />
              </div>

              <button
                className="ov-move-btn"
                style={{ background: '#FF4560', padding: '8px', fontSize: '9px', borderRadius: '8px' }}
                onClick={() => navigate('/signals')}
              >
                Analyze Signal
              </button>
            </motion.div>
          ))}
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
              style={{ padding: '8px 12px', borderRadius: '12px', marginBottom: '8px' }}
            >
              <div className="ov-pred-q" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>{p.question}</div>
              <div className="ov-pred-prob">
                <span className="ov-pred-prob-val" style={{ fontSize: '14px', fontWeight: 900, color: p.probability >= 60 ? '#00E396' : p.probability >= 40 ? '#FEB019' : '#FF4560' }}>
                  {p.probability}%
                </span>
              </div>
              <button className="ov-pred-btn" style={{ padding: '6px 12px', fontSize: '9px', borderRadius: '8px' }}>
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
