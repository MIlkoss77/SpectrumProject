import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const WebSocketContext = createContext(null)

export function useWebSocket() {
    return useContext(WebSocketContext)
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'
const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear'

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const [isBybitConnected, setIsBybitConnected] = useState(false)
    const [tickers, setTickers] = useState({})
    const [depth, setDepth] = useState({})
    const [trades, setTrades] = useState({})
    const [lastMessage, setLastMessage] = useState(null)
    const [throughput, setThroughput] = useState(0)
    const msgCount = useRef(0)
    const wsBinance = useRef(null)

    const wsBybit = useRef(null)
    const binanceSubscribers = useRef(new Set())
    const bybitSubscribers = useRef(new Set())

    useEffect(() => {
        connectBinance()
        connectBybit()

        const interval = setInterval(() => {
          setThroughput(msgCount.current)
          msgCount.current = 0
        }, 1000)

        return () => {
            clearInterval(interval)
            if (wsBinance.current) wsBinance.current.close()
            if (wsBybit.current) wsBybit.current.close()
        }
    }, [])


    const connectBinance = () => {
        if (wsBinance.current && wsBinance.current.readyState !== WebSocket.CLOSED) return
        wsBinance.current = new WebSocket(BINANCE_WS_URL)

        wsBinance.current.onopen = () => {
            console.log('Binance WS Connected')
            setIsConnected(true)
            const streams = Array.from(binanceSubscribers.current)
            if (streams.length > 0) {
                wsBinance.current.send(JSON.stringify({ method: "SUBSCRIBE", params: streams, id: Date.now() }))
            }
        }

        wsBinance.current.onmessage = (event) => {
            msgCount.current++
            const data = JSON.parse(event.data)
            setLastMessage(data)


            // Binance Ticker
            if (data.e === '24hrTicker' || data.e === '24hrMiniTicker') {
                const symbol = data.s.toLowerCase()
                const price = parseFloat(data.c)
                const changeP = data.P ? parseFloat(data.P) : 0
                const vol = parseFloat(data.v)

                if (isNaN(price)) return prev

                setTickers(prev => ({
                    ...prev,
                    [symbol]: {
                        exchange: 'binance',
                        symbol: data.s,
                        price: price,
                        changePercent: isNaN(changeP) ? (prev[symbol]?.changePercent || 0) : changeP,
                        volume: isNaN(vol) ? 0 : vol
                    }
                }))
            }

            // Binance AggTrade
            if (data.e === 'aggTrade') {
                const symbol = data.s.toLowerCase()
                setTrades(prev => ({
                    ...prev,
                    [symbol]: [{
                        id: data.a,
                        price: parseFloat(data.p),
                        qty: parseFloat(data.q),
                        time: data.T,
                        isBuyerMaker: data.m,
                        exchange: 'binance'
                    }, ...(prev[symbol] || [])].slice(0, 20)
                }))
            }
        }

        wsBinance.current.onclose = () => {
            setIsConnected(false)
            setTimeout(connectBinance, 5000)
        }
    }

    const connectBybit = () => {
        if (wsBybit.current && wsBybit.current.readyState !== WebSocket.CLOSED) return
        wsBybit.current = new WebSocket(BYBIT_WS_URL)

        wsBybit.current.onopen = () => {
            console.log('Bybit WS Connected')
            setIsBybitConnected(true)
            const streams = Array.from(bybitSubscribers.current)
            if (streams.length > 0) {
                wsBybit.current.send(JSON.stringify({ op: 'subscribe', args: streams }))
            }
            // Keepalive
            setInterval(() => {
                if (wsBybit.current?.readyState === WebSocket.OPEN) {
                    wsBybit.current.send(JSON.stringify({ op: 'ping' }))
                }
            }, 20000)
        }

        wsBybit.current.onmessage = (event) => {
            msgCount.current++
            const msg = JSON.parse(event.data)
            if (msg.op === 'pong') return

            setLastMessage(msg)

            // Bybit Tickers
            if (msg.topic?.startsWith('tickers.')) {
                const data = msg.data
                const symbol = data.symbol.toLowerCase()
                const price = parseFloat(data.lastPrice)
                const changeP = parseFloat(data.price24hPcnt) * 100
                const vol = parseFloat(data.volume24h)

                if (isNaN(price)) return prev

                setTickers(prev => ({
                    ...prev,
                    [symbol]: {
                        exchange: 'bybit',
                        symbol: data.symbol,
                        price: price,
                        changePercent: isNaN(changeP) ? (prev[symbol]?.changePercent || 0) : changeP,
                        volume: isNaN(vol) ? 0 : vol
                    }
                }))
            }

            // Bybit Orderbook
            if (msg.topic?.startsWith('orderbook.')) {
                const symbol = msg.topic.split('.')[2].toLowerCase()
                setDepth(prev => ({
                    ...prev,
                    [symbol]: {
                        exchange: 'bybit',
                        bids: msg.data.b,
                        asks: msg.data.a
                    }
                }))
            }

            // Bybit Public Trades
            if (msg.topic?.startsWith('publicTrade.')) {
                const symbol = msg.topic.split('.')[1].toLowerCase()
                const newTrades = msg.data.map(t => ({
                    id: t.i,
                    price: parseFloat(t.p),
                    qty: parseFloat(t.v),
                    time: t.T,
                    isBuyerMaker: t.side === 'Sell',
                    exchange: 'bybit'
                }))
                setTrades(prev => ({
                    ...prev,
                    [symbol]: [...newTrades, ...(prev[symbol] || [])].slice(0, 20)
                }))
            }
        }

        wsBybit.current.onclose = () => {
            setIsBybitConnected(false)
            setTimeout(connectBybit, 5000)
        }
    }

    const subscribe = (streams, exchange = 'binance') => {
        if (exchange === 'binance') {
            streams.forEach(s => binanceSubscribers.current.add(s))
            if (wsBinance.current?.readyState === WebSocket.OPEN) {
                wsBinance.current.send(JSON.stringify({ method: "SUBSCRIBE", params: streams, id: Date.now() }))
            }
        } else if (exchange === 'bybit') {
            streams.forEach(s => bybitSubscribers.current.add(s))
            if (wsBybit.current?.readyState === WebSocket.OPEN) {
                wsBybit.current.send(JSON.stringify({ op: 'subscribe', args: streams }))
            }
        }
    }

    const unsubscribe = (streams, exchange = 'binance') => {
        if (exchange === 'binance') {
            streams.forEach(s => binanceSubscribers.current.delete(s))
            if (wsBinance.current?.readyState === WebSocket.OPEN) {
                wsBinance.current.send(JSON.stringify({ method: "UNSUBSCRIBE", params: streams, id: Date.now() }))
            }
        } else if (exchange === 'bybit') {
            streams.forEach(s => bybitSubscribers.current.delete(s))
            if (wsBybit.current?.readyState === WebSocket.OPEN) {
                wsBybit.current.send(JSON.stringify({ op: 'unsubscribe', args: streams }))
            }
        }
    }

    return (
        <WebSocketContext.Provider value={{
            isConnected: isConnected || isBybitConnected,
            isBinanceConnected: isConnected,
            isBybitConnected,
            tickers,
            depth,
            trades,
            lastMessage,
            throughput,
            subscribe,
            unsubscribe

        }}>
            {children}
        </WebSocketContext.Provider>
    )
}

