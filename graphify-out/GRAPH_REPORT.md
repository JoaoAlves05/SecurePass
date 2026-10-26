# Graph Report - SecurePass  (2026-10-26)

## Corpus Check
- 124 files · ~70,513 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 3)

## Working-tree scope

Includes the backup/Advanced functional corrections and popup export/restore UI. Source refreshed with `graphify update .`; changed documentation and the 12 new dialog screenshots received semantic incremental extraction. Existing baseline screenshot fixtures were restored.

## Summary
- 1042 nodes · 2492 edges · 67 communities (44 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: semantic usage unavailable; numeric extraction zeros are schema placeholders, not measured usage.

## Graph Freshness
- Built from commit: `0e75d379`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- biometric/service.js
- cryptoVault.js
- Arquitetura documentada
- Criptografia e armazenamento
- Avaliação de palavras-passe
- Revisão funcional histórica
- Documentação de Sync e dados
- Interface e revisão visual
- biometric/service.js
- Edição do cofre
- dataManagement.js
- Autofill na página
- backupCrypto.js
- Documentação de Sync e dados
- Documentação de Sync e dados
- Settings UX — journeys, screens and acceptance map
- modules/settings.js
- Navegação e composição popup
- Navegação e validação Settings
- Evidência visual das definições
- Implementação e migração
- Constantes e registos
- Quatro áreas das definições
- Backup dialog UI
- settings-browser.mjs
- Manifesto da extensão
- Evidência visual das definições
- backupDialogs-browser.mjs
- Settings frontend review and refinement
- Navegação e validação Settings
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Modelo de segurança
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Modelo de segurança
- Constantes e registos
- Documentação de Sync e dados
- Backup dialog UI
- Revisão funcional — Backups & recovery e Advanced
- Ferramentas de desenvolvimento
- Documentação de Sync e dados
- Evidência visual das definições
- Documentação de Sync e dados
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Quatro áreas das definições
- Timestamped local version backup cards
- Ícone 128 pixels
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `Current architecture with implemented local and legacy increment` - 49 edges
3. `getStorage()` - 48 edges
4. `Historical review of commit 5aed51c` - 44 edges
5. `showToast()` - 42 edges
6. `Proposed P6 migration and acceptance` - 42 edges
7. `Original SD review with later local increment notice` - 42 edges
8. `removeStorage()` - 41 edges
9. `initialise()` - 36 edges
10. `setStorage()` - 33 edges

## Surprising Connections (you probably didn't know these)
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md
- `Hierarchical Settings navigation` --conceptually_related_to--> `Settings category links and labelled navigation`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `Shared Settings footer across navigation layouts` --conceptually_related_to--> `Shared Settings footer`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `ready` --calls--> `removeStorage()`  [EXTRACTED]
  background/serviceWorker.js → src/utils/storage.js
- `initialise()` --calls--> `authenticateBiometric()`  [EXTRACTED]
  popup/popup.js → src/biometric/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (67 total, 23 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.08
Nodes (101): assertDocument(), cancelRequest(), completeRequest(), listForOrigin(), requestDetails(), trustedRequest(), decryptBackupPayload(), isEncryptedBackupEnvelope() (+93 more)

### Community 1 - "biometric/service.js"
Cohesion: 0.09
Nodes (57): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), clearRequests() (+49 more)

### Community 2 - "cryptoVault.js"
Cohesion: 0.09
Nodes (36): fake-indexeddb, copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight (+28 more)

### Community 3 - "Arquitetura documentada"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 4 - "Criptografia e armazenamento"
Cohesion: 0.09
Nodes (41): setUnlockResolver(), showToast(), biometricUnlockContainer, changeMasterPassword(), clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection (+33 more)

### Community 5 - "Avaliação de palavras-passe"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 8 - "Interface e revisão visual"
Cohesion: 0.09
Nodes (35): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Version and repository footer, Advanced compatibility maintenance and local data, System light and dark theme controls (+27 more)

### Community 9 - "biometric/service.js"
Cohesion: 0.15
Nodes (22): complete(), refresh(), requestId, send(), showError(), DECODER, deriveBackupKey(), ENCODER (+14 more)

### Community 10 - "Edição do cofre"
Cohesion: 0.25
Nodes (21): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreNotice(), restoreRecord(), snapshotLabel() (+13 more)

### Community 11 - "dataManagement.js"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 12 - "Autofill na página"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 13 - "backupCrypto.js"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 16 - "Documentação de Sync e dados"
Cohesion: 0.29
Nodes (15): syncGeneratorControls(), resolveUnlockSetup(), attachSettingsNavigation(), LEGACY_SECTIONS, initToast(), attachUIListeners(), backFromSettings(), closeModal() (+7 more)

### Community 18 - "modules/settings.js"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 20 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 21 - "Evidência visual das definições"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 22 - "Implementação e migração"
Cohesion: 0.14
Nodes (10): done, files(), graph, js, manifest, pkg, root, visit() (+2 more)

### Community 23 - "Constantes e registos"
Cohesion: 0.16
Nodes (12): Exercised automated regression boundaries, Backup Advanced functional baseline: 75 Node tests and 74 modules, Earlier settings/data increment evidence, Dated validation evidence and missing acceptance, Previous four-area Settings validation, Previous Settings frontend validation, Separate hardware and platform distribution checks, Historical implementation evidence (+4 more)

### Community 24 - "Quatro áreas das definições"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 25 - "Backup dialog UI"
Cohesion: 0.15
Nodes (13): export dark 320 extension dialog screenshot, export dark 400 extension dialog screenshot, export error dark extension dialog screenshot, export light 320 extension dialog screenshot, export light 400 extension dialog screenshot, export management dark extension dialog screenshot, restore dark 320 extension dialog screenshot, restore dark 400 extension dialog screenshot (+5 more)

### Community 27 - "Manifesto da extensão"
Cohesion: 0.37
Nodes (7): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), refreshState(), state, authenticateBiometric()

### Community 28 - "Evidência visual das definições"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+3 more)

### Community 29 - "backupDialogs-browser.mjs"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 30 - "Settings frontend review and refinement"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (10): Visible auto-lock vault slider shows 15 minutes, Visible biometric unlock setup card with collapsed explanation, Visible copied-password clearing slider shows After 30 seconds; best effort matching the last SecurePass copy, Visible GitHub footer link, Visible Change master password row asks to authenticate and choose a new vault password, Visible footer product version SecurePass v0.2.0, Visible Preferences saved status below product version, Security settings light screenshot (+2 more)

### Community 33 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 34 - "Confirmação de autofill"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 35 - "Modelo de segurança"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 38 - "Modelo de segurança"
Cohesion: 0.22
Nodes (3): contexts, profiles, root

### Community 39 - "Constantes e registos"
Cohesion: 0.25
Nodes (8): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Current approved hierarchical implementation scope, Journey scope and unconfigured OAuth, Remaining SD protocol and recovery acceptance, Emulated Chromium Sync is not authenticated transport

### Community 40 - "Documentação de Sync e dados"
Cohesion: 0.25
Nodes (8): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:settings-browser, test:sync-browser

### Community 41 - "Backup dialog UI"
Cohesion: 0.29
Nodes (7): Accessible reveal and remasking of backup passwords, Exclusive pending controls and actionable restore errors, Scrollable native dialog body and visible actions in short popups, Popup export and restore dialog refinement, Real backup downloads restore and light dark popup validation, Review saved version identity before export or restore, Current popup dialog UI and 75-module browser evidence

### Community 44 - "Revisão funcional — Backups & recovery e Advanced"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 45 - "Ferramentas de desenvolvimento"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 46 - "Documentação de Sync e dados"
Cohesion: 0.40
Nodes (5): Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação, Verificação manual reproduzível

### Community 48 - "Documentação de Sync e dados"
Cohesion: 0.50
Nodes (4): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence

### Community 49 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 50 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 51 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 52 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Visible Auto-lock vault slider displaying 15 minutes, Visible biometric setup card and collapsed About row beneath Change master password row and above Preferences saved feedback, Visible Clear copied passwords slider displaying After 30 seconds and best-effort copy-matching explanation, Dark settings screenshot with Security selected beside Appearance, Backups & recovery, and Advanced

### Community 53 - "Quatro áreas das definições"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 55 - "Ícone 128 pixels"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **122 isolated node(s):** `./modules/operationDialog.js`, `Local backup safety and repeatable recovery cleanup`, `Chrome Identity`, `Chrome Storage`, `Drive appDataFolder` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 496 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dated validation evidence and missing acceptance` connect `Constantes e registos` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Avaliação de palavras-passe`, `Constantes e registos`, `Backup dialog UI`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Navegação e composição popup`, `Navegação e validação Settings`, `Evidência visual das definições`, `settings-browser.mjs`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `./modules/operationDialog.js`, `Local backup safety and repeatable recovery cleanup`, `Chrome Identity` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07824871914299023 - nodes in this community are weakly interconnected._
- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Avaliação de palavras-passe` to `Revisão funcional histórica`, `Documentação de Sync e dados`, `Captura do cofre`, `Operações do clipboard`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Navegação e validação Settings`, `Constantes e registos`, `settings-browser.mjs`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `biometric/service.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08819538670284939 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Revisão funcional histórica` to `Ferramentas de desenvolvimento`, `Avaliação de palavras-passe`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Evidência visual das definições`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Navegação e validação Settings`, `Constantes e registos`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08521303258145363 - nodes in this community are weakly interconnected._