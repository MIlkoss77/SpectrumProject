import { useTrading } from '@/context/TradingContext';

/**
 * Unified service for executing trades in both PAPER and LIVE modes.
 * Now wraps the centralized placeOrder from TradingContext.
 */
export const useExecution = () => {
    const { placeOrder } = useTrading();
    return { placeOrder };
};
