import React, { createContext, useContext, useState } from 'react'

const TradeContext = createContext(null)

export function useTrade() {
    const context = useContext(TradeContext)
    // Return safe defaults if context is not available
    if (!context) {
        return {
            isOpen: false,
            activeAsset: null,
            openTrade: (asset) => {
                console.log('[Trade] Opening trade for:', asset.symbol, 'at', asset.price)
                // Fallback: open external exchange link
                window.open(`https://www.binance.com/en/trade/${asset.symbol}_USDT?type=spot`, '_blank')
            },
            closeTrade: () => { }
        }
    }
    return context
}

export function TradeProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeAsset, setActiveAsset] = useState(null) // { symbol: 'BTC', price: 65000, action: 'BUY' }

    const openTrade = (asset) => {
        setActiveAsset(asset)
        setIsOpen(true)
    }

    const closeTrade = () => {
        setIsOpen(false)
        setActiveAsset(null)
    }

    return (
        <TradeContext.Provider value={{ isOpen, activeAsset, openTrade, closeTrade }}>
            {children}
        </TradeContext.Provider>
    )
}
