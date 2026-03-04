import React, { useState, useEffect } from 'react'
import { Bell, Mail, MessageCircle, Moon, Sun, Globe, Shield, ShieldAlert, Zap, Brain } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTrading } from '@/context/TradingContext.jsx'
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
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('openai_api_key') || '')
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem('anthropic_api_key') || '')

  useEffect(() => {
    if (lang !== i18n.language) {
      i18n.changeLanguage(lang.toLowerCase())
    }
  }, [lang, i18n])

  useEffect(() => localStorage.setItem('ui.theme', theme), [theme])
  useEffect(() => localStorage.setItem('ai_provider', aiProvider), [aiProvider])
  useEffect(() => localStorage.setItem('openai_api_key', openaiKey), [openaiKey])
  useEffect(() => localStorage.setItem('anthropic_api_key', anthropicKey), [anthropicKey])

  const handleTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Spectr Trading', { body: 'Test notification! 🚀', icon: '/icon-192.png' })
    } else if ('Notification' in window) {
      Notification.requestPermission().then(p => {
        if (p === 'granted') {
          new Notification('Spectr Trading', { body: 'Notifications enabled! 🎉' })
        }
      })
    } else {
      alert('Push notifications not supported in this browser.')
    }
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
              placeholder={`Enter your ${aiProvider === 'openai' ? 'OpenAI' : 'Anthropic'} API Key`}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)' }}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
              Keys are stored securely in your browser's local storage and are only sent directly to the official provider APIs.
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
    </div>
  )
}
