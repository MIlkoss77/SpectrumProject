import axios from 'axios';

// Cache for Proxy
const proxyCache = new Map();
const CACHE_TTL = {
    KLINES: 10000,
    TICKER: 5000,
    DEFAULT: 2000,
};

function getCacheKey(url) {
    return url;
}

function getFromCache(url) {
    const entry = proxyCache.get(url);
    if (entry && Date.now() - entry.ts < entry.ttl) {
        return entry.data;
    }
    return null;
}

function setToCache(url, data, status) {
    if (status !== 200) return;
    
    let ttl = CACHE_TTL.DEFAULT;
    if (url.includes('klines')) ttl = CACHE_TTL.KLINES;
    if (url.includes('ticker')) ttl = CACHE_TTL.TICKER;

    proxyCache.set(url, { data, ts: Date.now(), ttl });
}

const BINANCE_WHITELIST = ['/api/v3/klines', '/api/v3/ticker/24hr', '/api/v3/ticker/price', '/api/v3/depth'];
const BYBIT_WHITELIST = ['/v5/market/tickers', '/v5/market/kline', '/v5/market/orderbook'];
const MEXC_WHITELIST = ['/api/v3/ticker/24hr', '/api/v3/ticker/price', '/api/v3/depth', '/api/v3/klines'];

const BINANCE_HOSTS = [
    'https://api.binance.com',
    'https://api1.binance.com',
    'https://api2.binance.com',
    'https://api3.binance.com',
    'https://data-api.binance.vision'
];

const MEXC_HOSTS = [
    'https://api.mexc.com',
    'https://api.mexc.vision'
];

let currentBinanceHostIdx = 0;

// Persistent "Last Known Good" Cache
const lkgCache = new Map();

export const binanceProxy = async (req, res) => {
    try {
        const forwardPath = req.url === '/' ? '' : req.url.split('?')[0];

        if (!BINANCE_WHITELIST.some(path => forwardPath.startsWith(path))) {
            console.warn(`[Binance Proxy] Blocked unauthorized path: ${forwardPath}`);
            return res.status(403).json({ ok: false, error: 'Unauthorized proxy path' });
        }

        // Try rotating through hosts if failure occurs
        let lastError = null;
        for (let i = 0; i < 3; i++) { // Try up to 3 different hosts
            const host = BINANCE_HOSTS[currentBinanceHostIdx];
            const url = `${host}${req.url}`;
            
            // Local Memory Cache lookup
            const cached = getFromCache(url);
            if (cached) return res.json(cached);

            try {
                const response = await axios({
                    method: req.method,
                    url: url,
                    data: req.method !== 'GET' ? req.body : undefined,
                    timeout: 5000, // Reduced timeout for faster failover
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                setToCache(url, response.data, response.status);
                
                // Save to LKG (Persistent buffer for this session)
                if (response.status === 200) {
                    lkgCache.set(forwardPath, response.data);
                }

                return res.status(response.status).json(response.data);
            } catch (error) {
                lastError = error;
                const status = error.response?.status;
                
                // If 429 (Rate Limit) or 5xx, rotate and retry
                if (status === 429 || status >= 500) {
                    console.warn(`[Binance Proxy] Host ${host} failed (${status}). Rotating...`);
                    currentBinanceHostIdx = (currentBinanceHostIdx + 1) % BINANCE_HOSTS.length;
                    continue;
                }
                
                // Other errors (404, 400) shouldn't be retried with a different host usually
                break;
            }
        }

        // --- FINAL FAILOVER: Return Last Known Good Data ---
        const lkg = lkgCache.get(forwardPath);
        if (lkg) {
            console.log(`[Binance Proxy] Returning LKG for ${forwardPath}`);
            return res.json({ ...lkg, _meta: { stale: true, source: 'LKG' } });
        }

        throw lastError || new Error('All proxy hosts exhausted');

    } catch (error) {
        console.error(`Binance Proxy Fatal Error [${req.url}]:`, error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            ok: false,
            error: error.message,
            details: error.response?.data || null
        });
    }
};

export const bybitProxy = async (req, res) => {
    // Similar failover for Bybit
    const hosts = ['https://api.bybit.com', 'https://api.bytick.com'];
    try {
        const forwardPath = req.url === '/' ? '' : req.url.split('?')[0];
        if (!BYBIT_WHITELIST.some(path => forwardPath.startsWith(path))) {
            return res.status(403).json({ ok: false, error: 'Unauthorized path' });
        }

        for (const host of hosts) {
            try {
                const url = `${host}${req.url}`;
                const cached = getFromCache(url);
                if (cached) return res.json(cached);

                const response = await axios({
                    method: req.method,
                    url: url,
                    timeout: 6000,
                    headers: { 'User-Agent': 'SpectrTerminal/1.0' }
                });
                setToCache(url, response.data, response.status);
                return res.status(response.status).json(response.data);
            } catch (e) {
                if (e.response?.status === 429) continue;
                throw e;
            }
        }
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
}

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

export const mexcProxy = async (req, res) => {
    try {
        const forwardPath = req.url === '/' ? '' : req.url.split('?')[0];
        if (!MEXC_WHITELIST.some(path => forwardPath.startsWith(path))) {
            return res.status(403).json({ ok: false, error: 'Unauthorized path (MEXC)' });
        }

        for (const host of MEXC_HOSTS) {
            try {
                const url = `${host}${req.url}`;
                const cached = getFromCache(url);
                if (cached) return res.json(cached);

                const response = await axios({
                    method: req.method,
                    url: url,
                    timeout: 6000,
                    headers: { 'User-Agent': 'SpectrTerminal/1.0' }
                });
                setToCache(url, response.data, response.status);
                return res.status(response.status).json(response.data);
            } catch (e) {
                if (e.response?.status === 429) continue; // Rate limit - try next host
                throw e;
            }
        }
    } catch (error) {
        console.error('[MEXC Proxy Error]:', error.message);
        res.status(error.response?.status || 500).json({ ok: false, error: error.message });
    }
};

