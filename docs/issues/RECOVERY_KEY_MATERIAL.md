# Recovery and historical key material

Protocol-v2 authority already binds recovery and historical-key digests, but no
implementation can yet produce or open those artifacts. Implement bounded,
canonical, domain-separated encrypted artifacts before integrating activation,
global rotation and recovery controllers. Recovery uses an independent P-256
signer and RSA-OAEP-3072 encryption key; its private material is encrypted with
a random 256-bit printed secret. Later master rotation can wrap a new content
root using only the recovery public key. Historical content roots are encrypted
under the new root, never the reverse.

Opening must require an opaque verified live authority and exact digest/context
matches. A generated candidate is not enrolled, and a successful cryptographic
test is not durable activation. No public route, storage migration, clipboard
write, production gate change or release acceptance belongs to this block.
