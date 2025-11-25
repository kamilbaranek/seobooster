import { fetch } from 'undici';

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set');
    process.exit(1);
}

async function testOpenRouter() {
    console.log('Testing OpenRouter API...');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://seobooster.com', // Optional, for including your app on openrouter.ai rankings.
                'X-Title': 'SeoBooster', // Optional. Shows in rankings on openrouter.ai.
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo', // Use a cheap/standard model
                messages: [
                    { role: 'user', content: 'Hello, what is the cost of this request?' }
                ],
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Full Response Body:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Error calling OpenRouter:', error);
    }
}

testOpenRouter();
