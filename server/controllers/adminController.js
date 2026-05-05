import { prisma } from '../config/database.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Write an admin action to the AuditLog table.
 */
async function writeAuditLog(adminId, action, details, ipAddress) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        ipAddress,
      },
    });
  } catch (e) {
    console.error('[AdminController] Failed to write audit log:', e.message);
  }
}

// ─── GET /api/admin/stats ────────────────────────────────────────────────────

/**
 * Aggregated dashboard statistics.
 */
export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      proUsers,
      newUsersToday,
      totalPaymentsAgg,
      pendingPayments,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'PRO' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          currency: true,
          createdAt: true,
          user: { select: { email: true, displayName: true } },
        },
      }),
    ]);

    res.json({
      ok: true,
      stats: {
        totalUsers,
        proUsers,
        freeUsers: totalUsers - proUsers,
        newUsersToday,
        totalRevenue: totalPaymentsAgg._sum.amount || 0,
        completedPayments: totalPaymentsAgg._count._all || 0,
        pendingPayments,
        recentPayments,
        conversionRate: totalUsers > 0
          ? ((proUsers / totalUsers) * 100).toFixed(1)
          : '0.0',
      },
    });
  } catch (error) {
    console.error('[AdminController] getStats error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────

/**
 * Paginated, searchable user list.
 * Query params: page (default 1), limit (default 20), search, status, sort, dir
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const search = req.query.search?.trim() || '';
    const status = req.query.status || ''; // 'PRO' | 'FREE' | ''
    const sortField = ['createdAt', 'email', 'subscriptionStatus'].includes(req.query.sort)
      ? req.query.sort
      : 'createdAt';
    const sortDir = req.query.dir === 'asc' ? 'asc' : 'desc';

    // Build Prisma where clause
    const where = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { telegramId: { contains: search } },
      ];
    }
    if (status === 'PRO' || status === 'FREE') {
      where.subscriptionStatus = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          displayName: true,
          telegramId: true,
          role: true,
          subscriptionStatus: true,
          subscriptionExpiresAt: true,
          createdAt: true,
          _count: { select: { payments: true } },
        },
        orderBy: { [sortField]: sortDir },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      ok: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[AdminController] getUsers error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch users' });
  }
};

// ─── GET /api/admin/payments ─────────────────────────────────────────────────

/**
 * Paginated payment history with user info.
 */
export const getPayments = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status || ''; // PENDING | COMPLETED | FAILED

    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          txId: true,
          depositAddress: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, email: true, displayName: true },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      ok: true,
      payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[AdminController] getPayments error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch payments' });
  }
};

// ─── GET /api/admin/logs ─────────────────────────────────────────────────────

/**
 * Recent audit logs.
 */
export const getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(200, parseInt(req.query.limit) || 50);

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        details: true,
        ipAddress: true,
        createdAt: true,
        user: { select: { email: true, displayName: true } },
      },
    });

    res.json({ ok: true, logs });
  } catch (error) {
    console.error('[AdminController] getAuditLogs error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch logs' });
  }
};

// ─── PATCH /api/admin/users/:id/subscription ─────────────────────────────────

export const updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, expiresAt } = req.body;

    const validStatuses = ['PRO', 'FREE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ ok: false, error: 'Invalid status value' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        subscriptionStatus: status,
        subscriptionExpiresAt: status === 'PRO'
          ? (expiresAt ? new Date(expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
          : null,
      },
      select: { id: true, email: true, subscriptionStatus: true },
    });

    await writeAuditLog(
      req.user.id,
      'SUBSCRIPTION_UPDATE',
      { targetUserId: id, newStatus: status },
      req.ip
    );

    console.log(`[Admin] ${req.user.id} → changed user ${id} subscription to ${status}`);
    res.json({ ok: true, user: updated });
  } catch (error) {
    console.error('[AdminController] updateUserSubscription error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to update subscription' });
  }
};

// ─── PATCH /api/admin/users/:id/role ─────────────────────────────────────────

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['USER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ ok: false, error: 'Invalid role' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });

    await writeAuditLog(req.user.id, 'ROLE_UPDATE', { targetUserId: id, newRole: role }, req.ip);

    res.json({ ok: true, user: updated });
  } catch (error) {
    console.error('[AdminController] updateUserRole error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to update role' });
  }
};
