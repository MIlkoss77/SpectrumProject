import { prisma } from '../config/database.js';

/**
 * Middleware to verify if the authenticated user has ADMIN role.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ ok: false, error: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Internal server error during admin verification' });
  }
};

export default adminMiddleware;
