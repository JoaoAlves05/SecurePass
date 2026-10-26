# Graph Report - SecurePass  (2026-10-26)

## Corpus Check
- 124 files · ~71,110 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 3)

## Working-tree scope

Code refreshed with `graphify update .`. README presentation in Portuguese fully read and semantically re-extracted; its prior contribution was replaced incrementally. Other semantic sources were preserved.

## Summary
- 1038 nodes · 2476 edges · 78 communities (44 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: semantic usage unavailable; numeric zeros in extraction are schema placeholders, not measured usage.

## Community Hubs (Navigation)
- cryptoVault.js
- biometric/service.js
- cryptoVault.js
- Documentação de Sync e dados
- Arquitetura documentada
- biometric/service.js
- Interface e revisão visual
- biometric/service.js
- Revisão funcional histórica
- Edição do cofre
- Funcionalidades documentadas
- dataManagement.js
- showToast
- Criptografia e armazenamento
- Autofill na página
- backupCrypto.js
- Evidência visual das definições
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- modules/settings.js
- Navegação e validação Settings
- Implementação e migração
- Quatro áreas das definições
- backupDialogs-browser.mjs
- REVIEW_BACKUP_ADVANCED.md
- Navegação e composição popup
- Evidência visual das definições
- Settings frontend review and refinement
- Navegação e validação Settings
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Captura do cofre
- 2026-10-25T22-07-51Z__popup-popup-html.md
- 2026-10-25T22-07-51Z__popup-popup-html.md
- Evidência visual das definições
- Security settings area
- Evidência visual das definições
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
- Ícone 128 pixels
- Four-area Settings revision
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Documentação de Sync e dados
- export dark 320 extension dialog screenshot
- export dark 400 extension dialog screenshot
- export error dark extension dialog screenshot
- export light 320 extension dialog screenshot
- export light 400 extension dialog screenshot
- export management dark extension dialog screenshot
- restore dark 320 extension dialog screenshot
- restore dark 400 extension dialog screenshot
- restore error dark extension dialog screenshot
- restore light 320 extension dialog screenshot
- restore light 400 extension dialog screenshot
- saved version export dark extension dialog screenshot

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `getStorage()` - 48 edges
3. `Current architecture with implemented local and legacy increment` - 48 edges
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
- `README de apresentação em português` --references--> `Backup Advanced functional baseline: 75 Node tests and 74 modules`  [EXTRACTED]
  README.md → docs/VALIDATION.md
- `Hierarchical Settings navigation` --conceptually_related_to--> `Settings category links and labelled navigation`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `Shared Settings footer across navigation layouts` --conceptually_related_to--> `Shared Settings footer`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `ready` --calls--> `removeStorage()`  [EXTRACTED]
  background/serviceWorker.js → src/utils/storage.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (78 total, 34 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.08
Nodes (101): decryptBackupPayload(), deriveBackupKey(), encryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), clearVaultEntries(), deleteCredential(), importVaultData() (+93 more)

### Community 1 - "biometric/service.js"
Cohesion: 0.10
Nodes (52): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+44 more)

### Community 2 - "cryptoVault.js"
Cohesion: 0.09
Nodes (35): fake-indexeddb, copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight (+27 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 4 - "Arquitetura documentada"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 7 - "biometric/service.js"
Cohesion: 0.13
Nodes (29): complete(), refresh(), requestId, send(), showError(), DECODER, ENCODER, assert() (+21 more)

### Community 8 - "Revisão funcional histórica"
Cohesion: 0.07
Nodes (26): setUnlockResolver(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection, createVaultIconButton(), currentMasterInput (+18 more)

### Community 9 - "Edição do cofre"
Cohesion: 0.22
Nodes (23): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreNotice(), restoreRecord(), snapshotLabel() (+15 more)

### Community 10 - "Funcionalidades documentadas"
Cohesion: 0.08
Nodes (20): Local backup safety and repeatable recovery cleanup, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade, Contribuições e licença MIT (+12 more)

### Community 11 - "dataManagement.js"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 12 - "showToast"
Cohesion: 0.28
Nodes (19): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), showToast(), changeMasterPassword(), deleteCredential(), handleCreateMaster() (+11 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.13
Nodes (24): Version and repository footer, Advanced compatibility maintenance and local data, System light and dark theme controls, Backups and recovery settings area, Scoped entry clearing and local device erasure, Encrypted backup import and export controls, Popup HTML semantic surfaces, Labelled credential editor dialog (+16 more)

### Community 14 - "Autofill na página"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 15 - "backupCrypto.js"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 16 - "Evidência visual das definições"
Cohesion: 0.11
Nodes (21): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Current approved hierarchical implementation scope, Journey scope and unconfigured OAuth, Exercised automated regression boundaries, Backup Advanced functional baseline: 75 Node tests and 74 modules (+13 more)

### Community 18 - "Documentação de Sync e dados"
Cohesion: 0.31
Nodes (15): syncGeneratorControls(), resolveUnlockSetup(), attachSettingsNavigation(), LEGACY_SECTIONS, initToast(), attachUIListeners(), backFromSettings(), closeModal() (+7 more)

### Community 20 - "Modelo de segurança"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 22 - "modules/settings.js"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 23 - "Navegação e validação Settings"
Cohesion: 0.14
Nodes (10): done, files(), graph, js, manifest, pkg, root, visit() (+2 more)

### Community 24 - "Implementação e migração"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 26 - "backupDialogs-browser.mjs"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+3 more)

### Community 27 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 28 - "Navegação e composição popup"
Cohesion: 0.18
Nodes (10): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Historical General inventory, Historical four-tab navigation, Security control inventory (+2 more)

### Community 29 - "Evidência visual das definições"
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

### Community 35 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 38 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (3): contexts, profiles, root

### Community 39 - "Captura do cofre"
Cohesion: 0.25
Nodes (8): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:settings-browser, test:sync-browser

### Community 40 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 43 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 44 - "Evidência visual das definições"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 45 - "Security settings area"
Cohesion: 0.40
Nodes (5): Auto-lock inactivity preference, PRF enrollment and local removal controls, Ownership-aware clipboard timeout explanation, Master-password rotation dialog, Security settings area

### Community 47 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 48 - "Quatro áreas das definições"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 49 - "Análise de formulários"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 50 - "Timestamped local version backup cards"
Cohesion: 0.50
Nodes (4): Visible Auto-lock vault slider displaying 15 minutes, Visible biometric setup card and collapsed About row beneath Change master password row and above Preferences saved feedback, Visible Clear copied passwords slider displaying After 30 seconds and best-effort copy-matching explanation, Dark settings screenshot with Security selected beside Appearance, Backups & recovery, and Advanced

### Community 51 - "Ícone 128 pixels"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 52 - "Four-area Settings revision"
Cohesion: 0.50
Nodes (4): Executed validation, Four-area Settings revision, Implemented interface, Working behavior and state

### Community 54 - "Ícone 32 pixels"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **134 isolated node(s):** `Current popup dialog UI and 75-module browser evidence`, `./modules/operationDialog.js`, `Historical four-area executed validation and limits`, `Security control inventory`, `Unified local and archived earlier versions` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 493 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dated validation evidence and missing acceptance` connect `Evidência visual das definições` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Quatro áreas das definições`, `REVIEW_BACKUP_ADVANCED.md`, `Navegação e composição popup`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `Current popup dialog UI and 75-module browser evidence`, `./modules/operationDialog.js`, `Historical four-area executed validation and limits` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07964601769911504 - nodes in this community are weakly interconnected._
- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Arquitetura documentada` to `biometric/service.js`, `Interface e revisão visual`, `Revisão funcional — Backups & recovery e Advanced`, `Ferramentas de desenvolvimento`, `Funcionalidades documentadas`, `Evidência visual das definições`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `modules/settings.js`, `Quatro áreas das definições`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `biometric/service.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09726775956284153 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Interface e revisão visual` to `Ferramentas de desenvolvimento`, `Arquitetura documentada`, `biometric/service.js`, `Funcionalidades documentadas`, `Evidência visual das definições`, `Settings UX implementation and evidence`, `Modelo de segurança`, `modules/settings.js`, `REVIEW_BACKUP_ADVANCED.md`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08766233766233766 - nodes in this community are weakly interconnected._