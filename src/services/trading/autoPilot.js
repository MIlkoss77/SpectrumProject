import { calculateSuperScore } from '../ai/superScore';
import { alertService, ALERT_TYPES } from '../alerts/aggregator';

/**
 * AutoPilot Engine
 * Automatically executes trades based on SuperScore signals and Risk Rules.
 */
class AutoPilot {
    constructor() {
        this.isActive = false;
        this.intervalId = null;
        this.symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'TONUSDT'];
        this.lastTradeTime = {}; // symbol -> timestamp
        this.config = {
            minScore: 75,       // Strong Buy signal
            maxScore: 25,       // Strong Sell signal
            coolDownMs: 1000 * 60 * 60, // 1 hour between trades for same symbol
            stakeAmount: 500,   // Fixed stake for autopilot Demo
            maxPositions: 3
        };
    }

    /**
     * Start the AutoPilot engine
     * @param {Function} placeOrderFn - The execution function from useExecution
     * @param {Object} paperState - Current paper trading state for risk checks
     */
    start(placeOrderFn, paperState) {
        if (this.isActive) return;
        this.isActive = true;
        this.placeOrder = placeOrderFn;

        console.log('🚀 AutoPilot Engine Started');

        // Scan every 60 seconds
        this.intervalId = setInterval(() => this.runCircle(paperState), 60000);
        this.runCircle(paperState); // Initial run
    }

    stop() {
        this.isActive = false;
        if (this.intervalId) clearInterval(this.intervalId);
        console.log('🛑 AutoPilot Engine Stopped');
    }

    async runCircle(paperState) {
        if (!this.isActive) return;

        for (const symbol of this.symbols) {
            try {
                // 1. Check Cooldown
                const lastTrade = this.lastTradeTime[symbol] || 0;
                if (Date.now() - lastTrade < this.config.coolDownMs) continue;

                // 2. Get Signal
                const scoreData = await calculateSuperScore(symbol);

                // 3. Risk Management - Max Positions
                const activePositions = paperState?.positions || [];
                if (activePositions.length >= this.config.maxPositions && !activePositions.find(p => p.symbol === symbol)) {
                    continue;
                }

                // 4. Signal Logic
                let action = null;
                if (scoreData.score >= this.config.minScore) action = 'BUY';
                if (scoreData.score <= this.config.maxScore) action = 'SELL';

                if (action) {
                    // Additional check: Don't buy if already holding
                    const isHolding = activePositions.find(p => p.symbol === symbol);
                    if (action === 'BUY' && isHolding) continue;
                    if (action === 'SELL' && !isHolding) continue;

                    console.log(`🤖 AutoPilot Signal: ${action} ${symbol} (Score: ${scoreData.score})`);

                    await this.executeAutoTrade(symbol, action, scoreData.score);
                    this.lastTradeTime[symbol] = Date.now();
                }

            } catch (err) {
                console.error(`AutoPilot error for ${symbol}:`, err);
            }
        }
    }

    async executeAutoTrade(symbol, side, score) {
        if (!this.placeOrder) return;

        try {
            // Small Delay for UX feel
            await new Promise(r => setTimeout(r, 2000));

            const result = await this.placeOrder({
                symbol,
                side,
                amount: this.config.stakeAmount / 60000, // Very rough mock amount
                price: 60000, // Placeholder, execution.js uses current price for paper
                type: 'MARKET'
            });

            if (result.success) {
                alertService.add({
                    type: ALERT_TYPES.TRADE || ALERT_TYPES.SUCCESS,
                    priority: 10,
                    symbol: symbol.replace('USDT', ''),
                    title: `🤖 AutoPilot: ${side} Executed`,
                    description: `Automatically ${side.toLowerCase()} ${symbol} based on AI SuperScore (${score}/100).`,
                    timestamp: Date.now()
                });
            }
        } catch (err) {
            console.error('AutoPilot Trade Execution Failed:', err);
        }
    }
}

export const autoPilot = new AutoPilot();
