import { http } from "./http";

export const MarketAPI = {
  ohlc: (params = {}) => http.get("/ohlc", { params }).then(r => r.data),
};
