import { askAgent } from './llmProvider';
import { searchWeb } from '../providers/webSearch';
import axios from 'axios';

/**
 * Shared state for the AI Agent's intelligence
 * This is exported so the UI can reactive to AI insights without re-fetching
 */
export const polyInsights = new Map();

class PolymarketAgent {
    constructor() {
        this.isRunning = false;
        this.logs = [];
        this.positions = []; // Mock positions for the agent's internal tracker
        this.onInsightUpdate = null;
        this.loopInterval = null;
    }

    setCallbacks(onInsight) {
        this.onInsightUpdate = onInsight;
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[PolymarketAgent][${timestamp}] ${message}`);
        this.logs.push(`[${timestamp}] ${message}`);
        if (this.logs.length > 50) this.logs.shift();
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.log("Agent Intelligence Online.");
        this.runLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.loopInterval) clearTimeout(this.loopInterval);
        this.log("Agent Intelligence Paused.");
    }

    async runLoop() {
        if (!this.isRunning) return;

        try {
            // Fetch top markets from our enriched API
            const res = await axios.get('/api/polymarket/markets?limit=10');
            const markets = res.data;

            if (markets && markets.length > 0) {
                // Focus on one trending market per cycle to save tokens/bandwidth
                const market = markets[Math.floor(Math.random() * Math.min(markets.length, 5))];
                this.log(`Analyzing: "${market.question}"`);

                const context = await searchWeb(market.question);
                
                const prompt = `
                    As an institutional analyst, evaluate this Polymarket event: "${market.question}".
                    Description: "${market.description}".
                    Recent News: "${context.slice(0, 1000)}".
                    Current Market Odds for YES: ${(market.lastTradePrice * 100).toFixed(1)}%.

                    Return exactly this JSON format:
                    {
                        "probability": 75,
                        "sentiment": 0.8,
                        "verdict": "EDGE DETECTED",
                        "reasoning": "1-sentence why"
                    }
                    Verdict options: "EDGE DETECTED", "MARKET OVERREACTION", "HIGH RISK", "AI CONFIRMED".
                `;

                const aiResponse = await askAgent(prompt);
                
                if (aiResponse && aiResponse.verdict) {
                    const insight = {
                        ...aiResponse,
                        timestamp: Date.now(),
                        marketId: market.id
                    };
                    
                    polyInsights.set(market.id, insight);
                    if (this.onInsightUpdate) this.onInsightUpdate(new Map(polyInsights));
                    this.log(`Insight stored: ${aiResponse.verdict} (${aiResponse.probability}%)`);
                }
            }
        } catch (error) {
            this.log(`Loop error: ${error.message}`);
        }

        if (this.isRunning) {
            // Analysis cycle: Every 2 minutes
            this.loopInterval = setTimeout(() => this.runLoop(), 120000);
        }
    }
}

export const agentService = new PolymarketAgent();
