// src/services/ai/llmProvider.js

export async function askAgent(prompt) {
    const provider = localStorage.getItem('ai_provider') || 'openai';
    const apiKey = localStorage.getItem(`${provider}_api_key`);

    if (!apiKey) {
        throw new Error(`API key for ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} not found in Settings.`);
    }

    if (provider === 'openai') {
        return await callOpenAI(apiKey, prompt);
    } else if (provider === 'anthropic') {
        return await callAnthropic(apiKey, prompt);
    } else {
        throw new Error('Unsupported AI provider.');
    }
}

async function callOpenAI(apiKey, prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: localStorage.getItem('openai_model') || 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
}

async function callAnthropic(apiKey, prompt) {
    // We use standard anthropic fetch and add the dangerous direct browser access header
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: localStorage.getItem('anthropic_model') || 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: "You must respond with valid JSON.",
            messages: [{ role: 'user', content: prompt }]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Try to parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) { }
    }
    return JSON.parse(content);
}
