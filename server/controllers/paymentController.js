import { prisma } from '../config/database.js';
import { paymentService } from '../services/paymentService.js';
import crypto from 'crypto';

// Plan pricing (Updated for 2026 Strategy)
const PLAN_PRICES = {
  pro: { amount: 29, label: 'Pro: Cognitive Edge', duration: 30 },
  lifetime: { amount: 449, label: 'Protocol Founder (Lifetime)', duration: null }, // null = perpetual
};

/**
 * Calculate subscription expiry date based on plan.
 * Returns null for lifetime (perpetual) plans.
 */
function getSubscriptionExpiry(planId) {
  const plan = PLAN_PRICES[planId];
  if (!plan || plan.duration === null) {
    return null; // Lifetime — no expiry
  }
  return new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
}

/**
 * POST /api/payments/deposit
 * Create a payment via NOWPayments (direct address or hosted invoice).
 */
export const createDeposit = async (req, res) => {
  try {
    const { currency, planId, idempotencyKey } = req.body;
    const userId = req.user.id;

    console.log(`[PaymentController] createDeposit — user=${userId} planId=${planId} currency=${currency}`);

    if (!currency || !planId) {
      return res.status(400).json({ ok: false, error: 'currency and planId are required' });
    }

    // Verify NOWPayments is configured
    if (!paymentService.isEnabled()) {
      console.error('[PaymentController] NOWPAYMENTS_API_KEY not set — payments disabled');
      return res.status(503).json({ ok: false, error: 'Payment system is temporarily unavailable. Please try again later.' });
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
          automated: true,
          payment: {
            id: existing.id,
            amount: existing.amount,
            currency: existing.currency,
            depositAddress: existing.depositAddress,
            invoiceUrl: existing.invoiceUrl || null,
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

    // Build callback URLs
    const publicBase = process.env.PUBLIC_URL
      ? process.env.PUBLIC_URL.replace(/\/$/, '')
      : `${req.protocol}://${req.get('host')}`;
    const ipnCallbackUrl = `${publicBase}/api/payments/webhook`;
    const frontendBase = process.env.FRONTEND_URL || publicBase;

    // --- PRIMARY: Direct crypto address via NOWPayments ---
    try {
      console.log(`[PaymentController] IPN callback URL: ${ipnCallbackUrl}`);

      const paymentRecord = await prisma.payment.create({
        data: {
          userId,
          amount: plan.amount,
          currency: upperCurrency,
          planId: planId,
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

      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          depositAddress: gatewayPayment.depositAddress,
          txId: gatewayPayment.paymentId,
        }
      });

      return res.json({
        ok: true,
        automated: true,
        payment: {
          id: paymentRecord.id,
          amount: plan.amount,
          currency: upperCurrency,
          depositAddress: gatewayPayment.depositAddress,
          status: 'PENDING',
          planLabel: plan.label,
          payAmount: gatewayPayment.payAmount,
        }
      });
    } catch (directErr) {
      console.warn('[PaymentController] Direct payment failed, trying hosted invoice:', directErr.message);
    }

    // --- FALLBACK: Hosted invoice page (NOWPayments) ---
    try {
      const paymentRecord = await prisma.payment.create({
        data: {
          userId,
          amount: plan.amount,
          currency: upperCurrency,
          planId: planId,
          status: 'PENDING',
          idempotencyKey: idempotencyKey ? `${idempotencyKey}_inv` : null,
        },
      });

      const invoice = await paymentService.createInvoice({
        amount: plan.amount,
        currency: 'usd',
        orderId: paymentRecord.id,
        description: plan.label,
        successUrl: `${frontendBase}/pricing?payment=success`,
        cancelUrl: `${frontendBase}/pricing?payment=cancelled`,
        ipnCallbackUrl,
      });

      console.log(`[PaymentController] Invoice created — id=${invoice.invoiceId} url=${invoice.invoiceUrl}`);

      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: { txId: String(invoice.invoiceId) }
      });

      return res.json({
        ok: true,
        automated: true,
        invoiceFlow: true,
        payment: {
          id: paymentRecord.id,
          amount: plan.amount,
          currency: upperCurrency,
          invoiceUrl: invoice.invoiceUrl,
          status: 'PENDING',
          planLabel: plan.label,
        }
      });
    } catch (invoiceErr) {
      console.error('[PaymentController] Invoice creation also failed:', invoiceErr.message);
      if (invoiceErr.response?.data) {
        console.error('[PaymentController] Gateway error details:', JSON.stringify(invoiceErr.response.data));
      }
      return res.status(502).json({ ok: false, error: 'Payment gateway is temporarily unavailable. Please check backend logs for NOWPAYMENTS_API_KEY issues.' });
    }
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

      // 2. Upgrade User Subscription (lifetime = no expiry)
      const expiresAt = getSubscriptionExpiry(payment.planId);
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          subscriptionStatus: 'PRO',
          subscriptionExpiresAt: expiresAt
        }
      });

      console.log(`[Webhook] ✅ Order ${order_id} completed. User ${payment.userId} upgraded to PRO (plan=${payment.planId}, expires=${expiresAt || 'NEVER'}).`);
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

        // Upgrade User Subscription (lifetime = no expiry)
        const expiresAt = getSubscriptionExpiry(payment.planId);
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'PRO',
            subscriptionExpiresAt: expiresAt
          }
        });

        console.log(`[PaymentController] Payment ${paymentId} confirmed via polling. User ${userId} upgraded to PRO (plan=${payment.planId}, expires=${expiresAt || 'NEVER'}).`);
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

    // Check if subscription is expired (null expiresAt = lifetime, never expires)
    const isExpired = user?.subscriptionExpiresAt
      && new Date(user.subscriptionExpiresAt) < new Date();

    // Auto-downgrade expired subscriptions
    if (user?.subscriptionStatus === 'PRO' && isExpired) {
      await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: 'FREE', subscriptionExpiresAt: null }
      });
      console.log(`[PaymentController] User ${userId} PRO expired — downgraded to FREE.`);
      return res.json({
        ok: true,
        isPro: false,
        status: 'FREE',
        expiresAt: null,
        expired: true
      });
    }

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
