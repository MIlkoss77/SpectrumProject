import { prisma } from '../config/database.js';

/**
 * GET /api/admin/users
 * List all users with stats
 */
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        telegramId: true,
        role: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        createdAt: true,
        _count: {
          select: { payments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { role }
    });

    res.json({ ok: true, user: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/subscription
 */
export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expiresAt } = req.body;

    const updated = await prisma.user.update({
      where: { id },
      data: { 
        subscriptionStatus: status,
        subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.json({ ok: true, user: updated });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};

/**
 * GET /api/admin/stats
 */
export const getStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const proUsers = await prisma.user.count({ where: { subscriptionStatus: 'PRO' } });
    const totalPayments = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true }
    });

    res.json({
      ok: true,
      stats: {
        totalUsers,
        proUsers,
        totalRevenue: totalPayments._sum.amount || 0
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
};
