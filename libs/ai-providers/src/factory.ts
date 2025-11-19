import {
  AiModelMap,
  AiProvider,
  ProviderName
} from '@seobooster/ai-types';
import { MockAiProvider } from './providers/mock.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { GoogleAiProvider } from './providers/google-ai.provider';

export interface ProviderFactoryOptions {
  modelOverrides?: Partial<AiModelMap>;
  providerOverride?: ProviderName;
}

const buildModelMap = (overrides?: Partial<AiModelMap>, providerName?: ProviderName): AiModelMap => {
  // Determine default image model based on provider
  let defaultImageModel = 'pollinations/image'; // OpenRouter default
  if (providerName === 'google') {
    defaultImageModel = 'gemini-2.0-flash-exp';
  }

  return {
    scan: overrides?.scan ?? process.env.AI_MODEL_SCAN ?? 'openrouter/auto',
    analyze: overrides?.analyze ?? process.env.AI_MODEL_ANALYZE ?? 'openrouter/auto',
    strategy: overrides?.strategy ?? process.env.AI_MODEL_STRATEGY ?? 'openrouter/auto',
    article: overrides?.article ?? process.env.AI_MODEL_ARTICLE ?? 'openrouter/auto',
    article_image: overrides?.article_image ?? process.env.AI_MODEL_ARTICLE_IMAGE ?? defaultImageModel
  };
};

export const buildAiProviderFromEnv = (
  options?: ProviderFactoryOptions
): { provider: AiProvider; modelMap: AiModelMap } => {
  const providerName = options?.providerOverride ?? ((process.env.AI_PROVIDER as ProviderName) ?? 'openrouter');
  const modelMap = buildModelMap(options?.modelOverrides, providerName);

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

  if (providerName === 'google') {
    return {
      modelMap,
      provider: new GoogleAiProvider({
        name: 'google',
        apiKey: process.env.GOOGLE_AI_API_KEY ?? '',
        model: modelMap.article,
        modelMap
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
