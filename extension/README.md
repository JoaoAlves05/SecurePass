# SecurePass Assistant (Browser Extension)

SecurePass Assistant brings the Password-Tester experience directly into Chrome and Firefox as a Manifest v3 extension.

## Installation

1. Build the project (if applicable) and ensure the repository is available locally.
2. Open the browser's extension management page:
   - **Chrome/Edge:** `chrome://extensions`
   - **Firefox (Manifest v3 preview):** `about:debugging#/runtime/this-firefox`
3. Enable **Developer mode**.
4. Choose **Load unpacked** (Chrome) or **Load Temporary Add-on** (Firefox) and select the `extension/` directory.
5. The extension icon will appear in the toolbar. Pin it for quick access.

## Features

- **Real-time strength analysis** – entropy-driven scoring with contextual suggestions.
- **Have I Been Pwned integration** – k-Anonymity powered breach lookup without leaking raw passwords.
- **Password form automation** – auto-detects password fields, adds a floating SecurePass panel, and fills generated passwords.
- **Policy-aware generator** – adapts to detected field constraints and personal preferences.
- **Encrypted vault** – AES-GCM with PBKDF2-derived keys keeps generated secrets protected locally.
- **Responsive UI** – popup dashboard with colour-coded strength bar, actionable tips, and quick actions.
- **Settings page** – tweak generator defaults, theme, caching and vault behaviour.

## Architecture overview

```
extension/
├── background/
│   └── serviceWorker.js  # Central message router, HIBP requests, vault orchestration
├── content/
│   └── content.js        # Injects SecurePass button/panel and bridges page interactions
├── popup/
│   ├── popup.html        # Toolbar popup UI
│   ├── popup.js          # Strength analysis, HIBP checks, vault interface
│   └── popup.css         # Popup styling (dark/light aware)
├── options/
│   ├── options.html      # Settings surface with roadmap
│   ├── options.js        # Preference persistence logic
│   └── options.css       # Styling for settings page
├── src/
│   ├── passwordStrength.js   # Entropy, heuristics, suggestions
│   ├── hibp.js               # k-Anonymity client + caching
│   ├── storage.js            # chrome.storage helpers
│   ├── settings.js           # Defaults + sync/local persistence
│   ├── passwordGenerator.js  # Constraint-aware generator
│   ├── formAnalyzer.js       # Constraint extraction + field discovery
│   └── cryptoVault.js        # AES-GCM vault powered by PBKDF2
├── manifest.json             # Manifest v3 definition
├── icons/                    # Self-contained PNG assets
└── README.md                 # This document
```

## Security design

- **No remote code** – CSP restricts execution to bundled assets, forbidding eval and remote scripts.
- **Secrets stay local** – HIBP uses the range API; only SHA-1 prefixes leave the browser.
- **Strong crypto defaults** – PBKDF2 (100k iterations) derives AES-256-GCM keys; salts and IVs generated per vault update.
- **Granular storage** – chrome.storage.local is the default; optional sync sharing only stores user preferences.
- **Ephemeral unlocking** – vault auto-lock respects configurable timeout and wipes in-memory keys.

## Roadmap

| Version | Milestone |
|---------|-----------|
| v0.1 | Popup strength analyser with HIBP integration |
| v0.3 | Automatic form detection with floating SecurePass panel |
| v0.5 | Constraint-aware password generator across pages |
| v0.7 | Local encrypted vault with management UI |
| v1.0 | Settings experience, dark mode polish, release hardening |

## Development notes

- The extension is designed to run side-by-side with the existing `web/` demo.
- All assets are local to comply with strict CSP and offline availability.
- Use `chrome.runtime.sendMessage` for background privileged actions (HIBP, vault, generation).
- Future enhancements may integrate WebAuthn, breach caching visualisations, or syncing encrypted vault blobs across devices.
