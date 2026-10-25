# Repository Guidelines

## Project Structure & Module Organization
SecurePass is a Manifest V3 Chrome extension using plain JavaScript ES modules. `manifest.json` defines entry points, permissions, and accessible resources.

- `src/`: shared cryptography, password generation, validation, settings, and storage utilities; `src/messageHandlers/` contains background request handlers.
- `background/serviceWorker.js`: message routing and background orchestration.
- `popup/`: popup HTML, CSS, bootstrap code, and feature modules.
- `content/`: page injection bootstrap and modules for inline UI, autofill, and biometrics.
- `auth/`: extension-owned autofill/save confirmation and authentication context.
- `tests/`: Node regression tests, Chrome/IndexedDB helpers, and disposable Playwright browser scenarios.
- `scripts/`: syntax/import checks and runtime ZIP packaging.
- `docs/`: historical reviews, current findings, validation evidence, and proposed remediation.
- `offscreen.html` and `offscreen.js`: offscreen clipboard support.
- `icons/`: extension image assets.

Consult `ARCHITECTURE.md` for current module boundaries. Read `docs/REVIEW_SETTINGS_SYNC_DATA.md` for open settings/Sync/data-management findings and `docs/SYNC_DATA_PLAN.md` for proposals awaiting discussion. Historical reviews and implementation checkboxes are not evidence that the current release is accepted.

## Graphify knowledge graph

Use `graphify-out/graph.json` as the first navigation step for architectural questions, cross-module investigations, unfamiliar code paths, and planning significant changes. For small changes in already-known files, inspect those files directly.

These instructions apply to every session, including new sessions with no previous conversation context. At the start of repository work in a new session, check the graph and read a bounded overview from `GRAPH_REPORT.md` (core abstractions and community names), or run a focused query for the user's task. Use this saved context before rediscovering the repository through broad source reads. Do not load the entire report or graph into context. For non-code requests, keep this startup check minimal.

1. Check graph availability and freshness once per investigation. Inspect available build metadata (`built_at_commit`), pending-update markers, and relevant Git changes, including staged, unstaged, and untracked files. A matching commit does not cover working-tree edits, and installed hooks do not guarantee a completed rebuild. Missing metadata means freshness is unknown; it does not require a rebuild.
2. Start with a focused query, for example `graphify query "vault session" --budget 1500`. Use actual graph labels or symbol names, especially for Portuguese questions against English code. When useful and supported by the installed CLI, use `explain`, `path`, or `affected` to narrow the investigation. Expand the query or budget only if the first result is insufficient.
3. Read only the relevant source sections and tests identified by the graph; use targeted `rg` searches to validate callers, message routes, and dynamic relationships. Broaden inspection only when the evidence requires it. Reuse findings within the task unless the relevant files change. Do not dump the full graph, read the whole repository, or repeat broad searches by default.
4. Treat the graph as a navigation aid. Code and tests remain authoritative. Distinguish `EXTRACTED`, `INFERRED`, and `AMBIGUOUS` relationships; extraction from documentation is not proof of current runtime behavior. Missing edges do not prove independence, and undirected edges do not establish call direction.
5. Keep the graph current: refresh stale relevant data before relying on it, and update it after completing a batch of code changes, before handing the task back. With the installed CLI, use `graphify update .` for code updates; `/graphify . --update` invokes the skill workflow that also handles changed documentation and images. Do not assume `graphify --update` is a supported CLI command. Include additions, deletions, and renames. Batch updates after meaningful work, not after every edit or query. If a hook has already completed an equivalent update, verify it rather than repeating it. For changed documentation or images that affect project knowledge, run the semantic incremental workflow too; instruction-only edits do not require semantic regeneration. Rebuild the entire graph only when incremental repair is insufficient or explicitly requested. If the graph is absent, create it through the Graphify skill when feasible. If maintenance fails or tooling is unavailable, continue with targeted source inspection and state that the graph remains stale or missing; never imply an update succeeded without checking.
6. If the CLI is unavailable, inspect a filtered subset of `graph.json` programmatically or fall back to targeted source searches. Keep output bounded and report material graph gaps or contradictions when they affect the conclusion.

## Build, Test, and Development Commands
The extension runs unpacked without a build step or runtime dependencies. Development checks use Node 18+ and development-only dependencies (`npm ci`). No development server is configured.

- `npm run check`: JavaScript syntax, import paths, cycles, and manifest/package version consistency.
- `npm test`: Node test runner with `fake-indexeddb` and simulated Chrome APIs.
- `npx playwright install chromium`: install the browser for Playwright checks.
- `npm run test:browser`: disposable Chromium UI/security/virtual PRF scenario; rewrites fixture screenshots under `docs/screenshots/`.
- `npm run test:settings-browser`: guided local settings/data journeys and separate redesign screenshot artifacts.
- `npm run test:sync-browser`: two disposable Chromium profiles with emulated Sync transport.
- `npm run package`: create the runtime-only ZIP; requires Python 3. Packaging is not release acceptance.

1. Open `chrome://extensions` in Chrome, enable **Developer mode**, and choose **Load unpacked** with this repository directory.
2. After changes, click **Reload** on the extension and refresh affected web pages.
3. Inspect the popup and background service worker through Chrome DevTools to diagnose errors.

Run `git diff --check` before submitting to catch whitespace errors.

## Coding Style & Naming Conventions
Follow surrounding code: two-space JavaScript indentation, single-quoted strings, semicolons, and explicit `.js` extensions in module imports. Use `camelCase` for functions, variables, and descriptive module filenames; use `UPPER_SNAKE_CASE` for constants. Keep shared logic in `src/` and UI behavior in the relevant feature module. Register new background handlers in the service worker router. No formatter or linter is configured.

## Testing Guidelines
Automated regressions live in `tests/` and use the Node test runner and Playwright; no coverage threshold is configured. Add meaningful regressions for integrity, concurrency, recovery, and security changes. Document reproducible manual checks for changed behavior. Exercise generator constraints, vault create/unlock/lock, credential editing, and autofill as relevant. For cryptographic changes, include round-trip, rejection, and failure-path regressions as applicable. Check biometric paths on supported hardware and use disposable credentials.

## Commit & Pull Request Guidelines
History mixes descriptive messages with prefixes such as `fix:` and `refactor:`; use a concise, action-oriented subject. Open an issue before significant changes and use a branch such as `feature/my-feature`. Keep PRs focused, explain what changed and why, link related issues, and include verification steps. Add screenshots for visible UI changes.

## Security & Configuration
Never commit credentials, master passwords, or real vault exports. Preserve Web Crypto usage and review changes to permissions, message validation, storage, and accessible resources carefully.

Current test evidence and remaining acceptance are recorded in `docs/VALIDATION.md`. Virtual PRF and emulated Sync do not establish physical authenticator or Google-authenticated transport compatibility. Keep implemented behavior, reproduced defects, and proposed behavior distinct in documentation.
