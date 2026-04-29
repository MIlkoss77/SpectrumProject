import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, AlertOctagon, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useWebSocket } from '@/context/WebSocketContext';
import { monitor } from '@/services/providers/market';
import { useState, useEffect } from 'react';

const TYPE_ICONS = {
    INFO: { icon: Info, color: '#3b82f6' },
    SUCCESS: { icon: CheckCircle, color: '#10b981' },
    WARNING: { icon: AlertTriangle, color: '#f59e0b' },
    ERROR: { icon: AlertOctagon, color: '#ef4444' }
};

export default function NotificationDropdown({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClose }) {
    const { isBinanceConnected, isBybitConnected, isMexcConnected } = useWebSocket();
    const [proxyStatus, setProxyStatus] = useState('UNKNOWN');

    useEffect(() => {
        setProxyStatus(monitor.getStatus());
        const unsub = monitor.subscribe(status => setProxyStatus(status));
        return unsub;
    }, []);

    const isAllGood = isBinanceConnected && isBybitConnected && isMexcConnected && proxyStatus === 'LIVE';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
                width: window.innerWidth < 768 ? 'calc(100vw - 32px)' : '380px',
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                overflow: 'hidden',
                zIndex: 10000
            }}
        >
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bell size={18} style={{ color: '#00FFFF' }} />
                    <h3 style={{ margin: 0, fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>Intelligence</h3>
                    {unreadCount > 0 && (
                        <span style={{ padding: '2px 8px', borderRadius: '20px', background: 'rgba(0,255,255,0.1)', color: '#00FFFF', fontSize: '9px', fontWeight: 900 }}>{unreadCount} NEW</span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><Check size={16} /></button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
            </div>

            <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Network Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: isAllGood ? '#00FFFF' : '#FF4560' }}>{isAllGood ? 'VERIFIED' : 'SYNC ISSUE'}</span>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAllGood ? '#00FFFF' : '#FF4560', boxShadow: isAllGood ? '0 0 10px #00FFFF' : 'none' }} />
                </div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                {notifications.length === 0 ? (
                    <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <Bell size={40} style={{ color: 'rgba(255,255,255,0.05)', marginBottom: '16px' }} />
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>No active intelligence data</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div key={n.id} onClick={() => !n.isRead && onMarkRead(n.id)} style={{ padding: '16px', borderRadius: '16px', marginBottom: '8px', background: n.isRead ? 'transparent' : 'rgba(0,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>{n.title}</span>
                                {!n.isRead && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00FFFF' }} />}
                             </div>
                             <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px', lineHeight: '1.4' }}>{n.message}</p>
                             <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                        </div>
                    ))
                )}
            </div>

            <div style={{ padding: '16px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Audit History Protocol</span>
            </div>
        </motion.div>
    );
}
