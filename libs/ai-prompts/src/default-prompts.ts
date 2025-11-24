import { AiTaskType } from '@seobooster/ai-types';

export type PromptTemplate = {
  systemPrompt: string;
  userPrompt: string;
};

export type PromptTemplates = Record<AiTaskType, PromptTemplate>;

export const DEFAULT_PROMPTS: PromptTemplates = {
  scan: {
    systemPrompt:
      'You extract structured metadata about websites. Always return a valid JSON object matching this exact schema: { "url": string, "title": string, "description": string, "keywords": string[], "detectedTechnologies": string[] }. Do not use markdown code fences.',
    userPrompt:
      'Analyze the website {{url}} and return a JSON object with these exact fields: "url" (the website URL), "title" (website/business name), "description" (brief description), "keywords" (array of relevant keywords), "detectedTechnologies" (array of detected technologies like WordPress, React, etc.).'
  },
  analyze: {
    systemPrompt:
      'You convert website scan data into a business profile. Return a valid JSON object with these exact fields: { "name": string, "tagline": string, "mission": string, "audience": string[], "differentiators": string[], "main_products_or_services": [{"name": string, "url": string, "price": string}] }. Do not use markdown code fences.',
    userPrompt: 'Scan Result: {{scanResult}}\n\nCreate a JSON business profile with these exact fields: "name" (business name), "tagline" (short tagline), "mission" (mission statement), "audience" (array of target audience segments), "differentiators" (array of competitive advantages), "main_products_or_services" (array of products/services with name, url, price).'
  },
  strategy: {
    systemPrompt:
      'You design SEO strategies for websites. Return a valid JSON object with this exact schema: { "business": { "name": string, "description": string, "target_audience": string }, "topic_clusters": [{ "pillar_page": string, "pillar_keywords": string[], "cluster_intent": string, "funnel_stage": string, "supporting_articles": [{ "title": string, "keywords": string[], "intent": string, "funnel_stage": string, "meta_description": string }] }], "total_clusters": number }. Do not use markdown code fences.',
    userPrompt:
      'Business profile: {{businessProfile}}\n\nCreate an SEO strategy JSON with these exact fields: "business" (object with name, description, target_audience), "topic_clusters" (array of clusters, each with pillar_page, pillar_keywords, cluster_intent, funnel_stage, and supporting_articles array), "total_clusters" (total number of clusters).'
  },
  article: {
    systemPrompt:
      'You write high quality SEO articles. Always return a single JSON object with ArticleDraft fields (title, outline, bodyMarkdown, keywords, callToAction). Do not use markdown fences.',
    userPrompt:
      'Business context:\n{{business}}\n\nTopic cluster (pillar, intent, funnel stage, pillar keywords):\n{{topicCluster}}\n\nSupporting article brief (title, keywords, intent, funnel stage, meta description):\n{{supportingArticle}}\n\nWebsite info: {{web}}\nPrimary audience: {{webAudience}}\nWebsite owner: {{webOwner}}\n\nUsing this structured context, write an ArticleDraft JSON. Keep tone professional, reflect the declared funnel stage, weave in the supporting article keywords naturally, and end with a relevant call to action.'
  },
  article_image: {
    systemPrompt:
      'You are an art director generating concise prompts for photorealistic marketing imagery. Describe concrete visual details (subject, setting, lighting, mood, color palette) in under 400 characters. Do not mention camera brands or render engines unless provided. Output only the final prompt text.',
    userPrompt:
      'Business: {{business}}\nArticle title: {{article.title}}\nArticle summary: {{article.summary}}\nTarget audience: {{business.targetAudience}}\nSEO keywords: {{article.keywords}}\nWebsite branding cues: {{web}}\n\nCreate a single vivid text-to-image prompt for a featured blog illustration matching the article.'
  }
};

export const AI_TASKS: AiTaskType[] = ['scan', 'analyze', 'strategy', 'article', 'article_image'];
