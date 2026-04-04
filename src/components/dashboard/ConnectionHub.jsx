import React, { useState, useEffect } from 'react'
import { useWebSocket } from '@/context/WebSocketContext'
import { monitor } from '@/services/providers/market'
import { Activity, Radio, Globe, ShieldCheck, AlertCircle, ChevronDown, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ConnectionHub() {
  const { isBinanceConnected, isBybitConnected, throughput } = useWebSocket()
  const [proxyStatus, setProxyStatus] = useState('UNKNOWN')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setProxyStatus(monitor.getStatus())
    const unsub = monitor.subscribe(status => setProxyStatus(status))
    return unsub
  }, [])

  const isAllGood = isBinanceConnected && isBybitConnected && proxyStatus === 'LIVE'

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
          isAllGood ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}
      >
        <div className="relative">
          <Activity size={14} className={isAllGood ? 'animate-pulse' : ''} />
          {isAllGood && <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full blur-[2px]" />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
          {isAllGood ? 'Network Verified' : 'Sync Issue'}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[1001]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-72 p-5 rounded-2xl bg-[#0a0a0f] border border-white/10 shadow-2xl z-[1002] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Live Data Streams</span>
                  <div className="flex flex-col gap-3">
                    <StatusItem label="Binance WS" connected={isBinanceConnected} />
                    <StatusItem label="Bybit WS" connected={isBybitConnected} />
                    <StatusItem label="API Proxy" status={proxyStatus} />
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-[11px] font-bold text-white/70">Throughput</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-400">{throughput} msg/s</span>
                </div>


                <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 italic">
                  <ShieldCheck size={10} />
                  Real-time exchange verification active
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusItem({ label, connected, status }) {
  const isOk = status ? status === 'LIVE' : connected
  return (
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-bold text-white/60">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-[9px] font-black uppercase tracking-tighter ${isOk ? 'text-cyan-400' : 'text-red-400'}`}>
          {isOk ? 'Optimal' : (status || 'Offline')}
        </span>
        <div className={`w-1.5 h-1.5 rounded-full ${isOk ? 'bg-cyan-400 shadow-[0_0_8px_#00FFFF]' : 'bg-red-500 shadow-[0_0_8px_#FF4560]'}`} />
      </div>
    </div>
  )
}
