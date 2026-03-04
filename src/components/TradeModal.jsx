import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrade } from '@/context/TradeContext'
import { X, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import './trade-modal.css'

export default function TradeModal() {
    const { isOpen, activeAsset, closeTrade } = useTrade()
    const [step, setStep] = useState('input') // input, processing, success
    const [amount, setAmount] = useState('1000')

    // Reset state when opening
    useEffect(() => {
        if (isOpen) setStep('input')
    }, [isOpen])

    if (!isOpen || !activeAsset) return null

    const handleExecute = () => {
        setStep('processing')
        // Simulate network request
        setTimeout(() => {
            setStep('success')
        }, 2000)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="trade-overlay">
                    <motion.div
                        className="trade-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTrade}
                    />

                    <motion.div
                        className="trade-modal"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    >
                        <button className="close-btn" onClick={closeTrade}><X size={20} /></button>

                        <div className="trade-header">
                            <div className="coin-icon">{activeAsset.symbol.substring(0, 1)}</div>
                            <div>
                                <h2>{activeAsset.action || 'Trade'} {activeAsset.symbol}</h2>
                                <span className="price-tag">${activeAsset.price?.toLocaleString()}</span>
                            </div>
                        </div>

                        {step === 'input' && (
                            <div className="trade-content">
                                <div className="input-group">
                                    <label>Amount (USDT)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="est-receive">
                                    <span>Est. Receive:</span>
                                    <span>{(parseFloat(amount) / activeAsset.price).toFixed(6)} {activeAsset.symbol}</span>
                                </div>

                                <div className="info-row">
                                    <span>Fee (0.1%)</span>
                                    <span>${(parseFloat(amount) * 0.001).toFixed(2)}</span>
                                </div>

                                <button className="primary-btn execute-btn" onClick={handleExecute}>
                                    Execute Trade <ArrowRight size={18} />
                                </button>
                            </div>
                        )}

                        {step === 'processing' && (
                            <div className="trade-status">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                >
                                    <Loader2 size={48} color="var(--accent)" />
                                </motion.div>
                                <h3>Executing Order...</h3>
                                <p>Broadcasting to blockchain</p>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="trade-status success">
                                <CheckCircle size={56} color="#34C759" />
                                <h3>Order Filled!</h3>
                                <p>Bought {(parseFloat(amount) / activeAsset.price).toFixed(6)} {activeAsset.symbol}</p>
                                <button className="secondary-btn" onClick={closeTrade}>Done</button>
                            </div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
