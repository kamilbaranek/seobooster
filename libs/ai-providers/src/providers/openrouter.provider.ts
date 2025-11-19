import { fetch } from 'undici';
import { Buffer } from 'node:buffer';
import {
  AiModelMap,
  AiProvider,
  AiProviderConfig,
  ArticleDraft,
  BusinessProfile,
  GenerateArticleOptions,
  GenerateImageRequest,
  GenerateImageSize,
  GeneratedImageResult,
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

const STRATEGY_JSON_SCHEMA = {
  type: 'object',
  properties: {
    business: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        target_audience: { type: 'string' }
      },
      required: ['name', 'description', 'target_audience'],
      additionalProperties: false
    },
    topic_clusters: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pillar_page: { type: 'string' },
          pillar_keywords: {
            type: 'array',
            items: { type: 'string' }
          },
          cluster_intent: { type: 'string' },
          funnel_stage: { type: 'string' },
          supporting_articles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                keywords: {
                  type: 'array',
                  items: { type: 'string' }
                },
                intent: { type: 'string' },
                funnel_stage: { type: 'string' },
                meta_description: { type: 'string' }
              },
              required: ['title', 'keywords'],
              additionalProperties: false
            }
          }
        },
        required: ['pillar_page', 'pillar_keywords', 'supporting_articles'],
        additionalProperties: false
      }
    },
    total_clusters: { type: 'integer' }
  },
  required: ['business', 'topic_clusters'],
  additionalProperties: false
} as const;

export class OpenRouterProvider implements AiProvider {
  name: AiProvider['name'] = 'openrouter';
  private lastRawResponse: unknown;
  private lastMessageContent?: string;

  constructor(private readonly config: OpenRouterProviderConfig) { }

  getLastRawResponse() {
    return this.lastRawResponse;
  }

  getLastMessageContent() {
    return this.lastMessageContent;
  }

  private async requestJson<T>(
    task: AiTaskType,
    systemPrompt: string,
    userPrompt: string,
    forceJsonResponse: boolean,
    fallback: T
  ): Promise<T> {
    const apiKey = this.config.apiKey;
    const model = this.config.modelMap[task] ?? this.config.model;
    this.lastRawResponse = undefined;
    this.lastMessageContent = undefined;

    if (!apiKey) {
      this.lastRawResponse = { error: 'missing_api_key' };
      return fallback;
    }

    const body: Record<string, unknown> = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    if (forceJsonResponse) {
      if (task === 'strategy') {
        body.response_format = {
          type: 'json_schema',
          json_schema: {
            name: 'seo_strategy',
            strict: true,
            schema: STRATEGY_JSON_SCHEMA
          }
        };
      } else {
        body.response_format = { type: 'json_object' };
      }
    }

    const response = await fetch(`${this.config.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': this.config.siteUrl,
        'X-Title': this.config.appName
      },
      body: JSON.stringify(body)
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

    this.lastMessageContent = content;

    const tryParseJson = (text: string): JsonResponse<T> | T => {
      return JSON.parse(text) as JsonResponse<T> | T;
    };

    let parsed: JsonResponse<T> | T;
    try {
      parsed = tryParseJson(content);
    } catch (parseError) {
      // Některé modely (zejména když JSON mode není plně podporovaný)
      // vrací JSON zabalený v ```json ... ``` nebo podobném code fence.
      const fenceMatch = content.match(/```[a-zA-Z0-9_-]*\s*([\s\S]*?)```/);
      if (fenceMatch && fenceMatch[1]) {
        const inner = fenceMatch[1].trim();
        try {
          parsed = tryParseJson(inner);
        } catch (innerError) {
          if (forceJsonResponse) {
            throw innerError;
          }
          return fallback;
        }
      } else {
        if (forceJsonResponse) {
          throw parseError;
        }
        return fallback;
      }
    }
    if (typeof parsed === 'object' && parsed !== null && 'data' in parsed && 'success' in parsed) {
      const structured = parsed as JsonResponse<T>;
      return structured.success ? structured.data : fallback;
    }

    return parsed as T;
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

    const forceJsonResponse = overrides?.forceJsonResponse !== false;
    return this.requestJson<ScanResult>('scan', systemPrompt, userPrompt, forceJsonResponse, fallback);
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

    const forceJsonResponse = overrides?.forceJsonResponse !== false;
    return this.requestJson<BusinessProfile>('analyze', systemPrompt, userPrompt, forceJsonResponse, fallback);
  }

  async buildSeoStrategy(
    profile: BusinessProfile,
    overrides?: PromptOverrides<'strategy'>
  ): Promise<SeoStrategy> {
    const fallback: SeoStrategy = {
      business: {
        name: profile.name,
        description: profile.mission ?? profile.tagline ?? '',
        target_audience: Array.isArray(profile.audience)
          ? profile.audience.join(', ')
          : profile.audience
            ? String(profile.audience)
            : 'Unknown audience'
      },
      topic_clusters: [],
      total_clusters: 0
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You design SEO strategies for websites. Respond strictly in JSON matching the seo_strategy schema (business, topic_clusters, total_clusters). Do not wrap the JSON in markdown fences.';
    const userPrompt =
      overrides?.userPrompt ??
      `Business profile: ${JSON.stringify(
        profile
      )}\nBased on this, propose an SEO strategy JSON object with keys business, topic_clusters and total_clusters, following the agreed schema.`;

    const forceJsonResponse = overrides?.forceJsonResponse !== false;
    return this.requestJson<SeoStrategy>('strategy', systemPrompt, userPrompt, forceJsonResponse, fallback);
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
    const tone = options.targetTone ?? 'Professional';
    const userPrompt =
      overrides?.userPrompt ??
      `SEO Strategy: ${JSON.stringify(strategy)}\nSelected cluster: ${options.clusterName
      }\nTone: ${tone}\nProduce a detailed outline, markdown body, keywords, and CTA.`;

    const forceJsonResponse = overrides?.forceJsonResponse !== false;
    return this.requestJson<ArticleDraft>('article', systemPrompt, userPrompt, forceJsonResponse, fallback);
  }

  async generateImage(
    request: GenerateImageRequest,
    overrides?: PromptOverrides<'article_image'>
  ): Promise<GeneratedImageResult> {
    const prompt = (overrides?.userPrompt ?? request.prompt ?? '').trim();
    if (!prompt) {
      throw new Error('Image prompt is empty');
    }

    const model = this.config.modelMap.article_image;
    if (!model) {
      throw new Error('No model configured for article_image task');
    }

    // Check if model supports image generation (has 'image' in output_modalities)
    // For now, we'll try to use it and fall back to Pollinations if it fails
    const supportsImageGeneration = model.includes('image') || model.includes('gemini');

    if (!supportsImageGeneration) {
      // Fallback to Pollinations AI for models that don't support image generation
      return this.generateImageWithPollinations(request, prompt);
    }

    // Use OpenRouter chat completions API for image generation
    // Note: Some models may not support the modalities parameter
    const payload = {
      model,
      messages: [
        {
          role: 'user' as const,
          content: prompt
        }
      ],
      max_tokens: 4096  // Increased for potential base64 image data
    };

    this.lastRawResponse = undefined;
    this.lastMessageContent = prompt;

    const response = await fetch(`${this.config.baseUrl ?? 'https://openrouter.ai/api/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'HTTP-Referer': this.config.siteUrl,
        'X-Title': this.config.appName
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenRouter image generation failed ${response.status}: ${text}`);
    }

    const result = (await response.json()) as {
      choices: Array<{
        message: {
          content: string | Array<{ type: string; image_url?: { url: string }; text?: string }>;
        };
      }>;
      error?: { message: string };
    };

    this.lastRawResponse = result;

    // Check for API error in response
    if (result.error) {
      throw new Error(`OpenRouter API error: ${result.error.message}`);
    }

    // Extract image from response
    const choice = result.choices?.[0];
    if (!choice?.message) {
      // Log the full response for debugging
      console.error('OpenRouter response missing message:', JSON.stringify(result, null, 2));
      throw new Error('No message in OpenRouter image generation response');
    }

    if (!choice.message.content) {
      console.error('OpenRouter message missing content:', JSON.stringify(choice.message, null, 2));
      throw new Error('No content in OpenRouter image generation response');
    }

    let imageDataUrl: string | null = null;

    // Content can be string or array of content parts
    if (typeof choice.message.content === 'string') {
      // Some models return base64 data URL directly as string
      if (choice.message.content.startsWith('data:image/')) {
        imageDataUrl = choice.message.content;
      }
    } else if (Array.isArray(choice.message.content)) {
      // Look for image_url in content parts
      for (const part of choice.message.content) {
        if (part.type === 'image_url' && part.image_url?.url) {
          imageDataUrl = part.image_url.url;
          break;
        }
      }
    }

    if (!imageDataUrl) {
      throw new Error('No image data URL found in OpenRouter response');
    }

    // Parse base64 data URL
    const match = imageDataUrl.match(/^data:image\/([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Invalid image data URL format from OpenRouter');
    }

    const [, format, base64Data] = match;
    const mimeType = `image/${format}`;
    const buffer = Buffer.from(base64Data, 'base64');

    return {
      data: buffer,
      mimeType,
      source: `openrouter:${model}`,
      suggestedFileName: request.suggestedFileName ?? 'article-image'
    };
  }

  private async generateImageWithPollinations(
    request: GenerateImageRequest,
    prompt: string
  ): Promise<GeneratedImageResult> {
    const dimensions = this.resolveImageDimensions(request.size);
    const baseEndpoint = process.env.IMAGE_GENERATOR_BASE_URL ?? 'https://image.pollinations.ai/prompt/';
    const normalizedBase = baseEndpoint.endsWith('/') ? baseEndpoint : `${baseEndpoint}/`;
    const url = new URL(`${normalizedBase}${encodeURIComponent(prompt)}`);
    url.searchParams.set('width', String(dimensions.width));
    url.searchParams.set('height', String(dimensions.height));

    this.lastRawResponse = undefined;
    this.lastMessageContent = prompt;

    const response = await fetch(url.toString());
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Image generator responded ${response.status}: ${text}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const mimeType = response.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(arrayBuffer);
    this.lastRawResponse = { source: url.toString(), bytes: buffer.length };

    return {
      data: buffer,
      mimeType,
      source: url.toString(),
      suggestedFileName: request.suggestedFileName ?? 'article-image'
    };
  }

  private resolveImageDimensions(size?: GenerateImageSize): { width: number; height: number } {
    switch (size) {
      case 'landscape':
        return { width: 1280, height: 720 };
      case 'portrait':
        return { width: 768, height: 1024 };
      case 'square':
      default:
        return { width: 1024, height: 1024 };
    }
  }
}
