
const fs = require('fs');

const main = async () => {
    try {
        const resp = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0', id: 1, method: 'getSignaturesForAddress',
                params: ['52C9T2T7JRojtxumYnYZhyUmrN7kqzvCLc4Ksvjk7TxD', { limit: 10 }]
            })
        });
        const data = await resp.json();

        let output = "";
        if (data.result) {
            data.result.forEach(r => output += r.signature + "\n");
        }

        fs.writeFileSync('c:/Users/Admin/Desktop/Spectrum Project/sigs_clean.txt', output);
        console.log("Written to sigs_clean.txt");

    } catch (e) {
        console.error(e);
    }
};
main();
