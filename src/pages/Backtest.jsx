import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, Activity, Play, X, ChevronRight, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { backtestEngine } from '@/services/trading/backtestEngine';
import './dashboard.css';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'TONUSDT', 'BNBUSDT'];
const TIMEFRAMES = [
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' }
];
const STRATEGIES = [
    { id: 'SuperScore', name: 'Neural SuperScore', desc: 'AI-based momentum & sentiment' },
    { id: 'Cross-EMA', name: 'Golden Cross (EMA)', desc: 'Trend following EMA 50/200' },
    { id: 'RSI', name: 'Mean Reversion (RSI)', desc: 'Overbought/Oversold levels' }
];

/* ── Sparkline SVG ── */
function Sparkline({ data, color = '#22d3ee', height = 100 }) {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const w = 500;
    const h = height;

    const points = data.map((v, i) =>
        `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 4 - ((v - min) / range) * (h - 8)).toFixed(1)}`
    ).join(' ');

    const gradientId = `backtest-grad-${color.replace('#', '')}`;

    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`0,${h} ${points} ${w},${h}`}
                fill={`url(#${gradientId})`}
            />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Backtest() {
    const [config, setConfig] = useState({
        symbol: 'BTCUSDT',
        timeframe: '1h',
        strategy: 'SuperScore',
        balance: 1000,
        days: 30
    });

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleRun = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await backtestEngine.run({
                symbol: config.symbol,
                timeframe: config.timeframe,
                strategyName: config.strategy,
                initialBalance: config.balance,
                days: config.days
            });
            setResult(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dx-panels animate-in">
            {/* Header */}
            <div className="overview-hero mb-8">
                <div className="hero-header">
                    <div className="hero-title">
                        <BarChart3 size={18} className="text-cyan-400" />
                        <span>Strategy Backtest</span>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">Simulation Engine</h1>
                        <p className="text-sm text-white/40 max-w-xl">
                            Test your logic on historical Binance data. Our engine simulates executions with high precision to validate your edge before going live.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest hidden md:flex">
                        <Activity size={14} className="animate-pulse" />
                        Simulated Environment
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ═══ Configuration Panel ═══ */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="action-card" style={{ background: 'rgba(20, 20, 25, 0.7)', backdropFilter: 'blur(20px)' }}>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-cyan-400" />
                            Parameters
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Asset</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {SYMBOLS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setConfig({ ...config, symbol: s })}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all border ${config.symbol === s ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                                        >
                                            {s.replace('USDT', '')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Timeframe</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {TIMEFRAMES.map(t => (
                                        <button
                                            key={t.value}
                                            onClick={() => setConfig({ ...config, timeframe: t.value })}
                                            className={`py-2 rounded-lg text-xs font-bold transition-all border ${config.timeframe === t.value ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'}`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-2">Strategy</label>
                                <div className="space-y-2">
                                    {STRATEGIES.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => setConfig({ ...config, strategy: s.id })}
                                            className={`w-full p-3 rounded-xl text-left transition-all border flex items-center justify-between group ${config.strategy === s.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                        >
                                            <div>
                                                <div className={`text-xs font-bold ${config.strategy === s.id ? 'text-cyan-400' : 'text-white'}`}>{s.name}</div>
                                                <div className="text-[10px] text-white/40">{s.desc}</div>
                                            </div>
                                            {config.strategy === s.id && <ChevronRight size={14} className="text-cyan-400" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    onClick={handleRun}
                                    disabled={loading}
                                >
                                    {loading ? <Activity size={20} className="animate-spin" /> : <Play size={20} fill="currentColor" />}
                                    {loading ? 'Simulating...' : 'Run Simulation'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
                            <X size={16} /> {error}
                        </div>
                    )}
                </div>

                {/* ═══ Results Panel ═══ */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {!result && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-4">
                                    <BarChart3 size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-white/60">Ready to simulate</h3>
                                <p className="text-sm text-white/30 max-w-xs mt-2">Adjust parameters and click run to see historical performance data</p>
                            </motion.div>
                        )}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Zap size={20} className="text-cyan-400 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-cyan-400 font-bold text-sm uppercase tracking-widest">Crunching History...</div>
                            </motion.div>
                        )}

                        {result && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Metrics Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="action-card p-4">
                                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Total Return</div>
                                        <div className={`text-xl font-black ${result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {result.totalReturn > 0 ? '+' : ''}{result.totalReturn}%
                                        </div>
                                    </div>
                                    <div className="action-card p-4">
                                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Win Rate</div>
                                        <div className="text-xl font-black text-cyan-400">{result.winRate}%</div>
                                    </div>
                                    <div className="action-card p-4">
                                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Max Drawdown</div>
                                        <div className="text-xl font-black text-red-400">-{result.maxDrawdown}%</div>
                                    </div>
                                    <div className="action-card p-4">
                                        <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Trades Count</div>
                                        <div className="text-xl font-black text-white">{result.tradesCount}</div>
                                    </div>
                                </div>

                                {/* Equity Curve */}
                                <div className="action-card">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold flex items-center gap-2">
                                            <TrendingUp size={16} className="text-cyan-400" />
                                            Equity Curve
                                        </h3>
                                        <div className="text-[10px] text-white/30 italic flex items-center gap-1">
                                            <Info size={12} /> Live mockup based on simulated trades
                                        </div>
                                    </div>
                                    <div className="h-48 relative">
                                        <Sparkline data={result.equityCurve.map(p => p.balance)} color="#22d3ee" height={192} />
                                    </div>
                                </div>

                                {/* Trade List */}
                                <div className="action-card overflow-hidden">
                                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 px-6 pt-2">
                                        <Clock size={16} className="text-cyan-400" />
                                        Recent Trades
                                    </h3>
                                    <div className="max-h-[300px] overflow-y-auto px-6 pb-4">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="sticky top-0 bg-[#141419] py-2 border-b border-white/5">
                                                <tr>
                                                    <th className="pb-2 text-white/30 font-bold uppercase">Time</th>
                                                    <th className="pb-2 text-white/30 font-bold uppercase">Side</th>
                                                    <th className="pb-2 text-white/30 font-bold uppercase">Price</th>
                                                    <th className="pb-2 text-white/30 font-bold uppercase">Profit</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {result.trades.slice(-20).reverse().map((t, i) => (
                                                    <tr key={i} className="hover:bg-white/5 group">
                                                        <td className="py-3 text-white/40">{new Date(t.exitTime).toLocaleDateString()}</td>
                                                        <td className="py-3">
                                                            <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-bold">LONG</span>
                                                        </td>
                                                        <td className="py-3 font-mono text-white/80">${t.exitPrice.toLocaleString()}</td>
                                                        <td className={`py-3 font-bold ${t.pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                            {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
