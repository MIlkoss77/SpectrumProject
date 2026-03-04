// src/services/backtest.js
import { http } from "./api";

export const BacktestAPI = {
  run: (payload) => http.post("/backtest", payload).then((r) => r.data),
};
