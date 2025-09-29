# PRD 3.3 — Spectr Trading
AI-Powered Copy & Arbitrage PWA for LATAM  
Версия: **3.3**  
Дата: **02 September 2025**  
Product Owner: **[ваше имя]**

---

## 0) Что нового по сравнению с 3.2 (кратко)
- Добавлен раздел **8.1 n8n Workflow Specification**: формальные триггеры, схемы payload, шаги нод, идемпотентность и ретраи, приоритет VIP, метрики и алерты.
- Уточнены API-точки интеграции оркестратора (`/integrations/n8n/rebalance`, `/integrations/n8n/gamification`, `/integrations/n8n/alert`) и связь с `/recs/strategy`, `/strategy`, `/gamification/badges`, `/billing/webhook/stripe`.
- Прояснено, что MVP включает **симуляцию копитрейдинга** (F‑04), а **on‑chain копирование** переносится в **Wave 2**.
- Чётко описаны SLO оркестрации: ≥99% успешных вебхуков, p95 latency < 1 c, p99 дедуп‑проверки < 50 мс.
- DoD дополнен проверяемыми критериями по ребалансу, геймификации, уведомлениям и биллингу.

## 1) Видение
PWA‑приложение без установки; вход через кошелёк; 4 языка; модули — AI‑сигналы, AI‑прогнозы, арбитраж, копитрейдинг (MVP: симуляция), стейкинг, авто‑стратегии, Spectr Academy. Тёмная/светлая тема, дизайн согласно мокапам.

## 2) Цели и KPI
- **6 недель (MVP):** 100 MAU LATAM; 50 платящих; Lighthouse ≥ 90; TTI < 2 c (3G).
- **6 месяцев:** 40% install‑to‑PWA; 95% uptime (SLA); публичный accuracy‑борд.
- **Ключевой KPI качества торговли:** +12 п.п. к винрейту у Pro/Premium vs Explorer на скользящем окне **100 сделок/пользователь**.
- **Воронка:** триал Trader 7 дней → конверсия ≥ 25%.

## 3) Целевая аудитория и рынки
Новички/частичные трейдеры, DeFi‑юзеры BNB; гео: Бразилия/Аргентина/Мексика; языки ES/PT/EN/RU.

## 4) Core Use‑Cases
- UC‑1: MetaMask → пресет стратегии → 50 USDT → старт ≤ 5 с.
- UC‑2: Новость HIGH BULLISH → AI‑сигнал + AI‑прогноз → **авто‑ребаланс** (через n8n).
- UC‑3: Тема/язык переключаются ≤ 200 мс (3G).
- UC‑4: Пройти «Как читать свечи» → **Apply to Chart** → интерактивный график из AI Signals.
- UC‑5: Проверить арбитраж **с учётом комиссий и задержек**; LATAM CEX/DEX.

## 5) Объём продукта (MVP Scope)
MVP включает: триал Trader, геймификацию Academy (бейджи+скидка), оркестратор n8n для ребаланса, Stripe‑webhook; копитрейдинг — в режиме симуляции.

## 6) Функциональные требования (MVP)
### F‑01. Аутентификация кошельком
Подпись кошелька → выдача JWT/сессии. Требования к UX и хранению токена.

### F‑02. AI‑сигналы (Signals)
RSI/EMA/MACD/BBands; окно обновления ≤ 30 с; confidence L/M/H.  
UI: мини‑чарт, детализация с историей и индикаторами; кнопка **“Apply to Chart”** от Academy.

### F‑03. Новости + NLP
Агрегация новостей; sentiment/impact; связь с сигналами/прогнозами. Фильтры: язык (es/pt/en/ru), impact (LOW/MED/HIGH).

### F‑04. Copy Trading v1 (симуляция)
Список верифицированных трейдеров; параметры симуляции (депозит, множитель, SL); результат: PnL%, кривая equity, список сделок.

### F‑05. Arbitrage
Биржи LATAM/глобальные; расчёт **net** с комиссионными/сетевыми задержками; фильтр `net ≥ 0.3%`; мониторинг в реальном времени.

### F‑06. Staking
Экран пулов; APR read‑only; подготовка к Stake/Unstake (демо‑контракт на тестнете).

### F‑07. Strategies + Rebalance
Пресеты (conservative/balanced/aggressive); **AI‑рекомендация** пресета; авто‑ребаланс через n8n по событиям.

### F‑08. Billing
Планы: Explorer/Trader/Pro/Premium (+ LTD). **Trader Trial 7 дней**; активация по Stripe‑webhook; идемпотентность и подпись.

### F‑09. Notifications
Web Push + Telegram; **кликабельные** уведомления с диплинками; VIP‑приоритет для Premium.

### F‑11. Spectr Academy + Badges
Курсы волны 1; **Apply to Chart**; геймификация: бейджи (напр., *Candle Master*) + **разовая скидка 5% на Trader** (1 раз/аккаунт, анти‑абьюз).

### F‑12. PWA и офлайн
Кэш критических роутов/ассетов; фоновые sync‑таски; Lighthouse ≥ 90, TTI < 2 c (3G).

### F‑13. AI‑Прогнозы
Горизонты 4h/12h/24h; вероятность и факторы; **Brier score**; accuracy‑борд; latency ≤ 60 c.

## 7) Нефункциональные требования
- Вебхуки (Stripe/n8n): **идемпотентность**, подпись, ретраи, дедупликация.
- Наблюдаемость оркестратора: трассировка шагов, алерты, дашборд SLA.
- Безопасность интеграций: верификация источника, IP‑лимиты, секреты в vault.

## 8) Информационная архитектура
Профиль пользователя включает раздел **Badges**; экраны Academy показывают прогресс и бейджи.

## 9) Данные и модели
- **Badge**: id, title, criteria, achievedAt, discountGranted?
- **StrategyRec**: riskProfile, suggestedWeights, rationale.
- **WebhookEvent**: provider, eventId, payloadHash, idempotencyKey, status.

## 10) API (высокоуровнево; детали — в OpenAPI v0.2)
Ключевые точки: `/auth/login`, `/signals`, `/predictions`, `/news`, `/arbitrage`, `/copy/simulate`, `/traders`, `/staking/pools`, `/strategy`, `/recs/strategy`, `/billing/webhook/stripe`, `/gamification/badges`, (Wave 2) `/copy/execute`.

## 11) Монетизация и границы планов
Trader Trial 7 дней; разовая скидка 5% за бейдж *Candle Master* (1 раз/аккаунт).

## 12) Аналитика и телеметрия
События: `trialStart`, `trialExpire`, `trialConvert`; `badgeEarned`, `discountApplied`; `rebalanceTriggered` (source: news/signal/prediction), `rebalanceApplied|Failed`; клики по диплинкам уведомлений; точность прогнозов (Brier/accuracy‑борд).

## 13) Безопасность и комплаенс
Подпись и валидация вебхуков; KYC обязателен для авто‑исполнения; лог действий; circuit‑breaker на ребаланс; анти‑фрод для триала/скидок.

## 14) Роадмап
**MVP (6 недель):** триал, n8n‑ребаланс, Stripe‑webhook, бейджи/скидка, AI‑прогнозы, арбитраж, симуляция копитрейдинга, PWA/офлайн.  
**Wave 2 (6–10 неделя):** on‑chain копитрейдинг (ограниченный пул бирж/DEX, KYC), доп. источники арбитража, налоговые отчёты, AI‑модель v2.

## 15) DoD (Definition of Done)
- Trader Trial активируется/конвертится; Stripe‑webhook идемпотентен.
- Apply‑to‑Chart работает из Academy → Signals; события фиксируются в аналитике.
- n8n‑ребаланс: трассировка, алерты; rate‑limit 1 раз/15 мин; аудит старых/новых весов.
- Бейджи выдаются по критериям; **скидка 5%** применяется один раз/аккаунт; анти‑абьюз включён.
- PWA: Lighthouse ≥ 90; TTI < 2 c (3G).
- AI‑прогнозы: горизонты 4/12/24h; Brier score; обновление метрик.

---

## 8.1) n8n Workflow Specification

### Общие положения
- Все входящие запросы подписаны (HMAC‑SHA256), имеют `traceId`, `idempotencyKey`, `schemaVersion: 'v1'`.
- Первая нода каждого процесса — `dedupe` с записью `WebhookEvent` и статусов `processed|replayed|failed`.
- Ретраи: до 3 попыток (экспонента 5‑15‑60 c). По исчерпании — алерт и запись в DLQ.
- Трассировка: на каждом шаге пишется `traceId`, результаты и длительность; метрики доступны в дашборде.

### WF‑1 Авто‑ребаланс стратегий (F‑07)
**Триггер**: `POST /integrations/n8n/rebalance` (сервер → n8n) по событию из новостей/сигналов/AI‑прогнозов.  
**Payload (пример)**:
```json
{ "traceId":"trc_9h2k","idempotencyKey":"evt_2025-08-24T10:01:12Z_BTC_news",
  "event":"news.bullish","symbol":"BTCUSDT","confidence":0.85,
  "source":"coindesk","schemaVersion":"v1","userId":"usr_123" }
```
**Шаги**: подпись/allowlist → dedupe → `GET /recs/strategy` → `GET /strategy` →
условие дельты > 5 п.п. и rate‑limit 15 мин → `POST /strategy` (применить) →
уведомление (Web Push/TG) с диплинком → метрики `rebalanceTriggered|Applied|Failed`.
**Ограничения**: лимиты риска и частоты, аудит старых/новых весов.

### WF‑2 Геймификация: бейдж + скидка 5% (F‑11)
**Триггер**: `POST /integrations/n8n/gamification` при завершении урока в Academy.  
**Payload (пример)**:
```json
{ "traceId":"trc_a1b2","idempotencyKey":"usr_123_candlesticks_101",
  "event":"course.completed","userId":"usr_123",
  "courseId":"candlesticks_101","badge":"Candle Master","schemaVersion":"v1" }
```
**Шаги**: подпись/allowlist → dedupe → `GET /gamification/badges` →
выдать бейдж (если не выдан) → применить **разовую скидку 5%** к плану Trader →
отправить TG/Web Push/Email с диплинком → метрики `badgeEarned`,`discountApplied`.
**Анти‑абьюз**: бейдж и скидка выдаются 1 раз; проверка длительности урока (>3 мин), device‑fingerprint.

### WF‑3 Клиентское уведомление с диплинком (F‑09)
**Триггер**: `POST /integrations/n8n/alert` (внутренние события возможностей).  
**Payload (пример)**:
```json
{ "traceId":"trc_7788","idempotencyKey":"staking-op-okx-usdt-30d",
  "event":"staking.opportunity","asset":"USDT","apy":8.5,"platform":"OKX",
  "deeplink":"https://spectr.app/staking?opportunity=okx-usdt-30d","tier":"premium" }
```
**Шаги**: подпись/дедуп → роутинг по приоритету (Premium — сразу, Explorer — с задержкой) →
отправка Push/TG/Email с диплинком → лог delivered/clicked.

### WF‑4 Подписка: активация по Stripe‑webhook (F‑08)
**Триггер**: серверный `POST /billing/webhook/stripe` (идемпотент). n8n подписан на внутреннее событие «Subscription Activated» для коммуникаций.  
**Шаги**: сервер валидирует подпись/`event.id`, пишет `WebhookEvent` и обновляет `Subscription` → роль/флаги; n8n отправляет приветствие и чек‑лист возможностей плана.

### WF‑5 On‑chain Copy Execution (Wave 2)
**Триггер**: `POST /copy/execute` после прохождения KYC и в рамках лимитов риска.  
**Шаги**: проверка KYC/лимитов → вызов CEX/DEX‑коннектора → запись `copyExecutionId`, fee, `txHash` → уведомление пользователю → метрики исполнения.

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

## 16) Риски
Абьюз триала/скидок → лимиты, device‑fingerprint, анти‑фрод. Сбой оркестрации → ретраи, circuit‑breaker, алерты. Юридика on‑chain копирования → включение в Wave 2. Нагрузки NLP/LLM → кэш/батчинг, лимиты.
