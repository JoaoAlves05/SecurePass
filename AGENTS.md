# Repository Guidelines

## Project Structure & Module Organization
SecurePass is a Manifest V3 Chrome extension using plain JavaScript ES modules. `manifest.json` defines entry points, permissions, and accessible resources.

- `src/`: shared cryptography, password generation, validation, settings, and storage utilities; `src/messageHandlers/` contains background request handlers.
- `background/serviceWorker.js`: message routing and background orchestration.
- `popup/`: popup HTML, CSS, bootstrap code, and feature modules.
- `content/`: page injection bootstrap and modules for inline UI, autofill, and biometrics.
- `auth/`: WebAuthn authentication context.
- `offscreen.html` and `offscreen.js`: offscreen clipboard support.
- `icons/`: extension image assets.

Consult `ARCHITECTURE.md` for module boundaries, but verify paths against the checkout; some documentation describes files that are absent.

## Build, Test, and Development Commands
No dependency installation, build step, package scripts, or development server is configured.

1. Open `chrome://extensions` in Chrome, enable **Developer mode**, and choose **Load unpacked** with this repository directory.
2. After changes, click **Reload** on the extension and refresh affected web pages.
3. Inspect the popup and background service worker through Chrome DevTools to diagnose errors.

Run `git diff --check` before submitting to catch whitespace errors.

## Coding Style & Naming Conventions
Follow surrounding code: two-space JavaScript indentation, single-quoted strings, semicolons, and explicit `.js` extensions in module imports. Use `camelCase` for functions, variables, and descriptive module filenames; use `UPPER_SNAKE_CASE` for constants. Keep shared logic in `src/` and UI behavior in the relevant feature module. Register new background handlers in the service worker router. No formatter or linter is configured.

## Testing Guidelines
There is no automated test framework, test directory, or coverage threshold. Document reproducible manual checks for changed behavior. Exercise generator constraints, vault create/unlock/lock, credential editing, and autofill as relevant. For cryptographic changes, include tests or a clear manual verification procedure. Check biometric paths on supported hardware and use disposable credentials.

## Commit & Pull Request Guidelines
History mixes descriptive messages with prefixes such as `fix:` and `refactor:`; use a concise, action-oriented subject. Open an issue before significant changes and use a branch such as `feature/my-feature`. Keep PRs focused, explain what changed and why, link related issues, and include verification steps. Add screenshots for visible UI changes.

## Security & Configuration
Never commit credentials, master passwords, or real vault exports. Preserve Web Crypto usage and review changes to permissions, message validation, storage, and accessible resources carefully.
