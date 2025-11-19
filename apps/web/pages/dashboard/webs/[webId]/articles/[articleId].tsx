import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../../../../lib/api-client';

type ArticleStatus = 'DRAFT' | 'QUEUED' | 'PUBLISHED';

type ArticleImage = {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  imageUrl?: string | null;
  prompt: string;
  isFeatured: boolean;
  position: number;
  errorMessage?: string | null;
  createdAt: string;
};

type ArticleImagesResponse = {
  images: ArticleImage[];
  limit: number;
  generated: number;
  remaining: number;
};

type ArticleDetail = {
  id: string;
  title: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  wordpressPostId?: string | null;
  featuredImageUrl?: string | null;
  markdown: string;
  html: string;
  category: { id: string; name: string } | null;
  author: { id: string; name: string } | null;
  tags: string[];
};

type WordpressMetadata = {
  categories: Array<{ id: string; name: string }>;
  authors: Array<{ id: string; name: string }>;
  tagsMode: 'AUTO_FROM_KEYWORDS' | 'MANUAL_ONLY';
};

const STATUS_LABELS: Record<ArticleStatus, string> = {
  DRAFT: 'Draft',
  QUEUED: 'V pořadí',
  PUBLISHED: 'Publikováno'
};

const ArticleDetailPage = () => {
  const router = useRouter();
  const webId = router.query.webId as string | undefined;
  const articleId = router.query.articleId as string | undefined;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [metadata, setMetadata] = useState<WordpressMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [previewMode, setPreviewMode] = useState<'html' | 'markdown'>('html');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAuthorId, setFormAuthorId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageGenerating, setImageGenerating] = useState(false);
  const [images, setImages] = useState<ArticleImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesLimit, setImagesLimit] = useState(1);
  const [imagesGenerated, setImagesGenerated] = useState(0);

  const fetchArticle = useCallback(async () => {
    if (!webId || !articleId) {
      return;
    }
    setLoading(true);
    try {
      const payload = await apiFetch<ArticleDetail>(`/webs/${webId}/articles/${articleId}`);
      setArticle(payload);
    } catch (err) {
      setStatusMessage((err as Error).message ?? 'Nepodařilo se načíst článek');
    } finally {
      setLoading(false);
    }
  }, [webId, articleId]);

  const fetchMetadata = useCallback(async () => {
    if (!webId) {
      return;
    }
    setMetadataLoading(true);
    try {
      const payload = await apiFetch<WordpressMetadata>(`/webs/${webId}/wordpress/metadata`);
      setMetadata(payload);
    } catch (err) {
      setStatusMessage((err as Error).message ?? 'Nepodařilo se načíst metadata');
    } finally {
      setMetadataLoading(false);
    }
  }, [webId]);

  const fetchImages = useCallback(async () => {
    if (!webId || !articleId) {
      return;
    }
    try {
      const payload = await apiFetch<ArticleImagesResponse>(`/webs/${webId}/articles/${articleId}/images`);
      setImages(payload.images);
      setImagesLimit(payload.limit);
      setImagesGenerated(payload.generated);
    } catch (err) {
      // Silently fail on polling
    }
  }, [webId, articleId]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Polling for image status updates every 5 seconds
  useEffect(() => {
    const hasPending = images.some((img) => img.status === 'PENDING');
    if (!hasPending) {
      return;
    }

    const interval = setInterval(() => {
      fetchImages();
    }, 5000);

    return () => clearInterval(interval);
  }, [images, fetchImages]);

  useEffect(() => {
    if (!article) {
      return;
    }
    setFormCategoryId(article.category?.id ?? '');
    setFormAuthorId(article.author?.id ?? '');
    setTagsInput(article.tags.join(', '));
  }, [article]);

  const statusDescription = useMemo(() => {
    if (!article) {
      return '';
    }
    return STATUS_LABELS[article.status];
  }, [article]);

  const handleSaveMetadata = async () => {
    if (!article || !webId) {
      return;
    }
    setSaving(true);
    setStatusMessage('Ukládám metadata…');
    const payload: Record<string, unknown> = {};
    if (formCategoryId !== article.category?.id) {
      payload.wordpressCategoryId = formCategoryId || '';
    }
    if (formAuthorId !== article.author?.id) {
      payload.wordpressAuthorId = formAuthorId || '';
    }
    const normalizedTags = tagsInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (JSON.stringify(normalizedTags) !== JSON.stringify(article.tags)) {
      payload.tags = normalizedTags;
    }
    if (!Object.keys(payload).length) {
      setStatusMessage('Žádné změny k uložení.');
      setSaving(false);
      return;
    }
    if (payload.wordpressCategoryId === '') {
      payload.wordpressCategoryId = '';
    }
    if (payload.wordpressAuthorId === '') {
      payload.wordpressAuthorId = '';
    }

    try {
      await apiFetch(`/webs/${webId}/articles/${article.id}/metadata`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      setStatusMessage('Metadata uložena.');
      fetchArticle();
    } catch (err) {
      setStatusMessage((err as Error).message ?? 'Nepodařilo se uložit metadata');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!webId || !article) {
      return;
    }
    setActionStatus('Posílám článek k publikaci…');
    try {
      await apiFetch(`/webs/${webId}/articles/${article.id}/publish`, { method: 'POST' });
      setActionStatus('Publikační job v frontě');
    } catch (err) {
      setActionStatus((err as Error).message ?? 'Publikace selhala');
    }
  };

  const handlePlaceholderAction = (label: string) => {
    setActionStatus(`${label} zatím není připraveno.`);
  };

  const handleGenerateImage = async (force = false) => {
    if (!webId || !articleId) {
      return;
    }
    setImageGenerating(true);
    setActionStatus('Spouštím generování obrázku…');
    try {
      const response = await apiFetch<{ success: boolean; image: ArticleImage }>(`/webs/${webId}/articles/${articleId}/images/generate`, {
        method: 'POST',
        body: JSON.stringify({ force })
      });

      // Add new image to the list immediately
      if (response.image) {
        setImages((prev) => [...prev, response.image]);
        setImagesGenerated((prev) => prev + 1);
      }

      setActionStatus('Obrázek byl zařazen do fronty.');
    } catch (err) {
      setActionStatus((err as Error).message ?? 'Generování obrázku selhalo.');
    } finally {
      setImageGenerating(false);
    }
  };

  const handleSetFeatured = async (imageId: string) => {
    if (!webId || !articleId) {
      return;
    }
    try {
      await apiFetch(`/webs/${webId}/articles/${articleId}/images/${imageId}/featured`, { method: 'PATCH' });
      setActionStatus('Obrázek nastaven jako hlavní.');
      await fetchImages();
    } catch (err) {
      setActionStatus((err as Error).message ?? 'Nepodařilo se nastavit hlavní obrázek.');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!webId || !articleId || !confirm('Smazat tento obrázek?')) {
      return;
    }
    try {
      await apiFetch(`/webs/${webId}/articles/${articleId}/images/${imageId}`, { method: 'DELETE' });
      setActionStatus('Obrázek smazán.');
      await fetchImages();
    } catch (err) {
      setActionStatus((err as Error).message ?? 'Nepodařilo se smazat obrázek.');
    }
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const listHref = webId ? `/dashboard/webs/${webId}/articles` : '/dashboard/webs';

  return (
    <>
      <Head>
        <title>Článek · Dashboard</title>
      </Head>
      <div className="page">
        <header className="page-heading">
          <div>
            <Link href={listHref} className="secondary">
              ← Zpět na seznam článků
            </Link>
            <h1>{article?.title ?? 'Článek'}</h1>
            <p className="muted">{statusDescription}</p>
          </div>
          <div className="status-chip">{article ? STATUS_LABELS[article.status] : '—'}</div>
        </header>
        <div className="grid">
          <section className="sidebar">
            <div className="panel">
              <h2>WordPress metadata</h2>
              <label>
                Kategorie
                <select
                  value={formCategoryId}
                  onChange={(event) => setFormCategoryId(event.target.value)}
                  disabled={metadataLoading}
                >
                  <option value="">(vybrat výchozí)</option>
                  {metadata?.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Autor
                <select
                  value={formAuthorId}
                  onChange={(event) => setFormAuthorId(event.target.value)}
                  disabled={metadataLoading}
                >
                  <option value="">(vybrat výchozí)</option>
                  {metadata?.authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Tagy (oddělené čárkami)
                <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} />
              </label>
              <button type="button" className="primary" onClick={handleSaveMetadata} disabled={saving || !article}>
                {saving ? 'Ukládám…' : 'Uložit metadata'}
              </button>
              {metadataLoading ? (
                <p className="muted">Načítám metadata…</p>
              ) : (
                <p className="muted">Režim tagů: {metadata?.tagsMode ?? '—'}</p>
              )}
            </div>
            <div className="panel">
              <h2>Akce</h2>
              <button type="button" className="primary" onClick={handlePublish} disabled={!article}>
                Publikovat na WordPress
              </button>
              <button type="button" onClick={() => handlePlaceholderAction('Schvalovací e-mail')}>
                Odeslat ke schválení
              </button>
              <button type="button" onClick={() => handlePlaceholderAction('Regenerace článku')}>
                Vygenerovat článek znovu
              </button>
              <button type="button" onClick={() => handlePlaceholderAction('Smazat')}>
                Smazat článek
              </button>
              {actionStatus && <p className="muted">{actionStatus}</p>}
            </div>
            <div className="panel">
              <h2>Obrázky články</h2>
              <div className="image-stats">
                <span>{imagesGenerated} / {imagesLimit} vygenerováno</span>
              </div>
              {images.length === 0 ? (
                <p className="muted">Zatím žádné obrázky</p>
              ) : (
                <div className="image-gallery">
                  {images.map((img) => (
                    <div key={img.id} className="image-card">
                      <div className="image-container">
                        {img.status === 'PENDING' && (
                          <div className="image-placeholder loading">⏳ Generuji…</div>
                        )}
                        {img.status === 'SUCCESS' && img.imageUrl && (
                          <img src={img.imageUrl} alt="Article" />
                        )}
                        {img.status === 'FAILED' && (
                          <div className="image-placeholder failed">❌ Selhalo</div>
                        )}
                        {img.isFeatured && <div className="featured-badge">⭐ Hlavní</div>}
                      </div>
                      <div className="image-actions">
                        {img.status === 'SUCCESS' && !img.isFeatured && (
                          <button
                            type="button"
                            className="small"
                            onClick={() => handleSetFeatured(img.id)}
                          >
                            Nastavit
                          </button>
                        )}
                        {!img.isFeatured && (
                          <button
                            type="button"
                            className="small delete"
                            onClick={() => handleDeleteImage(img.id)}
                          >
                            Smazat
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="primary"
                onClick={() => handleGenerateImage()}
                disabled={!article || imageGenerating || imagesGenerated >= imagesLimit}
              >
                {imageGenerating
                  ? 'Generuji…'
                  : imagesGenerated >= imagesLimit
                    ? 'Limit vyčerpán'
                    : 'Vygenerovat obrázek'}
              </button>
            </div>
          </section>
          <section className="preview">
            <header className="preview-header">
              <div>
                <p>
                  Vytvořeno: {formatDate(article?.createdAt)} • Aktualizováno: {formatDate(article?.updatedAt)}
                </p>
                {article?.publishedAt && <p>Publikováno: {formatDate(article.publishedAt)}</p>}
                <p>WordPress ID: {article?.wordpressPostId ?? '—'}</p>
              </div>
              <div className="toggle">
                <button type="button" className={previewMode === 'html' ? 'active' : ''} onClick={() => setPreviewMode('html')}>
                  HTML náhled
                </button>
                <button
                  type="button"
                  className={previewMode === 'markdown' ? 'active' : ''}
                  onClick={() => setPreviewMode('markdown')}
                >
                  Markdown
                </button>
              </div>
            </header>
            {loading && <p className="placeholder">Načítám článek…</p>}
            {!article && !loading && <p className="placeholder">Článek nebyl nalezen.</p>}
            {article?.featuredImageUrl && (
              <div className="preview-image">
                <img src={article.featuredImageUrl} alt="Featured" />
              </div>
            )}
            {article && previewMode === 'html' && (
              <div className="article-html" dangerouslySetInnerHTML={{ __html: article.html }} />
            )}
            {article && previewMode === 'markdown' && <pre>{article.markdown}</pre>}
          </section>
        </div>
        {statusMessage && <p className="muted">{statusMessage}</p>}
      </div>
      <style jsx>{`
        .page {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .page-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .page-heading h1 {
          margin: 0.5rem 0 0;
        }
        .status-chip {
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
          font-weight: 600;
        }
        .grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 1.5rem;
        }
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .panel {
          padding: 1rem;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 0.8rem;
          background: #0f172a;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        label {
          font-size: 0.9rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        select,
        input {
          padding: 0.45rem 0.7rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(148, 163, 184, 0.5);
          background: #020617;
          color: #fff;
        }
        .primary {
          border: 1px solid #0ea5e9;
          background: transparent;
          padding: 0.6rem 1rem;
          border-radius: 0.6rem;
          color: #38bdf8;
          cursor: pointer;
        }
        .panel button {
          border: 1px solid rgba(148, 163, 184, 0.5);
          border-radius: 0.5rem;
          padding: 0.5rem 0.9rem;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }
        .preview {
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 1rem;
          padding: 1.25rem;
          background: #020617;
          min-height: 60vh;
          display: flex;
          flex-direction: column;
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .toggle button {
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: transparent;
          color: #fff;
          padding: 0.4rem 0.9rem;
          border-radius: 0.5rem;
          margin-left: 0.5rem;
          cursor: pointer;
        }
        .toggle .active {
          background: #0ea5e9;
          border-color: #0ea5e9;
          color: #020617;
        }
        .article-html {
          flex: 1;
          overflow: auto;
          color: #e5e7eb;
          line-height: 1.7;
        }
        .article-html h1,
        .article-html h2,
        .article-html h3,
        .article-html h4 {
          color: #f9fafb;
        }
        .article-html p,
        .article-html li,
        .article-html span {
          color: #e5e7eb;
        }
        .article-html a {
          color: #38bdf8;
          text-decoration: underline;
        }
        pre {
          white-space: pre-wrap;
          word-break: break-word;
          color: #94a3b8;
          background: #020617;
          border: 1px solid rgba(148, 163, 184, 0.3);
          padding: 1rem;
          border-radius: 0.8rem;
          flex: 1;
          overflow: auto;
        }
        .preview-image {
          margin-bottom: 1.5rem;
          border-radius: 0.8rem;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .preview-image img {
          display: block;
          width: 100%;
          height: auto;
          max-height: 400px;
          object-fit: cover;
        }
        img {
          width: 100%;
          border-radius: 0.6rem;
        }
        .muted {
          color: #94a3b8;
          margin: 0;
        }
        .secondary {
          color: #94a3b8;
          font-size: 0.9rem;
          text-decoration: underline;
        }
        .image-stats {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .image-gallery {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .image-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .image-container {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.3);
          background: #020617;
          aspect-ratio: 16 / 9;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #94a3b8;
          background: #0f172a;
        }
        .image-placeholder.loading {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .image-placeholder.failed {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        .featured-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(34, 197, 94, 0.9);
          color: #fff;
          padding: 0.3rem 0.6rem;
          border-radius: 0.3rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .image-actions {
          display: flex;
          gap: 0.5rem;
        }
        .image-actions button {
          flex: 1;
        }
        button.small {
          padding: 0.35rem 0.6rem;
          font-size: 0.8rem;
          border: 1px solid rgba(148, 163, 184, 0.5);
          border-radius: 0.4rem;
          background: transparent;
          color: #fff;
          cursor: pointer;
        }
        button.small:hover:not(:disabled) {
          border-color: #0ea5e9;
          background: rgba(14, 165, 233, 0.1);
        }
        button.small.delete:hover:not(:disabled) {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }
        @media (max-width: 1000px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default ArticleDetailPage;
