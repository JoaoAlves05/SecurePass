# Drive transport implementation status

`src/sync/driveTransport.js` implements bounded, read-only listing and download through an injected token provider and binding guard. It is not registered in the worker router and has no UI activation, OAuth configuration or manifest permissions. Publication and application of remote data remain unavailable.

The reader restricts listing to appDataFolder, follows all page tokens, rejects incomplete/looping/duplicate discovery and bounds pages, file count and response bytes. Downloaded text is untrusted staging data; the caller must verify format, authorization, signatures and ciphertext before using it. A successful listing does not verify vault identity or history freshness.

The caller must provide an immutable binding identity and an `assertBinding` callback that rejects off-mode automatic work, changed accounts/vaults/generations and revoked operations. The reader checks it before token acquisition, before fetching and after reading. It never prompts for OAuth or stores tokens. Redirects and ambient cookies are disabled. Cancellation aborts fetch/body reads; response and provider error text do not become diagnostics.

Authentication, permissions, capacity, missing files and transient failures have separate error codes. No automatic retry is performed here; the durable coordinator must schedule bounded backoff and reconcile uncertain writes once publication exists. Thus this module alone does not implement Sync, revocation or account switching.

Tests: `tests/driveTransport.test.js` covers complete/incomplete pagination, changed binding, error classification, rejected IDs and declared/streamed size limits. Real Google acceptance remains pending.

API references checked on 2026-11-04: [appDataFolder](https://developers.google.com/workspace/drive/api/guides/appdata), [files.list](https://developers.google.com/workspace/drive/api/reference/rest/v3/files/list), [error handling](https://developers.google.com/workspace/drive/api/guides/handle-errors).
