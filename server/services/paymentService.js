import axios from 'axios';
import crypto from 'crypto';

/**
 * Service to handle automated crypto payments via NOWPayments API.
 * Docs: https://documenter.getpostman.com/view/7907941/2s93JqTRWN
 *
 * Two modes:
 *  - createPayment()  → Direct crypto address (current flow, no redirect)
 *  - createInvoice()  → Hosted payment page with redirect_url (new flow)
 */
class PaymentService {
    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY || '';
        this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || '';
        this.baseUrl = 'https://api.nowpayments.io/v1';
    }

    isEnabled() {
        const enabled = !!this.apiKey;
        if (!enabled) {
            console.warn('[PaymentService] NOWPAYMENTS_API_KEY is not configured');
        }
        return enabled;
    }

    /**
     * Create a hosted invoice (returns invoice_url for redirect).
     * Use this when you want to redirect the user to NOWPayments-hosted page.
     */
    async createInvoice({ amount, currency = 'usd', orderId, description, successUrl, cancelUrl, ipnCallbackUrl }) {
        if (!this.isEnabled()) {
            throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
        }

        const payload = {
            price_amount: amount,
            price_currency: currency.toLowerCase(),
            order_id: String(orderId),
            order_description: description || 'Spectr Trading Pro Upgrade',
        };

        if (ipnCallbackUrl) payload.ipn_callback_url = ipnCallbackUrl;
        if (successUrl) payload.success_url = successUrl;
        if (cancelUrl) payload.cancel_url = cancelUrl;

        console.log('[PaymentService] createInvoice payload:', JSON.stringify(payload));

        try {
            const response = await axios.post(`${this.baseUrl}/invoice`, payload, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            console.log('[PaymentService] createInvoice response:', JSON.stringify(response.data));

            return {
                invoiceId: response.data.id,
                invoiceUrl: response.data.invoice_url,   // <-- redirect user here
                status: response.data.status,
                orderId: response.data.order_id,
            };
        } catch (error) {
            const details = error.response?.data;
            console.error('[PaymentService] createInvoice error:', details || error.message);
            throw new Error(details?.message || 'Failed to create invoice');
        }
    }

    /**
     * Create a direct payment (returns deposit address, no redirect).
     * Use this for the crypto-address deposit flow.
     */
    async createPayment({ amount, currency, orderId, ipnCallbackUrl }) {
        if (!this.isEnabled()) {
            throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
        }

        const payload = {
            price_amount: amount,
            price_currency: 'usd',
            pay_currency: currency.toLowerCase(),
            order_id: String(orderId),
            order_description: 'Spectr Trading Pro Upgrade',
        };

        if (ipnCallbackUrl) {
            payload.ipn_callback_url = ipnCallbackUrl;
        }

        console.log('[PaymentService] createPayment payload:', JSON.stringify(payload));

        try {
            const response = await axios.post(`${this.baseUrl}/payment`, payload, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                timeout: 15000,
            });

            console.log('[PaymentService] createPayment response:', JSON.stringify(response.data));

            return {
                paymentId: response.data.payment_id,
                depositAddress: response.data.pay_address,
                payAmount: response.data.pay_amount,
                payCurrency: response.data.pay_currency,
                status: response.data.payment_status,
            };
        } catch (error) {
            const details = error.response?.data;
            console.error('[PaymentService] createPayment error:', details || error.message);
            throw new Error(details?.message || 'Failed to create payment');
        }
    }

    /**
     * Check if a payment is confirmed by its NOWPayments payment_id.
     */
    async checkStatus(paymentId) {
        if (!this.isEnabled()) return { status: 'waiting', isFinished: false };

        try {
            const response = await axios.get(`${this.baseUrl}/payment/${paymentId}`, {
                headers: { 'x-api-key': this.apiKey },
                timeout: 15000,
            });

            const status = response.data.payment_status;
            console.log(`[PaymentService] Status for ${paymentId}: ${status}`);

            return {
                status,
                isFinished: status === 'finished' || status === 'confirmed',
            };
        } catch (error) {
            console.error('[PaymentService] checkStatus error:', error.message);
            return { status: 'error', isFinished: false };
        }
    }

    /**
     * Verify the IPN signature from NOWPayments.
     * Uses timing-safe comparison to prevent timing attacks.
     *
     * @param {Buffer|string} rawBody - The raw request body (Buffer preferred)
     * @param {string} signature     - Value of x-nowpayments-sig header
     * @returns {boolean}
     */
    verifyIpnSignature(rawBody, signature) {
        if (!this.ipnSecret) {
            console.error('[PaymentService] NOWPAYMENTS_IPN_SECRET is not set');
            return false;
        }
        if (!signature) {
            console.warn('[PaymentService] Missing x-nowpayments-sig header');
            return false;
        }

        try {
            // Parse raw body to get object, then sort keys as NOWPayments requires
            const bodyStr = rawBody instanceof Buffer ? rawBody.toString('utf8') : String(rawBody);
            const parsed = JSON.parse(bodyStr);

            const sorted = Object.keys(parsed)
                .sort()
                .reduce((acc, k) => { acc[k] = parsed[k]; return acc; }, {});

            const expectedSig = crypto
                .createHmac('sha512', this.ipnSecret)
                .update(JSON.stringify(sorted))
                .digest('hex');

            // Timing-safe comparison
            const sigBuffer = Buffer.from(signature);
            const expBuffer = Buffer.from(expectedSig);

            if (sigBuffer.length !== expBuffer.length) {
                console.warn('[PaymentService] Signature length mismatch');
                return false;
            }

            const isValid = crypto.timingSafeEqual(sigBuffer, expBuffer);
            if (!isValid) {
                console.warn('[PaymentService] HMAC mismatch — possible spoofing attempt');
                console.warn(`  Received: ${signature}`);
                console.warn(`  Expected: ${expectedSig}`);
            }
            return isValid;
        } catch (e) {
            console.error('[PaymentService] verifyIpnSignature error:', e.message);
            return false;
        }
    }
}

export const paymentService = new PaymentService();
