import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

type AssetStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

interface MeResponse {
  user: {
    id: string;
    email: string;
    role?: string;
  };
  webs: Array<{
    id: string;
    url: string;
    nickname?: string | null;
    status: string;
    createdAt: string;
    faviconUrl?: string | null;
    faviconStatus?: AssetStatus;
    screenshotUrl?: string | null;
    screenshotStatus?: AssetStatus;
  }>;
}

interface OverviewResponse {
  web: {
    id: string;
    url: string;
    status: string;
    nickname?: string | null;
    createdAt: string;
    faviconUrl?: string | null;
    faviconStatus: AssetStatus;
    faviconLastFetchedAt?: string | null;
    screenshotUrl?: string | null;
    screenshotStatus: AssetStatus;
    screenshotLastGeneratedAt?: string | null;
    screenshotWidth?: number | null;
    screenshotHeight?: number | null;
  };
  analysis: {
    lastScanAt: string | null;
    hasScanResult: boolean;
    hasBusinessProfile: boolean;
    hasSeoStrategy: boolean;
  };
  articles: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
  }>;
  plan: {
    upcoming: Array<{
      id: string;
      status: string;
      plannedPublishAt: string;
      supportingArticleTitle: string;
      clusterName: string;
    }>;
    stats: {
      planned: number;
      generated: number;
      published: number;
    };
    nextPlannedAt: string | null;
  };
}

interface PipelineDebugResponse {
  scanResult: unknown;
  businessProfile: unknown;
  seoStrategy: unknown;
  latestArticle: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  } | null;
  rawScanOutput?: string | null;
}

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }) : null;

const describeAssetStatus = (status?: AssetStatus) => {
  switch (status) {
    case 'SUCCESS':
      return 'Hotovo';
    case 'FAILED':
      return 'Nepodařilo se, zkuste znovu';
    default:
      return 'Probíhá zpracování';
  }
};

const getStatusClassName = (status?: AssetStatus) => (status ?? 'PENDING').toLowerCase();

const formatAssetTimestamp = (value?: string | null) =>
  value ? new Date(value).toLocaleString('cs-CZ', { dateStyle: 'short', timeStyle: 'short' }) : 'Nikdy';

const getFaviconInitial = (web?: { nickname?: string | null; url?: string }) => {
  const source = web?.nickname ?? web?.url ?? 'S';
  const match = source.match(/[a-z0-9]/i);
  return match ? match[0].toUpperCase() : 'S';
};

const DashboardPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [selectedWebId, setSelectedWebId] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [refreshingFavicon, setRefreshingFavicon] = useState(false);
  const [refreshingScreenshot, setRefreshingScreenshot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<PipelineDebugResponse | null>(null);

  const debugMode = process.env.NEXT_PUBLIC_DEBUG_PIPELINE === 'true';
  const isSuperadmin = profile?.user.role === 'SUPERADMIN';

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const me = await apiFetch<MeResponse>('/me');
        setProfile(me);
        if (!selectedWebId && me.webs.length > 0) {
          setSelectedWebId(me.webs[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodařilo se načíst data.');
      }
    };

    fetchProfile();
  }, [router, selectedWebId]);

  const loadOverview = useCallback(
    async (webId: string) => {
      setLoadingOverview(true);
      setError(null);
      try {
        const data = await apiFetch<OverviewResponse>(`/webs/${webId}/overview`);
        setOverview(data);
        if (debugMode) {
          const debug = await apiFetch<PipelineDebugResponse>(`/webs/${webId}/pipeline-debug`);
          setDebugData(debug);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodařilo se načíst web.');
      } finally {
        setLoadingOverview(false);
      }
    },
    [debugMode]
  );

  useEffect(() => {
    if (!selectedWebId) {
      return;
    }
    loadOverview(selectedWebId);
  }, [loadOverview, selectedWebId]);

  const pipelineSteps = useMemo(() => {
    if (!overview) return [];
    const nextPlanned = formatDateTime(overview.plan.nextPlannedAt) ?? undefined;
    return [
      {
        key: 'favicon',
        label: 'Favicon',
        done: overview.web.faviconStatus === 'SUCCESS',
        description: describeAssetStatus(overview.web.faviconStatus)
      },
      {
        key: 'screenshot',
        label: 'Screenshot',
        done: overview.web.screenshotStatus === 'SUCCESS',
        description: describeAssetStatus(overview.web.screenshotStatus)
      },
      {
        key: 'scan',
        label: 'Scan dokončen',
        done: overview.analysis.hasScanResult,
        description: overview.analysis.hasScanResult ? 'Hotovo' : 'Čeká na zpracování'
      },
      {
        key: 'analysis',
        label: 'Byznys profil',
        done: overview.analysis.hasBusinessProfile,
        description: overview.analysis.hasBusinessProfile ? 'Hotovo' : 'Čeká na zpracování'
      },
      {
        key: 'strategy',
        label: 'SEO strategie',
        done: overview.analysis.hasSeoStrategy,
        description: overview.analysis.hasSeoStrategy
          ? `Naplánováno: ${overview.plan.stats.planned} článků`
          : 'Čeká na generování'
      },
      {
        key: 'article',
        label: 'Draft článku',
        done: overview.articles.length > 0,
        description: overview.articles.length > 0
          ? 'Draft připraven'
          : nextPlanned
            ? `Další plán: ${nextPlanned}`
            : 'Čeká na plán'
      }
    ];
  }, [overview]);

  const handleGenerateArticle = async () => {
    if (!selectedWebId) return;
    setGenerateLoading(true);
    setError(null);
    try {
      await apiFetch(`/webs/${selectedWebId}/generate-article`, {
        method: 'POST'
      });
      await loadOverview(selectedWebId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se zařadit generování.');
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleRefreshFavicon = async () => {
    if (!selectedWebId) return;
    setRefreshingFavicon(true);
    setError(null);
    try {
      await apiFetch(`/webs/${selectedWebId}/refresh-favicon`, { method: 'POST' });
      await loadOverview(selectedWebId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se zařadit aktualizaci favicony.');
    } finally {
      setRefreshingFavicon(false);
    }
  };

  const handleRefreshScreenshot = async () => {
    if (!selectedWebId) return;
    setRefreshingScreenshot(true);
    setError(null);
    try {
      await apiFetch(`/webs/${selectedWebId}/refresh-screenshot`, { method: 'POST' });
      await loadOverview(selectedWebId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se zařadit aktualizaci screenshotu.');
    } finally {
      setRefreshingScreenshot(false);
    }
  };

  const handleDeleteWeb = async () => {
    if (!selectedWebId) return;
    if (!overview || overview.web.status === 'ACTIVE') {
      setError('Aktivní web nelze smazat.');
      return;
    }
    if (!window.confirm('Opravdu chcete tento web smazat? Tato akce je nevratná.')) {
      return;
    }
    setError(null);
    try {
      await apiFetch(`/webs/${selectedWebId}`, {
        method: 'DELETE'
      });
      if (profile) {
        const remaining = profile.webs.filter((web) => web.id !== selectedWebId);
        setProfile({ ...profile, webs: remaining });
        const next = remaining[0]?.id ?? null;
        setSelectedWebId(next);
        setOverview(null);
        setDebugData(null);
        if (!next) {
          router.push('/onboarding/add-site');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Web se nepodařilo smazat.');
    }
  };

  const triggerDebugStep = async (path: string) => {
    if (!selectedWebId) return;
    setError(null);
    try {
      await apiFetch(`/webs/${selectedWebId}/${path}`, { method: 'POST' });
      await loadOverview(selectedWebId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se znovu spustit krok pipeline.');
    }
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Dashboard</title>
      </Head>
      <div className="dashboard">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>SEO Booster</h1>
            <p>{profile?.user.email}</p>
          </div>
          <div className="webs">
            <p className="sidebar-label">Vaše weby</p>
            {profile?.webs.length ? (
              profile.webs.map((web) => (
                <button
                  key={web.id}
                  className={`web-chip ${selectedWebId === web.id ? 'active' : ''}`}
                  onClick={() => setSelectedWebId(web.id)}
                >
                  <div className="web-chip-content">
                    <div className="web-chip-icon">
                      {web.faviconStatus === 'SUCCESS' && web.faviconUrl ? (
                        <img src={web.faviconUrl} alt="Favicon" />
                      ) : (
                        <span className="web-chip-placeholder">{getFaviconInitial(web)}</span>
                      )}
                    </div>
                    <div>
                      <span>{web.nickname ?? web.url}</span>
                      <small>{web.status}</small>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <p className="muted">Zatím žádné připojené weby.</p>
            )}
          </div>
          <Link className="button ghost" href="/onboarding/add-site">
            Přidat další web
          </Link>
          {selectedWebId && overview && overview.web.status !== 'ACTIVE' && (
            <button type="button" className="button ghost danger" onClick={handleDeleteWeb}>
              Smazat tento web
            </button>
          )}
          {isSuperadmin && (
            <Link className="button ghost" href="/admin/prompts">
              Superadmin: prompty
            </Link>
          )}
        </aside>

        <main className="content">
          <header>
            <div>
              <p className="eyebrow">Dashboard</p>
              <h2>{overview?.web.nickname ?? overview?.web.url ?? 'Vyberte web'}</h2>
            </div>
            <button className="button primary" onClick={handleGenerateArticle} disabled={!selectedWebId || generateLoading}>
              {generateLoading ? 'Generuji…' : 'Vygenerovat článek'}
            </button>
          </header>

          {error && <div className="notice error">{error}</div>}
          {loadingOverview && <div className="notice">Načítám data…</div>}

          {overview && !loadingOverview && (
            <>
              <section className="panel">
                <h3>Pipeline</h3>
                <div className="pipeline">
                  {pipelineSteps.map((step) => (
                    <div key={step.key} className={`pipeline-step ${step.done ? 'done' : ''}`}>
                      <div className="dot" />
                      <div>
                        <strong>{step.label}</strong>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel assets-panel">
                <div className="panel-header">
                  <h3>Vizuální assety</h3>
                  <div className="asset-actions">
                    <button
                      className="button ghost"
                      type="button"
                      onClick={handleRefreshFavicon}
                      disabled={!selectedWebId || refreshingFavicon}
                    >
                      {refreshingFavicon ? 'Aktualizuji faviconu…' : 'Obnovit faviconu'}
                    </button>
                    <button
                      className="button ghost"
                      type="button"
                      onClick={handleRefreshScreenshot}
                      disabled={!selectedWebId || refreshingScreenshot}
                    >
                      {refreshingScreenshot ? 'Aktualizuji screenshot…' : 'Obnovit screenshot'}
                    </button>
                  </div>
                </div>
                <div className="assets-grid">
                  <div className={`asset-card ${getStatusClassName(overview.web.faviconStatus)}`}>
                    <p className="asset-label">Favicon</p>
                    <div className="favicon-frame">
                      {overview.web.faviconStatus === 'SUCCESS' && overview.web.faviconUrl ? (
                        <img src={overview.web.faviconUrl} alt="Favicon" />
                      ) : (
                        <span className="favicon-placeholder">{getFaviconInitial(overview.web)}</span>
                      )}
                    </div>
                    <p className="asset-status-text">
                      {describeAssetStatus(overview.web.faviconStatus)} ·{' '}
                      {formatAssetTimestamp(overview.web.faviconLastFetchedAt)}
                    </p>
                  </div>
                  <div className={`asset-card screenshot ${getStatusClassName(overview.web.screenshotStatus)}`}>
                    <p className="asset-label">Homepage náhled</p>
                    <div className="screenshot-frame">
                      {overview.web.screenshotStatus === 'SUCCESS' && overview.web.screenshotUrl ? (
                        <img src={overview.web.screenshotUrl} alt="Náhled homepage" />
                      ) : (
                        <div className="screenshot-placeholder">
                          {overview.web.screenshotStatus === 'FAILED'
                            ? 'Nepodařilo se načíst homepage.'
                            : 'Screenshot se připravuje…'}
                        </div>
                      )}
                    </div>
                    <p className="asset-status-text">
                      {describeAssetStatus(overview.web.screenshotStatus)} ·{' '}
                      {formatAssetTimestamp(overview.web.screenshotLastGeneratedAt)}
                      {overview.web.screenshotWidth && overview.web.screenshotHeight
                        ? ` (${overview.web.screenshotWidth}×${overview.web.screenshotHeight})`
                        : ''}
                    </p>
                  </div>
                </div>
              </section>

              <section className="panel">
                <h3>Plán článků</h3>
                <div className="plan-stats">
                  <div>
                    <strong>Naplánováno</strong>
                    <span>{overview.plan.stats.planned}</span>
                  </div>
                  <div>
                    <strong>Vygenerováno</strong>
                    <span>{overview.plan.stats.generated}</span>
                  </div>
                  <div>
                    <strong>Publikováno</strong>
                    <span>{overview.plan.stats.published}</span>
                  </div>
                </div>
                {overview.plan.upcoming.length === 0 ? (
                  <p className="muted">Žádné budoucí články zatím nejsou naplánované.</p>
                ) : (
                  <ul className="plan-list">
                    {overview.plan.upcoming.map((plan) => (
                      <li key={plan.id}>
                        <div>
                          <strong>{plan.supportingArticleTitle}</strong>
                          <small>{plan.clusterName}</small>
                        </div>
                        <span>{formatDateTime(plan.plannedPublishAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel">
                <h3>Poslední články</h3>
                {overview.articles.length === 0 ? (
                  <p className="muted">Zatím zde nic není. Jakmile generátor doběhne, uvidíte draft článku.</p>
                ) : (
                  <ul className="articles">
                    {overview.articles.map((article) => (
                      <li key={article.id}>
                        <div>
                          <strong>{article.title}</strong>
                          <small>{article.status}</small>
                        </div>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {debugMode && debugData && (
                <section className="panel debug">
                  <h3>Pipeline debug (local only)</h3>
                  <div className="debug-actions">
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => triggerDebugStep('debug/scan')}
                    >
                      Znovu spustit scan
                    </button>
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => triggerDebugStep('debug/analyze')}
                    >
                      Znovu spustit analýzu
                    </button>
                    <button
                      type="button"
                      className="button ghost"
                      onClick={() => triggerDebugStep('debug/strategy')}
                    >
                      Znovu vygenerovat strategii
                    </button>
                  </div>
                  <div className="debug-grid">
                    <div>
                      <h4>Scan result</h4>
                      <pre>{JSON.stringify(debugData.scanResult, null, 2)}</pre>
                    </div>
                    <div>
                      <h4>Business profile</h4>
                      <pre>{JSON.stringify(debugData.businessProfile, null, 2)}</pre>
                    </div>
                    <div>
                      <h4>SEO strategy</h4>
                      <pre>{JSON.stringify(debugData.seoStrategy, null, 2)}</pre>
                    </div>
                    <div>
                      <h4>Latest article</h4>
                      <pre>{JSON.stringify(debugData.latestArticle, null, 2)}</pre>
                    </div>
                    {debugData.rawScanOutput && (
                      <div>
                        <h4>Raw scan output (model content)</h4>
                        <pre>{debugData.rawScanOutput}</pre>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      <style jsx>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background: #05060b;
          color: #fff;
        }
        .sidebar {
          width: 320px;
          padding: 2rem 1.5rem;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          background: #080b16;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .sidebar-header h1 {
          margin: 0;
        }
        .sidebar-label {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .web-chip {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.9rem;
          padding: 0.9rem;
          margin-bottom: 0.6rem;
          color: inherit;
          cursor: pointer;
        }
        .web-chip-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .web-chip-icon {
          width: 32px;
          height: 32px;
          border-radius: 0.8rem;
          background: rgba(148, 163, 184, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .web-chip-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .web-chip-placeholder {
          font-weight: 600;
        }
        .web-chip.active {
          border-color: #7dd3fc;
          background: rgba(125, 211, 252, 0.1);
        }
        .web-chip span {
          display: block;
          font-weight: 600;
        }
        .web-chip small {
          color: #94a3b8;
        }
        .button {
          text-decoration: none;
          display: inline-block;
          padding: 0.8rem 1.2rem;
          border-radius: 999px;
          text-align: center;
          font-weight: 600;
          border: none;
        }
        .button.primary {
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6);
          color: #fff;
        }
        .button.ghost {
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #fff;
        }
        .button.ghost.danger {
          border-color: rgba(248, 113, 113, 0.6);
          color: #fecaca;
        }
        .content {
          flex: 1;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .eyebrow {
          text-transform: uppercase;
          font-size: 0.8rem;
          color: #7dd3fc;
          letter-spacing: 0.3em;
        }
        .panel {
          background: #0f1323;
          border-radius: 1.2rem;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .asset-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .assets-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .assets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }
        .asset-card {
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          padding: 1rem;
          background: rgba(15, 19, 35, 0.8);
        }
        .asset-card.pending {
          border-color: rgba(125, 211, 252, 0.3);
        }
        .asset-card.failed {
          border-color: rgba(248, 113, 113, 0.4);
        }
        .asset-label {
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          color: #94a3b8;
          margin-bottom: 0.5rem;
        }
        .favicon-frame {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: rgba(148, 163, 184, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
        }
        .favicon-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .favicon-placeholder {
          font-size: 1.5rem;
          font-weight: 700;
          color: #e2e8f0;
        }
        .screenshot-frame {
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(2, 6, 23, 0.8);
          min-height: 180px;
        }
        .screenshot-frame img {
          width: 100%;
          display: block;
        }
        .screenshot-placeholder {
          padding: 1.5rem;
          text-align: center;
          color: #94a3b8;
        }
        .asset-status-text {
          color: #cbd5f5;
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        .panel.debug pre {
          max-height: 200px;
          overflow: auto;
          background: #020617;
          border-radius: 0.6rem;
          padding: 0.75rem 1rem;
          font-size: 0.75rem;
        }
        .debug-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .debug-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .pipeline {
          display: grid;
          gap: 1rem;
        }
        .pipeline-step {
          display: flex;
          gap: 1rem;
          align-items: center;
          opacity: 0.5;
        }
        .pipeline-step.done {
          opacity: 1;
        }
        .pipeline-step .dot {
          width: 0.9rem;
          height: 0.9rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
        }
        .pipeline-step.done .dot {
          background: #7dd3fc;
          box-shadow: 0 0 12px rgba(125, 211, 252, 0.4);
        }
        .articles {
          list-style: none;
          padding: 0;
          margin: 1rem 0 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .articles li {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 0.5rem;
        }
        .plan-stats {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .plan-stats div {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 0.9rem;
          padding: 1rem;
          min-width: 150px;
        }
        .plan-stats span {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .plan-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .plan-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.6rem;
        }
        .plan-list small {
          display: block;
          color: #94a3b8;
        }
        .muted {
          color: #94a3b8;
        }
        .notice {
          padding: 1rem;
          border-radius: 0.9rem;
          background: rgba(125, 211, 252, 0.1);
        }
        .notice.error {
          background: rgba(248, 113, 113, 0.15);
        }
        @media (max-width: 960px) {
          .dashboard {
            flex-direction: column;
          }
          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
        }
      `}</style>
    </>
  );
};

export default DashboardPage;
