# Spectr Trading - Full Project Guide

This guide provides a comprehensive overview of the Spectr Trading project, a Mass Market Premium AI Trading PWA designed for the LATAM market.

## 1. Vision & Goals
- **Product:** AI-Powered Copy & Arbitrage PWA.
- **Philosophy:** "The Apple of Trading Apps" — fluid animations, glassmorphism, and "living" data.
- **Goal:** Simplify complex trading tools into a one-click, premium experience.
- **Market:** LATAM traders (Brazil, Argentina, Mexico) with support for ES, PT, EN, and RU.

## 2. Tech Stack
### Frontend
- **Framework:** React + Vite
- **PWA:** `vite-plugin-pwa` for native-like installability and offline support.
- **Styling:** Vanilla CSS / Modern UI patterns (Glassmorphism).
- **Charts:** TradingView Lightweight Charts for real-time data visualization.
- **State/Routing:** `react-router-dom`, React Context API.
- **Internationalization:** `i18next` (ES, PT, EN, RU).

### Backend
- **Server:** Node.js + Express (located in `/server`).
- **Proxies:** Used for fetching news (RSS), exchange tickers (Bybit), and whale data (Etherscan) to bypass CORS and manage API keys.
- **Orchestration:** n8n for automated workflows (rebalancing, notifications, gamification).

## 3. Core Features & Services
### AI Signals (`src/services/providers/signals.js`)
- Technical indicators: RSI, EMA, MACD, Bollinger Bands.
- Confidence levels and "Apply to Chart" functionality.

### News & Sentiment (`server/index.js`, `src/services/providers/news.js`)
- Aggregated from CoinDesk and CoinTelegraph.
- NLP sentiment analysis (Bullish/Bearish).

### Real-Time Arbitrage (`src/services/providers/market.js`)
- Monitors price differences between Binance and Bybit.
- Includes a **Latency Penalty** algorithm to calculate *net* profit accurately.

### Whale Alerts (`src/services/providers/whales.js`)
- Real-time tracking of large transactions on Ethereum and Solana.
- Direct integration with Etherscan and Solscan APIs.

### Copy Trading & Strategies
- **MVP:** Simulated copy trading (paper trading) with PnL tracking.
- **Strategies:** Preset risk-based allocations with n8n-powered rebalancing.

## 4. Directory Structure
```text
/
├── server/             # Express proxy server
├── src/
│   ├── components/     # UI components (Signals, Charts, etc.)
│   ├── context/        # Global state (User, Trade settings)
│   ├── pages/          # Layout-level pages (Dashboard, Signals, News)
│   ├── services/       # Core business logic
│   │   ├── api.js      # Central API client
│   │   └── providers/  # Data source implementations
│   └── styles/         # Global themes and CSS
├── public/             # Static assets (icons, manifest)
└── PROJECT_GUIDE.md    # This document
```

## 5. Deployment & Development
- **Dev Mode:** `npm run dev` (runs both frontend and backend concurrently).
- **Build:** `npm run build` (generates `/dist` for static hosting).
- **Environment:** Requires `.env` with API keys (Etherscan, etc.). Refer to `.env.example`.

## 6. Integrations (n8n Workflows)
- **WF-1:** Auto-rebalance strategies based on market news/signals.
- **WF-2:** Gamification (Badges/Discounts) after completing Academy lessons.
- **WF-3:** High-priority notifications for Premium users.

---
*Created for: Spectr Trading AI Assistant (via OpenClaw)*
