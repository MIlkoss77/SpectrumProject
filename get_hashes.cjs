
const https = require('https');

const data = JSON.stringify({
    "jsonrpc": "2.0", "id": 1, "method": "getSignaturesForAddress",
    "params": ["52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD", { "limit": 5 }]
});

const options = {
    hostname: 'api.mainnet-beta.solana.com',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, res => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            if (json.result) json.result.forEach(x => console.log(x.signature));
        } catch (e) { console.error(e); }
    });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
