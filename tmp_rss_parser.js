import Parser from 'rss-parser';

const parser = new Parser({
    headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
});

async function run() {
    try {
        const feed = await parser.parseURL('https://www.coindesk.com/arc/outboundfeeds/rss/');
        console.log('Coindesk Feed Items:', feed.items.length);
        console.log('First item:', feed.items[0]);
    } catch (e) {
        console.error('RSS Parser Error:', e.message);
    }
}
run();
