import axios from 'axios';

export const fetchNews = async () => {
    const rssUrls = [
        'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/',
        'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss'
    ];

    const responses = await Promise.all(rssUrls.map(url => axios.get(url)));
    let allItems = [];

    responses.forEach(response => {
        if (response.data && response.data.items) {
            allItems = allItems.concat(response.data.items);
        }
    });

    allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const formatted = allItems.slice(0, 20).map((item, index) => ({
        id: index + 1,
        title: item.title,
        slug: item.guid,
        url: item.link,
        domain: new URL(item.link).hostname.replace('www.', ''),
        published_at: item.pubDate,
        source: { title: item.author || 'Crypto News' },
        currencies: []
    }));

    if (formatted.length === 0) throw new Error('No RSS items found');

    return formatted;
};

export const getMockNews = () => ({
    results: [
        {
            kind: "news",
            domain: "coindesk.com",
            source: { title: "CoinDesk" },
            title: "Bitcoin Surges Past $69k as ETF Inflows Hit Record Highs",
            published_at: new Date().toISOString(),
            url: "https://coindesk.com",
            currencies: [{ code: "BTC" }]
        },
        {
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
