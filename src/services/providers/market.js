import { getFallbackMarkets } from "./fallbacks";

const BINANCE_BASE = "https://api.binance.com";
const OKX_BASE = "https://www.okx.com";
const BYBIT_BASE = "https://api.bybit.com";
const KRAKEN_BASE = "https://api.kraken.com";
const COINBASE_BASE = "https://api.exchange.coinbase.com";

async function fetchJSON(url, options) {
  const res = await fetch(url, { headers: { "Accept": "application/json" }, ...options });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Request failed ${res.status}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

export async function fetchBinanceKlines(symbol, interval = "1h", limit = 200) {
  const url = `${BINANCE_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const data = await fetchJSON(url);
  return data.map(k => ({
    openTime: k[0],
    o: Number(k[1]),
    h: Number(k[2]),
    l: Number(k[3]),
    c: Number(k[4]),
    volume: Number(k[5]),
    closeTime: k[6],
  }));
}

export async function fetchBinanceTicker(symbol) {
  const url = `${BINANCE_BASE}/api/v3/ticker/24hr?symbol=${symbol}`;
  const data = await fetchJSON(url);
  return {
    exchange: "Binance",
    symbol,
    bid: Number(data.bidPrice),
    ask: Number(data.askPrice),
    last: Number(data.lastPrice),
    volume: Number(data.volume),
    changePct: Number(data.priceChangePercent),
  };
}

export async function fetchOKXTicker(instId) {
  const url = `${OKX_BASE}/api/v5/market/ticker?instId=${instId}`;
  const json = await fetchJSON(url);
  const d = json.data?.[0];
  const last = Number(d?.last);
  const open = Number(d?.sodUtc0 || d?.sodUtc8 || last);
  return {
    exchange: "OKX",
    symbol: instId.replace("-", ""),
    bid: Number(d?.bidPx),
    ask: Number(d?.askPx),
    last,
    volume: Number(d?.vol24h || 0),
    changePct: open ? ((last - open) / open) * 100 : 0,
  };
}

export async function fetchBybitTicker(symbol) {
  const url = `${BYBIT_BASE}/v5/market/tickers?category=linear&symbol=${symbol}`;
  const json = await fetchJSON(url);
  const d = json.result?.list?.[0];
  return {
    exchange: "Bybit",
    symbol,
    bid: Number(d?.bid1Price),
    ask: Number(d?.ask1Price),
    last: Number(d?.lastPrice),
    volume: Number(d?.turnover24h || 0),
    changePct: Number(d?.price24hPcnt || 0) * 100,
  };
}

function mapKrakenSymbol(symbol) {
  switch (symbol) {
    case "BTCUSDT": return "XBTUSDT";
    case "ETHUSDT": return "ETHUSDT";
    case "SOLUSDT": return "SOLUSDT";
    case "TONUSDT": return "XTONUSDT";
    case "BNBUSDT": return "BNBUSDT";
    default: return symbol;
  }
}

export async function fetchKrakenTicker(symbol) {
  const pair = mapKrakenSymbol(symbol);
  const url = `${KRAKEN_BASE}/0/public/Ticker?pair=${pair}`;
  const json = await fetchJSON(url);
  const d = Object.values(json.result || {})[0] || {};
  return {
    exchange: "Kraken",
    symbol,
    bid: Number(d.b?.[0]),
    ask: Number(d.a?.[0]),
    last: Number(d.c?.[0]),
    volume: Number(d.v?.[1] || 0),
    changePct: Number(d.p?.[1] || 0),
  };
}

export async function fetchCoinbaseTicker(symbol) {
  const product = `${symbol.slice(0, -4)}-${symbol.slice(-4)}`;
  const url = `${COINBASE_BASE}/products/${product}/ticker`;
  const data = await fetchJSON(url);
  return {
    exchange: "Coinbase",
    symbol,
    bid: Number(data.bid),
    ask: Number(data.ask),
    last: Number(data.price),
    volume: Number(data.volume || 0),
    changePct: 0,
  };
}

export async function fetchCoinGeckoMarkets(ids, vsCurrency = "usd") {
  try {
    const idsParam = ids.join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${idsParam}&price_change_percentage=24h`;
    const data = await fetchJSON(url);
    if (!Array.isArray(data) || !data.length) {
      return getFallbackMarkets({ ids });
    }
    return data.map(item => ({
      id: item.id,
      symbol: item.symbol?.toUpperCase(),
      name: item.name,
      price: item.current_price,
      change24h: item.price_change_percentage_24h,
      marketCap: item.market_cap,
      volume: item.total_volume,
      image: item.image,
    }));
  } catch (err) {
    console.warn("Market fallback", err?.message || err);
    return getFallbackMarkets({ ids });
  }
}

export function computeLatencyPenalty(exchange) {
  switch (exchange) {
    case "Binance": return 0.02;
    case "OKX": return 0.03;
    case "Bybit": return 0.03;
    case "Kraken": return 0.04;
    case "Coinbase": return 0.05;
    default: return 0.05;
  }
}

export function defaultFee(exchange) {
  switch (exchange) {
    case "Binance": return 0.1;
    case "OKX": return 0.08;
    case "Bybit": return 0.075;
    case "Kraken": return 0.16;
    case "Coinbase": return 0.5;
    default: return 0.2;
  }
}