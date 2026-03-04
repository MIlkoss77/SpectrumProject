export function detectSignals(candles, closes, ema50, ema200, rsi14, macdLine, sigLine) {
  const out = [];
  const crossed = (aPrev, a, bPrev, b) =>
    aPrev != null && bPrev != null && a != null && b != null &&
    ((aPrev <= bPrev && a > b) || (aPrev >= bPrev && a < b));
  for (let i = 1; i < closes.length; i++) {
    if (ema50[i-1]!=null && ema200[i-1]!=null && ema50[i]!=null && ema200[i]!=null) {
      if (ema50[i-1] <= ema200[i-1] && ema50[i] > ema200[i]) out.push({ i, type:"BUY",  code:"EMA50_OVER_200" });
      if (ema50[i-1] >= ema200[i-1] && ema50[i] < ema200[i]) out.push({ i, type:"SELL", code:"EMA50_UNDER_200" });
    }
    if (rsi14[i-1]!=null && rsi14[i]!=null) {
      if (rsi14[i-1] <= 30 && rsi14[i] > 30) out.push({ i, type:"BUY",  code:"RSI_30_UP" });
      if (rsi14[i-1] >= 70 && rsi14[i] < 70) out.push({ i, type:"SELL", code:"RSI_70_DN" });
    }
    if (crossed(macdLine[i-1], macdLine[i], sigLine[i-1], sigLine[i])) {
      if (macdLine[i-1] <= sigLine[i-1] && macdLine[i] > sigLine[i]) out.push({ i, type:"BUY",  code:"MACD_CROSS_UP" });
      if (macdLine[i-1] >= sigLine[i-1] && macdLine[i] < sigLine[i]) out.push({ i, type:"SELL", code:"MACD_CROSS_DN" });
    }
  }
  return out;
}