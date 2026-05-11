import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20000, // Very high limit for production stability
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.url.includes('/health') || req.url.includes('/pulse')
});

export default limiter;
