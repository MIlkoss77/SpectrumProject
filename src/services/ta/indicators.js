// Простейшие индикаторы для фронта (без зависимостей)
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function sma(arr, period) {
  const out = Array(arr.length).fill(null)
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= period) sum -= arr[i - period]
    if (i >= period - 1) out[i] = sum / period
  }
  return out
}

export function ema(arr, period) {
  const out = Array(arr.length).fill(null)
  const k = 2 / (period + 1)
  let prev = null
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]
    if (v == null) continue
    if (prev == null) {
      prev = v
      out[i] = v
    } else {
      prev = v * k + prev * (1 - k)
      out[i] = prev
    }
  }
  return out
}

export function rsi(closes, period = 14) {
  const out = Array(closes.length).fill(null)
  let gain = 0, loss = 0
  for (let i = 1; i < closes.length; i++) {
    const ch = closes[i] - closes[i - 1]
    if (i <= period) {
      if (ch > 0) gain += ch; else loss -= ch
      if (i === period) {
        const rs = loss === 0 ? 100 : gain / loss
        out[i] = 100 - (100 / (1 + rs))
      }
    } else {
      const g = ch > 0 ? ch : 0
      const l = ch < 0 ? -ch : 0
      gain = (gain * (period - 1) + g) / period
      loss = (loss * (period - 1) + l) / period
      const rs = loss === 0 ? 100 : gain / loss
      out[i] = 100 - (100 / (1 + rs))
    }
  }
  return out
}

export function macd(closes, fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(closes, fast)
  const emaSlow = ema(closes, slow)
  const macdLine = closes.map((_, i) =>
    emaFast[i] != null && emaSlow[i] != null ? emaFast[i] - emaSlow[i] : null
  )
  const signalLine = ema(macdLine.map(v => v ?? 0), signal)
  const hist = macdLine.map((v, i) =>
    v != null && signalLine[i] != null ? v - signalLine[i] : null
  )
  return { macdLine, signalLine, hist }
}
