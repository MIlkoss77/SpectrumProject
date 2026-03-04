/**
 * Capital Shield Service
 * Monitors market volatility and AI confidence to trigger protection protocols.
 */

class CapitalShield {
    constructor() {
        this.status = 'READY'; // READY, ACTIVE, SHIELD_UP, EMERGENCY
        this.riskLevel = 0; // 0-100
        this.lastAlert = null;
        this.onStatusChange = null;
    }

    setCallback(cb) {
        this.onStatusChange = cb;
    }

    /**
     * Analyze market state and update shield status
     */
    update(ticker, aiConfidence) {
        let newRisk = 0;

        // Volatility check (simulated for now based on change percent)
        const vol = Math.abs(ticker?.changePercent || 0);
        if (vol > 5) newRisk += 40;
        else if (vol > 2) newRisk += 20;

        // AI Confidence check
        if (aiConfidence < 30) newRisk += 50;
        else if (aiConfidence < 50) newRisk += 25;

        this.riskLevel = Math.min(newRisk, 100);

        const prevStatus = this.status;
        if (this.riskLevel > 80) this.status = 'EMERGENCY';
        else if (this.riskLevel > 50) this.status = 'SHIELD_UP';
        else if (this.riskLevel > 20) this.status = 'ACTIVE';
        else this.status = 'READY';

        if (prevStatus !== this.status && this.onStatusChange) {
            this.onStatusChange(this.status, this.riskLevel);
        }
    }

    getReport() {
        return {
            status: this.status,
            risk: this.riskLevel,
            protection: this.status === 'EMERGENCY' ? 'Aggressive' : (this.status === 'SHIELD_UP' ? 'Balanced' : 'Passive')
        };
    }
}

export const capitalShield = new CapitalShield();
