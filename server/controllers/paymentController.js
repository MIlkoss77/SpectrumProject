import { prisma } from '../config/database.js';
import { paymentService } from '../services/paymentService.js';
import crypto from 'crypto';

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
    const { currency, planId, idempotencyKey } = req.body;
    const userId = req.user.id;

    console.log(`[PaymentController] createDeposit — user=${userId} planId=${planId} currency=${currency}`);

    if (!currency || !planId) {
      return res.status(400).json({ ok: false, error: 'currency and planId are required' });
    }

    // Idempotency check — prevent duplicate payment records
    if (idempotencyKey) {
      const existing = await prisma.payment.findFirst({
        where: { userId, idempotencyKey }
      });
      if (existing) {
        console.log(`[PaymentController] Returning existing payment record ${existing.id} (idempotency)`);
        return res.json({
          ok: true,
          automated: !!existing.txId,
          payment: {
            id: existing.id,
            amount: existing.amount,
            currency: existing.currency,
            depositAddress: existing.depositAddress,
            status: existing.status,
            planLabel: PLAN_PRICES[planId]?.label
          }
        });
      }
    }

    const upperCurrency = currency.toUpperCase();
    const plan = PLAN_PRICES[planId];
    if (!plan) {
      return res.status(400).json({ ok: false, error: `Unknown plan: ${planId}.` });
    }

    // --- AUTOMATED FLOW (NOWPayments) ---
    if (paymentService.isEnabled()) {
      try {
        // Build the IPN callback URL from PUBLIC_URL env var (required for production)
        const publicBase = process.env.PUBLIC_URL
          ? process.env.PUBLIC_URL.replace(/\/$/, '')
          : `${req.protocol}://${req.get('host')}`;

        const ipnCallbackUrl = `${publicBase}/api/payments/webhook`;
        console.log(`[PaymentController] IPN callback URL: ${ipnCallbackUrl}`);

        // Create Prisma record first to obtain a stable order_id
        const paymentRecord = await prisma.payment.create({
          data: {
            userId,
            amount: plan.amount,
            currency: upperCurrency,
            status: 'PENDING',
            idempotencyKey: idempotencyKey || null,
          },
        });

        console.log(`[PaymentController] Created payment record ${paymentRecord.id}`);

        const gatewayPayment = await paymentService.createPayment({
          amount: plan.amount,
          currency: upperCurrency,
          orderId: paymentRecord.id,
          ipnCallbackUrl,
        });

        console.log(`[PaymentController] Gateway payment created — paymentId=${gatewayPayment.paymentId} address=${gatewayPayment.depositAddress}`);

        const updated = await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: {
            depositAddress: gatewayPayment.depositAddress,
            txId: gatewayPayment.paymentId, // Store NOWPayments payment_id for status polling
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
            payAmount: gatewayPayment.payAmount,
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
        idempotencyKey: idempotencyKey || null,
      },
    });

    console.log(`[PaymentController] Manual payment record created ${payment.id}`);

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
 * Handle IPN from NOWPayments.
 *
 * CRITICAL: This route must be registered with express.raw() in index.js
 * BEFORE express.json() — otherwise raw Buffer is lost.
 */
export const handleWebhook = async (req, res) => {
  const step = { received: true };
  try {
    console.log('[Webhook] IPN received — headers:', JSON.stringify({
      'x-nowpayments-sig': req.headers['x-nowpayments-sig'],
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
    }));

    const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!IPN_SECRET) {
      console.error('[Webhook] NOWPAYMENTS_IPN_SECRET not configured — cannot verify webhook');
      return res.status(500).json({ ok: false, error: 'Server misconfiguration' });
    }

    const signature = req.headers['x-nowpayments-sig'];
    if (!signature) {
      console.warn('[Webhook] Missing x-nowpayments-sig header — rejected');
      return res.status(401).json({ ok: false, error: 'Missing signature' });
    }

    // req.body is a Buffer when express.raw() is used for this route
    // Verify HMAC before any parsing
    const isValid = paymentService.verifyIpnSignature(req.body, signature);
    if (!isValid) {
      // Log the mismatch for debugging but return 401
      console.warn('[Webhook] HMAC verification failed — possible replay/spoofing attack');
      return res.status(401).json({ ok: false, error: 'Invalid signature' });
    }

    // Parse after verification
    const bodyStr = req.body instanceof Buffer ? req.body.toString('utf8') : String(req.body);
    const payload = JSON.parse(bodyStr);

    const { payment_id, payment_status, order_id } = payload;
    console.log(`[Webhook] ✅ Valid IPN — payment_id=${payment_id} status=${payment_status} order_id=${order_id}`);

    // Only process terminal success states
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      const payment = await prisma.payment.findUnique({ where: { id: order_id } });

      if (!payment) {
        console.warn(`[Webhook] Payment record not found for order_id=${order_id}`);
        // Still return 200 so NOWPayments stops retrying for unknown orders
        return res.json({ ok: true });
      }

      if (payment.status === 'COMPLETED') {
        console.log(`[Webhook] Order ${order_id} already completed — idempotent skip`);
        return res.json({ ok: true });
      }

      // 1. Update Payment Status
      await prisma.payment.update({
        where: { id: order_id },
        data: { status: 'COMPLETED', updatedAt: new Date() }
      });

      // 2. Upgrade User Subscription
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionStatus: 'PRO',
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });

      console.log(`[Webhook] ✅ Order ${order_id} completed. User ${payment.userId} upgraded to PRO.`);
    } else {
      console.log(`[Webhook] Non-terminal status=${payment_status} for order_id=${order_id} — no action taken`);
    }

    // Always respond 200 to acknowledge receipt
    res.json({ ok: true });
  } catch (error) {
    console.error('[PaymentController] Webhook error:', error.message, error.stack);
    // Return 200 to prevent NOWPayments from hammering with retries on our bugs
    res.json({ ok: false, error: 'Internal error' });
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

    console.log(`[PaymentController] verifyPayment — user=${userId} paymentId=${paymentId}`);

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

    // Already completed
    if (payment.status === 'COMPLETED') {
      return res.json({ ok: true, status: 'COMPLETED', message: 'Payment already verified' });
    }

    // If automated, check with gateway
    if (paymentService.isEnabled() && payment.txId && payment.status === 'PENDING') {
      console.log(`[PaymentController] Checking gateway status for payment_id=${payment.txId}`);
      const remote = await paymentService.checkStatus(payment.txId);
      console.log(`[PaymentController] Gateway status: ${remote.status}`);

      if (remote.isFinished) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'COMPLETED', updatedAt: new Date() }
        });

        // Upgrade User Subscription
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'PRO',
            subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        console.log(`[PaymentController] Payment ${paymentId} confirmed via polling. User ${userId} upgraded to PRO.`);
        return res.json({ ok: true, status: 'COMPLETED', message: 'Payment confirmed! Welcome to PRO.' });
      }

      return res.json({ ok: true, status: remote.status, message: 'Payment is being processed...' });
    }

    // Manual flow update (txId provided by user)
    if (txId) {
      const evmRegex = /^0x([A-Fa-f0-9]{64})$/;
      const solRegex = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/;

      if (!evmRegex.test(txId) && !solRegex.test(txId)) {
        return res.status(400).json({ ok: false, error: 'Invalid transaction hash format' });
      }

      await prisma.payment.update({
        where: { id: paymentId },
        data: { txId, status: 'PENDING', updatedAt: new Date() },
      });

      console.log(`[PaymentController] Manual TxID submitted for payment ${paymentId}: ${txId}`);
      return res.json({ ok: true, status: 'PENDING', message: 'Manual verification submitted! Pending admin approval.' });
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
 * Check if the user has Pro status.
 */
export const getProStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, subscriptionExpiresAt: true }
    });

    res.json({
      ok: true,
      isPro: user?.subscriptionStatus === 'PRO',
      status: user?.subscriptionStatus,
      expiresAt: user?.subscriptionExpiresAt
    });
  } catch (error) {
    console.error('[PaymentController] getProStatus error:', error.message);
    res.status(500).json({ ok: false, error: 'Failed to check status' });
  }
};
