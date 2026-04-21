import axios from 'axios';

/**
 * Service to handle automated crypto payments via NOWPayments API.
 * Ref: https://nowpayments.io/api-docs
 */
class PaymentService {
    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY || ''; // Needs to be set in .env
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
                headers: { 'x-api-key': this.apiKey }
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
                headers: { 'x-api-key': this.apiKey }
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
}

export const paymentService = new PaymentService();
