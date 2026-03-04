import React, { useEffect, useState, useMemo } from 'react';
import { useWebSocket } from '@/context/WebSocketContext';
import { Activity } from 'lucide-react';

export default function Orderbook({ symbol = 'BTCUSDT' }) {
    const { subscribe, unsubscribe, depth, tickers } = useWebSocket();
    const lSymbol = symbol.toLowerCase();

    useEffect(() => {
        const streams = [`${lSymbol}@depth20@100ms`];
        subscribe(streams);
        return () => unsubscribe(streams);
    }, [lSymbol]);

    const data = depth[lSymbol] || { bids: [], asks: [] };
    const currentPrice = tickers[lSymbol]?.price || 0;

    // Calculate max volume for depth bar scaling
    const maxVolume = useMemo(() => {
        const allLevels = [...(data.bids || []), ...(data.asks || [])];
        if (allLevels.length === 0) return 1;
        return Math.max(...allLevels.map(l => parseFloat(l[1])));
    }, [data]);

    return (
        <div className="dx-card orderbook-card" style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-cyan-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/70">Live Orderbook</h3>
                </div>
                <div className="text-[10px] font-bold text-cyan-400 py-0.5 px-2 rounded bg-cyan-400/10 border border-cyan-400/20">
                    {symbol}
                </div>
            </div>

            <div className="orderbook-grid flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', fontFamily: 'monospace' }}>
                {/* Header */}
                <div className="flex justify-between text-white/30 font-bold mb-2 uppercase text-[9px]">
                    <span>Price</span>
                    <span>Amount</span>
                </div>

                {/* Asks (Sells) - Reversed to show lowest ask closest to mid */}
                <div className="asks-section" style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1px' }}>
                    {data.asks?.slice(0, 8).map((ask, i) => {
                        const price = parseFloat(ask[0]);
                        const amount = parseFloat(ask[1]);
                        const width = (amount / maxVolume) * 100;
                        return (
                            <div key={`ask-${i}`} className="order-row relative flex justify-between py-0.5 px-1 hover:bg-white/5 transition-colors">
                                <div className="depth-bar absolute right-0 top-0 bottom-0 bg-red-500/10" style={{ width: `${width}%`, transition: 'width 0.3s ease' }} />
                                <span className="relative z-10 text-red-400">{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="relative z-10 text-white/50">{amount.toFixed(3)}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Mid Price */}
                <div className="mid-price-row py-3 my-1 border-y border-white/5 flex items-center justify-center gap-3">
                    <span className="text-lg font-bold text-white">
                        {currentPrice ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 1 }) : '---'}
                    </span>
                    <span className="text-[10px] text-white/30 uppercase font-black">USDT</span>
                </div>

                {/* Bids (Buys) */}
                <div className="bids-section" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {data.bids?.slice(0, 8).map((bid, i) => {
                        const price = parseFloat(bid[0]);
                        const amount = parseFloat(bid[1]);
                        const width = (amount / maxVolume) * 100;
                        return (
                            <div key={`bid-${i}`} className="order-row relative flex justify-between py-0.5 px-1 hover:bg-white/5 transition-colors">
                                <div className="depth-bar absolute right-0 top-0 bottom-0 bg-cyan-500/10" style={{ width: `${width}%`, transition: 'width 0.3s ease' }} />
                                <span className="relative z-10 text-cyan-400">{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                <span className="relative z-10 text-white/50">{amount.toFixed(3)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between opacity-30">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20" />
                <span className="text-[8px] mx-2 font-bold tracking-tighter uppercase text-white/50">Depth 20 Levels (Binance)</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20" />
            </div>
        </div>
    );
}
