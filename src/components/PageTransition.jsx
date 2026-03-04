import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const pageVariants = {
    initial: {
        opacity: 0,
        y: 10,
        scale: 0.99
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -10,
        scale: 1.01
    }
}

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
}

export default function PageTransition({ children }) {
    const { pathname } = useLocation()

    return (
        <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    )
}
