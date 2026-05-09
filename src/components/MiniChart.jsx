import React, { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function MiniChart({ data = [], color = '#00FFFF', height = 120 }) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    
    return data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((val - min) / range) * 100
      return `${x},${y}`
    }).join(' ')
  }, [data])

  return (
    <div style={{ width: '100%', height, position: 'relative', overflow: 'hidden' }}>
      <svg 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none" 
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.polyline
          points={`0,100 ${points} 100,100`}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
        />
      </svg>
    </div>
  )
}
