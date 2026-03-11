import ccxt from 'ccxt';
import { prisma } from '../config/database.js';
import * as encryption from './encryption.js';

/**
 * Executes an order on the specified exchange using stored credentials.
 * @param {string} userId
 * @param {string} exchangeId
 * @param {string} symbol e.g., "BTC/USDT"
 * @param {number} amount
 * @param {string} side "buy" or "sell"
 * @param {string} type "market" or "limit"
 */
export const executeOrder = async (userId, exchangeId, symbol, amount, side = 'buy', type = 'market') => {
    try {
        // 1. Get Credentials
        const creds = await prisma.exchangeCreds.findUnique({
            where: {
                userId_exchange: {
                    userId,
                    exchange: exchangeId.toLowerCase()
                }
            }
        });

        // 2. Fallback to Simulation if no creds
        if (!creds) {
            console.log(`[SIMULATION] No credentials for ${exchangeId}. Simulating ${side} of ${amount} ${symbol}`);
            return {
                ok: true,
                simulated: true,
                orderId: `sim_${Math.random().toString(36).substr(2, 9)}`,
                message: "Simulated order executed (no API keys found)"
            };
        }

        // 3. Decrypt keys
        const apiKey = encryption.decrypt(creds.apiKeyHash);
        const secret = encryption.decrypt(creds.secretHash);

        if (!apiKey || !secret) {
            throw new Error("Could not decrypt API credentials");
        }

        // 4. Initialize CCXT
        if (!ccxt.exchanges.includes(exchangeId)) {
            throw new Error(`Exchange ${exchangeId} not supported by CCXT`);
        }

        const exchangeClass = ccxt[exchangeId];
        const exchange = new exchangeClass({
            apiKey,
            secret,
            enableRateLimit: true,
        });

        // 5. Place Order
        // Note: For production, you'd want more robust error handling and param validation
        const order = await exchange.createOrder(symbol, type, side, amount);

        return {
            ok: true,
            simulated: false,
            orderId: order.id,
            details: order
        };

    } catch (error) {
        console.error('Trade Execution Error:', error.message);
        throw error;
    }
};
