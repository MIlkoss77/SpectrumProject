/**
 * opportunityEngine.js — Smart Opportunity Engine
 * 
 * Automatically generates actionable trading opportunities
 * based on technical analysis, funding rates, and market conditions.
 * Pushes alerts to the AlertAggregator.
 */

import { alertService, ALERT_TYPES, ALERT_ACTIONS } from '@/services/alerts/aggregator';

// ──── Configuration ────
const LEVERAGE_TIERS = [5, 10, 25, 50, 100];

const ASSETS = [
    { symbol: 'BTC', fullSymbol: 'BTCUSDT', basePrice: 97500, volatility: 0.028, fundingBase: 0.0001 },
    { symbol: 'ETH', fullSymbol: 'ETHUSDT', basePrice: 3420, volatility: 0.035, fundingBase: 0.00015 },
    { symbol: 'SOL', fullSymbol: 'SOLUSDT', basePrice: 148, volatility: 0.055, fundingBase: 0.0003 },
    { symbol: 'BNB', fullSymbol: 'BNBUSDT', basePrice: 605, volatility: 0.022, fundingBase: 0.00008 },
    { symbol: 'TON', fullSymbol: 'TONUSDT', basePrice: 5.8, volatility: 0.045, fundingBase: 0.0002 },
];

const STAKING_POOLS = [
    { asset: 'USDT', apy: 12.5, term: 'Flexible', risk: 'Low' },
    { asset: 'ETH', apy: 4.2, term: 'Locked', risk: 'Low' },
    { asset: 'SOL', apy: 8.5, term: '30 Days', risk: 'Medium' },
    { asset: 'TON', apy: 15.0, term: '90 Days', risk: 'Medium' },
];

// ──── PnL Calculator Core ────

/**
 * Calculate PnL scenarios for different leverage tiers
 */
export function calculateLeveragePnL({ entry, target, investment = 1000, direction = 'LONG' }) {
    const priceDelta = direction === 'LONG' ? (target - entry) / entry : (entry - target) / entry;

    return LEVERAGE_TIERS.map(leverage => {
        const pnl = investment * leverage * priceDelta;
        const pnlPercent = priceDelta * leverage * 100;
        const liquidationPrice = direction === 'LONG'
            ? entry * (1 - 1 / leverage)
            : entry * (1 + 1 / leverage);
        const marginRequired = investment;
        const positionSize = investment * leverage;

        return {
            leverage,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100,
            liquidationPrice: Math.round(liquidationPrice * 100) / 100,
            marginRequired,
            positionSize,
            risk: leverage >= 50 ? 'EXTREME' : leverage >= 25 ? 'HIGH' : leverage >= 10 ? 'MEDIUM' : 'LOW',
        };
    });
}

/**
 * Calculate funding rate earnings/costs
 */
export function calculateFundingImpact({ positionSize, fundingRate, hoursHeld = 8 }) {
    const periods = hoursHeld / 8; // Funding is paid every 8 hours
    const totalFunding = positionSize * fundingRate * periods;
    return {
        perPeriod: Math.round(positionSize * fundingRate * 100) / 100,
        total: Math.round(totalFunding * 100) / 100,
        periods: Math.floor(periods),
        annualized: Math.round(fundingRate * 3 * 365 * 100 * 100) / 100, // 3 per day × 365
    };
}

/**
 * Calculate staking yield
 */
export function calculateStakingYield({ amount, apy, days = 365 }) {
    const dailyRate = apy / 100 / 365;
    const earned = amount * dailyRate * days;
    return {
        daily: Math.round(amount * dailyRate * 100) / 100,
        monthly: Math.round(amount * dailyRate * 30 * 100) / 100,
        yearly: Math.round(earned * 100) / 100,
        apy,
    };
}

// ──── Market Simulation ────

function simulateMarketConditions(asset) {
    const noise = (Math.random() - 0.5) * 2;
    const rsi = 30 + Math.random() * 40 + noise * 15;  // 15-85 range
    const trend = Math.random() > 0.5 ? 'UP' : 'DOWN';
    const volume = 0.5 + Math.random() * 1.5; // 0.5x to 2x normal
    const fundingRate = asset.fundingBase * (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 3);
    const priceDeviation = (Math.random() - 0.5) * asset.volatility;
    const currentPrice = asset.basePrice * (1 + priceDeviation);

    return {
        ...asset,
        currentPrice: Math.round(currentPrice * 100) / 100,
        rsi: Math.round(rsi * 10) / 10,
        trend,
        volumeMultiplier: Math.round(volume * 10) / 10,
        fundingRate: Math.round(fundingRate * 10000) / 10000,
        whaleActivity: Math.random() > 0.7, // 30% chance
    };
}

// ──── Opportunity Detection ────

function detectOpportunities(market) {
    const opps = [];
    const investment = 1000;

    // 1. Leverage Long Opportunity (RSI oversold + uptrend signals)
    if (market.rsi < 35) {
        const targetMove = market.volatility * (0.5 + Math.random() * 0.5);
        const target = Math.round(market.currentPrice * (1 + targetMove) * 100) / 100;
        const pnlScenarios = calculateLeveragePnL({
            entry: market.currentPrice,
            target,
            investment,
            direction: 'LONG',
        });
        const bestScenario = pnlScenarios.find(s => s.leverage === 25);

        opps.push({
            type: 'LEVERAGE_LONG',
            symbol: market.symbol,
            direction: 'LONG',
            entry: market.currentPrice,
            target,
            stopLoss: Math.round(market.currentPrice * (1 - targetMove * 0.5) * 100) / 100,
            rsi: market.rsi,
            confidence: Math.min(95, Math.round(70 + (35 - market.rsi) * 1.5)),
            pnlScenarios,
            bestLeverage: 25,
            bestPnl: bestScenario?.pnl || 0,
            reason: `RSI at ${market.rsi} (oversold) on ${market.symbol}. Reversal likely. Target +${(targetMove * 100).toFixed(1)}%.`,
        });
    }

    // 2. Leverage Short Opportunity (RSI overbought)
    if (market.rsi > 72) {
        const targetMove = market.volatility * (0.3 + Math.random() * 0.4);
        const target = Math.round(market.currentPrice * (1 - targetMove) * 100) / 100;
        const pnlScenarios = calculateLeveragePnL({
            entry: market.currentPrice,
            target,
            investment,
            direction: 'SHORT',
        });
        const bestScenario = pnlScenarios.find(s => s.leverage === 10);

        opps.push({
            type: 'LEVERAGE_SHORT',
            symbol: market.symbol,
            direction: 'SHORT',
            entry: market.currentPrice,
            target,
            stopLoss: Math.round(market.currentPrice * (1 + targetMove * 0.5) * 100) / 100,
            rsi: market.rsi,
            confidence: Math.min(90, Math.round(60 + (market.rsi - 70) * 2)),
            pnlScenarios,
            bestLeverage: 10,
            bestPnl: bestScenario?.pnl || 0,
            reason: `RSI at ${market.rsi} (overbought). Correction expected. Target -${(targetMove * 100).toFixed(1)}%.`,
        });
    }

    // 3. Funding Rate Opportunity
    if (Math.abs(market.fundingRate) > 0.0003) {
        const isNegative = market.fundingRate < 0;
        const fundingImpact = calculateFundingImpact({
            positionSize: investment * 10,
            fundingRate: Math.abs(market.fundingRate),
            hoursHeld: 24,
        });

        opps.push({
            type: 'FUNDING_RATE',
            symbol: market.symbol,
            fundingRate: market.fundingRate,
            direction: isNegative ? 'LONG' : 'SHORT',
            fundingImpact,
            confidence: Math.min(85, Math.round(60 + Math.abs(market.fundingRate) * 10000)),
            reason: `${market.symbol} funding ${isNegative ? 'negative' : 'positive'} at ${(market.fundingRate * 100).toFixed(4)}%. ${isNegative ? 'Shorts paying longs — accumulate' : 'Longs overpaying — consider hedge'}. Earn $${fundingImpact.total}/day on $10K.`,
        });
    }

    // 4. Whale Activity Opportunity
    if (market.whaleActivity && market.volumeMultiplier > 1.3) {
        opps.push({
            type: 'WHALE_FLOW',
            symbol: market.symbol,
            direction: market.trend === 'UP' ? 'LONG' : 'SHORT',
            volumeMultiplier: market.volumeMultiplier,
            confidence: Math.round(55 + market.volumeMultiplier * 15),
            reason: `Whale flow detected on ${market.symbol}. Volume ${market.volumeMultiplier}x normal. Smart money ${market.trend === 'UP' ? 'accumulating' : 'distributing'}.`,
        });
    }

    return opps;
}

// ──── Push to Alert System ────

function pushOpportunityAlert(opp) {
    const actionMap = {
        LEVERAGE_LONG: ALERT_ACTIONS.BUY,
        LEVERAGE_SHORT: ALERT_ACTIONS.SELL,
        FUNDING_RATE: ALERT_ACTIONS.MONITOR,
        WHALE_FLOW: opp.direction === 'LONG' ? ALERT_ACTIONS.BUY : ALERT_ACTIONS.SELL,
        STAKING_YIELD: 'STAKE',
    };

    const titleMap = {
        LEVERAGE_LONG: `🚀 ${opp.symbol} Long ${opp.bestLeverage}x → +$${Math.abs(opp.bestPnl).toLocaleString()} on $1K`,
        LEVERAGE_SHORT: `📉 ${opp.symbol} Short ${opp.bestLeverage}x → +$${Math.abs(opp.bestPnl).toLocaleString()} on $1K`,
        FUNDING_RATE: `💰 ${opp.symbol} Funding ${opp.direction}: Earn $${opp.fundingImpact?.total || 0}/day`,
        WHALE_FLOW: `🐋 ${opp.symbol} Whale ${opp.direction} Flow — Volume ${opp.volumeMultiplier}x`,
        STAKING_YIELD: `🏦 Stake ${opp.asset}: ${opp.apy}% APY, +$${opp.stakingYield?.monthly || 0}/mo`,
    };

    alertService.add({
        type: ALERT_TYPES.OPPORTUNITY || ALERT_TYPES.TA,
        priority: Math.min(10, Math.round(opp.confidence / 12)),
        symbol: opp.symbol || opp.asset,
        title: titleMap[opp.type] || `Opportunity: ${opp.symbol}`,
        description: opp.reason,
        action: actionMap[opp.type] || ALERT_ACTIONS.MONITOR,
        metadata: {
            opportunityType: opp.type,
            entry: opp.entry,
            target: opp.target,
            stopLoss: opp.stopLoss,
            direction: opp.direction,
            leverage: opp.bestLeverage,
            pnlScenarios: opp.pnlScenarios,
            fundingRate: opp.fundingRate,
            fundingImpact: opp.fundingImpact,
            confidence: opp.confidence,
            rsi: opp.rsi,
        },
    });
}

// ──── Staking Opportunities ────

function generateStakingOpps() {
    const opps = [];
    for (const pool of STAKING_POOLS) {
        if (pool.apy > 8) { // Only alert for notable APY
            const amount = 2000 + Math.round(Math.random() * 3000);
            const stakingYield = calculateStakingYield({ amount, apy: pool.apy });
            opps.push({
                type: 'STAKING_YIELD',
                asset: pool.asset,
                apy: pool.apy,
                term: pool.term,
                risk: pool.risk,
                amount,
                stakingYield,
                confidence: pool.risk === 'Low' ? 90 : 70,
                reason: `${pool.asset} ${pool.term} staking at ${pool.apy}% APY. Invest $${amount.toLocaleString()} → earn $${stakingYield.monthly}/month, $${stakingYield.yearly}/year. Risk: ${pool.risk}.`,
            });
        }
    }
    return opps;
}

// ──── Engine Runner ────

class OpportunityEngine {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.lastOpportunities = [];
        this.scanInterval = 30000; // 30s between scans
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        // Initial scan
        this.scan();

        // Periodic scanning
        this.intervalId = setInterval(() => this.scan(), this.scanInterval);
        console.log('[OpportunityEngine] Started — scanning every 30s');
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.isRunning = false;
        console.log('[OpportunityEngine] Stopped');
    }

    scan() {
        const allOpps = [];

        // Scan each asset
        for (const asset of ASSETS) {
            const market = simulateMarketConditions(asset);
            const opps = detectOpportunities(market);
            allOpps.push(...opps);
        }

        // Add staking opportunities (less frequently)
        if (Math.random() > 0.7) {
            allOpps.push(...generateStakingOpps());
        }

        // Sort by confidence and take top opportunities
        allOpps.sort((a, b) => b.confidence - a.confidence);
        const topOpps = allOpps.slice(0, 3);

        // Push to alert system
        for (const opp of topOpps) {
            pushOpportunityAlert(opp);
        }

        this.lastOpportunities = topOpps;
        return topOpps;
    }

    getLastOpportunities() {
        return this.lastOpportunities;
    }
}

// Singleton
export const opportunityEngine = new OpportunityEngine();

// Export for widgets
export { LEVERAGE_TIERS, ASSETS, STAKING_POOLS };
