import { fetchCoinGeckoMarkets } from "./market";
import { fetchSignalsSnapshot } from "./signals";
import { fetchArbitrageOpportunities } from "./arbitrage";
import { fetchPredictionSnapshot } from "./predictions";
import { getFallbackMarkets, getFallbackSignals, getFallbackArbitrage, getFallbackPredictions } from "./fallbacks";

const COIN_IDS = ["bitcoin", "ethereum", "solana", "toncoin", "binancecoin"];

export async function fetchDashboardData() {
  const [marketsRes, signalsRes, arbitrageRes, predictionsRes] = await Promise.allSettled([
    fetchCoinGeckoMarkets(COIN_IDS),
    fetchSignalsSnapshot({ timeframes: ["1h"] }),
    fetchArbitrageOpportunities({ symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT"] }),
    fetchPredictionSnapshot({ symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT"] })
  ]);

  const markets = marketsRes.status === "fulfilled" && marketsRes.value?.length
    ? marketsRes.value
    : getFallbackMarkets({ ids: COIN_IDS });
  const signals = signalsRes.status === "fulfilled" && signalsRes.value?.length
    ? signalsRes.value
    : getFallbackSignals({ symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT", "BNBUSDT"], timeframes: ["1h"] });
  const arbitrage = arbitrageRes.status === "fulfilled" && arbitrageRes.value?.length
    ? arbitrageRes.value
    : getFallbackArbitrage({ symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT"] });
  const predictions = predictionsRes.status === "fulfilled" && predictionsRes.value?.length
    ? predictionsRes.value
    : getFallbackPredictions({ symbols: ["BTCUSDT", "ETHUSDT", "SOLUSDT", "TONUSDT"] });

  return {
    markets,
    signals: signals.slice(0, 6),
    arbitrage: arbitrage.slice(0, 6),
    predictions: predictions.slice(0, 6),
  };
}