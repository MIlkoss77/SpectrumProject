import * as tradeService from '../services/tradeService.js';

export const handleExecuteTrade = async (req, res) => {
    try {
        const { userId } = req.user;
        const { symbol, amount, side, type, exchange } = req.body;

        if (!symbol || !amount || !exchange) {
            return res.status(400).json({ ok: false, error: 'Symbol, amount, and exchange are required' });
        }

        const result = await tradeService.executeOrder(
            userId, 
            exchange, 
            symbol, 
            parseFloat(amount), 
            side || 'buy', 
            type || 'market'
        );

        res.json(result);
    } catch (error) {
        console.error('Trade Controller Error:', error.message);
        res.status(500).json({ ok: false, error: error.message || 'Failed to execute trade' });
    }
};
