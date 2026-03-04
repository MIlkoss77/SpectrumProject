// src/services/providers/arbitrage.js
// Расчёт маршрута арбитража + совместимый мок для дашборда.

import { getMultiExchange, computeLatencyPenalty, computeNetSpread } from "./market";
import { getFallbackArbitrage } from "./fallback";

function pct(a, b) {
  return ((a - b) / b) * 100;
}

/**
 * scanRoute — считает «лучший» маршрут buy->sell на основе котировок,
 * применяет задержку/комиссии/слиппедж и возвращает показатели.
 */
export async function scanRoute(pair = "BTCUSDT", opts = {}) {
  try {
    const { quotes, errors } = await getMultiExchange(pair);
    if (!quotes?.length) {
      return { ok: false, fallback: true, data: getFallbackArbitrage(), errors };
    }
    const sorted = [...quotes].sort((a, b) => a.price - b.price);
    const bestBuy = sorted[0];
    const bestSell = sorted[sorted.length - 1];

    const grossSpreadPct = pct(bestSell.price, bestBuy.price);
    const netSpreadPct = computeNetSpread(grossSpreadPct, opts);

    return {
      ok: true,
      pair,
      quotes,
      route: { buy: bestBuy, sell: bestSell },
      metrics: {
        grossSpreadPct,
        netSpreadPct,
        latencyPenalty: computeLatencyPenalty(opts.latencyMs ?? 300),
        feesPct: opts.feesPct ?? 0.10,
        slippageBps: opts.slippageBps ?? 5,
      },
      errors,
    };
  } catch (e) {
    return { ok: false, fallback: true, data: getFallbackArbitrage(), error: String(e?.message || e) };
  }
}

/** Совместимость: фейковый список «возможностей» для дашборда */
export async function fetchArbitrageOpportunities() {
  return [
    { pair: "BTCUSDT", spread: 0.12, exchanges: ["Binance", "Kraken"] },
    { pair: "ETHUSDT", spread: 0.09, exchanges: ["Binance", "Coinbase"] },
    { pair: "TONUSDT", spread: 0.07, exchanges: ["OKX", "Binance"] },
  ];
}

export default {
  scanRoute,
  fetchArbitrageOpportunities,
};
