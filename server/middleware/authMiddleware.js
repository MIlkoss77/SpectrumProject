import * as authService from '../services/authService.js';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ ok: false, error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = authService.verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ ok: false, error: 'Unauthorized: Invalid token' });
    }

    req.user = decoded;
    next();
};

export default authMiddleware;
