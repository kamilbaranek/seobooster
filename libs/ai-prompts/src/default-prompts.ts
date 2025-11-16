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
    systemPrompt: 'You design SEO strategies with pillars and topic clusters. Respond with JSON { success, data }.',
    userPrompt:
      'Business profile: {{businessProfile}}\nGenerate an initial SEO strategy with at least one pillar and cluster keywords.'
  },
  article: {
    systemPrompt: 'You write high quality SEO articles. Always return JSON { success, data } with ArticleDraft fields.',
    userPrompt:
      'SEO Strategy: {{strategy}}\nSelected cluster: {{cluster.name}}\nTone: {{strategy.targetTone}}\nProduce a detailed outline, markdown body, keywords, and CTA.'
  }
};

export const AI_TASKS: AiTaskType[] = ['scan', 'analyze', 'strategy', 'article'];
