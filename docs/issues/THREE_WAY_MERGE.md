# Merge de três vias — SC22–SC25, SC34–SC35

Objetivo do incremento, entregue internamente em `82933d8` e integrado em `main`: planeador sobre snapshots já autenticados, com base comum
explícita, conflitos de edição/eliminação e decisões vinculadas às revisões.
Preservar notas, password do destino, identidades e heads não selecionados.

Este incremento não ativa escrita Drive nem altera o merge aditivo legacy.
A persistência/autenticação de tombstones, seleção de ancestral comum e UI de
resolução dependem da integração com o formato revisto. Não inferir autoridade
criptográfica de arrays ou referências fornecidas ao planeador.

Entregue: `src/vault/threeWayMerge.js`, doze regressões Node e cenário Chromium
com comparação de ID UTF-8 entre runtimes. Resultados e limites em
[VALIDATION.md](../VALIDATION.md). As permutações exercitadas partilham uma base;
não estabelecem convergência completa de histórias administrativas/dispositivos.
