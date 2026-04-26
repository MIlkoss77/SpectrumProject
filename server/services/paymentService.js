import axios from 'axios';
import crypto from 'crypto';

/**
 * Service to handle automated crypto payments via NOWPayments API.
 * Ref: https://nowpayments.io/api-docs
 */
class PaymentService {
    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY || '';
        this.ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || '';
        this.baseUrl = 'https://api.nowpayments.io/v1';
    }

    isEnabled() {
        return !!this.apiKey;
    }

    /**
     * Create a payment request and return the deposit address
     */
    async createPayment({ amount, currency, orderId }) {
        if (!this.isEnabled()) {
            throw new Error('PAYMENT_GATEWAY_NOT_CONFIGURED');
        }

        try {
            const response = await axios.post(`${this.baseUrl}/payment`, {
                price_amount: amount,
                price_currency: 'usd',
                pay_currency: currency.toLowerCase(),
                order_id: orderId,
                case: 'pro_upgrade'
            }, {
                headers: { 'x-api-key': this.apiKey },
                timeout: 15000
            });

            return {
                paymentId: response.data.payment_id,
                depositAddress: response.data.pay_address,
                payAmount: response.data.pay_amount,
                payCurrency: response.data.pay_currency,
                status: response.data.payment_status
            };
        } catch (error) {
            console.error('[PaymentService] Create error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Check if a payment is confirmed
     */
    async checkStatus(paymentId) {
        if (!this.isEnabled()) return { status: 'waiting' };

        try {
            const response = await axios.get(`${this.baseUrl}/payment/${paymentId}`, {
                headers: { 'x-api-key': this.apiKey },
                timeout: 15000
            });

            return {
                status: response.data.payment_status, // 'waiting', 'confirming', 'confirmed', 'finished'
                isFinished: response.data.payment_status === 'finished' || response.data.payment_status === 'confirmed'
            };
        } catch (error) {
            console.error('[PaymentService] Status check error:', error.message);
            return { status: 'error' };
        }
    }

    /**
     * Verify the IPN signature from NOWPayments
     * @param {Object} body - Raw request body
     * @param {string} signature - x-nowpayments-sig header
     */
    verifyIpnSignature(body, signature) {
        if (!this.ipnSecret || !signature) return false;
        
        const sortedBody = {};
        Object.keys(body).sort().forEach(key => {
            sortedBody[key] = body[key];
        });

        const hmac = crypto.createHmac('sha512', this.ipnSecret);
        hmac.update(JSON.stringify(sortedBody));
        const checkSig = hmac.digest('hex');
        
        return checkSig === signature;
    }
}

export const paymentService = new PaymentService();
