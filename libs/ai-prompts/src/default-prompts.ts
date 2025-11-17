import { AiTaskType } from '@seobooster/ai-types';

export type PromptTemplate = {
  systemPrompt: string;
  userPrompt: string;
};

export type PromptTemplates = Record<AiTaskType, PromptTemplate>;

export const DEFAULT_PROMPTS: PromptTemplates = {
  scan: {
    systemPrompt:
      'You extract structured metadata about websites. Always return JSON object { success: boolean, data: ScanResult }.',
    userPrompt:
      'Analyze the website {{url}} and provide title, short description, keywords array, and detected technologies.'
  },
  analyze: {
    systemPrompt:
      'You convert website scan data into a business profile. Return JSON { success, data } where data is BusinessProfile.',
    userPrompt: 'Scan Result: {{scanResult}}\nCreate a concise business profile.'
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
  }
};

export const AI_TASKS: AiTaskType[] = ['scan', 'analyze', 'strategy', 'article'];
