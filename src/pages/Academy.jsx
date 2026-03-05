import React, { useState } from 'react'
import { BookOpen, CheckCircle, Award, Lock, PlayCircle, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './dashboard.css'

const MODULES = [
  {
    id: 1,
    title: 'Crypto Basics',
    desc: 'Start your journey here. Learn wallets, security, and transfers.',
    progress: 100,
    reward: 'Novice Badge',
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
    lessons: [
      {
        title: 'What is Blockchain?',
        duration: '5 min read',
        completed: true,
        content: `A blockchain is a distributed, immutable ledger that records transactions across a network of computers. Each "block" contains a batch of transactions and a cryptographic hash of the previous block, forming a chain.\n\nKey properties:\n• Decentralized — no single authority controls the data\n• Immutable — once written, records cannot be altered\n• Transparent — anyone can verify the transaction history\n• Consensus-driven — network participants agree on the state`,
        quiz: { q: 'What makes blockchain immutable?', options: ['Fast servers', 'Cryptographic hashing of blocks', 'Government regulation'], answer: 1 }
      },
      {
        title: 'Setting up MetaMask',
        duration: '8 min read',
        completed: true,
        content: `MetaMask is a browser extension and mobile app that serves as your crypto wallet and gateway to decentralized applications.\n\nSetup Steps:\n1. Install MetaMask from metamask.io (browser extension)\n2. Click "Create a New Wallet"\n3. Set a strong password\n4. Write down your 12-word seed phrase on paper — never share it!\n5. Confirm the seed phrase\n6. Your wallet is ready — you'll see your ETH address (0x...)\n\n⚠️ Critical: Your seed phrase is the master key. If you lose it, you lose access to your funds forever. Never store it digitally.`,
        quiz: { q: 'Where should you store your seed phrase?', options: ['In a notes app', 'On physical paper in a safe place', 'Screenshot on phone'], answer: 1 }
      },
      {
        title: 'Your First Transaction',
        duration: '6 min read',
        completed: true,
        content: `Sending crypto is like sending an email — you need the recipient's address and enough balance to cover the amount + gas fee.\n\nAnatomy of a transaction:\n• From: your wallet address\n• To: recipient's address (0x... for ETH, or ENS like vitalik.eth)\n• Amount: how much to send\n• Gas Fee: payment to miners/validators for processing\n\nGas tips:\n• Gas price fluctuates with network demand\n• Use etherscan.io/gastracker for current prices\n• Transactions during off-peak hours (weekends, late night UTC) are cheaper`,
        quiz: { q: 'What is a gas fee?', options: ['A penalty for slow transactions', 'Payment to network validators for processing', 'A subscription fee'], answer: 1 }
      },
      {
        title: 'Security Best Practices',
        duration: '12 min read',
        completed: true,
        content: `Protecting your crypto requires a different mindset than traditional banking. You are your own bank.\n\nEssential practices:\n1. Use a hardware wallet (Ledger, Trezor) for large holdings\n2. Enable 2FA on all exchange accounts (use Authenticator app, not SMS)\n3. Never share your seed phrase — no legitimate service will ask for it\n4. Verify URLs before connecting your wallet — phishing sites look identical\n5. Use separate wallets — a "hot" wallet for daily use, "cold" for storage\n6. Revoke unused approvals — check revoke.cash regularly\n\n🔴 Red flags: DMs offering free tokens, "support" asking for your keys, too-good-to-be-true APYs`,
        quiz: { q: 'What should you NEVER share?', options: ['Your wallet address', 'Your seed phrase', 'Your transaction history'], answer: 1 }
      },
    ]
  },
  {
    id: 2,
    title: 'Candlestick Master',
    desc: 'Read charts like a pro. Understand patterns and trends.',
    progress: 35,
    reward: '5% Discount',
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    lessons: [
      {
        title: 'Reading a Candle',
        duration: '4 min read',
        completed: true,
        content: `Each candlestick shows four data points for a time period: Open, High, Low, Close (OHLC).\n\nAnatomy:\n• Green candle (bullish) — close > open → price went up\n• Red candle (bearish) — close < open → price went down\n• Body — the thick part between open and close\n• Wick/Shadow — the thin lines showing the high and low\n\nWhat candles tell you:\n• Long body = strong conviction (buyers or sellers dominated)\n• Long wick = rejection (price tested a level but was pushed back)\n• Small body = indecision (neither side won)`,
        quiz: { q: 'A green candle means:', options: ['Price went down', 'Price went up (close > open)', 'Volume increased'], answer: 1 }
      },
      {
        title: 'Doji & Hammers',
        duration: '7 min read',
        completed: true,
        content: `Special candlestick patterns signal potential reversals.\n\nDoji — open ≈ close (tiny body, equal wicks)\n• Signals indecision; often appears before a trend change\n• More significant after a strong trend\n\nHammer — small body at top, long lower wick (2x body)\n• Appears at the bottom of downtrends\n• Shows sellers pushed price down but buyers fought back\n• Bullish reversal signal\n\nInverted Hammer — small body at bottom, long upper wick\n• Also bullish if confirmed by next candle closing higher\n\nShooting Star — like inverted hammer but at top of uptrend\n• Bearish reversal signal`,
        quiz: { q: 'A hammer pattern at the bottom of a downtrend signals:', options: ['Continue selling', 'Potential bullish reversal', 'No useful information'], answer: 1 }
      },
      {
        title: 'Trend Reversals',
        duration: '10 min read',
        completed: false,
        content: `Recognizing when a trend is about to reverse is one of the most valuable skills in trading.\n\nReversal signals:\n• Higher highs → lower high = uptrend weakening\n• Lower lows → higher low = downtrend weakening\n• Volume divergence — price makes new high but volume decreases\n• RSI divergence — price makes new high but RSI makes lower high\n\nCommon reversal patterns:\n1. Double Top/Bottom — price tests same level twice and fails\n2. Head & Shoulders — three peaks, middle highest\n3. Engulfing candle — large candle completely covers previous\n\n⚠️ Never trade a reversal without confirmation. Wait for the next candle.`,
        quiz: { q: 'What confirms a trend reversal?', options: ['A single red candle', 'Price making a lower high after higher highs', 'High volume alone'], answer: 1 }
      },
      {
        title: 'Volume Analysis',
        duration: '8 min read',
        completed: false,
        content: `Volume shows how many units were traded. It's the fuel behind price moves.\n\nRules of volume:\n• Rising price + rising volume = strong uptrend (healthy)\n• Rising price + falling volume = weak rally (likely to reverse)\n• Spike volume = climactic move, often near reversals\n• Low volume = no interest, choppy price action\n\nUsing volume in practice:\n1. Confirm breakouts — a breakout on high volume is more reliable\n2. Spot exhaustion — huge volume spike after a long trend = potential top/bottom\n3. Volume profile — shows which price levels have the most activity (support/resistance)`,
        quiz: { q: 'Rising price with falling volume suggests:', options: ['Strong trend continuation', 'Weak rally that may reverse', 'Increased demand'], answer: 1 }
      },
      {
        title: 'Support & Resistance',
        duration: '15 min read',
        completed: false,
        content: `Support and resistance are price levels where buying or selling pressure concentrates.\n\nSupport — a price level where demand prevents further decline\n• Think of it as a floor\n• More touches = stronger support\n• When broken, often becomes resistance\n\nResistance — a price level where selling prevents further rise\n• Think of it as a ceiling\n• Breakout above resistance on high volume = bullish signal\n\nHow to identify:\n1. Previous highs and lows\n2. Round numbers ($50k, $100k for BTC)\n3. Moving averages (EMA 50, 200)\n4. Volume clusters`,
        quiz: { q: 'When support is broken, it often becomes:', options: ['Stronger support', 'Resistance', 'Irrelevant'], answer: 1 }
      },
      {
        title: 'Chart Patterns',
        duration: '12 min read',
        completed: false,
        content: `Chart patterns are visual formations that predict future price direction.\n\nContinuation patterns (trend continues):\n• Flag/Pennant — brief consolidation after sharp move\n• Triangle — price compresses before breakout\n• Rectangle — price bounces between two levels\n\nReversal patterns (trend changes):\n• Double Top (M shape) — bearish reversal\n• Double Bottom (W shape) — bullish reversal\n• Head & Shoulders — three peaks pattern\n\nKey rules:\n1. Patterns need context — a flag in an uptrend is bullish\n2. Volume confirms — breakout on low volume often fails\n3. Measure the target — height of pattern = expected move`,
        quiz: { q: 'A "flag" pattern in an uptrend indicates:', options: ['Trend reversal', 'Trend continuation after brief consolidation', 'No signal'], answer: 1 }
      },
    ]
  },
  {
    id: 3,
    title: 'Arbitrage Strategies',
    desc: 'How to find and execute risk-free trades across exchanges.',
    progress: 0,
    reward: 'Arb Sniper Badge',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    lessons: [
      {
        title: 'What is Arbitrage?',
        duration: '6 min read',
        completed: false,
        content: `Arbitrage is the simultaneous purchase and sale of the same asset on different markets to profit from price differences.\n\nHow it works:\nBTC on Binance: $97,500\nBTC on Bybit: $97,650\nDifference: $150 per BTC (0.15%)\n\nTypes of crypto arbitrage:\n1. Cross-exchange — same asset, different exchanges\n2. Triangular — three pairs on the same exchange (BTC→ETH→USDT→BTC)\n3. DEX vs CEX — decentralized vs centralized exchange pricing\n\nWhy it works:\n• Different exchanges have different liquidity and user bases\n• Price differences exist for seconds to minutes\n• Bots dominate — manual arb is rare but possible on smaller pairs`,
        quiz: { q: 'Arbitrage profits come from:', options: ['Predicting price direction', 'Price differences between markets', 'Holding assets long-term'], answer: 1 }
      },
      {
        title: 'CEX vs DEX Spreads',
        duration: '9 min read',
        completed: false,
        content: `Centralized exchanges (Binance, Bybit) and decentralized exchanges (Uniswap, Raydium) often have significant price differences.\n\nWhy spreads exist:\n• CEX has order books with tight spreads for popular pairs\n• DEX uses Automated Market Makers (AMMs) — price depends on pool balance\n• Low-liquidity DEX pools can have 1-5% spreads\n\nFinding CEX/DEX spreads:\n1. Compare Binance spot price with Uniswap/Jupiter price\n2. Factor in gas fees (ETH) or priority fees (SOL)\n3. Account for slippage — large orders move DEX price\n\nSpectr Scanner shows you these spreads in real-time on the Smart Ops page.`,
        quiz: { q: 'Why do DEX prices often differ from CEX?', options: ['Government regulation', 'AMM pricing depends on pool balance', 'DEX is always more expensive'], answer: 1 }
      },
      {
        title: 'Execution Latency',
        duration: '11 min read',
        completed: false,
        content: `Speed is critical in arbitrage. The faster you execute, the more likely the opportunity still exists.\n\nLatency factors:\n• Network latency — distance to exchange servers\n• Blockchain confirmation — ETH ~12s per block, SOL ~0.4s\n• Withdrawal processing — some exchanges delay withdrawals\n\nReducing latency:\n1. Pre-fund both exchanges (no transfer needed)\n2. Use API trading instead of manual UI\n3. Choose SOL/L2 chains for faster confirmation\n4. Run bots on cloud servers near exchange data centers\n\nRealistic expectations:\n• Cross-exchange arb: 0.1-0.5% per trade (after fees)\n• DEX/CEX arb: 0.5-2% on low-cap tokens\n• Frequency: 5-20 opportunities per day for major pairs`,
        quiz: { q: 'How to reduce execution latency?', options: ['Trade manually', 'Pre-fund both exchanges', 'Only trade on weekends'], answer: 1 }
      },
      {
        title: 'Using Spectr Scanner',
        duration: '8 min read',
        completed: false,
        content: `Spectr's Smart Ops page is your real-time arbitrage dashboard.\n\nFeatures:\n• Live spreads — Binance vs Bybit prices updated every 5 seconds\n• Net profit % — accounts for trading fees automatically\n• Symbol scanner — monitors BTC, ETH, SOL, and more\n\nHow to use it:\n1. Navigate to Smart Ops in the sidebar\n2. Watch for green profit percentages\n3. When spread > 0.1%, check both exchanges\n4. Execute buy on cheaper exchange, sell on expensive one\n5. Profit is the spread minus fees\n\nPro tips:\n• Spreads widen during high volatility (news events)\n• Weekend spreads tend to be wider (lower liquidity)\n• Always check withdrawal fees before executing`,
        quiz: { q: 'When do arbitrage spreads typically widen?', options: ['During low volatility', 'During high volatility and news events', 'On Mondays'], answer: 1 }
      },
    ]
  },
  {
    id: 4,
    title: 'DeFi & Staking',
    desc: 'How to earn passive income safely.',
    progress: 0,
    reward: 'Earn Badge',
    gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    lessons: [
      {
        title: 'Liquidity Pools',
        duration: '10 min read',
        completed: false,
        content: `Liquidity pools power decentralized exchanges. You deposit token pairs and earn fees from trades.\n\nHow it works:\n1. You deposit equal value of two tokens (e.g., $500 ETH + $500 USDC)\n2. Traders swap between these tokens using your liquidity\n3. You earn a share of trading fees (typically 0.3% per trade)\n\nPopular platforms:\n• Uniswap (Ethereum) — largest DEX by volume\n• Raydium (Solana) — fast and cheap\n• PancakeSwap (BSC) — high APYs for exotic pairs\n\nRisks:\n• Impermanent loss (next lesson)\n• Smart contract bugs\n• Rug pulls on unverified tokens`,
        quiz: { q: 'How do liquidity providers earn money?', options: ['From staking rewards', 'From a share of trading fees', 'From token price appreciation'], answer: 1 }
      },
      {
        title: 'Impermanent Loss',
        duration: '14 min read',
        completed: false,
        content: `Impermanent Loss (IL) occurs when the price ratio of your deposited tokens changes compared to when you deposited them.\n\nExample:\nYou deposit 1 ETH ($2000) + 2000 USDC\nETH price doubles to $4000\n• If you just held: 1 ETH ($4000) + 2000 USDC = $6000\n• In the pool: ~0.707 ETH + ~2828 USDC = $5656\n• Impermanent loss: $344 (5.7%)\n\nMitigating IL:\n1. Stablecoin pairs (USDC/USDT) — near-zero IL\n2. Correlated pairs (ETH/stETH) — minimal price divergence\n3. High fee pools — fees can offset IL\n4. Concentrated liquidity — provide in specific price ranges for higher fees`,
        quiz: { q: 'Which pool has the lowest impermanent loss?', options: ['ETH/DOGE', 'USDC/USDT', 'BTC/MEME'], answer: 1 }
      },
      {
        title: 'Yield Farming 101',
        duration: '12 min read',
        completed: false,
        content: `Yield farming is the practice of moving crypto between protocols to maximize returns.\n\nCommon strategies:\n1. Stake LP tokens — provide liquidity, then stake the LP token for extra rewards\n2. Lending + borrowing — deposit collateral, borrow stablecoins, deploy elsewhere\n3. Auto-compounding — protocols like Beefy automatically reinvest your rewards\n\nEvaluating APY:\n• APY = Annual Percentage Yield (includes compounding)\n• APR = Annual Percentage Rate (simple interest)\n• TVL = Total Value Locked (higher TVL = more trust)\n\nRed flags:\n🔴 APY > 1000% — usually unsustainable\n🔴 Anonymous team + no audit\n🔴 Locked withdrawals\n🔴 Token has no utility beyond farming\n\n✅ Realistic sustainable yields: 5-20% APY for blue chip pairs`,
        quiz: { q: 'An APY above 1000% is usually:', options: ['A great opportunity', 'Unsustainable and risky', 'Guaranteed profit'], answer: 1 }
      },
    ]
  }
]

/* ── Course Viewer with Real Content ── */
function CourseViewer({ module, onClose, onComplete }) {
  const [currentLesson, setCurrentLesson] = useState(
    module.lessons.findIndex(l => !l.completed) >= 0
      ? module.lessons.findIndex(l => !l.completed)
      : 0
  )
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)

  // Block body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  if (!module) return null

  const lesson = module.lessons[currentLesson]
  const isCorrect = quizAnswer === lesson.quiz.answer

  const handleAnswer = (idx) => {
    setQuizAnswer(idx)
    setShowResult(true)
    if (idx === lesson.quiz.answer) {
      onComplete(module.id, currentLesson)
    }
  }

  const goNext = () => {
    if (currentLesson < module.lessons.length - 1) {
      setCurrentLesson(prev => prev + 1)
      setQuizAnswer(null)
      setShowResult(false)
    }
  }

  const goPrev = () => {
    if (currentLesson > 0) {
      setCurrentLesson(prev => prev - 1)
      setQuizAnswer(null)
      setShowResult(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-2 md:p-6"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.98)', backdropFilter: 'blur(15px)',
        zIndex: 9999, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        display: 'block', padding: 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom)'
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="dx-card flex flex-col md:flex-row"
        style={{
          width: '100%', maxWidth: 1000,
          minHeight: '100dvh', // Use minHeight instead of height
          margin: '0 auto',
          padding: 0, overflow: 'visible', position: 'relative',
          borderRadius: 0, border: 'none'
        }}
      >
        {/* Sidebar */}
        <div className="w-full md:w-[280px] h-[35%] md:h-full border-b md:border-r border-white/10 shrink-0" style={{ background: 'var(--surface-1)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{module.title}</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              {module.lessons.filter(l => l.completed).length}/{module.lessons.length} Lessons
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {module.lessons.map((l, i) => (
              <button
                key={i}
                onClick={() => { setCurrentLesson(i); setQuizAnswer(null); setShowResult(false) }}
                style={{
                  width: '100%', textAlign: 'left', padding: '14px 20px',
                  background: currentLesson === i ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
                  border: 'none', borderBottom: '1px solid var(--line)',
                  color: currentLesson === i ? '#fff' : 'var(--muted)',
                  cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center'
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: l.completed ? '#4caf50' : currentLesson === i ? 'var(--accent)' : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#000',
                  flexShrink: 0
                }}>
                  {l.completed ? <CheckCircle size={14} color="#fff" /> : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: currentLesson === i ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                  <div style={{ fontSize: 10, opacity: 0.6 }}>{l.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          {/* Header */}
          <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{lesson.title}</h2>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Lesson {currentLesson + 1} of {module.lessons.length} • {lesson.duration}</span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff',
                width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: '28px 28px 20px',
            minHeight: 0 // Crucial for nested flex scrolling
          }}>
            {/* Lesson text */}
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', whiteSpace: 'pre-line', marginBottom: 32 }}>
              {lesson.content}
            </div>

            {/* Quiz */}
            <div style={{
              background: 'rgba(0, 255, 255, 0.04)',
              border: '1px solid rgba(0, 255, 255, 0.1)',
              borderRadius: 16, padding: 24
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                <Sparkles size={16} /> KNOWLEDGE CHECK
              </div>
              <p style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>{lesson.quiz.q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lesson.quiz.options.map((opt, idx) => {
                  let bg = 'rgba(255,255,255,0.04)'
                  let borderC = 'rgba(255,255,255,0.08)'
                  if (showResult && idx === lesson.quiz.answer) { bg = 'rgba(76, 175, 80, 0.15)'; borderC = '#4caf50' }
                  else if (showResult && idx === quizAnswer && !isCorrect) { bg = 'rgba(255, 59, 48, 0.15)'; borderC = '#ff3b30' }

                  return (
                    <button
                      key={idx}
                      onClick={() => !showResult && handleAnswer(idx)}
                      disabled={showResult}
                      style={{
                        textAlign: 'left', padding: '12px 16px', borderRadius: 10,
                        background: bg, border: `1px solid ${borderC}`,
                        color: '#fff', cursor: showResult ? 'default' : 'pointer',
                        fontSize: 14, transition: 'all 0.2s',
                        opacity: showResult && idx !== quizAnswer && idx !== lesson.quiz.answer ? 0.4 : 1,
                        fontFamily: 'inherit'
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: 16, padding: '10px 14px', borderRadius: 8,
                    background: isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 59, 48, 0.1)',
                    fontSize: 13, color: isCorrect ? '#4caf50' : '#ff3b30', fontWeight: 600
                  }}
                >
                  {isCorrect ? '✅ Correct! Lesson marked as complete.' : '❌ Not quite. Try the next lesson and come back!'}
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom nav */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
            <button className="dx-btn secondary" onClick={goPrev} disabled={currentLesson === 0} style={{ gap: 6 }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <button className="dx-btn primary" onClick={goNext} disabled={currentLesson === module.lessons.length - 1} style={{ gap: 6 }}>
              Next Lesson <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div >
  )
}

export default function Academy() {
  const [modules, setModules] = useState(MODULES)
  const [activeModule, setActiveModule] = useState(null)

  const handleComplete = (moduleId, lessonIdx) => {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m
      const updated = { ...m, lessons: m.lessons.map((l, i) => i === lessonIdx ? { ...l, completed: true } : l) }
      updated.progress = Math.round(updated.lessons.filter(l => l.completed).length / updated.lessons.length * 100)
      return updated
    }))
    // Also update active module if open
    setActiveModule(prev => {
      if (!prev || prev.id !== moduleId) return prev
      const updated = { ...prev, lessons: prev.lessons.map((l, i) => i === lessonIdx ? { ...l, completed: true } : l) }
      updated.progress = Math.round(updated.lessons.filter(l => l.completed).length / updated.lessons.length * 100)
      return updated
    })
  }

  const handleStart = (m) => {
    const i = modules.findIndex(mod => mod.id === m.id)
    if (i > 0 && modules[i - 1].progress < 100) {
      console.warn("Prev module locked");
      return
    }
    setActiveModule(m)
  }

  return (
    <div className="dx-panels premium-dashboard">
      <AnimatePresence>
        {activeModule && <CourseViewer module={activeModule} onClose={() => setActiveModule(null)} onComplete={handleComplete} />}
      </AnimatePresence>

      <div className="dx-card ta-head">
        <div>
          <h2 style={{ margin: 0 }}>Spectr Academy</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            Master crypto trading and unlock exclusive scanner features.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ padding: '8px 12px', background: 'rgba(255, 152, 0, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#ff9800' }}>XP LEVEL</div>
            <div style={{ fontWeight: 700 }}>LVL {1 + modules.filter(m => m.progress === 100).length}</div>
          </div>
          <div style={{ padding: '8px 12px', background: 'rgba(26, 242, 255, 0.1)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>COMPLETED</div>
            <div style={{ fontWeight: 700 }}>
              {modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0)}/{modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {modules.map((m, i) => {
          const isLocked = i > 0 && modules[i - 1].progress < 100

          return (
            <motion.div
              key={m.id}
              className="dx-card"
              style={{ opacity: isLocked ? 0.6 : 1, position: 'relative', overflow: 'hidden' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLocked ? 0.6 : 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Gradient accent top */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: m.gradient }} />

              {m.progress === 100 && (
                <div style={{
                  position: 'absolute', top: 0, right: 0,
                  background: '#4caf50', color: '#000',
                  fontSize: 10, fontWeight: 700, padding: '4px 8px',
                  borderBottomLeftRadius: 8
                }}>
                  COMPLETED
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                  <BookOpen size={16} /> MODULE 0{m.id}
                </div>
                {isLocked && <Lock size={18} color="var(--muted)" />}
              </div>

              <h3 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{m.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20, lineHeight: '1.5em', minHeight: 42 }}>
                {m.desc}
              </p>

              <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  <Award size={16} color="#ff9800" /> Reward: <span style={{ color: '#ff9800' }}>{m.reward}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--line)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: '100%', background: m.progress === 100 ? '#4caf50' : 'var(--accent)', borderRadius: 3 }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--muted)' }}>
                  <span>{m.progress}% Complete</span>
                  <span>{m.lessons.length} Lessons</span>
                </div>
              </div>

              <button
                className={`dx-btn ${m.progress === 100 ? 'secondary' : 'primary'}`}
                style={{ width: '100%', justifyContent: 'center', gap: 8 }}
                disabled={isLocked}
                onClick={() => handleStart(m)}
              >
                {m.progress === 100 ? 'Review Course' : isLocked ? 'Locked' : m.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                {!isLocked && <PlayCircle size={16} />}
              </button>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
