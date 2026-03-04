// src/services/exchanges/bybit.js
// Bybit Unified v5 market data: REST klines + public WS klines.
// httpGet встроен внутрь, чтобы не зависеть от других импортов.

/* ---------- http helper ---------- */
async function httpGet(url, { timeout = 10000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} :: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } catch (e) {
    throw new Error(`[httpGet] ${url} :: ${e?.message || 'Network error'}`);
  } finally {
    clearTimeout(id);
  }
}

/* ---------- Bybit constants ---------- */
// В Vite import.meta.env доступен всегда — дополнительная защита не нужна.
const BASE = '/bybit-api';
const CATEGORY = 'linear'; // USDT perpetual
const TF_MAP = { '1m': '1', '5m': '5', '15m': '15', '1h': '60' };

function normalizeKlines(v5) {
  const list = v5?.result?.list || [];
  return list
    .map(a => ({
      t: Number(a[0]),
      o: Number(a[1]),
      h: Number(a[2]),
      l: Number(a[3]),
      c: Number(a[4]),
    }))
    .sort((x, y) => x.t - y.t);
}

/* ---------- REST: getKlines ---------- */
export async function getKlines(symbol = 'BTCUSDT', tf = '15m', limit = 500) {
  const interval = TF_MAP[tf] || '15';
  const url = `${BASE}/v5/market/kline?category=${CATEGORY}&symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const j = await httpGet(url, { timeout: 10000 });
  if (j.retCode !== 0) throw new Error(`[Bybit] retCode ${j.retCode} :: ${j.retMsg || 'Unknown'}`);
  return normalizeKlines(j);
}

/* ---------- WS: wsKlines ---------- */
export function wsKlines({ symbol = 'BTCUSDT', tf = '1m', onMessage } = {}) {
  const interval = TF_MAP[tf] || '1';
  const ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');

  ws.onopen = () => {
    const arg = `kline.${interval}.${symbol}`;
    ws.send(JSON.stringify({ op: 'subscribe', args: [arg] }));
  };

  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      // { topic:"kline.1.BTCUSDT", data:[{ start, open, high, low, close, ... }] }
      if (msg?.topic?.startsWith('kline.') && Array.isArray(msg?.data)) {
        const k = msg.data[0];
        onMessage?.({
          t: Number(k.start),
          o: Number(k.open),
          h: Number(k.high),
          l: Number(k.low),
          c: Number(k.close),
        });
      }
    } catch (_) { }
  };

  ws.onerror = () => { };
  ws.onclose = () => { };

  const unsubscribe = () => { try { ws.close(); } catch (_) { } };
  return { ws, unsubscribe };
}
