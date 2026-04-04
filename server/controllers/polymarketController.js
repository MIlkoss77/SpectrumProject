import * as polymarketService from '../services/polymarketService.js';

/**
 * Get active Polymarket markets via Gamma API
 */
export const getMarkets = async (req, res) => {
    try {
        const { q } = req.query;
        const markets = await polymarketService.fetchMarkets(q || "");
        res.json(markets);
    } catch (err) {
        console.error("[PolymarketController] GetMarkets Error:", err.message);
        res.status(500).json({ error: "FAILED_TO_FETCH_MARKETS" });
    }
};

/**
 * Handle order placement on Polymarket CLOB
 */
export const placeOrder = async (req, res) => {
    try {
        const { pk, tokenId, price, size, side } = req.body;
        
        if (!pk || !tokenId || !price || !size || !side) {
            return res.status(400).json({ error: "MISSING_PARAMETERS" });
        }

        const client = await polymarketService.initClobClient(pk);
        const result = await polymarketService.placeOrder(client, { tokenId, price, size, side });
        
        res.json(result);
    } catch (err) {
        console.error("[PolymarketController] PlaceOrder Error:", err.message);
        res.status(500).json({ ok: false, error: err.message });
    }
};

/**
 * Get Open Orders for a specific wallet
 */
export const getOrders = async (req, res) => {
    try {
        const { pk } = req.query;
        if (!pk) return res.status(400).json({ error: "WALLET_REQUIRED" });

        const client = await polymarketService.initClobClient(pk);
        const orders = await polymarketService.getOpenOrders(client);
        
        res.json(orders);
    } catch (err) {
        console.error("[PolymarketController] GetOrders Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
