# Graph Report - SecurePass  (2026-10-25)

## Corpus Check
- 100 files · ~60,757 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .css 2)

## Summary
- 922 nodes · 2238 edges · 58 communities (33 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.85)
- Token cost: host-agent semantic usage is not exposed; zero placeholders are not measured cost.

## Graph Freshness
- Built from commit: `e97f4c65`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Criptografia e armazenamento
- Autorização e pedidos autofill
- Documentação de Sync e dados
- Revisão funcional histórica
- Arquitetura documentada
- dataManagement.js
- Edição do cofre
- Ferramentas de desenvolvimento
- Edição do cofre
- Manifesto da extensão
- Constantes e registos
- Autofill na página
- Autenticação WebAuthn
- Avaliação de palavras-passe
- Interface do popup
- Funcionalidades documentadas
- Documentação de Sync e dados
- Settings UX implementation and evidence
- Avaliação de palavras-passe
- Navegação e diálogos
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- Validação e aceitação
- Implementação e migração
- Regras do repositório
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- settings-browser.mjs
- Captura de configurações
- Ferramentas de desenvolvimento
- Captura de recuperação
- Ferramentas de desenvolvimento
- Captura do cofre
- Settings e percursos de dados
- Settings e percursos de dados
- Settings e percursos de dados
- Operações do clipboard
- Settings e percursos de dados
- modules/settings.js
- ref_node_fs
- Documento offscreen
- Implementação e migração
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
9. `showToast()` - 31 edges
10. `loadSettings()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Extension-owned secure confirmation page` --semantically_similar_to--> `Origin and document bound autofill`  [INFERRED] [semantically similar]
  auth/auth.html → ARCHITECTURE.md
- `initialise()` --indirect_call--> `changeMasterPassword()`  [INFERRED]
  popup/popup.js → src/cryptoVault.js
- `attachGeneratorListeners()` --calls--> `copyToClipboard()`  [EXTRACTED]
  popup/modules/generator.js → src/utils/clipboard.js
- `renderEntries()` --calls--> `copyToClipboard()`  [EXTRACTED]
  popup/modules/vault.js → src/utils/clipboard.js
- `attachBiometricListeners()` --calls--> `authenticateBiometric()`  [EXTRACTED]
  popup/modules/biometricSetup.js → src/biometric/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trusted autofill disclosure boundary** — architecture_capability_policy, architecture_autofill_confirmation, architecture_storage_restriction [EXTRACTED 1.00]
- **Disposable browser validation boundaries** — docs_validation_chromium, docs_validation_virtual_prf, docs_validation_two_profile_sync [EXTRACTED 1.00]

## Communities (58 total, 25 thin omitted)

### Community 0 - "Criptografia e armazenamento"
Cohesion: 0.06
Nodes (122): DECODER, decryptBackupPayload(), deriveBackupKey(), ENCODER, encryptBackupPayload(), isEncryptedBackupEnvelope(), copyInBackground(), ensureOffscreen() (+114 more)

### Community 1 - "Autorização e pedidos autofill"
Cohesion: 0.09
Nodes (58): handlers, ready, clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument() (+50 more)

### Community 2 - "Documentação de Sync e dados"
Cohesion: 0.05
Nodes (8): Comprehensive recommended v2 settings Sync devices and data plan, Chrome Identity, Chrome Storage, Drive appDataFolder, Drive errors, OWASP Cryptographic Storage, Web Crypto AES-GCM parameters, MV3 service worker lifecycle

### Community 5 - "dataManagement.js"
Cohesion: 0.19
Nodes (25): accessibleDestination(), attachDataListeners(), downloadJSON(), importFile(), password(), restoreRecord(), snapshotLabel(), attachManagementListeners() (+17 more)

### Community 6 - "Edição do cofre"
Cohesion: 0.07
Nodes (27): resolveUnlockSetup(), setUnlockResolver(), biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, confirmNextMasterInput, createMasterSection, createVaultIconButton() (+19 more)

### Community 7 - "Ferramentas de desenvolvimento"
Cohesion: 0.16
Nodes (16): fake-indexeddb, assertion(), b64(), client(), der(), registration(), request(), sender (+8 more)

### Community 8 - "Edição do cofre"
Cohesion: 0.27
Nodes (21): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), sendMessage(), showToast(), changeMasterPassword(), deleteCredential(), ensureVaultAccessible() (+13 more)

### Community 9 - "Manifesto da extensão"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 10 - "Constantes e registos"
Cohesion: 0.11
Nodes (21): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, LOG_ENABLED, META_KEY (+13 more)

### Community 11 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), entry, element(), initAutofill(), pending, showSaveSuggestion(), submitted, tracked (+8 more)

### Community 12 - "Autenticação WebAuthn"
Cohesion: 0.20
Nodes (18): complete(), refresh(), requestId, send(), showError(), assert(), authenticateBiometric(), clientId (+10 more)

### Community 13 - "Avaliação de palavras-passe"
Cohesion: 0.13
Nodes (19): attachTesterListeners(), copyTestPasswordBtn, crackTimeEl, entropyEl, hibpButton, hibpStatus, mapScoreToColor(), passwordInput (+11 more)

### Community 14 - "Interface do popup"
Cohesion: 0.10
Nodes (16): System light and dark theme controls, Local PRF enrollment and local wrapper removal controls, Ownership-aware clipboard timeout explanation, Backup import export reset and clear controls, Labelled credential editor dialog, Password generator tab and constraint controls, Explicit breach request and manageable HIBP cache, Current new and confirmation master password dialog (+8 more)

### Community 18 - "Settings UX implementation and evidence"
Cohesion: 0.15
Nodes (6): Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 19 - "Avaliação de palavras-passe"
Cohesion: 0.12
Nodes (16): avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower, includeNumbers (+8 more)

### Community 20 - "Navegação e diálogos"
Cohesion: 0.35
Nodes (14): attachGeneratorListeners(), saveGeneratedToVault(), saveTestedToVault(), attachUIListeners(), closeModal(), closeSettingsPanel(), detectActiveOrigin(), manageFocus() (+6 more)

### Community 22 - "Settings UX — journeys, screens and acceptance map"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 26 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (8): done, files(), graph, js, manifest, pkg, root, visit()

### Community 27 - "Confirmação de autofill"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 28 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (8): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, name, private, type, version, playwright

### Community 29 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (5): errors, root, server, shadowClick(), find()

### Community 31 - "Captura de configurações"
Cohesion: 0.32
Nodes (8): WebAuthn PRF biometric unlock, Chrome Sync encrypted vault, Master password fallback, No device-local bypass key, Refresh remote versions, Biometric and Sync settings screenshot, Unlock after storage mode change, Unlock to publish or resolve versions

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 33 - "Captura de recuperação"
Cohesion: 0.29
Nodes (7): Clear archived Sync versions, Erase this device, Export recovery archive, Encrypted recovery snapshots, Restore a local snapshot, Recovery settings screenshot, Unlock after storage mode change

### Community 34 - "Ferramentas de desenvolvimento"
Cohesion: 0.29
Nodes (7): scripts, check, package, test, test:browser, test:settings-browser, test:sync-browser

### Community 37 - "Captura do cofre"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 38 - "Settings e percursos de dados"
Cohesion: 0.33
Nodes (6): Export Vault encrypted JSON and Import Vault review or restore controls, Google Drive setup pending; connection button disabled and no account connected, Dark Settings & data management screenshot, Sync off with Check existing Chrome Sync copies and existing-version controls, Snapshot restored locally; Sync is off toast, Local unlocked vault summary with Lock vault and disabled Export backup

### Community 39 - "Settings e percursos de dados"
Cohesion: 0.33
Nodes (6): Google Drive setup pending: connection awaits Google authorization and device security; no Google account connected, Existing Chrome Sync copies: explicit inspection of old remote versions while automatic Sync is off, Backup actions: encrypted JSON export with separate backup password; import to review or restore into a new vault, Notification: snapshot restored locally; Sync is off, Local vault summary: saved on this device, unlocked, Lock vault and Export backup actions, Light settings and data screen: vault summary above two columns for Sync and Backups & Data

### Community 40 - "Settings e percursos de dados"
Cohesion: 0.33
Nodes (6): Google Drive Setup pending with no account connected and partially visible disabled connection control, Settings & data compact popup overview, Your vault, under your control: saved on this device and unlocked, Open management control in popup header, Sync, Backups, Recovery and Security navigation, Lock vault and Export backup controls

### Community 41 - "Operações do clipboard"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 42 - "Settings e percursos de dados"
Cohesion: 0.50
Nodes (5): Erase only this device: centered dark confirmation dialog with Cancel and Erase this device actions, Verification selects Erase without unlocking (irreversible), requiring typed ERASE THIS DEVICE confirmation, Dialog states deletion of local vault, snapshots, biometric setup and preferences; remote copies remain, Settings management screen remains dimmed and blurred behind the erasure dialog, Typed confirmation is wrong; inline red error requests ERASE THIS DEVICE to erase local data without unlocking

### Community 43 - "modules/settings.js"
Cohesion: 0.70
Nodes (4): applyTheme(), resolveTheme(), systemPrefersDark(), watchSystemTheme()

### Community 46 - "Implementação e migração"
Cohesion: 0.83
Nodes (3): Acceptance, Local issue — Settings, Sync and Data Management journeys, Scope

## Knowledge Gaps
- **70 isolated node(s):** `Explicit account selection section`, `Authenticator unlock button`, `Cancel confirmation button`, `Confirm save or update button`, `auth.js module bootstrap` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 438 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Comprehensive recommended v2 settings Sync devices and data plan` connect `Documentação de Sync e dados` to `Revisão funcional histórica`, `Arquitetura documentada`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Validação e aceitação`, `Implementação e migração`, `Regras do repositório`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `Explicit account selection section`, `Authenticator unlock button`, `Cancel confirmation button` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.061164187924751305 - nodes in this community are weakly interconnected._
- **Why does `Current architecture with implemented local and legacy increment` connect `Arquitetura documentada` to `Documentação de Sync e dados`, `Revisão funcional histórica`, `Documento offscreen`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Settings UX implementation and evidence`, `Settings UX — journeys, screens and acceptance map`, `Regras do repositório`, `Confirmação de autofill`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `Autorização e pedidos autofill` be split into smaller, more focused modules?**
  _Cohesion score 0.08864767073722297 - nodes in this community are weakly interconnected._
- **Why does `Historical review of commit 5aed51c` connect `Revisão funcional histórica` to `Documentação de Sync e dados`, `Arquitetura documentada`, `Funcionalidades documentadas`, `Documentação de Sync e dados`, `Implementação e migração`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `Documentação de Sync e dados` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._