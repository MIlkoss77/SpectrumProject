// src/services/api.js
import { http } from "./http";
import { fetchSignalsSnapshot } from "./providers/signals";
import { fetchNewsFeed } from "./providers/news";
import { fetchArbitrageOpportunities } from "./providers/arbitrage";
import { fetchPredictionSnapshot } from "./providers/predictions";

async function tryHttp(fn, fallback) {
    if (!http) return fallback();
    try {
        return await fn();
    } catch (err) {
        console.warn("API fallback", err?.message || err);
        return fallback(err);
    }
}

// Сигналы
export const SignalsAPI = {
    
    list: (params = {}) =>
        tryHttp(
            () => http.get("/signals", { params }).then(r => r.data),
            () => fetchSignalsSnapshot(params)
        ),
};

// Новости
export const NewsAPI = {
    list: (params = {}) =>
        tryHttp(
            () => http.get("/news", { params }).then(r => r.data),
            () => fetchNewsFeed(params)
        ),
};

// Арбитраж
export const ArbitrageAPI = {
    
    list: (params = {}) =>
        tryHttp(
            () => http.get("/arbitrage", { params }).then(r => r.data),
            () => fetchArbitrageOpportunities(params)
        ),
};

// ПРЕДСКАЗАНИЯ (Единственный экспорт с таким именем!)
export const PredictionsAPI = {
    
    list: (params = {}) =>
        tryHttp(
            () => http.get("/predictions", { params }).then(r => r.data),
            () => fetchPredictionSnapshot(params)
        ),
};

// Копитрейд (симуляция)
export const CopySimAPI = {
    simulate: (body) => http.post("/copy/simulate", body).then(r => r.data),
};

// Стратегия / рекомендации
export const StrategyAPI = {
    get: () => http.get("/strategy").then(r => r.data),
    set: (payload) => http.post("/strategy", payload).then(r => r.data),
    recs: (params = {}) => http.get("/recs/strategy", { params }).then(r => r.data),
};

// Геймификация
export const GamificationAPI = {
    badges: (params = {}) => http.get("/gamification/badges", { params }).then(r => r.data),
};

// Биллинг (мок)
export const BillingAPI = {
    me: () => http.get("/me").then(r => r.data),
    mockCheckout: (plan) =>
        http
            .post("/billing/webhook/mock", {