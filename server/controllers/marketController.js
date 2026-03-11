import axios from 'axios';
import { fetchNews, getMockNews } from '../services/newsService.js';
import { fetchBybitTicker } from '../services/exchangeService.js';

export const getOHLC = async (req, res) => {
    try {
        const { symbol, tf, limit } = req.query;
        const binSymbol = (symbol || 'BTCUSDT').replace('/', '');
        const url = `https://api.binance.com/api/v3/klines?symbol=${binSymbol}&interval=${tf || '1h'}&limit=${limit || 500}`;
        const response = await axios.get(url);
        const formatted = response.data.map(k => ({
            t: k[0], o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5]),
            openTime: k[0], volume: parseFloat(k[5])
        }));
        res.json(formatted);
    } catch (error) {
        console.error('OHLC Proxy Error:', error.message);
        res.status(500).json([]);
    }
};

export const getNews = async (req, res) => {
    try {
        const results = await fetchNews();
        res.json({ results });
    } catch (error) {
        console.error('RSS News Error:', error.message);
        const mockNews = getMockNews();
        setTimeout(() => res.json(mockNews), 500);
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
        try {
            const price = await fetchBybitTicker(symbol);
            return res.json({ ok: true, price });
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
            return res.json({ ok: true, price: simulatedPrice, simulated: true });
        }
    } catch (error) {
        console.error('Fatal Bybit Proxy Error:', error.message);
        res.json({ ok: false, error: 'SERVICE_UNAVAILABLE', price: 0 });
    }
};
