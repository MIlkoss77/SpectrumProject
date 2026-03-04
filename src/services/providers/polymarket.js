
const BASE_URL = 'https://gamma-api.polymarket.com';

// Cache to prevent rate limits
let cache = {
    data: null,
    timestamp: 0
};

export async function getPolymarketOdds(keyword = 'Bitcoin') {
    // Return cached if < 5 min old
    if (Date.now() - cache.timestamp < 300000 && cache.data) {
        return cache.data;
    }

    try {
        // Search for active markets related to the keyword (e.g. "Bitcoin", "Ethereum")
        // Sorted by volume to get the most liquid/accurate markets
        const response = await fetch(`${BASE_URL}/events?limit=5&active=true&closed=false&order=volume&q=${keyword}`);

        if (!response.ok) throw new Error('Polymarket API Error');

        const data = await response.json();

        // Find the most relevant market (highest volume)
        // Note: The API structure returns events which contain markets.
        // We look for binary markets (Yes/No).

        let bestMarket = null;
        let maxVol = -1;

        if (data && Array.isArray(data)) {
            data.forEach(event => {
                if (event.markets) {
                    event.markets.forEach(m => {
                        // We want high volume predictions
                        if (m.volume > maxVol && m.outcomes && m.outcomes.length === 2) {
                            maxVol = m.volume;
                            bestMarket = m;
                        }
                    });
                }
            });
        }

        let odds = 50; // Neutral default
        let title = "Polymarket Prediction";

        if (bestMarket) {
            // Polymarket usually returns outcome prices as strings "0.65"
            // outcome[0] is typically "Yes" or the primary outcome, but we need to check groupItemTitle or similar labels if available.
            // For simple "Will BTC hit X" markets, index 0 is usually "Yes".
            // We use the JSON 'outcomePrices' array.

            try {
                const prices = JSON.parse(bestMarket.outcomePrices);
                const yesPrice = parseFloat(prices[0]); // assuming [Yes, No]
                odds = Math.round(yesPrice * 100);
                title = bestMarket.question;
            } catch (e) {
                console.warn('Failed to parse odds', e);
            }
        }

        const result = {
            odds,
            title,
            volume: maxVol
        };

        cache.data = result;
        cache.timestamp = Date.now();

        return result;

    } catch (error) {
        console.error("Polymarket Service Error:", error);
        return { odds: 50, title: "Market Unavailable", volume: 0 };
    }
}

export async function getTopActiveMarkets(limit = 10) {
    try {
        const response = await fetch(`${BASE_URL}/events?limit=${limit}&active=true&closed=false&order=volume`);
        if (!response.ok) throw new Error('Polymarket API Error');
        const data = await response.json();

        let topMarkets = [];
        if (data && Array.isArray(data)) {
            data.forEach(event => {
                if (event.markets) {
                    event.markets.forEach(m => {
                        if (m.outcomes && m.outcomes.length === 2 && m.volume > 0) {
                            try {
                                const prices = JSON.parse(m.outcomePrices);
                                const yesPrice = parseFloat(prices[0]);
                                topMarkets.push({
                                    id: m.id,
                                    title: m.question,
                                    volume: m.volume,
                                    odds: Math.round(yesPrice * 100),
                                    description: event.description || ''
                                });
                            } catch (e) { }
                        }
                    });
                }
            });
        }

        topMarkets.sort((a, b) => b.volume - a.volume);
        return topMarkets.slice(0, limit);
    } catch (error) {
        console.error("Polymarket getTopActiveMarkets Error:", error);
        return [];
    }
}
