import {
  AiModelMap,
  AiProvider,
  ProviderName
} from '@seobooster/ai-types';
import { MockAiProvider } from './providers/mock.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

export interface ProviderFactoryOptions {
  modelOverrides?: Partial<AiModelMap>;
  providerOverride?: ProviderName;
}

const buildModelMap = (overrides?: Partial<AiModelMap>): AiModelMap => ({
  scan: overrides?.scan ?? process.env.AI_MODEL_SCAN ?? 'openrouter/auto',
  analyze: overrides?.analyze ?? process.env.AI_MODEL_ANALYZE ?? 'openrouter/auto',
  strategy: overrides?.strategy ?? process.env.AI_MODEL_STRATEGY ?? 'openrouter/auto',
  article: overrides?.article ?? process.env.AI_MODEL_ARTICLE ?? 'openrouter/auto'
});

export const buildAiProviderFromEnv = (
  options?: ProviderFactoryOptions
): { provider: AiProvider; modelMap: AiModelMap } => {
  const modelMap = buildModelMap(options?.modelOverrides);
  const providerName = options?.providerOverride ?? ((process.env.AI_PROVIDER as ProviderName) ?? 'openrouter');

  if (providerName === 'openrouter') {
    return {
      modelMap,
      provider: new OpenRouterProvider({
        name: 'openrouter',
        apiKey: process.env.OPENROUTER_API_KEY ?? '',
        baseUrl: process.env.OPENROUTER_BASE_URL,
        model: modelMap.article,
        modelMap,
        siteUrl: process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3333',
        appName: process.env.OPENROUTER_APP_NAME ?? 'SEO Booster'
      })
    };
  }

  return {
    modelMap,
    provider: new MockAiProvider(
      {
        name: providerName,
        apiKey: process.env.OPENAI_API_KEY ?? '',
        model: modelMap.article
      },
      modelMap
    )
  };
};
