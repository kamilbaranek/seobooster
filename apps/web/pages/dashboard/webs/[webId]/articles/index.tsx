import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../../../../lib/api-client';

type ArticleStatus = 'DRAFT' | 'QUEUED' | 'PUBLISHED';

type ArticleListItem = {
  id: string;
  title: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  wordpressPostId?: string | null;
  featuredImageUrl?: string | null;
  category: { id: string; name: string; slug?: string | null; remoteId: number } | null;
  author: { id: string; name: string; slug?: string | null; remoteId: number } | null;
  tags: string[];
};

type ArticleListResponse = {
  items: ArticleListItem[];
  page: number;
  limit: number;
  total: number;
};

type WordpressMetadata = {
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  defaultWordpressCategoryId?: string | null;
  defaultWordpressAuthorId?: string | null;
  tagsMode: 'AUTO_FROM_KEYWORDS' | 'MANUAL_ONLY';
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Draft',
  QUEUED: 'Queued',
  PUBLISHED: 'Published'
};

const ArticleListPage = () => {
  const router = useRouter();
  const webId = router.query.webId as string | undefined;
  const [statusFilter, setStatusFilter] = useState<ArticleStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<WordpressMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');

  const fetchArticles = useCallback(async () => {
    if (!webId) {
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (statusFilter) {
      params.set('status', statusFilter);
    }
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    params.set('page', String(page));
    try {
      const queryString = params.toString();
      const payload = await apiFetch<ArticleListResponse>(
        `/webs/${webId}/articles${queryString ? `?${queryString}` : ''}`
      );
      setArticles(payload.items);
      setTotal(payload.total);
      setLimit(payload.limit);
      setSelectedIds([]);
    } catch (err) {
      setError((err as Error).message ?? 'Nepodařilo se načíst články');
    } finally {
      setLoading(false);
    }
  }, [webId, statusFilter, searchTerm, page]);

  const fetchMetadata = useCallback(async () => {
    if (!webId) {
      return;
    }
    setMetadataLoading(true);
    setMetadataError(null);
    try {
      const payload = await apiFetch<WordpressMetadata>(`/webs/${webId}/wordpress/metadata`);
      setMetadata(payload);
    } catch (err) {
      setMetadataError((err as Error).message ?? 'Nepodařilo se načíst metadata');
    } finally {
      setMetadataLoading(false);
    }
  }, [webId]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (categoryFilter && article.category?.id !== categoryFilter) {
        return false;
      }
      if (authorFilter && article.author?.id !== authorFilter) {
        return false;
      }
      return true;
    });
  }, [articles, categoryFilter, authorFilter]);

  const allVisibleSelected = filteredArticles.length > 0 && filteredArticles.every((article) => selectedIds.includes(article.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filteredArticles.map((article) => article.id));
  };

  const toggleSelection = (articleId: string) => {
    setSelectedIds((prev) =>
      prev.includes(articleId) ? prev.filter((id) => id !== articleId) : [...prev, articleId]
    );
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedIds.length === 0) {
      return;
    }
    alert('Hromadné akce zatím nejsou implementované.');
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const statusClass = (status: ArticleStatus) => {
    return `status-pill status-${status.toLowerCase()}`;
  };

  return (
    <>
      <Head>
        <title>Články · Dashboard</title>
      </Head>
      <div className="page">
        <header className="page-heading">
          <div>
            <h1>Články</h1>
            <p className="muted">Spravujte generované články a připravte je k publikaci.</p>
          </div>
          {webId ? (
            <Link href={`/dashboard/webs/${webId}/articles`} className="secondary">
              Aktualizovat stránku
            </Link>
          ) : (
            <span className="secondary disabled-link">Aktualizovat stránku</span>
          )}
        </header>
        <section className="filters">
          <div className="filter-row">
            <label>
              Stav
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ArticleStatus | '')}>
                <option value="">Všechny</option>
                {(Object.keys(STATUS_LABELS) as ArticleStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Kategorie
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} disabled={metadataLoading || !!metadataError}>
                <option value="">Neomezovat</option>
                {metadata?.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Autor
              <select value={authorFilter} onChange={(event) => setAuthorFilter(event.target.value)} disabled={metadataLoading || !!metadataError}>
                <option value="">Neomezovat</option>
                {metadata?.authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </label>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Hledat podle názvu"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
              <button type="submit">Hledat</button>
            </form>
          </div>
        </section>
        <section className="bulk-actions">
          <div>
            <strong>Vybráno:</strong> {selectedIds.length}
          </div>
          <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
            <option value="">Vyberte akci</option>
            <option value="publish">Publikovat</option>
            <option value="regenerate">Vygenerovat znovu</option>
            <option value="approval">K odeslání ke schválení</option>
            <option value="delete">Smazat</option>
          </select>
          <button type="button" onClick={handleBulkAction} disabled={!selectedIds.length || !bulkAction}>
            Provést
          </button>
        </section>
        {metadataLoading && <p className="muted">Načítám metadata z WordPressu…</p>}
        {metadataError && <p className="error">{metadataError}</p>}
        {error && <p className="error">{error}</p>}
        <section className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
                </th>
                <th>Název</th>
                <th>Stav</th>
                <th>WordPress</th>
                <th>Kategorie</th>
                <th>Autor</th>
                <th>Vytvořeno</th>
                <th>Publikováno</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="placeholder">
                    Načítám…
                  </td>
                </tr>
              ) : filteredArticles.length ? (
                filteredArticles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(article.id)}
                        onChange={() => toggleSelection(article.id)}
                      />
                    </td>
                    <td>
                      {webId ? (
                        <Link href={`/dashboard/webs/${webId}/articles/${article.id}`}>{article.title}</Link>
                      ) : (
                        <span>{article.title}</span>
                      )}
                    </td>
                    <td>
                      <span className={statusClass(article.status)}>{STATUS_LABELS[article.status]}</span>
                    </td>
                    <td>{article.wordpressPostId ? 'Publikováno' : 'Draft'}</td>
                    <td>{article.category?.name ?? '—'}</td>
                    <td>{article.author?.name ?? '—'}</td>
                    <td>{formatDate(article.createdAt)}</td>
                    <td>{formatDate(article.publishedAt)}</td>
                    <td>
                      {webId ? (
                        <Link href={`/dashboard/webs/${webId}/articles/${article.id}`} className="link-action">
                          Zobrazit
                        </Link>
                      ) : (
                        <span className="link-action disabled-link">Zobrazit</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="placeholder">
                    Žádné články nevyhovují filtrům.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="pagination">
          <button type="button" disabled={page === 1} onClick={() => setPage((previous) => previous - 1)}>
            Předchozí
          </button>
          <span>
            Strana {page} z {Math.max(1, Math.ceil(total / limit))} • Celkem {total} článků
          </span>
          <button
            type="button"
            disabled={page * limit >= total}
            onClick={() => setPage((previous) => previous + 1)}
          >
            Další
          </button>
        </section>
      </div>
      <style jsx>{`
        .page {
          padding: 2rem;
        }
        .page-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .filters {
          margin-top: 1.5rem;
          padding: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.8rem;
          background: #0f172a;
        }
        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
        }
        select,
        input[type='search'] {
          min-width: 180px;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #020617;
          color: #fff;
        }
        .search-form {
          display: flex;
          gap: 0.5rem;
          align-items: flex-end;
        }
        .search-form button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          background: #0ea5e9;
          color: #fff;
          cursor: pointer;
        }
        .bulk-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }
        .bulk-actions select {
          padding: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #0f172a;
          color: #fff;
        }
        .bulk-actions button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid #0ea5e9;
          background: transparent;
          color: #0ea5e9;
          cursor: pointer;
        }
        .table-wrapper {
          margin-top: 1rem;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
        }
        th {
          text-align: left;
          font-size: 0.85rem;
          color: #94a3b8;
        }
        td a {
          color: #38bdf8;
        }
        .status-pill {
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .status-draft {
          background: rgba(248, 113, 113, 0.2);
          color: #f87171;
        }
        .status-queued {
          background: rgba(253, 224, 71, 0.2);
          color: #f59e0b;
        }
        .status-published {
          background: rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }
        .placeholder {
          text-align: center;
          color: #94a3b8;
        }
        .pagination {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .pagination button {
          padding: 0.4rem 0.9rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: transparent;
          color: #fff;
          cursor: pointer;
        }
        .page-heading .muted {
          color: #94a3b8;
          margin: 0;
        }
        .error {
          color: #f87070;
          margin-top: 0.75rem;
        }
        .secondary {
          border: 1px solid rgba(148, 163, 184, 0.5);
          border-radius: 0.6rem;
          padding: 0.45rem 0.9rem;
          color: #fff;
          text-decoration: none;
        }
        .link-action {
          color: #38bdf8;
        }
        .disabled-link {
          opacity: 0.6;
          pointer-events: none;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          th:nth-child(6),
          td:nth-child(6),
          th:nth-child(7),
          td:nth-child(7),
          th:nth-child(8),
          td:nth-child(8) {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default ArticleListPage;
