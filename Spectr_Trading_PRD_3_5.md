# PRD 3.5 — Spectr Trading: The "Golden" Update
**Vision: The Apple of Crypto Trading — Seamless, Visual, Secure.**
**Version:** 3.5
**Focus:** Crypto Payment Integration, Visual Magic (UX/UI), Real-time Performance.

---

## 1) Core Objective
Transition Spectr from a "waitlist/demo" state to a fully functional, premium trading platform with real crypto transactions and a "wow" visual experience that feels like a native high-end app.

## 2) Key Features (Phase 3.5)

### F-01. Crypto Gateway (The "Money" Pillar)
- **Manual/Automated Deposits**: Allow users to "Upgrade to Pro" using USDT/SOL/ETH.
- **Deposit UI**: A premium modal in the `Pricing` page that generates a deposit address (or shows a static one for now with "Submit TxID" flow).
- **Backend Verification**: `paymentController` to handle transaction submission and (eventually) automated verification via block explorers.
- **Pro Status Logic**: Link `User` to `Payment` and unlock features globally when status is `COMPLETED`.

### F-02. Visual Magic (The "Wow" Factor)
- **Glassmorphism 2.0**: Deeper blur effects, thinner borders, and subtle glow accents on all cards.
- **Micro-interactions**: Enhanced `Framer Motion` animations for page transitions, button hovers, and data updates.
- **Living Numbers**: Prices on the dashboard must "pulse" (green/red) when they change, using the `PricePulse` component more effectively.
- **Skeleton Loaders**: Replace all remaining spinners with elegant, moving skeletons.

### F-03. WebSocket Real-time Engine
- **Binance/Bybit WS**: Replace REST polling with WebSockets in the main dashboard.
- **Smooth Charting**: TradingView charts should update tick-by-tick without refresh.

### F-04. PWA Completion
- **Installability**: Fully functional manifest and service worker.
- **Native Polish**: Disable all browser-specific UI (selection, overscroll) to ensure it feels like a downloaded app.

---

## 3) Roadmap

### Phase A: The Foundation of Trust (Payments)
- [ ] Implement `paymentRoutes` and `paymentController`.
- [ ] Connect `Pricing.jsx` to the new backend payment flow.
- [ ] Add "Transaction History" in Settings/Profile.

### Phase B: Visual Excellence & Real-time
- [ ] Refactor `Overview.jsx` to use WebSockets for primary tickers.
- [ ] Apply "Visual Magic" overhaul to `Layout.jsx` and common UI components.
- [ ] Finalize PWA configuration.

### Phase C: Polish & Launch
- [ ] End-to-end testing of the "Upgrade" flow.
- [ ] Performance audit (Lighthouse scores > 90).

---

## 4) Aesthetics Update
- **Palette**: Deep Charcoal (#050505) -> Neon Cyan (#00FFFF).
- **Glass**: 12px blur, 1px border (rgba(255,255,255,0.08)).
- **Typography**: Inter (UI) + JetBrains Mono (Financial Data).
