import React, { useEffect, useState } from 'react'
import { getArbitrage } from '@/services/providers/market'
import { ArrowRight, RefreshCw, Zap, Loader2, Scale, CheckCircle } from 'lucide-react'
import NumberTicker from '@/components/NumberTicker'
import { useExecution } from '@/services/trading/execution'
import { useTrading } from '@/context/TradingContext'
import './dashboard.css'

export default function Arbitrage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(null) // ID of item being traded
  const { placeOrder } = useExecution()
  const { tradingMode } = useTrading()

  const refresh = async () => {
    setLoading(true)
    try {
      const res = await getArbitrage(0.3)
      setItems(res.items || [])
    } finally {
      setLoading(false)
    }
  }

  const handleTrade = async (item, idx) => {
    setExecuting(idx);
    try {
      await placeOrder({
        symbol: item.symbol,
        side: 'BUY',
        amount: 0.1, // Default amount for demo
        price: item.ask,
        type: 'MARKET'
      });
      // Optionally show a toast here
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setExecuting(null);
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="w-full animate-in">
      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <Scale size={18} className="text-cyan-400" />
            <span>Smart Ops</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE SCANNED
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">Arbitrage Intelligence</h1>
        <p className="text-sm text-white/40 max-w-xl">
          AI-detected price differences across exchanges. Risk-free profit potential through automated scanning of Binance and Bybit.
        </p>
      </div>

      <div className="dx-grid-premium">
        {items.length === 0 && !loading && <div className="col-span-full py-20 text-center text-white/20 font-bold italic">No opportunities found right now.</div>}
        {loading && items.length === 0 && <div className="col-span-full py-20 text-center"><Loader2 className="spin text-cyan-400 mb-2 mx-auto" size={32} /><div className="text-white/40 font-bold tracking-widest text-[10px] uppercase">Scanning Market Spreads...</div></div>}

        {items.map((item, idx) => {
          const isProfit = item.status === 'PROFIT'
          return (
            <div key={idx} className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: isProfit ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.05)',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '260px'
              }}>

              {/* Hover Glow */}
              <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${isProfit ? 'bg-cyan-400' : 'bg-white/10'}`} />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{item.symbol}</div>
                    <div className="text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">Cross-Exchange</div>
                  </div>
                  <div className={`dx-tag flex items-center gap-1.5 ${isProfit ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                    {isProfit && <Zap size={10} fill="currentColor" />}
                    {isProfit ? 'OPPORTUNITY' : 'WATCHING'}
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/40 border border-white/5 mb-6">
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Buy on</div>
                    <div className="text-xs font-bold text-white">{item.fromEx}</div>
                  </div>
                  <ArrowRight size={14} className="text-white/20" />
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-white/30 uppercase mb-1">Sell on</div>
                    <div className="text-xs font-bold text-white">{item.toEx}</div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-[9px] font-bold text-white/30 uppercase mb-1">{isProfit ? 'Estimated Net Profit' : 'Market Spread'}</div>
                    <div className={`text-2xl font-mono font-bold tabular-nums ${isProfit ? 'text-cyan-400' : 'text-white'}`}>
                      {item.netPct > 0 ? '+' : ''}<NumberTicker value={item.netPct} suffix="%" />
                    </div>
                  </div>
                  <div className="text-[9px] font-bold text-white/20 uppercase">After Fees</div>
                </div>

                <button
                  onClick={() => handleTrade(item, idx)}
                  className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    background: isProfit ? 'linear-gradient(90deg, rgba(34,211,238,0.1) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(255,255,255,0.05)',
                    color: isProfit ? '#22d3ee' : '#fff',
                    border: `1px solid ${isProfit ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                  disabled={!isProfit || executing === idx}
                >
                  {executing === idx ? (
                    <Loader2 size={14} className="spin" />
                  ) : isProfit ? (
                    <Zap size={14} fill="currentColor" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  {executing === idx ? 'EXECUTING...' : isProfit ? 'EXECUTE SMART TRADE' : 'SCANNING SPREAD'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
