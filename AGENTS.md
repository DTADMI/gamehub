# AGENTS.md

## Purpose

- Keep repo-loaded agent instructions short, stable, and enforceable.
- Use this file for hard repo rules only.
- Put procedural workflows in skills, runtime automation in hooks, and external system access in MCP/plugins.
- Read root `AGENTS.md` at the repo root for cross-project governance rules.
- Don't Do Evil. Never Do Evil.

## Operating Model

| Layer | Location | Use It For | Do Not Put Here |
| --- | --- | --- | --- |
| Rules | `AGENTS.md` | Stable repo policy, safety constraints, required guardrails | Long step-by-step playbooks, external integration setup |
| Hooks | `.codex/hooks.json`, `.githooks/pre-commit` | Automated reminders and enforced validation entrypoints | Product rules that need human judgment |
| Skills | `.agents/skills/` | Repeatable GameHub workflows that require repo-specific procedure | Global policy, generic shell preferences |
| MCP / Plugins | `plugins/gamehub-integrations/`, `.agents/plugins/marketplace.json` | External system access and integration metadata | Repo policy or authoring standards |

## Repository Map

- `app/` Next.js App Router pages (admin, blog, explore, games, leaderboard, auth)
- `components/` shared UI components
- `lib/` shared logic, feature flags, Supabase helpers, server utilities, content cache
- `packages/` monorepo packages (game-platform, games, ui, pointclick-engine, projects-metadata)
- `scripts/` build, audit, validation, and smoke-test scripts
- `tests/` Vitest unit and integration tests
- `tests-e2e/` Playwright end-to-end tests (including smoke tests)
- `docs/` technical documentation (architecture, game strategy, systems discovery, narrative)
- `public/` static assets, game WASM/JS bundles

## Hard Rules

### Search And Shell

- Use `rg` first and by default for repo search.
- Scope searches and avoid heavy folders: `node_modules`, `.next`, `test-results`, `.qodo`, `.idea`, `.turbo`.
- Never use `Get-ChildItem -Recurse | Select-String` for repo content search.
- For data-heavy work, prefer repo scripts over repeated manual tool calls when a script is practical.

### Change Safety

- Do not remove or overwrite user changes in a dirty worktree unless explicitly asked.
- Avoid editing generated output or `.next/`.
- Keep new product behavior behind feature flags defined in `lib/feature-flags.ts`, and keep UI/API enforcement in sync.
- Growth ideas, themes, and events must remain feature-flag gated and controllable from the admin dashboard.
- Vendor-dependent integrations must go through local adapters, not direct vendor SDK calls in feature code.

### Game Platform Rules

- Keep UI responsive and mobile-first across all surfaces; validate at `320px` minimum.
- All games must be accessible via the Game Platform SDK (`@gamehub/game-platform`) and integrate with leaderboard, save, and auth systems.
- WebGPU/WebGL experiments must degrade gracefully with runtime capability detection and documented fallbacks.
- Game leaderboards must enforce integrity: validate scores server-side, prevent client-side tampering, and rate-limit submissions.
- Game asset pipelines must keep bundle sizes manageable and use lazy loading for non-critical assets.
- Keep game titles, descriptions, and metadata original and thematic; do not use generic filler.
- The Systems Discovery body pack content is gated behind feature flags defined in `lib/feature-flags.ts`.

### Migrations And Data

- Migrations live in `scripts/###_*.sql` or `sql/###_*.sql`.
- Every migration must have paired rollout and rollback SQL files.
- Every new table must enable RLS with explicit policies.
- Every `SECURITY DEFINER` function must set an explicit least-privilege `search_path`.

### Validation, Docs, And Commits

- Keep documentation aligned with code and schema changes.
- Keep `docs/action-plan.md` current when source-of-truth work changes active priorities or shipped status.
- In docs, keep exactly one empty line between a section title and the start of its table.
- Use real emoji characters in docs and keep docs UTF-8 clean.
- When code or docs change, create a concise commit unless the user says not to.

### Security And Privacy

- Do not log or expose secrets from `.env`, `.env.local`, or other environment files.
- Security events such as auth changes must emit both in-app and transactional email notifications.

## Skills To Use

Use the repo skills when the task matches:

- `game-integration`: add, update, or debug games using the Game Platform SDK, including game lifecycle, packaging, and platform integration.
- `leaderboard-management`: manage leaderboard schema, anti-cheat measures, ranking queries, and score submission validation.
- `gamehub-asset-pipeline`: handle game assets, WebGPU compute textures, WASM bundles, and asset optimization.
- `gamehub-docs`: maintain GameHub canonical docs, indexes, architecture docs, and action-plan references.

## Hooks And Enforced Checks

- Active Codex lifecycle hooks live in `.codex/hooks.json`.
- Repo Git hooks live in `.githooks/` and are installed by `node scripts/install-git-hooks.mjs` (or equivalent).
- The pre-commit hook runs `pnpm lint`, `pnpm type-check`, and `pnpm test:unit`.
- Use `pnpm ci:local` for the full local CI pipeline before pushing significant changes.

## MCP And Plugin Boundaries

- Repo-owned MCP/plugin metadata lives under `plugins/gamehub-integrations/` and `.agents/plugins/marketplace.json`.
- Current MCP targets are GitHub and Supabase.
- Use MCP for external context and inspection. Do not treat MCP as the source of truth for repo-side rollout scripts, migrations, or docs updates.
- Keep active runtime hooks in `.codex/hooks.json`; do not rely on plugin-local hooks for repo enforcement.
