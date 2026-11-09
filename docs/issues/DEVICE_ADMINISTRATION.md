# Durable device administration — SC03, SC16, SC26, SC47

Implement the missing administrative application service over the existing signed
chain and protected signing keys. Authenticate the current master password for
bootstrap/enrollment/revocation; normal content/biometric authority cannot grant
administrative powers. Keep the existing cipher format and production-write gate.

Commit the verified chain, master-protected administrative key, local writer and
exact signed administrative operation atomically with a vault/head comparison.
Preserve content outboxes and unresolved branches. Persist operation IDs for
idempotent retry; reused IDs with other inputs fail. Concurrent administrative
heads are conflicts, not a larger-counter winner. Never remove the last writer
or replace a device public key implicitly. Self-revocation suspends publication.

Regressions must cover master proof, independent root, replay/restart, registry
limits, stale head, revocation, transaction abort, lock/expiry and ciphertext-only
persistence. Public onboarding, administrative transport, key rotation/recovery
and external security acceptance remain separate integration steps until delivered.
