import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { autoPilot } from '../services/trading/autoPilot';

const TradingContext = createContext();

export function TradingProvider({ children }) {
    const [tradingMode, setTradingMode] = useState(() => localStorage.getItem('trading.mode') || 'PAPER');
    const [apiKeys, setApiKeys] = useState(() => {
        try {
            const saved = localStorage.getItem('trading.api_keys');
            return saved ? JSON.parse(saved) : { binance: { key: '', secret: '' }, bybit: { key: '', secret: '' }, mexc: { key: '', secret: '' } };
        } catch (e) {
            console.warn("Corrupted API keys in localStorage, resetting.");
            return { binance: { key: '', secret: '' }, bybit: { key: '', secret: '' }, mexc: { key: '', secret: '' } };
        }
    });

    // Paper Trading Balances & Positions
    const [paperState, setPaperState] = useState(() => {
        try {
            const saved = localStorage.getItem('trading.paper_state');
            return saved ? JSON.parse(saved) : { balance: 10000, positions: [], history: [] };
        } catch (e) {
            console.warn("Corrupted paper state in localStorage, resetting.");
            return { balance: 10000, positions: [], history: [] };
        }
    });

    const [isAutoPilotActive, setIsAutoPilotActive] = useState(false);

    useEffect(() => {
        localStorage.setItem('trading.mode', tradingMode);
    }, [tradingMode]);

    useEffect(() => {
        localStorage.setItem('trading.api_keys', JSON.stringify(apiKeys));
    }, [apiKeys]);

    useEffect(() => {
        localStorage.setItem('trading.paper_state', JSON.stringify(paperState));
    }, [paperState]);

    const toggleMode = () => {
        setTradingMode(prev => prev === 'PAPER' ? 'LIVE' : 'PAPER');
    };

    const updateApiKeys = (exchange, keys) => {
        setApiKeys(prev => ({
            ...prev,
            [exchange]: keys
        }));
    };

    const resetPaperTrading = () => {
        setPaperState({ balance: 10000, positions: [], history: [] });
    };

    /**
     * Unified placeOrder function moved from hook to context for AutoPilot accessibility
     */
    const placeOrder = useCallback(async (params) => {
        const { symbol, side, amount, price, type = 'MARKET' } = params;
        const timestamp = Date.now();

        if (tradingMode === 'PAPER') {
            // Paper Trade Logic
            const cost = amount * (price || 0);
            if (side === 'BUY' && cost > paperState.balance) {
                throw new Error('Insufficient virtual balance');
            }

            const newTrade = {
                id: `paper_${Math.random().toString(36).substr(2, 9)}`,
                symbol, side, amount, price, type, timestamp,
                status: 'FILLED',
                executedPrice: price
            };

            setPaperState(prev => {
                const newBalance = side === 'BUY' ? prev.balance - cost : prev.balance + cost;

                // Update positions helper logic inline for simplicity here
                let newPositions = [...prev.positions];
                const existing = newPositions.find(p => p.symbol === symbol);

                if (!existing) {
                    if (side === 'BUY') newPositions.push({ symbol, amount, avgPrice: price });
                } else {
                    if (side === 'BUY') {
                        const totalAmount = existing.amount + amount;
                        const avgPrice = (existing.amount * existing.avgPrice + amount * price) / totalAmount;
                        newPositions = newPositions.map(p => p.symbol === symbol ? { ...p, amount: totalAmount, avgPrice } : p);
                    } else {
                        const newAmount = existing.amount - amount;
                        if (newAmount <= 0) newPositions = newPositions.filter(p => p.symbol !== symbol);
                        else newPositions = newPositions.map(p => p.symbol === symbol ? { ...p, amount: newAmount } : p);
                    }
                }

                return {
                    ...prev,
                    balance: newBalance,
                    history: [newTrade, ...prev.history],
                    positions: newPositions
                };
            });

            return { success: true, orderId: newTrade.id };
        } else {
            // Live Trade Placeholder
            throw new Error('Live trading execution is not yet fully configured. Please check API settings.');
        }
    }, [tradingMode, paperState, setPaperState]);

    // AutoPilot lifecycle
    useEffect(() => {
        if (isAutoPilotActive) {
            // Start AutoPilot
            autoPilot.start(placeOrder, paperState);
        } else {
            // Stop AutoPilot
            autoPilot.stop();
        }

        return () => {
            if (isAutoPilotActive) autoPilot.stop();
        };
    }, [isAutoPilotActive]); // Only depend on active status to avoid frequent restarts

    return (
        <TradingContext.Provider value={{
            tradingMode,
            setTradingMode,
            toggleMode,
            apiKeys,
            updateApiKeys,
            paperState,
            setPaperState,
            resetPaperTrading,
            placeOrder,
            isAutoPilotActive,
            setIsAutoPilotActive
        }}>
            {children}
        </TradingContext.Provider>
    );
}

export const useTrading = () => useContext(TradingContext);
