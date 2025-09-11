// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: 'localhost',       // можно '0.0.0.0', если открываешь с другого устройства
        port: 5173,              // дефолт Vite; часто стабильнее, чем 3000
        strictPort: true,
        hmr: {
            protocol: 'ws',        // принудительно WS (без TLS)
            host: 'localhost',     // не оставляем пустым за VPN/Proxy
            port: 5173,            // совпадает с server.port
            clientPort: 5173       // ключевая строка за VPN/Proxy/NAT
        }
    }
})
