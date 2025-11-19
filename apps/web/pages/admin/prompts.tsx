import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../lib/api-client';
import { getToken } from '../../lib/auth-storage';

type TaskKey = 'scan' | 'analyze' | 'strategy' | 'article' | 'article_image';

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
  provider?: string | null;
  model?: string | null;
  isCustom?: boolean;
  forceJsonResponse?: boolean | null;
}

interface PreviewResponse {
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, unknown>;
}

interface AiLogListItem {
  id: string;
  createdAt: string;
  webId?: string | null;
  task: TaskKey;
  provider: string;
  model: string;
  status: string;
}

interface AiLogDetail extends AiLogListItem {
  variables?: Record<string, unknown> | null;
  systemPrompt: string;
  userPrompt: string;
  responseRaw?: unknown;
  responseParsed?: unknown;
  errorMessage?: string | null;
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
  },
  {
    key: 'article_image',
    title: 'Obrázek článku',
    description: 'Generuje text-to-image prompt pro featured obrázek k článku.'
  }
];

const VARIABLE_DOCS: Record<TaskKey, Array<{ name: string; description: string }>> = {
  scan: [{ name: '{{url}}', description: 'URL webu, který se má skenovat.' }],
  analyze: [
    { name: '{{url}}', description: 'URL aktuálního webu.' },
    { name: '{{scanResult}}', description: 'JSON výstup předchozího scanu.' },
    {
      name: '{{rawScanOutput}}',
      description:
        'Raw text / message content z kroku Scan (použij, když je JSON response vypnutý nebo model vrací text).'
    }
  ],
  strategy: [{ name: '{{businessProfile}}', description: 'JSON profil firmy (výsledek analýzy).' }],
  article: [
    {
      name: '{{business}}',
      description: 'Shrnutí firmy použité pro článek (name, description, targetAudience).'
    },
    { name: '{{business.name}}', description: 'Název firmy / projektu.' },
    {
      name: '{{business.description}}',
      description: 'Stručný popis firmy / hodnoty (z business profilu nebo strategie).'
    },
    {
      name: '{{business.targetAudience}}',
      description: 'Primární cílové publikum (string nebo seznam hodnot spojených čárkami).'
    },
    {
      name: '{{topicCluster}}',
      description: 'Vybraný SEO cluster (pillar stránka, klíčová slova, intent, fáze funnelu).'
    },
    { name: '{{topicCluster.pillarPage}}', description: 'Název / H1 pillar stránky pro daný cluster.' },
    {
      name: '{{topicCluster.pillarKeywords}}',
      description: 'Pole hlavních klíčových slov pro pillar page (array stringů).'
    },
    { name: '{{topicCluster.intent}}', description: 'Search intent pro cluster (např. informational).' },
    { name: '{{topicCluster.funnelStage}}', description: 'Funnel stage (např. TOFU / MOFU / BOFU).' },
    {
      name: '{{supportingArticle}}',
      description: 'Konkrétní supporting článek plánovaný pro dnešní generování.'
    },
    { name: '{{supportingArticle.title}}', description: 'Nadpis supporting článku.' },
    {
      name: '{{supportingArticle.keywords}}',
      description: 'Pole cílových klíčových slov pro článek (array stringů).'
    },
    { name: '{{supportingArticle.intent}}', description: 'Search intent supporting článku.' },
    {
      name: '{{supportingArticle.funnelStage}}',
      description: 'Funnel stage supporting článku (většinou kopíruje cluster).'
    },
    {
      name: '{{supportingArticle.metaDescription}}',
      description: 'Meta description / krátké shrnutí článku (pokud je k dispozici).'
    },
    {
      name: '{{web}}',
      description: 'Základní informace o webu, pro který se článek generuje.'
    },
    { name: '{{web.url}}', description: 'URL webu.' },
    {
      name: '{{web.nickname}}',
      description: 'Interní název / přezdívka webu (pokud je nastavená).'
    },
    {
      name: '{{webAudience}}',
      description: 'Cílové publikum webu (pole stringů z business profilu).'
    },
    {
      name: '{{webOwner.email}}',
      description: 'E‑mail vlastníka webu (uživatele).'
    }
  ],
  article_image: [
    {
      name: '{{business}}',
      description: 'Shrnutí firmy (name, description, targetAudience) použité pro kontext obrázku.'
    },
    { name: '{{business.name}}', description: 'Název firmy / projektu.' },
    {
      name: '{{business.targetAudience}}',
      description: 'Primární cílové publikum (string nebo seznam hodnot spojených čárkami).'
    },
    { name: '{{article.title}}', description: 'Titulek článku, ke kterému se generuje obrázek.' },
    {
      name: '{{article.summary}}',
      description: 'Zkrácený popis obsahu článku (shrnutí, ne celý text).'
    },
    {
      name: '{{article.keywords}}',
      description: 'Klíčová slova článku / clustru (pole stringů).'
    },
    {
      name: '{{web}}',
      description: 'Základní informace o webu – např. brandové barvy, tone of voice apod.'
    },
    { name: '{{web.url}}', description: 'URL webu.' },
    {
      name: '{{web.nickname}}',
      description: 'Interní název / přezdívka webu (pokud je nastavená).'
    }
  ]
};

const PROVIDER_OPTIONS = [
  { value: 'default', label: 'Výchozí (globální nastavení)' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'google', label: 'Google AI (Gemini)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' }
];

const MODEL_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  openrouter: [],
  google: [
    { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Experimental (image generation)' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Flash Thinking' }
  ],
  openai: [
    { value: 'openai/gpt-4o-mini', label: 'gpt-4o-mini' },
    { value: 'openai/gpt-4.1-mini', label: 'gpt-4.1-mini' }
  ],
  anthropic: [
    { value: 'anthropic/claude-3.7-sonnet', label: 'claude-3.7-sonnet' },
    { value: 'anthropic/claude-3.5-sonnet', label: 'claude-3.5-sonnet' }
  ]
};

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
  const [providerChoice, setProviderChoice] = useState('default');
  const [modelChoice, setModelChoice] = useState('');
  const [forceJsonResponse, setForceJsonResponse] = useState(true);
  const [openrouterModels, setOpenrouterModels] = useState<Array<{ value: string; label: string }>>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [logEntries, setLogEntries] = useState<AiLogListItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logDetail, setLogDetail] = useState<AiLogDetail | null>(null);
  const [logDetailLoading, setLogDetailLoading] = useState(false);
  const [logDetailError, setLogDetailError] = useState<string | null>(null);
  const formatDateTime = (value: string) => new Date(value).toLocaleString();
  const renderJson = (value: unknown) => {
    try {
      return JSON.stringify(value ?? null, null, 2);
    } catch {
      return 'Nelze serializovat obsah.';
    }
  };

  const extractMessageContent = (log: AiLogDetail | null) => {
    if (!log) return null;

    const vars = log.variables as any;
    if (vars && typeof vars === 'object' && 'rawScanOutput' in vars && vars.rawScanOutput) {
      const raw = vars.rawScanOutput;
      return typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
    }

    const raw = log.responseRaw as any;
    if (!raw) return null;
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw.choices)) {
      const content = raw.choices[0]?.message?.content;
      if (typeof content === 'string') return content;
    }
    return null;
  };

  const loadOpenrouterModels = useCallback(async () => {
    if (openrouterModels.length > 0 || modelsLoading) return;
    setModelsLoading(true);
    setModelsError(null);
    try {
      const data = await apiFetch<Array<{ id: string; name: string }>>('/admin/models/openrouter');
      const options = data.map((model) => ({ value: model.id, label: model.name || model.id }));
      setOpenrouterModels(options);
    } catch (err) {
      setModelsError(err instanceof Error ? err.message : 'Nelze načíst modely z OpenRouteru.');
    } finally {
      setModelsLoading(false);
    }
  }, [modelsLoading, openrouterModels.length]);

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
        if (isMounted) {
          setCheckingAuth(false);
        }
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
        setProviderChoice(detail.provider ?? 'default');
        setModelChoice(detail.model ?? '');
        setForceJsonResponse(detail.forceJsonResponse ?? true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nepodařilo se načíst detail promptu.');
      } finally {
        setDetailLoading(false);
      }
    },
    []
  );

  const loadLogs = useCallback(
    async (task: TaskKey) => {
      setLogsLoading(true);
      setLogsError(null);
      setSelectedLogId(null);
      setLogDetail(null);
      try {
        const data = await apiFetch<AiLogListItem[]>(`/admin/ai-logs?task=${task}&limit=20`);
        setLogEntries(data);
      } catch (err) {
        setLogsError(err instanceof Error ? err.message : 'Nepodařilo se načíst logy.');
        setLogEntries([]);
      } finally {
        setLogsLoading(false);
      }
    },
    []
  );

  const loadLogDetail = useCallback(async (logId: string) => {
    setLogDetailLoading(true);
    setLogDetailError(null);
    try {
      const detail = await apiFetch<AiLogDetail>(`/admin/ai-logs/${logId}`);
      setLogDetail(detail);
    } catch (err) {
      setLogDetailError(err instanceof Error ? err.message : 'Nelze načíst detail záznamu.');
      setLogDetail(null);
    } finally {
      setLogDetailLoading(false);
    }
  }, []);

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
    loadLogs(selectedTask);
  }, [isSuperadmin, selectedTask, loadPromptDetail, loadLogs]);

  useEffect(() => {
    if (!isSuperadmin) {
      return;
    }
    if (providerChoice === 'openrouter') {
      loadOpenrouterModels();
    }
  }, [isSuperadmin, providerChoice, loadOpenrouterModels]);

  useEffect(() => {
    setModelChoice((current) => {
      if (providerChoice === 'default') {
        return '';
      }
      const models =
        providerChoice === 'openrouter' ? openrouterModels : MODEL_OPTIONS[providerChoice] ?? [];
      if (current && !models.some((option) => option.value === current)) {
        return '';
      }
      return current;
    });
  }, [providerChoice, openrouterModels]);

  const handleSave = async () => {
    if (!selectedTask) return;
    setSaving(true);
    setError(null);
    setPreviewError(null);
    try {
      await apiFetch(`/admin/prompts/${selectedTask}`, {
        method: 'PUT',
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
          provider: providerChoice === 'default' ? null : providerChoice,
          model: modelChoice || null,
          forceJsonResponse
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
    setPreviewError(null);
    try {
      await apiFetch(`/admin/prompts/${selectedTask}`, {
        method: 'DELETE'
      });
      setSuccessMessage('Prompty vráceny na výchozí hodnoty.');
      await loadPrompts();
      await loadPromptDetail(selectedTask);
      setProviderChoice('default');
      setModelChoice('');
      setForceJsonResponse(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se resetovat prompt.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    if (!selectedTask) return;
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewData(null);
    try {
      const preview = await apiFetch<PreviewResponse>(`/admin/prompts/${selectedTask}/preview`, {
        method: 'POST',
        body: JSON.stringify({})
      });
      setPreviewData(preview);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : 'Nelze načíst náhled.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSelectLog = (logId: string) => {
    setSelectedLogId(logId);
    loadLogDetail(logId);
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
                  const isCustom = promptMap[task.key]?.isCustom ?? false;
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

                  <div className="provider-row">
                    <label className="stacked">
                      <span>AI poskytovatel</span>
                      <select
                        value={providerChoice}
                        onChange={(event) => setProviderChoice(event.target.value)}
                      >
                        {PROVIDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="stacked">
                      <span>Model</span>
                      <select
                        value={modelChoice}
                        onChange={(event) => setModelChoice(event.target.value)}
                        disabled={
                          providerChoice === 'default' ||
                          (providerChoice === 'openrouter'
                            ? openrouterModels.length === 0 && !modelsLoading
                            : !(MODEL_OPTIONS[providerChoice] ?? []).length)
                        }
                      >
                        <option value="">Dědit z výchozího nastavení</option>
                        {(providerChoice === 'openrouter'
                          ? openrouterModels
                          : MODEL_OPTIONS[providerChoice] ?? []
                        ).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                        {modelChoice &&
                          !(providerChoice === 'openrouter'
                            ? openrouterModels
                            : MODEL_OPTIONS[providerChoice] ?? []
                          ).some((option) => option.value === modelChoice) && (
                            <option value={modelChoice}>{modelChoice}</option>
                          )}
                      </select>
                    </label>
                    {providerChoice === 'openrouter' && (
                      <small className="muted">
                        {modelsLoading
                          ? 'Načítám modely z OpenRouteru…'
                          : modelsError
                          ? `Chyba při načítání modelů: ${modelsError}`
                          : openrouterModels.length
                          ? `${openrouterModels.length} dostupných modelů.`
                          : 'Žádné modely nenalezeny nebo klíč není správně nastaven.'}
                      </small>
                    )}
                  </div>
                  <label className="toggle-row">
                    <input
                      type="checkbox"
                      checked={forceJsonResponse}
                      onChange={(event) => setForceJsonResponse(event.target.checked)}
                    />
                    <span>Vynutit JSON response (doporučeno, vypni pro modely, které JSON režim nepodporují)</span>
                  </label>
                  {providerChoice === 'default' && (
                    <p className="muted">Pokud nepotřebuješ vlastní provider/model, nech „Výchozí“. Čerpá se z env proměnných AI_PROVIDER a AI_MODEL_*.</p>
                  )}

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
                    <button className="button ghost" onClick={handlePreview} disabled={previewLoading}>
                      {previewLoading ? 'Generuji náhled…' : 'Zobrazit náhled'}
                    </button>
                  </div>

                  {successMessage && <p className="success">{successMessage}</p>}
                  {!canReset && <p className="muted">Momentálně se používají výchozí prompty z kódu.</p>}

                  <section className="variables">
                    <h3>Dostupné proměnné</h3>
                    <ul>
                      {VARIABLE_DOCS[selectedTask].map((variable) => (
                        <li key={variable.name}>
                          <code>{variable.name}</code>
                          <span>{variable.description}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {previewError && <p className="error">{previewError}</p>}
                  {!forceJsonResponse && (
                    <p className="muted">
                      JSON režim je vypnutý – model může vracet čistý text. Pro další krok používej
                      proměnnou <code>rawScanOutput</code> nebo message content z historie.
                    </p>
                  )}
                  {previewData && (
                    <section className="preview">
                      <h3>Náhled výsledného requestu</h3>
                      <div className="preview-grid">
                        <div>
                          <h4>System prompt</h4>
                          <pre>{previewData.systemPrompt}</pre>
                        </div>
                        <div>
                          <h4>User prompt</h4>
                          <pre>{previewData.userPrompt}</pre>
                        </div>
                        <div>
                          <h4>Variables</h4>
                          <pre>{JSON.stringify(previewData.variables, null, 2)}</pre>
                        </div>
                      </div>
                    </section>
                  )}

                  <section className="history">
                    <div className="history-head">
                      <h3>Historie volání</h3>
                      {logsLoading && <small>Načítám…</small>}
                    </div>
                    {logsError && <p className="error">{logsError}</p>}
                    {!logsLoading && logEntries.length === 0 && <p className="muted">Zatím žádné záznamy.</p>}
                    {logEntries.length > 0 && (
                      <div className="logs-table-wrapper">
                        <table className="logs-table">
                          <thead>
                            <tr>
                              <th>Čas</th>
                              <th>Web</th>
                              <th>Provider</th>
                              <th>Model</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {logEntries.map((log) => (
                              <tr
                                key={log.id}
                                className={selectedLogId === log.id ? 'active' : ''}
                                onClick={() => handleSelectLog(log.id)}
                              >
                                <td>{formatDateTime(log.createdAt)}</td>
                                <td>{log.webId ?? '—'}</td>
                                <td>{log.provider}</td>
                                <td>{log.model}</td>
                                <td>
                                  <span className={`status-pill ${log.status.toLowerCase()}`}>
                                    {log.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {selectedLogId && logDetailLoading && <p className="muted">Načítám detail…</p>}
                    {logDetailError && <p className="error">{logDetailError}</p>}
                    {logDetail && (
                      <div className="log-detail">
                        <div className="log-meta">
                          <p>
                            <strong>Čas:</strong> {formatDateTime(logDetail.createdAt)}
                          </p>
                          <p>
                            <strong>Web:</strong> {logDetail.webId ?? 'N/A'}
                          </p>
                          <p>
                            <strong>Provider:</strong> {logDetail.provider} / {logDetail.model}
                          </p>
                          <p>
                            <strong>Status:</strong> {logDetail.status}
                          </p>
                        </div>
                        {logDetail.errorMessage && <p className="error">{logDetail.errorMessage}</p>}
                        <div className="preview-grid">
                          <div>
                            <h4>System prompt (used)</h4>
                            <pre>{logDetail.systemPrompt}</pre>
                          </div>
                          <div>
                            <h4>User prompt (used)</h4>
                            <pre>{logDetail.userPrompt}</pre>
                          </div>
                          <div>
                            <h4>Variables</h4>
                            <pre>{renderJson(logDetail.variables)}</pre>
                          </div>
                          <div>
                            <h4>Raw response</h4>
                            <pre>{renderJson(logDetail.responseRaw)}</pre>
                          </div>
                        </div>
                        {extractMessageContent(logDetail) && (
                          <div className="message-content">
                            <h4>Message content (model output)</h4>
                            <pre>{extractMessageContent(logDetail)}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
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
        .provider-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .stacked span {
          font-size: 0.85rem;
          color: #cbd5f5;
        }
        .toggle-row {
          margin-top: 0.8rem;
          display: flex;
          gap: 0.6rem;
          align-items: center;
          font-size: 0.9rem;
        }
        .toggle-row input[type='checkbox'] {
          width: 18px;
          height: 18px;
        }
        select {
          border-radius: 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(5, 6, 11, 0.6);
          color: #f1f5ff;
          padding: 0.75rem;
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
        .variables {
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.5rem;
        }
        .variables ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .variables li {
          display: flex;
          gap: 1rem;
          align-items: baseline;
        }
        .variables code {
          background: rgba(15, 23, 42, 0.9);
          padding: 0.2rem 0.5rem;
          border-radius: 0.4rem;
          font-family: 'JetBrains Mono', 'SFMono-Regular', ui-monospace, monospace;
        }
        .variables span {
          color: #cbd5f5;
        }
        .preview {
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.5rem;
        }
        .preview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .preview pre {
          white-space: pre-wrap;
          word-break: break-word;
          background: rgba(0, 0, 0, 0.3);
          padding: 1rem;
          border-radius: 0.6rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          min-height: 80px;
          max-height: 260px;
          overflow: auto;
        }
        .message-content {
          margin-top: 1.5rem;
          max-height: 260px;
          overflow: auto;
        }
        .history {
          margin-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1.5rem;
        }
        .history-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .logs-table-wrapper {
          overflow-x: auto;
          margin-top: 0.5rem;
        }
        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }
        .logs-table th,
        .logs-table td {
          text-align: left;
          padding: 0.4rem 0.6rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.85rem;
        }
        .logs-table tr {
          cursor: pointer;
        }
        .logs-table tr:hover,
        .logs-table tr.active {
          background: rgba(125, 211, 252, 0.08);
        }
        .status-pill {
          display: inline-block;
          padding: 0.1rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          text-transform: uppercase;
        }
        .status-pill.success {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
        }
        .status-pill.error {
          background: rgba(248, 113, 113, 0.15);
          color: #f87171;
        }
        .log-detail {
          margin-top: 1.5rem;
          max-height: 420px;
          overflow: auto;
        }
        .log-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
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
