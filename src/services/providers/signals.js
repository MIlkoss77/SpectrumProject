import { fetchBinanceKlines } from './market';
import { ema, rsi, macd } from '@/services/ta/indicators';
import { ADX } from 'technicalindicators';
import { getFallbackSignals } from './fallback';

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT", "BNBUSDT"];
const DEFAULT_TIMEFRAMES = ["15m", "1h", "4h"];

function periodsFor24h(tf = "1h") {
  const match = /^([0-9]+)([mhd])$/.exec(tf);
  if (!match) return 24;
  const value = Number(match[1]);
  const unit = match[2];
  const minutes = unit === "m" ? value : unit === "h" ? value * 60 : value * 60 * 24;
  if (!minutes) return 24;
  return Math.max(1, Math.round((24 * 60) / minutes));
}

function evaluateSignal({ price, emaFast, emaSlow, rsiVal, macdLine, macdSignal, macdHist, adxVal }) {
  let score = 0;
  const factors = [];

  // ADX Filtering: If trend is weak (ADX < 25), reduce confidence/significance
  const isWeakTrend = adxVal != null && adxVal < 25;
  if (isWeakTrend) {
    factors.push("Weak Trend (ADX < 25)");
  } else if (adxVal != null && adxVal > 40) {
    factors.push("Very Strong Trend");
  }

  if (emaFast != null && emaSlow != null) {
    if (emaFast > emaSlow) {
      score += 1;
      factors.push("EMA fast > slow");
    } else if (emaFast < emaSlow) {
      score -= 1;
      factors.push("EMA fast < slow");
    }
  }

  if (price != null && emaSlow != null) {
    if (price > emaSlow) {
      score += 1;
      factors.push("Price above EMA slow");
    } else if (price < emaSlow) {
      score -= 1;
      factors.push("Price below EMA slow");
    }
  }

  if (rsiVal != null) {
    if (rsiVal > 60) {
      score += 1;
      factors.push("RSI > 60");
    } else if (rsiVal < 40) {
      score -= 1;
      factors.push("RSI < 40");
    }
  }

  if (macdLine != null && macdSignal != null) {
    if (macdLine > macdSignal) {
      score += 1;
      factors.push("MACD above signal");
    } else if (macdLine < macdSignal) {
      score -= 1;
      factors.push("MACD below signal");
    }
  }

  if (macdHist != null) {
    if (macdHist > 0) {
      score += 1;
      factors.push("MACD hist > 0");
    } else if (macdHist < 0) {
      score -= 1;
      factors.push("MACD hist < 0");
    }
  }

  let capped = Math.max(-4, Math.min(4, score));

  // If trend is weak, dampen the score to push signals towards NEUTRAL/BULLISH/BEARISH instead of BUY/SELL
  if (isWeakTrend) {
    capped = Math.round(capped / 2);
  }

  const confidence = Math.min(0.95, Math.max(0.05, 0.55 + capped * 0.08));
  let signal;
  if (capped >= 2) signal = "BUY";
  else if (capped <= -2) signal = "SELL";
  else if (capped > 0) signal = "BULLISH";
  else if (capped < 0) signal = "BEARISH";
  else signal = "NEUTRAL";

  return {
    score: capped,
    confidence,
    signal,
    factors: factors.slice(0, 4),
  };
}

async function buildSignal(symbol, timeframe) {
  try {
    const klines = await fetchBinanceKlines(symbol, timeframe, 240);
    if (!Array.isArray(klines) || klines.length === 0) {
      return null;
    }

    const closes = klines.map(k => k.c);
    const highs = klines.map(k => k.h);
    const lows = klines.map(k => k.l);

    const emaFastSeries = ema(closes, 21);
    const emaSlowSeries = ema(closes, 55);
    const rsiSeries = rsi(closes, 14);
    const macdSeries = macd(closes, 12, 26, 9);

    // ADX Calculation
    const adxSeries = ADX.calculate({
      period: 14,
      high: highs,
      low: lows,
      close: closes
    });

    const latestIdx = closes.length - 1;
    const price = closes[latestIdx];
    const emaFast = emaFastSeries.at(-1) ?? null;
    const emaSlow = emaSlowSeries.at(-1) ?? null;
    const rsiVal = rsiSeries.at(-1) ?? null;
    const macdLine = macdSeries.macdLine?.at(-1) ?? null;
    const macdSignal = macdSeries.signalLine?.at(-1) ?? null;
    const macdHist = macdSeries.hist?.at(-1) ?? null;
    const adxVal = adxSeries.at(-1)?.adx ?? null;

    const lookback = periodsFor24h(timeframe);
    const referenceIdx = Math.max(0, latestIdx - lookback);
    const reference = closes[referenceIdx];
    const change24h = reference ? ((price - reference) / reference) * 100 : 0;

    const { score, confidence, signal, factors } = evaluateSignal({
      price,
      emaFast,
      emaSlow,
      rsiVal,
      macdLine,
      macdSignal,
      macdHist,
      adxVal,
    });

    const sparkline = closes.slice(-20);

    return {
      id: `${symbol}-${timeframe}`,
      symbol,
      timeframe,
      price,
      change24h,
      rsi: rsiVal,
      adx: adxVal,
      emaFast,
      emaSlow,
      macd: macdLine,
      macdSignal,
      macdHist,
      signal,
      confidence,
      score,
      factors,
      sparkline,
      ts: Date.now(),
    };
  } catch (err) {
    console.error(`[buildSignal] CRITICAL ERROR for ${symbol} ${timeframe}:`, err);
    return null;
  }
}

export async function fetchSignalsSnapshot({ symbols = DEFAULT_SYMBOLS, timeframes = DEFAULT_TIMEFRAMES, limit = 20 } = {}) {
  const combos = [];
  for (const symbol of symbols) {
    for (const timeframe of timeframes) {
      combos.push({ symbol, timeframe });
    }
  }

  const responses = await Promise.all(combos.map(({ symbol, timeframe }) => buildSignal(symbol, timeframe)));
  let items = responses.filter(Boolean);

  if (!items.length) {
    return getFallbackSignals({ symbols, timeframes }).slice(0, limit);
  }

  items = items.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  const fallback = getFallbackSignals({ symbols, timeframes });
  const seen = new Set(items.map(item => item.id));
  for (const item of fallback) {
    if (!seen.has(item.id)) {
      items.push(item);
      seen.add(item.id);
    }
  }

  return items.slice(0, limit);
}
