import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import limiter from './middleware/rateLimiter.js';
import { prisma } from './config/database.js';

dotenv.config();

console.log('[Server] Checking Environment Variables...');
console.log(`- ETHERSCAN_API_KEY: ${process.env.ETHERSCAN_API_KEY ? '✅ Present' : '❌ MISSING'}`);
console.log(`- CRYPTOPANIC_KEY: ${process.env.CRYPTOPANIC_KEY ? '✅ Present' : '❌ MISSING'}`);
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve absolute path to dist once
const distPath = path.resolve(__dirname, '../dist');
console.log(`[Server] Static files directory: ${distPath}`);

// 1. Security Headers
app.set('trust proxy', 1); // Required for express-rate-limit behind proxies
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for easier debugging of asset loading
    crossOriginEmbedderPolicy: false
}));

// 2. Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 3. API-specific Middleware
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use('/api', cors({
    origin: (origin, callback) => {
        const isDev = process.env.NODE_ENV !== 'production'; // More permissive dev check
        if (!origin || ALLOWED_ORIGINS.includes(origin) || isDev) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },

    credentials: true
}));

app.use('/api', express.json());

// Basic XSS Sanitization Middleware
app.use('/api', (req, res, next) => {
    const sanitize = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                   .replace(/onload|onerror|javascript:/gi, '');
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitize(obj[key]);
            }
        }
    };
    if (req.body) sanitize(req.body);
    if (req.query) sanitize(req.query);
    if (req.params) sanitize(req.params);
    next();
});
app.use('/api', limiter);

// 4. API Routes
app.use('/api', apiRoutes);

// Serve Static Files (Frontend)
app.use(express.static(distPath));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, status: 'Spectr API Running', ts: Date.now() });
});

// Catch-all for Frontend Routing (React Router)
app.use((req, res, next) => {
    // 1. Skip API routes (handled by router or 404 later)
    if (req.url.startsWith('/api')) {
        return next();
    }

    // 2. Skip files with extensions (likely missing assets)
    // This prevents serving index.html as a .js/.css file (MIME error)
    if (req.url.includes('.') && !req.url.endsWith('.html')) {
        return res.status(404).send('Asset not found');
    }

    // 3. Serve index.html for everything else (SPA routes)
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            console.error(`[Server] Error sending index.html: ${err.message}`);
            res.status(500).send('Frontend build not found. Please run npm run build.');
        }
    });
});

// Final API 404 handler
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';
    console.error(`[Server] Global Error: ${err.message}`);
    if (err.stack) console.error(err.stack);
    
    res.status(err.status || 500).json({ 
        error: 'Internal Server Error', 
        message: err.message, // Always return message for now to debug VPS
        path: req.url
    });
});



// Start the Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    
    // Explicitly keep the process alive
    setInterval(() => {
        if (process.env.NODE_ENV === 'debug') {
            console.log('[Keep-Alive] Heartbeat at', new Date().toISOString());
        }
    }, 60000);
});
