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
      'You convert website scan data into a business profile. Return JSON { success, data } where data is BusinessProfile.',
    userPrompt: 'Scan Result: {{scanResult}}\nCreate a concise business profile. Include main_products_or_services array with name, url (if found), and price (if found).'
  },
  strategy: {
    systemPrompt:
      'You design SEO strategies for websites. Respond strictly in JSON matching the seo_strategy schema (business, topic_clusters, total_clusters). Do not wrap the JSON in markdown fences.',
    userPrompt:
      'Business profile: {{businessProfile}}\nBased on this, propose an SEO strategy JSON object with keys business, topic_clusters and total_clusters, following the agreed schema.'
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
