import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const WebSocketContext = createContext(null)

export function useWebSocket() {
    return useContext(WebSocketContext)
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const [tickers, setTickers] = useState({})
    const [depth, setDepth] = useState({})
    const [trades, setTrades] = useState({})
    const [lastMessage, setLastMessage] = useState(null)
    const ws = useRef(null)
    const subscribers = useRef(new Set()) // Track subscribed streams

    useEffect(() => {
        connect()
        return () => {
            if (ws.current) ws.current.close()
        }
    }, [])

    const connect = () => {
        // Prevent multiple connections
        if (ws.current && ws.current.readyState !== WebSocket.CLOSED) return

        ws.current = new WebSocket(BINANCE_WS_URL)

        ws.current.onopen = () => {
            console.log('WS Connected')
            setIsConnected(true)
            // Resubscribe ALL previously requested streams
            const allStreams = Array.from(subscribers.current)
            if (allStreams.length > 0) {
                const msg = {
                    method: "SUBSCRIBE",
                    params: allStreams,
                    id: Date.now()
                }
                ws.current.send(JSON.stringify(msg))
            }
        }

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data)
            setLastMessage(message)

            // Handle Ticker Updates (Full Ticker @ticker or Mini Ticker @miniTicker)
            if (message.e === '24hrTicker' || message.e === '24hrMiniTicker') {
                const symbol = message.s.toLowerCase()
                const isFullTicker = message.e === '24hrTicker'

                setTickers(prev => ({
                    ...prev,
                    [symbol]: {
                        symbol: message.s,
                        price: parseFloat(message.c),
                        // 'P' is only in full ticker. For mini, we keep the previous value or set to 0.
                        changePercent: isFullTicker ? parseFloat(message.P) : (prev[symbol]?.changePercent || 0),
                        volume: parseFloat(message.v)
                    }
                }))
            }

            // Handle Depth Updates
            if (message.e === 'depthUpdate' || (message.lastUpdateId && !message.e)) {
                // For partial depth streams (e.g. btcusdt@depth20)
                // Binance partial depth doesn't have "e": "depthUpdate" always, sometimes just looks like this
                const symbol = message.s?.toLowerCase() || (lastMessage?.stream?.split('@')[0])
                if (symbol) {
                    setDepth(prev => ({
                        ...prev,
                        [symbol]: {
                            bids: message.b || message.bids,
                            asks: message.a || message.asks
                        }
                    }))
                }
            }

            // Handle AggTrade
            if (message.e === 'aggTrade') {
                const symbol = message.s.toLowerCase()
                setTrades(prev => {
                    const newTrade = {
                        id: message.a,
                        price: parseFloat(message.p),
                        qty: parseFloat(message.q),
                        time: message.T,
                        isBuyerMaker: message.m
                    }
                    const existing = prev[symbol] || []
                    return {
                        ...prev,
                        [symbol]: [newTrade, ...existing].slice(0, 20)
                    }
                })
            }
        }

        ws.current.onclose = (event) => {
            // Only log if it wasn't a clean close
            if (!event.wasClean) {
                console.log('WS Disconnected (Switching to polling...)', event.code)
            }
            setIsConnected(false)

            // Reconnect logic with backoff
            if (ws.current) {
                setTimeout(connect, 5000)
            }
        }

        ws.current.onerror = (err) => {
            // Keep console clean for common network interruptions
            // console.warn('WS Connection Warning')
        }
    }

    // --- 🌍 POLLING FALLBACK (When WS is down) ---
    useEffect(() => {
        let pollInterval = null;

        if (!isConnected) {
            // Wait 5 seconds before starting polling to give WS a chance to reconnect
            pollInterval = setInterval(async () => {
                try {
                    const symbols = [...subscribers.current]
                        .filter(s => s.includes('@ticker'))
                        .map(s => s.split('@')[0].toUpperCase());

                    if (symbols.length === 0) return;

                    // Fetch latest prices for all subscribed symbols via Binance REST (using proxy)
                    const resp = await fetch(`/binance-api/api/v3/ticker/24hr?symbols=${JSON.stringify(symbols)}`);
                    const data = await resp.json();

                    if (Array.isArray(data)) {
                        setTickers(prev => {
                            const newTickers = { ...prev };
                            data.forEach(item => {
                                const symbol = item.symbol.toLowerCase();
                                newTickers[symbol] = {
                                    symbol: item.symbol,
                                    price: parseFloat(item.lastPrice),
                                    changePercent: parseFloat(item.priceChangePercent),
                                    volume: parseFloat(item.volume)
                                };
                            });
                            return newTickers;
                        });
                    }
                } catch (e) {
                    // Silent fail for polling errors
                }
            }, 10000); // Poll every 10s
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [isConnected]);

    const subscribe = (streams) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
            // Add to pending subscribers
            streams.forEach(s => subscribers.current.add(s))
            return
        }

        const newStreams = streams.filter(s => !subscribers.current.has(s))
        if (newStreams.length === 0) return

        const msg = {
            method: "SUBSCRIBE",
            params: newStreams,
            id: Date.now()
        }
        ws.current.send(JSON.stringify(msg))
        newStreams.forEach(s => subscribers.current.add(s))
    }

    const unsubscribe = (streams) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return

        const msg = {
            method: "UNSUBSCRIBE",
            params: streams,
            id: Date.now()
        }
        ws.current.send(JSON.stringify(msg))
        streams.forEach(s => subscribers.current.delete(s))
    }

    return (
        <WebSocketContext.Provider value={{ isConnected, tickers, depth, trades, lastMessage, subscribe, unsubscribe }}>
            {children}
        </WebSocketContext.Provider>
    )
}
