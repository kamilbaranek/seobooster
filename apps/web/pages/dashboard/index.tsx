import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

interface MeResponse {
  user: {
    id: string;
    email: string;
  };
  webs: Array<{
    id: string;
    url: string;
    nickname?: string | null;
    status: string;
    createdAt: string;
  }>;
}

interface OverviewResponse {
  web: {
    id: string;
    url: string;
    status: string;
    nickname?: string | null;
    createdAt: string;
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
}

const DashboardPage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [selectedWebId, setSelectedWebId] = useState<string | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodařilo se načíst web.');
      } finally {
        setLoadingOverview(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedWebId) {
      return;
    }
    loadOverview(selectedWebId);
  }, [loadOverview, selectedWebId]);

  const pipelineSteps = useMemo(() => {
    if (!overview) return [];
    return [
      { key: 'scan', label: 'Scan dokončen', done: overview.analysis.hasScanResult },
      { key: 'analysis', label: 'Byznys profil', done: overview.analysis.hasBusinessProfile },
      { key: 'strategy', label: 'SEO strategie', done: overview.analysis.hasSeoStrategy },
      { key: 'article', label: 'Draft článku', done: overview.articles.length > 0 }
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
                  <span>{web.nickname ?? web.url}</span>
                  <small>{web.status}</small>
                </button>
              ))
            ) : (
              <p className="muted">Zatím žádné připojené weby.</p>
            )}
          </div>
          <Link className="button ghost" href="/onboarding">
            Přidat další web
          </Link>
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
                        <p>{step.done ? 'Hotovo' : 'Čeká na zpracování'}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
