import { clamp, ema, macd, rsi } from "../ta/indicators";
import { fetchBinanceKlines } from "./market";
import { getFallbackPredictions } from "./fallback";
import { getPredictor } from "../ml/ml_model";

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT", "BNBUSDT"];
const HORIZONS = { "4h": 4, "12h": 12, "24h": 24 };

/**
 * Feature Extraction & Normalization for ML
 */
function prepareMlData(closes, ema34, ema89, rsi14, hist) {
  const features = [];
  for (let i = 100; i < closes.length; i++) {
    // 1. Normalized RSI (0-1)
    const normRsi = (rsi14[i] ?? 50) / 100;

    // 2. Normalized MACD Hist (Approximate normalization)
    const normMacd = clamp((hist[i] ?? 0) / (closes[i] * 0.002), -1, 1) * 0.5 + 0.5;

    // 3. EMA Distance (Fast vs Slow)
    const emaDiff = (ema34[i] - ema89[i]) / ema89[i];
    const normEma = clamp(emaDiff / 0.02, -1, 1) * 0.5 + 0.5;

    // 4. Price vs EMA (Trend)
    const priceTrend = (closes[i] - ema34[i]) / ema34[i];
    const normTrend = clamp(priceTrend / 0.01, -1, 1) * 0.5 + 0.5;

    // 5. OBI (Order Book Imbalance) - Fallback to 0.5 as we don't have deep book in klines
    const normObi = 0.5;

    features.push([normRsi, normMacd, normEma, normTrend, normObi]);
  }
  return features;
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

  const results = [];

  // Extract features for the entire history
  const allFeatures = prepareMlData(closes, ema34, ema89, rsi14, hist);
  const latestFeature = allFeatures[allFeatures.length - 1];

  for (const [label, horizon] of Object.entries(HORIZONS)) {
    const predictor = getPredictor(`${symbol}-${label}`);

    // Prepare Training Set
    const trainX = [];
    const trainY = [];

    // We start from index 100 (where prepareMlData started)
    // i in klines corresponds to i-100 in allFeatures
    for (let i = 100; i < closes.length - horizon; i++) {
      const featIdx = i - 100;
      const futurePrice = closes[i + horizon];
      const outcome = futurePrice > closes[i] ? 1 : 0;

      trainX.push(allFeatures[featIdx]);
      trainY.push([outcome]);
    }

    // Train the model on the fly (limited epochs for speed)
    if (trainX.length > 50) {
      await predictor.train(trainX, trainY, 15);
    }

    // Predict
    const probUpRaw = await predictor.predict(latestFeature);

    // Fallback/Safety: Mix with basic score for stability during early training
    const baseScore = (ema34[closes.length - 1] > ema89[closes.length - 1] ? 1 : -1) +
      (rsi14[closes.length - 1] > 50 ? 0.5 : -0.5);
    const probUp = clamp(probUpRaw * 0.8 + (baseScore > 0 ? 0.1 : -0.1), 0.1, 0.9);

    results.push({
      id: `${symbol}-${label}`,
      symbol,
      horizon: label,
      probUp: +probUp.toFixed(3),
      score: baseScore,
      rationale: [
        probUp > 0.6 ? "Neural Network: Strong Upward Bias" :
          probUp < 0.4 ? "Neural Network: Bearish Reversal Detected" : "ML: Neutral Sentiment",
        `Technical weight: ${baseScore > 0 ? "Bullish" : "Bearish"}`
      ],
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
