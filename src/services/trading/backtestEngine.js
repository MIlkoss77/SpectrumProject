import { fetchBinanceKlines } from '../providers/market';
import { rsi, ema, macd, sma } from '../ta/indicators';
import { getPredictor } from '../ml/ml_model';

/**
 * Backtest Engine - Simulation of trading strategies on historical data
 */
export class BacktestEngine {
    constructor() {
        this.results = null;
    }

    /**
     * Run backtest for a specific symbol/timeframe
     * @param {Object} options - { symbol, timeframe, strategyName, initialBalance }
     */
    async run({ symbol, timeframe = '1h', strategyName = 'SuperScore', initialBalance = 1000, days = 30 }) {
        // 1. Fetch historical data (approx 24 * days candles for 1h)
        const limit = Math.min(1000, days * (timeframe === '1h' ? 24 : 100));
        const klines = await fetchBinanceKlines(symbol, timeframe, limit);

        if (!klines || klines.length < 200) {
            throw new Error('Not enough historical data for backtest (minimum 200 candles required)');
        }

        // 2. Pre-calculate indicators for the whole dataset
        const closes = klines.map(k => k.c);
        const ema34 = ema(closes, 34);
        const ema89 = ema(closes, 89);
        const indicators = {
            rsi: rsi(closes, 14),
            ema50: ema(closes, 50),
            ema200: ema(closes, 200),
            ema34,
            ema89,
            macd: macd(closes)
        };

        // 3. Neural strategy setup
        let predictor = null;
        let startIdx = 200; // Default warmup

        if (strategyName === 'Neural' || strategyName === 'Moonshot AI') {
            predictor = getPredictor(`backtest-${symbol}`);
            // Simple one-time train on the warmup half (first 50% of data)
            const trainLimit = Math.floor(klines.length / 2);
            startIdx = trainLimit; // Start backtest AFTER training data

            const trainX = [];
            const trainY = [];

            // Feature extraction (simplified version of predictions.js)
            const getFeatures = (i) => {
                const normRsi = (indicators.rsi[i] ?? 50) / 100;
                const normEma = ((ema34[i] - ema89[i]) / ema89[i]) * 50 + 0.5;
                const normTrend = ((closes[i] - ema34[i]) / ema34[i]) * 100 + 0.5;
                const normMacd = ((indicators.macd.hist[i] ?? 0) / (closes[i] * 0.002)) * 0.5 + 0.5;

                // Clamp values to 0-1
                const clamp = (v) => Math.max(0, Math.min(1, v));
                return [clamp(normRsi), clamp(normMacd), clamp(normEma), clamp(normTrend)];
            };

            for (let i = 100; i < trainLimit - 4; i++) {
                trainX.push(getFeatures(i));
                // Label: 1 if price in 4 candles is higher than now
                trainY.push([closes[i + 4] > closes[i] ? 1 : 0]);
            }

            if (trainX.length > 50) {
                await predictor.train(trainX, trainY, 20);
            }
        }

        // 4. Simulation Loop
        let balance = initialBalance;
        let position = null; // { entryPrice, amount, entryTime }
        let trades = [];
        let equityCurve = [];

        for (let i = startIdx; i < klines.length; i++) {
            const currentPrice = klines[i].c;
            const currentTime = klines[i].t;

            // Signal Logic
            let signal = 'NEUTRAL';

            if (predictor) {
                // Neural Strategy
                const normRsi = (indicators.rsi[i] ?? 50) / 100;
                const normEma = ((ema34[i] - ema89[i]) / ema89[i]) * 50 + 0.5;
                const normTrend = ((closes[i] - ema34[i]) / ema34[i]) * 100 + 0.5;
                const normMacd = ((indicators.macd.hist[i] ?? 0) / (closes[i] * 0.002)) * 0.5 + 0.5;
                const clamp = (v) => Math.max(0, Math.min(1, v));

                const prob = await predictor.predict([clamp(normRsi), clamp(normMacd), clamp(normEma), clamp(normTrend)]);

                if (prob > 0.60) signal = 'BUY';
                if (prob < 0.40) signal = 'SELL';

            } else if (strategyName === 'Cross-EMA') {
                const prevEma50 = indicators.ema50[i - 1];
                const prevEma200 = indicators.ema200[i - 1];
                const currEma50 = indicators.ema50[i];
                const currEma200 = indicators.ema200[i];

                if (prevEma50 <= prevEma200 && currEma50 > currEma200) signal = 'BUY';
                if (prevEma50 >= prevEma200 && currEma50 < currEma200) signal = 'SELL';
            } else {
                // Default: RSI based strategy
                const currRsi = indicators.rsi[i];
                if (currRsi < 30) signal = 'BUY';
                if (currRsi > 70) signal = 'SELL';
            }

            // Execute Trade Simulation
            if (signal === 'BUY' && !position) {
                // Entry
                const amount = (balance * 0.95) / currentPrice; // Use 95% of balance
                position = { entryPrice: currentPrice, amount, entryTime: currentTime };
                balance -= amount * currentPrice;
            } else if (signal === 'SELL' && position) {
                // Exit
                balance += position.amount * currentPrice;
                trades.push({
                    entryPrice: position.entryPrice,
                    exitPrice: currentPrice,
                    pnl: (currentPrice - position.entryPrice) * position.amount,
                    pnlPct: ((currentPrice - position.entryPrice) / position.entryPrice) * 100,
                    entryTime: position.entryTime,
                    exitTime: currentTime
                });
                position = null;
            }

            const currentEquity = balance + (position ? position.amount * currentPrice : 0);
            equityCurve.push({ t: currentTime, balance: currentEquity });
        }

        // Close open position at the end
        if (position) {
            const lastPrice = klines[klines.length - 1].c;
            balance += position.amount * lastPrice;
            trades.push({
                entryPrice: position.entryPrice,
                exitPrice: lastPrice,
                pnl: (lastPrice - position.entryPrice) * position.amount,
                pnlPct: ((lastPrice - position.entryPrice) / position.entryPrice) * 100,
                entryTime: position.entryTime,
                exitTime: klines[klines.length - 1].t,
                status: 'OPEN_EXIT'
            });
        }

        // 4. Calculate Final Metrics
        const totalReturn = ((balance - initialBalance) / initialBalance) * 100;
        const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;
        const maxDrawdown = this.calculateMaxDrawdown(equityCurve);

        this.results = {
            symbol,
            strategyName,
            totalReturn: +totalReturn.toFixed(2),
            winRate: +winRate.toFixed(2),
            maxDrawdown: +maxDrawdown.toFixed(2),
            tradesCount: trades.length,
            trades,
            equityCurve
        };

        return this.results;
    }

    calculateMaxDrawdown(equityCurve) {
        if (!equityCurve.length) return 0;
        let maxEquity = equityCurve[0].balance;
        let maxDD = 0;
        for (const point of equityCurve) {
            if (point.balance > maxEquity) maxEquity = point.balance;
            const dd = ((maxEquity - point.balance) / maxEquity) * 100;
            if (dd > maxDD) maxDD = dd;
        }
        return maxDD;
    }
}

export const backtestEngine = new BacktestEngine();
