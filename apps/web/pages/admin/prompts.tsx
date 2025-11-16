import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

type TaskKey = 'scan' | 'analyze' | 'strategy' | 'article';

interface MeResponse {
  user: {
    id: string;
    email: string;
    role?: string;
  };
}

interface PromptDto {
  task: TaskKey;
  systemPrompt: string;
  userPrompt: string;
  updatedAt?: string;
}

const TASKS: Array<{ key: TaskKey; title: string; description: string }> = [
  {
    key: 'scan',
    title: 'Scan webu',
    description: 'První krok: stáhneme URL a připravíme podklady pro analýzu.'
  },
  {
    key: 'analyze',
    title: 'Business analýza',
    description: 'Z naskenovaných dat stavíme obraz firmy a publika.'
  },
  {
    key: 'strategy',
    title: 'SEO strategie',
    description: 'Tvoříme pilíře, témata a clustery pro dlouhodobý plán.'
  },
  {
    key: 'article',
    title: 'Denní článek',
    description: 'Z konkrétního clusteru se generuje článek pro WordPress.'
  }
];

const AdminPromptsPage = () => {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskKey>('scan');
  const [promptList, setPromptList] = useState<PromptDto[]>([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  useEffect(() => {
    let isMounted = true;

    if (!getToken()) {
      router.replace('/login');
      return;
    }

    const checkRole = async () => {
      try {
        const me = await apiFetch<MeResponse>('/me');
        if (!isMounted) return;

        if (me.user.role !== 'SUPERADMIN') {
          router.replace('/dashboard');
          return;
        }

        setIsSuperadmin(true);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Nastala chyba při ověřování.');
      } finally {
        if (!isMounted) return;
        setCheckingAuth(false);
      }
    };

    checkRole();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const promptMap = useMemo(() => {
    return promptList.reduce<Record<string, PromptDto>>((acc, prompt) => {
      acc[prompt.task] = prompt;
      return acc;
    }, {});
  }, [promptList]);

  const loadPrompts = useCallback(async () => {
    setListLoading(true);
    setError(null);
    try {
      const data = await apiFetch<PromptDto[]>('/admin/prompts');
      setPromptList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se načíst seznam promptů.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const loadPromptDetail = useCallback(
    async (task: TaskKey) => {
      setDetailLoading(true);
      setSuccessMessage(null);
      setError(null);
      try {
        const detail = await apiFetch<PromptDto>(`/admin/prompts/${task}`);
        setSystemPrompt(detail.systemPrompt ?? '');
        setUserPrompt(detail.userPrompt ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodařilo se načíst detail promptu.');
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!isSuperadmin) {
      return;
    }
    loadPrompts();
  }, [isSuperadmin, loadPrompts]);

  useEffect(() => {
    if (!isSuperadmin) {
      return;
    }
    loadPromptDetail(selectedTask);
  }, [isSuperadmin, selectedTask, loadPromptDetail]);

  const handleSave = async () => {
    if (!selectedTask) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/admin/prompts/${selectedTask}`, {
        method: 'PUT',
        body: JSON.stringify({
          systemPrompt,
          userPrompt
        })
      });
      setSuccessMessage('Prompty uloženy.');
      await loadPrompts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit prompt.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!selectedTask) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/admin/prompts/${selectedTask}`, {
        method: 'DELETE'
      });
      setSuccessMessage('Prompty vráceny na výchozí hodnoty.');
      await loadPrompts();
      await loadPromptDetail(selectedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se resetovat prompt.');
    } finally {
      setSaving(false);
    }
  };

  const selectedMeta = TASKS.find((task) => task.key === selectedTask);
  const selectedConfig = promptMap[selectedTask];
  const formattedUpdatedAt = selectedConfig?.updatedAt ? new Date(selectedConfig.updatedAt).toLocaleString() : null;
  const canReset = Boolean(selectedConfig);

  return (
    <>
      <Head>
        <title>SEO Booster – Superadmin prompty</title>
      </Head>
      <main className="admin-prompts">
        <header>
          <div>
            <p className="eyebrow">Superadmin</p>
            <h1>Správa AI promptů</h1>
            <p className="subtitle">Každý krok pipeline může mít vlastní instrukce. Edituj je bezpečně jen v dev.</p>
          </div>
          <Link href="/dashboard" className="button ghost">
            Zpět na dashboard
          </Link>
        </header>

        {checkingAuth && <p>Ověřuji oprávnění…</p>}
        {error && <p className="error">{error}</p>}

        {isSuperadmin && !checkingAuth && (
          <div className="prompts-grid">
            <aside>
              <div className="panel-header">
                <h2>Kroky pipeline</h2>
                {listLoading && <small>Načítám…</small>}
              </div>
              <ul>
                {TASKS.map((task) => {
                  const isActive = selectedTask === task.key;
                  const isCustom = Boolean(promptMap[task.key]);
                  return (
                    <li key={task.key}>
                      <button className={`task ${isActive ? 'active' : ''}`} onClick={() => setSelectedTask(task.key)}>
                        <div>
                          <strong>{task.title}</strong>
                          <p>{task.description}</p>
                        </div>
                        <span className={`badge ${isCustom ? 'custom' : 'default'}`}>
                          {isCustom ? 'custom' : 'default'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <section className="editor">
              {detailLoading ? (
                <p>Načítám detail…</p>
              ) : (
                <>
                  <div className="editor-head">
                    <h2>{selectedMeta?.title}</h2>
                    {formattedUpdatedAt && <small>Naposledy upraveno: {formattedUpdatedAt}</small>}
                  </div>
                  <p className="muted">{selectedMeta?.description}</p>

                  <label>
                    <span>System prompt</span>
                    <textarea
                      value={systemPrompt}
                      onChange={(event) => setSystemPrompt(event.target.value)}
                      rows={8}
                      placeholder="Pokyny pro model (např. styl, role, postup)."
                    />
                  </label>

                  <label>
                    <span>User prompt</span>
                    <textarea
                      value={userPrompt}
                      onChange={(event) => setUserPrompt(event.target.value)}
                      rows={10}
                      placeholder="Konkrétní vstup s proměnnými (např. {{url}})."
                    />
                  </label>

                  <div className="actions">
                    <button className="button primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Ukládám…' : 'Uložit'}
                    </button>
                    <button className="button ghost" onClick={handleReset} disabled={!canReset || saving}>
                      Reset na default
                    </button>
                  </div>

                  {successMessage && <p className="success">{successMessage}</p>}
                  {!canReset && <p className="muted">Momentálně se používají výchozí prompty z kódu.</p>}
                </>
              )}
            </section>
          </div>
        )}
      </main>
      <style jsx>{`
        .admin-prompts {
          min-height: 100vh;
          background: #05060b;
          color: #f1f5ff;
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 0.8rem;
          color: #7dd3fc;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          margin-top: 0.2rem;
          color: #cbd5f5;
        }
        .button {
          border-radius: 999px;
          padding: 0.6rem 1.5rem;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: #e2e8ff;
          transition: border-color 0.2s ease;
        }
        .button.primary {
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6);
          border: none;
        }
        .button:hover {
          border-color: #fff;
        }
        .prompts-grid {
          display: grid;
          grid-template-columns: minmax(240px, 320px) 1fr;
          gap: 2rem;
        }
        aside {
          background: #0c1224;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .panel-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        aside ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .task {
          width: 100%;
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.8rem;
          padding: 0.9rem;
          background: transparent;
          color: inherit;
          display: flex;
          justify-content: space-between;
          gap: 0.5rem;
          cursor: pointer;
        }
        .task.active {
          border-color: #7dd3fc;
          background: rgba(125, 211, 252, 0.1);
        }
        .task strong {
          display: block;
          margin-bottom: 0.2rem;
        }
        .task p {
          margin: 0;
          font-size: 0.9rem;
          color: #a5b4fc;
        }
        .badge {
          align-self: flex-start;
          font-size: 0.75rem;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          padding: 0.15rem 0.6rem;
        }
        .badge.custom {
          border-color: #22c55e;
          color: #22c55e;
        }
        .badge.default {
          border-color: #818cf8;
          color: #818cf8;
        }
        .editor {
          background: #0c1224;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          min-height: 540px;
        }
        .editor-head {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: baseline;
        }
        label {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-top: 1.5rem;
        }
        textarea {
          width: 100%;
          border-radius: 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(5, 6, 11, 0.6);
          color: #f1f5ff;
          font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace;
          font-size: 0.95rem;
          padding: 0.9rem;
          resize: vertical;
        }
        textarea:focus {
          outline: none;
          border-color: #7dd3fc;
        }
        .muted {
          color: #94a3b8;
          margin-top: 0.3rem;
        }
        .error {
          color: #fda4af;
        }
        .success {
          color: #4ade80;
          margin-top: 0.8rem;
        }
        .actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        @media (max-width: 960px) {
          .prompts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default AdminPromptsPage;
