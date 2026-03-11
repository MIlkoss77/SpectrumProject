import * as aiService from '../services/aiService.js';

export const handleAiAsk = async (req, res) => {
    try {
        const { userId } = req.user;
        const { provider, prompt, model } = req.body;

        if (!provider || !prompt) {
            return res.status(400).json({ ok: false, error: 'Provider and prompt are required' });
        }

        const responseContent = await aiService.askAI(userId, provider, prompt, model);
        
        // Try to parse JSON if possible, otherwise return as string
        let data;
        try {
            data = JSON.parse(responseContent);
        } catch (e) {
            data = responseContent;
        }

        res.json({ ok: true, data });
    } catch (error) {
        console.error('AI Controller Error:', error.message);
        res.status(500).json({ ok: false, error: error.message || 'AI request failed' });
    }
};
