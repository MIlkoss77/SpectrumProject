import React, { useState, useEffect } from 'react'
import { Bell, Mail, MessageCircle, Moon, Sun, Globe, Shield, ShieldAlert, Zap, Brain, Receipt, History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTrading } from '@/context/TradingContext.jsx'
import axios from 'axios'
import './dashboard.css'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const [lang, setLang] = useState(() => i18n.language || 'en')
  const [theme, setTheme] = useState(() => localStorage.getItem('ui.theme') || 'dark')
  const { tradingMode, toggleMode } = useTrading()

  // Notification preferences
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [telegramEnabled, setTelegramEnabled] = useState(false)

  // AI Configuration
  const [aiProvider, setAiProvider] = useState(() => localStorage.getItem('ai_provider') || 'openai')
  const [openaiKey, setOpenaiKey] = useState('••••••••••••')
  const [anthropicKey, setAnthropicKey] = useState('••••••••••••')
  const [isSaving, setIsSaving] = useState(false)

  // Transaction History
  const [payments, setPayments] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)

  useEffect(() => {
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang.toLowerCase())
    }
  }, [lang, i18n])

  useEffect(() => localStorage.setItem('ui.theme', theme), [theme])
  useEffect(() => localStorage.setItem('ai_provider', aiProvider), [aiProvider])

  // Fetch payment history
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        setLoadingPayments(true)
        const res = await axios.get('/api/payments/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data.ok) {
          setPayments(res.data.payments)
        }
      } catch {
        // Silent fail
      } finally {
        setLoadingPayments(false)
      }
    }
    fetchPayments()
  }, [])

  const handleSaveAIKey = async (provider, key) => {
    if (!key || key.includes('•')) return;
    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/exchange/keys', {
        exchange: provider,
        apiKey: key,
        secret: 'AI_PROVIDER_KEY' // Secret not needed for LLMs but required by API
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      alert(`${provider.toUpperCase()} key updated and encrypted on server.`)
    } catch (err) {
      alert(`Failed to save key: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Spectr Trading', { body: 'Test notification!', icon: '/icon-192.png' })
    } else if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          new Notification('Spectr Trading', { body: 'Notifications enabled!' })
        }
      })
    } else {
      console.warn('Push notifications not supported in this browser.')
    }
  }

  const STATUS_COLORS = {
    COMPLETED: { bg: 'rgba(0,227,150,0.1)', border: 'rgba(0,227,150,0.25)', text: '#00E396' },
    PENDING: { bg: 'rgba(254,176,25,0.1)', border: 'rgba(254,176,25,0.25)', text: '#FEB019' },
    FAILED: { bg: 'rgba(255,69,96,0.1)', border: 'rgba(255,69,96,0.25)', text: '#FF4560' },
  }

  return (
    <div className="dx-panels">
      <div className="dx-card">
        <h2 style={{ marginTop: 6, marginBottom: 16 }}>{t('app.settings')}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
              <Globe size={16} /> {t('ui.language')}
            </label>
            <select value={lang.toUpperCase()} onChange={e => setLang(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}>
              <option value="EN">English</option>
              <option value="PT">Português (Brasil)</option>
              <option value="ES">Español</option>
              <option value="RU">Русский</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
              {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />} {t('ui.theme')}
            </label>
            <select value={theme} onChange={e => setTheme(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}>
              <option value="dark">{t('ui.dark')}</option>
              <option value="light">{t('ui.light')}</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
              <Zap size={16} /> {t('pages.copysim.title')}
            </label>
            <div
              onClick={toggleMode}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                background: tradingMode === 'PAPER' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: tradingMode === 'PAPER' ? '#3b82f6' : '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <span>{tradingMode === 'PAPER' ? (t('pages.portfolio.paper_title') || 'Simulation Mode') : (t('ui.live_terminal') || 'Live Trading')}</span>
              <div style={{
                width: 32, height: 16, borderRadius: 20, background: tradingMode === 'PAPER' ? '#1e293b' : '#fbbf24', position: 'relative'
              }}>
                <div style={{
                  width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                  left: tradingMode === 'PAPER' ? 2 : 18, transition: 'all 0.3s'
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dx-card">
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={20} /> {t('pages.settings.ai_config') || 'AI Agent Configuration'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr)', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
              {t('pages.settings.ai_provider') || 'AI Provider'}
            </label>
            <select
              value={aiProvider}
              onChange={e => setAiProvider(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
            >
              <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
              <option value="anthropic">Anthropic (Claude 3.5)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, color: 'var(--muted)' }}>
              <span>{aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} {t('pages.settings.api_key') || 'API Key'}</span>
              {((aiProvider === 'openai' && openaiKey) || (aiProvider === 'anthropic' && anthropicKey)) && (
                <span style={{ color: 'var(--accent)', fontSize: 11 }}>Configured ✓</span>
              )}
            </label>
            <input
              type="password"
              value={aiProvider === 'openai' ? openaiKey : anthropicKey}
              onChange={e => aiProvider === 'openai' ? setOpenaiKey(e.target.value) : setAnthropicKey(e.target.value)}
              onBlur={e => handleSaveAIKey(aiProvider, e.target.value)}
              disabled={isSaving}
              placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', opacity: isSaving ? 0.5 : 1 }}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Keys are encrypted and stored in the secure server-side database. They are never exposed to the client after saving.
            </p>
          </div>
        </div>
      </div>

      <div className="dx-card">
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={20} /> {t('pages.settings.notifications_title') || 'Notification Preferences'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Bell size={20} color="var(--accent)" />
              <div>
                <div style={{ fontWeight: 500 }}>{t('pages.settings.push_notifications') || 'Push Notifications'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Get instant alerts in your browser</div>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={pushEnabled} onChange={e => setPushEnabled(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mail size={20} color="#4F46E5" />
              <div>
                <div style={{ fontWeight: 500 }}>{t('pages.settings.email_alerts') || 'Email Alerts'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Daily digest and important updates</div>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={emailEnabled} onChange={e => setEmailEnabled(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MessageCircle size={20} color="#0088cc" />
              <div>
                <div style={{ fontWeight: 500 }}>{t('pages.settings.telegram_bot') || 'Telegram Bot'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Connect @SpectrBot for real-time alerts</div>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={telegramEnabled} onChange={e => setTelegramEnabled(e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button className="dx-btn" style={{ marginTop: 20 }} onClick={handleTestNotification}>
          {t('pages.settings.test_notification') || 'Send Test Notification'}
        </button>
      </div>

      {/* Transaction History */}
      <div className="dx-card">
        <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Receipt size={20} color="var(--accent)" /> {t('pages.settings.tx_history') || 'Transaction History'}
        </h3>

        {loadingPayments ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            <History size={20} style={{ marginBottom: 8, opacity: 0.4 }} />
            <div>No transactions yet</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Currency</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '8px 12px', color: 'var(--muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>TxID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => {
                  const statusStyle = STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING
                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{payment.currency}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>${payment.amount}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
                          background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
                          color: statusStyle.text, textTransform: 'uppercase', letterSpacing: 0.5,
                        }}>
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                        {payment.txId ? `${payment.txId.slice(0, 8)}...${payment.txId.slice(-6)}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

