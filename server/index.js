import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/apiRoutes.js';
import limiter from './middleware/rateLimiter.js';
import { prisma } from './config/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Resolve absolute path to dist once
const distPath = path.resolve(__dirname, '../dist');
console.log(`[Server] Static files directory: ${distPath}`);

// Security: Restricted CORS
const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://64.188.119.175',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use('/api/', limiter);

// Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
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
    console.error(`[Server] Global Error: ${err.message}`);
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message,
        path: req.url 
    });
});

// Start the Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
