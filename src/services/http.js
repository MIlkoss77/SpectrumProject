import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8787",
  timeout: 15000,
});

http.interceptors.request.use(cfg => {
  const token = localStorage.getItem("spectr.token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
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
