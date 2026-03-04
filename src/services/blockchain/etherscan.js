// src/services/blockchain/etherscan.js

/**
 * Etherscan API integration for tracking large Ethereum transactions
 * 
 * NOTE: Using simulated data for MVP due to CORS limitations
 * See whale_api_notes.md for production implementation options
 */

const API_BASE = '/api'; // Proxied through Vite/Server

/**
 * Fetch recent Ethereum whale transactions
 * Connects to local backend proxy for real-time Etherscan data
 */
export async function getEthereumWhaleTransactions() {
    try {
        const res = await fetch(`${API_BASE}/whales`);
        if (!res.ok) throw new Error('Whale backend unavailable');

        const json = await res.json();
        if (!json.ok || !json.data) return generateSimulatedEthWhales();

        // Convert backend transaction format to app format
        return json.data.map(tx => ({
            id: tx.hash,
            blockchain: 'ethereum',
            symbol: 'ETH',
            amount: parseFloat(tx.value),
            amount_usd: Math.floor(parseFloat(tx.value) * 3500), // Hardcoded price for conversion
            from_wallet: tx.from,
            to_wallet: tx.to,
            transaction_type: 'unknown',
            timestamp: parseInt(tx.timeStamp) * 1000,
            txHash: tx.hash,
            isSimulated: json.simulated || false
        }));
    } catch (error) {
        console.warn('Whale tracking fetch failed, using fallback:', error);
        return generateSimulatedEthWhales();
    }
}

/**
 * Generate realistic whale transaction data
 * Based on actual exchange wallet behaviors
 */
function generateSimulatedEthWhales() {
    const now = Date.now();
    const ethPrice = 3500;

    const patterns = [
        { from: 'Binance', to: 'Unknown', amount: 5000 + Math.random() * 5000, type: 'outflow' },
        { from: 'Unknown', to: 'Coinbase', amount: 3000 + Math.random() * 7000, type: 'inflow' },
        { from: 'Kraken', to: 'Unknown', amount: 2000 + Math.random() * 3000, type: 'outflow' },
        { from: 'Unknown', to: 'Binance', amount: 8000 + Math.random() * 4000, type: 'inflow' },
    ];

    return patterns.map((p, i) => {
        const amount = p.amount;
        const amountUsd = amount * ethPrice;

        return {
            id: `eth_sim_${now}_${i}`,
            blockchain: 'ethereum',
            symbol: 'ETH',
            amount: Math.floor(amount),
            amount_usd: Math.floor(amountUsd),
            from_wallet: p.from,
            to_wallet: p.to,
            transaction_type: p.type,
            timestamp: now - (i * 15 * 60 * 1000), // Spaced 15 minutes apart
            txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
            blockNumber: 19000000 + Math.floor(Math.random() * 100000),
            isSimulated: true, // Flag for UI to show this is demo data
        };
    }).filter(tx => tx.amount_usd >= 5000000); // Only $5M+ transactions
}

/**
 * Get current ETH price (for calculating USD values)
 */
export async function getEthPrice() {
    return 3500; // Hardcoded for MVP
}
