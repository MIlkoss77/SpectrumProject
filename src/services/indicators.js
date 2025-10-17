export function sma(values, period) {
  if (!Array.isArray(values) || values.length < period || period <= 0) return [];
  const out = new Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(values, period) {
  if (!Array.isArray(values) || values.length === 0 || period <= 0) return [];
  const k = 2 / (period + 1);
  const out = new Array(values.length).fill(null);
  let emaPrev = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    emaPrev = emaPrev == null ? v : (v - emaPrev) * k + emaPrev;
    out[i] = emaPrev;
  }
  return out;
}

export function rsi(values, period = 14) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const out = new Array(values.length).fill(null);
  let gain = 0;
  let loss = 0;
  for (let i = 1; i < values.length; i++) {
    const change = values[i] - values[i - 1];
    const up = Math.max(change, 0);
    const down = Math.max(-change, 0);
    if (i <= period) {
      gain += up;
      loss += down;
      if (i === period) {
        const rs = loss === 0 ? 100 : gain / loss;
        out[i] = 100 - 100 / (1 + rs);
      }
    } else {
      gain = (gain * (period - 1) + up) / period;
      loss = (loss * (period - 1) + down) / period;
      const rs = loss === 0 ? 100 : gain / loss;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  return out;
}

export function macd(values, fast = 12, slow = 26, signal = 9) {
  if (!Array.isArray(values) || values.length === 0) {
    return { macd: [], signal: [], hist: [] };
  }
  const emaFast = ema(values, fast);
  const emaSlow = ema(values, slow);
  const macdLine = emaFast.map((v, i) => (v != null && emaSlow[i] != null ? v - emaSlow[i] : null));
  const signalLine = ema(macdLine.map(v => (v == null ? 0 : v)), signal).map((v, i) => (macdLine[i] == null ? null : v));
  const hist = macdLine.map((v, i) => (v == null || signalLine[i] == null ? null : v - signalLine[i]));
  return { macd: macdLine, signal: signalLine, hist };
}

export function bollinger(values, period = 20, multiplier = 2) {
  if (!Array.isArray(values) || values.length === 0 || period <= 0) {
    return { basis: [], upper: [], lower: [] };
  }
  const basis = sma(values, period);
  const upper = new Array(values.length).fill(null);
  const lower = new Array(values.length).fill(null);
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const mean = basis[i];
    const variance = slice.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    upper[i] = mean + multiplier * std;
    lower[i] = mean - multiplier * std;
  }
  return { basis, upper, lower };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function zScore(value, mean, std) {
  if (std === 0) return 0;
  return (value - mean) / std;
}