import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTrade } from '@/context/TradeContext'
import { X, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import axios from 'axios'
import './trade-modal.css'

export default function TradeModal() {
    const { isOpen, activeAsset, closeTrade } = useTrade()
    const [step, setStep] = useState('input') // input, processing, success, error
    const [amount, setAmount] = useState('1000')
    const [errorMsg, setErrorMsg] = useState('')

    // Reset state when opening
    useEffect(() => {
        if (isOpen) setStep('input')
    }, [isOpen])

    if (!isOpen || !activeAsset) return null

    const handleExecute = async () => {
        setStep('processing')
        setErrorMsg('')
        
        try {
            // Get token from localStorage (assuming this is where it's stored for now)
            const token = localStorage.getItem('token')
            
            const response = await axios.post('/api/trade/execute', {
                symbol: activeAsset.symbol,
                amount: amount,
                side: activeAsset.action?.toLowerCase() || 'buy',
                exchange: activeAsset.exchange || 'binance', // Fallback to binance
                type: 'market'
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (response.data.ok) {
                setStep('success')
            } else {
                throw new Error(response.data.error || 'Execution failed')
            }
        } catch (err) {
            console.error('Trade Execution Failed:', err)
            setErrorMsg(err.message || 'Network error occurred')
            setStep('error')
        }
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
                                    Execute Trade <ChevronRight size={18} />
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

                        {step === 'error' && (
                            <div className="trade-status error">
                                <AlertCircle size={56} color="#FF4560" />
                                <h3>Execution Failed</h3>
                                <p>{errorMsg}</p>
                                <button className="secondary-btn" onClick={() => setStep('input')}>Try Again</button>
                            </div>
                        )}

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
