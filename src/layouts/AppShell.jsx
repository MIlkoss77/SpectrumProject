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
    <>
        <style>{`
          .dx-sidebar {
            width: 280px;
            background: #080808;
            border-right: 1px solid rgba(255,255,255,0.05);
            position: fixed;
            top: 0; bottom: 0; left: 0;
            z-index: 2000;
            padding: 32px 24px;
            display: flex;
            flex-direction: column;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 20px 0 80px rgba(0,0,0,0.5);
          }
          @media (max-width: 1023px) { 
            .dx-sidebar { transform: translateX(-100%); } 
            .dx-sidebar.open { transform: translateX(0); } 
          }
          
          .dx-main {
            margin-left: 280px;
            min-height: 100vh;
            padding-top: 80px;
            background: #050505;
            transition: margin-left 0.4s ease;
          }
          @media (max-width: 1023px) { .dx-main { margin-left: 0; } }
          
          .dx-header {
            position: fixed;
            top: 0; right: 0; left: 280px;
            height: 80px;
            background: rgba(5,5,5,0.8);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 32px;
            transition: left 0.4s ease;
          }
          @media (max-width: 1023px) { .dx-header { left: 0; padding: 0 16px; } }

          .dx-nav-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: 12px;
            color: rgba(255,255,255,0.4);
            text-decoration: none;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s;
          }
          .dx-nav-item:hover { background: rgba(255,255,255,0.03); color: #fff; }
          .dx-nav-item.active { background: rgba(0,255,255,0.05); color: #00FFFF; }

          .dx-flex { display: flex; }
          .dx-items-center { align-items: center; }
          .dx-gap-3 { gap: 12px; }
          .dx-gap-4 { gap: 16px; }
        `}</style>

        {navOpen && (
          <div 
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1500, backdropFilter: 'blur(10px)' }}
            onClick={() => setNavOpen(false)} 
          />
        )}

        <aside className={`dx-sidebar ${navOpen ? 'open' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#00FFFF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={logoImg} alt="L" style={{ width: '20px', height: '20px', filter: 'brightness(0)' }} />
                </div>
                <span style={{ fontWeight: 900, fontSize: '18px', letterSpacing: '-1px', color: '#fff' }}>
                  SPECTR<span style={{ color: '#00FFFF' }}>OS</span>
                </span>
            </div>
            <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)' }} onClick={() => setNavOpen(false)} className="lg:dx-hidden">
                <X size={20} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', padding: '0 16px' }}>Terminal v5.2</div>
            {NAV.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `dx-nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <header className="dx-header">
           <div className="dx-flex dx-items-center dx-gap-4">
              <button onClick={() => setNavOpen(true)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '12px' }} className="lg:dx-flex dx-items-center dx-justify-center">
                <Menu size={20} />
              </button>
           </div>
           
           <div className="dx-flex dx-items-center dx-gap-3">
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: showNotifications ? '#00FFFF' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s', cursor: 'pointer' }}>
                  <Bell size={20} fill={unreadCount > 0 ? 'currentColor' : 'none'} />
                  {unreadCount > 0 && <div style={{ position: 'absolute', top: '12px', right: '12px', width: '6px', height: '6px', background: '#00FFFF', borderRadius: '50%', boxShadow: '0 0 10px #00FFFF' }} />}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <div style={{ position: 'fixed', top: '90px', right: '16px', zIndex: 3000 }}>
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

              {!user && (
                <button 
                  onClick={() => window.location.href = '/login'}
                  style={{ height: '44px', padding: '0 24px', borderRadius: '12px', background: '#00FFFF', color: '#000', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,255,255,0.2)' }}>
                  Sign In
                </button>
              )}

              <button 
                onClick={connectWallet}
                style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (account || isPro) ? '#00FFFF' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <Wallet size={20} />
              </button>
           </div>
        </header>

        <main className="dx-main">
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
    </>
  )
}
