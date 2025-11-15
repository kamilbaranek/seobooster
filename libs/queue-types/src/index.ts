export const SCAN_WEBSITE_QUEUE = 'scan-website' as const;
export const ANALYZE_BUSINESS_QUEUE = 'analyze-business' as const;
export const CREATE_SEO_STRATEGY_QUEUE = 'create-seo-strategy' as const;
export const GENERATE_ARTICLE_QUEUE = 'generate-article' as const;
export const PUBLISH_ARTICLE_QUEUE = 'publish-article' as const;

export type ScanWebsiteJob = {
  webId: string;
};

export type AnalyzeBusinessJob = {
  webId: string;
};

export type CreateSeoStrategyJob = {
  webId: string;
};

export type GenerateArticleJob = {
  webId: string;
  articleId?: string;
};

export type PublishArticleJob = {
  articleId: string;
};

