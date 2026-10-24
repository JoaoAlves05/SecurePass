import json
from pathlib import Path
root=Path('/home/johnny/projects/SecurePass')
rows=[
('agents_repository_guidelines','Repository development guidelines','AGENTS.md','document','Repository Guidelines'),
('agents_manual_verification','Manual checks with disposable credentials','AGENTS.md','rationale','Testing Guidelines'),
('architecture_modular_boundaries','Modular ES-module service boundaries','ARCHITECTURE.md','document','Boundaries'),
('architecture_envelope_encryption','Version 2 envelope encryption','ARCHITECTURE.md','concept','Vault format and lifetime'),
('architecture_revocable_session','Revocable session across worker suspension','ARCHITECTURE.md','rationale','Vault format and lifetime'),
('architecture_transactional_mutations','Serialized transactional vault mutations','ARCHITECTURE.md','rationale','Vault format and lifetime'),
('architecture_legacy_migration','Legacy migration with encrypted recovery','ARCHITECTURE.md','concept','Vault format and lifetime'),
('architecture_immutable_sync','Immutable Sync generations and integrity','ARCHITECTURE.md','concept','Sync model'),
('architecture_explicit_conflicts','Explicit offline branch resolution','ARCHITECTURE.md','rationale','Sync model'),
('architecture_safe_compaction','Transitive ancestry compaction','ARCHITECTURE.md','rationale','Sync model'),
('architecture_trusted_confirmation','Trusted origin-bound autofill confirmation','ARCHITECTURE.md','concept','Message flows'),
('architecture_capability_matrix','Management authentication content capabilities','ARCHITECTURE.md','rationale','Message flows'),
('architecture_verified_prf','Verified WebAuthn and PRF wrapping','ARCHITECTURE.md','concept','Biometric model'),
('readme_securepass','SecurePass feature contract','README.md','document','SecurePass'),
('readme_supported_scope','Chrome 122+ supported page scope','README.md','concept','Run the extension'),
('readme_local_capacity','Local and Sync capacity bounds','README.md','concept','Sync and recovery'),
('readme_encrypted_backups','Encrypted backups and historical snapshots','README.md','concept','Sync and recovery'),
('readme_save_candidates','Expiring save update suggestions','README.md','concept','Features'),
('readme_password_tools','Generator and heuristic strength tester','README.md','concept','Features'),
('readme_optional_hibp','Optional padded HIBP prefix lookup','README.md','concept','Features'),
('security_threat_model','Security threat model and limits','SECURITY.md','document','Security model'),
('security_trusted_master_input','Master password only on extension origins','SECURITY.md','rationale','Security model'),
('security_no_secure_erasure_claim','Revocation is not physical memory erasure','SECURITY.md','rationale','Security model'),
('security_no_biometric_bypass','No verify-only or Trusted Device bypass','SECURITY.md','rationale','Security model'),
('security_clipboard_ownership','Ownership-aware best-effort clipboard cleanup','SECURITY.md','rationale','Security model'),
('security_historical_passwords','Historical snapshots retain historical passwords','SECURITY.md','concept','Migration and recovery'),
('auth_auth_confirmation_document','Extension confirmation window document','auth/auth.html','document','SecurePass confirmation'),
('auth_auth_master_form','Master unlock and create form','auth/auth.html','concept','unlockForm'),
('auth_auth_account_choice','Explicit account and save confirmation','auth/auth.html','concept','accounts / save'),
('docs_implementation_remediation','Phase 1 remediation mapping F01–F32','docs/IMPLEMENTATION.md','document','Findings mapped to changes'),
('docs_implementation_completed_checks','Recorded implementation checks','docs/IMPLEMENTATION.md','concept','Final automated checks'),
('docs_review_phase1_historical_review','Historical baseline review 5aed51c','docs/REVIEW_PHASE1.md','document','Parecer'),
('docs_review_phase1_historical_exposure','Historical master input and disclosure risks','docs/REVIEW_PHASE1.md','concept','F01–F03'),
('docs_review_phase1_historical_integrity','Historical mutation and Sync integrity risks','docs/REVIEW_PHASE1.md','concept','F04–F08'),
('docs_validation_acceptance','Validation and release acceptance checklist','docs/VALIDATION.md','document','Validation and release checklist'),
('docs_validation_regression_suite','36 regressions and 65 module checks','docs/VALIDATION.md','concept','Recorded automated result — version 0.2.0'),
('docs_validation_virtual_prf','Chromium virtual PRF validation','docs/VALIDATION.md','concept','Automated coverage'),
('docs_validation_emulated_sync','Two-profile emulated Sync transport','docs/VALIDATION.md','concept','Automated coverage'),
('docs_validation_platform_acceptance','Physical device and Google Sync acceptance','docs/VALIDATION.md','concept','Hardware/platform checks before distribution'),
('offscreen_clipboard_document','Invisible clipboard handler document','offscreen.html','document','Offscreen Clipboard Handler'),
('popup_popup_management_document','Popup management interface document','popup/popup.html','document','SecurePass'),
('popup_popup_sync_recovery_controls','Sync conflict and recovery controls','popup/popup.html','concept','Sync and recovery'),
('popup_popup_security_preferences','Theme timeout and PRF revocation controls','popup/popup.html','concept','Appearance / Security')]
rationale={
'architecture_envelope_encryption':'A random 256-bit data key encrypts entries; a PBKDF2-SHA256 master key wraps it, with vault identity, revision and ancestry authenticated.',
'architecture_revocable_session':'Restricted session storage retains the data key and deadline across worker suspension without retaining the master password; locking invalidates pending operations.',
'architecture_transactional_mutations':'Copy-on-write mutations, a queue, Web Locks and revision checks prevent accepted concurrent writes from being lost.',
'architecture_explicit_conflicts':'An unseen remote head blocks editing; explicit resolution preserves remote and previous local encrypted records.',
'architecture_safe_compaction':'Compaction traverses published ancestry in one snapshot, preserving heads and in-flight uploads rather than resurrecting old heads.',
'architecture_capability_matrix':'The popup, confirmation window and content scripts receive different capabilities; one approved credential reaches the original document only.',
'readme_supported_scope':'Incognito, file URLs, cross-origin frames and website shadow-root fields are unsupported; PRF requires compatible hardware.',
'readme_local_capacity':'Local limits are 5000 entries or 3 MB, imports 5 MB, and Chrome Sync approximately 100 KB; remote failure does not discard local saves.',
'readme_save_candidates':'Candidates remain in trusted session storage for at most five minutes and need user confirmation that the website accepted them.',
'readme_password_tools':'Unsupported or impossible site constraints fail explicitly; the strength score is a heuristic, not a human-password cracking estimate.',
'readme_optional_hibp':'Only a five-character SHA-1 prefix is transmitted after explicit request; absence from HIBP does not guarantee safety.',
'security_trusted_master_input':'Inline website controls never receive the master password.',
'security_no_secure_erasure_claim':'JavaScript cannot promise physical erasure of strings or all runtime copies; application locking revokes access and drops references.',
'security_no_biometric_bypass':'Legacy local unlock keys and plaintext session seeds are removed; non-PRF authenticators fall back to the master password.',
'security_clipboard_ownership':'Clipboard reading checks ownership before erasing, contents are not persisted, and only the bundled worker invokes the offscreen listener.',
'security_historical_passwords':'Rotating the live key does not change passwords protecting historical backups or snapshots.',
'agents_manual_verification':'Cryptographic changes need tests or a clear procedure; biometric checks require supported hardware and disposable credentials.',
'docs_validation_platform_acceptance':'Physical authenticator, Google-authenticated Sync, OS clipboard/sleep and screen-reader acceptance are not established by virtual or emulated tests.'}
nodes=[]
for id,label,file,kind,loc in rows:
 n={'id':id,'label':label,'file_type':kind,'source_file':str(root/file),'source_location':loc,'source_url':None,'captured_at':None,'author':None,'contributor':None}
 if id in rationale:n['rationale']=rationale[id]
 if id.startswith('docs_review_phase1_'):n['temporal_scope']='Historical baseline commit 5aed51c; implementation status is recorded separately in IMPLEMENTATION.md.'
 if id=='docs_validation_platform_acceptance':n['status']='Pending platform acceptance'
 nodes.append(n)
edges=[]
def edge(source,target,file,relation='references',confidence='EXTRACTED',score=1.0,loc=None):
 edges.append({'source':source,'target':target,'relation':relation,'confidence':confidence,'confidence_score':score,'source_file':str(root/file),'source_location':loc,'weight':1.0})
# Explicit document contents.
for source,prefix,file in [('architecture_modular_boundaries','architecture_','ARCHITECTURE.md'),('readme_securepass','readme_','README.md'),('security_threat_model','security_','SECURITY.md'),('docs_validation_acceptance','docs_validation_','docs/VALIDATION.md')]:
 for id,label,f,kind,loc in rows:
  if id.startswith(prefix) and id!=source:edge(source,id,file,loc=loc)
for a,b,file,loc in [
('agents_repository_guidelines','agents_manual_verification','AGENTS.md','Testing Guidelines'),
('auth_auth_confirmation_document','auth_auth_master_form','auth/auth.html','unlockForm'),
('auth_auth_confirmation_document','auth_auth_account_choice','auth/auth.html','accounts / save'),
('docs_implementation_remediation','docs_implementation_completed_checks','docs/IMPLEMENTATION.md','Final automated checks'),
('docs_review_phase1_historical_review','docs_review_phase1_historical_exposure','docs/REVIEW_PHASE1.md','F01–F03'),
('docs_review_phase1_historical_review','docs_review_phase1_historical_integrity','docs/REVIEW_PHASE1.md','F04–F08'),
('popup_popup_management_document','popup_popup_sync_recovery_controls','popup/popup.html','Sync and recovery'),
('popup_popup_management_document','popup_popup_security_preferences','popup/popup.html','Appearance / Security'),
('agents_repository_guidelines','architecture_modular_boundaries','AGENTS.md','Project Structure'),
('readme_securepass','security_threat_model','README.md','Security and permissions'),
('readme_securepass','architecture_modular_boundaries','README.md','Security and permissions'),
('readme_securepass','docs_validation_acceptance','README.md','Development and checks'),
('readme_securepass','docs_implementation_remediation','README.md','Development and checks'),
('docs_implementation_remediation','docs_review_phase1_historical_review','docs/IMPLEMENTATION.md','Scope'),
('security_threat_model','docs_validation_acceptance','SECURITY.md','Validation limits'),
('docs_implementation_remediation','docs_validation_acceptance','docs/IMPLEMENTATION.md','Validation boundary')]:edge(a,b,file,loc=loc)
# Explicit architecture references to AST file nodes; don't redefine their code provenance.
for a,b in [
('architecture_envelope_encryption','src_vault_crypto'),
('architecture_revocable_session','src_vault_session'),
('architecture_transactional_mutations','src_vault_queue'),
('architecture_transactional_mutations','src_utils_storage'),
('architecture_immutable_sync','src_vault_sync'),
('architecture_explicit_conflicts','src_vault_syncservice'),
('architecture_safe_compaction','src_vault_syncservice'),
('architecture_capability_matrix','src_security_messages'),
('architecture_verified_prf','src_biometric_service'),
('architecture_trusted_confirmation','src_autofill_requests'),
('architecture_modular_boundaries','background_serviceworker'),
('architecture_modular_boundaries','src_cryptovault'),
('architecture_modular_boundaries','popup_state')]:edge(a,b,'ARCHITECTURE.md',loc='Boundaries')
for a,b,f in [('auth_auth_confirmation_document','auth_auth','auth/auth.html'),('offscreen_clipboard_document','offscreen','offscreen.html'),('popup_popup_management_document','popup_popup','popup/popup.html')]:edge(a,b,f,loc='script src')
for a,b,file,score in [
('security_trusted_master_input','architecture_trusted_confirmation','SECURITY.md',0.95),
('security_no_secure_erasure_claim','architecture_revocable_session','SECURITY.md',0.85),
('security_no_biometric_bypass','architecture_verified_prf','SECURITY.md',0.95),
('security_historical_passwords','readme_encrypted_backups','SECURITY.md',0.95),
('security_clipboard_ownership','offscreen_clipboard_document','SECURITY.md',0.95),
('readme_save_candidates','architecture_capability_matrix','README.md',0.85),
('readme_local_capacity','architecture_safe_compaction','README.md',0.85),
('popup_popup_sync_recovery_controls','architecture_explicit_conflicts','popup/popup.html',0.95),
('popup_popup_security_preferences','architecture_verified_prf','popup/popup.html',0.95),
('docs_validation_virtual_prf','architecture_verified_prf','docs/VALIDATION.md',0.95),
('docs_validation_emulated_sync','architecture_explicit_conflicts','docs/VALIDATION.md',0.95),
('docs_review_phase1_historical_exposure','security_trusted_master_input','docs/REVIEW_PHASE1.md',0.95),
('docs_review_phase1_historical_integrity','architecture_transactional_mutations','docs/REVIEW_PHASE1.md',0.95)]:edge(a,b,file,relation='conceptually_related_to',confidence='INFERRED',score=score)
edge('agents_manual_verification','docs_validation_platform_acceptance','AGENTS.md',relation='semantically_similar_to',confidence='INFERRED',score=0.85)
hyperedges=[{'id':'architecture_vault_integrity_boundary','label':'Vault integrity through encryption revocation and transactions','nodes':['architecture_envelope_encryption','architecture_revocable_session','architecture_transactional_mutations'],'relation':'form','confidence':'EXTRACTED','confidence_score':1.0,'source_file':str(root/'ARCHITECTURE.md')},{'id':'docs_validation_acceptance_boundary','label':'Automated verification versus platform acceptance','nodes':['docs_validation_regression_suite','docs_validation_virtual_prf','docs_validation_emulated_sync','docs_validation_platform_acceptance'],'relation':'form','confidence':'EXTRACTED','confidence_score':1.0,'source_file':str(root/'docs/VALIDATION.md')}]
files=['AGENTS.md','ARCHITECTURE.md','README.md','SECURITY.md','auth/auth.html','docs/IMPLEMENTATION.md','docs/REVIEW_PHASE1.md','docs/VALIDATION.md','offscreen.html','popup/popup.html']
coverage={str(root/f):len((root/f).read_text().splitlines()) for f in files}
result={'nodes':nodes,'edges':edges,'hyperedges':hyperedges,'input_tokens':0,'output_tokens':0,'coverage':coverage}
ast=json.loads((root/'graphify-out/.graphify_ast.json').read_text())
ids={n['id'] for n in nodes}|{n['id'] for n in ast['nodes']}
missing={e[k] for e in edges for k in ['source','target'] if e[k] not in ids}
assert not missing,missing
p=root/'graphify-out/.graphify_result_01.json';p.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':')))
print(len(nodes),'nodes;',len(edges),'edges; coverage:',coverage)
