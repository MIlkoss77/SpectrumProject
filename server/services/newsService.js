import axios from 'axios';

// Cache configuration
const CACHE_TTL = 120 * 1000; // 120 seconds
let newsCache = {
    data: null,
    lastUpdate: 0
};

const RSS_SOURCES = [
    { name: 'CoinDesk', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss' },
    { name: 'Decrypt', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed' },
    { name: 'Bitcoin.com', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://news.bitcoin.com/feed/' },
    { name: 'CryptoSlate', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cryptoslate.com/feed/' },
    { name: 'UToday', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://u.today/rss' },
    { name: 'NewsBTC', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.newsbtc.com/feed/' },
    { name: 'CryptoPanic', url: 'https://cryptopanic.com/api/v1/posts/?public=true' } // Public feed
];

/**
 * Fetch and aggregate news from multiple sources
 */
export const fetchNews = async (apiKey = null) => {
    const now = Date.now();
    
    // Return cache if still valid (but only if no custom apiKey is used, to allow bypass)
    if (!apiKey && newsCache.data && (now - newsCache.lastUpdate < CACHE_TTL)) {
        console.log('[NewsService] Serving from cache');
        return newsCache.data;
    }

    console.log(`[NewsService] Fetching fresh news from 10+ sources... ${apiKey ? '(User API Key Active)' : '(Public Mode)'}`);
    
    const fetchPromises = RSS_SOURCES.map(async (source) => {
        try {
            let fetchUrl = source.url;
            if (source.name === 'CryptoPanic' && apiKey) {
                fetchUrl = `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}`;
            }
            const res = await axios.get(fetchUrl, { timeout: 5000 });

            
            // Handle CryptoPanic API (JSON)
            if (source.name === 'CryptoPanic') {
                return (res.data.results || []).map(item => ({
                    title: item.title,
                    url: item.url,
                    published_at: item.published_at,
                    source: { title: item.source?.title || 'CryptoPanic' },
                    domain: item.domain,
                    description: item.title
                }));
            }

            // Handle RSS2JSON outputs
            if (res.data && res.data.items) {
                return res.data.items
                    .filter(item => item && item.title) // Ensure title exists
                    .map(item => {
                        let domain = 'crypto';
                        try {
                            if (item.link) domain = new URL(item.link).hostname.replace('www.', '');
                        } catch (e) { /* ignore URL errors */ }
                        
                        return {
                            title: item.title,
                            url: item.link || '',
                            published_at: item.pubDate || item.published_at || new Date().toISOString(),
                            source: { title: source.name },
                            domain: domain,
                            description: item.content || item.description || item.title || ''
                        };
                    });
            }

            return [];
        } catch (err) {
            console.error(`[NewsService] Failed to fetch from ${source.name}:`, err.message);
            return [];
        }
    });

    const results = await Promise.all(fetchPromises);
    let allItems = results.flat();

    // 1. Deduplication (by title slug)
    const seen = new Set();
    allItems = allItems.filter(item => {
        if (!item || !item.title) return false;
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
    });


    // 2. Sorting by date
    allItems.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // 3. Formatting
    const formatted = allItems.slice(0, 100).map((item, index) => ({
        id: index + 1,
        title: item.title,
        url: item.url,
        domain: item.domain,
        published_at: item.published_at,
        source: item.source,
        description: item.description,
        currencies: extractCurrencies(item.title + ' ' + item.description)
    }));

    if (formatted.length === 0) {
        // If everything failed, use mock news instead of crashing
        return getMockNews().results;
    }

    // Update cache
    newsCache.data = formatted;
    newsCache.lastUpdate = now;

    return formatted;
};

/**
 * Helper to extract currency codes from text
 */
function extractCurrencies(text) {
    if (!text) return [];
    const codes = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOT', 'DOGE', 'AVAX', 'LINK', 'TON'];
    const upperText = String(text).toUpperCase();
    return codes.filter(code => upperText.includes(code)).map(code => ({ code }));
}


export const getMockNews = () => ({
    results: [
        {
            id: 'm1',
            kind: "news",
            domain: "coindesk.com",
            source: { title: "CoinDesk" },
            title: "Bitcoin Surges Past $69k as ETF Inflows Hit Record Highs",
            published_at: new Date().toISOString(),
            url: "https://coindesk.com",
            currencies: [{ code: "BTC" }]
        },
        {
            id: 'm2',
            kind: "news",
            domain: "cointelegraph.com",
            source: { title: "CoinTelegraph" },
            title: "Solana Ecosystem Grows: New DeFi Protocols Launching",
            published_at: new Date(Date.now() - 3600000).toISOString(),
            url: "https://cointelegraph.com",
            currencies: [{ code: "SOL" }]
        }
    ]
});

