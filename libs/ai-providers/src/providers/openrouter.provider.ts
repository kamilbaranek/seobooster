import { fetch } from 'undici';
import {
  AiModelMap,
  AiProvider,
  AiProviderConfig,
  ArticleDraft,
  BusinessProfile,
  GenerateArticleOptions,
  ScanResult,
  SeoStrategy,
  AiTaskType,
  PromptOverrides
} from '@seobooster/ai-types';

interface OpenRouterProviderConfig extends AiProviderConfig {
  modelMap: AiModelMap;
  siteUrl: string;
  appName: string;
}

type JsonResponse<T> = {
  success: boolean;
  data: T;
};

export class OpenRouterProvider implements AiProvider {
  name: AiProvider['name'] = 'openrouter';
  private lastRawResponse: unknown;

  constructor(private readonly config: OpenRouterProviderConfig) {}

  getLastRawResponse() {
    return this.lastRawResponse;
  }

  private async requestJson<T>(
    task: AiTaskType,
    systemPrompt: string,
    userPrompt: string,
    fallback: T
  ): Promise<T> {
    const apiKey = this.config.apiKey;
    const model = this.config.modelMap[task] ?? this.config.model;
    this.lastRawResponse = undefined;

    if (!apiKey) {
      this.lastRawResponse = { error: 'missing_api_key' };
      return fallback;
    }

    try {
      const response = await fetch(`${this.config.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': this.config.siteUrl,
          'X-Title': this.config.appName
        },
        body: JSON.stringify({
          model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      const responseText = await response.text();
      let completion: unknown;
      try {
        completion = JSON.parse(responseText);
      } catch {
        completion = responseText;
      }
      this.lastRawResponse = completion;

      if (!response.ok) {
        throw new Error(`OpenRouter responded ${response.status}: ${responseText}`);
      }

      if (typeof completion !== 'object' || completion === null) {
        throw new Error('OpenRouter returned unexpected payload');
      }

      const completionTyped = completion as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = completionTyped.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('OpenRouter response missing content');
      }

      const parsed: JsonResponse<T> | T = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null && 'data' in parsed && 'success' in parsed) {
        const structured = parsed as JsonResponse<T>;
        return structured.success ? structured.data : fallback;
      }

      return parsed as T;
    } catch (error) {
      throw error;
    }
  }

  async scanWebsite(url: string, overrides?: PromptOverrides<'scan'>): Promise<ScanResult> {
    const fallback: ScanResult = {
      url,
      title: `Scan of ${url}`,
      description: '',
      keywords: [],
      detectedTechnologies: []
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You extract structured metadata about websites. Always return JSON object { success: boolean, data: ScanResult }.';
    const userPrompt =
      overrides?.userPrompt ??
      `Analyze the website ${url} and provide title, short description, keywords array, and detected technologies.`;

    return this.requestJson<ScanResult>(
      'scan',
      systemPrompt,
      userPrompt,
      fallback
    );
  }

  async analyzeBusiness(
    scan: ScanResult,
    overrides?: PromptOverrides<'analyze'>
  ): Promise<BusinessProfile> {
    const fallback: BusinessProfile = {
      name: scan.title || scan.url,
      tagline: '',
      mission: '',
      audience: [],
      differentiators: []
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You convert website scan data into a business profile. Return JSON { success, data } where data is BusinessProfile.';
    const userPrompt =
      overrides?.userPrompt ??
      `Scan Result: ${JSON.stringify(scan)}\nCreate a concise business profile.`;

    return this.requestJson<BusinessProfile>(
      'analyze',
      systemPrompt,
      userPrompt,
      fallback
    );
  }

  async buildSeoStrategy(
    profile: BusinessProfile,
    overrides?: PromptOverrides<'strategy'>
  ): Promise<SeoStrategy> {
    const fallback: SeoStrategy = {
      pillars: [],
      targetTone: profile.tagline ? 'Brand voice' : undefined
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You design SEO strategies with pillars and topic clusters. Respond with JSON { success, data }.';
    const userPrompt =
      overrides?.userPrompt ??
      `Business profile: ${JSON.stringify(
        profile
      )}\nGenerate an initial SEO strategy with at least one pillar and cluster keywords.`;

    return this.requestJson<SeoStrategy>(
      'strategy',
      systemPrompt,
      userPrompt,
      fallback
    );
  }

  async generateArticle(
    strategy: SeoStrategy,
    options: GenerateArticleOptions,
    overrides?: PromptOverrides<'article'>
  ): Promise<ArticleDraft> {
    const fallback: ArticleDraft = {
      title: `Article for ${options.clusterName}`,
      outline: [],
      bodyMarkdown: '',
      keywords: [],
      callToAction: undefined
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You write high quality SEO articles. Always return JSON { success, data } with ArticleDraft fields.';
    const tone = options.targetTone ?? strategy.targetTone ?? 'Professional';
    const userPrompt =
      overrides?.userPrompt ??
      `SEO Strategy: ${JSON.stringify(strategy)}\nSelected cluster: ${
        options.clusterName
      }\nTone: ${tone}\nProduce a detailed outline, markdown body, keywords, and CTA.`;

    const variables = overrides?.variables ?? {};

    return this.requestJson<ArticleDraft>(
      'article',
      systemPrompt,
      userPrompt,
      fallback
    );
  }
}
