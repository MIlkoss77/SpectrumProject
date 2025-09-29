# PRD 3.3 — Spectr Trading (FINAL, MVP-Focused)
AI-Powered Copy & Arbitrage PWA for LATAM
Версия: **3.3 (FINAL)**
Дата: **03 September 2025**
Product Owner: **[ваше имя]**

---

## 0) Что нового по сравнению с 3.2 (кратко)
- Интегрирован раздел **8.1 n8n Workflow Specification** с формальными триггерами, payload, шагами нод, идемпотентностью/ретраями, VIP-приоритетом и метриками/алертами.
- **Hedge-Fund Mode / Institutional Alpha** и on-chain исполнение перенесены в **Главу 2 (Phase 2)**. MVP сфокусирован на research-коллах и симуляции.
- Раздел **14) Роадмап** разделён на Phase 1 (MVP) и Phase 2 (Hedge-Fund Mode). В 8.1 WF‑5 промаркирован как Phase 2.
- Добавлены чёткие **Non‑Goals** и DoD‑критерии для MVP.

## 1) Видение
PWA‑приложение без установки; вход через кошелёк; 4 языка; модули — AI‑сигналы, AI‑прогнозы, арбитраж, копитрейдинг (симуляция в MVP), стейкинг, авто‑стратегии, Spectr Academy. Тёмная/светлая тема, дизайн по мокапам.

## 2) Цели и KPI
- **6 недель (MVP):** 100 MAU LATAM; 50 платящих; Lighthouse ≥ 90; TTI < 2 c (3G).
- **6 месяцев:** 40% install‑to‑PWA; 95% uptime (SLA); публичный accuracy‑борд.
- **Торговый KPI:** +12 п.п. к винрейту у Pro/Premium vs Explorer на окне **100 сделок/пользователь**.
- **Воронка:** триал Trader 7 дней → конверсия ≥ 25%.

## 3) Аудитория и рынки
Новички/частичные трейдеры, DeFi‑юзеры BNB; гео: Бразилия/Аргентина/Мексика; языки ES/PT/EN/RU.

## 4) Core Use‑Cases
- UC‑1: MetaMask → пресет стратегии → 50 USDT → старт ≤ 5 с.
- UC‑2: Новость HIGH BULLISH → AI‑сигнал + AI‑прогноз → **авто‑ребаланс** пресета (через n8n).
- UC‑3: Тема/язык переключаются ≤ 200 мс (3G).
- UC‑4: Пройти «Как читать свечи» → **Apply to Chart** → интерактивный график Signals.
- UC‑5: Проверить арбитраж **с учётом комиссий и задержек**; LATAM CEX/DEX (мониторинг).

## 5) Объём продукта (MVP Scope)
MVP включает: триал Trader, Academy бейджи + скидка, n8n‑ребаланс (control‑plane), Stripe‑webhook, AI‑прогнозы, арбитраж мониторинг и симуляция копитрейдинга.
**Нет реального авто‑исполнения сделок** в MVP.

## 6) Функциональные требования (MVP)
### F‑01. Аутентификация кошельком
Подпись кошелька → JWT/сессия. UX хранения токена.
### F‑02. AI‑сигналы (Signals)
RSI/EMA/MACD/BBands; обновление ≤ 30 c; confidence L/M/H; mini‑chart; деталка; **Apply to Chart**.
### F‑03. Новости + NLP
Агрегация, sentiment/impact, связь с сигналами/прогнозами; фильтры (es/pt/en/ru; LOW/MED/HIGH).
### F‑04. Copy Trading v1 (симуляция)
Список трейдеров; параметры (депозит/множитель/SL); отчёт PnL% и кривая equity (paper-trading).
### F‑05. Arbitrage (мониторинг)
Биржи LATAM/глобальные; расчёт **net** (комиссии/сети/задержки); фильтр `net ≥ 0.3%`; авто‑обновление.
### F‑06. Staking
Экран пулов; APR read‑only; подготовленные кнопки Stake/Unstake (тестнет).
### F‑07. Strategies + Rebalance
Пресеты; **AI‑рекомендация**; авто‑ребаланс через n8n (секунды‑минуты).
### F‑08. Billing
Планы Explorer/Trader/Pro/Premium (+ LTD). **Trader Trial 7 дней**. Stripe‑webhook: подпись/идемпотентность/ретраи.
### F‑09. Notifications
Web Push + Telegram; **кликабельные** диплинки; VIP приоритет Premium (мгновенно), Explorer (отложено).
### F‑11. Spectr Academy + Badges
Курсы волны 1; **Apply to Chart**; бейджи (напр. *Candle Master*) + **разовая скидка 5%** на Trader (1 раз/аккаунт, анти‑абьюз).
### F‑12. PWA и офлайн
Кэш критических роутов/ассетов; фоновые sync‑таски; Lighthouse ≥ 90, TTI < 2 c (3G).
### F‑13. AI‑Прогнозы
Горизонты 4h/12h/24h; вероятность и факторы; **Brier score**; accuracy‑борд; latency ≤ 60 c.

## 7) Нефункциональные требования
Вебхуки (Stripe/n8n): **идемпотентность**, подпись, ретраи, дедуп. Наблюдаемость: трассировка/алерты/SLA‑дашборд. Безопасность: верификация источника, IP‑лимиты, секреты в vault.

## 8) Информационная архитектура
Профиль пользователя включает **Badges**; Academy — прогресс/бейджи; раздел **Hedge‑Fund Mode — Join the Waitlist** (без выполнения сделок).

## 9) Данные и модели
- **Badge**: id, title, criteria, achievedAt, discountGranted?
- **StrategyRec**: riskProfile, suggestedWeights, rationale.
- **WebhookEvent**: provider, eventId, payloadHash, idempotencyKey, status.

## 10) API (высокоуровнево; детали — в OpenAPI v0.2)
`/auth/login`, `/signals`, `/predictions`, `/news`, `/arbitrage`, `/copy/simulate`, `/traders`, `/staking/pools`, `/strategy`, `/recs/strategy`, `/billing/webhook/stripe`, `/gamification/badges`.  
**Phase 2:** `/copy/execute` (on‑chain/real execution).

## 11) Монетизация
MVP: *Premium* = research‑calls, приоритетные уведомления, дашборд метрик.  
**Phase 2:** апселл **Hedge‑Fund Mode** (инвайт, возможен рев‑шер).

## 12) Аналитика и телеметрия
События: `trialStart/Expire/Convert`, `badgeEarned/discountApplied`, `rebalanceTriggered/Applied/Failed`, клики диплинков, Brier/accuracy‑борд. Dashboards для n8n‑воркфлоу.

## 13) Безопасность и комплаенс
Подпись/валидация вебхуков; KYC обязателен для реального авто‑исполнения (Phase 2); лог действий; circuit‑breaker; анти‑фрод триала/скидок.

## 14) Роадмап
**Phase 1 — MVP (6 недель):** F‑01…F‑13 (как выше), раздел 8.1 WF‑1/2/3/4.  
**Phase 2 — Глава 2 (6–10 неделя):** **Hedge‑Fund Mode / Institutional Alpha** (execution‑plane), n8n **WF‑5**, KYC‑гейтинг, префандинг, приватные DEX‑реле, отчётность.

## 15) DoD (Definition of Done, MVP Gate)
- Trader Trial активируется/конвертится; Stripe‑webhook идемпотентен и подписан.
- Apply‑to‑Chart (Academy→Signals); события в аналитике.
- n8n‑ребаланс: трассировка, алерты; rate‑limit 1×/15 мин; аудит старых/новых весов.
- Бейджи/скидка: 1 раз/аккаунт; анти‑абьюз включён.
- PWA: Lighthouse ≥ 90; TTI < 2 c (3G).
- AI‑прогнозы: горизонты 4/12/24h; Brier score; обновление метрик.
- **Нет реального авто‑исполнения** в Phase 1.

---

## 8.1) n8n Workflow Specification (интегрировано)

### Общие положения
- Входящие запросы подписаны (HMAC‑SHA256), содержат `traceId`, `idempotencyKey`, `schemaVersion:'v1'`.
- Первая нода — `dedupe` с записью `WebhookEvent` (`processed|replayed|failed`).
- Ретраи: до 3 попыток (экспонента 5‑15‑60 c). По исчерпании — алерт и DLQ.
- Трассировка: на каждом шаге логируется `traceId`, результаты и длительность; метрики доступны в дашборде.

### WF‑1 Авто‑ребаланс стратегий (F‑07)
**Trigger:** `POST /integrations/n8n/rebalance` (сервер → n8n) по событию новостей/сигналов/AI.  
**Payload (пример):**
```json
{"traceId":"trc_9h2k","idempotencyKey":"evt_2025-08-24T10:01:12Z_BTC_news",
 "event":"news.bullish","symbol":"BTCUSDT","confidence":0.85,
 "source":"coindesk","schemaVersion":"v1","userId":"usr_123"}
```
**Шаги:** подпись/allowlist → dedupe → `GET /recs/strategy` → `GET /strategy` →
дельта > 5 п.п. и rate‑limit 15 мин → `POST /strategy` (применить) →
уведомление (Web Push/TG) с диплинком → метрики `rebalanceTriggered|Applied|Failed`.

### WF‑2 Геймификация: бейдж + скидка 5% (F‑11)
**Trigger:** `POST /integrations/n8n/gamification` при завершении урока.  
**Payload:**
```json
{"traceId":"trc_a1b2","idempotencyKey":"usr_123_candlesticks_101",
 "event":"course.completed","userId":"usr_123",
 "courseId":"candlesticks_101","badge":"Candle Master","schemaVersion":"v1"}
```
**Шаги:** подпись/allowlist → dedupe → `GET /gamification/badges` →
выдать бейдж (если не выдан) → применить **разовую скидку 5%** Trader →
отправить TG/Web Push/Email с диплинком → метрики `badgeEarned`,`discountApplied`.

### WF‑3 Клиентское уведомление с диплинком (F‑09)
**Trigger:** `POST /integrations/n8n/alert` (внутренние события возможностей).  
**Payload:**
```json
{"traceId":"trc_7788","idempotencyKey":"staking-op-okx-usdt-30d",
 "event":"staking.opportunity","asset":"USDT","apy":8.5,"platform":"OKX",
 "deeplink":"https://spectr.app/staking?opportunity=okx-usdt-30d","tier":"premium"}
```
**Шаги:** подпись/дедуп → роутинг по приоритету (Premium — сразу, Explorer — с задержкой) →
Push/TG/Email с диплинком → лог delivered/clicked.

### WF‑4 Подписка: активация по Stripe‑webhook (F‑08)
**Trigger:** серверный `POST /billing/webhook/stripe` (идемпотент). n8n подписан на внутреннее «Subscription Activated» для коммуникаций.  
**Шаги:** сервер валидирует подпись/`event.id`, пишет `WebhookEvent` и обновляет `Subscription`; n8n отправляет приветствие и чек‑лист возможностей плана.

### WF‑5 On‑chain Copy Execution (**Phase 2 / Глава 2**)
**Trigger:** `POST /copy/execute` после KYC и в рамках лимитов риска (не входит в MVP).  
**Шаги:** проверка KYC/лимитов → вызов CEX/DEX‑коннектора → запись `copyExecutionId`, fee, `txHash` → уведомление → метрики исполнения.

### Переменные окружения n8n
```
N8N_WEBHOOK_URL=https://n8n.spectr.app/webhook
N8N_WEBHOOK_SECRET=...
N8N_IP_ALLOWLIST=Stripe_IPs,API_Egress_IPs
SPECTR_API_BASE=https://api.spectr.app
SPECTR_API_TOKEN=<service-account JWT>
PUSH_PROVIDER=firebase
TG_BOT_TOKEN=...
```

### SLO/Алерты
- ≥99% успешных обработок, p95 < 1 c; 3 подряд фейла — инцидент, алерт в TG/Slack, запись в DLQ.
- Дашборд: `rebalance_count`, `success_rate`, `avg_latency_ms`, `webhook_retries`, `badge_earned`, `discount_applied`.

---

## 16) Non‑Goals (MVP)
- Нет HFT/низколатентного арбитража (sub‑300 ms); нет реального auto‑execution.
- Нет доступа к закрытым мепулам CEX (по определению).
- Нет кросс‑CEX атомарного исполнения без префандинга.

## 17) Риски
Абьюз триала/скидок → лимиты, device‑fingerprint, анти‑фрод. Сбой оркестрации → ретраи, circuit‑breaker, алерты. Юридика on‑chain копирования → Phase 2. Нагрузки NLP/LLM → кэш/батчинг, лимиты.
