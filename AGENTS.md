# Repository Guidelines

## Project Structure & Module Organization

This repository currently contains the main planning docs (`development_plan.md`, `implementation_plan.md`), an MVP-focused execution plan (`mvp-implementation.md`), and `README.md`. The planning docs are the starting point for what we are building and should be kept in sync with reality.

As the codebase grows, keep the layout simple:

- `src/` – application code grouped by feature/domain (e.g., `keyword_research`, `site_audit`).
- `tests/` – automated tests mirroring the `src/` structure.
- `scripts/` – one-off or maintenance scripts (e.g., data import, report export).
- `docs/` – additional documentation, diagrams, and architecture notes.

Prefer feature-based modules over large generic `utils` directories.

## Project Specification: AI Content SaaS for Websites

The canonical product description is in `development_plan.md` (high‑level spec) and `implementation_plan.md` (task breakdown). Read these first before changing architecture or scope.

At a high level, we are building an AI Content SaaS that:

1. Takes a website URL and minimal user info as input (see `Development Plan` → 5.1 Onboarding + Paywall).
2. Automatically analyzes the website, identifies topics and main areas (web scanning + analysis sections in both plans).
3. Converts findings into structured information about the company/operator, products/services, and target audience (`web_analysis` model and AI Orchestrator/Business Analysis tasks).
4. Builds an SEO strategy (pillars, topic clusters, keyword sets) from that structured data (SEO Strategy Module in both plans).
5. On a daily schedule, generates articles based on the SEO strategy and saves them as WordPress drafts via REST API (Daily Article Generation flow + Article Generation & Publishing tasks).
6. Sends the user an email with the article preview and a one‑click “Publish” approval link (Email & Approval Module / Email Module).
7. After approval, switches the WordPress post from Draft to Published (WordPress Integration + Publish Approval Workflow).

## Build, Test, and Development Commands

Expose workflows through a `Makefile` or package-manager scripts and document them in `README.md`.

- `make dev` – start the local development server or watcher.
- `make test` – run the full automated test suite.
- `make lint` – run linters/formatters.
- `make build` – produce a production-ready build or artifacts.

If you add new commands, update this section and the README.

## Coding Style & Naming Conventions

- Use consistent indentation (2 spaces for JS/TS, 4 spaces for Python).
- Prefer clear, descriptive names: `verbNoun` for functions (`generateReport`), `PascalCase` for classes/types, `kebab-case` for file names (`keyword-research.ts`).
- Keep modules focused and cohesive; avoid files over ~300 lines when possible.
- When adding a formatter or linter (e.g., Prettier, ESLint, Black), commit its config and wire it into `make lint`.

## Testing Guidelines

Use the testing framework natural to the chosen stack (e.g., Jest, Vitest, Pytest) and colocate tests under `tests/` mirroring `src/`.

- Name test files clearly, e.g., `keyword-research.spec.ts` or `test_keyword_research.py`.
- Ensure `make test` passes before opening a PR.
- Add regression tests when fixing bugs, especially around SEO parsing, external APIs, and data imports.

## Commit & Pull Request Guidelines

Current history is minimal (`first commit`); going forward:

- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, etc. Example: `feat: add keyword clustering engine`.
- Keep commits small and focused; avoid unrelated changes in a single commit.

Pull requests should:

- Include a clear summary and motivation.
- Reference related issues or items from `development_plan.md` / `implementation_plan.md`.
- Include screenshots or CLI output for behavior changes.
- Be green in CI (tests and lint) before requesting review.

## Security & Configuration

Never commit secrets or API keys. Use environment variables in a gitignored file (e.g., `.env.local`) and document required variables in `README.md`. Keep third-party SEO API credentials configurable and avoid hardcoding project-specific domains or identifiers.
