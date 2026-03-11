import axios from 'axios';
import ccxt from 'ccxt';

export const fetchBybitTicker = async (symbol) => {
    const endpoints = ['api.bybit.com', 'api.bytick.com'];
    const categories = ['spot', 'linear'];

    for (const host of endpoints) {
        for (const cat of categories) {
            try {
                const url = `https://${host}/v5/market/tickers?category=${cat}&symbol=${symbol}`;
                const response = await axios.get(url, {
                    timeout: 2000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                });

                if (response.data.retCode === 0 && response.data.result.list && response.data.result.list.length > 0) {
                    return parseFloat(response.data.result.list[0].lastPrice);
                }
            } catch (err) {
                console.warn(`Bybit Attempt Failed: ${host}/${cat}/${symbol} - ${err.message}`);
            }
        }
    }
    throw new Error(`Could not fetch ${symbol} from Bybit after multiple attempts`);
};

export const fetchPortfolioBalance = async (exchangeId, apiKey, secret) => {
    if (!ccxt.exchanges.includes(exchangeId)) {
        throw new Error('Unsupported exchange');
    }

    const exchangeClass = ccxt[exchangeId];
    const exchange = new exchangeClass({
        apiKey: apiKey,
        secret: secret,
        enableRateLimit: true,
    });

    const balance = await exchange.fetchBalance();
    const assets = [];
    let totalUsdValue = 0;

    for (const [symbol, amount] of Object.entries(balance.total)) {
        if (amount > 0) {
            let priceUsd = 0;
            try {
                if (symbol === 'USDT' || symbol === 'USDC') priceUsd = 1;
                else {
                    const ticker = await exchange.fetchTicker(`${symbol}/USDT`).catch(() => null);
                    if (ticker) priceUsd = ticker.last;
                }
            } catch (e) {
                console.log(`Could not fetch price for ${symbol}`);
            }

            const valueUsd = amount * priceUsd;
            totalUsdValue += valueUsd;

            assets.push({
                symbol,
                amount,
                priceUsd,
                valueUsd
            });
        }
    }

    assets.sort((a, b) => b.valueUsd - a.valueUsd);

    return {
        totalUsdValue,
        assets
    };
};
