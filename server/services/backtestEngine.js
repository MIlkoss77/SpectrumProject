import { EMA, RSI } from 'technicalindicators';

export function runSimulation(klines, strategy) {
    const closes = klines.map(k => k.c);
    const { type, params } = strategy;

    let indicators = {};
    if (type === 'EMA_CROSS') {
        indicators.fast = EMA.calculate({ period: params.fast || 9, values: closes });
        indicators.slow = EMA.calculate({ period: params.slow || 21, values: closes });
    } else if (type === 'RSI') {
        indicators.rsi = RSI.calculate({ period: params.period || 14, values: closes });
    }

    let trades = [];
    let position = null;
    let balance = 1000; // Starting balance in USDT
    const fee = 0.001; // 0.1% fee

    for (let i = 20; i < closes.length; i++) {
        const price = closes[i];
        let signal = 'NEUTRAL';

        if (type === 'EMA_CROSS') {
            const fPrev = indicators.fast[i - 21]; // Adjusted for library offset
            const fCurr = indicators.fast[i - 20];
            const sPrev = indicators.slow[i - 21];
            const sCurr = indicators.slow[i - 20];

            if (fPrev <= sPrev && fCurr > sCurr) signal = 'BUY';
            if (fPrev >= sPrev && fCurr < sCurr) signal = 'SELL';
        } else if (type === 'RSI') {
            const rPrev = indicators.rsi[i - 15];
            const rCurr = indicators.rsi[i - 14];
            if (rPrev <= 30 && rCurr > 30) signal = 'BUY';
            if (rPrev >= 70 && rCurr < 70) signal = 'SELL';
        }

        if (signal === 'BUY' && !position) {
            position = { entryPrice: price, type: 'LONG', amount: balance / price };
            balance -= balance * fee;
        } else if (signal === 'SELL' && position) {
            const pnl = (price - position.entryPrice) * position.amount;
            balance += (position.amount * price);
            balance -= (position.amount * price) * fee;
            trades.push({
                entry: position.entryPrice,
                exit: price,
                pnl: pnl,
                pnlPct: (pnl / (position.entryPrice * position.amount)) * 100,
                timestamp: klines[i].t
            });
            position = null;
        }
    }

    const winRate = trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0;
    const totalPnL = balance - 1000;

    return {
        summary: {
            initialBalance: 1000,
            finalBalance: balance,
            totalPnL: totalPnL,
            totalPnLPct: (totalPnL / 1000) * 100,
            winRate: winRate,
            totalTrades: trades.length
        },
        trades: trades.slice(-10) // Return last 10 trades
    };
}
