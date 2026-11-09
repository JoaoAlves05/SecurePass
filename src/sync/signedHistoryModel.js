const encoder = new TextEncoder();
export const signedHistoryKey = vaultId => {
  if (typeof vaultId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(vaultId)) throw new Error('Invalid signed-history vault.');
  return `driveSignedHistory:${vaultId}`;
};
// Storage bookkeeping only; callers must authenticate each body against a
// verified graph/reference before using it as a parent or historical content.
export function appendSignedHistory(previous, packet) {
  const value = previous || { version: 2, packets: [] };
  if (value.version !== 2 || !Array.isArray(value.packets) || value.packets.length > 128) throw new Error('Signed history is damaged. Preserve it for recovery.');
  const publication = packet?.publication;
  if (!publication || typeof publication.body !== 'string' || publication.body.length > 16 * 1024 * 1024 || encoder.encode(publication.body).length > 16 * 1024 * 1024 || typeof packet.authorization !== 'string' || !/^[a-f0-9]{64}$/.test(packet.authorization)) throw new Error('Invalid bounded signed-history packet.');
  signedHistoryKey(publication.vaultId);
  if (typeof publication.revisionId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(publication.revisionId)) throw new Error('Invalid signed-history revision.');
  let previousSize = 0; const revisions = new Set();
  for (const entry of value.packets) {
    if (entry?.publication?.vaultId !== publication.vaultId || typeof entry.publication.revisionId !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(entry.publication.revisionId) || typeof entry.publication.body !== 'string' || entry.publication.body.length > 16 * 1024 * 1024 || typeof entry.authorization !== 'string' || !/^[a-f0-9]{64}$/.test(entry.authorization)) throw new Error('Signed history is damaged. Preserve it for recovery.');
    if (revisions.has(entry.publication.revisionId)) throw new Error('Signed history contains duplicate revisions. Preserve it for recovery.');
    revisions.add(entry.publication.revisionId);
    const bytes = encoder.encode(entry.publication.body).length;
    previousSize += bytes;
    if (bytes > 16 * 1024 * 1024 || previousSize > 64 * 1024 * 1024) throw new Error('Signed history exceeds the preservation budget.');
  }
  const found = value.packets.find(item => item.publication.revisionId === publication.revisionId);
  if (found) {
    if (JSON.stringify(found) !== JSON.stringify({ publication, authorization: packet.authorization })) throw new Error('Signed history revision was substituted.');
    return value;
  }
  const size = previousSize + encoder.encode(publication.body).length;
  if (value.packets.length >= 128 || size > 64 * 1024 * 1024) throw new Error('Signed history capacity reached. Preserve branches before reviewing retention.');
  return { version: 2, packets: [...value.packets, { publication: structuredClone(publication), authorization: packet.authorization }] };
}
