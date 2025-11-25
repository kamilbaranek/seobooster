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
  GeneratedImageResult,
  ScanResult,
  SeoStrategy,
  AiTaskType,
  PromptOverrides,
  AiUsage
} from '@seobooster/ai-types';

interface GoogleAiProviderConfig extends AiProviderConfig {
  modelMap: AiModelMap;
}

type GoogleGenerateContentRequest = {
  contents: Array<{
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  };
};

type GoogleGenerateContentResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
};

type ImagenPredictRequest = {
  instances: Array<{
    prompt: string;
  }>;
  parameters?: {
    sampleCount?: number;
    aspectRatio?: string;
    negativePrompt?: string;
    personGeneration?: string;
  };
};

type ImagenPredictResponse = {
  predictions: Array<{
    bytesBase64Encoded?: string;
    mimeType?: string;
  }>;
  error?: {
    code: number;
    message: string;
    status: string;
  };
};

// Simple pricing map (USD per 1M tokens)
const MODEL_PRICING: Record<string, { prompt: number; completion: number }> = {
  'gemini-1.5-flash': { prompt: 0.075, completion: 0.3 },
  'gemini-1.5-pro': { prompt: 1.25, completion: 5 },
  'gemini-1.0-pro': { prompt: 0.5, completion: 1.5 },
};

export class GoogleAiProvider implements AiProvider {
  readonly name = 'google' as const;
  private lastRawResponse: unknown;
  private lastMessageContent: string | undefined;

  constructor(private readonly config: GoogleAiProviderConfig) { }

  getLastRawResponse(): unknown {
    return this.lastRawResponse;
  }

  getLastMessageContent(): string | undefined {
    return this.lastMessageContent;
  }

  private calculateCost(model: string, usage: { promptTokenCount: number; candidatesTokenCount: number }): number {
    // Try to match model name (e.g. 'gemini-1.5-flash-latest' -> 'gemini-1.5-flash')
    const pricingKey = Object.keys(MODEL_PRICING).find(key => model.includes(key));
    const pricing = pricingKey ? MODEL_PRICING[pricingKey] : { prompt: 0, completion: 0 };

    const promptCost = (usage.promptTokenCount / 1000000) * pricing.prompt;
    const completionCost = (usage.candidatesTokenCount / 1000000) * pricing.completion;
    return promptCost + completionCost;
  }

  private async callGemini<T>(
    task: AiTaskType,
    systemPrompt: string,
    userPrompt: string,
    forceJsonResponse: boolean,
    fallback: T
  ): Promise<T & { usage?: AiUsage }> {
    const apiKey = this.config.apiKey;
    const model = this.config.modelMap[task] ?? this.config.model;
    this.lastRawResponse = undefined;
    this.lastMessageContent = undefined;

    if (!apiKey) {
      this.lastRawResponse = { error: 'missing_api_key' };
      return { ...fallback, usage: undefined };
    }

    // Combine system and user prompts for Gemini
    const combinedPrompt = systemPrompt ? `${systemPrompt}\n\n${userPrompt}` : userPrompt;

    const requestBody: GoogleGenerateContentRequest = {
      contents: [
        {
          parts: [{ text: combinedPrompt }]
        }
      ],
      generationConfig: {
        temperature: this.config.temperature ?? 0.7,
        maxOutputTokens: 8192
      }
    };

    if (forceJsonResponse) {
      requestBody.generationConfig!.responseMimeType = 'application/json';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const responseText = await response.text();
    this.lastRawResponse = responseText;

    if (!response.ok) {
      throw new Error(`Google AI API error ${response.status}: ${responseText}`);
    }

    let parsed: GoogleGenerateContentResponse;
    try {
      parsed = JSON.parse(responseText) as GoogleGenerateContentResponse;
    } catch (error) {
      throw new Error(`Failed to parse Google AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    if (parsed.error) {
      this.lastRawResponse = parsed;
      throw new Error(`Google AI API error: ${parsed.error.message} (${parsed.error.status})`);
    }

    let usage: AiUsage | undefined;
    if (parsed.usageMetadata) {
      usage = {
        promptTokens: parsed.usageMetadata.promptTokenCount,
        completionTokens: parsed.usageMetadata.candidatesTokenCount,
        totalTokens: parsed.usageMetadata.totalTokenCount,
        totalCost: this.calculateCost(model, parsed.usageMetadata),
        currency: 'USD'
      };
    }

    const candidate = parsed.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      return { ...fallback, usage };
    }

    const text = candidate.content.parts[0].text;
    this.lastMessageContent = text;

    if (forceJsonResponse) {
      try {
        let cleanText = text.trim();
        // Strip markdown code blocks if present
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }
        const json = JSON.parse(cleanText) as T;
        if (typeof json === 'object' && json !== null && 'data' in json && 'success' in json) {
          const structured = json as { success: boolean; data: T };
          return structured.success ? { ...structured.data, usage } : { ...fallback, usage };
        }
        return { ...json, usage };
      } catch (error) {
        throw new Error(`Failed to parse JSON response from Google AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { ...(text as unknown as T), usage };
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
      'You are a website analyzer. Return a JSON object with: url, title, description, keywords (array), detectedTechnologies (array).';
    const userPrompt = overrides?.userPrompt ?? `Analyze this website: ${url}`;
    const forceJsonResponse = overrides?.forceJsonResponse !== false;

    return this.callGemini<ScanResult>('scan', systemPrompt, userPrompt, forceJsonResponse, fallback);
  }

  async analyzeBusiness(scan: ScanResult, overrides?: PromptOverrides<'analyze'>): Promise<BusinessProfile> {
    const fallback: BusinessProfile = {
      name: scan.title || scan.url,
      tagline: '',
      mission: '',
      audience: [],
      differentiators: []
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You are a business analyst. Based on website scan, create a business profile JSON with: name, tagline, mission, audience (array), differentiators (array).';
    const userPrompt =
      overrides?.userPrompt ?? `Create business profile from this scan: ${JSON.stringify(scan)}`;
    const forceJsonResponse = overrides?.forceJsonResponse !== false;

    return this.callGemini<BusinessProfile>('analyze', systemPrompt, userPrompt, forceJsonResponse, fallback);
  }

  async buildSeoStrategy(profile: BusinessProfile, overrides?: PromptOverrides<'strategy'>): Promise<SeoStrategy> {
    const fallback: SeoStrategy = {
      business: {
        name: profile.name,
        description: profile.mission ?? profile.tagline ?? '',
        target_audience: Array.isArray(profile.audience) ? profile.audience.join(', ') : String(profile.audience || 'Unknown audience')
      },
      topic_clusters: [],
      total_clusters: 0
    };

    const systemPrompt =
      overrides?.systemPrompt ??
      'You are an SEO strategist. Create an SEO strategy JSON with: business (name, description, target_audience), topic_clusters (array), total_clusters (number).';
    const userPrompt =
      overrides?.userPrompt ?? `Create SEO strategy for: ${JSON.stringify(profile)}`;
    const forceJsonResponse = overrides?.forceJsonResponse !== false;

    return this.callGemini<SeoStrategy>('strategy', systemPrompt, userPrompt, forceJsonResponse, fallback);
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
      'You are a professional content writer. Generate SEO-optimized article in JSON format with: title, outline (array), bodyMarkdown, keywords (array), callToAction.';
    const tone = options.targetTone ?? 'Professional';
    const userPrompt =
      overrides?.userPrompt ??
      `Strategy: ${JSON.stringify(strategy)}\nCluster: ${options.clusterName}\nTone: ${tone}\nGenerate article.`;
    const forceJsonResponse = overrides?.forceJsonResponse !== false;

    return this.callGemini<ArticleDraft>('article', systemPrompt, userPrompt, forceJsonResponse, fallback);
  }

  async generateImage(
    request: GenerateImageRequest,
    overrides?: PromptOverrides<'article_image'>
  ): Promise<GeneratedImageResult> {
    const prompt = (overrides?.userPrompt ?? request.prompt ?? '').trim();
    if (!prompt) {
      throw new Error('Image prompt is empty');
    }

    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('Google AI API key is missing');
    }

    const model = this.config.modelMap.article_image ?? 'imagen-4.0-generate-001';
    this.lastRawResponse = undefined;
    this.lastMessageContent = prompt;

    // Determine if this is an Imagen model or Gemini model
    const isImagenModel = model.startsWith('imagen-');

    if (isImagenModel) {
      // Use Imagen API (:predict endpoint)
      return this.generateImageWithImagen(model, prompt, request, apiKey);
    } else {
      // Use Gemini API (:generateContent endpoint)
      return this.generateImageWithGemini(model, prompt, request, apiKey);
    }
  }

  private async generateImageWithImagen(
    model: string,
    prompt: string,
    request: GenerateImageRequest,
    apiKey: string
  ): Promise<GeneratedImageResult> {
    const requestBody: ImagenPredictRequest = {
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1
      }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;

    // Log request for debugging
    console.log('[GoogleAiProvider] Imagen request:', {
      url,
      model,
      promptLength: prompt.length,
      hasApiKey: !!apiKey
    });

    let response: Awaited<ReturnType<typeof fetch>>;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-goog-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
    } catch (fetchError) {
      console.error('[GoogleAiProvider] Imagen fetch failed:', fetchError);
      throw new Error(`Imagen API fetch failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    console.log('[GoogleAiProvider] Imagen response status:', response.status);

    if (!response.ok) {
      const text = await response.text();
      console.error('[GoogleAiProvider] Imagen API error response:', text);
      throw new Error(`Imagen API failed ${response.status}: ${text}`);
    }

    const responseText = await response.text();
    console.log('[GoogleAiProvider] Imagen raw response (first 500 chars):', responseText.substring(0, 500));

    let result: ImagenPredictResponse;
    try {
      result = JSON.parse(responseText) as ImagenPredictResponse;
    } catch (parseError) {
      console.error('[GoogleAiProvider] Failed to parse Imagen response:', parseError);
      throw new Error(`Failed to parse Imagen response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    this.lastRawResponse = result;

    if (result.error) {
      throw new Error(`Imagen API error: ${result.error.message} (${result.error.status})`);
    }

    const prediction = result.predictions?.[0];
    if (!prediction?.bytesBase64Encoded) {
      console.error('[GoogleAiProvider] Imagen response structure:', JSON.stringify(result, null, 2));
      throw new Error('No image data in Imagen response. Check logs for full response structure.');
    }

    const buffer = Buffer.from(prediction.bytesBase64Encoded, 'base64');
    const mimeType = prediction.mimeType ?? 'image/png';

    console.log('[GoogleAiProvider] Successfully generated image:', {
      model,
      mimeType,
      sizeBytes: buffer.length
    });

    // Imagen cost calculation (approximate)
    const usage: AiUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      totalCost: 0.04, // Approx cost per image for Imagen 3
      currency: 'USD'
    };

    return {
      data: buffer,
      mimeType,
      source: `google:${model}`,
      suggestedFileName: request.suggestedFileName ?? 'article-image',
      usage
    };
  }

  private async generateImageWithGemini(
    model: string,
    prompt: string,
    request: GenerateImageRequest,
    apiKey: string
  ): Promise<GeneratedImageResult> {
    const requestBody: GoogleGenerateContentRequest = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini image generation failed ${response.status}: ${text}`);
    }

    const result = (await response.json()) as GoogleGenerateContentResponse;
    this.lastRawResponse = result;

    if (result.error) {
      throw new Error(`Gemini API error: ${result.error.message} (${result.error.status})`);
    }

    const candidate = result.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error('No content in Gemini image generation response');
    }

    // Look for inline image data in parts
    let imageData: { mimeType: string; data: string } | null = null;
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        imageData = part.inlineData;
        break;
      }
    }

    if (!imageData) {
      throw new Error('No image data found in Gemini response. The model may not support image generation.');
    }

    const buffer = Buffer.from(imageData.data, 'base64');
    const mimeType = imageData.mimeType;

    let usage: AiUsage | undefined;
    if (result.usageMetadata) {
      usage = {
        promptTokens: result.usageMetadata.promptTokenCount,
        completionTokens: result.usageMetadata.candidatesTokenCount,
        totalTokens: result.usageMetadata.totalTokenCount,
        totalCost: this.calculateCost(model, result.usageMetadata),
        currency: 'USD'
      };
    }

    return {
      data: buffer,
      mimeType,
      source: `google:${model}`,
      suggestedFileName: request.suggestedFileName ?? 'article-image',
      usage
    };
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json_object';
    }
  ): Promise<{ content: string; finishReason?: string; usage?: AiUsage }> {
    const systemMsg = messages.find(m => m.role === 'system')?.content ?? '';
    const userMsg = messages.find(m => m.role === 'user')?.content ?? '';
    const combinedPrompt = systemMsg ? `${systemMsg}\n\n${userMsg}` : userMsg;

    const apiKey = this.config.apiKey;
    const model = options?.model ?? this.config.model;

    if (!apiKey) {
      throw new Error('Missing API key for Google AI');
    }

    const requestBody: GoogleGenerateContentRequest = {
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens
      }
    };

    if (options?.responseFormat === 'json_object') {
      requestBody.generationConfig!.responseMimeType = 'application/json';
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI API error: ${response.status} ${errorText}`);
    }

    const result = await response.json() as GoogleGenerateContentResponse;
    this.lastRawResponse = result;

    if (result.error) {
      throw new Error(`Google AI error: ${result.error.message}`);
    }

    const content = result.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    this.lastMessageContent = content;

    let usage: AiUsage | undefined;
    if (result.usageMetadata) {
      usage = {
        promptTokens: result.usageMetadata.promptTokenCount,
        completionTokens: result.usageMetadata.candidatesTokenCount,
        totalTokens: result.usageMetadata.totalTokenCount,
        totalCost: this.calculateCost(model, result.usageMetadata),
        currency: 'USD'
      };
    }

    return {
      content,
      finishReason: result.candidates?.[0]?.finishReason,
      usage
    };
  }
}
