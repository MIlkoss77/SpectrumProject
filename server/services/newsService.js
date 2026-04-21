import axios from 'axios';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['content:encoded', 'creator', 'dc:creator', 'pubDate', 'description']
    },
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

// Cache configuration
const CACHE_TTL = 120 * 1000; // 120 seconds
let newsCache = {
    data: null,
    lastUpdate: 0
};

// Direct RSS URLs, bypassing rss2json!
const RSS_SOURCES = [
    { name: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://cointelegraph.com/rss' },
    { name: 'Decrypt', url: 'https://decrypt.co/feed' }
];

export const fetchNews = async (apiKey = null) => {
    const now = Date.now();
    
    // --- SWR: Return cache IMMEDIATELY if it exists ---
    if (newsCache.data) {
        const isStale = (now - newsCache.lastUpdate > CACHE_TTL);
        if (isStale) {
            // Trigger background refresh but don't wait for it
            console.log('[NewsService] SWR: Cache stale, triggering background refresh');
            refreshNewsCache(apiKey).catch(e => console.error('[NewsService] Background refresh failed:', e.message));
        } else {
            console.log('[NewsService] Serving fresh cache');
        }
        return newsCache.data;
    }

    // First run or no cache: must wait
    console.log(`[NewsService] First fetch, waiting for initial data...`);
    return await refreshNewsCache(apiKey);
};

// Background refresh worker
async function refreshNewsCache(apiKey) {
    const now = Date.now();
    
    // Source results aggregator
    const fetchPromises = RSS_SOURCES.map(async (source) => {
        try {
            // Timeout wrapper helper
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('TIMEOUT_EXCEEDED')), 5000)
            );

            const feedPromise = parser.parseURL(source.url);
            const feed = await Promise.race([feedPromise, timeoutPromise]);
            
            return (feed.items || []).map(item => {
                let domain = 'crypto';
                try {
                    if (item.link) domain = new URL(item.link).hostname.replace('www.', '');
                } catch (e) {}
                
                return {
                    title: item.title,
                    url: item.link || '',
                    published_at: item.isoDate || item.pubDate || new Date().toISOString(),
                    source: { title: source.name },
                    domain: domain,
                    description: item.contentSnippet || item.content || item.title || ''
                };
            });
        } catch (err) {
            console.warn(`[NewsService] Skipping ${source.name}: ${err.message}`);
            return [];
        }
    });

    // Add CryptoPanic with strict timeout
    try {
        let cpUrl = apiKey 
            ? `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}`
            : `https://cryptopanic.com/api/v1/posts/?public=true`;
            
        const cpPromise = axios.get(cpUrl, { 
            timeout: 5000, // Reduced from 8000
            headers: { 'User-Agent': 'SpectrTerminal/1.0' }
        }).then(res => {
            return (res.data.results || []).map(item => ({
                title: item.title,
                url: item.url,
                published_at: item.published_at,
                source: { title: item.source?.title || 'CryptoPanic' },
                domain: item.domain,
                description: item.title
            }));
        }).catch(e => {
            console.warn(`[NewsService] Skipping CryptoPanic: ${e.message}`);
            return [];
        });
        
        fetchPromises.push(cpPromise);
    } catch (e) {}

    const results = await Promise.allSettled(fetchPromises);
    const allItems = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value)
        .flat();

    if (allItems.length === 0) {
        if (newsCache.data) return newsCache.data;
        return getMockNews().results;
    }

    // 1. Deduplication
    const seen = new Set();
    const uniqueItems = allItems.filter(item => {
        if (!item || !item.title) return false;
        const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (seen.has(slug)) return false;
        seen.add(slug);
        return true;
    });

    // 2. Sorting
    uniqueItems.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // 3. Formatting
    const formatted = uniqueItems.slice(0, 100).map((item, index) => ({
        id: index + 1,
        title: item.title,
        url: item.url,
        domain: item.domain,
        published_at: item.published_at,
        source: item.source,
        description: item.description,
        currencies: extractCurrencies(item.title + ' ' + item.description)
    }));

    newsCache.data = formatted;
    newsCache.lastUpdate = now;

    return formatted;
}


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
