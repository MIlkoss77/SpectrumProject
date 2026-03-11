import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle, AlertOctagon, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
    INFO: { icon: Info, color: '#3b82f6' },
    SUCCESS: { icon: CheckCircle, color: '#10b981' },
    WARNING: { icon: AlertTriangle, color: '#f59e0b' },
    ERROR: { icon: AlertOctagon, color: '#ef4444' }
};

export default function NotificationDropdown({ notifications, unreadCount, onMarkRead, onMarkAllRead, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-[#0d1117] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[1100] overflow-hidden"
        >
            <div className="p-4 border-bottom border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-cyan-400" />
                    <h3 className="font-bold text-sm uppercase tracking-widest text-white/90">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-black">
                            {unreadCount} NEW
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onMarkAllRead}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                        title="Mark all as read"
                    >
                        <Check size={16} />
                    </button>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/80 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="max-height-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell size={40} className="mx-auto mb-4 text-white/5" />
                        <p className="text-white/30 text-sm italic font-medium">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((n) => {
                            const { icon: Icon, color } = TYPE_ICONS[n.type] || TYPE_ICONS.INFO;
                            return (
                                <div 
                                    key={n.id}
                                    onClick={() => !n.isRead && onMarkRead(n.id)}
                                    className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-cyan-400/[0.02]' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div 
                                            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                                            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
                                        >
                                            <Icon size={20} color={color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm font-bold truncate ${!n.isRead ? 'text-white' : 'text-white/60'}`}>
                                                    {n.title}
                                                </h4>
                                                {!n.isRead && <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]" />}
                                            </div>
                                            <p className={`text-xs leading-relaxed mb-2 ${!n.isRead ? 'text-white/70' : 'text-white/40'}`}>
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-top border-white/5 text-center bg-white/5">
                    <button className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-cyan-400 transition-colors">
                        View Audit History
                    </button>
                </div>
            )}
        </motion.div>
    );
}
