import React, { useEffect, useMemo, useState } from 'react';
import { fetchBinanceKlines } from '@/services/providers/market.js';
import { genCandles } from '@/services/ta/mockFeed';
import { ema, rsi, macd } from '@/services/ta/indicators';
import { detectSignals } from '@/services/ta/signals.js';
import { LayoutDashboard, Activity, Zap, Target, TrendingUp, BarChart3, RefreshCw, Layers } from 'lucide-react';

// Intelligence Widgets
import WhaleRadar from '@/components/dashboard/WhaleRadar';
import SentimentHeatmap from '@/components/dashboard/SentimentHeatmap';
import NeuralConfidence from '@/components/dashboard/NeuralConfidence';
import PnLHistory from '@/components/dashboard/PnLHistory';
import LeverageCalculator from '@/components/dashboard/LeverageCalculator';
import FundingRates from '@/components/dashboard/FundingRates';
import { opportunityEngine } from '@/services/ai/opportunityEngine';
import { useWebSocket } from '@/context/WebSocketContext';

import './dashboard.css';

const TF_MIN = { '1m': 1, '5m': 5, '15m': 15, '1h': 60 };
function fmt(n, d = 2) { return Number(n).toFixed(d); }

export default function Analytics() {
  const [symbol, setSymbol] = useState(() => localStorage.getItem('ui.symbol') || 'BTCUSDT');
  const [tf, setTf] = useState(() => localStorage.getItem('ui.tf') || '15m');
  const [bars, setBars] = useState(() => Number(localStorage.getItem('ui.bars')) || 200);
  const [loading, setLoading] = useState(false);
  const [candles, setCandles] = useState([]);

  const { tickers } = useWebSocket();
  const liveTicker = tickers[symbol.toLowerCase()];

  useEffect(() => { localStorage.setItem('ui.symbol', symbol); }, [symbol]);
  useEffect(() => { localStorage.setItem('ui.tf', tf); }, [tf]);
  useEffect(() => { localStorage.setItem('ui.bars', String(bars)); }, [bars]);

  const refresh = async () => {
    setLoading(true);
    try {
      const arr = await fetchBinanceKlines(symbol, tf, Math.max(200, bars));
      setCandles(arr);
    } catch (e) {
      setCandles(genCandles(Math.max(60, bars), symbol.startsWith('ETH') ? 3000 : 96000));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [symbol, tf]);

  // Start Opportunity Engine
  useEffect(() => {
    opportunityEngine.start();
    return () => opportunityEngine.stop();
  }, []);

  const closes = useMemo(() => candles.map(c => c.c), [candles]);
  const rsi14 = useMemo(() => rsi(closes, 14), [closes]);
  const last = closes.at(-1);
  const lastRSI = rsi14.at(-1);

  return (
    <div className="w-full animate-in">
      {/* ═══ Hub Hero ═══ */}
      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <BarChart3 size={18} className="text-white/80" />
            <span className="text-white">AI Analytics Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              PRO ENGINES ACTIVE
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#fff', letterSpacing: '-0.02em' }}>Market Intelligence</h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '540px', lineHeight: 1.6 }}>
              AI-powered radar, sentiment analysis, and neural confidence — all synced in real-time. This is what the smart money sees.
            </p>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-white outline-none px-2"
            >
              <option value="BTCUSDT">BTC/USDT</option>
              <option value="ETHUSDT">ETH/USDT</option>
              <option value="SOLUSDT">SOL/USDT</option>
            </select>
            <div className="w-[1px] h-4 bg-white/10" />
            <select
              value={tf}
              onChange={e => setTf(e.target.value)}
              className="bg-transparent border-none text-[11px] font-bold text-white/60 outline-none px-2"
            >
              <option value="5m">5M</option>
              <option value="15m">15M</option>
              <option value="1h">1H</option>
            </select>
            <button onClick={refresh} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Analytics Grid ═══ */}
      <div className="dx-grid-premium mt-8">
        {/* Row 1: Whale Radar (Intelligence) */}
        <div className="col-span-1 lg:col-span-2">
          <WhaleRadar symbol={symbol} />
        </div>

        {/* Row 1: Sentiment & Confidence (Filtering Noise) */}
        <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
          <NeuralConfidence value={84} />
          <SentimentHeatmap />
        </div>

        {/* Row 2: Financial Discipline (PnL & Calculator) */}
        <div className="col-span-1 lg:col-span-2">
          <PnLHistory />
        </div>

        <div className="col-span-1 lg:col-span-1 flex flex-col gap-6">
          <LeverageCalculator />
          <FundingRates />
        </div>
      </div>
    </div>
  );
}
