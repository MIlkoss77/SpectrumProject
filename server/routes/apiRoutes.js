import express from 'express';
import * as marketController from '../controllers/marketController.js';
import * as backtestController from '../controllers/backtestController.js';
import * as proxyController from '../controllers/proxyController.js';
import * as authController from '../controllers/authController.js';
import * as exchangeController from '../controllers/exchangeController.js';
import * as tradeController from '../controllers/tradeController.js';
import * as aiController from '../controllers/aiController.js';
import * as notificationController from '../controllers/notificationController.js';
import * as paymentController from '../controllers/paymentController.js';
import * as polymarketController from '../controllers/polymarketController.js';
import authMiddleware from '../middleware/authMiddleware.js';

import rateLimit from 'express-rate-limit';

const router = express.Router();

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 payment requests per windowMs
    message: { error: 'Too many payment verification attempts, please try again later.' }
});

// Proxy Routes
router.use('/proxy/binance', proxyController.binanceProxy);
router.use('/proxy/bybit', proxyController.bybitProxy);
router.use('/proxy/mexc', proxyController.mexcProxy);
router.post('/solana/signatures', proxyController.solanaProxy);

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

// Payment Routes
router.post('/payments/webhook', paymentController.handleWebhook);
router.post('/payments/deposit', authMiddleware, paymentLimiter, paymentController.createDeposit);
router.post('/payments/verify', authMiddleware, paymentLimiter, paymentController.verifyPayment);
router.get('/payments/history', authMiddleware, paymentController.getPaymentHistory);
router.get('/payments/status', authMiddleware, paymentController.getProStatus);

// Exchange Creds Routes
router.post('/exchange/keys', authMiddleware, exchangeController.saveExchangeKeys);
router.get('/exchange/list', authMiddleware, exchangeController.listUserExchanges);
router.get('/exchange/keys', authMiddleware, exchangeController.getExchangeKeys); // Decryption for internal server use/verification

// Trade Routes
router.post('/trade/execute', authMiddleware, tradeController.handleExecuteTrade);

// AI Routes
router.post('/ai/ask', authMiddleware, aiController.handleAiAsk);

// Notification Routes
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markRead);
router.post('/notifications/read-all', authMiddleware, notificationController.markAllRead);

// Market Routes
router.get('/ohlc', marketController.getOHLC);
router.get('/ohlc/binance', marketController.getOHLC);
router.get('/news', marketController.getNews);
router.get('/social/buzz', marketController.getSocialBuzz);
router.get('/intelligence/scout', marketController.getScoutSignals);
router.get('/whales', marketController.getWhaleTransactions);
router.get('/bybit/ticker/:symbol', marketController.getBybitTickerPrice);

// Backtest Route
router.post('/backtest', backtestController.handleBacktest);

// Polymarket Routes
router.get('/polymarket/markets', polymarketController.getMarkets);
router.post('/polymarket/order', polymarketController.placeOrder);
router.get('/polymarket/orders', polymarketController.getOrders);

export default router;

