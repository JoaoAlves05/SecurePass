# Graph Report - SecurePass  (2026-10-26)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1083 nodes · 2590 edges · 77 communities (43 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0697b0a5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- biometric/service.js
- cryptoVault.js
- Documentação de Sync e dados
- Arquitetura documentada
- biometric/service.js
- Interface e revisão visual
- popup.js
- Revisão funcional histórica
- Edição do cofre
- Funcionalidades documentadas
- dataManagement.js
- session.js
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
- Revisão funcional — Backups & recovery e Advanced
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
- Revisão funcional — Backups & recovery e Advanced
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

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `getStorage()` - 52 edges
3. `Current architecture with implemented local and legacy increment` - 51 edges
4. `removeStorage()` - 45 edges
5. `Historical review of commit 5aed51c` - 44 edges
6. `Proposed P6 migration and acceptance` - 42 edges
7. `Original SD review with later local increment notice` - 42 edges
8. `showToast()` - 40 edges
9. `setStorage()` - 35 edges
10. `initialise()` - 34 edges

## Surprising Connections (you probably didn't know these)
- `Two-minute single-use revision-bound password-change grant` --references--> `consumeMasterAuthorization()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → src/vault/masterAuthorization.js
- `Ordinary biometric unlock cannot become a password-change grant` --references--> `startAuthentication()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → src/biometric/service.js
- `Fresh identity confirmation replaces preliminary unlock and modal` --references--> `attachMasterPasswordListeners()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → popup/modules/masterPassword.js
- `Purpose-bound inline master-password authorization` --references--> `attachMasterPasswordListeners()`  [EXTRACTED]
  ARCHITECTURE.md → popup/modules/masterPassword.js
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (77 total, 34 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.05
Nodes (147): Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), clearRequests() (+139 more)

### Community 1 - "biometric/service.js"
Cohesion: 0.10
Nodes (45): handlers, ready, assertDocument(), cancelRequest(), completeRequest(), listForOrigin(), requestDetails(), trustedRequest() (+37 more)

### Community 2 - "cryptoVault.js"
Cohesion: 0.07
Nodes (40): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+32 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 6 - "Interface e revisão visual"
Cohesion: 0.08
Nodes (33): resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus(), openModal() (+25 more)

### Community 7 - "popup.js"
Cohesion: 0.06
Nodes (35): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+27 more)

### Community 8 - "Revisão funcional histórica"
Cohesion: 0.08
Nodes (20): Local backup safety and repeatable recovery cleanup, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade, Contribuições e licença MIT (+12 more)

### Community 9 - "Edição do cofre"
Cohesion: 0.27
Nodes (15): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation(), LEGACY_SECTIONS, initToast() (+7 more)

### Community 10 - "Funcionalidades documentadas"
Cohesion: 0.12
Nodes (25): Version and repository footer, Advanced compatibility maintenance and local data, System light and dark theme controls, Backups and recovery settings area, Scoped entry clearing and local device erasure, Encrypted backup import and export controls, Popup HTML semantic surfaces, Labelled credential editor dialog (+17 more)

### Community 11 - "dataManagement.js"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 12 - "session.js"
Cohesion: 0.25
Nodes (21): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreNotice(), restoreRecord(), snapshotLabel() (+13 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 14 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 15 - "backupCrypto.js"
Cohesion: 0.10
Nodes (20): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Journey scope and unconfigured OAuth, Exercised automated regression boundaries, Backup Advanced functional baseline: 75 Node tests and 74 modules, Current popup dialog UI and 75-module browser evidence (+12 more)

### Community 16 - "Evidência visual das definições"
Cohesion: 0.16
Nodes (12): fake-indexeddb, alarms, areas, event(), fault, installChrome(), resetStorage(), authorize() (+4 more)

### Community 17 - "Documentação de Sync e dados"
Cohesion: 0.22
Nodes (16): complete(), refresh(), requestId, send(), showError(), assert(), clientId, enrollBiometric() (+8 more)

### Community 19 - "Settings UX implementation and evidence"
Cohesion: 0.11
Nodes (8): errors, root, server, shadowClick(), find(), contexts, profiles, root

### Community 21 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 23 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 24 - "Implementação e migração"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 25 - "Quatro áreas das definições"
Cohesion: 0.14
Nodes (10): done, files(), graph, js, manifest, pkg, root, visit() (+2 more)

### Community 26 - "backupDialogs-browser.mjs"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 27 - "Revisão funcional — Backups & recovery e Advanced"
Cohesion: 0.44
Nodes (14): showToast(), deleteCredential(), handleCreateMaster(), handleEntrySubmit(), handleUnlock(), lockVault(), refreshVaultEntries(), renderEntries() (+6 more)

### Community 29 - "Evidência visual das definições"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+3 more)

### Community 30 - "Settings frontend review and refinement"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 31 - "Navegação e validação Settings"
Cohesion: 0.20
Nodes (6): cancel(), captures, errors, idle(), root, ./modules/operationDialog.js

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 34 - "Confirmação de autofill"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 35 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 38 - "Ferramentas de desenvolvimento"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 39 - "Captura do cofre"
Cohesion: 0.25
Nodes (8): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:settings-browser, test:sync-browser

### Community 40 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 41 - "Revisão funcional — Backups & recovery e Advanced"
Cohesion: 0.29
Nodes (7): Auto-lock inactivity preference, PRF enrollment and local removal controls, Ownership-aware clipboard timeout explanation, Inline current-password or biometric identity form, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms, Security settings area

### Community 44 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 45 - "Security settings area"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 46 - "Evidência visual das definições"
Cohesion: 0.40
Nodes (5): Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação, Verificação manual reproduzível

### Community 48 - "Quatro áreas das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 49 - "Análise de formulários"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 50 - "Timestamped local version backup cards"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 51 - "Ícone 128 pixels"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 53 - "Ícone 16 pixels"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **156 isolated node(s):** `./modules/operationDialog.js`, `Independent management-tab layout with shared trusted pathname`, `Popup toast live status`, `Vault create unlock and management states`, `Password or existing biometric operation unlock dialog` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 515 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `biometric/service.js` to `cryptoVault.js`, `Ferramentas de desenvolvimento`, `Documentação de Sync e dados`, `Ferramentas de desenvolvimento`, `Arquitetura documentada`, `Revisão funcional histórica`, `Evidência visual das definições`, `backupCrypto.js`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Navegação e validação Settings`, `Settings frontend review and refinement`?**
  _High betweenness centrality (0.389) - this node is a cross-community bridge._
- **What connects `./modules/operationDialog.js`, `Independent management-tab layout with shared trusted pathname`, `Popup toast live status` to the rest of the system?**
  _156 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05051948051948052 - nodes in this community are weakly interconnected._
- **Why does `Purpose-bound inline master-password authorization` connect `cryptoVault.js` to `Edição do cofre`, `biometric/service.js`, `popup.js`?**
  _High betweenness centrality (0.381) - this node is a cross-community bridge._
- **Should `biometric/service.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1033182503770739 - nodes in this community are weakly interconnected._
- **Why does `attachMasterPasswordListeners()` connect `Edição do cofre` to `cryptoVault.js`, `Revisão funcional — Backups & recovery e Advanced`, `popup.js`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07293868921775898 - nodes in this community are weakly interconnected._

Semantic maintenance note (2026-10-26): changed master-password documentation and seven screenshots were revalidated incrementally. Delegated extraction token usage was unavailable; any zero semantic token counters are placeholders, not measured cost. Existing unrelated backup-dialog cache prompt vintage and pending label suggestions remain unchanged. Five code self-loops are recursive calls, with no dangling/missing endpoints or collapsed graph edges.
