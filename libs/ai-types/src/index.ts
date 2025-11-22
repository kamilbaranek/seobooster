export type ProviderName = 'openrouter' | 'openai' | 'anthropic' | 'perplexity' | 'google';

export type AiTaskType = 'scan' | 'analyze' | 'strategy' | 'article' | 'article_image';

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
  business: {
    name: string;
    description: string;
    target_audience: string;
  };
  topic_clusters: Array<{
    pillar_page: string;
    pillar_keywords: string[];
    cluster_intent: string;
    funnel_stage: string;
    supporting_articles: Array<{
      title: string;
      keywords: string[];
      intent: string;
      funnel_stage: string;
      meta_description: string;
    }>;
  }>;
  total_clusters: number;
}

export interface ArticleDraft {
  title: string;
  outline: string[];
  bodyMarkdown: string;
  keywords: string[];
  callToAction?: string;
}

/**
 * Message for chat-based text generation
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for chat-based text generation
 */
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

/**
 * Result from chat-based text generation
 */
export interface ChatResult {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
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
  generateImage(
    request: GenerateImageRequest,
    overrides?: PromptOverrides<'article_image'>
  ): Promise<GeneratedImageResult>;
  /**
   * Generic chat-based text generation for multi-step prompts
   */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResult>;
  getLastRawResponse?(): unknown;
}

export interface GenerateArticleOptions {
  clusterName: string;
  targetTone?: string;
}

export type GenerateImageSize = 'square' | 'landscape' | 'portrait';

export interface GenerateImageRequest {
  prompt: string;
  size?: GenerateImageSize;
  suggestedFileName?: string;
}

export interface GeneratedImageResult {
  data: ArrayBuffer | Uint8Array | Buffer;
  mimeType: string;
  source?: string;
  suggestedFileName?: string;
}

export type PromptOverrides<TTask extends AiTaskType> = {
  systemPrompt?: string;
  userPrompt?: string;
  variables?: Record<string, unknown>;
  task?: TTask;
  forceJsonResponse?: boolean;
  rawScanOutput?: string | null;
};
