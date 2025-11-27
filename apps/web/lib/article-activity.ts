import { apiFetch } from './api-client';

export type ArticleActivityStatus = 'PLANNED' | 'GENERATED' | 'PUBLISHED';

export type ArticleActivityItem = {
  articleId: string | null;
  webId: string;
  webUrl: string;
  webNickname: string;
  title: string;
  titlePreview: string;
  currentStatus: ArticleActivityStatus;
  currentStatusAt: string;
  history: { status: ArticleActivityStatus; at: string }[];
};

export async function fetchArticleActivity(
  filter: 'all' | 'published' | 'generated' = 'all',
  limit = 4
): Promise<ArticleActivityItem[]> {
  const params = new URLSearchParams();
  if (filter !== 'all') params.set('status', filter);
  if (limit) params.set('limit', String(limit));

  return apiFetch<ArticleActivityItem[]>(`/articles/activity?${params.toString()}`);
}
