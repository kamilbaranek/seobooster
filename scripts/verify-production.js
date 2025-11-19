
try {
    const { buildAiProviderFromEnv } = require('@seobooster/ai-providers');
    const { provider } = buildAiProviderFromEnv();
    console.log('Provider:', provider.name);
    console.log('Has generateImage:', typeof provider.generateImage);
} catch (e) {
    console.error('Error:', e);
}
