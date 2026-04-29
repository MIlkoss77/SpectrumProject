// src/services/ai/llmProvider.js

import axios from 'axios';

export async function askAgent(prompt) {
    const provider = localStorage.getItem('ai_provider') || 'openai';
    const token = localStorage.getItem('spectr_auth_token'); // JWT

    try {
        const response = await axios.post('/api/ai/ask', {
            provider,
            prompt,
            model: localStorage.getItem(`${provider}_model`) || null
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.ok) {
            return response.data.data;
        } else {
            throw new Error(response.data.error || 'AI Request failed');
        }
    } catch (error) {
        console.error('AI Proxy Error:', error.message);
        throw error;
    }
}


