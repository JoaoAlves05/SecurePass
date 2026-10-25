# Graph Report - SecurePass  (2026-10-25)

## Corpus Check
- 105 files · ~63,408 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 977 nodes · 2325 edges · 64 communities (41 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.88)
- Token cost: semantic usage unavailable; collaboration tools do not expose token counts. Numeric extraction zeros are schema placeholders, not measured usage.

## Graph Freshness
- Built from commit: `7c0ebcd8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Criptografia e armazenamento
- Autorização e pedidos autofill
- Criptografia e armazenamento
- Documentação de Sync e dados
- Revisão funcional histórica
- Arquitetura documentada
- Avaliação de palavras-passe
- Edição do cofre
- backupCrypto.js
- Manifesto da extensão
- Constantes e registos
- Autofill na página
- Funcionalidades documentadas
- popup/popup.html
- vaultSession.js
- dataManagement.js
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Edição do cofre
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- Dated validation evidence and missing acceptance
- modules/settings.js
- popup.js
- Implementação e migração
- settings-browser.mjs
- Regras do repositório
- Settings frontend review and refinement
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings and data surface with management entry
- Settings and data surface with management entry
- Ferramentas de desenvolvimento
- Quatro áreas das definições
- Ferramentas de desenvolvimento
- Timestamped local version backup cards
- Ferramentas de desenvolvimento
- Evidência visual das definições
- Captura do cofre
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Operações do clipboard
- SETTINGS_UX.md
- Ferramentas de desenvolvimento
- Documento offscreen
- Análise de formulários
- Ícone 128 pixels
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `Current architecture with implemented local and legacy increment` - 47 edges
3. `getStorage()` - 46 edges
4. `Historical review of commit 5aed51c` - 44 edges
5. `Proposed P6 migration and acceptance` - 42 edges
6. `removeStorage()` - 41 edges
7. `Original SD review with later local increment notice` - 41 edges
8. `setStorage()` - 33 edges
9. `showToast()` - 30 edges
10. `loadSettings()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md
- `Security settings area` --implements--> `Security`  [INFERRED]
  popup/popup.html → docs/SETTINGS_FOUR_AREAS.md
- `General settings area` --implements--> `General`  [INFERRED]
  popup/popup.html → docs/SETTINGS_FOUR_AREAS.md
- `Backups settings area` --implements--> `Backups`  [INFERRED]
  popup/popup.html → docs/SETTINGS_FOUR_AREAS.md
- `Advanced settings area` --implements--> `Advanced`  [INFERRED]
  popup/popup.html → docs/SETTINGS_FOUR_AREAS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]
- **Four always-visible Settings areas** — popup_popup_general, popup_popup_security, popup_popup_backups, popup_popup_advanced [EXTRACTED 1.00]
- **Disposable browser checks with virtual PRF and emulated Sync** — docs_validation_chromium, docs_validation_virtual_prf, docs_validation_two_profile_sync [EXTRACTED 1.00]

## Communities (64 total, 23 thin omitted)

### Community 0 - "Criptografia e armazenamento"
Cohesion: 0.08
Nodes (100): decryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault(), keepAlive() (+92 more)

### Community 1 - "Autorização e pedidos autofill"
Cohesion: 0.09
Nodes (57): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+49 more)

### Community 2 - "Criptografia e armazenamento"
Cohesion: 0.09
Nodes (34): fake-indexeddb, copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight (+26 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 6 - "Avaliação de palavras-passe"
Cohesion: 0.07
Nodes (35): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+27 more)

### Community 7 - "Edição do cofre"
Cohesion: 0.07
Nodes (27): resolveUnlockSetup(), setUnlockResolver(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection, createVaultIconButton() (+19 more)

### Community 8 - "backupCrypto.js"
Cohesion: 0.15
Nodes (23): complete(), refresh(), requestId, send(), showError(), DECODER, deriveBackupKey(), ENCODER (+15 more)

### Community 9 - "Manifesto da extensão"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 10 - "Constantes e registos"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 11 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 13 - "popup/popup.html"
Cohesion: 0.15
Nodes (19): General, General version and repository link, System light and dark theme controls, Auto-lock inactivity preference, Local PRF enrollment and local wrapper removal controls, Ownership-aware clipboard timeout explanation, Labelled credential editor dialog, General settings area (+11 more)

### Community 15 - "vaultSession.js"
Cohesion: 0.27
Nodes (9): attachBiometricListeners(), syncBiometricView(), attachManagementListeners(), attachSettingsNavigation(), LEGACY_SECTIONS, initToast(), clearSensitiveUI(), refreshState() (+1 more)

### Community 16 - "dataManagement.js"
Cohesion: 0.29
Nodes (15): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreRecord(), snapshotLabel(), checked() (+7 more)

### Community 18 - "Settings UX implementation and evidence"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 19 - "Edição do cofre"
Cohesion: 0.38
Nodes (17): refreshCandidates(), sendMessage(), showToast(), changeMasterPassword(), deleteCredential(), ensureVaultAccessible(), handleCreateMaster(), handleEntrySubmit() (+9 more)

### Community 21 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 22 - "Dated validation evidence and missing acceptance"
Cohesion: 0.12
Nodes (13): Automated regression and browser boundaries, Historical Chromium 141 extension browser checks, Current57 Node tests72 modules and browser evidence, Dated validation evidence and missing acceptance, Historical exploratory defect reproductions and newer mitigations, Previous frontend refinement validation, Physical hardware and platform acceptance pending, Historical implementation test and packaging result (+5 more)

### Community 23 - "modules/settings.js"
Cohesion: 0.22
Nodes (14): syncGeneratorControls(), refreshManagement(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView() (+6 more)

### Community 24 - "popup.js"
Cohesion: 0.36
Nodes (13): saveGeneratedToVault(), saveTestedToVault(), attachUIListeners(), closeModal(), closeSettingsPanel(), detectActiveOrigin(), manageFocus(), openEntryModal() (+5 more)

### Community 26 - "settings-browser.mjs"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 28 - "Settings frontend review and refinement"
Cohesion: 0.20
Nodes (6): Historical accessible themes ranges and saving feedback, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 29 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 30 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): done, files(), graph, js, manifest, pkg, root, visit()

### Community 31 - "Confirmação de autofill"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 32 - "Settings and data surface with management entry"
Cohesion: 0.22
Nodes (7): Advanced, Advanced settings area, Advanced scoped deletion controls, Explicit breach request and Advanced cache management, Explicit legacy Chrome Sync version review, Advanced legacy Chrome Sync controls, Password tester tab and explicit HIBP action

### Community 33 - "Settings and data surface with management entry"
Cohesion: 0.22
Nodes (7): Backups, Historical six-category navigation, Local restore evidence and remaining recovery acceptance, Backups settings area, Encrypted backup import and export, Four always-visible Settings tabs, Earlier versions in Backups

### Community 34 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 35 - "Quatro áreas das definições"
Cohesion: 0.29
Nodes (7): Executed validation, Four-area Settings revision, Implemented interface, Security, Four-area executed validation and limits, Working behavior and state, Current four-area Settings validation

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 37 - "Timestamped local version backup cards"
Cohesion: 0.29
Nodes (7): Timestamped local version backup cards, Selected Backups settings tab, Encrypted backup labels, Backup Export controls, Legacy Sync update notice requesting vault unlock, Backup Restore controls, Recovery settings screenshot

### Community 38 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (7): scripts, check, package, test, test:browser, test:settings-browser, test:sync-browser

### Community 41 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Biometric unlock setup card with fingerprint, face, PIN, or security key description and About disclosure, Clear copied passwords after 30 seconds control with best-effort copy-matching explanation, Phase 1 Security settings screenshot, Green toast: Legacy Sync mode updated; unlock the active vault again, Change master password row with authentication explanation, Security settings tab among General, Backups, and Advanced

### Community 42 - "Captura do cofre"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 43 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Footer showing SecurePass v0.2.0 and GitHub link, Settings tabs: General selected, Security, Backups, Advanced, Reset preferences row with restoration description, Preferences saved feedback, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 44 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Typed confirmation field showing wrong and red ERASE THIS DEVICE instruction, Device erasure confirmation modal, Cancel and red Erase this device action buttons, Master password input and show password link, Local erasure scope description with remote copies remaining, Verification dropdown showing erase without unlocking

### Community 45 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Auto-lock vault slider displaying 15 minutes, Set up biometric unlock card with fingerprint, face, PIN or security key helper text and collapsed About row, Clear copied passwords slider displaying After 30 seconds and best-effort helper text, Change master password navigation row with authentication helper text, Preferences saved feedback below the cards, Dark settings screen with Security selected in four-tab navigation

### Community 46 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Auto-lock vault slider showing 15 minutes, Set up biometric unlock card with collapsed About biometric unlock disclosure, Clear copied passwords slider showing After 30 seconds, Change master password action row, Security settings light screenshot, General, Security, Backups and Advanced tab navigation; Security selected

### Community 47 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Preferences save automatically notice, General appearance settings, Reset preferences with vault-kept explanatory copy, General, Security, Backups, and Advanced tabs, System theme selected, System, Light, and Dark theme choices

### Community 48 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, Security panel, Settings navigation

### Community 49 - "Operações do clipboard"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 50 - "SETTINGS_UX.md"
Cohesion: 0.60
Nodes (3): Approved four-area revision on main, Local issue — Settings, Sync and Data Management journeys, Scope

## Knowledge Gaps
- **91 isolated node(s):** `Chrome Identity`, `Chrome Storage`, `Drive appDataFolder`, `Drive errors`, `OWASP Cryptographic Storage` (+86 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 452 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dated validation evidence and missing acceptance` connect `Dated validation evidence and missing acceptance` to `Settings and data surface with management entry`, `Quatro áreas das definições`, `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Implementação e migração`, `Regras do repositório`, `Settings frontend review and refinement`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `Chrome Identity`, `Chrome Storage`, `Drive appDataFolder` to the rest of the system?**
  _91 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.07980127309424002 - nodes in this community are weakly interconnected._
- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Documentação de Sync e dados` to `Revisão funcional histórica`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Dated validation evidence and missing acceptance`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `Autorização e pedidos autofill` be split into smaller, more focused modules?**
  _Cohesion score 0.09044289044289044 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Arquitetura documentada` to `Documentação de Sync e dados`, `Revisão funcional histórica`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Documento offscreen`, `Settings UX — journeys, screens and acceptance map`, `Regras do repositório`, `Confirmação de autofill`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.0899854862119013 - nodes in this community are weakly interconnected._
## Current Working Tree Refresh
- Four-area settings revision: code updated first with the CLI, then changed HTML, documentation and screenshots re-extracted semantically.
- Missing obsolete concepts were accepted only from fully re-extracted changed sources; no unrelated semantic knowledge was removed.
- Final source hashes are recorded in graph.json. CSS is outside Graphify extraction and remains a known navigation gap.
