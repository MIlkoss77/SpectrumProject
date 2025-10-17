import { clamp, ema, macd, rsi } from "../indicators";
import { fetchBinanceKlines } from "./market";
import { getFallbackPredictions } from "./fallbacks";

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT", "BNBUSDT"];
const HORIZONS = { "4h": 4, "12h": 12, "24h": 24 };

function computeScore(closes, emaFast, emaSlow, rsi14, macdHist, idx) {
  const price = closes[idx];
  const fast = emaFast[idx];
  const slow = emaSlow[idx];
  const rsiVal = rsi14[idx];
  const hist = macdHist[idx];
  if (!price || fast == null || slow == null || rsiVal == null || hist == null) return null;
  let score = 0;
  if (fast > slow) score += 1; else score -= 1;
  if (rsiVal > 60) score += 1; else if (rsiVal < 40) score -= 1;
  if (hist > 0) score += 1; else score -= 1;
  return score; // -3..3
}

function adjustProbability(base, score) {
  const adjustment = (score || 0) * 0.06; // max ±0.18
  return clamp(base + adjustment, 0.05, 0.95);
}

function brierFromHistory(samples, base) {
  if (!samples.length) return 0.25;
  const prob = base;
  const sum = samples.reduce((acc, s) => acc + Math.pow(prob - s.outcome, 2), 0);
  return +(sum / samples.length).toFixed(3);
}

async function buildPredictionsForSymbol(symbol, timeframe = "1h") {
  let klines;
  try {
    klines = await fetchBinanceKlines(symbol, timeframe, 600);
  } catch (err) {
    console.warn("Prediction fetch failed", symbol, err.message);
    return [];
  }
  const closes = klines.map(k => k.c);
  const ema34 = ema(closes, 34);
  const ema89 = ema(closes, 89);
  const rsi14 = rsi(closes, 14);
  const macdFast = macd(closes, 12, 26, 9);
  const hist = macdFast.hist;

  const latestIdx = closes.length - 1;
  const latestScore = computeScore(closes, ema34, ema89, rsi14, hist, latestIdx) ?? 0;

  const results = [];
  for (const [label, horizon] of Object.entries(HORIZONS)) {
    const samples = [];
    for (let i = 200; i < closes.length - horizon; i++) {
      const s = computeScore(closes, ema34, ema89, rsi14, hist, i);
      if (s == null) continue;
      const future = closes[i + horizon] - closes[i];
      const outcome = future > 0 ? 1 : 0;
      samples.push({ score: s, outcome });
    }
    if (!samples.length) continue;
    const wins = samples.filter(s => s.outcome === 1).length;
    const base = wins / samples.length;
    const probUp = adjustProbability(base, latestScore);
    const brier = brierFromHistory(samples, base);
    const rationale = [];
    if (latestScore > 1) rationale.push("Momentum bullish vs EMA");
    if (latestScore < -1) rationale.push("Momentum bearish vs EMA");
    const lastRsi = rsi14[latestIdx];
    if (lastRsi != null) {
      if (lastRsi > 65) rationale.push("RSI overheated");
      if (lastRsi < 35) rationale.push("RSI oversold");
    }
    const lastHist = hist[latestIdx];
    if (lastHist != null) rationale.push(`MACD hist ${lastHist > 0 ? "positive" : "negative"}`);

    results.push({
      id: `${symbol}-${label}`,
      symbol,
      horizon: label,
      probUp: +probUp.toFixed(3),
      brier,
      score: latestScore,
      rationale,
      ts: Date.now(),
    });
  }
  return results;
}

export async function fetchPredictionSnapshot({ symbols = DEFAULT_SYMBOLS } = {}) {
  const responses = await Promise.all(symbols.map(symbol => buildPredictionsForSymbol(symbol)));
  const data = responses.flat();
  const combos = new Set(data.map(item => `${item.symbol}-${item.horizon}`));
  const fallback = getFallbackPredictions({ symbols });
  for (const item of fallback) {
    const key = `${item.symbol}-${item.horizon}`;
    if (!combos.has(key)) {
      data.push(item);
      combos.add(key);
    }
  }
  const list = data.length ? data : fallback;
  return list.sort((a, b) => (b.probUp ?? 0) - (a.probUp ?? 0));
}