import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, AlertTriangle } from 'lucide-react'
import './dashboard.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', textAlign: 'center',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Glowing 404 */}
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <div style={{
            fontSize: 'clamp(80px, 20vw, 160px)',
            fontWeight: 900,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1,
            background: 'linear-gradient(135deg, rgba(0,255,255,0.6) 0%, rgba(79,70,229,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(0,255,255,0.2))',
            userSelect: 'none',
          }}>404</div>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at center, rgba(0,255,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          justifyContent: 'center', marginBottom: 16
        }}>
          <AlertTriangle size={18} color='rgba(0,255,255,0.7)' />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fff' }}>
            Signal Lost
          </h2>
        </div>

        <p style={{
          color: 'var(--muted)', fontSize: 15, maxWidth: 360,
          lineHeight: 1.6, margin: '0 auto 32px'
        }}>
          The page you're looking for doesn't exist or has been moved.
          Return to the dashboard to keep trading.
        </p>

        <button
          className='dx-btn'
          onClick={() => navigate('/')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, margin: '0 auto' }}
        >
          <Home size={16} />
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  )
}
