import { prisma } from '../config/database.js';
import { paymentService } from '../services/paymentService.js';

// Static deposit addresses from env (Phase 1 — manual verification fallback)
const DEPOSIT_ADDRESSES = {
  USDT: process.env.DEPOSIT_WALLET_USDT || 'TBA_USDT_ADDRESS',
  SOL: process.env.DEPOSIT_WALLET_SOL || 'TBA_SOL_ADDRESS',
  ETH: process.env.DEPOSIT_WALLET_ETH || 'TBA_ETH_ADDRESS',
};

// Plan pricing (Updated for 2026 Strategy)
const PLAN_PRICES = {
  pro: { amount: 29, label: 'Pro: Cognitive Edge' },
  lifetime: { amount: 499, label: 'Protocol Founder (Lifetime)' },
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
    const plan = PLAN_PRICES[planId];
    if (!plan) {
      return res.status(400).json({ ok: false, error: `Unknown plan: ${planId}.` });
    }

    // --- AUTOMATED FLOW (NOWPayments) ---
    if (paymentService.isEnabled()) {
      try {
        // Create prisma record first to get an ID
        const paymentRecord = await prisma.payment.create({
          data: {
            userId,
            amount: plan.amount,
            currency: upperCurrency,
            status: 'PENDING',
          },
        });

        const gatewayPayment = await paymentService.createPayment({
          amount: plan.amount,
          currency: upperCurrency,
          orderId: paymentRecord.id
        });

        const updated = await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { 
            depositAddress: gatewayPayment.depositAddress,
            txId: gatewayPayment.paymentId // Store gateway ID temporarily in txId field
          }
        });

        return res.json({
          ok: true,
          automated: true,
          payment: {
            id: updated.id,
            amount: plan.amount,
            currency: upperCurrency,
            depositAddress: updated.depositAddress,
            status: updated.status,
            planLabel: plan.label,
            payAmount: gatewayPayment.payAmount
          }
        });
      } catch (e) {
        console.error('[PaymentController] Automated gateway failed, falling back to manual:', e.message);
      }
    }

    // --- MANUAL FALLBACK ---
    if (!DEPOSIT_ADDRESSES[upperCurrency]) {
      return res.status(400).json({ ok: false, error: `Unsupported currency: ${currency}` });
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
      automated: false,
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
 * POST /api/payments/webhook
 * Handled IPN from NOWPayments
 */
export const handleWebhook = async (req, res) => {
  try {
    const { payment_id, payment_status, order_id } = req.body;
    // Note: In production, verify the x-nowpayments-sig header
    
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const payment = await prisma.payment.findUnique({ where: { id: order_id } });
      if (payment && payment.status !== 'COMPLETED') {
        await prisma.payment.update({
          where: { id: order_id },
          data: { status: 'COMPLETED', updatedAt: new Date() }
        });
        console.log(`[Payment] Order ${order_id} completed via Webhook`);
      }
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('[PaymentController] Webhook error:', error.message);
    res.status(500).json({ ok: false });
  }
};

/**
 * POST /api/payments/verify
 * Submit a transaction hash or trigger manual status check.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, txId } = req.body;
    const userId = req.user.id;

    if (!paymentId) {
      return res.status(400).json({ ok: false, error: 'paymentId is required' });
    }

    // Verify ownership
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment not found' });
    }

    // If automated, check with gateway
    if (paymentService.isEnabled() && payment.txId && payment.status === 'PENDING') {
      const remote = await paymentService.checkStatus(payment.txId);
      if (remote.isFinished) {
        const updated = await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'COMPLETED', updatedAt: new Date() }
        });
        return res.json({ ok: true, status: 'COMPLETED', message: 'Payment confirmed by gateway!' });
      }
    }

    if (payment.status === 'COMPLETED') {
        return res.json({ ok: true, message: 'Payment already verified', status: 'COMPLETED' });
    }

    // Manual flow update
    if (txId) {
        // Validate TxID Format
        const evmRegex = /^0x([A-Fa-f0-9]{64})$/;
        const solRegex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;
        
        if (!evmRegex.test(txId) && !solRegex.test(txId)) {
            return res.status(400).json({ ok: false, error: 'Invalid transaction hash format' });
        }

        const updated = await prisma.payment.update({
          where: { id: paymentId },
          data: { txId, status: 'COMPLETED', updatedAt: new Date() },
        });

        // Audit log...
        return res.json({ ok: true, status: 'COMPLETED', message: 'Manual verification submitted!' });
    }

    res.json({ ok: true, status: payment.status, message: 'Verification pending...' });
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
