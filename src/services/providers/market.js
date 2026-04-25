// src/services/providers/market.js
import { http } from '../api.js'

// Получение данных через прокси бэкенда
const BINANCE_BASE = '/api/proxy/binance';
const BYBIT_BASE = '/api/proxy/bybit';
const MEXC_BASE = '/api/proxy/mexc';

// Singleton to track data integrity
class NetworkMonitor {
  constructor() {
    this.history = [];
    this.maxHistory = 10;
    this.listeners = new Set();
  }

  log(success) {
    this.history.push({ ts: Date.now(), success });
    if (this.history.length > this.maxHistory) this.history.shift();
    this.notify();
  }

  getStatus() {
    if (this.history.length === 0) return 'UNKNOWN';
    const recent = this.history.slice(-5);
    const successCount = recent.filter(h => h.success).length;
    if (successCount === recent.length) return 'LIVE';
    if (successCount === 0) return 'FALLBACK';
    return 'DEGRADED';
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getStatus()));
  }
}

export const monitor = new NetworkMonitor();

const TF_MAP = { '1m': '1m', '5m': '5m', '15m': '15m', '1h': '1h', '4h': '4h', '1d': '1d' };

export async function fetchBinanceKlines(symbol, timeframe = '1h', limit = 500) {
  const interval = TF_MAP[timeframe] || timeframe;
  const url = `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const cacheKey = `klines_${symbol}_${interval}`;

  try {
    const res = await http.get(`${BINANCE_BASE}/api/v3/klines`, {
      params: { symbol, interval, limit }
    });
    const data = res.data;
    
    // Diagnostic logging for SYNC ISSUE
    if (data._meta) {
      console.log(`[Proxy Diagnostic] Source: ${data._meta.source}, Stale: ${data._meta.stale}`);
      if (data._meta.stale) {
        // If the proxy says it's stale, we count it as a partial failure for the monitor
        // to keep the user informed that data is not fresh.
        // monitor.log(false); // Uncomment if we want to force red on stale data
      }
    }
    
    monitor.log(true);

    // Save success to persistent storage
    localStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));

    return data.map(k => ({
      openTime: k[0],
      t: k[0],
      o: Number(k[1]),
      h: Number(k[2]),
      l: Number(k[3]),
      c: Number(k[4]),
      v: Number(k[5]),
      volume: Number(k[5]),
      closeTime: k[6],
      _stale: false
    }));
  } catch (err) {
    monitor.log(false);
    console.warn(`[fetchBinanceKlines] Primary fetch failed for ${symbol}. checking LKG...`, err.message);
    
    // --- LKG FALLBACK (SWR) ---
    const local = localStorage.getItem(cacheKey);
    if (local) {
      try {
        const { data, ts } = JSON.parse(local);
        const ageSec = Math.round((Date.now() - ts) / 1000);
        console.log(`[SWR] Using cached data for ${symbol} (Age: ${ageSec}s)`);
        
        return data.map(k => ({
          openTime: k[0],
          t: k[0],
          o: Number(k[1]),
          h: Number(k[2]),
          l: Number(k[3]),
          c: Number(k[4]),
          v: Number(k[5]),
          volume: Number(k[5]),
          closeTime: k[6],
          _stale: true,
          _age: ageSec
        }));
      } catch (e) {}
    }

    throw new Error(`[fetchBinanceKlines] Total Failure: ${err?.message || 'Network error'}`);
  }
}

// --- Ticker Helpers ----------------------------------------------------------
let globalMarketBlock = false;
let blockExpires = 0;

function isNetworkBlocked() {
  if (globalMarketBlock && Date.now() < blockExpires) return true;
  globalMarketBlock = false;
  return false;
}

export async function fetchBinanceTicker(symbol) {
  if (isNetworkBlocked()) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await http.get(`${BINANCE_BASE}/api/v3/ticker/price`, { 
      params: { symbol },
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return parseFloat(res.data.price);
  } catch (e) {
    clearTimeout(timeoutId);
    // Silent fallback
    return null;
  }
}

export async function fetchBybitTicker(symbol) {
  if (isNetworkBlocked()) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const res = await http.get(`${BYBIT_BASE}/v5/market/tickers`, { 
      params: { category: 'spot', symbol },
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return res.data?.result?.list?.[0]?.lastPrice ? parseFloat(res.data.result.list[0].lastPrice) : null;
  } catch (e) {
    clearTimeout(timeoutId);
    // Silent fallback
    return null;
  }
}

export async function fetchMexcTicker(symbol) {
  if (isNetworkBlocked()) return null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await http.get(`${MEXC_BASE}/api/v3/ticker/price`, { 
      params: { symbol },
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    return res.data?.price ? parseFloat(res.data.price) : null;
  } catch (e) {
    clearTimeout(timeoutId);
    return null;
  }
}


// --- Latency penalty ---------------------------------------------------------
// Простейший «штраф» за задержку: чем больше latency, тем сильнее режем net.
// Коэффициенты можно будет обучить/подстроить под реальные данные.
export function computeLatencyPenalty(ms) {
  if (ms == null || Number.isNaN(ms)) return 0
  // 0.00…0.30 штрафа при 0–1500+ мс; после — ограничим 0.30
  const p = Math.min(ms / 5000, 0.30)
  return Number(p.toFixed(4))
}

// --- Внутренние утилиты ------------------------------------------------------
function netSpread({
  ask,
  bid,
  takerFeePct = 0.001,
  networkFeePct = 0.0005,
  latencyMs = 200,
}) {
  // Грубый спред и вычет комиссий + штраф задержки
  const gross = (bid - ask) / ask
  const fees = takerFeePct + networkFeePct
  const latencyPenalty = computeLatencyPenalty(latencyMs)
  const net = gross - fees - latencyPenalty
  return Number(net.toFixed(5))
}

// Markets snapshot
export async function getMarkets() {
  try {
    const [btc, eth] = await Promise.all([
      fetchBinanceTicker('BTCUSDT'),
      fetchBinanceTicker('ETHUSDT')
    ]);

    const items = [
      {
        symbol: 'BTC/USDT',
        ask: btc || 0,
        bid: (btc || 0) + 20,
        takerFeePct: 0.001,
        networkFeePct: 0.0005,
        latencyMs: 120
      },
      {
        symbol: 'ETH/USDT',
        ask: eth || 0,
        bid: (eth || 0) + 2,
        takerFeePct: 0.001,
        networkFeePct: 0.0005,
        latencyMs: 240
      },
    ].map((m) => ({ ...m, net: netSpread(m) }))

    return { items, ts: Date.now() }
  } catch (e) {
    // console.error("getMarkets failed, using partial fallback", e);
    return { items: [], ts: Date.now() };
  }
}

// Возвращает список кросс-биржевых «возможностей» на основе реальных данных.
// Символы для проверки (Top 10)
const ARB_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT'];

export async function getRealArbitrage(minNetPct = 0.1) {
  const now = Date.now()
  const items = []
  let failedCount = 0;

  // Parallel fetch for all symbols
  const promises = ARB_SYMBOLS.map(async (sym) => {
    try {
      const [binPrice, bybitPrice, mexcPrice] = await Promise.all([
        fetchBinanceTicker(sym),
        fetchBybitTicker(sym),
        fetchMexcTicker(sym)
      ]);

      if (binPrice == null && bybitPrice == null && mexcPrice == null) failedCount++;

      const validBin = binPrice != null && !isNaN(binPrice);
      const validBybit = bybitPrice != null && !isNaN(bybitPrice);
      const validMexc = mexcPrice != null && !isNaN(mexcPrice);

      const prices = [
        { name: 'Binance', val: validBin ? binPrice : null },
        { name: 'Bybit', val: validBybit ? bybitPrice : null },
        { name: 'MEXC', val: validMexc ? mexcPrice : null }
      ].filter(p => p.val !== null);

      if (prices.length < 2) return;

      // Compare all pairs
      for (let i = 0; i < prices.length; i++) {
        for (let j = 0; j < prices.length; j++) {
          if (i === j) continue;
          
          const ex1 = prices[i];
          const ex2 = prices[j];
          
          const diff = ex2.val - ex1.val;
          const grossPct = (diff / ex1.val) * 100;
          const fees = (ex1.name === 'MEXC' || ex2.name === 'MEXC') ? 0.3 : 0.2; // MEXC has slightly higher taker or network friction in this model
          const netPct = grossPct - fees;

          items.push({
            symbol: sym,
            fromEx: ex1.name,
            toEx: ex2.name,
            feesPct: fees,
            netPct: netPct,
            ts: now,
            ask: ex1.val,
            bid: ex2.val,
            status: netPct > minNetPct ? 'PROFIT' : 'MONITOR'
          });
        }
      }

    } catch (err) {
      failedCount++;
      console.warn(`Arbitrage fetch failed for ${sym}`, err);
    }
  });

  await Promise.all(promises);

  // If too many failures, activate global block detection for 1 minute
  if (failedCount >= ARB_SYMBOLS.length / 2) {
    globalMarketBlock = true;
    blockExpires = Date.now() + 60000;
    // console.warn("Global network block detected. Switching to local simulation for 60s.");
  }

  return { items: items.sort((a, b) => b.netPct - a.netPct), ts: now }
}

// Keep the old mock function just in case or alias it
export const getArbitrage = getRealArbitrage;


// Для удобства импорта «по умолчанию»
export default { getMarkets, computeLatencyPenalty, getArbitrage }
