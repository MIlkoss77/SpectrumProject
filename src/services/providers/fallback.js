// src/services/providers/fallback.js
export function getFallbackArbitrage() {
  const now = Date.now();
  return {
    ts: new Date(now).toISOString(),
    legs: [
      { exchange: "Binance",  pair: "BTCUSDT", price: 68000.0 },
      { exchange: "Bybit",    pair: "BTCUSDT", price: 68010.5 },
      { exchange: "Kraken",   pair: "BTCUSDT", price: 67995.7 },
      { exchange: "Coinbase", pair: "BTCUSD",  price: 68005.3 },
    ],
    bestSpreadPct: 0.03,
    estNetAfterFeesPct: 0.02,
    note: "fallback synthetic snapshot",
  };
}

// Fallback signals для случаев, когда API недоступен
export function getFallbackSignals({ symbols = ["BTCUSDT", "ETHUSDT"], timeframes = ["15m", "1h"] } = {}) {
  const items = [];
  const now = Date.now();
  
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      // Генерируем синтетические сигналы с базовыми значениями
      items.push({
        id: `${symbol}-${timeframe}`,
        symbol,
        timeframe,
        price: symbol.startsWith('BTC') ? 65000 : symbol.startsWith('ETH') ? 3400 : 150,
        change24h: (Math.random() - 0.5) * 4, // -2% до +2%
        rsi: 50 + (Math.random() - 0.5) * 30, // 35-65
        emaFast: null,
        emaSlow: null,
        macd: null,
        macdSignal: null,
        macdHist: null,
        signal: ['BUY', 'SELL', 'BULLISH', 'BEARISH', 'NEUTRAL'][Math.floor(Math.random() * 5)],
        confidence: 0.5 + Math.random() * 0.3, // 0.5-0.8
        score: Math.floor((Math.random() - 0.5) * 8), // -4 до 4
        factors: ['EMA fast > slow', 'Price above EMA slow', 'RSI > 60'].slice(0, Math.floor(Math.random() * 3) + 1),
        sparkline: Array(20).fill(0).map(() => 100 + (Math.random() - 0.5) * 10),
        ts: now,
      });
    }
  }
  
  return items;
}

// Fallback predictions для случаев, когда API недоступен
export function getFallbackPredictions({ symbols = ["BTCUSDT", "ETHUSDT"] } = {}) {
  const items = [];
  const now = Date.now();
  const horizons = ["4h", "12h", "24h"];
  
  for (const symbol of symbols) {
    for (const horizon of horizons) {
      items.push({
        id: `${symbol}-${horizon}`,
        symbol,
        horizon,
        probUp: 0.5 + (Math.random() - 0.5) * 0.3, // 0.35-0.65
        brier: 0.2 + Math.random() * 0.1, // 0.2-0.3
        score: Math.floor((Math.random() - 0.5) * 6), // -3 до 3
        rationale: ['Momentum bullish vs EMA', 'RSI > 60'].slice(0, Math.floor(Math.random() * 2) + 1),
        ts: now,
      });
    }
  }
  
  return items;
}
