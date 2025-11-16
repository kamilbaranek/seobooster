import { AiTaskType } from '@seobooster/ai-types';

export type PromptVariables = Record<string, unknown>;

const PLACEHOLDER_REGEX = /{{\s*([\w.]+)\s*}}/g;

function accessVariable(path: string, variables: PromptVariables): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined;
    }
    if (typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[key];
  }, variables);
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

export function renderPromptTemplate(template: string | undefined, variables: PromptVariables = {}) {
  if (!template) {
    return template;
  }
  return template.replace(PLACEHOLDER_REGEX, (match, token) => {
    const value = accessVariable(token, variables);
    if (value === undefined) {
      return match;
    }
    return stringifyValue(value);
  });
}

export function renderPromptPair(
  prompts: { systemPrompt?: string | null; userPrompt?: string | null } | null,
  variables: PromptVariables
): { systemPrompt?: string; userPrompt?: string } {
  if (!prompts) {
    return {};
  }
  const renderedSystem = prompts.systemPrompt ? renderPromptTemplate(prompts.systemPrompt, variables) : undefined;
  const renderedUser = prompts.userPrompt ? renderPromptTemplate(prompts.userPrompt, variables) : undefined;
  return {
    systemPrompt: renderedSystem,
    userPrompt: renderedUser
  };
}

export function renderTemplateOrFallback(
  template: string,
  variables: PromptVariables,
  fallbackFactory: (vars: PromptVariables) => string
) {
  const rendered = renderPromptTemplate(template, variables);
  return rendered ?? fallbackFactory(variables);
}

export type PromptOverrideInput<TTask extends AiTaskType> = {
  task: TTask;
  systemPrompt?: string;
  userPrompt?: string;
  variables?: PromptVariables;
};
