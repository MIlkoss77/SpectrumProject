import { rsi, macd, ema } from '../indicators';

/**
 * Normalizes live market data into a [5] feature row for ML v2
 * [normRSI, normMACD, normEMA_diff, normTrend, normOBI]
 */
export function prepareMLFeatureRow(klines, depth) {
    if (!klines || klines.length < 30) return [0.5, 0.5, 0.5, 0.5, 0.5];

    const closePrices = klines.map(k => parseFloat(k.close));

    // 1. RSI (0-100 normalized to 0-1)
    const rsiValues = rsi(closePrices, 14);
    const lastRSI = rsiValues[rsiValues.length - 1] || 50;
    const normRSI = lastRSI / 100;

    // 2. MACD Histogram (Normalized -1 to 1, then to 0-1)
    const { hist } = macd(closePrices);
    const lastHist = hist[hist.length - 1] || 0;
    const normMACD = Math.max(0, Math.min(1, (lastHist / (closePrices[closePrices.length - 1] * 0.001)) + 0.5));

    // 3. EMA Difference (Price vs EMA20)
    const ema20 = ema(closePrices, 20);
    const lastEma = ema20[ema20.length - 1] || closePrices[closePrices.length - 1];
    const diff = (closePrices[closePrices.length - 1] - lastEma) / lastEma;
    const normEMA = Math.max(0, Math.min(1, (diff * 50) + 0.5));

    // 4. Trend (Direction of last 5 bars)
    const last5 = closePrices.slice(-5);
    const trend = (last5[4] - last5[0]) / last5[0];
    const normTrend = Math.max(0, Math.min(1, (trend * 100) + 0.5));

    // 5. Order Book Imbalance (OBI)
    let normOBI = 0.5;
    if (depth && depth.bids && depth.asks) {
        const bidVol = depth.bids.slice(0, 5).reduce((acc, b) => acc + parseFloat(b[1]), 0);
        const askVol = depth.asks.slice(0, 5).reduce((acc, a) => acc + parseFloat(a[1]), 0);
        normOBI = bidVol / (bidVol + askVol);
    }

    return [normRSI, normMACD, normEMA, normTrend, normOBI];
}
