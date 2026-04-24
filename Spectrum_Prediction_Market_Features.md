# 🔮 Spectr Predictions: Core Functionality & Interface Spec

**Vision**: Создание премиального интерфейса для рынков предсказаний (Prediction Markets) в стиле Polymarket, интегрированного в экосистему Spectr. Сочетание институциональной эстетики "Glassmorphism 2.0" с мощными инструментами для ставок и AI-аналитикой.

---

## 1. Интерфейс и Discovery (Обзор рынков)

### 1.1. Главный Дашборд (The Prediction Hub)
*   **Категории**: Crypto, Politics, Sports, Pop Culture, Economics, Spectr Alpha.
*   **Trending Markets**: Горизонтальный скролл с наиболее активными рынками (High Volume / Rapid Price Change).
*   **Smart Search**: Мгновенный поиск по рынкам с автодополнением и фильтрацией по объему/времени закрытия.
*   **Market Cards**: Компактные карточки с "живой" вероятностью (например, "Yes 64%"), мини-графиком и объемом торгов.

### 1.2. Страница Рынка (Market Detail)
*   **Interactive Probability Chart**: График изменения вероятности исхода во времени (TradingView style).
*   **Order Book (Glass UI)**: Стакан заявок (Buy/Sell) с эффектом размытия и индикацией глубины рынка.
*   **Resolution Rules**: Четко прописанные условия закрытия рынка и источники истины (Oracles).
*   **Market Sentiment**: Шкала настроений на основе AI-анализа комментариев и новостей.

---

## 2. Механика Ставок и Торговли

### 2.1. Покупка и Продажа Акций (Outcome Shares)
*   **Binary Outcomes**: Покупка акций "Yes" или "No" (цена от $0.01 до $0.99).
*   **Order Types**:
    *   *Market Order*: Мгновенное исполнение по лучшей цене.
    *   *Limit Order*: Установка своей цены (например, "Купить Yes, если вероятность упадет до 40%").
*   **Slip-free Execution**: Интеграция с AMM (Automated Market Makers) или CLOB (Central Limit Order Book) для обеспечения ликвидности.

### 2.2. Управление Портфелем (Portfolio Management)
*   **Unrealized PnL**: Отображение текущей прибыли/убытка по открытым позициям в реальном времени.
*   **Position Management**: Возможность "закрыть" ставку до наступления события, продав акции в стакан.
*   **History**: Полная история ставок, выигрышей и комиссий.

---

## 3. Интеграция AI и Экосистемы Spectr

### 3.1. Spectr AI Agent for Predictions
*   **Alpha Insights**: AI анализирует новости и соцсети, выдавая "Confidence Score" для каждого исхода.
*   **Auto-Betting (Optional)**: Настройка стратегий для автоматических ставок при достижении определенных условий (Alpha Signals).
*   **Risk Management**: Предупреждение пользователя о слишком высокой волатильности или манипуляциях на рынке.

### 3.2. Wallet & Payments
*   **Unified Balance**: Общий баланс с основным торговым терминалом Spectr.
*   **Instant Deposit/Withdraw**: Пополнение через USDT/SOL/ETH (интеграция с NOWPayments).
*   **Pro Benefits**: Сниженные комиссии для пользователей с подпиской Pro/Premium.

---

## 4. Геймификация и Социальный слой

### 4.1. Сообщество и Обсуждение
*   **Market Comments**: Живой чат под каждым рынком с рейтингом пользователей.
*   **Copy-Betting**: Возможность следовать за успешными "предикторами" (аналог Copy Trading).

### 4.2. Leaderboards & Badges
*   **Predictor Rank**: Глобальный рейтинг по точности прогнозов и ROI.
*   **Exclusive Badges**:
    *   *Oracle Eye*: За 10 верных прогнозов подряд.
    *   *Whale Hunter*: За крупную выигрышную ставку на маловероятный исход.
    *   *Sentiment Master*: За активность в обсуждениях, совпадающую с итогом.

---

## 5. Техническая реализация (Stack)

*   **Frontend**: React + Framer Motion (для анимации изменения цен).
*   **Real-time Updates**: WebSockets для мгновенного обновления вероятностей и стакана.
*   **Smart Contracts/Backend**: Логика расчета долей, хранения пулов ликвидности и безопасных выплат.
*   **Oracles**: Интеграция с Chainlink или собственными проверяемыми источниками данных (Scrapers).

---

## 💎 Эстетика (Visual Identity)
*   **Background**: Deep Charcoal (#050505).
*   **Primary Action**: Neon Cyan (#00FFFF) — для кнопок "Buy/Yes".
*   **Secondary Action**: Hot Pink/Orange — для кнопок "Sell/No".
*   **Animations**: "Living Numbers" (пульсация при изменении цены акций).
