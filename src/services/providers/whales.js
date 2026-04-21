// src/services/providers/whales.js

import { getEthereumWhaleTransactions } from '../blockchain/etherscan.js';
import { getSolanaWhaleTransactions } from '../blockchain/solscan.js';
import { alertService, ALERT_TYPES, ALERT_ACTIONS } from '../alerts/aggregator';

/**
 * Fetch Whale Intelligence Dashboard Data 🐋
 * Combines real-time on-chain data with analytical metrics
 */
export async function getWhaleAlerts() {
    try {
        const [ethWhales, solWhales] = await Promise.all([
            getEthereumWhaleTransactions(),
            getSolanaWhaleTransactions()
        ]);

        const allWhales = [...ethWhales, ...solWhales]
            .sort((a, b) => b.timestamp - a.timestamp);

        // --- Analytical Layer ---
        
        // 1. Network Distribution
        const ethVol = ethWhales.reduce((acc, curr) => acc + curr.amount_usd, 0);
        const solVol = solWhales.reduce((acc, curr) => acc + curr.amount_usd, 0);
        const totalVol = ethVol + solVol || 1;
        
        const distribution = {
            ethereum: Math.round((ethVol / totalVol) * 100),
            solana: Math.round((solVol / totalVol) * 100)
        };

        // 2. Flow Sentiment
        const inflowVol = allWhales.filter(w => w.transaction_type === 'inflow').reduce((acc, curr) => acc + curr.amount_usd, 0);
        const outflowVol = allWhales.filter(w => w.transaction_type === 'outflow').reduce((acc, curr) => acc + curr.amount_usd, 0);
        
        // Net Flow: Positive is OUTFLOW (Bullish), Negative is INFLOW (Bearish/Dump Risk)
        const netFlow = outflowVol - inflowVol;

        // 3. Hot Address Aggregator
        const addressMap = new Map();
        allWhales.forEach(w => {
            const addr = w.from_wallet === 'Unknown' ? w.to_wallet : w.from_wallet;
            if (addr === 'Unknown') return;
            
            const existing = addressMap.get(addr) || { address: addr, count: 0, totalUsd: 0, chain: w.blockchain };
            existing.count += 1;
            existing.totalUsd += w.amount_usd;
            addressMap.set(addr, existing);
        });

        const hotAddresses = Array.from(addressMap.values())
            .sort((a, b) => b.totalUsd - a.totalUsd)
            .slice(0, 5);

        // --- Alerts Integration (Top event only) ---
        if (allWhales.length > 0) {
            const topWhale = allWhales[0];
            const isOutflow = topWhale.transaction_type === 'outflow';

            alertService.add({
                id: `whale_${topWhale.txHash}`,
                type: ALERT_TYPES.WHALE,
                priority: topWhale.amount_usd > 10000000 ? 9 : 7,
                symbol: topWhale.symbol,
                title: `🐋 ${topWhale.symbol} Whale ${isOutflow ? 'Accumulation' : 'Dump Risk'}`,
                description: `$${(topWhale.amount_usd / 1000000).toFixed(1)}M ${topWhale.symbol} ${isOutflow ? 'moved to cold wallet' : 'deposited to exchange'}.`,
                action: isOutflow ? ALERT_ACTIONS.BUY : ALERT_ACTIONS.SELL,
                timestamp: topWhale.timestamp,
                metadata: { price: topWhale.amount_usd / topWhale.amount, hash: topWhale.txHash }
            });
        }

        return {
            alerts: allWhales.slice(0, 20),
            stats: {
                ethVol,
                solVol,
                totalVol,
                distribution,
                netFlow,
                sentiment: netFlow > 0 ? 'BULLISH' : 'BEARISH'
            },
            hotAddresses
        };

    } catch (error) {
        console.error('Whale alerts error:', error);
        return getMockWhaleDashboard();
    }
}

/**
 * Fallback mock data with Dashboard structure
 */
function getMockWhaleDashboard() {
    const now = Date.now();
    return {
        alerts: [
            { id: 'm1', blockchain: 'ethereum', symbol: 'ETH', amount: 15000, amount_usd: 52000000, from_wallet: 'Unknown', to_wallet: 'Binance', transaction_type: 'inflow', timestamp: now - 300000, txHash: '0x123...' },
            { id: 'm2', blockchain: 'solana', symbol: 'SOL', amount: 800000, amount_usd: 120000000, from_wallet: 'Jump Trading', to_wallet: 'Unknown', transaction_type: 'outflow', timestamp: now - 600000, txHash: 'sol123...' }
        ],
        stats: {
            ethVol: 52000000,
            solVol: 120000000,
            totalVol: 172000000,
            distribution: { ethereum: 30, solana: 70 },
            netFlow: 68000000,
            sentiment: 'BULLISH'
        },
        hotAddresses: [
            { address: 'Jump Trading', count: 3, totalUsd: 120000000, chain: 'solana' },
            { address: 'Binance Hot Wallet', count: 12, totalUsd: 450000000, chain: 'ethereum' }
        ]
    };
}
