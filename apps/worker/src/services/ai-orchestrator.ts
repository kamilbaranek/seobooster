import { buildAiProviderFromEnv } from '@seobooster/ai-providers';
import { ProviderName } from '@seobooster/ai-types';

const DEFAULT_PROVIDER: ProviderName = process.env.OPENROUTER_API_KEY ? 'openrouter' : 'google';
const { provider, modelMap } = buildAiProviderFromEnv({
  providerOverride: DEFAULT_PROVIDER
});

export const aiProvider = provider;
export const aiModelMap = modelMap;
