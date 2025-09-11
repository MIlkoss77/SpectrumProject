// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: 'localhost',       // ����� '0.0.0.0', ���� ���������� � ������� ����������
        port: 5173,              // ������ Vite; ����� ����������, ��� 3000
        strictPort: true,
        hmr: {
            protocol: 'ws',        // ������������� WS (��� TLS)
            host: 'localhost',     // �� ��������� ������ �� VPN/Proxy
            port: 5173,            // ��������� � server.port
            clientPort: 5173       // �������� ������ �� VPN/Proxy/NAT
        }
    }
})
