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
  scanWebsite(url: string): Promise<ScanResult>;
  analyzeBusiness(scan: ScanResult): Promise<BusinessProfile>;
  buildSeoStrategy(profile: BusinessProfile): Promise<SeoStrategy>;
  generateArticle(strategy: SeoStrategy, options: GenerateArticleOptions): Promise<ArticleDraft>;
}

export interface GenerateArticleOptions {
  clusterName: string;
  targetTone?: string;
}
