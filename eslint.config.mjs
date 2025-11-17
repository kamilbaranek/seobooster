import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const ignores = [
  'node_modules',
  'dist',
  'apps/**/dist/**',
  '**/dist/**',
  'apps/web/.next',
  'apps/web/.next/**',
  'apps/web/out',
  'storage',
  'storage/**',
  '**/generated',
  '**/*.d.ts'
];

export default tseslint.config(
  {
    ignores,
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ]
    }
  }
);
