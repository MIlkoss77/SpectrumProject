import { http } from "./http";
export const MarketAPI = {
  ohlc: (params = {}) => {
    const { source = "mock", ...q } = params;
    const path = source === "binance" ? "/ohlc/binance" : "/ohlc";
    return http.get(path, { params: q }).then(r => r.data);
  },
};


