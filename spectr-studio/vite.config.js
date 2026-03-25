import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: './',
  resolve: {
    alias: {
      '/public_assets': path.resolve(__dirname, '../public')
    }
  },
  server: {
    port: 5175,
    host: true,
    fs: {
      allow: ['..']
    }
  }
})
