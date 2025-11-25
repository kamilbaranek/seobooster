import { OpenRouterProvider } from './libs/ai-providers/src/providers/openrouter.provider';
import { AiTaskType } from '@seobooster/ai-types';

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set');
    process.exit(1);
}

async function verifyCost() {
    console.log('Verifying OpenRouter Cost Calculation...');

    const provider = new OpenRouterProvider({
        apiKey,
        modelMap: {
            article: 'openai/gpt-3.5-turbo',
            article_image: 'google/imagen-3', // Dummy
            scan: 'openai/gpt-3.5-turbo',
            analyze: 'openai/gpt-3.5-turbo',
            strategy: 'openai/gpt-3.5-turbo',
        },
        siteUrl: 'https://seobooster.com',
        appName: 'SeoBooster',
        model: 'openai/gpt-3.5-turbo'
    });

    // Wait for pricing to fetch (it's fire-and-forget in constructor)
    console.log('Waiting for pricing to fetch...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        const response = await provider.chat([
            { role: 'user', content: 'Hello, say "test" and nothing else.' }
        ], {
            model: 'openai/gpt-3.5-turbo',
            maxTokens: 10
        });

        console.log('Response:', response.content);
        console.log('Usage:', JSON.stringify(response.usage, null, 2));

        if (response.usage && response.usage.totalCost > 0) {
            console.log('SUCCESS: Cost is greater than 0');
        } else {
            console.error('FAILURE: Cost is 0 or undefined');
            process.exit(1);
        }

    } catch (error) {
        console.error('Error calling provider:', error);
        process.exit(1);
    }
}

verifyCost();
