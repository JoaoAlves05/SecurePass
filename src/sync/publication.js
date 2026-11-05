// Durable scheduling policy. The store must commit these transitions transactionally
// and bind each operation to account, vault and binding generation.
export function createPublicationCoordinator({ store, transport, now = Date.now, random = Math.random }) {
  if (!store || !transport) throw new Error('Publication store and transport are required.');
  let running;
  async function execute() {
    const operation = await store.next();
    if (!operation) return { idle: true };
    if (operation.blocked) return { pending: true, blocked: true };
    if (operation.nextAttempt > now()) return { pending: true };
    await store.assertCurrent(operation);
    if ((operation.attempts || 0) >= 20) {
      await store.recordFailure(operation, { attempts: operation.attempts, code: 'retry-limit', nextAttempt: null, outcome: operation.outcome || 'unknown', blocked: true });
      return { pending: true, blocked: true };
    }
    const attempts = (operation.attempts || 0) + 1;
    // Persist uncertainty before I/O; a crash must resume the same revision.
    await store.markSending(operation, { attempts, outcome: 'unknown' });
    try {
      const result = await transport.publish(operation.binding, operation.publication);
      if (result?.verified !== true || result.revisionId !== operation.publication.revisionId) throw Object.assign(new Error('Publication not verified'), { code: 'publication-unconfirmed', retryable: true });
      await store.assertCurrent(operation);
      await store.acknowledge(operation, result);
      return { published: true, revisionId: operation.publication.revisionId };
    } catch (error) {
      // Changed/off-mode binding leaves the old operation suspended. Never attach
      // it to the next account or claim remote rollback after an uncertain write.
      try { await store.assertCurrent(operation); } catch { return { suspended: true, outcome: 'unknown' }; }
      const retryable = error.retryable === true;
      const delay = Math.max(Number.isFinite(error.retryAfter) ? error.retryAfter : 0, Math.min(3600000, 1000 * 2 ** Math.min(attempts, 12)) * (0.5 + random() * 0.5));
      await store.recordFailure(operation, {
        attempts, code: ['authentication-required', 'missing', 'temporarily-unavailable', 'capacity', 'permission-denied', 'request-rejected', 'response-too-large', 'binding-changed', 'connection-interrupted', 'publication-unconfirmed', 'revision-content-conflict'].includes(error.code) ? error.code : 'publication-failed',
        nextAttempt: retryable ? now() + Math.min(delay, 86400000) : null,
        outcome: 'unknown', blocked: !retryable
      });
      return { pending: true, blocked: !retryable };
    }
  }
  return { run() {
    if (!running) running = execute().finally(() => { running = null; });
    return running;
  } };
}
