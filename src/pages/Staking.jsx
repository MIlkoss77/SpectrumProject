import React, { useState } from 'react'
import { Coins, Lock, TrendingUp, Zap, Wallet, CheckCircle } from 'lucide-react'
import { useWebSocket } from '@/context/WebSocketContext'
import { motion, AnimatePresence } from 'framer-motion'
import NumberTicker from '@/components/NumberTicker'
import './dashboard.css'

const POOLS = [
  { id: 1, asset: 'USDT', name: 'USDT Flex Earn', apy: 12.5, term: 'Flexible', risk: 'Low', icon: '$', color: '#26a17b', gradient: 'linear-gradient(135deg, #26a17b33, #26a17b11)' },
  { id: 2, asset: 'ETH', name: 'ETH 2.0 Staking', apy: 4.2, term: 'Locked', risk: 'Low', icon: 'Ξ', color: '#627eea', gradient: 'linear-gradient(135deg, #627eea33, #627eea11)' },
  { id: 3, asset: 'SOL', name: 'Solana High Yield', apy: 8.5, term: '30 Days', risk: 'Med', icon: '◎', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d433, #06b6d411)' },
]

import StakingCalculator from '../components/StakingCalculator'

export default function Staking() {
  const { tickers, subscribe } = useWebSocket()
  const [staked, setStaked] = useState({})
  const [toast, setToast] = useState(null)

  React.useEffect(() => {
    subscribe(['ethusdt@miniTicker', 'solusdt@miniTicker'])
  }, [subscribe])

  const handleStake = (pool) => {
    if (staked[pool.id]) {
      setStaked(prev => { const next = { ...prev }; delete next[pool.id]; return next })
      setToast({ msg: `Unstaked from ${pool.name}`, type: 'info' })
    } else {
      setStaked(prev => ({ ...prev, [pool.id]: true }))
      setToast({ msg: `Successfully staked in ${pool.name}! Earning ${pool.apy}% APY`, type: 'success' })
    }
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="dx-panels">
      <StakingCalculator />

      <div className="dx-card ta-head">
        <div>
          <h2 style={{ margin: 0 }}>Start Earning</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
            Passive income on your crypto. Simple and secure.
          </p>
        </div>
        {Object.keys(staked).length > 0 && (
          <div style={{ padding: '8px 14px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: 10, fontSize: 13, color: '#4caf50', fontWeight: 600 }}>
            {Object.keys(staked).length} Pool{Object.keys(staked).length > 1 ? 's' : ''} Active
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {POOLS.map(p => (
          <motion.div
            key={p.id}
            className="dx-card"
            style={{ position: 'relative', overflow: 'hidden' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: p.id * 0.1 }}
          >
            {/* Top gradient accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.color}, transparent)` }} />

            {staked[p.id] && (
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: '#4caf50', color: '#000',
                fontSize: 10, fontWeight: 700, padding: '4px 10px',
                borderBottomLeftRadius: 8
              }}>
                EARNING
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: p.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: p.color
              }}>
                {p.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.term} • {p.risk} Risk</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Annual Yield</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{p.apy}%</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>Est. Daily / $1k</div>
                <div style={{ fontWeight: 600, color: 'var(--ok)' }}>
                  +<NumberTicker value={(1000 * (p.apy / 100) / 365)} prefix="$" decimals={2} />
                </div>
              </div>
            </div>

            <button
              className={`dx-btn ${staked[p.id] ? 'secondary' : ''}`}
              style={{ width: '100%', justifyContent: 'center', gap: 8 }}
              onClick={() => handleStake(p)}
            >
              {staked[p.id] ? (
                <><CheckCircle size={16} /> Unstake</>
              ) : (
                <><Wallet size={16} /> Start Earning</>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
