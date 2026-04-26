import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const WebSocketContext = createContext(null)

export function useWebSocket() {
    return useContext(WebSocketContext)
}

const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws'
const BYBIT_WS_URL = 'wss://stream.bybit.com/v5/public/linear'
const MEXC_WS_URL = 'wss://wbs-api.mexc.com/ws'

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const [isBybitConnected, setIsBybitConnected] = useState(false)
    const [isMexcConnected, setIsMexcConnected] = useState(false)
    const [tickers, setTickers] = useState({})
    const [depth, setDepth] = useState({})
    const [trades, setTrades] = useState({})
    const lastMessageRef = useRef(null)
    const [throughput, setThroughput] = useState(0)
    const msgCount = useRef(0)
    
    const wsBinance = useRef(null)
    const wsBybit = useRef(null)
    const wsMexc = useRef(null)
    
    const binanceSubscribers = useRef(new Set())
    const bybitSubscribers = useRef(new Set())
    const mexcSubscribers = useRef(new Set())

    const reconnectDelay = useRef({ binance: 1000, bybit: 1000, mexc: 1000 })
    const MAX_DELAY = 60000
    const bybitPingRef = useRef(null)
    const mexcPingRef = useRef(null)

    // High performance buffers to prevent React re-render thrashing
    const tickersBuffer = useRef({})
    const depthBuffer = useRef({})
    const tradesBuffer = useRef({})

    useEffect(() => {
        connectBinance()
        connectBybit()
        connectMexc()

        // 300ms Throttle Loop (3.3 FPS UI updates)
        const interval = setInterval(() => {
          setThroughput(Math.round(msgCount.current * (1000/300)))
          msgCount.current = 0

          // Flush Tickers
          if (Object.keys(tickersBuffer.current).length > 0) {
              setTickers(prev => {
                  const nextResult = { ...prev }
                  for (let sym in tickersBuffer.current) {
                      const update = tickersBuffer.current[sym];
                      nextResult[sym] = {
                          ...nextResult[sym],
                          ...update,
                          changePercent: update.changePercent !== undefined ? update.changePercent : nextResult[sym]?.changePercent,
                          volume: update.volume !== undefined ? update.volume : nextResult[sym]?.volume,
                      }
                  }
                  return nextResult
              })
              tickersBuffer.current = {}
          }

          // Flush Depth
          if (Object.keys(depthBuffer.current).length > 0) {
              setDepth(prev => ({...prev, ...depthBuffer.current}))
              depthBuffer.current = {}
          }

          // Flush Trades
          if (Object.keys(tradesBuffer.current).length > 0) {
              setTrades(prev => {
                  const nextTrades = {...prev}
                  for (let sym in tradesBuffer.current) {
                      nextTrades[sym] = [...tradesBuffer.current[sym], ...(nextTrades[sym] || [])].slice(0, 20)
                  }
                  return nextTrades
              })
              tradesBuffer.current = {}
          }

        }, 300)

        return () => {
            clearInterval(interval)
            if (bybitPingRef.current) clearInterval(bybitPingRef.current)
            if (mexcPingRef.current) clearInterval(mexcPingRef.current)
            if (wsBinance.current) wsBinance.current.close()
            if (wsBybit.current) wsBybit.current.close()
            if (wsMexc.current) wsMexc.current.close()
        }
    }, [])


    const connectBinance = () => {
        if (wsBinance.current && wsBinance.current.readyState !== WebSocket.CLOSED) return
        wsBinance.current = new WebSocket(BINANCE_WS_URL)

        wsBinance.current.onopen = () => {
            console.log('Binance WS Connected')
            setIsConnected(true)
            reconnectDelay.current.binance = 1000
            const streams = Array.from(binanceSubscribers.current)
            if (streams.length > 0) {
                wsBinance.current.send(JSON.stringify({ method: "SUBSCRIBE", params: streams, id: Date.now() }))
            }
        }

        wsBinance.current.onmessage = (event) => {
            msgCount.current++
            const data = JSON.parse(event.data)
            lastMessageRef.current = data


            // Binance Ticker
            if (data.e === '24hrTicker' || data.e === '24hrMiniTicker') {
                const symbol = data.s.toLowerCase()
                const price = parseFloat(data.c)
                const changeP = data.P ? parseFloat(data.P) : 0
                const vol = parseFloat(data.v)

                if (!isNaN(price)) {
                    tickersBuffer.current[symbol] = {
                        exchange: 'binance',
                        symbol: data.s,
                        price: price,
                        ...( !isNaN(changeP) && { changePercent: changeP }),
                        ...( !isNaN(vol) && { volume: vol })
                    }
                }
            }

            // Binance AggTrade
            if (data.e === 'aggTrade') {
                const symbol = data.s.toLowerCase()
                if (!tradesBuffer.current[symbol]) tradesBuffer.current[symbol] = []
                tradesBuffer.current[symbol].unshift({
                    id: data.a,
                    price: parseFloat(data.p),
                    qty: parseFloat(data.q),
                    time: data.T,
                    isBuyerMaker: data.m,
                    exchange: 'binance'
                })
            }
        }

        wsBinance.current.onclose = () => {
            setIsConnected(false)
            const delay = reconnectDelay.current.binance
            setTimeout(connectBinance, delay)
            reconnectDelay.current.binance = Math.min(delay * 2, MAX_DELAY)
        }
        
        wsBinance.current.onerror = (err) => {
            console.error('[Binance WS] Error:', err)
        }
    }

    const connectBybit = () => {
        if (wsBybit.current && wsBybit.current.readyState !== WebSocket.CLOSED) return
        wsBybit.current = new WebSocket(BYBIT_WS_URL)

        wsBybit.current.onopen = () => {
            console.log('Bybit WS Connected')
            setIsBybitConnected(true)
            reconnectDelay.current.bybit = 1000
            const streams = Array.from(bybitSubscribers.current)
            if (streams.length > 0) {
                wsBybit.current.send(JSON.stringify({ op: 'subscribe', args: streams }))
            }
            // Keepalive
            if (bybitPingRef.current) clearInterval(bybitPingRef.current)
            bybitPingRef.current = setInterval(() => {
                if (wsBybit.current?.readyState === WebSocket.OPEN) {
                    wsBybit.current.send(JSON.stringify({ op: 'ping' }))
                }
            }, 20000)
        }

        wsBybit.current.onmessage = (event) => {
            msgCount.current++
            const msg = JSON.parse(event.data)
            if (msg.op === 'pong') return

            lastMessageRef.current = msg

            // Bybit Tickers
            if (msg.topic?.startsWith('tickers.')) {
                const data = msg.data
                const symbol = data.symbol.toLowerCase()
                const price = parseFloat(data.lastPrice)
                const changeP = parseFloat(data.price24hPcnt) * 100
                const vol = parseFloat(data.volume24h)

                if (!isNaN(price)) {
                    tickersBuffer.current[symbol] = {
                        exchange: 'bybit',
                        symbol: data.symbol,
                        price: price,
                        ...( !isNaN(changeP) && { changePercent: changeP }),
                        ...( !isNaN(vol) && { volume: vol })
                    }
                }
            }

            // Bybit Orderbook
            if (msg.topic?.startsWith('orderbook.')) {
                const symbol = msg.topic.split('.')[2].toLowerCase()
                depthBuffer.current[symbol] = {
                    exchange: 'bybit',
                    bids: msg.data.b,
                    asks: msg.data.a
                }
            }

            // Bybit Public Trades
            if (msg.topic?.startsWith('publicTrade.')) {
                const symbol = msg.topic.split('.')[1].toLowerCase()
                if (!tradesBuffer.current[symbol]) tradesBuffer.current[symbol] = []
                const newTrades = msg.data.map(t => ({
                    id: t.i,
                    price: parseFloat(t.p),
                    qty: parseFloat(t.v),
                    time: t.T,
                    isBuyerMaker: t.side === 'Sell',
                    exchange: 'bybit'
                }))
                tradesBuffer.current[symbol].unshift(...newTrades)
            }
        }

        wsBybit.current.onclose = () => {
            setIsBybitConnected(false)
            if (bybitPingRef.current) clearInterval(bybitPingRef.current)
            const delay = reconnectDelay.current.bybit
            setTimeout(connectBybit, delay)
            reconnectDelay.current.bybit = Math.min(delay * 2, MAX_DELAY)
        }
        
        wsBybit.current.onerror = (err) => {
            console.error('[Bybit WS] Error:', err)
        }
    }

    const connectMexc = () => {
        if (wsMexc.current && wsMexc.current.readyState !== WebSocket.CLOSED) return
        wsMexc.current = new WebSocket(MEXC_WS_URL)

        wsMexc.current.onopen = () => {
            console.log('MEXC WS Connected')
            setIsMexcConnected(true)
            reconnectDelay.current.mexc = 1000
            const streams = Array.from(mexcSubscribers.current)
            if (streams.length > 0) {
                wsMexc.current.send(JSON.stringify({ method: "SUBSCRIPTION", params: streams }))
            }
            // Keepalive
            if (mexcPingRef.current) clearInterval(mexcPingRef.current)
            mexcPingRef.current = setInterval(() => {
                if (wsMexc.current?.readyState === WebSocket.OPEN) {
                    wsMexc.current.send(JSON.stringify({ method: "PING" }))
                }
            }, 20000)
        }

        wsMexc.current.onmessage = (event) => {
            msgCount.current++
            const msg = JSON.parse(event.data)
            if (msg.msg === 'PONG') return
            
            lastMessageRef.current = msg

            // MEXC Tickers (miniTicker)
            if (msg.c?.includes('miniTicker')) {
                const symbol = msg.c.split('@')[2].toLowerCase()
                const data = msg.d
                const price = parseFloat(data.p)
                const changeP = parseFloat(data.r) * 100
                const vol = parseFloat(data.v)

                if (!isNaN(price)) {
                    tickersBuffer.current[symbol] = {
                        exchange: 'mexc',
                        symbol: symbol.toUpperCase(),
                        price: price,
                        ...( !isNaN(changeP) && { changePercent: changeP }),
                        ...( !isNaN(vol) && { volume: vol })
                    }
                }
            }

            // MEXC Deals (aggre.deals)
            if (msg.c?.includes('deals')) {
                const symbol = msg.c.split('@')[2].toLowerCase()
                if (!tradesBuffer.current[symbol]) tradesBuffer.current[symbol] = []
                const newTrades = msg.d.deals.map(t => ({
                    id: t.p + t.t + t.S, // Composite ID for MEXC deals
                    price: parseFloat(t.p),
                    qty: parseFloat(t.v),
                    time: t.t,
                    isBuyerMaker: t.S === 2, // 1: Buy, 2: Sell
                    exchange: 'mexc'
                }))
                tradesBuffer.current[symbol].unshift(...newTrades)
            }
        }

        wsMexc.current.onclose = () => {
            setIsMexcConnected(false)
            if (mexcPingRef.current) clearInterval(mexcPingRef.current)
            const delay = reconnectDelay.current.mexc
            setTimeout(connectMexc, delay)
            reconnectDelay.current.mexc = Math.min(delay * 2, MAX_DELAY)
        }
        
        wsMexc.current.onerror = (err) => {
            console.error('[Mexc WS] Error:', err)
        }
    }

    const subscribe = (streams, exchange = 'binance') => {
        if (exchange === 'binance') {
            streams.forEach(s => binanceSubscribers.current.add(s))
            if (wsBinance.current?.readyState === WebSocket.OPEN) {
                wsBinance.current.send(JSON.stringify({ method: "SUBSCRIBE", params: streams, id: Date.now() }))
            }
            
            // SHADOW SUB: Automatically subscribe to Bybit equivalents for redundancy
            const bybitStreams = streams.map(s => {
                if (s.endsWith('@ticker')) return `tickers.${s.split('@')[0].toUpperCase()}`;
                if (s.endsWith('@depth20@100ms')) return `orderbook.50.${s.split('@')[0].toUpperCase()}`;
                if (s.endsWith('@aggTrade')) return `publicTrade.${s.split('@')[0].toUpperCase()}`;
                return null;
            }).filter(Boolean);
            
            if (bybitStreams.length > 0) {
                bybitStreams.forEach(s => bybitSubscribers.current.add(s));
                if (wsBybit.current?.readyState === WebSocket.OPEN) {
                    wsBybit.current.send(JSON.stringify({ op: 'subscribe', args: bybitStreams }));
                }
            }
        } else if (exchange === 'bybit') {
            streams.forEach(s => bybitSubscribers.current.add(s))
            if (wsBybit.current?.readyState === WebSocket.OPEN) {
                wsBybit.current.send(JSON.stringify({ op: 'subscribe', args: streams }))
            }
        } else if (exchange === 'mexc') {
            streams.forEach(s => mexcSubscribers.current.add(s))
            if (wsMexc.current?.readyState === WebSocket.OPEN) {
                wsMexc.current.send(JSON.stringify({ method: "SUBSCRIPTION", params: streams }))
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
        } else if (exchange === 'mexc') {
            streams.forEach(s => mexcSubscribers.current.delete(s))
            if (wsMexc.current?.readyState === WebSocket.OPEN) {
                wsMexc.current.send(JSON.stringify({ method: "UNSUBSCRIPTION", params: streams }))
            }
        }
    }

    return (
        <WebSocketContext.Provider value={{
            isConnected: isConnected || isBybitConnected || isMexcConnected,
            isBinanceConnected: isConnected,
            isBybitConnected,
            isMexcConnected,
            tickers,
            depth,
            trades,
            lastMessage: lastMessageRef,
            throughput,
            subscribe,
            unsubscribe

        }}>
            {children}
        </WebSocketContext.Provider>
    )
}
