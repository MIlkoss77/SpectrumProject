import { askAgent } from './llmProvider';
import { getTopActiveMarkets } from '../providers/polymarket';
import { searchWeb } from '../providers/webSearch';

class PolymarketAgent {
    constructor() {
        this.isRunning = false;
        this.logs = [];
        this.positions = [];
        this.onLogCallback = null;
        this.onPositionCallback = null;
        this.loopInterval = null;
    }

    setCallbacks(onLog, onPosition) {
        this.onLogCallback = onLog;
        this.onPositionCallback = onPosition;
    }

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const formatted = `[${timestamp}] ${message}`;
        this.logs.push(formatted);
        if (this.onLogCallback) {
            this.onLogCallback([...this.logs]);
        }
    }

    addPosition(pos) {
        this.positions.push(pos);
        if (this.onPositionCallback) {
            this.onPositionCallback([...this.positions]);
        }
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.logs = [];
        this.log("Agent started... initializing core loop.");

        this.runLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.loopInterval) {
            clearTimeout(this.loopInterval);
        }
        this.log("Agent paused.");
    }

    async runLoop() {
        if (!this.isRunning) return;

        try {
            this.log("Fetching top active Polymarket events...");
            const markets = await getTopActiveMarkets(5);

            if (!markets || markets.length === 0) {
                this.log("No markets found. Retrying in 30s...");
                this.loopInterval = setTimeout(() => this.runLoop(), 30000);
                return;
            }

            // Pick a random market from the top 5 to analyze
            const market = markets[Math.floor(Math.random() * markets.length)];
            this.log(`Analyzing market: "${market.title}" (Current Odds: ${market.odds}%)`);
            this.log(`Gathering real-time context from the web for: ${market.title}...`);

            // Fetch real context
            const context = await searchWeb(market.title);

            const preview = context.length > 50 ? context.substring(0, 47) + '...' : context;
            this.log(`Context gathered (${preview}). Asking LLM...`);

            const prompt = `
        You are an expert prediction market analyst. 
        Analyze this market: "${market.title}". 
        Description: "${market.description}".
        
        Recent News/Context from Web Search:
        """
        ${context}
        """

        Current Polymarket odds for "Yes" are ${market.odds}%.
        Do you think the true probability is higher or lower based on the fresh context?
        Respond with ONLY JSON in this exact format, with reasoning explaining the impact of the news:
        { "probability": 75, "reasoning": "Brief 1-sentence explanation" }
      `;

            const aiResponse = await askAgent(prompt);

            if (!aiResponse || typeof aiResponse.probability !== 'number') {
                throw new Error("Invalid LLM response. Could not parse probability.");
            }

            this.log(`LLM reasoning: "${aiResponse.reasoning}"`);
            this.log(`My calculated probability: ${aiResponse.probability}% vs Market: ${market.odds}%`);

            const edge = aiResponse.probability - market.odds;
            if (Math.abs(edge) > 10) {
                this.log(`Edge detected (${edge > 0 ? '+' : ''}${edge}%). Executing mock trade...`);

                // Execute mock trade
                const tradeSize = 100; // $100 mock
                const position = {
                    id: Date.now(),
                    market: market.title,
                    targetProb: aiResponse.probability,
                    purchasedOdds: market.odds,
                    holdings: `$${tradeSize}`,
                    pnl: '$0.00' // mock initial
                };

                this.addPosition(position);
                this.log(`Trade executed for ${market.title}.`);
            } else {
                this.log(`No significant edge (diff: ${edge}%). Skipping trade.`);
            }

        } catch (error) {
            this.log(`Error in agent loop: ${error.message}`);
        }

        if (this.isRunning) {
            this.log("Sleeping for 15 seconds before next analysis...");
            this.loopInterval = setTimeout(() => this.runLoop(), 15000);
        }
    }
}

export const agentService = new PolymarketAgent();
