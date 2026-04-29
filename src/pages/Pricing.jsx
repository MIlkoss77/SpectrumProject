import React, { useState, useEffect } from 'react'
import { Check, Zap, Crown, ChevronRight, Shield, CheckCircle, Sparkles, Copy, ExternalLink, X, Wallet, Coins } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import './dashboard.css'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      '3 Alerts per day',
      'Overview dashboard',
      'Basic news feed',
      'Community support'
    ],
    cta: 'Current Plan',
    popular: false,
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'The Ultimate Edge for High-Performance Traders',
    features: [
      'Unlimited Alerts & Notifications',
      'Full Degen Intel (Scout) Access',
      'Elite Community Entry',
      'AI Analysis & Score Validation',
      'Whale Tracking & Sentiment',
      'Priority Support',
      'Zero Ads Experience'
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    gradient: 'linear-gradient(135deg, #00FFFF, #4F46E5)'
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 499,
    period: 'one-time',
    description: 'Founding Member — Pay Once, Own Forever',
    features: [
      'Everything in Pro + Beta access',
      'Lifetime platform access',
      'Exclusive Community Badge',
      'Future Premium Modules Inc.',
      '1-on-1 Onboarding Call'
    ],
    cta: 'Become a Founder',
    popular: false,
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
  }
];

const CRYPTO_OPTIONS = [
  { id: 'USDT', label: 'USDT (TRC-20)', icon: Coins, color: '#26A17B' },
  { id: 'SOL', label: 'Solana (SOL)', icon: Zap, color: '#9945FF' },
  { id: 'ETH', label: 'Ethereum (ETH)', icon: Wallet, color: '#627EEA' },
]

function DepositModal({ plan, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [step, setStep] = useState('select') // select | deposit | success
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [depositData, setDepositData] = useState(null)
  const [isAutomated, setIsAutomated] = useState(false)
  const [txId, setTxId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [statusText, setStatusText] = useState('Awaiting Payment')

  // Auto-poll for status if automated
  useEffect(() => {
    let timer;
    if (step === 'deposit' && isAutomated && depositData?.id) {
      timer = setInterval(async () => {
        try {
          const token = localStorage.getItem('spectr_auth_token')
          const res = await axios.post('/api/payments/verify', {
            paymentId: depositData.id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })
          
          if (res.data.status === 'COMPLETED') {
            setStep('success')
            localStorage.setItem('spectr_pro_status', 'true')
            window.dispatchEvent(new Event('proStatusChanged'))
            onSuccess?.()
            clearInterval(timer)
          } else if (res.data.status === 'FAILED') {
            setError('Payment Failed or Expired')
            clearInterval(timer)
          }
        } catch (e) {
          // Silent polling fail
        }
      }, 5000)
    }
    return () => clearInterval(timer)
  }, [step, isAutomated, depositData])

  const handleSelectCrypto = async (crypto) => {
    setSelectedCrypto(crypto)
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('spectr_auth_token')
      const res = await axios.post('/api/payments/deposit', {
        currency: crypto.id,
        planId: plan.id,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.ok) {
        setDepositData(res.data.payment)
        setIsAutomated(res.data.automated)
        setStep('deposit')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create deposit. Please log in.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(depositData.depositAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitTxId = async () => {
    if (!txId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('spectr_auth_token')
      const res = await axios.post('/api/payments/verify', {
        paymentId: depositData.id,
        txId: txId.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.ok) {
        setStep('success')
        localStorage.setItem('spectr_pro_status', 'true')
        window.dispatchEvent(new Event('proStatusChanged'))
        onSuccess?.()
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', pointerEvents: 'none',
        }}
      >
        <div style={{
          maxWidth: 480, width: '100%', pointerEvents: 'all',
          background: 'rgba(17, 17, 17, 0.95)',
          border: '1px solid rgba(0,255,255,0.15)',
          borderRadius: 24, padding: '32px',
          boxShadow: '0 0 80px rgba(0,255,255,0.1)',
          backdropFilter: 'blur(40px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Visual Magic: Subtle Top Glow */}
          <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '100px', background: 'rgba(0,255,255,0.1)', filter: 'blur(40px)', borderRadius: '100%' }} />

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                {step === 'success' ? 'Protocol Activated' : `Upgrade to ${plan.name} Tier`}
              </h3>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500 }}>
                {step === 'select' && 'Select your preferred settlement asset'}
                {step === 'deposit' && isAutomated && 'Gateway active. Polling blockchain for status...'}
                {step === 'deposit' && !isAutomated && `Send $${depositData?.amount} to the secure vault`}
                {step === 'success' && 'Deep institutional intelligence now available.'}
              </p>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, width: 36, height: 36, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)',
              transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.color = '#fff'}>
              <X size={18} />
            </button>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{
              padding: '12px 16px', marginBottom: 20, borderRadius: 12,
              background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.2)',
              color: '#FF4560', fontSize: 13, fontWeight: 700,
            }}>
              {error}
            </motion.div>
          )}

          {/* Step: Select Crypto */}
          {step === 'select' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {CRYPTO_OPTIONS.map(crypto => {
                const Icon = crypto.icon
                return (
                  <button
                    key={crypto.id}
                    onClick={() => handleSelectCrypto(crypto)}
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 20px', borderRadius: 18,
                      border: '1px solid rgba(255,255,255,0.04)',
                      background: 'rgba(255,255,255,0.02)',
                      color: '#fff', cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = `${crypto.color}30`
                      e.currentTarget.style.background = `${crypto.color}08`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: `${crypto.color}10`, border: `1px solid ${crypto.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color={crypto.color} />
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.3px' }}>{crypto.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>FAST & SECURE</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 8 }}>
                       <div style={{ fontSize: 14, fontWeight: 800 }}>${plan.price}</div>
                    </div>
                    <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                  </button>
                )
              })}
            </div>
          )}

          {/* Step: Deposit Address */}
          {step === 'deposit' && depositData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{
                padding: '24px', borderRadius: 20,
                background: 'rgba(0,255,255,0.02)', border: '1px solid rgba(0,255,255,0.06)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#00FFFF', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
                  {isAutomated ? 'LIVE DEPOSIT GATEWAY' : 'MANUAL VAULT ADDRESS'}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <code style={{
                    flex: 1, fontSize: 12, padding: '14px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.04)',
                    fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: '#fff',
                    textAlign: 'left'
                  }}>
                    {depositData.depositAddress}
                  </code>
                  <button onClick={handleCopyAddress} style={{
                    background: copied ? 'rgba(0,227,150,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${copied ? 'rgba(0,227,150,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 14, width: 48, height: 48, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: copied ? '#00E396' : '#fff', transition: 'all 0.3s',
                  }}>
                    {copied ? <Check size={20} /> : <Copy size={18} />}
                  </button>
                </div>

                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: 8, 
                  padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,0.03)',
                  fontSize: 13, color: '#fff', fontWeight: 700
                }}>
                  Send <span style={{ color: '#00FFFF' }}>{depositData.payAmount || plan.price} {selectedCrypto.id}</span>
                </div>
              </div>

              {isAutomated ? (
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#00FFFF', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                       <div className="animate-pulse w-2 h-2 rounded-full bg-cyan-400" />
                       AUTO-TRACKING ENGAGED
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>
                      System is polling blockchain explorers. <br/> Pro status will unlock instantly after 1 confirm.
                    </p>
                 </div>
              ) : (
                <button
                  onClick={() => setStep('txid')}
                  className="dx-btn"
                  style={{
                    width: '100%', justifyContent: 'center',
                    background: 'rgba(0,255,255,0.08)',
                    border: '1px solid rgba(0,255,255,0.15)', color: '#00FFFF',
                    height: 52, borderRadius: 16, fontSize: 15, fontWeight: 800
                  }}
                >
                  <Shield size={18} /> Confirm Manual Transfer
                </button>
              )}
            </div>
          )}

          {/* Step: Enter TxID */}
          {step === 'txid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Transaction Identifier (TxID)
                </label>
                <input
                  type="text"
                  value={txId}
                  onChange={e => setTxId(e.target.value)}
                  placeholder="0x... paste hash from explorer"
                  autoFocus
                  style={{
                    width: '100%', padding: '16px', borderRadius: 16,
                    border: '1px solid rgba(0,255,255,0.12)',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff', fontSize: 13, fontFamily: 'var(--font-mono)',
                    outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmitTxId()}
                />
              </div>

              <button
                onClick={handleSubmitTxId}
                disabled={!txId.trim() || loading}
                className="dx-btn"
                style={{
                  width: '100%', justifyContent: 'center',
                  background: 'var(--accent)', color: '#000', fontWeight: 900,
                  height: 52, borderRadius: 16, fontSize: 15,
                  opacity: (!txId.trim() || loading) ? 0.5 : 1,
                }}
              >
                {loading ? 'Validating...' : 'Unlock Membership'}
              </button>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, margin: '0 auto 24px',
                background: 'rgba(0,227,150,0.08)', border: '1px solid rgba(0,227,150,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(0,227,150,0.1)'
              }}>
                <CheckCircle size={40} color="#00E396" />
              </div>
              <h3 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 900, letterSpacing: '-0.5px' }}>
                Access <span style={{ color: '#00FFFF' }}>Granted</span>
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px', fontWeight: 500 }}>
                Membership authenticated. Terminal intelligence is now processing at full capacity.
              </p>
              <button
                onClick={onClose}
                className="dx-btn"
                style={{
                  width: '100%', justifyContent: 'center',
                  background: 'var(--accent)', color: '#000', fontWeight: 900,
                  height: 52, borderRadius: 16, fontSize: 15
                }}
              >
                Enter Terminal <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default function Pricing() {
  const { t } = useTranslation()
  const [depositPlan, setDepositPlan] = useState(null)
  const [isPro, setIsPro] = useState(() => localStorage.getItem('spectr_pro_status') === 'true')

  useEffect(() => {
    const handleProChange = () => setIsPro(localStorage.getItem('spectr_pro_status') === 'true')
    window.addEventListener('proStatusChanged', handleProChange)
    return () => window.removeEventListener('proStatusChanged', handleProChange)
  }, [])

  // Check Pro status from backend on mount
  useEffect(() => {
    const checkProStatus = async () => {
      try {
        const token = localStorage.getItem('spectr_auth_token')
        if (!token) return
        const res = await axios.get('/api/payments/status', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.ok && res.data.isPro) {
          localStorage.setItem('spectr_pro_status', 'true')
          setIsPro(true)
        }
      } catch {
        // Silent — fallback to localStorage
      }
    }
    checkProStatus()
  }, [])

  const handleUpgrade = (plan) => {
    if (plan.id === 'free') return
    setDepositPlan(plan)
  }

  return (
    <div className="dx-panels">
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.15)' }}>
          <Sparkles size={12} /> {t('ui.transparent_pricing') || 'Transparent Pricing'}
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, margin: '0 0 12px',
          background: 'linear-gradient(135deg, #fff 30%, rgba(0,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -1
        }}>
          {t('pages.pricing.headline') || 'Choose Your Edge'}
        </h1>
        <p style={{ maxWidth: 440, margin: '0 auto', color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
          {t('pages.pricing.subline') || 'Pay with crypto. No hidden fees. Instant activation.'}
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        maxWidth: 1000,
        margin: '0 auto'
      }}>
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            className="dx-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              position: 'relative',
              border: plan.popular ? '2px solid var(--accent)' : '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            {/* Top gradient accent */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: plan.gradient }} />

            {plan.popular && (
              <div style={{
                position: 'absolute', top: 16, right: -32,
                background: 'linear-gradient(135deg, #00FFFF, #4F46E5)',
                color: 'black', padding: '4px 40px',
                fontSize: 10, fontWeight: 800,
                transform: 'rotate(45deg)',
                letterSpacing: 1
              }}>
                POPULAR
              </div>
            )}

            <div style={{ marginBottom: 24, marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {plan.id === 'pro' && <Crown size={20} color="var(--accent)" />}
                {plan.id === 'lifetime' && <Zap size={20} color="#FFD700" />}
                <h3 style={{ margin: 0, fontSize: 20 }}>{plan.name}</h3>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>{plan.description}</p>
            </div>

            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 48, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                ${plan.price}
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>
                {plan.period === 'forever' ? '' : `/${plan.period}`}
              </span>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 12, fontSize: 14, color: 'var(--text)'
                }}>
                  <Check size={16} color="var(--accent)" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Pro status indicator */}
            {isPro && plan.id !== 'free' && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', borderRadius: 12, marginBottom: 12,
                background: 'rgba(0,227,150,0.08)', border: '1px solid rgba(0,227,150,0.2)',
                color: '#00E396', fontSize: 13, fontWeight: 600,
              }}>
                <CheckCircle size={16} /> Active
              </div>
            )}

            <button
              className={`dx-btn ${plan.popular ? '' : 'secondary'}`}
              style={{ width: '100%', justifyContent: 'center', cursor: plan.id === 'free' ? 'default' : 'pointer' }}
              onClick={() => handleUpgrade(plan)}
              disabled={plan.id === 'free' || isPro}
            >
              {isPro && plan.id !== 'free' ? (
                <><Shield size={16} /> Pro Active</>
              ) : (
                <>{plan.cta} {plan.id !== 'free' && <ChevronRight size={16} />}</>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div style={{
        textAlign: 'center', marginTop: 48, padding: '24px',
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.02)', maxWidth: 500, margin: '48px auto 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
          <Shield size={14} color='var(--accent)' />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase' }}>{t('ui.secure_private') || 'Secure & Private'}</span>
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
          <Shield size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {t('pages.pricing.secure_desc') || 'Payments processed via blockchain — transparent and verifiable.'}<br />
          Questions? <a href="mailto:hello@spectr.trade" style={{ color: 'var(--accent)', textDecoration: 'none' }}>hello@spectr.trade</a>
        </p>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {depositPlan && (
          <DepositModal
            plan={depositPlan}
            onClose={() => setDepositPlan(null)}
            onSuccess={() => setIsPro(true)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
