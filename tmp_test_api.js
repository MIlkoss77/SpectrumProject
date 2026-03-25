
async function testBinanceAPI() {
    const symbols = ["BTCUSDT", "ETHUSDT"];
    const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`;
    console.log('Testing URL:', url);
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log('Response type:', Array.isArray(data) ? 'Array' : 'Object');
        console.log('Sample item:', data[0]);
    } catch (e) {
        console.error('Fetch failed:', e.message);
    }
}
testBinanceAPI();
