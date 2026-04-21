import React from 'react';
import { motion } from 'framer-motion';

/**
 * SentimentBar - A precision glassmorphic indicator for market sentiment.
 * @param {number} value - Sentiment from -1 to 1 (Bearish to Bullish)
 */
export default function SentimentBar({ value = 0, label = "AI Sentiment" }) {
    // Normalize -1..1 to 0..100%
    const percentage = ((value + 1) / 2) * 100;
    
    const getColor = (v) => {
        if (v > 0.2) return '#00E396'; // Bullish Green
        if (v < -0.2) return '#FF4560'; // Bearish Red
        return '#8899A6'; // Neutral
    };

    const color = getColor(value);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-end', 
                marginBottom: '6px', 
                padding: '0 2px' 
            }}>
                <span style={{ 
                    fontSize: '9px', 
                    fontWeight: 900, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em', 
                    color: 'rgba(255,255,255,0.3)' 
                }}>
                    {label}
                </span>
                <span style={{ 
                    fontSize: '10px', 
                    fontFamily: 'var(--font-mono)', 
                    fontWeight: 700, 
                    color 
                }}>
                    {value > 0 ? '+' : ''}{(value * 100).toFixed(0)}%
                </span>
            </div>
            
            <div style={{ 
                height: '6px', 
                width: '100%', 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                borderRadius: '99px', 
                overflow: 'hidden', 
                border: '1px solid rgba(255,255,255,0.05)', 
                position: 'relative' 
            }}>
                {/* Center marker */}
                <div style={{ 
                    position: 'absolute', 
                    left: '50%', 
                    top: 0, 
                    bottom: 0, 
                    width: '1px', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    zIndex: 10 
                }} />
                
                <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ 
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}33`
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    style={{ 
                        height: '100%', 
                        borderRadius: '99px', 
                        transition: 'background-color 0.5s ease' 
                    }}
                />
            </div>
            
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginTop: '4px', 
                padding: '0 2px',
                fontSize: '7px', 
                fontWeight: 900, 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px' 
            }}>
                <span style={{ color: 'rgba(255,69,96,0.4)' }}>Bearish</span>
                <span style={{ color: 'rgba(255,255,255,0.1)' }}>Neutral</span>
                <span style={{ color: 'rgba(0,227,150,0.4)' }}>Bullish</span>
            </div>
        </div>
    );
}
