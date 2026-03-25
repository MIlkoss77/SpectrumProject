import React, { useEffect, useRef } from 'react'
import { useMotionValue, useSpring, motion } from 'framer-motion'

export default function NumberTicker({ value, prefix = '', suffix = '', decimals = 2, className = '' }) {
    const ref = useRef(null)

    // Parse numeric value from string (remove $, commas)
    const numericValue = typeof value === 'string'
        ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
        : value

    const motionValue = useMotionValue(numericValue || 0)
    const springValue = useSpring(motionValue, {
        damping: 20,
        stiffness: 100,
        mass: 0.5
    })

    useEffect(() => {
        if (numericValue !== undefined && !isNaN(numericValue)) {
            motionValue.set(numericValue)
        }
    }, [numericValue, motionValue])

    useEffect(() => {
        return springValue.on('change', (latest) => {
            if (ref.current) {
                // Format with commas and fixed decimals
                const formatted = latest.toLocaleString('en-US', {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals
                })
                ref.current.textContent = `${prefix}${formatted}${suffix}`
            }
        })
    }, [springValue, decimals, prefix, suffix])

    // Initial render
    const displayValue = Number.isFinite(numericValue) ? numericValue.toFixed(decimals) : '---'
    return <span className={className} ref={ref}>{prefix}{displayValue}{suffix}</span>
}
