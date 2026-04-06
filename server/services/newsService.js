import axios from 'axios';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['content:encoded', 'creator', 'dc:creator', 'pubDate', 'description']
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
    
    // Serve from cache if available
    if (!apiKey && newsCache.data && (now - newsCache.lastUpdate < CACHE_TTL)) {
        console.log('[NewsService] Serving from cache');
        return newsCache.data;
    }

    console.log(`[NewsService] Fetching fresh news (Direct RSS & CryptoPanic)...`);
    
    const fetchPromises = RSS_SOURCES.map(async (source) => {
        try {
            const feed = await parser.parseURL(source.url);
            
            return feed.items.map(item => {
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
            console.error(`[NewsService] Failed to fetch from ${source.name} via rss-parser:`, err.message);
            return [];
        }
    });

    // Add CryptoPanic logic if apiKey provided or public feed
    try {
        let cpUrl = apiKey 
            ? `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}`
            : `https://cryptopanic.com/api/v1/posts/?public=true`;
            
        const cpPromise = axios.get(cpUrl, { timeout: 8000 }).then(res => {
            return (res.data.results || []).map(item => ({
                title: item.title,
                url: item.url,
                published_at: item.published_at,
                source: { title: item.source?.title || 'CryptoPanic' },
                domain: item.domain,
                description: item.title
            }));
        }).catch(e => {
            console.error(`[NewsService] Failed to fetch CryptoPanic:`, e.message);
            return [];
        });
        
        fetchPromises.push(cpPromise);
    } catch (e) {}

    const results = await Promise.all([...fetchPromises]);
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
        return getMockNews().results;
    }

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
