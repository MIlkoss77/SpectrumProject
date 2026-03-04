import React from 'react';
import { motion } from 'framer-motion';

export default function Skeleton({ className = '', style = {}, variant = 'rect' }) {
    const baseStyle = {
        background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
        backgroundSize: '200% 100%',
        borderRadius: variant === 'circle' ? '50%' : '8px',
        ...style
    };

    return (
        <motion.div
            className={`skeleton-primitive ${className}`}
            style={baseStyle}
            animate={{
                backgroundPosition: ['100% 0', '-100% 0']
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
            }}
        />
    );
}
