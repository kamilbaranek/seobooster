export type ProviderName = 'openrouter' | 'openai' | 'anthropic' | 'perplexity';

export type AiTaskType = 'scan' | 'analyze' | 'strategy' | 'article';

export type AiModelMap = Record<AiTaskType, string>;

export interface AiProviderConfig {
  name: ProviderName;
  apiKey: string;
  model: string;
  temperature?: number;
  baseUrl?: string;
}

export interface ScanResult {
  url: string;
  title: string;
  description?: string;
  keywords: string[];
  detectedTechnologies: string[];
}

export interface BusinessProfile {
  name: string;
  tagline?: string;
  mission?: string;
  audience: string[];
  differentiators: string[];
}

export interface SeoStrategy {
  pillars: Array<{
    name: string;
    description?: string;
    clusters: Array<{
      name: string;
      keywords: string[];
      cadenceDays: number;
    }>;
  }>;
  targetTone?: string;
}

export interface ArticleDraft {
  title: string;
  outline: string[];
  bodyMarkdown: string;
  keywords: string[];
  callToAction?: string;
}

export interface AiProvider {
  name: ProviderName;
  scanWebsite(
    url: string,
    overrides?: PromptOverrides<'scan'>
  ): Promise<ScanResult>;
  analyzeBusiness(
    scan: ScanResult,
    overrides?: PromptOverrides<'analyze'>
  ): Promise<BusinessProfile>;
  buildSeoStrategy(
    profile: BusinessProfile,
    overrides?: PromptOverrides<'strategy'>
  ): Promise<SeoStrategy>;
  generateArticle(
    strategy: SeoStrategy,
    options: GenerateArticleOptions,
    overrides?: PromptOverrides<'article'>
  ): Promise<ArticleDraft>;
  getLastRawResponse?(): unknown;
}

export interface GenerateArticleOptions {
  clusterName: string;
  targetTone?: string;
}

export type PromptOverrides<TTask extends AiTaskType> = {
  systemPrompt?: string;
  userPrompt?: string;
  variables?: Record<string, unknown>;
  task?: TTask;
  forceJsonResponse?: boolean;
  rawScanOutput?: string | null;
};
