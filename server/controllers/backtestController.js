import axios from 'axios';
import { runSimulation } from '../services/backtestEngine.js';

export const handleBacktest = async (req, res) => {
    try {
        let { symbol, timeframe, strategy } = req.body;

        symbol = (symbol || 'BTCUSDT').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const allowedTimeframes = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
        if (timeframe && !allowedTimeframes.includes(timeframe)) {
            return res.status(400).json({ ok: false, error: 'Invalid timeframe' });
        }

        const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe || '1h'}&limit=500`;
        const response = await axios.get(url);

        const klines = response.data.map(k => ({
            t: k[0], o: parseFloat(k[1]), h: parseFloat(k[2]), l: parseFloat(k[3]), c: parseFloat(k[4]), v: parseFloat(k[5])
        }));

        const results = runSimulation(klines, strategy || { type: 'EMA_CROSS', params: { fast: 9, slow: 21 } });
        res.json({ ok: true, results });

    } catch (error) {
        console.error('Backtest Error:', error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
};
