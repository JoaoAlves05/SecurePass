# Commit de merge autenticado — SC22–SC25

Continuação de 08/11/2026 após tombstones: vincular o preview ao contexto assinado
e ao vínculo Drive, preservar história dos dois ramos e proveniência de cópias,
resolver conflitos de tombstone versus entrada sem uma base viva, e gravar
cofre/checkpoint/pacote assinado na transação existente. Exigir sessão/revisão,
autorização e vínculo atuais. Recusar previews simples/forjados, duplo commit,
falhas de capacidade e mudanças de contexto sem efeitos parciais.

Este serviço interno não cria enrollment nem handlers/UI e não habilita o worker
Drive de produção. Apenas os dois heads selecionados entram nos parents; outros
ramos não são implicitamente resolvidos. GC e rebase entre épocas continuam fora
deste incremento.

Implementado: `mergeService.js`, contexto opaco autenticado e fixado no preview,
`resolveThreeWayPayload`, proveniência de cópias no payload e exigência de contexto
no repositório. Conserva tombstones conhecidos na base, mesmo se omitidos pelos
heads. Uma cópia não pode reutilizar um ID tombstonado. Mudança de conta ou
autorização durante preparação é recusada antes da transação; as guardas da
transação continuam a comparar o contexto esperado.

Evidência: 257 testes Node, check de 142 módulos e três cenários Chromium
aprovados, incluindo novo `test:merge-commit-browser` com rollback/retry real.
Ver [VALIDATION.md](../VALIDATION.md). UI, lifecycle, retenção/rebase e convergência
entre autorizações/épocas permanecem em aberto.
