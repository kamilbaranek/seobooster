export type WebId = string;

export type ArticleStatus = 'draft' | 'queued' | 'published';

export interface WebsiteOverview {
  id: WebId;
  url: string;
  status: string;
}

export interface ArticleSummary {
  id: string;
  webId: WebId;
  title: string;
  status: ArticleStatus;
  createdAt: string;
}

