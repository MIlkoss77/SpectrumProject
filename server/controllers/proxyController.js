import axios from 'axios';

const BINANCE_WHITELIST = ['/api/v3/klines', '/api/v3/ticker/24hr', '/api/v3/ticker/price', '/api/v3/depth'];
const BYBIT_WHITELIST = ['/v5/market/tickers', '/v5/market/kline', '/v5/market/orderbook'];

export const binanceProxy = async (req, res) => {
    try {
        const forwardPath = req.url === '/' ? '' : req.url.split('?')[0];

        if (!BINANCE_WHITELIST.some(path => forwardPath.startsWith(path))) {
            console.warn(`[Binance Proxy] Blocked unauthorized path: ${forwardPath}`);
            return res.status(403).json({ ok: false, error: 'Unauthorized proxy path' });
        }

        const url = `https://api.binance.com${req.url}`;
        const response = await axios({
            method: req.method,
            url: url,
            data: req.method !== 'GET' ? req.body : undefined,
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Binance Proxy Error [${req.url}]:`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            ok: false,
            error: error.message,
            details: error.response?.data || null
        });
    }
};

export const bybitProxy = async (req, res) => {
    try {
        const forwardPath = req.url === '/' ? '' : req.url.split('?')[0];

        if (!BYBIT_WHITELIST.some(path => forwardPath.startsWith(path))) {
            console.warn(`[Bybit Proxy] Blocked unauthorized path: ${forwardPath}`);
            return res.status(403).json({ ok: false, error: 'Unauthorized proxy path' });
        }

        const url = `https://api.bybit.com${req.url}`;
        const response = await axios({
            method: req.method,
            url: url,
            data: req.method !== 'GET' ? req.body : undefined,
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`Bybit Proxy Error [${req.url}]:`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            ok: false,
            error: error.message,
            details: error.response?.data || null
        });
    }
};

export const solanaProxy = async (req, res) => {
    try {
        const response = await axios.post('https://api.mainnet-beta.solana.com', req.body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });
        res.json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: true });
    }
};
