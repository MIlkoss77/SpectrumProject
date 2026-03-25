import { prisma } from '../config/database.js';

// Static deposit addresses from env (Phase 1 — manual verification)
const DEPOSIT_ADDRESSES = {
  USDT: process.env.DEPOSIT_WALLET_USDT || 'TBA_USDT_ADDRESS',
  SOL: process.env.DEPOSIT_WALLET_SOL || 'TBA_SOL_ADDRESS',
  ETH: process.env.DEPOSIT_WALLET_ETH || 'TBA_ETH_ADDRESS',
};

// Plan pricing
const PLAN_PRICES = {
  pro: { amount: 19.90, label: 'Pro Monthly' },
  lifetime: { amount: 299, label: 'Lifetime Access' },
};

/**
 * POST /api/payments/deposit
 * Create a new deposit record and return the wallet address.
 */
export const createDeposit = async (req, res) => {
  try {
    const { currency, planId } = req.body;
    const userId = req.user.id;

    if (!currency || !planId) {
      return res.status(400).json({ ok: false, error: 'currency and planId are required' });
    }

    const upperCurrency = currency.toUpperCase();
    if (!DEPOSIT_ADDRESSES[upperCurrency]) {
      return res.status(400).json({ ok: false, error: `Unsupported currency: ${currency}. Supported: USDT, SOL, ETH` });
    }

    const plan = PLAN_PRICES[planId];
    if (!plan) {
      return res.status(400).json({ ok: false, error: `Unknown plan: ${planId}. Available: pro, lifetime` });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.amount,
        currency: upperCurrency,
        status: 'PENDING',
        depositAddress: DEPOSIT_ADDRESSES[upperCurrency],
      },
    });

    res.json({
      ok: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        depositAddress: payment.depositAddress,
        status: payment.status,
        planLabel: plan.label,
      },
    });
  } catch (error) {
    console.error('[PaymentController] createDeposit error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to create deposit' });
  }
};

/**
 * POST /api/payments/verify
 * Submit a transaction hash. Marks payment as COMPLETED (manual verification).
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, txId } = req.body;
    const userId = req.user.id;

    if (!paymentId || !txId) {
      return res.status(400).json({ ok: false, error: 'paymentId and txId are required' });
    }

    // Verify ownership
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment not found' });
    }

    if (payment.status === 'COMPLETED') {
      return res.json({ ok: true, message: 'Payment already verified', status: 'COMPLETED' });
    }

    // Update with txId and mark COMPLETED (Phase 1: trust-based)
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { txId, status: 'COMPLETED', updatedAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PAYMENT_VERIFIED',
        details: JSON.stringify({ paymentId, txId, amount: payment.amount, currency: payment.currency }),
      },
    });

    res.json({
      ok: true,
      message: 'Payment verified successfully. Pro status unlocked!',
      status: updated.status,
    });
  } catch (error) {
    console.error('[PaymentController] verifyPayment error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to verify payment' });
  }
};

/**
 * GET /api/payments/history
 * Return all payments for the authenticated user.
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        txId: true,
        amount: true,
        currency: true,
        status: true,
        depositAddress: true,
        createdAt: true,
      },
    });

    res.json({ ok: true, payments });
  } catch (error) {
    console.error('[PaymentController] getPaymentHistory error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to fetch payment history' });
  }
};

/**
 * GET /api/payments/status
 * Check if the user has Pro status (any COMPLETED payment).
 */
export const getProStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const completedPayment = await prisma.payment.findFirst({
      where: { userId, status: 'COMPLETED' },
    });

    res.json({
      ok: true,
      isPro: !!completedPayment,
      since: completedPayment?.createdAt || null,
    });
  } catch (error) {
    console.error('[PaymentController] getProStatus error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to check status' });
  }
};
