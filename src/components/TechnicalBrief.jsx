// src/components/TechnicalBrief.jsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ASSETS = [
    { symbol: 'BTCUSDT', name: 'Bitcoin' },
    { symbol: 'ETHUSDT', name: 'Ethereum' },
    { symbol: 'SOLUSDT', name: 'Solana' }
];

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8787";

export default function TechnicalBrief() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchTA = async (symbol) => {
        try {
            const resp = await fetch(`${API_BASE}/ohlc/binance?symbol=${symbol}&tf=1h&limit=100`);
            const candles = await resp.json();
            if (!Array.isArray(candles)) return null;

            const closes = candles.map(c => c.c);
            const last = closes[closes.length - 1];

            const rsi = calculateRSI(closes);
            const ema50 = calculateEMA(closes, 50);

            return {
                price: last,
                rsi: rsi,
                ema50: ema50,
                trend: last > ema50 ? 'BULLISH' : 'BEARISH',
                momentum: rsi > 70 ? 'OVERBOUGHT' : rsi < 30 ? 'OVERSOLD' : 'NEUTRAL'
            };
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            const results = {};
            for (const asset of ASSETS) {
                results[asset.symbol] = await fetchTA(asset.symbol);
            }
            setData(results);
            setLoading(false);
        };
        loadAll();
        const interval = setInterval(loadAll, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="dx-card animate-pulse h-48 flex items-center justify-center">Loading Market Context...</div>;

    return (
        <div className="technical-brief-grid">
            {ASSETS.map(asset => {
                const info = data[asset.symbol];
                if (!info) return null;

                const isBullish = info.trend === 'BULLISH';

                return (
                    <motion.div
                        key={asset.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="dx-card dx-p-5 relative overflow-hidden group hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300 border border-white/5 bg-black/60 backdrop-blur-xl"
                    >
                        {/* Macroglide Cyan Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/20 transition-all" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{asset.name}</h4>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">{asset.symbol}</span>
                                    </div>
                                    <div className="text-2xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                                        ${info.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div className={`p-2.5 rounded-xl border border-white/5 ${isBullish ? 'bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.1)]' : 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(248,113,113,0.1)]'}`}>
                                    {isBullish ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="dx-card bg-black/40 dx-p-3 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                                    <span className="text-[9px] text-muted-foreground block uppercase tracking-wider mb-1">RSI (14)</span>
                                    <span className={`text-base font-bold ${info.rsi > 70 ? 'text-red-400' : info.rsi < 30 ? 'text-green-400' : 'text-cyan-400'}`}>
                                        {info.rsi.toFixed(1)}
                                    </span>
                                </div>
                                <div className="dx-card bg-black/40 dx-p-3 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                                    <span className="text-[9px] text-muted-foreground block uppercase tracking-wider mb-1">Trend (EMA50)</span>
                                    <span className={`text-sm font-bold ${isBullish ? 'text-cyan-400 shadow-cyan-500/50 drop-shadow-sm' : 'text-orange-400'}`}>
                                        {isBullish ? 'Uptrend' : 'Downtrend'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`h-1.5 w-1.5 rounded-full ${isBullish ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'}`}></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                        Action
                                    </span>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
                                    {isBullish && info.rsi < 70 ? 'STRONG BUY' : !isBullish && info.rsi > 30 ? 'STRONG SELL' : 'WAIT'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function calculateRSI(closes, period = 14) {
    let gains = 0, losses = 0;
    for (let i = closes.length - period; i < closes.length; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

function calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    let ema = closes[0];
    for (let i = 1; i < closes.length; i++) {
        ema = (closes[i] * k) + (ema * (1 - k));
    }
    return ema;
}
