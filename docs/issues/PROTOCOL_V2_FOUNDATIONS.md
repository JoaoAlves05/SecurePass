# Protocol foundations for rotation and recovery — SC14–SC27, SC47, SC55

The v1 prototype cannot safely supply complete cross-epoch administration by
merely re-signing old packets. Close the internal technical contract before coding
its new format; independent security review and production acceptance stay open.

Required changes: administrative ownership of the master-protection digest;
content ancestry bound to complete unsigned-payload digests instead of IDs alone;
multiple signed administrative parents for concurrent legitimate transitions;
separate administrative/recovery/writer roles; and per-encryption derived content
keys with fresh 256-bit HKDF salts. No existing stored vault is migrated implicitly.

Retain legacy compatibility as explicit local import/migration, not invented
causality for unsigned or ID-only old histories. Preserve all unresolved branches.
A provider replay without an independent checkpoint remains freshness-unproven.
Stage new primitives and formats behind the unchanged production-review gate,
with known-answer/round-trip/rejection/failure-path regressions and real Chromium.
