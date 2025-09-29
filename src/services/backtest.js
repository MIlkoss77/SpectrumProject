// src/services/backtest.js
import { http } from "./http";

export const BacktestAPI = {
  run: (payload) => http.post("/backtest", payload).then((r) => r.data),
};
