# Graph Report - SecurePass  (2026-10-25)

## Corpus Check
- 108 files · ~65,524 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .css 3)

## Summary
- 989 nodes · 2392 edges · 63 communities (40 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: semantic usage unavailable; collaboration tools do not expose token counts. Numeric extraction zeros are schema placeholders, not measured usage.

## Graph Freshness
- Includes the current working-tree shared Settings footer, browser checks, documentation and screenshots; compare working-tree changes as well as the commit.
- Built from commit: `252b6728`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Criptografia e armazenamento
- getStorage
- Avaliação de palavras-passe
- Documentação de Sync e dados
- Revisão funcional histórica
- Arquitetura documentada
- Interface e revisão visual
- Edição do cofre
- Criptografia e armazenamento
- Manifesto da extensão
- Edição do cofre
- dataManagement.js
- Autofill na página
- client.js
- Funcionalidades documentadas
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- modules/settings.js
- Navegação e composição popup
- Navegação e validação Settings
- Evidência visual das definições
- Implementação e migração
- Constantes e registos
- Quatro áreas das definições
- settings-browser.mjs
- Regras do repositório
- Evidência visual das definições
- Settings frontend review and refinement
- Navegação e validação Settings
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Captura do cofre
- Operações do clipboard
- Settings frontend review and refinement
- Ferramentas de desenvolvimento
- Documento offscreen
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- Timestamped local version backup cards
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
- `Shared Settings footer across navigation layouts` --conceptually_related_to--> `Shared Settings footer`  [INFERRED]
  docs/SETTINGS_NAVIGATION.md → popup/popup.html
- `ready` --calls--> `removeStorage()`  [EXTRACTED]
  background/serviceWorker.js → src/utils/storage.js
- `attachBiometricListeners()` --calls--> `authenticateBiometric()`  [EXTRACTED]
  popup/modules/biometricSetup.js → src/biometric/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]

## Communities (63 total, 23 thin omitted)

### Community 0 - "Criptografia e armazenamento"
Cohesion: 0.05
Nodes (132): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), copyInBackground(), ensureOffscreen() (+124 more)

### Community 1 - "getStorage"
Cohesion: 0.09
Nodes (59): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+51 more)

### Community 2 - "Avaliação de palavras-passe"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+31 more)

### Community 3 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 6 - "Interface e revisão visual"
Cohesion: 0.09
Nodes (35): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Version and repository footer, Advanced compatibility maintenance and local data, System light and dark theme controls (+27 more)

### Community 7 - "Edição do cofre"
Cohesion: 0.07
Nodes (27): setUnlockResolver(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection, createVaultIconButton(), currentMasterInput (+19 more)

### Community 8 - "Criptografia e armazenamento"
Cohesion: 0.16
Nodes (16): fake-indexeddb, assertion(), b64(), client(), der(), registration(), request(), sender (+8 more)

### Community 9 - "Manifesto da extensão"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 10 - "Edição do cofre"
Cohesion: 0.28
Nodes (19): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), showToast(), changeMasterPassword(), deleteCredential(), handleCreateMaster() (+11 more)

### Community 11 - "dataManagement.js"
Cohesion: 0.27
Nodes (19): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreRecord(), snapshotLabel(), attachManagementListeners() (+11 more)

### Community 12 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 13 - "client.js"
Cohesion: 0.20
Nodes (18): complete(), refresh(), requestId, send(), showError(), assert(), authenticateBiometric(), clientId (+10 more)

### Community 17 - "Settings UX implementation and evidence"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 19 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 20 - "modules/settings.js"
Cohesion: 0.28
Nodes (14): syncGeneratorControls(), attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel() (+6 more)

### Community 21 - "Navegação e composição popup"
Cohesion: 0.31
Nodes (12): resolveUnlockSetup(), attachSettingsNavigation(), LEGACY_SECTIONS, attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+4 more)

### Community 22 - "Navegação e validação Settings"
Cohesion: 0.16
Nodes (14): Journey scope and unconfigured OAuth, Exercised automated regression boundaries, Earlier settings/data increment evidence, Dated validation evidence and missing acceptance, Previous four-area Settings validation, Previous Settings frontend validation, Separate hardware and platform distribution checks, Historical implementation evidence (+6 more)

### Community 23 - "Evidência visual das definições"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 25 - "Constantes e registos"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 26 - "Quatro áreas das definições"
Cohesion: 0.18
Nodes (10): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Historical General inventory, Historical four-tab navigation, Security control inventory (+2 more)

### Community 27 - "settings-browser.mjs"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

### Community 29 - "Evidência visual das definições"
Cohesion: 0.20
Nodes (10): Visible auto-lock vault slider shows 15 minutes, Visible biometric unlock setup card with collapsed explanation, Visible copied-password clearing slider shows After 30 seconds; best effort matching the last SecurePass copy, Visible GitHub footer link, Visible Change master password row asks to authenticate and choose a new vault password, Visible footer product version SecurePass v0.2.0, Visible Preferences saved status below product version, Security settings light screenshot (+2 more)

### Community 30 - "Settings frontend review and refinement"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 31 - "Navegação e validação Settings"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (5): errors, root, server, shadowClick(), find()

### Community 33 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): done, files(), graph, js, manifest, pkg, root, visit()

### Community 34 - "Confirmação de autofill"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 35 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (3): contexts, profiles, root

### Community 37 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (7): scripts, check, package, test, test:browser, test:settings-browser, test:sync-browser

### Community 40 - "Captura do cofre"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 41 - "Operações do clipboard"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 42 - "Settings frontend review and refinement"
Cohesion: 0.40
Nodes (5): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Current approved hierarchical implementation scope

### Community 45 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 46 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 47 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 48 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Visible Auto-lock vault slider displaying 15 minutes, Visible biometric setup card and collapsed About row beneath Change master password row and above Preferences saved feedback, Visible Clear copied passwords slider displaying After 30 seconds and best-effort copy-matching explanation, Dark settings screenshot with Security selected beside Appearance, Backups & recovery, and Advanced

### Community 49 - "Evidência visual das definições"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 50 - "Quatro áreas das definições"
Cohesion: 0.50
Nodes (4): Executed validation, Four-area Settings revision, Implemented interface, Working behavior and state

### Community 52 - "Timestamped local version backup cards"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

## Knowledge Gaps
- **102 isolated node(s):** `Historical implementation evidence`, `Earlier settings/data increment evidence`, `Exercised automated regression boundaries`, `Previous Settings frontend validation`, `Virtual WebAuthn PRF browser coverage` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 459 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dated validation evidence and missing acceptance` connect `Navegação e validação Settings` to `Documentação de Sync e dados`, `Settings frontend review and refinement`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Implementação e migração`, `Quatro áreas das definições`, `Regras do repositório`, `Settings frontend review and refinement`, `Navegação e validação Settings`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `Historical implementation evidence`, `Earlier settings/data increment evidence`, `Exercised automated regression boundaries` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.052117816823699176 - nodes in this community are weakly interconnected._
- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Documentação de Sync e dados` to `Revisão funcional histórica`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Navegação e validação Settings`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `getStorage` be split into smaller, more focused modules?**
  _Cohesion score 0.0913081650570676 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Arquitetura documentada` to `Confirmação de autofill`, `Documentação de Sync e dados`, `Revisão funcional histórica`, `Documento offscreen`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Regras do repositório`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `Avaliação de palavras-passe` be split into smaller, more focused modules?**
  _Cohesion score 0.0753045404208195 - nodes in this community are weakly interconnected._