// src/services/api.js
import axios from "axios";

// База для API (локально 8787, в проде подставим env)
const host = import.meta.env.VITE_API_HOST;
const base =
  import.meta.env.VITE_API_BASE ||
  (host ? `https://${host}` : "/api");

export const http = axios.create({
  baseURL: base,
  timeout: 10000,
});

export const PredictionsAPI = {
  list: (params = {}) => http.get("/predictions", { params }).then(r => r.data),
};

// Разделы API сгруппированы в один объект
export const API = {
  me: () => http.get("/me").then(r => r.data),

  // OHLC
  ohlc: {
    mock: (params = {}) => http.get("/ohlc", { params }).then(r => r.data),
    binance: (params = {}) => http.get("/ohlc/binance", { params }).then(r => r.data),
  },

  // Backtest
  backtest: {
    run: (payload) => http.post("/backtest", payload).then(r => r.data),
  },

  // Recommendations / strategy
  recs: {
    strategy: (params = {}) => http.get("/recs/strategy", { params }).then(r => r.data),
  },

  // Gamification
  gamification: {
    badges: (userId) => http.get("/gamification/badges", { params: { userId } }).then(r => r.data),
  },

  // Billing (моки)
  billing: {
    mockCheckout: (plan = "Trader") =>
      http.post("/billing/webhook/mock", {
        type: "checkout.session.completed",
        data: { plan },
      }).then(r => r.data),
  },

  // Events & Metrics
  events: () => http.get("/events").then(r => r.data),
  metrics: () => http.get("/metrics").then(r => r.data),
};

// При необходимости дефолтный экспорт
export default API;

export async function httpGet(url, { timeout = 8000 } = {}) {
  const ctrl = new AbortController(); const id = setTimeout(() => ctrl.abort(), timeout)
  try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.statusText); return await r.json() }
  finally { clearTimeout(id) }
}
