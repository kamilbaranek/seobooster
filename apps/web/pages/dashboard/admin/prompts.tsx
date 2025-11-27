import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../../lib/api-client';
import DashboardLayout from '../../../components/dashboard/layout/DashboardLayout';
import withAdminAuth from '../../../components/auth/withAdminAuth';
import Swal from 'sweetalert2';

type TaskKey = 'scan' | 'analyze' | 'strategy' | 'article' | 'article_image';

interface PromptDto {
    task: TaskKey;
    orderIndex: number;
    systemPrompt: string;
    userPrompt: string;
    updatedAt?: string;
    provider?: string | null;
    model?: string | null;
    isCustom?: boolean;
    forceJsonResponse?: boolean | null;
    condition?: string | null;
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
    variables?: Record<string, unknown> | null;
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
        },
        {
            name: '{{previousStepOutput}}',
            description: 'Kompletní výstup z předchozího kroku (objekt s content, rawResponse, parsed).'
        },
        {
            name: '{{previousStepContent}}',
            description: 'Pouze textový obsah z předchozího kroku (pole content) - nejčastěji používané.'
        },
        {
            name: '{{step0Output}}',
            description: 'Kompletní výstup z prvního kroku (krok 0).'
        },
        {
            name: '{{step0Content}}',
            description: 'Pouze textový obsah z prvního kroku.'
        },
        {
            name: '{{step1Output}}',
            description: 'Kompletní výstup z druhého kroku (krok 1).'
        },
        {
            name: '{{step1Content}}',
            description: 'Pouze textový obsah z druhého kroku.'
        }
    ],
    strategy: [
        { name: '{{businessProfile}}', description: 'JSON profil firmy (výsledek analýzy).' },
        {
            name: '{{publishedArticlesTable}}',
            description: 'Markdown tabulka posledních 50 publikovaných článků (Title | Url | Keywords). Pomáhá vyhnout se duplicitě a zlepšit interní linkování.'
        },
        {
            name: '{{previousStepOutput}}',
            description: 'Kompletní výstup z předchozího kroku (objekt s content, rawResponse, parsed).'
        },
        {
            name: '{{previousStepContent}}',
            description: 'Pouze textový obsah z předchozího kroku (pole content) - nejčastěji používané.'
        },
        {
            name: '{{step0Output}}',
            description: 'Kompletní výstup z prvního kroku (krok 0).'
        },
        {
            name: '{{step0Content}}',
            description: 'Pouze textový obsah z prvního kroku.'
        },
        {
            name: '{{step1Output}}',
            description: 'Kompletní výstup z druhého kroku (krok 1).'
        },
        {
            name: '{{step1Content}}',
            description: 'Pouze textový obsah z druhého kroku.'
        }
    ],
    article: [
        {
            name: '{{publishedArticlesTable}}',
            description: 'Markdown tabulka posledních 50 publikovaných článků (Title | Url | Keywords). Pomáhá vyhnout se duplicitě a zlepšit interní linkování.'
        },
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
        },
        {
            name: '{{previousStepOutput}}',
            description: 'Kompletní výstup z předchozího kroku (objekt s content, rawResponse, parsed).'
        },
        {
            name: '{{previousStepContent}}',
            description: 'Pouze textový obsah z předchozího kroku (pole content) - nejčastěji používané.'
        },
        {
            name: '{{step0Output}}',
            description: 'Kompletní výstup z prvního kroku (krok 0).'
        },
        {
            name: '{{step0Content}}',
            description: 'Pouze textový obsah z prvního kroku.'
        },
        {
            name: '{{step1Output}}',
            description: 'Kompletní výstup z druhého kroku (krok 1).'
        },
        {
            name: '{{step1Content}}',
            description: 'Pouze textový obsah z druhého kroku.'
        }
    ],
    article_image: [
        {
            name: '{{business}}',
            description: 'Shrnutí firmy (name, description, targetAudience).'
        },
        { name: '{{business.name}}', description: 'Název firmy / projektu.' },
        { name: '{{business.description}}', description: 'Popis/mise firmy.' },
        { name: '{{business.targetAudience}}', description: 'Cílové publikum (pole stringů).' },
        { name: '{{web}}', description: 'Informace o webu (url, nickname).' },
        { name: '{{web.url}}', description: 'URL webu.' },
        {
            name: '{{web.nickname}}',
            description: 'Interní název / přezdívka webu (pokud je nastavená).'
        },
        { name: '{{article}}', description: 'Informace o článku (title, summary, keywords).' },
        { name: '{{article.title}}', description: 'Název článku / nadpis (H1).' },
        { name: '{{article.summary}}', description: 'Zkrácený obsah článku (první část markdown).' },
        { name: '{{article.keywords}}', description: 'Pole klíčových slov článku (array stringů).' },
        {
            name: '{{supportingArticle}}',
            description: 'Supporting článek, ke kterému se obrázek vztahuje (pokud existuje).'
        },
        {
            name: '{{seoCluster}}',
            description: 'SEO topic cluster, do kterého článek patří (pokud existuje).'
        },
        {
            name: '{{previousStepOutput}}',
            description: 'Kompletní výstup z předchozího kroku (objekt s content, rawResponse, parsed).'
        },
        {
            name: '{{previousStepContent}}',
            description: 'Pouze textový obsah z předchozího kroku (pole content) - nejčastěji používané.'
        },
        {
            name: '{{step0Output}}',
            description: 'Kompletní výstup z prvního kroku (krok 0).'
        },
        {
            name: '{{step0Content}}',
            description: 'Pouze textový obsah z prvního kroku.'
        },
        {
            name: '{{step1Output}}',
            description: 'Kompletní výstup z druhého kroku (krok 1).'
        },
        {
            name: '{{step1Content}}',
            description: 'Pouze textový obsah z druhého kroku.'
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
        { value: 'imagen-4.0-generate-001', label: 'Imagen 4.0 Standard (recommended for images)' },
        { value: 'imagen-4.0-ultra-generate-001', label: 'Imagen 4.0 Ultra (highest quality)' },
        { value: 'imagen-4.0-fast-generate-001', label: 'Imagen 4.0 Fast (quickest)' },
        { value: 'imagen-3.0-generate-002', label: 'Imagen 3.0' },
        { value: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Experimental (multimodal)' },
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (text)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (text)' },
        { value: 'gemini-2.0-flash-thinking-exp-1219', label: 'Gemini 2.0 Thinking (text)' }
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
    const [condition, setCondition] = useState('');
    const [openrouterModels, setOpenrouterModels] = useState<Array<{ value: string; label: string }>>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
    const [logEntries, setLogEntries] = useState<AiLogListItem[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState<string | null>(null);
    const [logDetail, setLogDetail] = useState<AiLogDetail | null>(null);
    const [logDetailLoading, setLogDetailLoading] = useState(false);
    const [logDetailError, setLogDetailError] = useState<string | null>(null);

    // New state for tabs, accordion, and multi-step prompts
    const [activeTab, setActiveTab] = useState<'general' | 'settings' | 'log'>('general');
    const [openLogId, setOpenLogId] = useState<string | null>(null);
    const [responseViewMode, setResponseViewMode] = useState<'raw' | 'json'>('json');
    const [promptSteps, setPromptSteps] = useState<PromptDto[]>([]);
    const [selectedStepIndex, setSelectedStepIndex] = useState(0);

    const formatDateTime = (value: string) => new Date(value).toLocaleString();
    const renderJson = (value: unknown) => {
        try {
            return JSON.stringify(value ?? null, null, 2);
        } catch {
            return 'Nelze serializovat obsah.';
        }
    };

    const renderResponse = (value: unknown, mode: 'raw' | 'json') => {
        if (mode === 'raw') {
            if (typeof value === 'string') return value;
            try {
                return JSON.stringify(value);
            } catch {
                return String(value);
            }
        }
        // JSON mode
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return JSON.stringify(parsed, null, 2);
            } catch {
                return value;
            }
        }
        return renderJson(value);
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
                const details = await apiFetch<PromptDto[]>(`/admin/prompts/${task}`);
                setPromptSteps(details);
                setSelectedStepIndex(0);

                if (details.length > 0) {
                    const firstStep = details[0];
                    setSystemPrompt(firstStep.systemPrompt ?? '');
                    setUserPrompt(firstStep.userPrompt ?? '');
                    setProviderChoice(firstStep.provider ?? 'default');
                    setModelChoice(firstStep.model ?? '');
                    setForceJsonResponse(firstStep.forceJsonResponse ?? true);
                    setCondition(firstStep.condition ?? '');
                }
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
            setOpenLogId(null);
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
        loadPrompts();
    }, [loadPrompts]);

    useEffect(() => {
        loadPromptDetail(selectedTask);
        loadLogs(selectedTask);
    }, [selectedTask, loadPromptDetail, loadLogs]);

    useEffect(() => {
        if (providerChoice === 'openrouter') {
            loadOpenrouterModels();
        }
    }, [providerChoice, loadOpenrouterModels]);

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
            // Update current step with current values
            const updatedSteps = [...promptSteps];
            if (updatedSteps[selectedStepIndex]) {
                updatedSteps[selectedStepIndex] = {
                    ...updatedSteps[selectedStepIndex],
                    systemPrompt,
                    userPrompt,
                    provider: providerChoice === 'default' ? null : providerChoice,
                    model: modelChoice || null,
                    forceJsonResponse,
                    condition: condition || null
                };
            }

            await apiFetch(`/admin/prompts/${selectedTask}`, {
                method: 'PUT',
                body: JSON.stringify(updatedSteps.map((step, index) => ({
                    systemPrompt: step.systemPrompt,
                    userPrompt: step.userPrompt,
                    provider: step.provider,
                    model: step.model,
                    forceJsonResponse: step.forceJsonResponse,
                    condition: step.condition
                })))
            });
            setSuccessMessage('Prompty uloženy.');
            await loadPrompts();
            await loadPromptDetail(selectedTask);
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
            setCondition('');
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

    // Step management helpers
    const handleAddStep = () => {
        const newStep: PromptDto = {
            task: selectedTask,
            orderIndex: promptSteps.length,
            systemPrompt: '',
            userPrompt: '',
            provider: null,
            model: null,
            forceJsonResponse: true,
            condition: null
        };
        setPromptSteps([...promptSteps, newStep]);
        setSelectedStepIndex(promptSteps.length);
        setSystemPrompt('');
        setUserPrompt('');
        setProviderChoice('default');
        setModelChoice('');
        setForceJsonResponse(true);
        setCondition('');
    };

    const handleRemoveStep = async (index: number) => {
        if (promptSteps.length <= 1) {
            Swal.fire({
                text: "You must have at least one step.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary",
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: "Delete Step",
            html: `Are you sure you want to permanently delete <b>Step ${index + 1}</b>?<br/><br/>This action is irreversible.`,
            icon: "warning",
            showCancelButton: true,
            buttonsStyling: false,
            confirmButtonText: "Permanently DELETE",
            cancelButtonText: "Keep",
            customClass: {
                confirmButton: "btn btn-danger",
                cancelButton: "btn btn-active-light"
            }
        });

        if (!result.value) return;

        // Remove step from state
        const newSteps = promptSteps.filter((_: unknown, i: number) => i !== index);
        setPromptSteps(newSteps);
        const newSelectedIndex = Math.min(selectedStepIndex, newSteps.length - 1);
        setSelectedStepIndex(newSelectedIndex);
        const newSelectedStep = newSteps[newSelectedIndex];
        if (newSelectedStep) {
            setSystemPrompt(newSelectedStep.systemPrompt);
            setUserPrompt(newSelectedStep.userPrompt);
            setProviderChoice(newSelectedStep.provider ?? 'default');
            setModelChoice(newSelectedStep.model ?? '');
            setForceJsonResponse(newSelectedStep.forceJsonResponse ?? true);
            setCondition(newSelectedStep.condition ?? '');
        }

        // Save to database
        try {
            await apiFetch(`/admin/prompts/${selectedTask}`, {
                method: 'PUT',
                body: JSON.stringify(newSteps.map((step) => ({
                    systemPrompt: step.systemPrompt,
                    userPrompt: step.userPrompt,
                    provider: step.provider,
                    model: step.model,
                    forceJsonResponse: step.forceJsonResponse,
                    condition: step.condition
                })))
            });
            setSuccessMessage('Step deleted successfully.');
            await loadPrompts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete step.');
            // Reload to revert changes
            await loadPromptDetail(selectedTask);
        }
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === promptSteps.length - 1) return;

        const newSteps = [...promptSteps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setPromptSteps(newSteps);
        setSelectedStepIndex(targetIndex);
    };

    const handleSelectStep = (index: number) => {
        // Save current values to current step
        const updatedSteps = [...promptSteps];
        if (updatedSteps[selectedStepIndex]) {
            updatedSteps[selectedStepIndex] = {
                ...updatedSteps[selectedStepIndex],
                systemPrompt,
                userPrompt,
                provider: providerChoice === 'default' ? null : providerChoice,
                model: modelChoice || null,
                forceJsonResponse,
                condition: condition || null
            };
            setPromptSteps(updatedSteps);
        }

        // Load selected step
        setSelectedStepIndex(index);
        const selectedStep = updatedSteps[index];
        if (selectedStep) {
            setSystemPrompt(selectedStep.systemPrompt);
            setUserPrompt(selectedStep.userPrompt);
            setProviderChoice(selectedStep.provider ?? 'default');
            setModelChoice(selectedStep.model ?? '');
            setForceJsonResponse(selectedStep.forceJsonResponse ?? true);
            setCondition(selectedStep.condition ?? '');
        }
    };

    const toggleLog = (logId: string) => {
        if (openLogId === logId) {
            setOpenLogId(null);
        } else {
            setOpenLogId(logId);
            loadLogDetail(logId);
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
            <DashboardLayout>
                <div id="kt_app_content" className="app-content flex-column-fluid">
                    <div id="kt_app_content_container" className="app-container container-fluid">
                        <div className="row g-7">
                            {/* Column 1: Groups */}
                            <div className="col-lg-6 col-xl-3">
                                <div className="card card-flush">
                                    <div className="card-header pt-7">
                                        <div className="card-title">
                                            <h2>Groups</h2>
                                        </div>
                                    </div>
                                    <div className="card-body pt-5">
                                        <div className="d-flex flex-column gap-5">
                                            {TASKS.map((task) => {
                                                const isActive = selectedTask === task.key;
                                                const isCustom = promptMap[task.key]?.isCustom ?? false;
                                                return (
                                                    <div key={task.key} className="d-flex flex-stack">
                                                        <a
                                                            href="#"
                                                            className={`fs-6 fw-bold text-hover-primary ${isActive ? 'text-primary active' : 'text-gray-800'}`}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setSelectedTask(task.key);
                                                            }}
                                                        >
                                                            {task.title}
                                                        </a>
                                                        <div className={`badge ${isCustom ? 'badge-light-warning' : 'badge-light-primary'}`}>
                                                            {isCustom ? 'Custom' : 'Default'}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Steps */}
                            <div className="col-lg-6 col-xl-3">
                                <div className="card card-flush">
                                    <div className="card-header pt-7">
                                        <div className="card-title">
                                            <h2>Steps</h2>
                                        </div>
                                        {/*begin::Toolbar*/}
                                        <div className="d-flex">
                                            {/*begin::Add Step*/}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleAddStep(); }} className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Add step">
                                                <i className="ki-outline ki-plus fs-2 m-0"></i>
                                            </a>
                                            {/*end::Add Step*/}
                                            {/*begin::Move Up*/}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleMoveStep(selectedStepIndex, 'up'); }} className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Move up">
                                                <i className="ki-outline ki-arrow-up fs-2 m-0"></i>
                                            </a>
                                            {/*end::Move Up*/}
                                            {/*begin::Move Down*/}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleMoveStep(selectedStepIndex, 'down'); }} className="btn btn-sm btn-icon btn-light btn-active-light-primary me-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Move down">
                                                <i className="ki-outline ki-arrow-down fs-2 m-0"></i>
                                            </a>
                                            {/*end::Move Down*/}
                                            {/*begin::Remove*/}
                                            <a href="#" onClick={(e) => { e.preventDefault(); handleRemoveStep(selectedStepIndex); }} className="btn btn-sm btn-icon btn-light btn-active-light-primary" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete">
                                                <i className="ki-outline ki-trash fs-2 m-0"></i>
                                            </a>
                                            {/*end::Remove*/}
                                        </div>
                                        {/*end::Toolbar*/}
                                    </div>
                                    <div className="card-body pt-5">
                                        <div className="d-flex flex-column gap-3">
                                            {promptSteps.map((step, index) => (
                                                <div key={index} className="d-flex flex-stack">
                                                    <a
                                                        href="#"
                                                        className={`fs-6 fw-bold ${selectedStepIndex === index ? 'text-primary active' : 'text-gray-800 text-hover-primary'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleSelectStep(index);
                                                        }}
                                                    >
                                                        Krok {index + 1}
                                                    </a>
                                                    {promptSteps.length > 1 && (
                                                        <span className="badge badge-light-primary">{selectedStepIndex === index ? 'Vybraný' : ''}</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Detail */}
                            <div className="col-xl-6">
                                <div className="card card-flush h-lg-100">
                                    <div className="card-header pt-7">
                                        <div className="card-title">
                                            <i className="ki-outline ki-badge fs-1 me-2"></i>
                                            <h2>{selectedMeta?.title} Detail</h2>
                                        </div>
                                    </div>
                                    <div className="card-body pt-5">
                                        {/* Tabs */}
                                        <ul className="nav nav-custom nav-tabs nav-line-tabs nav-line-tabs-2x fs-6 fw-semibold mt-6 mb-8 gap-2">
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link text-active-primary d-flex align-items-center pb-4 ${activeTab === 'general' ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveTab('general');
                                                    }}
                                                    href="#"
                                                >
                                                    <i className="ki-outline ki-home fs-4 me-1"></i>General
                                                </a>
                                            </li>

                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link text-active-primary d-flex align-items-center pb-4 ${activeTab === 'settings' ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveTab('settings');
                                                    }}
                                                    href="#"
                                                >
                                                    <i className="ki-outline ki-setting-2 fs-4 me-1"></i>Settings
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link text-active-primary d-flex align-items-center pb-4 ${activeTab === 'log' ? 'active' : ''}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveTab('log');
                                                    }}
                                                    href="#"
                                                >
                                                    <i className="ki-outline ki-abstract-26 fs-4 me-1"></i>Log
                                                </a>
                                            </li>
                                        </ul>

                                        {/* Tab Content */}
                                        <div className="tab-content">
                                            {activeTab === 'general' && (
                                                <div className="tab-pane fade show active">
                                                    {detailLoading ? (
                                                        <p>Načítám detail…</p>
                                                    ) : (
                                                        <div className="d-flex flex-column gap-5">
                                                            {formattedUpdatedAt && (
                                                                <div className="fw-bold text-muted">
                                                                    Naposledy upraveno: {formattedUpdatedAt}
                                                                </div>
                                                            )}
                                                            <p className="text-gray-600">{selectedMeta?.description}</p>

                                                            {/* Settings moved to Settings tab */}

                                                            {/* Prompts */}
                                                            <div>
                                                                <label className="form-label">System prompt</label>
                                                                <textarea
                                                                    className="form-control form-control-solid"
                                                                    value={systemPrompt}
                                                                    onChange={(event) => setSystemPrompt(event.target.value)}
                                                                    rows={8}
                                                                    placeholder="Pokyny pro model..."
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="form-label">User prompt</label>
                                                                <textarea
                                                                    className="form-control form-control-solid"
                                                                    value={userPrompt}
                                                                    onChange={(event) => setUserPrompt(event.target.value)}
                                                                    rows={10}
                                                                    placeholder="Konkrétní vstup s proměnnými..."
                                                                />
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="d-flex gap-3 my-4">
                                                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                                                    {saving ? 'Ukládám…' : 'Uložit'}
                                                                </button>
                                                                <button className="btn btn-light" onClick={handleReset} disabled={!canReset || saving}>
                                                                    Reset
                                                                </button>
                                                                <button className="btn btn-light" onClick={handlePreview} disabled={previewLoading}>
                                                                    {previewLoading ? 'Generuji...' : 'Náhled'}
                                                                </button>
                                                            </div>

                                                            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                            {error && <div className="alert alert-danger">{error}</div>}

                                                            {/* Variables */}
                                                            <div className="mt-5">
                                                                <h3 className="fs-5 fw-bold text-gray-900 mb-3">Dostupné proměnné</h3>
                                                                <div className="table-responsive">
                                                                    <table className="table table-row-dashed table-row-gray-300 gy-3">
                                                                        <tbody>
                                                                            {VARIABLE_DOCS[selectedTask].map((variable) => (
                                                                                <tr key={variable.name}>
                                                                                    <td className="fw-bold text-gray-800">{variable.name}</td>
                                                                                    <td className="text-gray-600">{variable.description}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>

                                                            {/* Conditional Logic Docs moved to Settings tab */}

                                                            {/* Preview Result */}
                                                            {previewData && (
                                                                <div className="mt-5 p-5 bg-light rounded">
                                                                    <h3 className="fs-5 fw-bold text-gray-900 mb-3">Náhled requestu</h3>
                                                                    <div className="mb-3">
                                                                        <div className="fw-bold">System Prompt</div>
                                                                        <pre className="bg-white p-3 rounded border">{previewData.systemPrompt}</pre>
                                                                    </div>
                                                                    <div className="mb-3">
                                                                        <div className="fw-bold">User Prompt</div>
                                                                        <pre className="bg-white p-3 rounded border">{previewData.userPrompt}</pre>
                                                                    </div>
                                                                    <div>
                                                                        <div className="fw-bold">Variables</div>
                                                                        <pre className="bg-white p-3 rounded border">{JSON.stringify(previewData.variables, null, 2)}</pre>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {activeTab === 'settings' && (
                                                <div className="tab-pane fade show active">
                                                    <div className="d-flex flex-column gap-5">
                                                        {/* Settings */}
                                                        <div className="row g-5">
                                                            <div className="col-md-6">
                                                                <label className="form-label">AI poskytovatel</label>
                                                                <select
                                                                    className="form-select form-select-solid"
                                                                    value={providerChoice}
                                                                    onChange={(event) => setProviderChoice(event.target.value)}
                                                                >
                                                                    {PROVIDER_OPTIONS.map((option) => (
                                                                        <option key={option.value} value={option.value}>
                                                                            {option.label}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <label className="form-label">Model</label>
                                                                <select
                                                                    className="form-select form-select-solid"
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
                                                            </div>
                                                        </div>

                                                        <div className="form-check form-switch form-check-custom form-check-solid my-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                checked={forceJsonResponse}
                                                                onChange={(event) => setForceJsonResponse(event.target.checked)}
                                                                id="forceJson"
                                                            />
                                                            <label className="form-check-label" htmlFor="forceJson">
                                                                Vynutit JSON response
                                                            </label>
                                                        </div>

                                                        <div>
                                                            <label className="form-label">Podmínka spuštění (volitelné)</label>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-solid mb-3"
                                                                value={condition}
                                                                onChange={(event) => setCondition(event.target.value)}
                                                                placeholder="např. !webAge nebo type==commercial"
                                                            />
                                                            <div className="text-muted fs-7 mb-5">
                                                                Pokud je vyplněno, krok se provede pouze při splnění podmínky.
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="d-flex gap-3 my-4">
                                                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                                                {saving ? 'Ukládám…' : 'Uložit'}
                                                            </button>
                                                            <button className="btn btn-light" onClick={handleReset} disabled={!canReset || saving}>
                                                                Reset
                                                            </button>
                                                        </div>

                                                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                                        {error && <div className="alert alert-danger">{error}</div>}

                                                        {/* Conditional Logic Docs */}
                                                        <div className="mt-5">
                                                            <h3 className="fs-5 fw-bold text-gray-900 mb-3">Podmíněná logika</h3>
                                                            <div className="text-gray-600 fs-6">
                                                                <p>Do pole <strong>Podmínka spuštění</strong> můžete zadat výraz, který musí být pravdivý, aby se tento krok provedl. Podporované operátory:</p>
                                                                <ul className="list-disc ms-5">
                                                                    <li><code>variableName</code> - proměnná existuje a je pravdivá (není null, false, 0, "")</li>
                                                                    <li><code>!variableName</code> - proměnná neexistuje nebo je nepravdivá</li>
                                                                    <li><code>variable==value</code> - hodnota proměnné se rovná řetězci "value"</li>
                                                                    <li><code>variable!=value</code> - hodnota proměnné se nerovná řetězci "value"</li>
                                                                </ul>
                                                                <p className="mt-2">Příklady:</p>
                                                                <ul className="list-disc ms-5">
                                                                    <li><code>targetAudience</code> (spustit pokud je definováno cílové publikum)</li>
                                                                    <li><code>!webAge</code> (spustit pokud není znám věk webu)</li>
                                                                    <li><code>type==commercial</code> (spustit pouze pro komerční weby)</li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeTab === 'log' && (
                                                <div className="tab-pane fade show active">
                                                    {logsLoading && <p>Načítám logy…</p>}
                                                    {logsError && <div className="alert alert-danger">{logsError}</div>}
                                                    {!logsLoading && logEntries.length === 0 && <p className="text-muted">Žádné záznamy.</p>}

                                                    <div className="accordion" id="logsAccordion">
                                                        {logEntries.map((log) => {
                                                            const stepIndex = log.variables?.stepIndex as number | undefined;
                                                            return (
                                                                <div className="m-0" key={log.id}>
                                                                    <div
                                                                        className={`d-flex align-items-center collapsible py-3 toggle mb-0 ${openLogId === log.id ? '' : 'collapsed'}`}
                                                                        onClick={() => toggleLog(log.id)}
                                                                        style={{ cursor: 'pointer' }}
                                                                    >
                                                                        <div className="btn btn-sm btn-icon mw-20px btn-active-color-primary me-5">
                                                                            <i className={`ki-outline ki-minus-square toggle-on text-primary fs-1 ${openLogId === log.id ? '' : 'd-none'}`}></i>
                                                                            <i className={`ki-outline ki-plus-square toggle-off fs-1 ${openLogId === log.id ? 'd-none' : ''}`}></i>
                                                                        </div>
                                                                        <div className="d-flex flex-column">
                                                                            <div className="d-flex align-items-center gap-2">
                                                                                <h4 className="text-gray-700 fw-bold cursor-pointer mb-0">
                                                                                    {formatDateTime(log.createdAt)}
                                                                                </h4>
                                                                                {typeof stepIndex === 'number' && (
                                                                                    <span className="badge badge-light-info fw-bold fs-8 px-2 py-1">
                                                                                        Step {stepIndex + 1}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <span className={`badge badge-light-${log.status === 'SUCCESS' ? 'success' : 'danger'} mt-1`}>
                                                                                {log.status}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={`collapse ${openLogId === log.id ? 'show' : ''} fs-6 ms-1`}>
                                                                        <div className="mb-4 text-gray-600 fw-semibold fs-6 ps-10">
                                                                            {logDetailLoading && openLogId === log.id && !logDetail ? (
                                                                                <p>Načítám detail...</p>
                                                                            ) : logDetail && openLogId === log.id ? (
                                                                                <div className="d-flex flex-column gap-3">
                                                                                    <div>
                                                                                        <strong>Provider:</strong> {logDetail.provider} / {logDetail.model}
                                                                                    </div>
                                                                                    {logDetail.errorMessage && (
                                                                                        <div className="alert alert-danger">{logDetail.errorMessage}</div>
                                                                                    )}
                                                                                    <div>
                                                                                        <strong>System Prompt:</strong>
                                                                                        <pre className="bg-light p-2 rounded mt-1 fs-7">{logDetail.systemPrompt}</pre>
                                                                                    </div>
                                                                                    <div>
                                                                                        <strong>User Prompt:</strong>
                                                                                        <pre className="bg-light p-2 rounded mt-1 fs-7">{logDetail.userPrompt}</pre>
                                                                                    </div>
                                                                                    <div>
                                                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                            <strong>Response:</strong>
                                                                                            <div className="d-flex gap-2">
                                                                                                <button
                                                                                                    className={`btn btn-sm btn-icon btn-active-light-primary ${responseViewMode === 'raw' ? 'active bg-light-primary' : ''} w-auto px-3 py-1`}
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        e.preventDefault();
                                                                                                        setResponseViewMode('raw');
                                                                                                    }}
                                                                                                >
                                                                                                    RAW
                                                                                                </button>
                                                                                                <button
                                                                                                    className={`btn btn-sm btn-icon btn-active-light-primary ${responseViewMode === 'json' ? 'active bg-light-primary' : ''} w-auto px-3 py-1`}
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        e.preventDefault();
                                                                                                        setResponseViewMode('json');
                                                                                                    }}
                                                                                                >
                                                                                                    JSON
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                        <pre className="bg-light p-2 rounded mt-1 fs-7 overflow-auto" style={{ maxHeight: '400px' }}>
                                                                                            {renderResponse(logDetail.responseRaw, responseViewMode)}
                                                                                        </pre>
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}
                                                                        </div>
                                                                    </div>
                                                                    <div className="separator separator-dashed"></div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default withAdminAuth(AdminPromptsPage);
