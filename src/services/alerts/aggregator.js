export const ALERT_TYPES = {
    WHALE: 'WHALE',
    SENTIMENT: 'SENTIMENT',
    TA: 'TA',
    ARBITRAGE: 'ARBITRAGE',
    OPPORTUNITY: 'OPPORTUNITY',
    SYSTEM: 'SYSTEM'
};

export const ALERT_ACTIONS = {
    BUY: 'BUY',
    SELL: 'SELL',
    MONITOR: 'MONITOR',
    NEUTRAL: 'NEUTRAL',
    STAKE: 'STAKE'
};

/**
 * @typedef {Object} Alert
 * @property {string} id - Unique ID
 * @property {string} type - From ALERT_TYPES
 * @property {number} priority - 1-10 score (10 = critical)
 * @property {string} symbol - e.g. 'BTC'
 * @property {string} title - Short headline
 * @property {string} description - Detailed message
 * @property {string} action - From ALERT_ACTIONS
 * @property {number} timestamp - Unix ms
 * @property {boolean} viewed - read status
 * @property {Object} metadata - flexible payload (txHash, price, etc)
 */

class AlertAggregator {
    constructor() {
        this.subscribers = [];
        this.alerts = [];
        this.maxAlerts = 50;

        // Load persisted alerts if needed (for now, in-memory)
        this.loadMockAlerts();
    }

    loadMockAlerts() {
        // Some initial credible-looking data
        const now = Date.now();
        this.add({
            type: ALERT_TYPES.WHALE,
            priority: 9,
            symbol: 'ETH',
            title: 'Massive ETH Outflow Detected',
            description: '$12.5M ETH moved from Binance to Unknown Wallet. Often a bullish holding signal.',
            action: ALERT_ACTIONS.BUY,
            timestamp: now - 1000 * 60 * 15, // 15m ago
            metadata: { source: 'etherscan' }
        });

        this.add({
            type: ALERT_TYPES.TA,
            priority: 7,
            symbol: 'SOL',
            title: 'SOL RSI Oversold (Daily)',
            description: 'RSI dropped below 30 on the 4H chart. Potential bounce incoming.',
            action: ALERT_ACTIONS.MONITOR,
            timestamp: now - 1000 * 60 * 45, // 45m ago
        });
    }

    /**
     * Add a new alert to the system
     * @param {Partial<Alert>} alertData 
     */
    add(alertData) {
        // Deduplication: If ID is provided, check if it already exists
        if (alertData.id && this.alerts.some(a => a.id === alertData.id)) {
            return;
        }

        const newAlert = {
            id: alertData.id || `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: Date.now(),
            viewed: false,
            priority: 5, // default
            ...alertData
        };

        // Auto-calculate priority if not provided
        if (!alertData.priority) {
            newAlert.priority = this.calculatePriority(newAlert);
        }

        this.alerts = [newAlert, ...this.alerts].slice(0, this.maxAlerts);
        this.notifySubscribers();

        return newAlert;
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.alerts); // immediate update
        return () => {
            this.subscribers = this.subscribers.filter(s => s !== callback);
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(cb => cb(this.alerts));
    }

    getAlerts() {
        return this.alerts;
    }

    dismiss(id) {
        this.alerts = this.alerts.filter(a => a.id !== id);
        this.notifySubscribers();
    }

    // Simple heuristic for priority
    calculatePriority(alert) {
        let score = 5;
        if (alert.type === ALERT_TYPES.WHALE) score += 2;
        if (alert.type === ALERT_TYPES.ARBITRAGE) score += 3;
        if (alert.type === ALERT_TYPES.OPPORTUNITY) score += 2;
        if (alert.action === ALERT_ACTIONS.BUY || alert.action === ALERT_ACTIONS.SELL) score += 1;
        if (alert.action === ALERT_ACTIONS.STAKE) score += 1;
        return Math.min(score, 10);
    }
}

// Singleton instance
export const alertService = new AlertAggregator();
