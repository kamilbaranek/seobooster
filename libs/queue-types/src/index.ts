export const SCAN_WEBSITE_QUEUE = 'scan-website' as const;
export const ANALYZE_BUSINESS_QUEUE = 'analyze-business' as const;
export const CREATE_SEO_STRATEGY_QUEUE = 'create-seo-strategy' as const;
export const GENERATE_ARTICLE_QUEUE = 'generate-article' as const;
export const PUBLISH_ARTICLE_QUEUE = 'publish-article' as const;
export const FETCH_FAVICON_QUEUE = 'fetch-favicon' as const;
export const GENERATE_SCREENSHOT_QUEUE = 'generate-screenshot' as const;

export type ScanWebsiteJob = {
  webId: string;
  debug?: boolean;
};

export type AnalyzeBusinessJob = {
  webId: string;
  debug?: boolean;
  rawScanOutput?: string | null;
};

export type CreateSeoStrategyJob = {
  webId: string;
  debug?: boolean;
};

export type GenerateArticleJob = {
  webId: string;
  articleId?: string;
  plannedArticleId?: string;
};

export type PublishArticleJob = {
  articleId: string;
  targetStatus: 'draft' | 'publish';
  trigger: 'auto' | 'manual' | 'email';
};

export type FetchFaviconJob = {
  webId: string;
  trigger?: string;
  attempt?: number;
};

export type GenerateHomepageScreenshotJob = {
  webId: string;
  trigger?: string;
  fullPage?: boolean;
};
