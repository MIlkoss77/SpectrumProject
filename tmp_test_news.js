import axios from 'axios';

const RSS_SOURCES = [
    { name: 'CoinDesk', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { name: 'CoinTelegraph', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss' },
    { name: 'Decrypt', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://decrypt.co/feed' }
];

async function testNews() {
    for (const source of RSS_SOURCES) {
        try {
            console.log(`Fetching from ${source.name}...`);
            const res = await axios.get(source.url, { timeout: 5000 });
            console.log(`Success: ${source.name}, items:`, res.data?.items?.length);
            if (res.data?.status !== 'ok') {
                console.log(`Error Status for ${source.name}:`, res.data);
            }
        } catch (err) {
            console.error(`Failed ${source.name}:`, err.response?.data || err.message);
        }
    }
}
testNews();
