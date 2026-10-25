# Graph Report - SecurePass  (2026-10-25)

## Corpus Check
- 108 files · ~65,456 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 3)

## Summary
- 971 nodes · 2367 edges · 60 communities (38 shown, 22 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.87)
- Token cost: semantic usage unavailable; collaboration tools do not expose token counts. Numeric extraction zeros are schema placeholders, not measured usage.

## Graph Freshness
- Includes navigation code, documentation and screenshots from source commit `858cfe58`; future working-tree edits still require checking.
- Built from commit: `858cfe58`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Criptografia e armazenamento
- getStorage
- Documentação de Sync e dados
- Revisão funcional histórica
- Arquitetura documentada
- Avaliação de palavras-passe
- Interface e revisão visual
- Edição do cofre
- Edição do cofre
- dataManagement.js
- Manifesto da extensão
- Constantes e registos
- Autofill na página
- client.js
- Navegação e validação Settings
- Navegação e composição popup
- Funcionalidades documentadas
- Criptografia e armazenamento
- Ferramentas de desenvolvimento
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- Settings frontend review and refinement
- Quatro áreas das definições
- modules/settings.js
- Ferramentas de desenvolvimento
- Implementação e migração
- settings-browser.mjs
- Regras do repositório
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Criptografia e armazenamento
- Ferramentas de desenvolvimento
- Captura do cofre
- Operações do clipboard
- Documento offscreen
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Análise de formulários
- Timestamped local version backup cards
- Lista inicial de definições
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
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md
- `Hierarchical Settings navigation` --conceptually_related_to--> `Settings category links and labelled navigation`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `ready` --calls--> `removeStorage()`  [EXTRACTED]
  background/serviceWorker.js → src/utils/storage.js
- `attachBiometricListeners()` --calls--> `authenticateBiometric()`  [EXTRACTED]
  popup/modules/biometricSetup.js → src/biometric/client.js
- `attachBiometricListeners()` --calls--> `enrollBiometric()`  [EXTRACTED]
  popup/modules/biometricSetup.js → src/biometric/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (60 total, 22 thin omitted)

### Community 0 - "Criptografia e armazenamento"
Cohesion: 0.06
Nodes (123): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), copyInBackground(), ensureOffscreen() (+115 more)

### Community 1 - "getStorage"
Cohesion: 0.09
Nodes (57): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+49 more)

### Community 2 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 5 - "Avaliação de palavras-passe"
Cohesion: 0.07
Nodes (34): avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower, includeNumbers (+26 more)

### Community 6 - "Interface e revisão visual"
Cohesion: 0.09
Nodes (33): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Version and repository footer, Advanced compatibility maintenance and local data, System light and dark theme controls (+25 more)

### Community 7 - "Edição do cofre"
Cohesion: 0.07
Nodes (26): setUnlockResolver(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection, createVaultIconButton(), currentMasterInput (+18 more)

### Community 8 - "Edição do cofre"
Cohesion: 0.29
Nodes (21): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), initToast(), showToast(), changeMasterPassword(), deleteCredential() (+13 more)

### Community 9 - "dataManagement.js"
Cohesion: 0.25
Nodes (20): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreRecord(), snapshotLabel(), attachManagementListeners() (+12 more)

### Community 10 - "Manifesto da extensão"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 11 - "Constantes e registos"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 12 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 13 - "client.js"
Cohesion: 0.20
Nodes (18): complete(), refresh(), requestId, send(), showError(), assert(), authenticateBiometric(), clientId (+10 more)

### Community 14 - "Navegação e validação Settings"
Cohesion: 0.13
Nodes (20): Journey scope and unconfigured OAuth, Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Exercised automated regression boundaries (+12 more)

### Community 15 - "Navegação e composição popup"
Cohesion: 0.24
Nodes (17): attachGeneratorListeners(), saveGeneratedToVault(), resolveUnlockSetup(), attachSettingsNavigation(), LEGACY_SECTIONS, saveTestedToVault(), attachUIListeners(), backFromSettings() (+9 more)

### Community 18 - "Criptografia e armazenamento"
Cohesion: 0.24
Nodes (8): alarms, areas, event(), failWhen(), fault, installChrome(), resetStorage(), content

### Community 19 - "Ferramentas de desenvolvimento"
Cohesion: 0.11
Nodes (8): errors, root, server, shadowClick(), find(), contexts, profiles, root

### Community 21 - "Settings UX implementation and evidence"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 23 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 24 - "Settings frontend review and refinement"
Cohesion: 0.13
Nodes (12): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Current approved hierarchical implementation scope, Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review (+4 more)

### Community 25 - "Quatro áreas das definições"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 26 - "modules/settings.js"
Cohesion: 0.26
Nodes (13): syncGeneratorControls(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel() (+5 more)

### Community 27 - "Ferramentas de desenvolvimento"
Cohesion: 0.14
Nodes (10): done, files(), graph, js, manifest, pkg, root, visit() (+2 more)

### Community 29 - "settings-browser.mjs"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 31 - "Ferramentas de desenvolvimento"
Cohesion: 0.24
Nodes (9): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, fake-indexeddb (+1 more)

### Community 32 - "Confirmação de autofill"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 33 - "Criptografia e armazenamento"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 34 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (7): scripts, check, package, test, test:browser, test:settings-browser, test:sync-browser

### Community 37 - "Captura do cofre"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 38 - "Operações do clipboard"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 40 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 41 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 42 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 43 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Visible Auto-lock vault slider displaying 15 minutes, Visible biometric setup card and collapsed About row beneath Change master password row and above Preferences saved feedback, Visible Clear copied passwords slider displaying After 30 seconds and best-effort copy-matching explanation, Dark settings screenshot with Security selected beside Appearance, Backups & recovery, and Advanced

### Community 44 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Visible auto-lock vault slider shows 15 minutes, Visible biometric unlock setup card with collapsed explanation, Security settings light screenshot, Appearance, Security, Backups & recovery, Advanced sidebar; Security selected

### Community 45 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 46 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Auto-lock vault slider, Set up biometric unlock action, Clear copied passwords slider, Security popup screenshot

### Community 48 - "Timestamped local version backup cards"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

### Community 49 - "Lista inicial de definições"
Cohesion: 0.67
Nodes (3): Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings popup home screenshot, Open in tab control

## Knowledge Gaps
- **94 isolated node(s):** `Historical frontend regression evidence and manual limits`, `Historical independent Impeccable review evidence`, `Historical hTML category ownership and dedicated settings styles`, `Historical accessible themes ranges and saving feedback`, `Historical settings disclosures unlock and focus corrections` (+89 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 451 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dated validation evidence and missing acceptance` connect `Navegação e validação Settings` to `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Settings frontend review and refinement`, `Quatro áreas das definições`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `Historical frontend regression evidence and manual limits`, `Historical independent Impeccable review evidence`, `Historical hTML category ownership and dedicated settings styles` to the rest of the system?**
  _94 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.06031468531468531 - nodes in this community are weakly interconnected._
- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Documentação de Sync e dados` to `Revisão funcional histórica`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Navegação e validação Settings`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `getStorage` be split into smaller, more focused modules?**
  _Cohesion score 0.09184149184149185 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Arquitetura documentada` to `Confirmação de autofill`, `Documentação de Sync e dados`, `Revisão funcional histórica`, `Documento offscreen`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Regras do repositório`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `Documentação de Sync e dados` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._