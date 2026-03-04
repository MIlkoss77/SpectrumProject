import React, { useState, useEffect, useRef } from 'react';
import { Brain, Play, Square, Activity, Terminal, Settings as SettingsIcon, Target, Search, BarChart3, ShieldCheck, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { agentService } from '@/services/ai/polymarketAgent';
import { motion, AnimatePresence } from 'framer-motion';
import '@/pages/dashboard.css';

export default function Agent() {
    const [isRunning, setIsRunning] = useState(agentService.isRunning);
    const [logs, setLogs] = useState(agentService.logs);
    const [positions, setPositions] = useState(agentService.positions);
    const [hasApiKey, setHasApiKey] = useState(false);

    const logContainerRef = useRef(null);

    useEffect(() => {
        const provider = localStorage.getItem('ai_provider') || 'openai';
        const key = localStorage.getItem(`${provider}_api_key`);
        setHasApiKey(!!key);

        agentService.setCallbacks(
            (newLogs) => setLogs(newLogs),
            (newPos) => setPositions(newPos)
        );

        return () => {
            agentService.setCallbacks(null, null);
        };
    }, []);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const toggleAgent = async () => {
        if (!hasApiKey) {
            alert("Please configure your API Key in Settings first.");
            return;
        }

        if (isRunning) {
            agentService.stop();
            setIsRunning(false);
        } else {
            setIsRunning(true);
            await agentService.start();
            setIsRunning(agentService.isRunning);
        }
    };

    return (
        <div className="w-full animate-in">
            {/* ═══ Agent Hero Section ═══ */}
            <div className="overview-hero">
                <div className="hero-header">
                    <div className="hero-title">
                        <Brain size={18} className="text-cyan-400" />
                        <span>OPENCLAW AUTONOMY v1.0</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: isRunning ? '#00E396' : 'rgba(255,255,255,0.2)',
                                boxShadow: isRunning ? '0 0 10px #00E396' : 'none',
                                animation: isRunning ? 'pulse 2s infinite' : 'none'
                            }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, color: isRunning ? '#00E396' : 'rgba(255,255,255,0.4)' }}>
                                {isRunning ? 'ACTIVE' : 'IDLE'}
                            </span>
                        </div>
                        <div className="dx-tag text-cyan-400 border-cyan-500/20">POLYMARKET ENGINE</div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            OpenClaw Polymarket Agent
                        </h1>
                        <p className="text-sm text-white/40 max-w-lg mt-2 leading-relaxed font-medium">
                            Spectr's autonomous OpenClaw agent identifies edges in prediction markets using real-time search, probability analysis, and cognitive reasoning.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {!hasApiKey && (
                            <Link to="/settings" className="dx-btn dx-btn-secondary dx-btn-sm" style={{ textTransform: 'none' }}>
                                <SettingsIcon size={14} /> Configure API
                            </Link>
                        )}
                        <button
                            onClick={toggleAgent}
                            className={`dx-btn dx-btn-sm ${isRunning ? 'dx-btn-danger' : 'dx-btn-primary'}`}
                        >
                            {isRunning ? (
                                <><Square size={14} fill="currentColor" /> EMERGENCY STOP</>
                            ) : (
                                <><Play size={14} fill="currentColor" /> INITIATE CORE LOOP</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="dx-grid-premium mt-8">
                {/* ═══ Left Column: Logs & Activity (Spans 3/4) ═══ */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
                    <div className="action-card" style={{ padding: '24px', minHeight: '500px' }}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Terminal size={18} className="text-cyan-400" />
                                <h3 className="font-bold">OpenClaw Thought Feed</h3>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                    Latency: 142ms
                                </div>
                                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                                    Stream: Active
                                </div>
                            </div>
                        </div>

                        <div
                            ref={logContainerRef}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '20px',
                                borderRadius: '16px',
                                height: '400px',
                                overflowY: 'auto',
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                scrollBehavior: 'smooth'
                            }}
                            className="custom-scrollbar"
                        >
                            <AnimatePresence>
                                {logs.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {logs.map((log, i) => {
                                            const isHighlight = log.includes('Edge detected') || log.includes('Trade');
                                            const isError = log.includes('Error');
                                            const isSearch = log.includes('Gathering real-time context');
                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    style={{
                                                        color: isError ? '#FF4560' : isHighlight ? '#00E396' : isSearch ? '#FEB019' : 'rgba(255,255,255,0.6)',
                                                        display: 'flex',
                                                        gap: '8px'
                                                    }}
                                                >
                                                    <span style={{ color: 'rgba(255,255,255,0.2)' }}>[{i.toString().padStart(3, '0')}]</span>
                                                    <span>{log}</span>
                                                    {isHighlight && <Activity size={12} className="mt-1 animate-pulse" />}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-white/10 text-center italic">
                                        <Bot size={48} className="mb-4 opacity-50" />
                                        <p>OpenClaw system initialized. Waiting for Polymarket event stream...</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Status Bar */}
                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-white/20 uppercase tracking-widest">
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" /> GPU: 42%</span>
                                <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-cyan-400" /> NPU: 0.12 Tflops</span>
                            </div>
                            <span>Process: Idle</span>
                        </div>
                    </div>

                    {/* Positions Table */}
                    <div className="action-card" style={{ padding: '24px' }}>
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 size={18} className="text-cyan-400" />
                            <h3 className="font-bold">Autonomous Portfolio</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] text-white/30 uppercase tracking-widest border-b border-white/5">
                                        <th className="pb-4 font-bold">Event / Market</th>
                                        <th className="pb-4 font-bold text-center">Confidence</th>
                                        <th className="pb-4 font-bold text-center">Buy Odds</th>
                                        <th className="pb-4 font-bold text-center">Size</th>
                                        <th className="pb-4 font-bold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {positions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-white/10 text-xs font-bold uppercase tracking-widest italic">
                                                No active automated positions
                                            </td>
                                        </tr>
                                    ) : (
                                        positions.map((pos, i) => (
                                            <tr key={i} className="group">
                                                <td className="py-4">
                                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate max-w-[300px]" title={pos.market}>
                                                        {pos.market}
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="text-xs font-mono font-bold text-cyan-400">{pos.targetProb}%</div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="text-xs font-mono font-bold text-white/60">{pos.purchasedOdds}%</div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="text-xs font-mono font-bold text-white">{pos.holdings}</div>
                                                </td>
                                                <td className="py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20">
                                                        <ShieldCheck size={10} /> OPEN
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ═══ Right Column: Stats & Monitoring (Spans 1/4) ═══ */}
                <div className="col-span-1 flex flex-col gap-6">
                    <div className="action-card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '320px' }}>
                        <div className="mb-6 flex flex-col items-center">
                            <Target size={24} className="text-cyan-400 mb-2" />
                            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-[2px]">Agent Confidence</h4>
                        </div>

                        <div className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="var(--accent)" strokeWidth="8"
                                    strokeDasharray="283"
                                    initial={{ strokeDashoffset: 283 }}
                                    animate={{ strokeDashoffset: isRunning ? 283 - (0.84 * 283) : 283 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black font-mono">84%</span>
                                <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest mt-1">High Accuracy</span>
                            </div>
                        </div>
                    </div>

                    <div className="action-card" style={{ padding: '24px' }}>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
                            <Search size={16} className="text-amber-400" />
                            Research Mode
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Web Scraper', status: 'Optimal', color: '#00E396' },
                                { label: 'Polymarket API', status: 'Connected', color: '#00E396' },
                                { label: 'OpenClaw Logic', status: 'GPT-4o', color: '#00FFFF' },
                                { label: 'Resolution Engine', status: 'Engaged', color: '#00E396' },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tight">{s.label}</span>
                                    <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="action-card relative overflow-hidden" style={{ marginTop: '0', padding: '20px', border: '1px solid rgba(0, 227, 150, 0.2)', background: 'linear-gradient(135deg, rgba(0, 227, 150, 0.05) 0%, transparent 100%)' }}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="flex items-center gap-2 mb-2 relative z-10">
                            <ShieldCheck size={16} className="text-[#00E396]" />
                            <h4 className="font-bold text-xs uppercase tracking-widest text-[#00E396]">Simulation Mode Active</h4>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed font-medium relative z-10">
                            OpenClaw is operating in a risk-free simulated environment. Live execution on Polygon is disabled until manually unlocked in security settings.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
