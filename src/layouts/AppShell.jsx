import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
        const token = localStorage.getItem('token')
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
    { label: t('app.academy'), to: '/academy', icon: GraduationCap },
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
        background: 'radial-gradient(circle at 50% 0%, #111 0%, var(--bg-dark) 100%)'
      }}>
        <header className="dx-toolbar" style={{
          height: '70px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: window.innerWidth < 1024 ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(5, 5, 5, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="dx-burger hidden md:flex"
              onClick={() => setNavOpen(v => !v)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              {navOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="mobile-logo-only" style={{ alignItems: 'center', gap: '8px' }}>
              <img src={logoImg} alt="Spectr" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
              <span style={{ fontWeight: 900, fontSize: '16px', color: '#fff', letterSpacing: '-0.3px', lineHeight: 1 }}>
                SPECTR<span style={{ color: '#00FFFF' }}>Trading</span>
              </span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
            <ConnectionHub />

            <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '10px', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
              <Shield size={16} color="#00FFFF" />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: '#00FFFF', textTransform: 'uppercase', lineHeight: 1 }}>Capital Shield</span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}>PROTECTED</span>
              </div>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <button 
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', position: 'relative' }} 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowMore(false);
                  }}
                >
                  <Bell size={20} className={unreadCount > 0 ? 'text-cyan-400' : ''} />
                  {unreadCount > 0 && (
                    <div style={{ position: 'absolute', top: -4, right: -4, width: '14px', height: '14px', background: '#00FFFF', color: '#000', borderRadius: '50%', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {unreadCount}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationDropdown 
                      notifications={notifications}
                      unreadCount={unreadCount}
                      onMarkRead={markNotificationRead}
                      onMarkAllRead={markAllNotificationsRead}
                      onClose={() => setShowNotifications(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-3 ml-2" style={{ flexShrink: 0 }}>
              {user ? (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-1 pr-3 py-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold text-xs overflow-hidden border border-cyan-400/20">
                    {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || <User size={14} />}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-[10px] font-black text-white/90 leading-none tracking-tight">{user.displayName || user.email?.split('@')[0]}</span>
                    <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-tighter leading-none mt-1">{user.role || 'USER'}</span>
                  </div>
                  <button onClick={logout} className="ml-1 p-1 text-white/20 hover:text-red-400 transition-colors">
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-cyan-400 hover:bg-white text-black rounded-xl text-[10px] font-black transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">AUTHORIZE</span>
                  <span className="sm:hidden">LOGIN</span>
                </button>
              )}
              
              <button 
                onClick={connectWallet} 
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
              >
                {(account || isPro) ? <Shield size={18} className="text-cyan-400" /> : <Wallet size={18} className="text-white/40 group-hover:text-white" />}
              </button>
            </div>
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
            <div style={{ marginTop: '24px', textAlign: 'center', opacity: 0.2, fontSize: '10px', letterSpacing: '2px' }}>
              SPECTR CORE v5.2.1 // BUILD_STABLE
            </div>
          </div>
        </>
      )}
      
      <OnboardingModal />
    </div >
  )
}
