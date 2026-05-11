import dotenv from 'dotenv';
const result = dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import limiter from './middleware/rateLimiter.js';
import { prisma } from './config/database.js';
import { telegramScout } from './services/telegramService.js';
import session from 'express-session';
import passport from './config/passport.js';
import logger from './logger.js';

logger.info(`[Server] Current Working Directory: ${process.cwd()}`);
if (result.error) {
    logger.error('[Server] Error loading .env file:', result.error);
} else {
    logger.info('[Server] .env loaded successfully');
}

logger.info('[Server] Checking Environment Variables...');
const requiredEnv = [
    'DATABASE_URL', 
    'JWT_SECRET', 
    'GOOGLE_CLIENT_ID', 
    'GOOGLE_CLIENT_SECRET', 
    'NOWPAYMENTS_API_KEY',
    'NOWPAYMENTS_IPN_SECRET'
];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
    logger.error('[FATAL] Missing required environment variables: %s', missingEnv.join(', '));
    process.exit(1);
}

requiredEnv.forEach(key => {
    logger.info(`- ${key}: ${process.env[key] ? '✅ Present' : '❌ MISSING'}`);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
    logger.error('[FATAL] Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('[FATAL] Unhandled Rejection at: %O, reason: %O', promise, reason);
});

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8787;

// 0. Session & Passport
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    logger.error('[FATAL] JWT_SECRET is required in production');
    process.exit(1);
}

app.use(session({
    secret: process.env.JWT_SECRET || 'spectr-secret-dev',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(passport.initialize());
app.use(passport.session());

const distPath = path.resolve(__dirname, '../dist');
logger.info(`[Server] Static files directory: ${distPath}`);

// 1. Security Headers
app.set('trust proxy', 1);
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "connect-src": ["'self'", "https:", "wss:"],
            "script-src": ["'self'", "'unsafe-inline'"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// 2. HTTP Request Logging
app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// 3. API-specific Middleware
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://spectrtrading.com',
    'https://app.spectrtrading.com',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use('/api', cors({
    origin: (origin, callback) => {
        const isDev = process.env.NODE_ENV !== 'production';
        if (!origin || ALLOWED_ORIGINS.includes(origin) || isDev) {
            callback(null, true);
        } else {
            logger.warn(`[CORS] Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use('/api', express.json());

app.use('/api', (req, res, next) => {
    if (req.path === '/payments/webhook') return next();
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
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/payments')) return next();
    limiter(req, res, next);
});

// 4. API Routes
app.use('/api', apiRoutes);
app.use(express.static(distPath));

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, status: 'Spectr API Running', db: 'connected', ts: Date.now() });
    } catch (error) {
        logger.error('[Health] DB Connection Failed: %O', error);
        res.status(500).json({ ok: false, status: 'Database Connection Failed', error: error.message });
    }
});

// Catch-all for Frontend Routing
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) return next();
    if (req.url.includes('.') && !req.url.endsWith('.html')) return res.status(404).send('Asset not found');

    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err) {
            logger.error(`[Server] Error sending index.html: ${err.message}`);
            res.status(500).send('Frontend build not found. Please run npm run build.');
        }
    });
});

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    logger.error(`[Server] Global Error: ${err.message}`, { stack: err.stack, path: req.url });
    res.status(err.status || 500).json({ 
        error: 'Internal Server Error', 
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
        path: req.url
    });
});

// Start the Server
app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    telegramScout.start();

    setInterval(() => {
        if (process.env.NODE_ENV === 'debug') {
            logger.debug('[Keep-Alive] Heartbeat at %s', new Date().toISOString());
        }
    }, 60000);
});
