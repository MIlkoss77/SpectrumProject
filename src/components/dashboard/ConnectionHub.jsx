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
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
          borderRadius: '12px', border: '1px solid',
          transition: 'all 0.3s',
          backgroundColor: isAllGood ? 'rgba(0, 255, 255, 0.05)' : 'rgba(255, 69, 96, 0.05)',
          borderColor: isAllGood ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 69, 96, 0.2)',
          color: isAllGood ? '#00FFFF' : '#FF4560'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Activity size={14} className={isAllGood ? 'price-pulse-up' : ''} />
          {isAllGood && <div style={{ position: 'absolute', top: -4, right: -4, width: '8px', height: '8px', background: '#00FFFF', borderRadius: '50%', filter: 'blur(2px)' }} />}
        </div>
        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} className="hidden sm:inline">
          {isAllGood ? 'Network Verified' : 'Sync Issue'}
        </span>
        <ChevronDown size={12} style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1001 }} onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '280px', padding: '20px',
                borderRadius: '16px', background: 'rgba(10, 10, 15, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)', zIndex: 1002, backdropFilter: 'blur(24px)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Live Data Streams</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <StatusItem label="Binance WS" connected={isBinanceConnected} />
                    <StatusItem label="Bybit WS" connected={isBybitConnected} />
                    <StatusItem label="API Proxy" status={proxyStatus} />
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={14} color="#00FFFF" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Throughput</span>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#00FFFF' }}>{throughput} msg/s</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.05em', color: isOk ? '#00FFFF' : '#FF4560' }}>
          {isOk ? 'Optimal' : (status || 'Offline')}
        </span>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOk ? '#00FFFF' : '#FF4560', boxShadow: `0 0 8px ${isOk ? '#00FFFF' : '#FF4560'}` }} />
      </div>
    </div>
  )
}

