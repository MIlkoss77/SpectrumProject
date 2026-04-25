// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Spectr Trading',
        short_name: 'Spectr',
        description: 'AI-Powered Crypto Trading Assistant — Real-time signals, whale tracking, and portfolio management.',
        theme_color: '#0A0A0A',
        background_color: '#0A0A0A',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['finance', 'productivity'],
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', 'axios'],
          'tfjs': ['@tensorflow/tfjs'],
          'trading': ['lightweight-charts', 'technicalindicators'],
          'utils': ['i18next', 'date-fns', 'ethers']
        }
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  server: {
    port: 5174,
    proxy: {
      // Binance WebSocket (already working)
      '/binance-api': {
        target: 'https://api.binance.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/binance-api/, '')
      },

      // Bybit (already working)
      '/bybit-api': {
        target: 'https://api.bybit.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bybit-api/, ''),
        headers: {
          'Origin': 'https://www.bybit.com',
          'Referer': 'https://www.bybit.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },

      // Etherscan API (for whale tracking)
      '/etherscan-api': {
        target: 'https://api.etherscan.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/etherscan-api/, ''),
        headers: {
          'Origin': 'https://etherscan.io'
        }
      },

      // Solscan API (for Solana whale tracking)
      '/solscan-api': {
        target: 'https://api.solscan.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/solscan-api/, ''),
        headers: {
          'Origin': 'https://solscan.io'
        }
      },

      // ChainGPT RSS (for legal crypto news)
      '/chaingpt-rss': {
        target: 'https://news.chaingpt.org',
        changeOrigin: true,
        secure: false, // Avoid SSL handshake issues in dev
        rewrite: (path) => path.replace(/^\/chaingpt-rss/, '/rss/'),
        headers: {
          'Origin': 'https://news.chaingpt.org',
          'Referer': 'https://news.chaingpt.org/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },

      // Local Backend Proxy (Vercel API simulator)
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
