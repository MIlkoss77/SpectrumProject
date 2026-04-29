import React, { useState, useEffect } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PageTransition from '@/components/PageTransition'
import { useWeb3 } from '@/context/Web3Context.jsx'
import { Home, LayoutDashboard, BarChart3, Settings, Shield, User, Menu, X, LogOut, ChevronRight, Zap, Target, ShieldAlert, ShieldCheck, Wallet, Bell, Activity, Newspaper, Bot, Scale, GraduationCap, PieChart, CreditCard, Layers } from 'lucide-react'

import { capitalShield } from '@/services/trading/capitalShield'
import { useTrading } from '@/context/TradingContext.jsx'
import '@/pages/dashboard.css'
import '@/pages/mobile.css'
import Skeleton from '@/components/ui/Skeleton'
import ConnectionHub from '@/components/dashboard/ConnectionHub'
import logoImg from '@/assets/logo.png'
import OnboardingModal from '@/components/onboarding/OnboardingModal'
import NotificationDropdown from '@/components/NotificationDropdown'
import axios from 'axios'
import { useAuth } from '@/context/AuthContext'

export default function AppShell() {
  const { t } = useTranslation()
  const [navOpen, setNavOpen] = useState(false)
  const [proPlanDismissed, setProPlanDismissed] = useState(() => localStorage.getItem('proPlanDismissed') === '1')
  const [showMore, setShowMore] = useState(false)
  const [isPro, setIsPro] = useState(() => localStorage.getItem('spectr_pro_status') === 'true')
  const { account, connectWallet, isConnecting } = useWeb3()
  const { tradingMode, toggleMode } = useTrading()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, login, logout } = useAuth()
  const location = useLocation()

  const NAV = [
    { label: t('app.dashboard'), to: '/', icon: LayoutDashboard },
    { label: t('app.portfolio'), to: '/portfolio', icon: Wallet },
    { label: t('app.polymarket'), to: '/polymarket', icon: Layers },
    { label: t('app.signals'), to: '/signals', icon: Activity },
    { label: t('app.alerts'), to: '/alerts', icon: Bell },
    { label: t('app.news'), to: '/news', icon: Newspaper },
    { label: t('app.ta'), to: '/analytics', icon: PieChart },
    { label: t('app.arbitrage'), to: '/arbitrage', icon: Scale },
    { label: t('app.staking'), to: '/staking', icon: Wallet },
    { label: t('app.academy'), to: '/academy', icon: GraduationCap },
    { label: t('app.pricing'), to: '/pricing', icon: CreditCard },
    { label: t('app.settings'), to: '/settings', icon: Settings },
  ]


  useEffect(() => {
    const handleProChange = () => setIsPro(localStorage.getItem('spectr_pro_status') === 'true')
    window.addEventListener('proStatusChanged', handleProChange)
    return () => window.removeEventListener('proStatusChanged', handleProChange)
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('spectr_auth_token')
        if (!token) return
        const response = await axios.get('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.data.ok) {
          setNotifications(response.data.notifications)
          setUnreadCount(response.data.notifications.filter(n => !n.isRead).length)
        }
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      }
    }

        fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000) // Poll every min
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setShowMore(false)
    setShowNotifications(false)
  }, [location.pathname])

  const markNotificationRead = async (id) => {
    try {
      const token = localStorage.getItem('spectr_auth_token')
      const response = await axios.patch(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllNotificationsRead = async () => {
    try {
      const token = localStorage.getItem('spectr_auth_token')
      const response = await axios.post('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const mainMobileNav = [
    { label: t('app.dashboard'), to: '/', icon: LayoutDashboard },
    { label: t('app.signals'), to: '/signals', icon: Activity },
    { label: t('app.news'), to: '/news', icon: Newspaper },
    { label: t('app.polymarket'), to: '/polymarket', icon: Layers },
  ]

  const moreNav = NAV.filter(item => !mainMobileNav.find(m => m.to === item.to))

  return (
    <div className={`dx-root ${navOpen ? '' : 'nav-collapsed'} mode-${tradingMode.toLowerCase()}`} style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {navOpen && (
        <div 
          className="dx-overlay active" 
          onClick={() => setNavOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, backdropFilter: 'blur(4px)' }}
        />
      )}
      <aside className="dx-sidebar" style={{ paddingTop: 'calc(24px + env(safe-area-inset-top))' }}>
        <div className="dx-brand" style={{ gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', flexShrink: 0, backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoImg} alt="Spectr Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          {navOpen && (
            <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#fff' }}>SPECTR</span>
              <span style={{ color: '#00FFFF', marginLeft: '6px' }}>Trading</span>
            </span>
          )}
        </div>

        <nav className="dx-nav">
          <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 px-4">{t('ui.menu') || 'Menu'}</div>
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `dx-nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'text-white/40'} />
                  {navOpen && <span>{label}</span>}
                  {navOpen && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto p-6 pointer-events-none opacity-20">
           <span className="text-[8px] font-black text-white uppercase tracking-[0.4em]">Spectr OS v5.2.4-STABLE</span>
        </div>

        <div className={`mt-auto px-4 pb-6 ${!navOpen ? 'hidden' : ''}`}>
          {(!proPlanDismissed && !isPro) && (
            <div className="sidebar-upgrade-card group cursor-pointer transition-all duration-300 hover:scale-[1.02]" style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setProPlanDismissed(true); localStorage.setItem('proPlanDismissed', '1'); }}
                style={{
                  position: 'absolute', top: 8, right: 8, zIndex: 20,
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1,
                }}
                aria-label="Dismiss"
              >✕</button>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]" />
                  <h4 className="font-bold text-xs uppercase tracking-widest text-white/90">Pro Plan</h4>
                </div>
                <p className="text-[10px] text-white/40 mb-4 leading-relaxed font-medium">Unlock Neural Signals &<br />Advanced Strategy Analytics.</p>
                <button className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-[10px] uppercase tracking-tighter rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                  Upgrade Now <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <main className="dx-main" style={{
        position: 'relative',
        paddingTop: '70px',
        background: 'radial-gradient(circle at 50% 0%, #111 0%, var(--bg-dark) 100%)'
      }}>
        <header className="dx-toolbar" style={{
          height: '70px',
          padding: '0 16px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '12px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10000,
          background: 'rgba(5, 5, 5, 0.98)',
          backdropFilter: 'blur(30px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              style={{
                display: window.innerWidth < 1024 ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff'
              }}
              onClick={() => setNavOpen(v => !v)}
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <img src={logoImg} alt="Spectr" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              <span style={{ 
                display: window.innerWidth < 640 ? 'none' : 'block',
                fontWeight: 900,
                fontSize: '18px',
                color: '#fff',
                letterSpacing: '-0.05em'
              }}>
                SPECTR<span style={{ color: '#00FFFF' }}>Trading</span>
              </span>
            </Link>
          </div>

          {/* RIGHT: Notifications, Auth, Wallet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
            
            <div style={{ position: 'relative' }}>
              <button 
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: unreadCount > 0 ? '#00FFFF' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => { setShowNotifications(!showNotifications); setShowMore(false); }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#00FFFF',
                    boxShadow: '0 0 10px #00FFFF',
                    border: '1.5px solid #000'
                  }} />
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <div style={{ position: 'fixed', top: '80px', right: '16px', zIndex: 9999 }}>
                    <NotificationDropdown 
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkRead={markNotificationRead}
                      onMarkAllRead={markAllNotificationsRead}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(0,255,255,0.1)',
                  border: '1px solid rgba(0,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00FFFF',
                  fontSize: '10px',
                  fontWeight: 900
                }}>
                  {user.displayName?.[0]?.toUpperCase() || <User size={12} />}
                </div>
                <button 
                  onClick={logout}
                  style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => window.location.href = '/login'}
                style={{
                  height: '40px',
                  padding: '0 24px',
                  borderRadius: '12px',
                  background: '#00FFFF',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,255,255,0.2)'
                }}
              >
                Login
              </button>
            )}
            
            <button 
              onClick={connectWallet} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {(account || isPro) ? <Shield size={18} className="text-cyan-400" /> : <Wallet size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />}
            </button>
          </div>
        </header>

        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="dx-bottom-nav">
        {mainMobileNav.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `dx-bot-item ${isActive ? 'active' : ''}`} end={to === '/'}>
            <Icon size={24} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          className={`dx-bot-item ${showMore ? 'active' : ''}`}
          onClick={() => setShowMore(!showMore)}
        >
          <Menu size={24} />
          <span>More</span>
        </button>
      </nav>

      {/* More Menu Overlay */}
      {showMore && (
        <>
          <div 
            onClick={() => setShowMore(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1001 }}
          />
          <div
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0,
              background: 'var(--bg)', borderTop: '1px solid var(--border)',
              padding: '24px', zIndex: 1002, borderTopLeftRadius: 20, borderTopRightRadius: 20,
              maxHeight: '70vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{t('ui.menu') || 'Menu'}</h3>
              <button onClick={() => setShowMore(false)} style={{ background: 'none', border: 'none', color: '#fff' }}><X /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {moreNav.map(({ label, to, icon: Icon }) => (
                <NavLink key={to} to={to} className="dx-nav-item" style={{ fontSize: 14 }}>
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
            <div style={{ marginTop: '24px', textAlign: 'center', opacity: 0.1, fontSize: '9px', letterSpacing: '4px' }}>
              SPECTR TERMINAL v5.2.4-STABLE
            </div>
          </div>
        </>
      )}
      
      <OnboardingModal />
    </div>
  )
}
