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
  AiTaskType
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

  constructor(private readonly config: OpenRouterProviderConfig) {}

  private async requestJson<T>(
    task: AiTaskType,
    systemPrompt: string,
    userPrompt: string,
    fallback: T
  ): Promise<T> {
    const apiKey = this.config.apiKey;
    const model = this.config.modelMap[task] ?? this.config.model;

    if (!apiKey) {
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

      if (!response.ok) {
        return fallback;
      }

      const completion = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        return fallback;
      }

      const parsed: JsonResponse<T> | T = JSON.parse(content);
      if (typeof parsed === 'object' && parsed !== null && 'data' in parsed && 'success' in parsed) {
        const structured = parsed as JsonResponse<T>;
        return structured.success ? structured.data : fallback;
      }

      return parsed as T;
    } catch (error) {
      return fallback;
    }
  }

  async scanWebsite(url: string): Promise<ScanResult> {
    const fallback: ScanResult = {
      url,
      title: `Scan of ${url}`,
      description: '',
      keywords: [],
      detectedTechnologies: []
    };

    return this.requestJson<ScanResult>(
      'scan',
      'You extract structured metadata about websites. Always return JSON object { success: boolean, data: ScanResult }.',
      `Analyze the website ${url} and provide title, short description, keywords array, and detected technologies.`,
      fallback
    );
  }

  async analyzeBusiness(scan: ScanResult): Promise<BusinessProfile> {
    const fallback: BusinessProfile = {
      name: scan.title || scan.url,
      tagline: '',
      mission: '',
      audience: [],
      differentiators: []
    };

    return this.requestJson<BusinessProfile>(
      'analyze',
      'You convert website scan data into a business profile. Return JSON { success, data } where data is BusinessProfile.',
      `Scan Result: ${JSON.stringify(scan)}\nCreate a concise business profile.`,
      fallback
    );
  }

  async buildSeoStrategy(profile: BusinessProfile): Promise<SeoStrategy> {
    const fallback: SeoStrategy = {
      pillars: [],
      targetTone: profile.tagline ? 'Brand voice' : undefined
    };

    return this.requestJson<SeoStrategy>(
      'strategy',
      'You design SEO strategies with pillars and topic clusters. Respond with JSON { success, data }.',
      `Business profile: ${JSON.stringify(profile)}\nGenerate an initial SEO strategy with at least one pillar and cluster keywords.`,
      fallback
    );
  }

  async generateArticle(strategy: SeoStrategy, options: GenerateArticleOptions): Promise<ArticleDraft> {
    const fallback: ArticleDraft = {
      title: `Article for ${options.clusterName}`,
      outline: [],
      bodyMarkdown: '',
      keywords: [],
      callToAction: undefined
    };

    return this.requestJson<ArticleDraft>(
      'article',
      'You write high quality SEO articles. Always return JSON { success, data } with ArticleDraft fields.',
      `SEO Strategy: ${JSON.stringify(strategy)}\nSelected cluster: ${options.clusterName}\nTone: ${
        options.targetTone ?? strategy.targetTone ?? 'Professional'
      }\nProduce a detailed outline, markdown body, keywords, and CTA.`,
      fallback
    );
  }
}

