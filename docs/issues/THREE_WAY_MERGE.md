# Merge de três vias — SC22–SC25, SC34–SC35

Objetivo do incremento, entregue internamente em `82933d8` e integrado em `main`: planeador sobre snapshots já autenticados, com base comum
explícita, conflitos de edição/eliminação e decisões vinculadas às revisões.
Preservar notas, password do destino, identidades e heads não selecionados.

Este incremento não ativa escrita Drive nem altera o merge aditivo legacy.
A persistência/autenticação de tombstones e UI de resolução dependem da
integração com o formato revisto. A seleção autenticada interna de ancestral
comum foi acrescentada no incremento de 08/11 abaixo. Não inferir autoridade
criptográfica de arrays ou referências fornecidas ao planeador.

Entregue: `src/vault/threeWayMerge.js`, doze regressões Node e cenário Chromium
com comparação de ID UTF-8 entre runtimes. Resultados e limites em
[VALIDATION.md](../VALIDATION.md). As permutações exercitadas partilham uma base;
não estabelecem convergência completa de histórias administrativas/dispositivos.


## Continuação — ancestral autenticado, 08/11/2026

`src/vault/authenticatedMerge.js` liga a verificação de pacotes assinados ao
planeador existente. Captura inputs antes de I/O assíncrono, verifica todos os
pacotes contra a mesma autorização verificada, recusa equivocações da mesma
revisão e seleciona o único ancestral comum mais próximo no DAG completo.
Só depois decifra base/local/remoto com a chave da sessão, exigindo IDs e datas
presentes no plaintext autenticado antes de aplicar defaults de importação.
O preview continua opaco, sem passwords; a guarda síncrona do chamador deve
comparar sessão, vínculo, autorização e heads atuais durante preparação e revisão.
A cópia temporária da chave é apagada no final, incluindo caminhos de erro.

Limites explícitos: até 256 pacotes e 32 MiB UTF-8 agregados; cada pacote mantém
o limite do protocolo assinado. Todos os antecessores referenciados têm de estar
presentes, incluindo os de ramos adicionais fornecidos. Ciclos, histórias
incompletas, bases comuns múltiplas ou inexistentes e épocas/autorizações
incompatíveis são recusados sem escrever storage ou publicar. Downloads
repetidos são aceites apenas se descrevem exatamente o mesmo registo; diferenças
na assinatura ECDSA não criam uma falsa equivocação.

Este adaptador interno não descobre revisões no Drive, não estabelece frescura
remota por si só e não está ligado a handlers/UI. Histórias entre estados
administrativos/épocas, retenção/checkpoints autenticados, tombstones persistidos,
rebase e convergência distribuída permanecem por implementar. A recusa de
história antiga/incompleta preserva os ramos; não equivale a apagá-los ou resolvê-los.
