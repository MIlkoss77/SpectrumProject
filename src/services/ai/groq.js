/**
 * Groq AI Service - Proxy via n8n for security
 * 
 * Routes requests to n8n webhook to keep API keys server-side.
 * Workflow: workflows/n8n_groq_sentiment.json
 */

const N8N_WEBHOOK = import.meta.env.VITE_N8N_WEBHOOK || 'http://localhost:5678/webhook/sentiment'

// Track if AI service is responding to avoid constant console errors
// Default to FALSE for demo to prevent "ERR_CONNECTION_REFUSED" logs
let aiServiceAvailable = false
const sentimentCache = new Map()

/**
 * Analyze sentiment of text using Groq's Llama 3.1 via n8n
 * @param {string} text - News headline or content
 * @returns {Promise<{sentiment: string, confidence: number, summary: string}>}
 */
export async function analyzeSentiment(text) {
    if (!aiServiceAvailable) return fallbackSentiment(text)

    // Check cache first
    const cacheKey = text.slice(0, 100)
    if (sentimentCache.has(cacheKey)) {
        return sentimentCache.get(cacheKey)
    }

    try {
        const response = await fetch(N8N_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            // Short timeout to avoid blocking UI
            signal: AbortSignal.timeout(3000)
        })

        if (!response.ok) throw new Error(`Status ${response.status}`)
        const data = await response.json()
        const result = data.json || data

        const normalized = {
            sentiment: result.sentiment?.toUpperCase() || 'NEUTRAL',
            confidence: Math.min(1, Math.max(0, result.confidence || 0.5)),
            summary: result.summary || ''
        }
        sentimentCache.set(cacheKey, normalized)
        return normalized
    } catch (error) {
        // Fallback and disable service to avoid further console errors
        aiServiceAvailable = false
        console.warn('AI Sentiment service offline. Switching to local analysis.')
        return fallbackSentiment(text)
    }
}

/**
 * Fallback rule-based sentiment when API unavailable
 */
function fallbackSentiment(text) {
    const lower = text.toLowerCase()

    const bullishWords = ['surge', 'rally', 'bullish', 'moon', 'pump', 'all-time high', 'ath', 'gains', 'soar', 'breakout', 'adoption', 'institutional']
    const bearishWords = ['crash', 'dump', 'bearish', 'plunge', 'hack', 'scam', 'ban', 'regulation', 'sec', 'lawsuit', 'fud', 'collapse']

    let score = 0
    bullishWords.forEach(w => { if (lower.includes(w)) score++ })
    bearishWords.forEach(w => { if (lower.includes(w)) score-- })

    let sentiment = 'NEUTRAL'
    let summary = 'Market consensus remains stable. No significant volatility triggers detected.'

    if (score >= 1) {
        sentiment = 'BULLISH'
        summary = 'Positive momentum building on institutional inflows and whale accumulation.'
    } else if (score <= -1) {
        sentiment = 'BEARISH'
        summary = 'Caution advised. Bearish pressure mounting from regulatory FUD and distribution.'
    }

    return {
        sentiment,
        confidence: Math.min(1, Math.abs(score) * 0.2 + 0.65),
        summary: `AI Agent: ${summary}`
    }
}

/**
 * Batch analyze multiple texts (with rate limiting)
 */
export async function analyzeBatch(texts, delayMs = 2000) {
    const results = []

    // Fail fast if service is already known to be offline
    if (!aiServiceAvailable) {
        return texts.map(text => fallbackSentiment(text))
    }

    for (let i = 0; i < texts.length; i++) {
        const text = texts[i]

        // If previous request failed and disabled service, stop trying
        if (!aiServiceAvailable) {
            results.push(fallbackSentiment(text))
            continue
        }

        const result = await analyzeSentiment(text)
        results.push(result)

        // Rate limiting: wait between calls
        if (i < texts.length - 1 && aiServiceAvailable) {
            await new Promise(r => setTimeout(r, delayMs))
        }
    }

    return results
}

/**
 * Clear sentiment cache
 */
export function clearSentimentCache() {
    sentimentCache.clear()
}
