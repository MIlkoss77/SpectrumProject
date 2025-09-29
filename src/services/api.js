// src/services/api.js
import { http } from "./http";

// Сигналы
export const SignalsAPI = {
    list: (params = {}) => http.get("/signals", { params }).then(r => r.data),
};

// Новости
export const NewsAPI = {
    list: (params = {}) => http.get("/news", { params }).then(r => r.data),
};

// Арбитраж
export const ArbitrageAPI = {
    list: (params = {}) => http.get("/arbitrage", { params }).then(r => r.data),
};

// ПРЕДСКАЗАНИЯ (Единственный экспорт с таким именем!)
export const PredictionsAPI = {
    list: (params = {}) => http.get("/predictions", { params }).then(r => r.data),
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

// Стейкинг
export const StakingAPI = {
    list: (params = {}) => http.get("/staking/pools", { params }).then(r => r.data),
};

// Биллинг (мок)
export const BillingAPI = {
    me: () => http.get("/me").then(r => r.data),
    mockCheckout: (plan) =>
        http
            .post("/billing/webhook/mock", {
                type: "checkout.session.completed",
                data: { plan },
            })
            .then(r => r.data),
};
