
const BASE_URL = 'https://gamma-api.polymarket.com';

// Cache to prevent rate limits
let cache = {
    data: null,
    timestamp: 0
};

export async function getPolymarketOdds(keyword = 'Bitcoin') {
    return { odds: 50, title: "Market Unavailable", volume: 0 };
}

export async function getTopActiveMarkets(limit = 10) {
    return [];
}
