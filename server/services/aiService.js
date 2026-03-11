import axios from 'axios';
import { prisma } from '../config/database.js';
import * as encryption from './encryption.js';

/**
 * Forwards a prompt to AI providers using securely stored keys
 */
export const askAI = async (userId, provider, prompt, modelOverride = null) => {
    try {
        // 1. Get Keys from DB
        const creds = await prisma.exchangeCreds.findUnique({
            where: {
                userId_exchange: {
                    userId,
                    exchange: provider.toLowerCase()
                }
            }
        });

        if (!creds) {
            throw new Error(`API key for ${provider} not found in database. Please configure it in Settings.`);
        }

        const apiKey = encryption.decrypt(creds.apiKeyHash);
        if (!apiKey) throw new Error("Failed to decrypt AI API key");

        // 2. Route to specific provider
        if (provider === 'openai') {
            return await callOpenAI(apiKey, prompt, modelOverride);
        } else if (provider === 'anthropic') {
            return await callAnthropic(apiKey, prompt, modelOverride);
        } else {
            throw new Error("Unsupported AI provider");
        }

    } catch (error) {
        console.error('AI Service Error:', error.message);
        throw error;
    }
};

async function callOpenAI(apiKey, prompt, model) {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
    }, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    return response.data.choices[0].message.content;
}

async function callAnthropic(apiKey, prompt, model) {
    const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: model || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: "You must respond with valid JSON.",
        messages: [{ role: 'user', content: prompt }]
    }, {
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
        }
    });

    return response.data.content[0].text;
}
