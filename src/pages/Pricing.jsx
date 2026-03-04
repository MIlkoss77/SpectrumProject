import React, { useState } from 'react'
import { Check, Zap, Crown, ArrowRight, Mail, CheckCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    price: 19.90,
    period: 'month',
    description: 'Unlock the full power of Spectr',
    features: [
      'Unlimited Alerts',
      'All features unlocked',
      'Real-time notifications',
      'Super Score AI Analysis',
      'Whale tracking',
      'Priority support',
      'Export data'
    ],
    cta: 'Upgrade Now',
    popular: true,
    gradient: 'linear-gradient(135deg, #00FFFF, #4F46E5)'
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 299,
    period: 'one-time',
    description: 'Pay once, own forever',
    features: [
      'Everything in Pro',
      'Lifetime access',
      'Future features included',
      'VIP Discord access',
      '1-on-1 onboarding call'
    ],
    cta: 'Get Lifetime',
    popular: false,
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)'
  }
]

export default function Pricing() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState({})
  const [activePlan, setActivePlan] = useState(null)

  const handleUpgrade = (planId) => {
    if (planId === 'free') return
    if (!email || !email.includes('@')) {
      setActivePlan(planId)
      return
    }
    // Save to localStorage as waitlist
    const waitlist = JSON.parse(localStorage.getItem('waitlist') || '[]')
    waitlist.push({ email, plan: planId, ts: Date.now() })
    localStorage.setItem('waitlist', JSON.stringify(waitlist))

    // Simulate Premium Unlock
    localStorage.setItem('spectr_pro_status', 'true')
    window.dispatchEvent(new Event('proStatusChanged'))

    setSubmitted(prev => ({ ...prev, [planId]: true }))
    setEmail('')
    setActivePlan(null)
  }

  return (
    <div className="dx-panels">
      <header style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12, padding: '4px 12px', borderRadius: 20, background: 'rgba(0,255,255,0.06)', border: '1px solid rgba(0,255,255,0.15)' }}>
          <Sparkles size={12} /> Transparent Pricing
        </div>
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, margin: '0 0 12px',
          background: 'linear-gradient(135deg, #fff 30%, rgba(0,255,255,0.8) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: -1
        }}>
          Choose Your Edge
        </h1>
        <p style={{ maxWidth: 440, margin: '0 auto', color: 'var(--muted)', fontSize: 15, lineHeight: 1.7 }}>
          No hidden fees. No lock-in. Cancel anytime.
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

            {/* Waitlist email input */}
            <AnimatePresence>
              {(activePlan === plan.id || submitted[plan.id]) && plan.id !== 'free' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: 16, overflow: 'hidden' }}
                >
                  {submitted[plan.id] ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '12px 16px', borderRadius: 10,
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: '#4caf50', fontSize: 13, fontWeight: 600
                    }}>
                      <CheckCircle size={16} /> You're on the waitlist! We'll notify you.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        autoFocus
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: 10,
                          border: '1px solid rgba(0, 255, 255, 0.2)',
                          background: 'rgba(255,255,255,0.04)',
                          color: 'var(--text)', fontSize: 14,
                          outline: 'none', fontFamily: 'inherit'
                        }}
                        onKeyDown={e => e.key === 'Enter' && handleUpgrade(plan.id)}
                      />
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        style={{
                          padding: '10px 16px', borderRadius: 10, border: 'none',
                          background: 'var(--accent)', color: '#000',
                          fontWeight: 700, cursor: 'pointer', fontSize: 13,
                          fontFamily: 'inherit'
                        }}
                      >
                        <Mail size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className={`dx-btn ${plan.popular ? '' : 'secondary'}`}
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.id === 'free' || submitted[plan.id]}
            >
              {submitted[plan.id] ? (
                <><CheckCircle size={16} /> On Waitlist</>
              ) : (
                <>{plan.cta} {plan.id !== 'free' && <ArrowRight size={16} />}</>
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
          <Zap size={14} color='var(--accent)' />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase' }}>Secure & Private</span>
        </div>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13, lineHeight: 1.6 }}>
          🔒 Payments processed via Stripe &mdash; encrypted and PCI-compliant.<br />
          Questions? <a href="mailto:hello@spectr.trade" style={{ color: 'var(--accent)', textDecoration: 'none' }}>hello@spectr.trade</a>
        </p>
      </div>
    </div>
  )
}
