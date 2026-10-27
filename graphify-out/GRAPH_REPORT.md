# Graph Report - SecurePass  (2026-10-27)

## Corpus Check
- 175 files · ~84,777 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: .css 5, (none) 3)

## Summary
- 1384 nodes · 3195 edges · 111 communities (75 shown, 36 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db0bb3bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cryptoVault.js
- biometric/service.js
- session.js
- Criptografia e armazenamento
- Autofill na página
- biometric.test.js
- Documentação de Sync e dados
- Settings UX implementation and evidence
- tester.js
- Quatro áreas das definições
- vaultUnlock.js
- Evidência visual das definições
- Navegação e validação Settings
- Ferramentas de desenvolvimento
- checkpoints-browser.mjs
- Security settings area
- Four-area Settings revision
- Interface e revisão visual
- sync-browser.mjs
- checkpointReview.js
- recoveryDesign-browser.mjs
- Edição do cofre
- dataManagement.js
- RECOVERY_SURFACES.md
- Implementação e migração
- Ferramentas de desenvolvimento
- Ferramentas de desenvolvimento
- Checkpoint review interaction
- Captura do cofre
- REVIEW_BACKUP_ADVANCED.md
- 2026-10-25T22-07-51Z__popup-popup-html.md
- backupCrypto.js
- Modelo de segurança
- Settings UX — journeys, screens and acceptance map
- modules/settings.js
- Navegação e validação Settings
- backupDialogs-browser.mjs
- Navegação e composição popup
- Documentação de Sync e dados
- Checkpoint review interaction and scoped action authorization
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Ferramentas de desenvolvimento
- Arquitetura documentada
- Recovery checkpoints behavior, protection and verification
- Evidência visual das definições
- Evidência visual das definições
- Quatro áreas das definições
- Análise de formulários
- biometric/service.js
- Timestamped local version backup cards
- Ícone 128 pixels
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- popup.js
- Revisão funcional histórica
- Management inline checkpoint review in dark theme
- Popup inline checkpoint review in dark theme
- Popup inline checkpoint review in light theme
- Dark management checkpoint cards with one Review action
- Light management checkpoint cards with one Review action
- Dark popup checkpoint card with one Review action
- Short account-specific deleted-entry confirmation
- Separate whole-vault restore confirmation from inline review
- Recovery-surface presentation and unlock-controller refinement
- Light popup checkpoint card with one Review action
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
- Recovery checkpoints
- Popup HTML semantic surfaces
- Light popup bounded deleted-entry recovery confirmation
- Light tab bounded deleted-entry recovery confirmation
- Light popup bounded whole-vault restore confirmation
- Light popup compact checkpoint comparison
- Dark popup bounded vault unlock with biometric alternative
- Dark popup bounded vault unlock with inline error
- Light popup bounded vault unlock with inline error
- Light tab bounded vault unlock with inline error
- Light popup bounded vault unlock
- Light tab bounded vault unlock
- Settings category links and labelled navigation
- Security settings area
- Dark popup bounded whole-vault restore confirmation
- Light tab bounded whole-vault restore confirmation
- Dark popup compact checkpoint comparison
- Light tab compact checkpoint comparison
- Dark popup bounded deleted-entry recovery confirmation

## God Nodes (most connected - your core abstractions)
1. `Comprehensive recommended v2 settings Sync devices and data plan` - 66 edges
2. `getStorage()` - 56 edges
3. `Current architecture with implemented local and legacy increment` - 53 edges
4. `removeStorage()` - 49 edges
5. `showToast()` - 44 edges
6. `Historical review of commit 5aed51c` - 44 edges
7. `Proposed P6 migration and acceptance` - 42 edges
8. `Original SD review with later local increment notice` - 42 edges
9. `setStorage()` - 37 edges
10. `withVaultOperation()` - 37 edges

## Surprising Connections (you probably didn't know these)
- `Atomic live/history rekey without adding a content checkpoint` --references--> `rotateMasterPassword()`  [EXTRACTED]
  docs/CHECKPOINTS.md → src/cryptoVault.js
- `Per-entry recovery through inline review and explicit confirmation` --references--> `recoverCheckpoint()`  [EXTRACTED]
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

## Communities (111 total, 36 thin omitted)

### Community 0 - "cryptoVault.js"
Cohesion: 0.07
Nodes (123): decryptBackupPayload(), isEncryptedBackupEnvelope(), changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault() (+115 more)

### Community 1 - "biometric/service.js"
Cohesion: 0.10
Nodes (59): clearCandidates(), dismissCandidate(), listCandidates(), proposeCandidate(), reviewCandidate(), assertDocument(), cancelRequest(), clearRequests() (+51 more)

### Community 12 - "session.js"
Cohesion: 0.19
Nodes (29): account(), attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), accessibleDestination() (+21 more)

### Community 13 - "Criptografia e armazenamento"
Cohesion: 0.11
Nodes (21): format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), redactValue(), safeSerialize(), _serialize(), ALARM_NAME (+13 more)

### Community 14 - "Autofill na página"
Cohesion: 0.18
Nodes (16): attachButton(), element(), initAutofill(), showSaveSuggestion(), setFieldValue(), visibleField(), request(), initThemeSync() (+8 more)

### Community 16 - "biometric.test.js"
Cohesion: 0.07
Nodes (39): copyInBackground(), ensureOffscreen(), checkPassword(), clearHibpCache(), hibpCacheStatus(), range(), generatePassword(), randomIndex() (+31 more)

### Community 17 - "Documentação de Sync e dados"
Cohesion: 0.16
Nodes (21): complete(), refresh(), send(), showError(), deriveBackupKey(), encryptBackupPayload(), assert(), enrollBiometric() (+13 more)

### Community 19 - "Settings UX implementation and evidence"
Cohesion: 0.20
Nodes (5): shadowClick(), find(), errors, root, server

### Community 2 - "tester.js"
Cohesion: 0.08
Nodes (39): attachGeneratorListeners(), handleGenerate(), saveGeneratedToVault(), setLoading(), attachTesterListeners(), mapScoreToColor(), saveTestedToVault(), scoreToBadge() (+31 more)

### Community 25 - "Quatro áreas das definições"
Cohesion: 0.14
Nodes (10): files(), visit(), done, graph, js, manifest, pkg, root (+2 more)

### Community 27 - "vaultUnlock.js"
Cohesion: 0.27
Nodes (17): resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus(), openModal() (+9 more)

### Community 29 - "Evidência visual das definições"
Cohesion: 0.29
Nodes (12): syncGeneratorControls(), attachSettingsListeners(), initialiseSettings(), scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+4 more)

### Community 31 - "Navegação e validação Settings"
Cohesion: 0.20
Nodes (6): cancel(), idle(), ./modules/operationDialog.js, captures, errors, root

### Community 32 - "Ferramentas de desenvolvimento"
Cohesion: 0.20
Nodes (4): layouts(), section(), errors, root

### Community 40 - "checkpoints-browser.mjs"
Cohesion: 0.20
Nodes (3): captures, errors, root

### Community 45 - "Security settings area"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), write(), serial

### Community 6 - "Interface e revisão visual"
Cohesion: 0.11
Nodes (36): showToast(), clearRevealTimer(), createVaultIconButton(), deleteCredential(), handleCreateMaster(), handleEntrySubmit(), handleUnlock(), lockVault() (+28 more)

### Community 77 - "sync-browser.mjs"
Cohesion: 0.25
Nodes (3): contexts, profiles, root

### Community 79 - "checkpointReview.js"
Cohesion: 0.29
Nodes (20): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), closeReview(), date(), entryCount(), freshPreview() (+12 more)

### Community 81 - "recoveryDesign-browser.mjs"
Cohesion: 0.18
Nodes (6): test:recovery-ui-browser, captures, errors, root, Recovery-surface checks recorded in validation evidence, Dedicated recovery UI browser command

### Community 9 - "Edição do cofre"
Cohesion: 0.28
Nodes (14): attachBiometricListeners(), syncBiometricView(), refreshCandidates(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation(), initToast(), refreshState() (+6 more)

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

### Community 38 - "Checkpoint review interaction"
Cohesion: 0.22
Nodes (7): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review flow, Verification, 100 tests, 83 modules and three UI browser suites for review refinement

### Community 39 - "Captura do cofre"
Cohesion: 0.22
Nodes (9): scripts, check, package, test, test:backup-dialogs-browser, test:browser, test:checkpoints-browser, test:settings-browser (+1 more)

### Community 46 - "REVIEW_BACKUP_ADVANCED.md"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 83 - "2026-10-25T22-07-51Z__popup-popup-html.md"
Cohesion: 0.29
Nodes (6): Reproduced cache status layout defect, Recovery discovery and terminology concerns, Historical navigation and dialog recommendations, Readable cache row layout correction, Visual critique and accessibility limits, Breach-check cache management

### Community 15 - "backupCrypto.js"
Cohesion: 0.08
Nodes (28): Journey scope and unconfigured OAuth, Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior (+20 more)

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

### Community 30 - "Checkpoint review interaction and scoped action authorization"
Cohesion: 0.15
Nodes (13): Read-only comparison discards its token; actions acquire fresh scoped tokens, Back, Escape, lock and navigation preserve context or clear private state, Short entry-specific confirmation replaces entry-selection dropdown, Successful recovery refreshes or returns to retained checkpoint list, One primary Review checkpoint action per local card, Checkpoint review interaction and scoped action authorization, Full restore is secondary at the comparison bottom, Stale comparison disables actions and offers Refresh comparison (+5 more)

### Community 34 - "Confirmação de autofill"
Cohesion: 0.20
Nodes (7): Historical frontend regression evidence and manual limits, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical accessible themes ranges and saving feedback, Historical settings disclosures unlock and focus corrections, Historical six-category navigation, Historical six-category frontend review

### Community 36 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (7): Explicit account selection section, Authenticator unlock button, Cancel confirmation button, Extension-owned secure confirmation page, Confirm save or update button, auth.js module bootstrap, Master password unlock form

### Community 41 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.04
Nodes (48): Secondary full-restore review preserves current authentication, Recovery checkpoints behavior, protection and verification, Archived Sync copies stay separate and exports are source-specific, Content recovery preserves existing master password and biometric setup, Existing-vault external and selected-remote restores preserve active authentication, Remove one checkpoint or verify current password to clear local history, Searchable fifty-row comparison with bounded full-restore examples, Current checkpoint review refines presentation while preserving recovery semantics (+40 more)

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

### Community 7 - "popup.js"
Cohesion: 0.06
Nodes (35): Clear secrets and revoke the exact grant on leaving the inline flow, Fresh identity confirmation replaces preliminary unlock and modal, New master password and confirmation with inline errors, Management footer aligned with the content column, Two-minute single-use revision-bound password-change grant, Pre-save biometric revocation notice and optional setup again, Tab stylesheet separates desktop layout from compact popup presentation, Ordinary biometric unlock cannot become a password-change grant (+27 more)

### Community 8 - "Revisão funcional histórica"
Cohesion: 0.08
Nodes (20): Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade, Contribuições e licença MIT, Cofre cifrado com Web Crypto (+12 more)

### Community 82 - "Management inline checkpoint review in dark theme"
Cohesion: 0.29
Nodes (7): Changed account offers Restore saved details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 85 - "Popup inline checkpoint review in dark theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Account rows offer a specific Recover entry action, Popup inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 86 - "Popup inline checkpoint review in light theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Account rows offer a specific Recover entry action, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 87 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence, entry counts and changed-account example, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 88 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence, entry counts and changed-account example, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 89 - "Dark popup checkpoint card with one Review action"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header, Open in tab and fixed version/GitHub footer remain visible, Dark popup checkpoint card with one Review action

### Community 90 - "Short account-specific deleted-entry confirmation"
Cohesion: 0.50
Nodes (4): Website, username and Add this deleted entry identify the action, Cancel and Recover entry without an account dropdown, Copy preserves other entries, current master password/biometrics and existing Sync mode, Short account-specific deleted-entry confirmation

### Community 91 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore whole vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Checkpoint date, saved-entry/recovery/older-detail/removal counts

### Community 92 - "Recovery-surface presentation and unlock-controller refinement"
Cohesion: 0.14
Nodes (14): Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, 85 modules and four browser suites; Node evidence remains historical, Full restore confirms only restored total and removals, Cancel, Unlock and icon-only fingerprint share one action row, Same dimmed and 2px-blurred extension context under unlock and recovery, Smaller cards and a shared contextual dimmed backdrop, Compact recovery presentation and consistent fingerprint entry points (+6 more)

### Community 98 - "Light popup checkpoint card with one Review action"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header, Open in tab and fixed version/GitHub footer remain visible, Light popup checkpoint card with one Review action

### Community 93 - "Recovery checkpoints"
Cohesion: 0.22
Nodes (7): Behavior and presentation, Encryption and rotation, Evidence, Recovery checkpoints, Recovery integrity, Recovery checkpoints, Verification

### Community 10 - "Popup HTML semantic surfaces"
Cohesion: 0.10
Nodes (29): Compact vault unlock card with biometric shortcut beside password, Compact unlock password and optional biometric method row, Accessible fingerprint-only shortcut beside password, Popup toast live status, Backups, checkpoint cards and inline review settings area, Scoped entry clearing and local device erasure, Vault create unlock and management states, Legacy Chrome Sync controls (+21 more)

### Community 100 - "Light popup bounded deleted-entry recovery confirmation"
Cohesion: 0.40
Nodes (5): Short one-entry and checkpoint/Sync effects, Website and Account identify the one entry to recover, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Recover entry remain in the footer, Light popup bounded deleted-entry recovery confirmation

### Community 101 - "Light tab bounded deleted-entry recovery confirmation"
Cohesion: 0.40
Nodes (5): Short one-entry and checkpoint/Sync effects, Website and Account identify the one entry to recover, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Recover entry remain in the footer, Light tab bounded deleted-entry recovery confirmation

### Community 102 - "Light popup bounded whole-vault restore confirmation"
Cohesion: 0.33
Nodes (6): Short checkpoint and Sync effects notice, Restore total and To remove counts only, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Restore vault remain visible in a compact footer, Short current-password and biometric preservation statement, Light popup bounded whole-vault restore confirmation

### Community 103 - "Light popup compact checkpoint comparison"
Cohesion: 0.50
Nodes (4): Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field

### Community 104 - "Dark popup bounded vault unlock with biometric alternative"
Cohesion: 0.40
Nodes (5): Fingerprint-only shortcut beside password, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with biometric alternative

### Community 105 - "Dark popup bounded vault unlock with inline error"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with inline error

### Community 106 - "Light popup bounded vault unlock with inline error"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock with inline error

### Community 107 - "Light tab bounded vault unlock with inline error"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock with inline error

### Community 108 - "Light popup bounded vault unlock"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock

### Community 109 - "Light tab bounded vault unlock"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 80 - "Settings category links and labelled navigation"
Cohesion: 0.33
Nodes (6): Stale review warning and refresh action, Compact in-section checkpoint comparison, Checkpoint cards and inline review with separate archived copies, Recovery checkpoints heading, Clear history and local/archive inventory, Secondary whole-checkpoint review with preserved authentication copy, Accessible compact comparison search and matching controls

### Community 84 - "Security settings area"
Cohesion: 0.29
Nodes (7): Inline identity form with biometric shortcut beside current password, Security settings area, Inline master-password identity, new-password and success forms, New-password confirmation with biometric revocation warning, Ownership-aware clipboard timeout explanation, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points

### Community 94 - "Dark popup bounded whole-vault restore confirmation"
Cohesion: 0.33
Nodes (6): Short checkpoint and Sync effects notice, Restore total and To remove counts only, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Restore vault remain visible in a compact footer, Short current-password and biometric preservation statement, Dark popup bounded whole-vault restore confirmation

### Community 95 - "Light tab bounded whole-vault restore confirmation"
Cohesion: 0.33
Nodes (6): Short checkpoint and Sync effects notice, Restore total and To remove counts only, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Restore vault remain visible in a compact footer, Short current-password and biometric preservation statement, Light tab bounded whole-vault restore confirmation

### Community 96 - "Dark popup compact checkpoint comparison"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Dark popup compact checkpoint comparison, Search website or username field

### Community 97 - "Light tab compact checkpoint comparison"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light tab compact checkpoint comparison, Search website or username field

### Community 99 - "Dark popup bounded deleted-entry recovery confirmation"
Cohesion: 0.40
Nodes (5): Short one-entry and checkpoint/Sync effects, Website and Account identify the one entry to recover, Actual extension visible under a shared dimmed blurred backdrop, Cancel and Recover entry remain in the footer, Dark popup bounded deleted-entry recovery confirmation

## Knowledge Gaps
- **295 isolated node(s):** `Independent management-tab layout with shared trusted pathname`, `Local workflow acceptance requirements`, `Historical approved four-area revision on main`, `Historical frontend cleanup follow-up`, `Historical four-area executed validation and limits` (+290 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 683 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `biometric/service.js` to `cryptoVault.js`, `Ferramentas de desenvolvimento`, `Documentação de Sync e dados`, `Ferramentas de desenvolvimento`, `Arquitetura documentada`, `Revisão funcional histórica`, `REVIEW_BACKUP_ADVANCED.md`, `Evidência visual das definições`, `backupCrypto.js`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `Navegação e validação Settings`, `Recovery-surface presentation and unlock-controller refinement`, `Checkpoint review interaction and scoped action authorization`?**
  _High betweenness centrality (0.278) - this node is a cross-community bridge._
- **What connects `Independent management-tab layout with shared trusted pathname`, `Local workflow acceptance requirements`, `Historical approved four-area revision on main` to the rest of the system?**
  _295 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cryptoVault.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06717444197609225 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Checkpoint review interaction and scoped action authorization` to `cryptoVault.js`, `Recovery checkpoints behavior, protection and verification`, `biometric/service.js`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Should `biometric/service.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09676044330775789 - nodes in this community are weakly interconnected._
- **Why does `Dated validation evidence and missing acceptance` connect `backupCrypto.js` to `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Documentação de Sync e dados`, `popup.js`, `Revisão funcional histórica`, `Recovery checkpoints behavior, protection and verification`, `REVIEW_BACKUP_ADVANCED.md`, `Recovery-surface presentation and unlock-controller refinement`, `Documentação de Sync e dados`, `Modelo de segurança`, `Settings UX — journeys, screens and acceptance map`, `modules/settings.js`, `Navegação e validação Settings`, `Implementação e migração`, `Navegação e composição popup`, `Checkpoint review interaction and scoped action authorization`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Should `Criptografia e armazenamento` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
Semantic maintenance is scoped to the authentication method row and 18 recovery UI captures. Token counters are placeholders; semantic extraction cost was not measured. Existing community assignments and names are preserved.
