# Protocol-v2 local transactions

Vault-v3 and graph/revision-v2 currently exist as isolated cryptographic helpers.
Implement explicit internal bootstrap, enrollment/revocation and normal mutation
signing for an already-created v3 vault. Persist original signed packets with
vault/authority/outbox changes so parent digests remain verifiable after reload
and acknowledgement. Never infer signed history from unsigned revision IDs.

Administrative changes preserve the current authenticated content as an anchor
and create a new signed direct descendant under the new authority. Transactions
must compare the old vault, registry and binding; abort or lock must roll back
everything. Bounded history refuses exhaustion without dropping branches.

This block does not silently migrate v2, expose public onboarding, enable
production writes or implement the v2 administrative transport/rotation/recovery
controllers. Those remain follow-up integration, with independent review open.
