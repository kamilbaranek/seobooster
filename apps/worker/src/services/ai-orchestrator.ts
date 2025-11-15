import { buildAiProviderFromEnv } from '@seobooster/ai-providers';

const { provider, modelMap } = buildAiProviderFromEnv();

export const aiProvider = provider;
export const aiModelMap = modelMap;

