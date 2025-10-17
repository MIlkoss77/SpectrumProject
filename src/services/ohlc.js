import { http } from "./http";
import { fetchBinanceKlines } from "./providers/market";

function formatKlines(klines = []) {
  return klines.map(k => ({
    t: k.openTime,
    o: k.o,
    h: k.h,
    l: k.l,
    c: k.c,
    v: k.volume,
  }));
}

export const MarketAPI = {
  
  ohlc: async (params = {}) => {
    const { source = "binance", symbol = "BTCUSDT", tf = "1h", limit = 200, ...rest } = params;
    const request = { symbol, tf, limit, ...rest };
    if (source === "binance-direct") {
      const direct = await fetchBinanceKlines(symbol, tf, limit);
      return formatKlines(direct);
    }
    try {
      const path = source === "binance" ? "/ohlc/binance" : "/ohlc";
      const response = await http.get(path, { params: request });
      return response.data;
    } catch (err) {
      console.warn("OHLC fallback", err?.message || err);
      const direct = await fetchBinanceKlines(symbol, tf, limit);
      return formatKlines(direct);
    }
  },
};