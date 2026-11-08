# Graph Report - SecurePass  (2026-11-08)

## Corpus Check
- 308 files · ~161,426 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 6, (none) 3)

## Summary
- 2303 nodes · 5481 edges · 166 communities (119 shown, 47 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 108 edges (avg confidence: 0.85)
- Token cost: host extraction usage unavailable; no separate semantic API used.

## Graph Freshness
- Built from commit: `2e2ce4d1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- syncService.js
- crypto.js
- Interface e revisão visual
- Recovery checkpoints behavior, protection and verification
- Original SD review with later local increment notice
- biometric/service.js
- ref_node_assert
- requests.js
- popup.js
- Contextual on-page key
- Current architecture with implemented local and legacy increment
- checkpointReview.js
- Documentação de Sync e dados
- Checkpoint review design document
- session.js
- vault.js
- Inline master-password flow and independent management proportions
- utilHandlers.js
- vaultHandlers.js
- README de apresentação em português
- Autofill na página
- scripts
- logger.js
- Contextual on-page key contract
- checkpointReview.js
- checkpoints-browser.mjs
- Modelo de segurança
- Popup HTML semantic surfaces
- vault/driveReview.js
- requests.js
- ref_node_crypto
- recoveryArchive.js
- Implementation checklist: partial implementation, release not accepted
- Checkpoint review interaction
- SETTINGS_UX_IMPLEMENTATION.md
- accountPrompts-browser.mjs
- Drive-copy review scoped design record
- modules/driveReview.js
- Guided Chrome Sync setup and receipt evidence contract
- selector.js
- Security model and open risks
- SETTINGS_UX_DESIGN.md
- package.json
- Three-way planner checklist records delivered internal planning and guarded review
- vaultUnlock.js
- Internal authenticated Drive-history retrieval contract and evidence
- storage.js
- IMPLEMENTATION_CHECKLIST.md
- Encrypted vault-state v1 payload and local migration contract
- popup.js
- Management inline checkpoint review in dark theme
- Implementation tracking with consolidated current and historical status
- biometric.test.js
- Implemented extension-origin anchored account selector with two-account pagination and username search
- Internal common-base three-way merge issue and acceptance scope
- Purpose-bound inline master-password authorization
- Ferramentas de desenvolvimento
- Confirmação de autofill
- Settings category links and labelled navigation
- Internal domain-separated ECDSA P-256 administrative authorization chains
- cryptoVault.js
- Ferramentas de desenvolvimento
- Popup HTML semantic surfaces
- Checklist de implementação e aceitação
- drive.js
- Guided recovery export batches issue SC40 SD07
- Account suggestions, inline tools and trusted-window confirmation contract
- Ferramentas de desenvolvimento
- Light management checkpoint cards with one Review action
- ref_node_fs
- Recovery-surface presentation and unlock-controller refinement
- Compact recovery presentation and consistent fingerprint entry points
- popup.js
- Guided Chrome Sync setup and device verification
- Saved version changed after review
- Popup HTML semantic surfaces
- Dark narrow saved-version export dialog: saved version 1 of 3
- Bounded recovery archive reader contract
- Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy
- Ícone 16 pixels
- Ícone 32 pixels
- Ícone 48 pixels
- Entrada do content script
- Documentação de Sync e dados
- Light narrow saved-version export dialog
- Dark credential selector with many logins
- export dark 400 extension dialog screenshot
- export error dark extension dialog screenshot
- export light 320 extension dialog screenshot
- export light 400 extension dialog screenshot
- export management dark extension dialog screenshot
- restore dark 320 extension dialog screenshot
- restore dark 400 extension dialog screenshot
- restore error dark extension dialog screenshot
- restore light 320 extension dialog screenshot
- Dark tab saved-version export dialog
- Management-owned verified Drive-copy review
- Dark anchored credential selector on narrow page
- Saved-version batch export design record
- Light tab saved-version export dialog
- .put
- Operação de teste
- Authenticated merge commit scope and acceptance SC22-SC25
- Security settings area
- sync-browser.mjs
- .put
- auth.js
- Light tab bounded vault unlock
- Management inline checkpoint review in dark theme
- Device erasure confirmation modal
- Appearance popup with back navigation and Open in tab link
- Popup inline checkpoint review in dark theme
- SecurePass light credential selector
- Vault management Advanced settings
- Narrow Advanced settings layout
- Popup inline checkpoint review in light theme
- Proposed explicit discovery, stable vault/account/device identities and authenticated second-device enrollment
- Historical six-category frontend review
- check.mjs
- Dark management checkpoint cards with one Review action
- Light management checkpoint cards with one Review action
- Dark popup checkpoint card with one Review action
- Dark popup bounded vault unlock
- Separate whole-vault restore confirmation from inline review
- Recovery-surface presentation and unlock-controller refinement
- export dark 400 extension dialog screenshot
- Dark popup bounded whole-vault restore confirmation
- Light tab bounded whole-vault restore confirmation
- Dark popup compact checkpoint comparison
- Light tab compact checkpoint comparison
- Light popup checkpoint card with one Review action
- Dark popup bounded deleted-entry recovery confirmation
- Light popup bounded deleted-entry recovery confirmation
- Light tab bounded deleted-entry recovery confirmation
- Light popup bounded whole-vault restore confirmation
- saved version export dark extension dialog screenshot
- Dark anchored credential selector on narrow page
- Dark credential selector with many logins
- SecurePass light credential selector
- Popup Generator, Tester, breach check and vault credential editor surfaces
- Serialized offscreen clipboard owner
- Dark management checkpoint cards with one Review action
- session.js
- Guided Chrome Sync setup, manual discovery and device test
- SETTINGS_NAVIGATION.md
- modules/settings.js
- Popup inline checkpoint review in light theme
- Separate whole-vault restore confirmation from inline review
- settings-browser.mjs

## God Nodes (most connected - your core abstractions)
1. `Version 3 settings Sync data and compact login plan` - 101 edges
2. `getStorage()` - 80 edges
3. `Validation and release checklist` - 65 edges
4. `Current architecture with implemented local and legacy increment` - 62 edges
5. `withVaultOperation()` - 58 edges
6. `removeStorage()` - 54 edges
7. `setStorage()` - 51 edges
8. `showToast()` - 50 edges
9. `Historical review of commit 5aed51c` - 44 edges
10. `Original SD review with later local increment notice` - 42 edges

## Surprising Connections (you probably didn't know these)
- `Cifrado interno do cofre — payload versionado, 08/11/2026` --references--> `encryptEntries()`  [INFERRED]
  docs/VAULT_PAYLOAD.md → src/vault/crypto.js
- `Key protection and trusted checkpoint implementation` --references--> `prepareSignedPublication()`  [INFERRED]
  docs/SIGNED_PROTOCOL.md → src/sync/signedPublication.js
- `Checkpoint summary and detail separation verified` --conceptually_related_to--> `renderCheckpoints()`  [INFERRED]
  docs/VALIDATION.md → popup/modules/checkpoints.js
- `Commit de merge autenticado — SC22–SC25` --references--> `resolveThreeWayPayload()`  [INFERRED]
  docs/issues/PERSISTED_MERGE.md → src/vault/threeWayMerge.js
- `Purpose-bound inline master-password authorization` --conceptually_related_to--> `changeMasterPasswordAuthorized()`  [INFERRED]
  ARCHITECTURE.md → src/cryptoVault.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Protected metadata inspection to guarded local signed merge save** — architecture_protected_drive_review, architecture_review_capability_lifecycle, architecture_review_cancellation_commit_guard, architecture_review_metadata_ui, architecture_authenticated_merge_commit [EXTRACTED 1.00]
- **Protected authentication and minimal document-bound anchored account selection** — docs_anchored_selector_account_selection, docs_anchored_selector_request_binding, docs_anchored_selector_visual_attestation, docs_anchored_selector_native_fallback, selector_selector_account_surface [EXTRACTED 1.00]
- **Whole-checkpoint restore authorization sequence** — docs_checkpoint_review_recent_authentication, docs_checkpoint_review_confirm_identity, docs_checkpoint_review_fresh_scoped_token, docs_checkpoint_review_secondary_restore [EXTRACTED 1.00]
- **Internal signed local mutation through atomic outbox to verified immutable publication** — docs_drive_transport_atomic_signed_commit, docs_signed_protocol_revision_wrapper, docs_drive_transport_durable_coordinator, docs_drive_transport_immutable_publication, docs_drive_transport_resumable_upload [EXTRACTED 1.00]
- **Selected signed ancestry and all-copy integrity within bounds guarded by final inventory/context checks** — docs_issues_authenticated_drive_history_selected_ancestry, docs_issues_authenticated_drive_history_duplicate_integrity, docs_issues_authenticated_drive_history_resource_limits, docs_issues_authenticated_drive_history_context_recheck [EXTRACTED 1.00]
- **Fixed authenticated context and selected history through atomic signed merge commit** — docs_issues_persisted_merge_context_authority, docs_issues_persisted_merge_history_preservation, docs_issues_persisted_merge_selected_parents, docs_issues_persisted_merge_atomic_retry [EXTRACTED 1.00]
- **Signed complete ancestry and plaintext identities guarded before causal merge review** — docs_issues_three_way_merge_authenticated_ancestor, docs_issues_three_way_merge_history_limits, docs_issues_three_way_merge_snapshot_identity, docs_issues_three_way_merge_live_context [EXTRACTED 1.00]
- **Authenticated deletion and explicit restoration preserved across encrypted payload lifecycle** — docs_vault_payload_tombstone_identity, docs_vault_payload_explicit_restoration, docs_vault_payload_rekey_recovery, docs_vault_payload_history_capacity [EXTRACTED 1.00]

## Communities (166 total, 47 thin omitted)

### Community 0 - "syncService.js"
Cohesion: 0.18
Nodes (38): vaultStatus(), loadSettings(), prepareMutationPublication(), readLegacySyncRecord(), readLocalVaultRecordRaw(), recordRevision(), writeLocalVaultRecordRaw(), commitLocalRecovery() (+30 more)

### Community 1 - "crypto.js"
Cohesion: 0.05
Nodes (90): 1. Escolher a identidade da extensão, 2. Criar/configurar o projeto Google, 3. Gerar uma cópia de desenvolvimento, Configurar Google Cloud para o SecurePass, Dados necessários para continuar a integração real, DECODER, decryptBackupPayload(), deriveBackupKey() (+82 more)

### Community 2 - "Interface e revisão visual"
Cohesion: 0.03
Nodes (39): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Atomic vault-checkpoint-Drive outbox commit with internal automatic signing; production remains gated, Internal P-256 administrative and encrypted-v2 revision prototype with pinned root/checkpoint; production review remains pending, Version 3 settings Sync data and compact login plan, Guided individual-file export delivered within incomplete plan (+31 more)

### Community 3 - "Recovery checkpoints behavior, protection and verification"
Cohesion: 0.04
Nodes (48): Checkpoint recovery with inline comparison and fresh scoped confirmation, Inline checkpoint review module and displayed-comparison identity, Archived Sync copies stay separate and exports are source-specific, Unlocked checkpoint counts, differences and affected-account examples, Remove one checkpoint or verify current password to clear local history, Recovery checkpoints behavior, protection and verification, Per-entry recovery through inline review and explicit confirmation, Existing-vault external and selected-remote restores preserve active authentication (+40 more)

### Community 5 - "biometric/service.js"
Cohesion: 0.07
Nodes (40): attachGeneratorListeners(), avoidSimilar, copyGeneratedBtn, generateButton, generatedResult, generatorStatus, handleGenerate(), includeLower (+32 more)

### Community 6 - "ref_node_assert"
Cohesion: 0.08
Nodes (27): devDependencies, fake-indexeddb@^6.2.4, playwright@1.56.1, fake-indexeddb, AUTH, CONTENT, SELECTOR, auth() (+19 more)

### Community 7 - "requests.js"
Cohesion: 0.12
Nodes (50): handlers, ready, clearCandidates(), dismissCandidate(), inlineCandidate(), listCandidates, proposeCandidate(), reviewCandidate() (+42 more)

### Community 9 - "Contextual on-page key"
Cohesion: 0.11
Nodes (15): Account suggestions and inline login tools, Integrity and capability boundaries, Surfaces and interaction, Validation, Why a save suggestion appears, Capacidades e vinculação, Evidência, Manifesto e limites (+7 more)

### Community 10 - "Current architecture with implemented local and legacy increment"
Cohesion: 0.06
Nodes (4): Bounded legacy recovery archive reader, Current architecture with implemented local and legacy increment, Guided source and digest bound recovery export, Implemented revision-checked settings, bound backup previews and local checkpoint recovery

### Community 11 - "checkpointReview.js"
Cohesion: 0.16
Nodes (36): attachCheckpointListeners(), date(), deleteHistory(), handleCheckpointAction(), plural(), renderCheckpoints(), accessibleDestination(), attachDataListeners() (+28 more)

### Community 12 - "Documentação de Sync e dados"
Cohesion: 0.11
Nodes (38): clearSecrets(), complete(), expired(), refresh(), requestId, run(), saveTargetChanged(), send() (+30 more)

### Community 13 - "Checkpoint review design document"
Cohesion: 0.08
Nodes (26): Single checkpoint review entry, Inline checkpoint comparison, Confirm identity flow, Individual entry recovery, Checkpoint review design document, Authentication expiry during confirmation, Successful recovery refreshes review or returns to checkpoint list, Recovery review cleanup and navigation (+18 more)

### Community 14 - "session.js"
Cohesion: 0.07
Nodes (34): Older checkpoint protection migration, False source-level production-review predicate; no public enrollment, adoption or Drive write activation, Journey scope and unconfigured OAuth, Accessibility and website compatibility acceptance, Automated regression coverage, Backup dialog refinement evidence, Bounded recovery archive evidence, Development validation commands (+26 more)

### Community 15 - "vault.js"
Cohesion: 0.08
Nodes (22): biometricUnlockContainer, clearRevealTimer(), confirmMasterInput, createMasterSection, createVaultIconButton(), entryForm, entryModalTitle, entryNotesInput (+14 more)

### Community 16 - "Inline master-password flow and independent management proportions"
Cohesion: 0.06
Nodes (34): Approved inline identity/password/success and management proportions, Pre-save biometric revocation notice and optional setup again, Clear secrets and revoke the exact grant on leaving the inline flow, Inline master-password flow and independent management proportions, Two-minute single-use revision-bound password-change grant, Physical authenticator and actual toolbar sizing remain manual acceptance, Fresh identity confirmation replaces preliminary unlock and modal, Tab stylesheet separates desktop layout from compact popup presentation (+26 more)

### Community 17 - "utilHandlers.js"
Cohesion: 0.12
Nodes (32): copyInBackground(), ensureOffscreen(), cacheWrites, checkPassword(), clearHibpCache(), hibpCacheStatus(), inFlight, range() (+24 more)

### Community 18 - "vaultHandlers.js"
Cohesion: 0.22
Nodes (25): recoveryStatus(), vaultHandlers, readRecoveryRecords(), snapshotId(), createVaultBackup(), validateBackupPassword(), activeVault(), checkpointStatus() (+17 more)

### Community 19 - "README de apresentação em português"
Cohesion: 0.07
Nodes (24): Local backup safety and repeatable recovery cleanup, Backups and Advanced functional review, Preenchimento confirmado por origem e documento, Backups cifrados com pré-visualização de importação, Desbloqueio WebAuthn com PRF, Limites de capacidade e importação, Desenvolvimento e verificações, Chrome122 e âmbito de compatibilidade (+16 more)

### Community 20 - "Autofill na página"
Cohesion: 0.08
Nodes (23): action, default_popup, default_title, background, service_worker, type, content_scripts, content_security_policy (+15 more)

### Community 21 - "scripts"
Cohesion: 0.09
Nodes (22): scripts, check, configure:google, package, test, test:account-prompts-browser, test:anchored-browser, test:backup-dialogs-browser (+14 more)

### Community 22 - "logger.js"
Cohesion: 0.22
Nodes (11): LOG_ENABLED, buffer, format(), isArrayBufferLike(), isPrimitive(), isSensitiveString(), logger, redactValue() (+3 more)

### Community 23 - "Contextual on-page key contract"
Cohesion: 0.09
Nodes (23): Direct selector and original-field tool handoff, Native manual login creation form, Native secondary website tools disclosure, Source field and reserved native-tab request binding, Direct key opens up to two anchored account suggestions, Contextual on-page key contract, Executed contextual-key evidence and remaining manual acceptance, Pointer-transparent feedback preserves the next website action (+15 more)

### Community 24 - "checkpointReview.js"
Cohesion: 0.31
Nodes (20): account(), attachCheckpointReviewListeners(), changedFields(), checkFreshness(), clientId, closeReview(), date(), entryCount() (+12 more)

### Community 25 - "checkpoints-browser.mjs"
Cohesion: 0.09
Nodes (12): send(), theme(), cancel(), captures, errors, idle(), root, captures (+4 more)

### Community 26 - "Modelo de segurança"
Cohesion: 0.24
Nodes (18): Inline unlock errors and retry without dismissing the form, resolveUnlockSetup(), setUnlockResolver(), attachUIListeners(), backFromSettings(), closeModal(), closeSettingsPanel(), manageFocus() (+10 more)

### Community 27 - "Popup HTML semantic surfaces"
Cohesion: 0.14
Nodes (20): Version and repository footer, System light and dark theme controls, Auto-lock inactivity preference, Consistent fingerprint symbol for biometric entry points, Ownership-aware clipboard timeout explanation, Popup HTML semantic surfaces, Labelled credential editor dialog, Appearance settings area (+12 more)

### Community 28 - "vault/driveReview.js"
Cohesion: 0.05
Nodes (91): driveHandlers, loadAuthorization(), createDriveRuntime(), run(), bounded(), classify(), createDriveClient(), guard() (+83 more)

### Community 29 - "requests.js"
Cohesion: 0.20
Nodes (24): assertDocument(), cancelRequest(), completeRequest(), completeSave(), handoffSelection(), listForOrigin(), notifyCancellation(), requestDetails() (+16 more)

### Community 30 - "ref_node_crypto"
Cohesion: 0.18
Nodes (3): createPublicationCoordinator(), setup(), expected

### Community 31 - "recoveryArchive.js"
Cohesion: 0.08
Nodes (29): Cancellation, errors and accessibility, Colors, Components, Do's and Don'ts, Elevation & Depth, Evidence and limits, Interaction and completion, Layout (+21 more)

### Community 32 - "Implementation checklist: partial implementation, release not accepted"
Cohesion: 0.24
Nodes (9): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, SC01/SC02/SC40 and AF03/AF09 closed within explicit bounds; 55 SC and 10 AF remain open, Consolidated delivered increments and remaining product/release gates, 2026-11-06 delivered OAuth inspection, signing, gated runtime, resumable uploads and anchored search, Implementation checklist: partial implementation, release not accepted, Remaining implementation order after internal Drive and planner delivery, Implemented autofill displayed-revision guard rejects missing or changed revision, Global Sync/Data completion remains open after integrated internal increments (+1 more)

### Community 33 - "Checkpoint review interaction"
Cohesion: 0.11
Nodes (14): Approved interaction, Captures, Checkpoint review interaction, State and privacy, Checkpoint review scenario coverage and remaining acceptance, Behavior and presentation, Encryption and rotation, Evidence (+6 more)

### Community 34 - "SETTINGS_UX_IMPLEMENTATION.md"
Cohesion: 0.14
Nodes (7): Current UX delivery separates read-only account access, internal publication, planner and anchored login, Delivered behavior, Executed checks, Remaining release gates, Review artifacts, Scenario coverage boundary, Settings UX implementation and evidence

### Community 35 - "accountPrompts-browser.mjs"
Cohesion: 0.20
Nodes (15): Historical disposable account-prompt Node, module and Chromium evidence, Dedicated disposable account-prompt Chromium command, capture(), errors, nextPage(), openFill(), openSaveEntered(), openTools() (+7 more)

### Community 36 - "Drive-copy review scoped design record"
Cohesion: 0.05
Nodes (42): Drive-copy review scoped design record, Explicit metadata-only whole-version review workflow, Existing Operate visual and responsive contract, Eight-row search with preserved explicit decisions, Local queued save and transient token privacy, Protected management review over read-only transport, Protected Drive review delivered with conditional enrollment, Protected Drive merge review issue and delivered contract (+34 more)

### Community 37 - "modules/driveReview.js"
Cohesion: 0.35
Nodes (14): attachDriveReviewListeners(), bulkCandidates(), cancel(), choices, choiceStatus(), clientId, controls(), matchingConflicts() (+6 more)

### Community 38 - "Guided Chrome Sync setup and receipt evidence contract"
Cohesion: 0.06
Nodes (23): Guided Chrome Sync setup, bounded capacity and non-authorizing device diagnostic, Guided setup Node/security and Chromium evidence with emulated transport boundaries, test:sync-setup-browser runs the disposable guided Chrome Sync scenario, Guided setup supersedes parts of historical capacity and selected-restore findings, Conservative two-complete-version capacity and local-only failure handling, Dark guided setup refusing insufficient two-version capacity, Enable is unavailable when the local vault cannot coexist with a subsequent complete copy, Narrow dark device-test receipt with preserved local cache controls (+15 more)

### Community 39 - "selector.js"
Cohesion: 0.22
Nodes (16): Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Disposable anchored and ZIP journeys plus internal Drive integration evidence; full release remains open, Current login key UI has two anchored suggestions and native complete-list fallback; registration/change-password generator remains available., Delivered anchored search/pagination with protected unlock and native fallback, Selector is extension-origin with restricted message capabilities and source/document binding; iframe isolation is not independent Chrome permissions or native clickjacking assurance., Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, Implemented anchored selector with two-account pagination/search and protected unlock/native fallback, clear() (+8 more)

### Community 41 - "SETTINGS_UX_DESIGN.md"
Cohesion: 0.17
Nodes (7): Delivery evidence, Information architecture, Interaction rules, Journey state machine, SC01–SC58 traceability, Screen sketches, Settings UX — journeys, screens and acceptance map

### Community 42 - "package.json"
Cohesion: 0.40
Nodes (4): name, private, type, version

### Community 43 - "Three-way planner checklist records delivered internal planning and guarded review"
Cohesion: 0.28
Nodes (7): Full SC merge acceptance remains open after internal planner delivery, Three-way planner checklist records delivered internal planning and guarded review, Shared-base permutation evidence does not establish full distributed convergence, Focused Node and Chromium evidence for the internal three-way planner, Implemented internal common-base three-way snapshot planner, Delivered authenticated history and protected review; production lifecycle, rebase, retention and acceptance remain open, Opaque expiring three-way reviews with exact conflict decisions and live-context revocation

### Community 44 - "vaultUnlock.js"
Cohesion: 0.13
Nodes (14): Advanced control inventory, Scoped authentication and local erasure, Backups control inventory, Cache usage without duration control, Unified local and archived earlier versions, Executed validation, Four-area Settings revision, Historical General inventory (+6 more)

### Community 45 - "Internal authenticated Drive-history retrieval contract and evidence"
Cohesion: 0.20
Nodes (6): Bounded selected signed-history retrieval with inventory reenumeration, 08/11 internal Drive ancestry retrieval delivered; product integration open, Internal authenticated Drive-history retrieval contract and evidence, Shared 256-packet and 32-MiB bounds count duplicate and local packets, Internal authenticated ancestor and Drive history delivered without activation, 244-test continuation with actual bounded reader and injected provider

### Community 46 - "storage.js"
Cohesion: 0.10
Nodes (32): ALARM_NAME, BIOMETRIC_SESSION_PASSPHRASE_KEY, CHUNK_SIZE, CLIPBOARD_ALARM_NAME, DB_STORE_NAME, DB_VERSION, META_KEY, PRF_EVAL_LABEL (+24 more)

### Community 47 - "IMPLEMENTATION_CHECKLIST.md"
Cohesion: 0.09
Nodes (13): Drive transport implementation status, Recolha de história Drive autenticada — SC22–SC25, Integração Drive e conclusão do plano — 06/11/2026, Commit de merge autenticado — SC22–SC25, Tombstones cifrados persistentes — SC22–SC25, Guided recovery export batches — SC40, SD07, Leitura limitada de arquivos de recuperação grandes — SD07, SC37, Implementação do plano Sync/Data v3 (+5 more)

### Community 48 - "Encrypted vault-state v1 payload and local migration contract"
Cohesion: 0.18
Nodes (6): Local tombstones and restore provenance checked; merged history persistence and conditional review delivered, Persistent encrypted tombstones implementation scope SC22-SC25, 251-test local tombstone persistence and signed-packet Chromium evidence, Encrypted vault-state v1 payload and local migration contract, Rotation and checkpoint re-protection preserve causal metadata, Deletion tombstones bind entry ID to deleting revision

### Community 49 - "popup.js"
Cohesion: 0.15
Nodes (14): Auto-lock vault slider, Set up biometric unlock action, Change master password action, Clear copied passwords slider, GitHub footer link, Settings category navigation: Appearance, Security, Backups & recovery, Advanced, Settings footer with version, GitHub link, and preference save status, Settings popup home screenshot (+6 more)

### Community 50 - "Management inline checkpoint review in dark theme"
Cohesion: 0.29
Nodes (7): Changed account labels Different fields: password and offers Restore details, Back to checkpoints remains part of the in-section view, Show matching entries checkbox includes matching count, Account rows offer a specific Recover entry action, Management inline checkpoint review in dark theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 52 - "biometric.test.js"
Cohesion: 0.42
Nodes (7): assertion(), b64(), client(), der(), registration(), request(), sender

### Community 53 - "Implemented extension-origin anchored account selector with two-account pagination and username search"
Cohesion: 0.17
Nodes (8): Chromium selector evidence does not close visual-adversarial, physical accessibility or real-site acceptance, Implemented extension-origin anchored account selector with two-account pagination and username search, Protected auth-window handoff and native fallback for CSP blocking and manual creation, Trusted selection plus source focus, ancestor visibility and hit-testing checks, Account-vault-generation bound IndexedDB publication queue with bounded durable retries, Persisted resumable upload sessions, provider offset probes, one-MiB chunks and 16-MiB packet bound, Implemented field-key, protected unlock, anchored account choice and direct fill without submission, Minimal no-referrer account surface with origin, search, top pagination, account list and live status

### Community 54 - "Internal common-base three-way merge issue and acceptance scope"
Cohesion: 0.15
Nodes (8): Separate internal three-way planner with opaque revision-bound reviews, 08/11 internal authenticated ancestor delivery checked; product integration open, Current integrated code delivery with separate pending protocol and real-world acceptance, Global completion issue remains open for administrative lifecycle, recovery, convergence, migration and independent gates, Drive integration issue: resumable uploads, automatic signing, gated worker and read-only OAuth management, Unique nearest ancestor from complete authenticated history, Internal common-base three-way merge issue and acceptance scope, 08/11 authenticated ancestry Node and Chromium evidence

### Community 55 - "Purpose-bound inline master-password authorization"
Cohesion: 0.20
Nodes (6): Implemented read-only Google management and gated internal signed Drive integration, Independent management-tab layout with shared trusted pathname, Purpose-bound inline master-password authorization, Drive production lifecycle, recovery, convergence, migration and release acceptance remain incomplete, Internal normal-mutation signing and atomic vault-checkpoint-outbox authorization/session checks, Canonical signed encrypted-v2 revision wrapper bound to active writer, vault, epoch and exact authorization digest

### Community 56 - "Ferramentas de desenvolvimento"
Cohesion: 0.18
Nodes (9): Backups & recovery — export and restore dialogs, Delivered interaction, Executed checks, Visual evidence, Limites e aceitação restante, Problemas reproduzidos e corrigidos, Revisão funcional — Backups & recovery e Advanced, Validação (+1 more)

### Community 57 - "Confirmação de autofill"
Cohesion: 0.18
Nodes (10): Local Settings Sync and Data Management work item, Local workflow acceptance requirements, Historical approved four-area revision on main, Historical frontend cleanup follow-up, Historical approved hierarchical implementation scope, Authorization contract, Delivered behavior, Inline master-password change and management layout (+2 more)

### Community 58 - "Settings category links and labelled navigation"
Cohesion: 0.20
Nodes (11): Vault creation/unlock, biometric setup and inline fresh-identity master-password change forms, Backups, checkpoint cards and inline review settings area, Recovery checkpoints heading, Clear history and local/archive inventory, Compact in-section checkpoint comparison, Encrypted backup import and export controls, Cache clear, vault clear, local wipe and exclusive native operation dialog surfaces, Settings category links and labelled navigation, Checkpoint cards and inline review with separate archived copies (+3 more)

### Community 59 - "Internal domain-separated ECDSA P-256 administrative authorization chains"
Cohesion: 0.33
Nodes (4): Public OAuth client received; real Google authorization, protocol review, physical hardware and lifecycle acceptance pending, Internal domain-separated ECDSA P-256 administrative authorization chains, Internal prototype lacks reviewed nonce policy, new format, enrollment, recovery, concurrent rotation and migration, Proposed bounded backup/archive parsing, stable snapshot selection and safe checkpoint-based retention

### Community 60 - "cryptoVault.js"
Cohesion: 0.18
Nodes (34): changeMasterPassword(), changeMasterPasswordAuthorized(), clearVaultEntries(), deleteCredential(), importVaultData(), initializeVault(), keepAlive(), mutate() (+26 more)

### Community 62 - "Popup HTML semantic surfaces"
Cohesion: 0.22
Nodes (10): Cancel, Unlock and icon-only fingerprint share one action row, Dark master-password identity with inline biometric method, Dark main vault unlock with inline biometric method, Shared password and biometric method row, Accessible fingerprint-only shortcut beside password, Inline identity form with biometric shortcut beside current password, New-password confirmation with biometric revocation warning, Inline master-password identity, new-password and success forms (+2 more)

### Community 63 - "Checklist de implementação e aceitação"
Cohesion: 0.29
Nodes (7): Cenários de aceitação, Checklist de implementação e aceitação, Dependências externas e condições de release, Entregáveis por secção, Próximos blocos de implementação, Revisão original e fecho de problemas, Trabalho desta execução

### Community 64 - "drive.js"
Cohesion: 0.70
Nodes (4): act(), attachDriveListeners(), messages, refreshGoogleView()

### Community 66 - "Account suggestions, inline tools and trusted-window confirmation contract"
Cohesion: 0.07
Nodes (27): Review cancellation retains a proposal; dismissal/save/expiry/lock remove it, Restricted five-minute proposals, eight-item bound, metadata-only listing and deduplication, Narrow dark registration generator inside the viewport, Primary generation and secondary disclosures fit a 320px viewport, Light contextual registration generator with primary Generate and fill, Password options and Other options are collapsed beneath generation, Light review of a new captured login, Username correction and explicit new-login target precede final save (+19 more)

### Community 67 - "Ferramentas de desenvolvimento"
Cohesion: 0.22
Nodes (8): Explicit account selection section, PRF alternative beside the master password field, Cancel confirmation button, Compact extension-owned login confirmation with shared popup tokens, Editable username and explicit selection before an update, with expired/already-saved states, Explicit new-login save or selected password update, auth.js module bootstrap, Master password unlock form

### Community 68 - "Light management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Light management checkpoint cards with one Review action

### Community 69 - "ref_node_fs"
Cohesion: 0.05
Nodes (28): playwright, result, { version }, frameFor(), projectRoot, server, errors, root (+20 more)

### Community 70 - "Recovery-surface presentation and unlock-controller refinement"
Cohesion: 0.18
Nodes (11): Vault unlock controller with bounded inline retry and WebAuthn cancellation, Compact comparison header and account rows, Recovery-surface presentation and unlock-controller refinement, Smaller cards and a shared contextual dimmed backdrop, Recovery-surface checks recorded in validation evidence, Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control (+3 more)

### Community 71 - "Compact recovery presentation and consistent fingerprint entry points"
Cohesion: 0.17
Nodes (12): 85 modules and four browser suites; Node evidence remains historical, Compact recovery presentation and consistent fingerprint entry points, Same dimmed and 2px-blurred extension context under unlock and recovery, Full restore confirms only restored total and removals, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light popup compact checkpoint comparison, Search website or username field (+4 more)

### Community 72 - "popup.js"
Cohesion: 0.25
Nodes (25): attachBiometricListeners(), syncBiometricView(), attachCandidateListeners(), refreshCandidates(), attachMasterPasswordListeners(), sendMessage(), attachSettingsNavigation(), LEGACY_SECTIONS (+17 more)

### Community 73 - "Guided Chrome Sync setup and device verification"
Cohesion: 0.29
Nodes (6): Device test, Evidence shown to the user, Guided Chrome Sync setup and device verification, Recovery and capacity corrections, User journey, Validation and manual acceptance

### Community 74 - "Saved version changed after review"
Cohesion: 0.50
Nodes (4): Saved version 1 of 3, Saved version changed after review, Cancel and Download version controls, Reviewed saved version identity

### Community 75 - "Popup HTML semantic surfaces"
Cohesion: 0.29
Nodes (6): Readable cache row layout correction, Reproduced cache status layout defect, Historical navigation and dialog recommendations, Recovery discovery and terminology concerns, Visual critique and accessibility limits, Breach-check cache management

### Community 76 - "Dark narrow saved-version export dialog: saved version 1 of 3"
Cohesion: 0.50
Nodes (4): Cancel action stops the batch, Download version action: 0 download requests sent; download this version next, Dark narrow saved-version export dialog: saved version 1 of 3, Version metadata: This device; 949a754c; 11/8/2026, 7:47:16 PM; 1 KiB

### Community 77 - "Bounded recovery archive reader contract"
Cohesion: 0.15
Nodes (8): Recovery archive increment delivered, Bounded archive scanning requirements, Envelope isolation and restore requirements, Large recovery archive issue SD07 SC37, Archive reproducibility and evidence, Archive resource limits, Bounded recovery archive reader contract, Separate guided per-file export contract

### Community 78 - "Google configuration builder validates public key/ID and adds appData-only permissions to a separate copy"
Cohesion: 0.33
Nodes (5): Bounded appData listing, streaming download, account identification and typed transport errors, Management-only Chrome Identity connection with Drive permission-ID pinning and durable disconnect generation, Real Chrome Google connection and read-only app-folder inspection remain to be authorized by the user, Stable development extension identity and public Google OAuth client configuration, Google connection, app-folder inspection and disconnect controls state vault synchronization is unavailable

### Community 79 - "Ícone 16 pixels"
Cohesion: 0.33
Nodes (6): Copy edit and delete controls, Credential cards, Generator Tester Vault tabs, Unlocked vault screenshot, Settings navigation, Search add and lock controls

### Community 80 - "Ícone 32 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Dark popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 81 - "Ícone 48 pixels"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light popup bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 82 - "Entrada do content script"
Cohesion: 0.33
Nodes (6): Cancel and Restore vault remain visible in a compact footer, Actual extension visible under a shared dimmed blurred backdrop, Short current-password and biometric preservation statement, Short checkpoint and Sync effects notice, Light tab bounded whole-vault restore confirmation, Restore total and To remove counts only

### Community 83 - "Documentação de Sync e dados"
Cohesion: 0.47
Nodes (4): legacyClipboard(), read(), serial, write()

### Community 84 - "Light narrow saved-version export dialog"
Cohesion: 0.50
Nodes (4): Cancel action stops the batch, Download version action for saved version 1 of 3; 0 download requests sent, Light narrow saved-version export dialog, Metadata: This device; version 949a754c; saved 11/8/2026, 7:47:16 PM; file size 1 KiB

### Community 85 - "Dark credential selector with many logins"
Cohesion: 0.40
Nodes (5): Dark credential selector with many logins, Previous and Next pagination showing 1–2 of 27 logins, Search logins field, Open SecurePass window action, Visible credentials manual-new-user and concurrent-user for http://127.0.0.1:43557

### Community 86 - "export dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Dark popup bounded deleted-entry recovery confirmation

### Community 87 - "export error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light popup bounded deleted-entry recovery confirmation

### Community 88 - "export light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Website and Account identify the one entry to recover, Cancel and Recover entry remain in the footer, Actual extension visible under a shared dimmed blurred backdrop, Short one-entry and checkpoint/Sync effects, Light tab bounded deleted-entry recovery confirmation

### Community 89 - "export light 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Dark popup compact checkpoint comparison, Search website or username field

### Community 90 - "export management dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Lower-priority full-checkpoint area and Review full restore action, Checkpoint date and nonzero saved/deleted summary, Domain, account and Deleted entry row with Recover entry, Light tab compact checkpoint comparison, Search website or username field

### Community 91 - "restore dark 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Fingerprint-only shortcut beside password, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with biometric alternative

### Community 92 - "restore dark 400 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Dark popup bounded vault unlock with inline error

### Community 93 - "restore error dark extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light popup bounded vault unlock with inline error

### Community 94 - "restore light 320 extension dialog screenshot"
Cohesion: 0.40
Nodes (5): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Inline Invalid master password or corrupted vault error with empty password field, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock with inline error

### Community 95 - "Dark tab saved-version export dialog"
Cohesion: 0.50
Nodes (4): Per-version confirmation: Download version or Cancel to stop the batch, Dark tab saved-version export dialog, Saved version 1 of 3; 0 download requests sent, This device: version 949a754c, saved 11/8/2026 7:47:16 PM, file size 1 KiB

### Community 96 - "Management-owned verified Drive-copy review"
Cohesion: 0.25
Nodes (3): Management-owned verified Drive-copy review, Metadata-only paginated conflict decisions, Encrypted deterministic conflict-copy provenance alongside restore history

### Community 97 - "Dark anchored credential selector on narrow page"
Cohesion: 0.50
Nodes (4): Dark anchored credential selector on narrow page, Credential option fictional-user for http://127.0.0.1:43557, Open SecurePass window action, Key icon trigger beside masked password field

### Community 98 - "Saved-version batch export design record"
Cohesion: 0.15
Nodes (7): Drive copy review: design record, Evidence and limits, Interaction and privacy, Scope and incumbent design, Revisão Drive protegida na gestão — 08/11/2026, Saved-version batch export design record, Scoped visual ship and disposable browser evidence

### Community 99 - "Light tab saved-version export dialog"
Cohesion: 0.50
Nodes (4): Saved version 1 of 3; 0 download requests sent, Download version confirms the current file; Cancel stops the batch, Light tab saved-version export dialog, This device; version 949a754c; saved 11/8/2026, 7:47:16 PM; 1 KiB

### Community 100 - ".put"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Dark popup checkpoint card with one Review action

### Community 101 - "Operação de teste"
Cohesion: 0.50
Nodes (4): Review checkpoint primary action with secondary Export and Remove, Dated checkpoint with sequence, recoverable-entry and later-entry counts, Backups header and Open in tab remain visible above checkpoint cards, Light popup checkpoint card with one Review action

### Community 102 - "Authenticated merge commit scope and acceptance SC22-SC25"
Cohesion: 0.25
Nodes (3): Authenticated merge persistence delivered with conditional protected review routes, Authenticated merge commit scope and acceptance SC22-SC25, 257-test atomic merge persistence and real Chromium rollback retry evidence

### Community 103 - "Security settings area"
Cohesion: 0.50
Nodes (4): Set up biometric unlock card describing fingerprint, face, PIN or security key, Clear copied passwords after 30 seconds slider with best-effort copy-matching explanation, Security settings screenshot with password, clipboard, biometric controls and a toast, Visible toast states Legacy Sync mode updated and asks to unlock active vault again

### Community 104 - "sync-browser.mjs"
Cohesion: 0.50
Nodes (4): Password and fingerprint identity row, Fingerprint authentication affordance, Biometric identity confirmation capture, Dark compact identity dialog

### Community 105 - ".put"
Cohesion: 0.50
Nodes (4): Identity error and retry capture, Compact responsive error layout, Inline invalid password or corrupt vault error, Identity retry or cancellation controls

### Community 106 - "auth.js"
Cohesion: 0.50
Nodes (4): Password identity confirmation capture, Explicit identity confirmation actions, Current master-password identity form, Dimmed checkpoint review context

### Community 107 - "Light tab bounded vault unlock"
Cohesion: 0.50
Nodes (4): Single Cancel and Unlock row with compact spacing, Actual extension visible under a shared dimmed blurred backdrop, Compact Unlock vault heading, current-password field and reveal control, Light tab bounded vault unlock

### Community 109 - "Management inline checkpoint review in dark theme"
Cohesion: 0.50
Nodes (4): Settings navigation: Appearance selected, Security, Backups & recovery, Advanced, Reset preferences row says theme, generator and timeout defaults are restored and vault is kept, Dark appearance settings screenshot, Theme choices: System selected, Light, Dark

### Community 110 - "Device erasure confirmation modal"
Cohesion: 0.50
Nodes (4): Typed confirmation shows wrong with ERASE THIS DEVICE error, Device erasure confirmation modal, Visible local erasure scope text says remote copies remain, Verification dropdown shows erase without unlocking

### Community 111 - "Appearance popup with back navigation and Open in tab link"
Cohesion: 0.50
Nodes (4): Preferences save automatically notice, Appearance popup with back navigation and Open in tab link, Reset preferences copy lists theme, generator and timeout defaults and says vault is kept, System, Light, and Dark theme choices; System visibly selected

### Community 114 - "SecurePass light credential selector"
Cohesion: 0.67
Nodes (3): fictional-user credential option, Open SecurePass window action, SecurePass light credential selector

### Community 115 - "Vault management Advanced settings"
Cohesion: 0.67
Nodes (3): Vault management Advanced settings, Chrome Sync encrypted vault copies, Google Drive connection management

### Community 116 - "Narrow Advanced settings layout"
Cohesion: 0.67
Nodes (3): Narrow Advanced settings layout, Chrome Sync copy availability and manual restoration, Google Drive connected account status and actions

### Community 117 - "Popup inline checkpoint review in light theme"
Cohesion: 0.67
Nodes (3): Timestamped encrypted local-version backup cards with Restore and Export buttons, Legacy Sync mode update notice requesting active vault unlock, Backups and recovery settings screenshot

### Community 121 - "Historical six-category frontend review"
Cohesion: 0.20
Nodes (7): Historical accessible themes ranges and saving feedback, Historical six-category navigation, Historical six-category frontend review, Historical settings disclosures unlock and focus corrections, Historical independent Impeccable review evidence, Historical hTML category ownership and dedicated settings styles, Historical frontend regression evidence and manual limits

### Community 123 - "check.mjs"
Cohesion: 0.09
Nodes (19): Public Google client received and stable configured development copy generated; real authorization remains pending, Disposable Chromium anchored, configured-Google emulation and ZIP evidence; real Google remains unaccepted, done, files(), graph, js, manifest, pkg (+11 more)

### Community 169 - "Dark management checkpoint cards with one Review action"
Cohesion: 0.50
Nodes (4): One primary Review checkpoint button with secondary Export and Remove, Dated cards show sequence and aggregate entry differences without account examples, Backups & recovery sidebar selection and Recovery checkpoints heading remain visible, Dark management checkpoint cards with one Review action

### Community 171 - "session.js"
Cohesion: 0.24
Nodes (13): readSyncOutbox(), reconcileLocalRecovery(), retryPendingSync(), activate(), assertGeneration(), current(), generation(), onLock() (+5 more)

### Community 172 - "Guided Chrome Sync setup, manual discovery and device test"
Cohesion: 0.29
Nodes (7): Advanced Google connection, Chrome Sync, breach cache and scoped local maintenance, Scoped entry clearing and local device erasure, Explicit legacy remote version review, Guided Chrome Sync setup, manual discovery and device test, Remote source unlock then entry-count comparison and confirmation, Configure Chrome Sync then separately enable automatic sending, Explicit matching-code device test and historical receipt status

### Community 174 - "SETTINGS_NAVIGATION.md"
Cohesion: 0.29
Nodes (9): Compatible Settings fragments, Executed verification, Hierarchical Settings navigation, Navigation history, focus and scroll preservation, Implemented behavior, Manual review and limits, Preserved Settings behavior and security contracts, Shared Settings footer across navigation layouts (+1 more)

### Community 176 - "modules/settings.js"
Cohesion: 0.32
Nodes (11): attachSettingsListeners(), initialiseSettings(), saving, scheduleSettingsSave(), setSaveStatus(), syncSettingsView(), updateRangeLabel(), applyTheme() (+3 more)

### Community 177 - "Popup inline checkpoint review in light theme"
Cohesion: 0.40
Nodes (5): Back to checkpoints remains part of the in-section view, Deleted account offers Recover entry; later accounts explicitly indicate removal by full restore, Popup inline checkpoint review in light theme, Website or username search within the review, Review title/date and saved/deleted/different/newer counts

### Community 178 - "Separate whole-vault restore confirmation from inline review"
Cohesion: 0.50
Nodes (4): Cancel and Restore vault in the confirmation footer, Copy preserves current authentication and keeps current contents as a checkpoint while turning automatic Sync off, Separate whole-vault restore confirmation from inline review, Compact confirmation shows saved-entry count and highlighted removal count

### Community 179 - "settings-browser.mjs"
Cohesion: 0.20
Nodes (4): errors, layouts(), root, section()

## Knowledge Gaps
- **482 isolated node(s):** `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards`, `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts` (+477 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1057 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Current architecture with implemented local and legacy increment` connect `Current architecture with implemented local and legacy increment` to `Management-owned verified Drive-copy review`, `Serialized offscreen clipboard owner`, `Recovery checkpoints behavior, protection and verification`, `Original SD review with later local increment notice`, `SETTINGS_UX_IMPLEMENTATION.md`, `Recovery-surface presentation and unlock-controller refinement`, `Interface e revisão visual`, `popup.js`, `SETTINGS_UX_DESIGN.md`, `Encrypted vault-state v1 payload and local migration contract`, `README de apresentação em português`, `Implemented extension-origin anchored account selector with two-account pagination and username search`, `Internal common-base three-way merge issue and acceptance scope`, `Purpose-bound inline master-password authorization`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **What connects `Review checkpoint primary action with secondary Export and Remove`, `Dated checkpoint with sequence, recoverable-entry and later-entry counts`, `Backups header and Open in tab remain visible above checkpoint cards` to the rest of the system?**
  _482 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `crypto.js` be split into smaller, more focused modules?**
  _Cohesion score 0.051018465638682654 - nodes in this community are weakly interconnected._
- **Why does `Validation and release checklist` connect `session.js` to `Interface e revisão visual`, `Original SD review with later local increment notice`, `Checkpoint review design document`, `README de apresentação em português`, `Checkpoint review interaction`, `SETTINGS_UX_IMPLEMENTATION.md`, `Drive-copy review scoped design record`, `Security model and open risks`, `SETTINGS_UX_DESIGN.md`, `Three-way planner checklist records delivered internal planning and guarded review`, `vaultUnlock.js`, `Internal authenticated Drive-history retrieval contract and evidence`, `SETTINGS_NAVIGATION.md`, `Encrypted vault-state v1 payload and local migration contract`, `Implementation tracking with consolidated current and historical status`, `Internal common-base three-way merge issue and acceptance scope`, `Ferramentas de desenvolvimento`, `Confirmação de autofill`, `Ferramentas de desenvolvimento`, `Guided Chrome Sync setup and device verification`, `Bounded recovery archive reader contract`, `Authenticated merge commit scope and acceptance SC22-SC25`, `Historical six-category frontend review`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Should `Interface e revisão visual` be split into smaller, more focused modules?**
  _Cohesion score 0.02937625754527163 - nodes in this community are weakly interconnected._
- **Why does `Checkpoint recovery with inline comparison and fresh scoped confirmation` connect `Recovery checkpoints behavior, protection and verification` to `vaultHandlers.js`, `Current architecture with implemented local and legacy increment`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `Recovery checkpoints behavior, protection and verification` be split into smaller, more focused modules?**
  _Cohesion score 0.04343971631205674 - nodes in this community are weakly interconnected._