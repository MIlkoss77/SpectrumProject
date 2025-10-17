const SIGNAL_TEMPLATES = [
  {
    id: "BTCUSDT-15m",
    symbol: "BTCUSDT",
    timeframe: "15m",
    price: 64520,
    change24h: 1.8,
    rsi: 62.1,
    emaFast: 64280,
    emaSlow: 63740,
    macd: 0.58,
    macdSignal: 0.42,
    macdHist: 0.16,
    bbUpper: 65120,
    bbLower: 63310,
    volume: 42853,
    signal: "BUY",
    confidence: 0.78,
    score: 3,
    factors: ["EMA fast>slow", "RSI>60", "MACD hist > 0"],
    sparkline: [63200, 63420, 63610, 63780, 63940, 64120, 64050, 64210, 64380, 64520]
  },
  {
    id: "BTCUSDT-1h",
    symbol: "BTCUSDT",
    timeframe: "1h",
    price: 64520,
    change24h: 1.8,
    rsi: 58.4,
    emaFast: 64010,
    emaSlow: 63320,
    macd: 0.42,
    macdSignal: 0.31,
    macdHist: 0.11,
    bbUpper: 65340,
    bbLower: 62870,
    volume: 189412,
    signal: "BULLISH",
    confidence: 0.72,
    score: 2,
    factors: ["EMA fast>slow", "MACD hist > 0"],
    sparkline: [62400, 62820, 63110, 63440, 63790, 63910, 64130, 64270, 64480, 64520]
  },
  {
    id: "ETHUSDT-1h",
    symbol: "ETHUSDT",
    timeframe: "1h",
    price: 3215,
    change24h: 2.3,
    rsi: 64.8,
    emaFast: 3182,
    emaSlow: 3098,
    macd: 0.36,
    macdSignal: 0.22,
    macdHist: 0.14,
    bbUpper: 3255,
    bbLower: 2980,
    volume: 98612,
    signal: "BUY",
    confidence: 0.81,
    score: 3,
    factors: ["EMA fast>slow", "RSI>60", "MACD hist > 0"],
    sparkline: [2975, 3010, 3055, 3080, 3105, 3140, 3165, 3188, 3202, 3215]
  },
  {
    id: "SOLUSDT-4h",
    symbol: "SOLUSDT",
    timeframe: "4h",
    price: 178.5,
    change24h: 1.1,
    rsi: 54.6,
    emaFast: 176.2,
    emaSlow: 170.4,
    macd: 0.95,
    macdSignal: 0.81,
    macdHist: 0.14,
    bbUpper: 185.7,
    bbLower: 164.1,
    volume: 1812390,
    signal: "BULLISH",
    confidence: 0.66,
    score: 2,
    factors: ["EMA fast>slow", "MACD hist > 0"],
    sparkline: [162.4, 166.8, 169.1, 171.3, 173.9, 175.4, 176.8, 177.6, 178.2, 178.5]
  },
  {
    id: "TONUSDT-1h",
    symbol: "TONUSDT",
    timeframe: "1h",
    price: 5.42,
    change24h: -0.8,
    rsi: 44.3,
    emaFast: 5.46,
    emaSlow: 5.51,
    macd: -0.012,
    macdSignal: -0.006,
    macdHist: -0.006,
    bbUpper: 5.62,
    bbLower: 5.28,
    volume: 412987,
    signal: "BEARISH",
    confidence: 0.55,
    score: -1,
    factors: ["EMA fast<slow"],
    sparkline: [5.61, 5.58, 5.54, 5.51, 5.49, 5.46, 5.44, 5.43, 5.42, 5.41]
  },
  {
    id: "BNBUSDT-1h",
    symbol: "BNBUSDT",
    timeframe: "1h",
    price: 612.4,
    change24h: 0.9,
    rsi: 57.2,
    emaFast: 609.1,
    emaSlow: 598.3,
    macd: 0.28,
    macdSignal: 0.19,
    macdHist: 0.09,
    bbUpper: 618.6,
    bbLower: 587.5,
    volume: 74312,
    signal: "BULLISH",
    confidence: 0.63,
    score: 2,
    factors: ["EMA fast>slow", "MACD hist > 0"],
    sparkline: [586.4, 590.8, 596.2, 599.4, 602.1, 605.8, 608.2, 609.9, 611.5, 612.4]
  }
];

const PREDICTION_TEMPLATES = [
  {
    id: "BTCUSDT-4h",
    symbol: "BTCUSDT",
    horizon: "4h",
    probUp: 0.64,
    brier: 0.188,
    score: 2,
    rationale: ["Momentum bullish vs EMA", "MACD hist positive"],
  },
  {
    id: "BTCUSDT-24h",
    symbol: "BTCUSDT",
    horizon: "24h",
    probUp: 0.58,
    brier: 0.213,
    score: 1,
    rationale: ["RSI in constructive zone"],
  },
  {
    id: "ETHUSDT-12h",
    symbol: "ETHUSDT",
    horizon: "12h",
    probUp: 0.66,
    brier: 0.179,
    score: 3,
    rationale: ["Momentum bullish vs EMA", "RSI oversold bounce"],
  },
  {
    id: "SOLUSDT-12h",
    symbol: "SOLUSDT",
    horizon: "12h",
    probUp: 0.57,
    brier: 0.221,
    score: 1,
    rationale: ["MACD hist positive"],
  },
  {
    id: "TONUSDT-4h",
    symbol: "TONUSDT",
    horizon: "4h",
    probUp: 0.44,
    brier: 0.239,
    score: -1,
    rationale: ["EMA fast<slow"],
  }
];

const ARBITRAGE_TEMPLATES = [
  {
    id: "BTCUSDT-binance-okx",
    symbol: "BTCUSDT",
    buy: { exchange: "Binance", ask: 64320, bid: 64290 },
    sell: { exchange: "OKX", bid: 64640, ask: 64670 },
    gross: 0.59,
    fees: 0.18,
    latency: 0.05,
    net: 0.36,
  },
  {
    id: "ETHUSDT-kraken-binance",
    symbol: "ETHUSDT",
    buy: { exchange: "Kraken", ask: 3198, bid: 3194 },
    sell: { exchange: "Binance", bid: 3221, ask: 3223 },
    gross: 0.8,
    fees: 0.26,
    latency: 0.20,
    net: 0.34,
  },
  {
    id: "SOLUSDT-coinbase-bybit",
    symbol: "SOLUSDT",
    buy: { exchange: "Coinbase", ask: 176.8, bid: 176.3 },
    sell: { exchange: "Bybit", bid: 179.1, ask: 179.4 },
    gross: 1.303,
    fees: 0.575,
    latency: 0.08,
    net: 0.648,
  }
];

const NEWS_TEMPLATES = [
  {
    id: "spectr-desk-latam-onboarding",
    source: "Spectr Desk",
    url: "https://spectr.app/news/latam-onboarding",
    impact: "high",
    sentiment: "bullish",
    confidence: 0.78,
    related: ["LATAM", "Onboarding"],
    translations: {
      en: {
        title: "LATAM traders get instant PIX on-ramp inside Spectr",
        summary: "Spectr now routes Brazilian PIX deposits directly into Binance and OKX sub-accounts, cutting onboarding time below 2 minutes.",
      },
      es: {
        title: "Traders LATAM reciben rampa PIX instantánea en Spectr",
        summary: "Spectr integra depósitos PIX brasileños directo a subcuentas de Binance y OKX, reduciendo el alta a menos de 2 minutos.",
      },
      pt: {
        title: "Traders LATAM ganham entrada PIX instantânea no Spectr",
        summary: "Spectr envia depósitos PIX do Brasil direto para subcontas Binance e OKX, reduzindo onboarding para menos de 2 minutos.",
      },
      ru: {
        title: "LATAM-трейдеры получают мгновенный онбординг через PIX в Spectr",
        summary: "Spectr направляет бразильские депозиты PIX прямо на субаккаунты Binance и OKX, сокращая онбординг до 2 минут.",
      }
    },
    publishedAgoMs: 45 * 60 * 1000,
  },
  {
    id: "ai-signal-cluster",
    source: "Spectr AI Lab",
    url: "https://spectr.app/news/ai-signal-cluster",
    impact: "med",
    sentiment: "slightly_bullish",
    confidence: 0.64,
    related: ["AI", "Signals"],
    translations: {
      en: {
        title: "AI signal cluster flags bullish momentum on SOL/TON",
        summary: "Latest reinforcement run lifts SOL and TON buy confidence above 60% after funding resets across Bybit and OKX.",
      },
      es: {
        title: "Cluster de señales AI detecta impulso alcista en SOL/TON",
        summary: "La última iteración eleva la confianza de compra de SOL y TON por encima del 60% tras el reset de funding en Bybit y OKX.",
      },
      pt: {
        title: "Cluster de sinais IA indica momentum positivo em SOL/TON",
        summary: "A rodada recente aumenta a confiança de compra de SOL e TON acima de 60% após o reset de funding na Bybit e OKX.",
      },
      ru: {
        title: "AI-кластер сигналов фиксирует бычий импульс по SOL/TON",
        summary: "Свежая итерация увеличила уверенность покупок SOL и TON выше 60% после сброса funding на Bybit и OKX.",
      }
    },
    publishedAgoMs: 2 * 60 * 60 * 1000,
  },
  {
    id: "arb-monitor-latam",
    source: "Spectr Arbitrage",
    url: "https://spectr.app/news/arb-monitor",
    impact: "high",
    sentiment: "neutral",
    confidence: 0.59,
    related: ["Arbitrage", "Latency"],
    translations: {
      en: {
        title: "Latency hedging unlocks 0.6% net on SOL/USDT",
        summary: "Spectr arb bots net 0.64% after routing Coinbase → Bybit with smart fee offsets during Mexico evening session.",
      },
      es: {
        title: "Cobertura de latencia libera 0,6% neto en SOL/USDT",
        summary: "Bots de arbitraje de Spectr capturan 0,64% neto al rutear Coinbase → Bybit con offsets de comisiones en la sesión nocturna mexicana.",
      },
      pt: {
        title: "Hedge de latência garante 0,6% líquido em SOL/USDT",
        summary: "Bots de arbitragem Spectr capturam 0,64% líquido ao rotear Coinbase → Bybit com offsets de taxas na sessão noturna do México.",
      },
      ru: {
        title: "Хедж по задержке приносит 0,6% чистыми на SOL/USDT",
        summary: "Арбитражные боты Spectr зафиксировали 0,64% чистыми, направляя Coinbase → Bybit с учётом комиссий в вечерней сессии Мексики.",
      }
    },
    publishedAgoMs: 4 * 60 * 60 * 1000,
  }
];

const MARKET_TEMPLATES = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 64520,
    change24h: 1.8,
    marketCap: 1.268e12,
    volume: 24.6e9,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3215,
    change24h: 2.3,
    marketCap: 3.86e11,
    volume: 12.1e9,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 178.5,
    change24h: 1.1,
    marketCap: 8.2e10,
    volume: 2.84e9,
    image: "https://assets.coingecko.com/coins/images/4128/large/solana.png"
  },
  {
    id: "toncoin",
    symbol: "TON",
    name: "Toncoin",
    price: 5.42,
    change24h: -0.8,
    marketCap: 1.9e10,
    volume: 6.1e8,
    image: "https://assets.coingecko.com/coins/images/17980/large/ton_symbol.png"
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    price: 612.4,
    change24h: 0.9,
    marketCap: 9.4e10,
    volume: 1.65e9,
    image: "https://assets.coingecko.com/coins/images/825/large/binance-coin-logo.png"
  }
];

function cloneWithTimestamp(list, extra = {}) {
  const ts = Date.now();
  return list.map(item => ({ ...item, ...extra, ts }));
}

export function getFallbackSignals({ symbols, timeframes } = {}) {
  const allowedSymbols = symbols ? new Set(symbols) : null;
  const allowedTf = timeframes ? new Set(timeframes) : null;
  return cloneWithTimestamp(
    SIGNAL_TEMPLATES.filter(item => (!allowedSymbols || allowedSymbols.has(item.symbol)) && (!allowedTf || allowedTf.has(item.timeframe)))
      .map(item => ({ ...item, sparkline: [...item.sparkline] }))
  );
}

export function getFallbackPredictions({ symbols } = {}) {
  const allowed = symbols ? new Set(symbols) : null;
  return cloneWithTimestamp(
    PREDICTION_TEMPLATES.filter(item => (!allowed || allowed.has(item.symbol)))
      .map(item => ({ ...item, rationale: [...item.rationale] }))
  );
}

export function getFallbackArbitrage({ symbols } = {}) {
  const allowed = symbols ? new Set(symbols) : null;
  const ts = Date.now();
  return ARBITRAGE_TEMPLATES
    .filter(item => (!allowed || allowed.has(item.symbol)))
    .map(item => ({
      ...item,
      buy: { ...item.buy },
      sell: { ...item.sell },
      ts,
    }));
}

export function getFallbackNews({ lang = "en", limit = 30 } = {}) {
  const upper = (lang || "en").toLowerCase();
  const ts = Date.now();
  return NEWS_TEMPLATES.slice(0, limit).map(item => {
    const translation = item.translations[upper] || item.translations.en;
    return {
      id: item.id,
      url: item.url,
      source: item.source,
      lang: upper,
      impact: item.impact,
      sentiment: item.sentiment,
      confidence: item.confidence,
      title: translation.title,
      summary: translation.summary,
      related: [...item.related],
      publishedAt: ts - item.publishedAgoMs,
    };
  });
}

export function getFallbackMarkets({ ids } = {}) {
  const allowed = ids ? new Set(ids) : null;
  return MARKET_TEMPLATES
    .filter(item => (!allowed || allowed.has(item.id)))
    .map(item => ({ ...item }));
}