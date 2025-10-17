import { computeLatencyPenalty, defaultFee, fetchBinanceTicker, fetchBybitTicker, fetchCoinbaseTicker, fetchKrakenTicker, fetchOKXTicker } from "./market";
import { getFallbackArbitrage } from "./fallbacks";

const EXCHANGES = [
  { id: "binance", label: "Binance", fetcher: fetchBinanceTicker },
  { id: "okx", label: "OKX", fetcher: symbol => fetchOKXTicker(symbol.replace("USDT", "-USDT")) },
  { id: "bybit", label: "Bybit", fetcher: fetchBybitTicker },
  { id: "kraken", label: "Kraken", fetcher: fetchKrakenTicker },
  { id: "coinbase", label: "Coinbase", fetcher: fetchCoinbaseTicker },
];

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT", "BNBUSDT"];

function calcNet({ buy, sell }) {
  const gross = ((sell.bid - buy.ask) / buy.ask) * 100;
  const fees = defaultFee(buy.exchange) + defaultFee(sell.exchange);
  const latency = computeLatencyPenalty(buy.exchange) + computeLatencyPenalty(sell.exchange);
  const net = gross - fees - latency;
  return { gross, fees, latency, net };
}

export async function fetchArbitrageOpportunities({ symbols = DEFAULT_SYMBOLS } = {}) {
  const result = [];
  for (const symbol of symbols) {
    const quotes = await Promise.all(
      EXCHANGES.map(async ex => {
        try {
          const ticker = await ex.fetcher(symbol);
          return { ...ticker, id: ex.id };
        } catch (err) {
          console.warn("Arb ticker failed", ex.id, symbol, err.message);
          return null;
        }
      })
    );
    const valid = quotes.filter(Boolean);
    for (const buy of valid) {
      for (const sell of valid) {
        if (buy.exchange === sell.exchange) continue;
        if (!buy.ask || !sell.bid) continue;
        const { gross, fees, latency, net } = calcNet({ buy, sell });
        if (!Number.isFinite(net)) continue;
        result.push({
          id: `${symbol}-${buy.exchange}-${sell.exchange}`,
          symbol,
          buy,
          sell,
          gross,
          net,
          fees,
          latency,
          ts: Date.now(),
        });
      }
    }
  }
  let opportunities = result
    .filter(item => item.net > 0)
    .sort((a, b) => b.net - a.net);

  if (!opportunities.length) {
    return getFallbackArbitrage({ symbols }).sort((a, b) => (b.net ?? 0) - (a.net ?? 0));
  }

  const seen = new Set(opportunities.map(item => item.id));
  const fallback = getFallbackArbitrage({ symbols });
  for (const item of fallback) {
    if ((item.net ?? 0) <= 0) continue;
    if (!seen.has(item.id)) {
      opportunities.push(item);
      seen.add(item.id);
    }
  }

  return opportunities.sort((a, b) => (b.net ?? 0) - (a.net ?? 0)).slice(0, 30);
}