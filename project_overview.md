# 📊 Обзор проекта Spectr Trading

Этот документ содержит технический анализ проекта, описание реализованных возможностей, философию бренда и визуальную идентичность.

## 🛠 Технический стек

### Frontend
- **Ядро**: [React 18](https://reactjs.org/) + [Vite 7](https://vitejs.dev/)
- **Маршрутизация**: [React Router 7](https://reactrouter.com/)
- **PWA**: `vite-plugin-pwa` (полноценное offline-first приложение)
- **Локализация**: `i18next` (поддержка EN, RU, ES, PT)

### Данные и AI
- **Blockchain**: `ethers.js` (интеграция с кошельками, смарт-контрактами)
- **AI/ML**: [TensorFlow.js](https://www.tensorflow.org/js) (локальные предсказания и анализ)
- **Графики**: `lightweight-charts` (TradingView) и `recharts`
- **Индикаторы**: `technicalindicators` (RSI, MACD, EMA и др.)
- **API**: `axios`

### Backend / Интеграция
- **Server**: Node.js + Express
- **Автоматизация**: Интеграция с `n8n` для ребалансировки и уведомлений

---

## 🚀 Реализованные возможности

1.  **AI Signals**: Система торговых сигналов на основе технического анализа с индикаторами уверенности (Confidence L/M/H).
2.  **Arbitrage Monitoring**: Сканирование межбиржевого арбитража (CEX/DEX) с учётом комиссий и задержек сетей.
3.  **News & Sentiment**: Агрегатор новостей с NLP-анализом настроений (BULLISH/BEARISH) и влиянием на рынок.
4.  **Copy Trading (Simulation)**: Система копитрейдинга в режиме "Paper Trading" для тестирования стратегий без риска.
5.  **Polymarket Agent**: Специализированный AI-агент для анализа рынков предсказаний.
6.  **Spectr Academy**: Обучающая платформа с системой достижений (badges) и игрофикацией.
7.  **AutoPilot**: Система автоматизированного управления позициями (в разработке/MVP).
8.  **PWA Experience**: Установка на рабочий стол, отсутствие браузерных элементов, нативный мобильный UX.

---

## 💎 Философия проекта

> "Apple в мире торговых приложений"

- **Mass Market Premium**: Сложные финансовые инструменты, упакованные в простой и элегантный интерфейс.
- **Living Data**: Отказ от статических данных. Цены "дышат", графики обновляются в реальном времени, интерфейс чувствуется живым.
- **Micro-interactions**: Каждый клик и переход сопровождается плавными анимациями для создания премиального ощущения.
- **Native-like**: Приложение должно ощущаться как нативное (Swift/Kotlin), работая при этом в браузере или как PWA.

---

## 🎨 Цветовая палитра

Проект использует темную тему в стиле "Glassmorphism" с яркими неоновыми акцентами.

| Элемент | Цвет | Код | Пример |
| :--- | :--- | :--- | :--- |
| **Background** | Deep Dark | `#0A0A0A` | ![#0A0A0A](https://via.placeholder.com/15/0A0A0A?text=+) |
| **Surface** | Card/Nav | `#111111` | ![#111111](https://via.placeholder.com/15/111111?text=+) |
| **Brand** | Cyan/Teal | `#00FFFF` | ![#00FFFF](https://via.placeholder.com/15/00FFFF?text=+) |
| **Text** | Pure White | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/15/FFFFFF?text=+) |
| **Muted** | Blue Gray | `#8899A6` | ![#8899A6](https://via.placeholder.com/15/8899A6?text=+) |
| **Positive** | Green | `#00E396` | ![#00E396](https://via.placeholder.com/15/00E396?text=+) |
| **Negative** | Red | `#FF4560` | ![#FF4560](https://via.placeholder.com/15/FF4560?text=+) |
| **Warning** | Amber | `#FEB019` | ![#FEB019](https://via.placeholder.com/15/FEB019?text=+) |

---
*Документ подготовлен на основе анализа PRD 3.3/3.4 и исходного кода проекта.*
