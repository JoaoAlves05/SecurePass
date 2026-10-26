# Graph Report - SecurePass  (2026-10-26)

## Corpus Check
- 142 files · ~80,530 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 4, (none) 3)

## Summary
- 1183 nodes · 2866 edges · 79 communities (45 shown, 34 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `814aae78`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- biometric/service.js
- session.js
- Criptografia e armazenamento
- Autofill na página
- src/settings.js
- Documentação de Sync e dados
- Settings UX implementation and evidence
- tester.js
- Quatro áreas das definições
- initialise
- Evidência visual das definições
- Navegação e validação Settings
- Ferramentas de desenvolvimento
- generator.js
- checkpoints-browser.mjs
- Security settings area
- Four-area Settings revision
- Interface e revisão visual
- popup.js
- sync-browser.mjs
- Edição do cofre
- Funcionalidades documentadas
- dataManagement.js
- Implementação e migração
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Captura do cofre
- Recovery checkpoints
- REVIEW_BACKUP_ADVANCED.md
- backupCrypto.js
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- Navegação e validação Settings
- backupDialogs-browser.mjs
- Navegação e composição popup
- Documentação de Sync e dados
- Settings frontend review and refinement
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Arquitetura documentada
- Evidência visual das definições
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
- Ícone 128 pixels
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Revisão funcional histórica
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
- modules/settings.js
- biometric/service.js

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `getStorage()` - 56 edges
3. `Current architecture with implemented local and legacy increment` - 52 edges
4. `removeStorage()` - 49 edges
5. `Historical review of commit 5aed51c` - 44 edges
6. `showToast()` - 43 edges
7. `Proposed P6 migration and acceptance` - 42 edges
8. `Original SD review with later local increment notice` - 42 edges
9. `setStorage()` - 37 edges
10. `withVaultOperation()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `Atomic live/history rekey without adding a content checkpoint` --references--> `rotateMasterPassword()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/cryptoVault.js
- `Individual entry recovery preserves other newer entries` --references--> `recoverCheckpoint()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/vault/checkpoints.js
- `Remove one checkpoint or verify current password to clear local history` --references--> `removeCheckpoints()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/vault/checkpoints.js
- `Unreadable legacy protection requires explicit unlock or removal` --references--> `unlockCheckpoint()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/vault/checkpoints.js
- `Ordinary biometric unlock cannot become a password-change grant` --references--> `startAuthentication()`  [EXTRACTED]
  docs/MASTER_PASSWORD_FLOW.md → src/biometric/service.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (79 total, 34 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.05
Nodes (135): changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault(), keepAlive(), mutate() (+127 more)

### Community 1 - "biometric/service.js"
Cohesion: 0.07
Nodes (78): clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument(), cancelRequest(), clearRequests() (+70 more)

### Community 12 - "session.js"
Cohesion: 0.19
Nodes (33): account(), attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), request() (+25 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.11
Nodes (21): format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), redactValue(), safeSerialize(), _serialize(), ALARM_NAME (+13 more)

### Community 14 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), element(), initAutofill(), showSaveSuggestion(), setFieldValue(), visibleField(), request(), initThemeSync() (+8 more)

### Community 16 - "src/settings.js"
Cohesion: 0.07
Nodes (39): copyInBackground(), ensureOffscreen(), checkPassword(), clearHibpCache(), hibpCacheStatus(), range(), generatePassword(), randomIndex() (+31 more)

### Community 17 - "Documentação de Sync e dados"
Cohesion: 0.22
Nodes (16): complete(), refresh(), send(), showError(), assert(), enrollBiometric(), serialize(), base64url() (+8 more)

### Community 19 - "Settings UX implementation and evidence"
Cohesion: 0.20
Nodes (5): shadowClick(), find(), errors, root, server

### Community 2 - "tester.js"
Cohesion: 0.13
Nodes (19): attachTesterListeners(), mapScoreToColor(), scoreToBadge(), setLoading(), toggleCollapsible(), updateStrength(), evaluatePassword(), copyToClipboard() (+11 more)

### Community 25 - "Quatro áreas das definições"
Cohesion: 0.14
Nodes (10): files(), visit(), done, graph, js, manifest, pkg, root (+2 more)

### Community 27 - "initialise"
Cohesion: 0.25
Nodes (17): attachGeneratorListeners(), saveGeneratedToVault(), resolveUnlockSetup(), setUnlockResolver(), saveTestedToVault(), attachUIListeners(), backFromSettings(), closeModal() (+9 more)

### Community 29 - "Evidência visual das definições"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme(), resolveTheme() (+3 more)

### Community 31 - "Navegação e validação Settings"
Cohesion: 0.20
Nodes (6): cancel(), idle(), ./modules/operationDialog.js, captures, errors, root

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): layouts(), section(), errors, root

### Community 38 - "generator.js"
Cohesion: 0.11
Nodes (18): handleGenerate(), setLoading(), syncGeneratorControls(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus (+10 more)

### Community 40 - "checkpoints-browser.mjs"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 45 - "Security settings area"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), write(), serial

### Community 6 - "Interface e revisão visual"
Cohesion: 0.10
Nodes (33): clearRevealTimer(), createVaultIconButton(), deleteCredential(), handleCreateMaster(), handleEntrySubmit(), handleUnlock(), lockVault(), refreshVaultEntries() (+25 more)

### Community 7 - "popup.js"
Cohesion: 0.05
Nodes (38): consumeMasterAuthorization(), Clear secrets and revoke the exact grant on leaving the inline flow, Fresh identity confirmation replaces preliminary unlock and modal, New master password and confirmation with inline errors, Management footer aligned with the content column, Two-minute single-use revision-bound password-change grant, Pre-save biometric revocation notice and optional setup again, Tab stylesheet separates desktop layout from compact popup presentation (+30 more)

### Community 77 - "sync-browser.mjs"
Cohesion: 0.22
Nodes (3): contexts, profiles, root

### Community 9 - "Edição do cofre"
Cohesion: 0.28
Nodes (14): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation(), initToast(), refreshState() (+6 more)

### Community 10 - "Funcionalidades documentadas"
Cohesion: 0.07
Nodes (39): Reproduced cache status layout defect, Recovery discovery and terminology concerns, Historical navigation and dialog recommendations, Readable cache row layout correction, Visual critique and accessibility limits, Popup toast live status, PRF enrollment and local removal controls, Scoped entry clearing and local device erasure (+31 more)

### Community 11 - "dataManagement.js"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 24 - "Implementação e migração"
Cohesion: 0.13
Nodes (14): Four-area Settings revision, Executed validation, Implemented interface, Working behavior and state, Historical four-area executed validation and limits, Security control inventory, Unified local and archived earlier versions, Cache usage without duration control (+6 more)

### Community 35 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (9): Implemented behavior, Executed verification, Manual review and limits, Hierarchical Settings navigation, Settings navigation screenshot evidence, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts, Navigation history, focus and scroll preservation (+1 more)

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 39 - "Captura do cofre"
Cohesion: 0.22
Nodes (9): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:checkpoints-browser, test:settings-browser (+1 more)

### Community 41 - "Recovery checkpoints"
Cohesion: 0.08
Nodes (21): Behavior and presentation, Encryption and rotation, Evidence, Recovery checkpoints, Recovery integrity, Recovery checkpoints, Verification, Recovery checkpoints behavior, protection and verification (+13 more)

### Community 46 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 15 - "backupCrypto.js"
Cohesion: 0.13
Nodes (17): Journey scope and unconfigured OAuth, Previous hierarchical navigation validation, Historical implementation evidence, Earlier settings/data increment evidence, Emulated Chromium Sync is not authenticated transport, Exercised automated regression boundaries, Previous Settings frontend validation, Virtual WebAuthn PRF browser coverage (+9 more)

### Community 21 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 23 - "Navegação e validação Settings"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 26 - "backupDialogs-browser.mjs"
Cohesion: 0.15
Nodes (14): Change master password action, GitHub footer link, Settings footer, SecurePass v0.2.0 footer version, Preferences save automatically status, Security popup screenshot, Set up biometric unlock action, Auto-lock vault slider (+6 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 30 - "Settings frontend review and refinement"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 34 - "Confirmação de autofill"
Cohesion: 0.20
Nodes (7): Historical frontend regression evidence and manual limits, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical accessible themes ranges and saving feedback, Historical settings disclosures unlock and focus corrections, Historical six-category navigation, Historical six-category frontend review

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 44 - "Evidência visual das definições"
Cohesion: 0.33
Nodes (6): Settings navigation, Copy edit and delete controls, Generator Tester Vault tabs, Credential cards, Search add and lock controls, Unlocked vault screenshot

### Community 48 - "Quatro áreas das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Visible toast states Legacy Sync mode updated and asks to unlock active vault again, Security settings screenshot with password, clipboard, biometric controls and a toast

### Community 49 - "Análise de formulários"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Theme choices: System selected, Light, Dark, Dark appearance settings screenshot

### Community 50 - "Timestamped local version backup cards"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking, Device erasure confirmation modal

### Community 51 - "Ícone 128 pixels"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected, Appearance popup with back navigation and Open in tab link

### Community 53 - "Ícone 16 pixels"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

### Community 8 - "Revisão funcional histórica"
Cohesion: 0.08
Nodes (20): Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade, Contribuições e licença MIT, Cofre cifrado com Web Crypto (+12 more)

### Community 22 - "modules/settings.js"
Cohesion: 0.09
Nodes (3): Security model and open risks, Encrypted checkpoints and unlocked-only difference disclosure, Content recovery preserves existing master password and biometric setup

## Knowledge Gaps
- **189 isolated node(s):** `Behavior and presentation`, `Encryption and rotation`, `Evidence`, `Recovery integrity`, `Verification` (+184 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 564 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `biometric/service.js` to `Ferramentas de desenvolvimento`, `Documentação de Sync e dados`, `Ferramentas de desenvolvimento`, `Arquitetura documentada`, `popup.js`, `Revisão funcional histórica`, `REVIEW_BACKUP_ADVANCED.md`, `Evidência visual das definições`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Navegação e validação Settings`, `Settings frontend review and refinement`?**
  _High betweenness centrality (0.305) - this node is a cross-community bridge._
- **What connects `Behavior and presentation`, `Encryption and rotation`, `Evidence` to the rest of the system?**
  _189 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05203162346019489 - nodes in this community are weakly interconnected._
- **Why does `Three-state checkpoint recovery and atomic live/history rotation` connect `biometric/service.js` to `cryptoVault.js`, `Recovery checkpoints`?**
  _High betweenness centrality (0.189) - this node is a cross-community bridge._
- **Should `biometric/service.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07326007326007326 - nodes in this community are weakly interconnected._
- **Why does `Purpose-bound inline master-password authorization` connect `popup.js` to `cryptoVault.js`, `Edição do cofre`, `biometric/service.js`, `biometric/service.js`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._

Checkpoint maintenance note (2026-10-26): current code plus six changed documentation/HTML sources and six new checkpoint captures were refreshed incrementally. Existing curated IDs and community assignments were preserved. Delegated semantic token usage was unavailable; zero counters are placeholders, not measured cost. Physical authenticators and Google transport remain unverified.
