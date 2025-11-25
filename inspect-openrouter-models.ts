import { fetch } from 'undici';

async function testOpenRouterModels() {
    console.log('Fetching OpenRouter Models...');

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models');
        const data = await response.json();

        // Log the first few models to see the structure
        console.log('Response Status:', response.status);
        if (data && data.data && data.data.length > 0) {
            console.log('First model structure:', JSON.stringify(data.data[0], null, 2));

            // Check for specific models mentioned by user
            const targetModels = ['openai/gpt-5', 'google/gemini-3-pro-preview', 'anthropic/claude-3.7-sonnet'];
            const foundModels = data.data.filter((m: any) => targetModels.some(tm => m.id.includes(tm)));
            console.log('Found target models:', JSON.stringify(foundModels, null, 2));
        } else {
            console.log('No models found or unexpected structure:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Error calling OpenRouter:', error);
    }
}

testOpenRouterModels();
