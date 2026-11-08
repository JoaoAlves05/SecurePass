# Tombstones cifrados persistentes — SC22–SC25

Bloco de implementação de 08/11/2026: introduzir payload cifrado versionado com
entradas, tombstones por ID/revisão e proveniência de restauro. Ler payloads
anteriores; só migrar numa gravação explícita. O kind novo faz clientes anteriores
recusarem o payload em vez de apagarem metadados desconhecidos ao regravar.

Cada mutação compara com o payload anterior autenticado. Eliminações deixam um
tombstone; reintroduzir o mesmo ID exige um percurso de recuperação/importação
explícito. Edições preservam história. Restauros mantêm proveniência da eliminação
resolvida. Rotação protege a história ativa e os checkpoints sem perder metadados.
Limitar metadados e tamanho UTF-8 total; nunca truncar tombstones para caber.

A cifragem e AAD v2 mantêm-se. O wrapper assinado autentica o ciphertext completo.
Este incremento não ativa Drive, GC, convergência distribuída ou formato
criptográfico novo; revisão de nonces/lifecycle e integração do merge continuam.

Implementado em `vault/payload.js`, crypto e percursos explícitos de recuperação.
251 testes Node, check de 139 módulos e Chromium de merge/commit/checkpoints
aprovados; o cenário de commit confirma tombstone no ciphertext assinado.
Ver [contrato](../VAULT_PAYLOAD.md) e [evidência](../VALIDATION.md). A integração
da história no merge persistido continua em aberto.
