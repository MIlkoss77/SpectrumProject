import { ClobClient, Side, OrderType } from "@polymarket/clob-client";
import { Wallet, JsonRpcProvider } from "ethers";
import axios from 'axios';

const CLOB_HOST = "https://clob.polymarket.com";
const GAMMA_HOST = "https://gamma-api.polymarket.com";
const CHAIN_ID = 137; // Polygon Mainnet

/**
 * Initialize a Polymarket CLOB Client
 * @param {string} privateKey - The hot wallet private key
 * @param {object} apiCredentials - Optional L2 API credentials (key, secret, passphrase)
 */
export const initClobClient = async (privateKey, apiCredentials = null) => {
    // Ethers v6 signer
    const provider = new JsonRpcProvider("https://polygon-rpc.com");
    const signer = new Wallet(privateKey, provider);

    if (!apiCredentials) {
        // Derive L2 credentials if not provided
        const tempClient = new ClobClient(CLOB_HOST, CHAIN_ID, signer);
        apiCredentials = await tempClient.createOrDeriveApiKey();
    }

    const client = new ClobClient(
        CLOB_HOST,
        CHAIN_ID,
        signer,
        apiCredentials
    );

    return client;
};

/**
 * Fetch markets from Polymarket Gamma API
 * @param {string} query - Filter query (e.g. "Election")
 */
export const fetchMarkets = async (query = "") => {
    try {
        const url = `${GAMMA_HOST}/markets?limit=20&active=true&closed=false&q=${query}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        
        return response.data.map(m => ({
            id: m.id,
            question: m.question,
            description: m.description,
            outcomes: m.outcomes,
            outcomeSymbols: m.outcomeSymbols,
            clobTokenIds: m.clobTokenIds, 
            endDate: m.endDate,
            volume: m.volume,
            liquidity: m.liquidity,
            icon: m.icon,
            lastTradePrice: m.lastTradePrice,
            bestBid: m.bestBid,
            bestAsk: m.bestAsk,
            spread: m.spread,
            priceChange: m.oneMonthPriceChange
        }));
    } catch (err) {
        console.error("[Polymarket] Gamma API Error:", err.message);
        return [];
    }
};

/**
 * Place a Limit Order on the CLOB
 */
export const placeOrder = async (client, params) => {
    const { tokenId, price, size, side } = params;

    const orderParams = {
        tokenID: tokenId,
        priceByToken: price, // Normalized price (0-1)
        size: size,
        side: side === 'BUY' ? Side.BUY : Side.SELL,
    };

    // Default market config for limit orders
    const marketConfig = {
        tickSize: "0.001",
        negRisk: false,
    };

    try {
        const resp = await client.createAndPostOrder(orderParams, marketConfig, OrderType.GTC);
        return { ok: true, orderId: resp.orderID, resp };
    } catch (err) {
        console.error("[Polymarket] Order Error:", err.message);
        return { ok: false, error: err.message };
    }
};

/**
 * Get User Open Orders
 */
export const getOpenOrders = async (client) => {
    try {
        const orders = await client.getOpenOrders();
        return orders;
    } catch (err) {
        console.error("[Polymarket] Fetch Orders Error:", err.message);
        return [];
    }
};
