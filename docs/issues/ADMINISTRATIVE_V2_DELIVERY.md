# Administrative protocol-v2 delivery

Local v2 authority/content transactions are implemented, but administrative
delivery still accepts v1 chains only. Add a bounded canonical v2 packet carrying
the verified administrative ancestry, protected administrative key, the exact
epoch/master protection bound by authority, and any digest-bound encrypted
historical/recovery artifacts. Content ciphertext remains in its own namespace.

Use independent root/checkpoint trust; a packet's declared head is not a fresh
trust source. Preserve immutable per-operation material and DAG ancestor subsets,
with durable attempt/uncertainty, exact read-back, reload/reuse and ordered delivery
before content. Recheck binding, full authority snapshot and operation material
before I/O/acknowledgement. Unknown or damaged versions preserve local branches.

No public onboarding, received-administration adoption, global rotation/recovery,
production gate change or real Google/release acceptance belongs to this block.
