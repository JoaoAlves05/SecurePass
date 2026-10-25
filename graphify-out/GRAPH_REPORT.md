# Graph Report - SecurePass  (2026-10-25)

## Corpus Check
- 104 files · ~62,379 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 955 nodes · 2357 edges · 57 communities (33 shown, 24 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.88)
- Token cost: semantic extraction usage unavailable (collaboration tools do not expose token counts); numeric extraction zeros are schema placeholders, not measured usage.

## Graph Freshness
- Built from commit: `aee4249b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Criptografia e armazenamento
- Autorização e pedidos autofill
- popup.js
- Constantes e registos
- Autofill na página
- dataManagement.js
- Edição do cofre
- modules/settings.js
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- settings-browser.mjs
- Ferramentas de desenvolvimento
- Avaliação de palavras-passe
- Operações do clipboard
- Análise de formulários
- Edição do cofre
- Ferramentas de desenvolvimento
- Autorização e pedidos autofill
- Manifesto da extensão
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Funcionalidades documentadas
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Documentação de Sync e dados
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- Interface do popup
- Implementação e migração
- Regras do repositório
- Revisão funcional histórica
- Confirmação de autofill
- Evidência visual das definições
- Captura do cofre
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Three local recovery snapshots
- Arquitetura documentada
- Documento offscreen
- Ícone 128 pixels
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `Current architecture with implemented local and legacy increment` - 47 edges
3. `getStorage()` - 46 edges
4. `Historical review of commit 5aed51c` - 44 edges
5. `showToast()` - 42 edges
6. `Proposed P6 migration and acceptance` - 42 edges
7. `removeStorage()` - 41 edges
8. `Original SD review with later local increment notice` - 41 edges
9. `initialise()` - 36 edges
10. `setStorage()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Scope` --semantically_similar_to--> `Disabled Drive connection with truthful prerequisites`  [INFERRED] [semantically similar]
  docs/issues/SETTINGS_UX.md → popup/popup.html
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md
- `HTML category ownership and dedicated settings styles` --conceptually_related_to--> `Settings and data surface with management entry`  [INFERRED]
  docs/SETTINGS_FRONTEND_REVIEW.md → popup/popup.html
- `ready` --calls--> `removeStorage()`  [EXTRACTED]
  background/serviceWorker.js → src/utils/storage.js
- `attachBiometricListeners()` --calls--> `enrollBiometric()`  [EXTRACTED]
  popup/modules/biometricSetup.js → src/biometric/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]
- **Settings refinement addresses review findings through navigation layout and controls** — docs_settings_frontend_review_priority_findings, docs_settings_frontend_review_category_navigation, docs_settings_frontend_review_simplified_layout, docs_settings_frontend_review_accessible_controls, docs_settings_frontend_review_focus_and_disclosure [EXTRACTED 1.00]
- **Six selected Settings categories** — popup_popup_navigation, popup_popup_mobile_navigation, popup_popup_security, popup_popup_appearance, popup_popup_data_management, popup_popup_sync, popup_popup_recovery, popup_popup_danger_zone [EXTRACTED 1.00]
- **Disposable browser checks with virtual PRF and emulated Sync** — docs_validation_chromium, docs_validation_virtual_prf, docs_validation_two_profile_sync [EXTRACTED 1.00]

## Communities (57 total, 24 thin omitted)

### Community 0 - "Criptografia e armazenamento"
Cohesion: 0.09
Nodes (86): decryptBackupPayload(), deriveBackupKey(), encryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), clearVaultEntries(), deleteCredential(), importVaultData() (+78 more)

### Community 1 - "Autorização e pedidos autofill"
Cohesion: 0.13
Nodes (38): clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument(), cancelRequest(), clearRequests() (+30 more)

### Community 10 - "popup.js"
Cohesion: 0.32
Nodes (11): resolveUnlockSetup(), attachSettingsNavigation(), initToast(), attachUIListeners(), closeModal(), closeSettingsPanel(), manageFocus(), openMasterModal() (+3 more)

### Community 12 - "Constantes e registos"
Cohesion: 0.11
Nodes (21): format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), redactValue(), safeSerialize(), _serialize(), ALARM_NAME (+13 more)

### Community 13 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), element(), initAutofill(), showSaveSuggestion(), setFieldValue(), visibleField(), request(), initThemeSync() (+8 more)

### Community 14 - "dataManagement.js"
Cohesion: 0.28
Nodes (19): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreRecord(), snapshotLabel(), attachManagementListeners() (+11 more)

### Community 16 - "Edição do cofre"
Cohesion: 0.32
Nodes (20): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), showToast(), changeMasterPassword(), deleteCredential(), handleCreateMaster() (+12 more)

### Community 23 - "modules/settings.js"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme(), resolveTheme() (+3 more)

### Community 28 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (5): shadowClick(), find(), errors, root, server

### Community 29 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): files(), visit(), done, graph, js, manifest, pkg, root

### Community 34 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 4 - "Avaliação de palavras-passe"
Cohesion: 0.07
Nodes (40): attachGeneratorListeners(), handleGenerate(), saveGeneratedToVault(), setLoading(), syncGeneratorControls(), attachTesterListeners(), mapScoreToColor(), saveTestedToVault() (+32 more)

### Community 48 - "Operações do clipboard"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), write(), serial

### Community 7 - "Edição do cofre"
Cohesion: 0.07
Nodes (27): setUnlockResolver(), clearRevealTimer(), createVaultIconButton(), promptForMasterPassword(), biometricUnlockContainer, confirmMasterInput, confirmNextMasterInput, createMasterSection (+19 more)

### Community 8 - "Ferramentas de desenvolvimento"
Cohesion: 0.09
Nodes (35): copyInBackground(), ensureOffscreen(), checkPassword(), clearHibpCache(), hibpCacheStatus(), range(), generatePassword(), randomIndex() (+27 more)

### Community 9 - "Autorização e pedidos autofill"
Cohesion: 0.08
Nodes (56): complete(), refresh(), send(), showError(), assert(), authenticateBiometric(), enrollBiometric(), request() (+48 more)

### Community 11 - "Manifesto da extensão"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (7): scripts, check, package, test, test:browser, test:settings-browser, test:sync-browser

### Community 19 - "Settings UX implementation and evidence"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 2 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 21 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 22 - "Interface do popup"
Cohesion: 0.05
Nodes (51): Ownership-aware clipboard timeout explanation, Settings frontend review and refinement, Frontend refinement checks and acceptance boundary, Frontend regression evidence and manual limits, Password generator tab and constraint controls, Reset preferences while retaining vault, Independent Impeccable review evidence, Security settings category (+43 more)

### Community 31 - "Confirmação de autofill"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 40 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Biometric unlock setup row and collapsed About biometric unlock disclosure, Change master password navigation row, Clear copied passwords: After 30 seconds slider and best-effort copy-matching text, Green toast: Legacy Sync mode updated. Unlock the active vault again., Open in tab header action, Settings popup screenshot

### Community 41 - "Captura do cofre"
Cohesion: 0.33
Nodes (6): Settings navigation, Copy edit and delete controls, Generator Tester Vault tabs, Credential cards, Search add and lock controls, Unlocked vault screenshot

### Community 42 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Preferences save automatically notice, This device panel with saved locally and unlocked labels, Settings sidebar with Appearance selected, Reset preferences row describing theme, generator and timeout defaults, Appearance settings screenshot in dark theme, Theme cards: System, Light, and selected Dark

### Community 43 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Confirmation contains wrong with ERASE THIS DEVICE validation message, Cancel and red Erase this device buttons, Copy states local data deletion and remote copies remain, Visible master password field and show password control, Verification selector showing erase without unlocking (irreversible), Erase only this device dialog

### Community 44 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Auto-lock vault slider displaying 16 minutes, Clear copied passwords slider displaying After 30 seconds and best-effort copy-matching note, This device status with Lock vault and Export backup actions, Sidebar categories with Security selected, Change master password and set up biometric unlock rows with About biometric unlock disclosure, Dark settings security screen

### Community 45 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Preferences save automatically notice, Local unlocked device summary with Lock vault and Export backup controls, Settings navigation with Security selected, Master-password and biometric unlock actions with collapsed information sections, Auto-lock 16 minutes and copied-password clearing 30 seconds sliders, Light settings management screenshot

### Community 46 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): This device: Saved locally · Unlocked, Lock vault and Export backup, Reset preferences: restore theme, generator and timeout defaults; vault is kept, Settings section selector displaying Appearance, System theme highlighted as selected, Theme choices: System, Light and Dark, Settings popup showing the Appearance section

### Community 47 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Auto-lock vault: 15 minutes of inactivity, Clear copied passwords: After 30 seconds, This device: Saved locally · Unlocked, Security settings section selector, Settings popup view, Lock vault and Export backup actions

### Community 49 - "Three local recovery snapshots"
Cohesion: 0.40
Nodes (5): Legacy Sync notice overlay, Export a recovery snapshot section, Recovery settings screenshot, Three local recovery snapshots, Snapshot explanation

## Knowledge Gaps
- **86 isolated node(s):** `Chrome Identity`, `Chrome Storage`, `Drive appDataFolder`, `Drive errors`, `OWASP Cryptographic Storage` (+81 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 437 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Documentação de Sync e dados` to `Revisão funcional histórica`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Interface do popup`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `Chrome Identity`, `Chrome Storage`, `Drive appDataFolder` to the rest of the system?**
  _86 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.09110035766884073 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Arquitetura documentada` to `Documentação de Sync e dados`, `Revisão funcional histórica`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documento offscreen`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Regras do repositório`, `Confirmação de autofill`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `Autorização e pedidos autofill` be split into smaller, more focused modules?**
  _Cohesion score 0.13067552602436322 - nodes in this community are weakly interconnected._
- **Why does `Dated validation evidence and missing acceptance` connect `Interface do popup` to `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `Constantes e registos` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
## Current Working Tree Refresh
- Seven changed code files and four HTML/document files plus eight screenshots refreshed incrementally.
- Final `graphify update .` confirmed the code snapshot and removed one obsolete unowned ghost reference; all saved semantic nodes remained.
- Exact refreshed source hashes are recorded in graph.json. CSS remains an unclassified navigation gap.
