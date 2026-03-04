// src/services/ai/superScore.js
import { getNews } from '../providers/news';
import { getWhaleAlerts } from '../providers/whales';
import { fetchBinanceKlines } from '../providers/market';
import { rsi, ema } from '../ta/indicators';
import { alertService, ALERT_TYPES, ALERT_ACTIONS } from '../alerts/aggregator';

/**
 * Super Score Engine
 * Combines Sentiment, Whales, and TA into a single actionable score (0-100)
 */

export async function calculateSuperScore(symbol = 'BTCUSDT') {
    try {
        // 1. Fetch all data in parallel
        const [newsRes, whaleRes, klines] = await Promise.all([
            getNews(true), // AI analyzed news
            getWhaleAlerts(), // Whale movements
            fetchBinanceKlines(symbol, '1h', 100) // TA data
        ]);

        // --- A. Sentiment Score (0-100) ---
        const sentimentScore = calculateSentimentContribution(newsRes.items, symbol);

        // --- B. Whale Score (0-100) ---
        const whaleScore = calculateWhaleContribution(whaleRes, symbol);

        // --- C. TA Score (0-100) ---
        const taScore = calculateTaContribution(klines);

        // --- D. Weighted Final Score ---
        // Weights: News (40%), Whales (30%), TA (30%)
        const finalScore = Math.round(
            (sentimentScore * 0.4) +
            (whaleScore * 0.3) +
            (taScore * 0.3)
        );


        // ...

        // Determine Action
        let status = 'NEUTRAL';
        if (finalScore >= 75) status = 'STRONG BUY';
        else if (finalScore >= 60) status = 'BUY';
        else if (finalScore <= 25) status = 'STRONG SELL';
        else if (finalScore <= 40) status = 'SELL';

        // NEW: Trigger Alert if strong signal
        if (status === 'STRONG BUY' || status === 'STRONG SELL') {
            alertService.add({
                type: ALERT_TYPES.SENTIMENT,
                priority: 8,
                symbol: symbol.replace('USDT', ''),
                title: `AI Strong Signal: ${status} ${symbol.replace('USDT', '')}`,
                description: `Super Score reached ${finalScore}/100. Sentiment: ${Math.round(sentimentScore)}% | Whales: ${Math.round(whaleScore)}%`,
                action: status === 'STRONG BUY' ? ALERT_ACTIONS.BUY : ALERT_ACTIONS.SELL,
                timestamp: Date.now(),
                metadata: { price: 0 } // handled by trade modal fallback
            });
        }

        return {
            symbol,
            score: finalScore,
            status,
            details: {
                sentiment: sentimentScore,
                whales: whaleScore,
                ta: taScore
            },
            confidence: 85, // Static for now
            timestamp: Date.now()
        };
    } catch (err) {
        console.error('SuperScore calculation error:', err);
        return { symbol, score: 50, status: 'NEUTRAL', confidence: 0 };
    }
}

/**
 * Filter news for symbol and calculate sentiment score
 */
function calculateSentimentContribution(news, symbol) {
    const asset = symbol.replace('USDT', '');
    const relevant = news.filter(n =>
        n.title.toUpperCase().includes(asset) ||
        (n.tags && n.tags.map(t => t.toUpperCase()).includes(asset))
    );

    if (relevant.length === 0) return 50;

    let sum = 0;
    relevant.forEach(n => {
        if (n.sentiment === 'BULLISH') sum += 100 * (n.confidence || 0.8);
        else if (n.sentiment === 'BEARISH') sum += 0;
        else sum += 50;
    });

    return Math.round(sum / relevant.length);
}

/**
 * Calculate score based on whale inflows/outflows
 */
function calculateWhaleContribution(whales, symbol) {
    const asset = symbol.replace('USDT', '');
    const relevant = whales.filter(w => w.symbol === asset);

    if (relevant.length === 0) return 50;

    let score = 50;
    relevant.forEach(w => {
        // Outflow from exchange = BULLISH (+score)
        // Inflow to exchange = BEARISH (-score)
        if (w.transaction_type === 'outflow') score += 15;
        if (w.transaction_type === 'inflow') score -= 15;
    });

    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate Technical Analysis score (RSI + EMA)
 */
function calculateTaContribution(klines) {
    if (!klines || klines.length < 50) return 50;

    const closes = klines.map(k => k.c);
    const lastRSI = rsi(closes, 14).at(-1) || 50;
    const ema50 = ema(closes, 50).at(-1);
    const lastPrice = closes.at(-1);

    let score = 50;

    // RSI factors
    if (lastRSI < 30) score += 20; // Oversold -> Bullish
    if (lastRSI > 70) score -= 20; // Overbought -> Bearish

    // EMA factors
    if (ema50 && lastPrice > ema50) score += 15;
    if (ema50 && lastPrice < ema50) score -= 15;

    return Math.max(0, Math.min(100, score));
}

/**
 * Get Top 3 actionable signals for the dashboard
 */
export async function getTopActions() {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];
    const results = await Promise.all(symbols.map(s => calculateSuperScore(s)));

    // Sort by highest absolute deviation from 50 (most certain signals)
    return results
        .sort((a, b) => Math.abs(50 - b.score) - Math.abs(50 - a.score))
        .slice(0, 3);
}
