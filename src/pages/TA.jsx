// src/pages/TA.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "@/context/WebSocketContext";
import { TrendingUp, TrendingDown } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.VITE_API_HOST ? `https://${import.meta.env.VITE_API_HOST}` : "http://localhost:8787");

// ---------- TA helpers ----------
const EMA = (values, period) => {
  const k = 2 / (period + 1);
  let ema = null;
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    ema = ema == null ? v : (v - ema) * k + ema;
    out.push(ema);
  }
  return out;
};

const RSI = (closes, period = 14) => {
  let gains = 0, losses = 0;
  const out = new Array(closes.length).fill(null);
  for (let i = 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1];
    const up = Math.max(ch, 0), down = Math.max(-ch, 0);
    if (i <= period) {
      gains += up; losses += down;
      if (i === period) {
        const rs = losses === 0 ? 100 : gains / losses;
        out[i] = 100 - 100 / (1 + rs);
      }
    } else {
      gains = (gains * (period - 1) + up) / period;
      losses = (losses * (period - 1) + down) / period;
      const rs = losses === 0 ? 100 : gains / losses;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  return out;
};

const MACD = (closes, fast = 12, slow = 26, signal = 9) => {
  const ef = EMA(closes, fast);
  const es = EMA(closes, slow);
  const m = ef.map((v, i) => (v != null && es[i] != null ? v - es[i] : null));
  const s = EMA(m.map((v) => v ?? 0), signal).map((v, i) => (m[i] == null ? null : v));
  return { macd: m, signal: s };
};

// ---------- Mini chart helpers ----------
const px = (n) => Math.round(n * 100) / 100;

function scaleSeries(values, h, padding = 10) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const top = padding, bottom = h - padding;
  const y = (v) => bottom - ((v - min) / span) * (bottom - top);
  return { min, max, y };
}

function Candle({ x, w, o, h, l, c }) {
  const up = c <= o; // Note: SVG y is inverted, so c <= o means price went up
  const mid = x + w / 2;
  const color = up ? "var(--ok)" : "var(--bad)";
  return (
    <g>
      <line x1={mid} x2={mid} y1={h} y2={l} stroke={color} strokeWidth="1" />
      <rect
        x={x + 1}
        y={up ? c : o}
        width={Math.max(1, w - 2)}
        height={Math.max(1, Math.abs(o - c))}
        fill={color}
        opacity={up ? 0.8 : 0.6}
      />
    </g>
  );
}

export default function TA() {
  const { t } = useTranslation();

  // Источник и параметры загрузки
  const [source, setSource] = useState("binance"); // mock | binance
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [tf, setTf] = useState("15m");
  const [limit, setLimit] = useState(400);

  // Данные и ошибки
  const [rows, setRows] = useState([]); // [{t,o,h,l,c,v}]
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // Переключатели
  const [showEMA, setShowEMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [showSignals, setShowSignals] = useState(true);

  // Hover
  const [hover, setHover] = useState(null); // {i,x}
  const svgRef = useRef(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const endpoint =
        source === "binance"
          ? `${API_BASE}/ohlc/binance?symbol=${encodeURIComponent(symbol)}&tf=${encodeURIComponent(tf)}&limit=${limit}`
          : `${API_BASE}/ohlc?symbol=${encodeURIComponent(symbol)}&tf=${encodeURIComponent(tf)}&limit=${limit}`;
      const r = await fetch(endpoint);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.message || "Failed to load OHLC");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [symbol, tf, limit, source]);

  // WebSocket Live Updates
  const { subscribe, unsubscribe, lastMessage } = useWebSocket();
  const activeStream = useRef(null);

  useEffect(() => {
    if (source !== "binance") return;

    const streamName = `${symbol.toLowerCase()}@kline_${tf}`;
    if (activeStream.current === streamName) return;

    // Unsubscribe previous
    if (activeStream.current) {
      unsubscribe([activeStream.current]);
    }

    // Subscribe new
    subscribe([streamName]);
    activeStream.current = streamName;

    return () => {
      if (activeStream.current) {
        unsubscribe([activeStream.current]);
        activeStream.current = null;
      }
    };
  }, [symbol, tf, source, subscribe, unsubscribe]);

  // Process WS Message
  useEffect(() => {
    if (!lastMessage || source !== "binance") return;

    if (lastMessage.e === "kline" && lastMessage.s === symbol) {
      const k = lastMessage.k;
      const t = k.t;
      const candle = {
        t: t,
        o: parseFloat(k.o),
        h: parseFloat(k.h),
        l: parseFloat(k.l),
        c: parseFloat(k.c),
        v: parseFloat(k.v)
      };

      setRows(prev => {
        if (!prev.length) return prev;
        const last = prev[prev.length - 1];

        if (t === last.t) {
          // Update current candle
          const newRows = [...prev];
          newRows[prev.length - 1] = candle;
          return newRows;
        } else if (t > last.t) {
          // New candle
          const newRows = [...prev, candle];
          if (newRows.length > limit) newRows.shift();
          return newRows;
        }
        return prev;
      });
    }
  }, [lastMessage, symbol, source, limit]);

  // ---------- Indicators ----------
  const closes = useMemo(() => rows.map((r) => r.c), [rows]);
  const ema50 = useMemo(() => (rows.length ? EMA(closes, 50) : []), [closes, rows.length]);
  const ema200 = useMemo(() => (rows.length ? EMA(closes, 200) : []), [closes, rows.length]);
  const rsi14 = useMemo(() => (rows.length ? RSI(closes, 14) : []), [closes, rows.length]);
  const macd = useMemo(() => (rows.length ? MACD(closes, 12, 26, 9) : { macd: [], signal: [] }), [closes, rows.length]);

  // ---------- Signals (вход: RSI↑ из <30 + MACD cross↑) ----------
  const entries = useMemo(() => {
    const out = [];
    for (let i = 1; i < rows.length; i++) {
      const rsiUp = rsi14[i - 1] < 30 && rsi14[i] >= 30;
      const macUp = macd.macd[i - 1] <= macd.signal[i - 1] && macd.macd[i] > macd.signal[i];
      if (rsiUp && macUp) out.push(i);
    }
    return out;
  }, [rows, rsi14, macd]);

  // ---------- Layout ----------
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  const isMobile = windowWidth < 768;
  const candleMinWidth = isMobile ? 8 : 6;
  const W = Math.max(isMobile ? windowWidth - 32 : 900, rows.length * candleMinWidth);
  const H_PRICE = isMobile ? 240 : 360, H_RSI = isMobile ? 80 : 100, H_MACD = isMobile ? 90 : 120;
  const perCandle = W / Math.max(1, rows.length);

  // Scales
  const priceVals = rows.flatMap((r) => [r.h, r.l]);
  const priceScale = priceVals.length ? scaleSeries(priceVals, H_PRICE, 8) : null;
  const rsiScale = scaleSeries([0, 100], H_RSI, 8);
  const macdVals = macd.macd.filter((v) => v != null).concat(macd.signal.filter((v) => v != null));
  const macdMin = macdVals.length ? Math.min(...macdVals) : -1;
  const macdMax = macdVals.length ? Math.max(...macdVals) : 1;
  const macdScale = scaleSeries([macdMin, macdMax], H_MACD, 8);

  // Hover detect
  function onMove(e) {
    if (!rows.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    let i = Math.floor(relX / perCandle);
    i = Math.max(0, Math.min(rows.length - 1, i));
    setHover({ i, x: i * perCandle });
  }
  function onLeave() { setHover(null); }

  return (
    <section className="page md:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">{t("pages.ta?.title") || "Technical Analysis"}</h1>
          <p className="text-sm text-white/40">Professional charting and signal detection</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${loading ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
            {loading ? 'SYNCING' : 'LIVE DATA'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="ta-field">
          <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500/50 outline-none">
            <option value="binance">Binance</option>
            <option value="mock">Mock</option>
          </select>
        </div>
        <div className="ta-field">
          <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Symbol</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500/50 outline-none">
            {["BTCUSDT", "ETHUSDT", "TONUSDT", "SOLUSDT", "BNBUSDT"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="ta-field">
          <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Timeframe</label>
          <select value={tf} onChange={(e) => setTf(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500/50 outline-none">
            {["5m", "15m", "1h", "4h"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="ta-field">
          <label className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Bars</label>
          <input type="number" value={limit} min={100} max={1500} onChange={(e) => setLimit(+e.target.value || 200)} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-cyan-500/50 outline-none" />
        </div>

        <div className="col-span-2 flex items-end">
          <button className="w-full h-[38px] bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors border-none shadow-lg shadow-cyan-500/20" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* MACROGLIDE MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {['5m', '15m', '1h', '4h'].map(tframe => (
          <div key={tframe} className={`dx-card dx-p-4 relative overflow-hidden transition-all duration-300 ${tf === tframe ? 'bg-cyan-900/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.1)]' : 'bg-black/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'}`}>
            {tf === tframe && <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_#22d3ee]" />}

            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">{tframe} Outlook</span>
              {tf === tframe && <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">ACTIVE</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${closes.length && closes[closes.length - 1] > ema50[ema50.length - 1] ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {closes.length && closes[closes.length - 1] > ema50[ema50.length - 1] ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <div className={`text-lg font-bold ${rsi14.length && rsi14[rsi14.length - 1] > 60 ? 'text-green-400' : rsi14.length && rsi14[rsi14.length - 1] < 40 ? 'text-red-400' : 'text-white/80'}`}>
                  {rsi14.length && rsi14[rsi14.length - 1] > 60 ? 'Bullish' : rsi14.length && rsi14[rsi14.length - 1] < 40 ? 'Bearish' : 'Neutral'}
                </div>
                <div className="text-[10px] font-mono text-white/40">RSI: {rsi14.length ? rsi14[rsi14.length - 1]?.toFixed(1) : '-'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 mb-4 text-xs font-bold text-white/60">
        <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={showEMA} onChange={e => setShowEMA(e.target.checked)} className="accent-cyan-500" /> EMA Overlay</label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={showSignals} onChange={e => setShowSignals(e.target.checked)} className="accent-cyan-500" /> AI Signals</label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={showRSI} onChange={e => setShowRSI(e.target.checked)} className="accent-cyan-500" /> RSI</label>
        <label className="flex items-center gap-2 cursor-pointer hover:text-white"><input type="checkbox" checked={showMACD} onChange={e => setShowMACD(e.target.checked)} className="accent-cyan-500" /> MACD</label>
      </div>

      {err && <div className="card" style={{ borderColor: "var(--warn)" }}>{String(err)}</div>}

      {/* PRICE + EMA + SIGNALS */}
      <div className="dx-card bg-black/40 border-white/5 relative mb-4">
        <svg
          ref={svgRef}
          width={W}
          height={H_PRICE}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{ display: "block", background: "transparent" }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(p => (
            <line
              key={p}
              x1="0" y1={H_PRICE * p} x2={W} y2={H_PRICE * p}
              stroke="rgba(255,255,255,0.03)" strokeWidth="1"
            />
          ))}
          {priceScale && rows.map((r, i) => {
            const x = i * perCandle;
            const o = priceScale.y(r.o), h = priceScale.y(r.h), l = priceScale.y(r.l), c = priceScale.y(r.c);
            return <Candle key={i} x={x} w={perCandle} o={o} h={h} l={l} c={c} />;
          })}

          {showEMA && priceScale && ema50.length === rows.length && (
            <>
              <path
                d={rows.map((_, i) => `${i ? "L" : "M"} ${px(i * perCandle)} ${px(priceScale.y(ema50[i]))}`).join(" ")}
                fill="none" stroke="#22d3ee" strokeWidth="2" opacity="0.8"
              />
              <path
                d={rows.map((_, i) => `${i ? "L" : "M"} ${px(i * perCandle)} ${px(priceScale.y(ema200[i]))}`).join(" ")}
                fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.5"
              />
            </>
          )}

          {showSignals && priceScale && entries.map((i) => {
            const x = i * perCandle + perCandle / 2;
            const y = priceScale.y(rows[i].l) - 6;
            return <polygon key={i} points={`${x},${y} ${x - 6},${y + 10} ${x + 6},${y + 10}`} fill="#4ade80" />;
          })}

          {!!hover && <line x1={hover.x + perCandle / 2} x2={hover.x + perCandle / 2} y1={0} y2={H_PRICE} stroke="rgba(255,255,255,0.2)" strokeDasharray="4,4" />}
        </svg>
      </div>

      {/* RSI */}
      {showRSI && (
        <div className="dx-card bg-black/40 border-white/5 mb-4">
          <svg width={W} height={H_RSI} style={{ display: "block" }}>
            <line x1="0" x2={W} y1={rsiScale.y(70)} y2={rsiScale.y(70)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
            <line x1="0" x2={W} y1={rsiScale.y(30)} y2={rsiScale.y(30)} stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
            <path
              d={rsi14.map((v, i) => `${i ? "L" : "M"} ${px(i * perCandle)} ${px(rsiScale.y(v ?? 50))}`).join(" ")}
              fill="none" stroke="#22d3ee" strokeWidth="1.5"
            />
          </svg>
        </div>
      )}

      {/* MACD */}
      {showMACD && (
        <div className="dx-card bg-black/40 border-white/5 mb-4">
          <svg width={W} height={H_MACD} style={{ display: "block" }}>
            <line x1="0" x2={W} y1={macdScale.y(0)} y2={macdScale.y(0)} stroke="rgba(255,255,255,0.1)" />
            <path
              d={rows.map((_, i) => `${i ? "L" : "M"} ${px(i * perCandle)} ${px(macdScale.y(macd.macd[i] ?? 0))}`).join(" ")}
              fill="none" stroke="#3b82f6" strokeWidth="1.5"
            />
            <path
              d={rows.map((_, i) => `${i ? "L" : "M"} ${px(i * perCandle)} ${px(macdScale.y(macd.signal[i] ?? 0))}`).join(" ")}
              fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.8"
            />
          </svg>
        </div>
      )}

      {/* Tooltip */}
      {!!hover && rows[hover.i] && (
        <div className="dx-card bg-black/90 border-white/10 p-4 font-mono text-xs fixed top-24 right-8 z-50 pointer-events-none shadow-xl backdrop-blur-md">
          <div className="text-white/50 mb-2 border-b border-white/10 pb-1"><strong>{new Date(rows[hover.i].t).toLocaleString()}</strong></div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span>Open:</span> <span className="text-white">{rows[hover.i].o}</span>
            <span>High:</span> <span className="text-white">{rows[hover.i].h}</span>
            <span>Low:</span> <span className="text-white">{rows[hover.i].l}</span>
            <span>Close:</span> <span className="text-white">{rows[hover.i].c}</span>
          </div>
          <div className="mt-2 text-cyan-400">RSI: {rsi14[hover.i]?.toFixed(1)}</div>
          {entries.includes(hover.i) && <div className="mt-2 text-green-400 font-bold border rounded border-green-500/30 bg-green-500/10 px-2 py-1 text-center">BUY SIGNAL</div>}
        </div>
      )}

      <div className="card text-[10px] text-white/20 mt-8 border-none bg-transparent text-center">
        <p>
          ⚠️ MVP Version. Data provided by public APIs. Not financial advice.
        </p>
      </div>
    </section>
  );
}
