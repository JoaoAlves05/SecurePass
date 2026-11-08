# Bounded recovery archive reader

Implemented 2026-11-08 for the existing `securepass-encrypted-recovery` version 1
aggregate format. This is a local import path, separate from Drive packet review.

The popup accepts at most 256 MiB per aggregate archive, 100 encrypted records
across `snapshots` and `sync`, and 16 MiB per individual record. Regular encrypted
or plaintext backups retain the existing 16-MiB file limit. No format upgrade or
remote publication is implied by opening a file.

`src/recoveryArchive.js` scans `File.slice()` windows of 64 KiB and parses one
bounded record at a time. It retains only offset/digest/display metadata between
records. UTF-8 decoding is fatal; an optional leading BOM is accepted. The whole
root must contain exactly the supported kind/version/snapshots/sync keys, with
no duplicates, trailing JSON, excessive nesting or truncated records. Invalid
encrypted envelopes are counted and omitted from choices; malformed JSON rejects
the whole archive. This structural inventory does not authenticate ciphertext.

Choices use private source/byte-range/SHA-256 identities, independent of array
position or displayed revision. Only the selected record is reread; its size and
digest must match before it is returned. Untrusted optional legacy metadata is
bounded before display. File-read errors do not expose local exception details.
An AbortSignal cancels reader work before inventory/selection completion; the
current UI offers cancellation in the completed inventory dialog.

The existing protected recovery dialog authenticates the selected record using
its historical password, checks the current destination revision and requires
explicit confirmation. Restoring over an existing vault retains that vault's
master protection and turns Sync off. Opening, scanning or cancelling does not
write a vault. New/reprotected records validate their resulting identities before
recovery publication-suppression markers can be written.

Memory is bounded by a read window plus the current individual record's encoded,
parsed and validation representations, rather than the aggregate archive size.
Selected-record decryption still allocates its bounded ciphertext/plaintext.
This is not a constant-heap claim or a compressed format. The separate guided
batch export uses `vault/recoveryExport.js`: up to 100 metadata-only choices,
source/digest revalidation, and one individually importable file of at most
16 MiB per confirmed download request. Invalid versions are identified before
starting. Cancel stops between files; lock/pagehide suppress late preparation
results. Requested downloads are distinguished from confirmed disk completion.

Reproduce with `npm test`, `npm run check` and
`npm run test:recovery-archive-browser` and
`npm run test:recovery-export-browser`. The browser scenario uses disposable
credentials and temporary profiles; it includes >16-MiB encrypted history and an
exactly 256-MiB on-disk archive. See [validation evidence](VALIDATION.md) and
[remaining checklist](IMPLEMENTATION_CHECKLIST.md).
