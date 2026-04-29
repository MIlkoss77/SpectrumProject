import axios from 'axios';
import { fetchNews, getMockNews } from '../services/newsService.js';
import { fetchBybitTicker } from '../services/exchangeService.js';
import { fetchSocialBuzz } from '../services/socialService.js';
import { telegramScout } from '../services/telegramService.js';

// Simple In-memory Cache
const cache = {
    ohlc: new Map(),
    ticker: new Map(),
};

const CACHE_TTL = {
    OHLC: 10000, 
    TICKER: 5000,
};

function getFromCache(type, key) {
    const entry = cache[type].get(key);
    if (entry && Date.now() - entry.ts < CACHE_TTL[type.toUpperCase()]) {
        return entry.data;
    }
    return null;
}

function setToCache(type, key, data) {
    cache[type].set(key, { data, ts: Date.now() });
}

export const getOHLC = async (req, res) => {
    try {
        const { symbol, tf, limit } = req.query;
        const binSymbol = (symbol || 'BTCUSDT').replace('/', '');
        const cacheKey = `${binSymbol}-${tf}-${limit}`;
        
        const cachedData = getFromCache('ohlc', cacheKey);
        if (cachedData) return res.json(cachedData);

        const url = `https://api.binance.com/api/v3/klines?symbol=${binSymbol}&interval=${tf || '1h'}&limit=${limit || 500}`;
        const response = await axios.get(url, { timeout: 5000 });
        if (!response.data || !Array.isArray(response.data)) throw new Error('Invalid Binance Data');
        
        const formatted = response.data.map(k => ({
            t: k[0], o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5]),
            openTime: k[0], volume: parseFloat(k[5])
        }));

        setToCache('ohlc', cacheKey, formatted);
        res.json(formatted);
    } catch (error) {
        console.error('OHLC Proxy Error:', error.message);
        res.status(500).json([]);
    }
};

export const getNews = async (req, res) => {
    try {
        const apiKey = req.headers['x-cryptopanic-key'] || process.env.CRYPTOPANIC_KEY;
        const results = await fetchNews(apiKey);
        res.json({ results });
    } catch (error) {
        console.error('RSS News Error:', error.message);
        const mockNews = getMockNews();
        res.json(mockNews);
    }
};

export const getSocialBuzz = async (req, res) => {
    try {
        const apiKey = process.env.CRYPTOPANIC_KEY;
        const results = await fetchSocialBuzz(apiKey);
        res.json({ results });
    } catch (error) {
        console.error('[MarketController] Social Buzz Error:', error.message);
        res.json({ results: [] });
    }
};

export const getScoutSignals = async (req, res) => {
    try {
        const signals = telegramScout.getSignals();
        res.json({ ok: true, signals });
    } catch (error) {
        console.error('[MarketController] Scout Error:', error.message);
        res.status(500).json({ ok: false, signals: [] });
    }
};

export const getWhaleTransactions = async (req, res) => {
    try {
        const API_KEY = process.env.ETHERSCAN_API_KEY;
        const WHALE_ADDRESS = '0x28C6c06298d514Db089934071355E5743bf21d60';

        if (!API_KEY) throw new Error('No API Key');

        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${WHALE_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${API_KEY}`;
        const response = await axios.get(url);

        if (response.data.status !== "1") {
            return res.json({
                ok: true,
                simulated: true,
                data: [
                    { hash: '0x123...sim', timeStamp: Math.floor(Date.now() / 1000), from: 'Binance Cold Wallet', to: 'Swap Contract', value: '450.00' },
                    { hash: '0x456...sim', timeStamp: Math.floor(Date.now() / 1000) - 3600, from: 'Unknown Whale', to: 'Coinbase', value: '88.50' }
                ]
            });
        }

        const txs = response.data.result.map(tx => ({
            hash: tx.hash,
            timeStamp: tx.timeStamp,
            from: tx.from,
            to: tx.to,
            value: (parseFloat(tx.value) / 1e18).toFixed(2),
            isError: tx.isError
        })).filter(tx => parseFloat(tx.value) > 10);

        return res.json({ ok: true, data: txs });
    } catch (error) {
        console.error('Whale Proxy Error:', error.message);
        return res.json({
            ok: true,
            simulated: true,
            data: [
                { hash: '0x123...sim', timeStamp: Math.floor(Date.now() / 1000), from: 'Binance Cold Wallet', to: 'Swap Contract', value: '450.00' },
                { hash: '0x456...sim', timeStamp: Math.floor(Date.now() / 1000) - 3600, from: 'Unknown Whale', to: 'Coinbase', value: '88.50' }
            ]
        });
    }
};

export const getBybitTickerPrice = async (req, res) => {
    try {
        const { symbol } = req.params;
        const cachedData = getFromCache('ticker', symbol);
        if (cachedData) return res.json(cachedData);

        try {
            const price = await fetchBybitTicker(symbol);
            const result = { ok: true, price };
            setToCache('ticker', symbol, result);
            return res.json(result);
        } catch (fetchErr) {
            console.warn(`Bybit Proxy Timeout for ${symbol}. Using smart simulation.`);
            const bResp = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`).catch(() => null);
            let basePrice = bResp ? parseFloat(bResp.data.price) : 1.0;

            if (!bResp) {
                if (symbol.includes('BTC')) basePrice = 67000 + Math.random() * 100;
                else if (symbol.includes('ETH')) basePrice = 3500 + Math.random() * 10;
                else basePrice = 100 + Math.random();
            }

            const simulatedPrice = basePrice * (1 + (Math.random() * 0.006 - 0.003));
            const result = { ok: true, price: simulatedPrice, simulated: true };
            return res.json(result);
        }
    } catch (error) {
        console.error('Fatal Bybit Proxy Error:', error.message);
        res.json({ ok: false, error: 'SERVICE_UNAVAILABLE', price: 0 });
    }
};
