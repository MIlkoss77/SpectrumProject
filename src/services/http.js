// src/services/http.js
import axios from "axios";

const host = import.meta.env.VITE_API_HOST; // приходит из render.yaml
const base =
  import.meta.env.VITE_API_BASE
  || (host ? `https://${host}` : "http://localhost:8787"); // сборка полного URL

export const http = axios.create({
  baseURL: base,
  timeout: 10000,
});

http.interceptors.response.use(
  r => r,
  err => {
    const e = {
      status: err.response?.status || 0,
      code: err.response?.data?.code || "ERR_HTTP",
      message: err.response?.data?.message || err.message,
      data: err.response?.data
    };
    return Promise.reject(e);
  }
);
