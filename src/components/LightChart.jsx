// src/components/LightChart.jsx
import React, { useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

/**
 * Простой чарт: только линия по close.
 * candles: [{ t, o, h, l, c }]
 */
export default function LightChart({ candles, height = 320 }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  // init chart
  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: '#E7ECF3',
      },
      grid: {
        vertLines: { color: 'rgba(231,236,243,0.04)' },
        horzLines: { color: 'rgba(231,236,243,0.04)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(231,236,243,0.35)',
      },
      timeScale: {
        borderColor: 'rgba(231,236,243,0.35)',
      },
    })

    // только линия — БЕЗ candlestick
    const series = chart.addLineSeries({
      lineWidth: 2,
    })

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (!containerRef.current) return
      const { width } = containerRef.current.getBoundingClientRect()
      chart.applyOptions({ width })
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [height])

  // update data
  useEffect(() => {
    const series = seriesRef.current
    if (!series) return

    if (!candles || !candles.length) {
      series.setData([])
      return
    }

    const data = candles.map(c => ({
      time: Math.floor(c.t / 1000),
      value: c.c,
    }))
    series.setData(data)
    chartRef.current?.timeScale().fitContent()
  }, [candles])

  return <div ref={containerRef} style={{ width: '100%' }} />
}
