# Revisão atual — Settings, Sync e Data Management

Documentado em 25/10/2026. Investigação e reproduções realizadas em 24/10/2026 sobre a versão 0.2.0, commit `e97f4c6558be23e50016a9b473441ce4c431490a`. O código de produção não foi alterado durante a revisão nem nesta atualização documental. As alterações preexistentes de instruções, screenshots e artefactos Graphify não constituem correções destes problemas.

Este é o registo atual para estes fluxos. [REVIEW_PHASE1.md](REVIEW_PHASE1.md) é uma revisão histórica de outra versão; os checkboxes em [IMPLEMENTATION.md](IMPLEMENTATION.md) indicam existência de implementação, não aceitação completa. Todos os itens SD e UX01–UX06 abaixo continuam **abertos**; UX07 foi tratado nesta atualização documental. As propostas em [SYNC_DATA_PLAN.md](SYNC_DATA_PLAN.md) aguardam discussão e não descrevem funcionalidade já disponível.

## Atualização posterior à baseline

Foi implementado um [incremento local/legacy](SETTINGS_UX_IMPLEMENTATION.md) com novo [desenho e matriz de ecrãs](SETTINGS_UX_DESIGN.md). As descrições SD abaixo preservam a revisão original; não são uma afirmação de que os defeitos mitigados continuam inalterados no working tree. O estado atual e os limites de aceitação estão no relatório do incremento. A nova Sync Drive e o plano completo continuam por concluir.

## Evidência e limites

- **R:** reproduzido com dados descartáveis, Web Crypto real e Chrome/IndexedDB simulados, salvo indicação explícita de Chromium.
- **A:** resultado de análise do código; o cenário completo ainda precisa de uma regressão executável.
- Os snippets exploratórios foram executados durante a revisão e não foram adicionados à suite. Os cenários abaixo são especificações para regressões futuras, não testes já presentes.
- Resultado registado: 38 testes Node passaram; 65 módulos passaram no check; o teste Sync com dois perfis Chromium e transporte emulado passou; `git diff --check` passou.
- Foi executado um cenário Chromium adicional de restauração/UI. A suite geral `test:browser` e o empacotamento não foram repetidos nesta revisão; os resultados anteriores são históricos.
- Não houve Google Sync autenticado, autenticadores físicos, matriz de sistemas operativos, leitor de ecrã ou certificação independente. Ver [VALIDATION.md](VALIDATION.md).

Prioridade **alta** significa corrigir antes de aceitar estes fluxos para utilização com dados reais. **Média** identifica comportamento que também deve ser corrigido para considerar a funcionalidade completa. Não significa que esteja aceite para release.

## Problemas e critérios de aceitação

### SD01 — Merge pode gravar um cofre que deixa de desbloquear

**Alta · R.** `src/vault/syncService.js`, `resolveSyncGeneration()`: a cópia conflitante recebe texto adicional nas notas sem validação final. Com o mesmo ID e uma nota remota válida de 4096 caracteres, o merge termina mas o desbloqueio seguinte falha. A construção do resultado também não passa pelas verificações de capacidade das mutações normais.

**Aceitação:** validar campos, identidade, número de entradas e tamanho agregado antes de qualquer efeito persistente; guardar metadados de conflito sem exceder os campos do utilizador. Testar limites exatos, Unicode, capacidade e round-trip após reabrir.

### SD02 — Resolver uma versão retira outras versões da lista de conflitos

**Alta · R.** `src/vault/syncService.js`, `resolveSyncGeneration()`: apenas a versão selecionada contribui entradas, mas todos os heads remotos são declarados antecessores. Num cenário local + heads A e B, selecionar A produziu entradas local+A e um único head; B ficou apenas no arquivo deste dispositivo.

**Aceitação:** a operação deve explicitar quais versões incorpora ou descarta. Heads não resolvidos permanecem ativos; uma escolha não pode implicitamente resolver os restantes. Testar três ou mais dispositivos e recuperação num perfil que não possui o arquivo local.

### SD03 — Publicação remota com Sync desligado e download com efeitos globais

**Alta · R/A.** `src/vault/syncService.js`, `retrySync()` e `resolveSyncGeneration()`: falta uma guarda de modo. Retry foi reproduzido a publicar depois de desligar Sync. A ação de versão selecionada cria e publica uma revisão, em vez de fazer apenas uma restauração local.

**Aceitação:** definir e aplicar uma política de publicação no background; separar restauro local de resolução/publicação global. Testar todos os handlers com Sync desligado, incluindo pedidos diretos sem a UI.

### SD04 — Falta de espaço que compactação e Retry não resolvem

**Alta · R.** `src/vault/sync.js`, `publishGeneration()`: uma geração atual e a próxima têm de coexistir. Um cofre com dez entradas, cada uma com notas de 4000 caracteres, publicou inicialmente; a atualização ficou pendente, Compact removeu zero itens e Retry voltou a falhar.

**Aceitação:** calcular a margem para a próxima publicação, apresentar capacidade suportada e disponibilizar uma estratégia recuperável para a transição. Não prometer sincronizar os 3 MB locais num transporte de aproximadamente 100 KB.

### SD05 — Manifesto pode exceder quota individual

**Alta · R do tamanho/A da rejeição real.** `src/vault/sync.js`: o preflight cobre apenas o total. Um manifesto com 256 UUIDs de ancestralidade mediu 10 173 bytes; Chrome permite 8192 bytes por item. A simulação de storage não aplica essa quota. Compactar não reescreve a ancestralidade atual.

**Aceitação:** validar cada item, total, número de itens e ritmo de escrita; rever o modelo de ancestralidade. Confirmar a rejeição e recuperação num browser com quotas reais. [Referência Chrome](https://developer.chrome.com/docs/extensions/reference/api/storage#property-sync).

### SD06 — Gravação de preferências pode reverter uma transição Sync

**Alta · R.** `src/settings.js`, `saveSettings()`: leitura/validação/escrita fora da fila do cofre. Uma gravação que leu `false` terminou depois da ativação e voltou a gravar `false` sem executar uma transição de modo.

**Aceitação:** separar preferência comum de estado operacional Sync e coordenar as escritas. Testar interleavings determinísticos e dois contextos de gestão.

### SD07 — Recovery exportado pode ser recusado pelo próprio importador

**Alta · R.** `popup/modules/dataManagement.js` e `src/messageHandlers/vaultHandlers.js`: exportação agregada sem limite compatível com o seletor de 5 MiB. Dois registos válidos produziram um arquivo de 5 453 874 bytes, acima de 5 242 880 bytes.

**Aceitação:** todo o formato exportado dentro da capacidade anunciada deve poder ser restaurado; alinhar limites ou dividir por snapshot. Testar o máximo de cinco snapshots locais e vinte registos arquivados sem carregar dados ilimitados em memória.

### SD08 — Uma geração incompleta bloqueia toda a leitura remota

**Média · A; estados incompletos têm cobertura parcial existente.** `src/vault/sync.js`, `syncHeads()`: qualquer manifesto/chunk inválido aborta a enumeração inteira, mesmo com outras versões completas.

**Aceitação:** distinguir versões completas, em trânsito e inválidas; manter acesso às válidas sem tratar ausência de chunks como cofre vazio nem ocultar o diagnóstico. Testar entrega fora de ordem e corrupção isolada.

### SD09 — Uploads abandonados e Retry sem verificação completa

**Média · A; falha de publicação tem cobertura parcial existente.** `src/vault/sync.js`: chunks podem sobreviver à falha do manifesto. Compactação não recolhe estes órfãos; manifesto existente provoca retorno antecipado sem verificar os chunks.

**Aceitação:** publicação idempotente com verificação do conteúdo e recuperação/limpeza de uploads abandonados. Distinguir abandono de upload legítimo ainda em curso.

### SD10 — Transições parcialmente aplicadas entre vários armazenamentos

**Média · A.** `src/vault/syncService.js` publica antes da gravação local em ativação/resolução; `src/vault/recovery.js` e `restoreRecovery()` desligam Sync antes da gravação recuperada.

**Aceitação:** documentar fases e estado durável da operação, permitir retoma após suspensão/restart e comunicar efeitos já concluídos. Injetar falhas em cada fronteira; não depender de uma transação distribuída inexistente.

### SD11 — Recuperação/eliminação local podem depender de dados remotos ou corrompidos

**Média · R/A.** `src/vault/recovery.js`: `loadRecord()` consulta Sync se não existir cofre local. Wipe foi reproduzido a falhar devido a uma geração remota incompleta. Um registo indecifrável também impede autenticar a eliminação; restaurações usam o mesmo carregamento do registo atual.

**Aceitação:** recuperação local e eliminação local não dependem da disponibilidade remota. Definir um percurso explícito para eliminar dados irrecuperáveis e testar falhas parciais nas várias áreas de armazenamento.

### SD12 — Restauração deixa o interruptor e texto Sync incorretos

**Média · R em Chromium.** `popup/modules/dataManagement.js`: depois de restaurar, `LOAD_SETTINGS` devolveu `useSync: false`, mas o toggle continuou ligado e o estado indicou `Sync is on`. Falta reconciliar settings e Sync/Recovery view.

**Aceitação:** UI reflete o estado persistido após importação, restauração, erro parcial e reabertura; testar ações através dos controlos reais.

### SD13 — Contadores e controlos Sync/Recovery ficam desatualizados

**Média · A.** `popup/modules/sync.js`: refresh limitado ao arranque e a algumas ações. CRUD e limpeza de arquivo não atualizam todos os consumidores; a consulta local fica atrás de uma consulta remota que pode falhar.

**Aceitação:** refresh por alterações relevantes, consultas locais independentes das remotas e seleção remota preservada quando ainda válida.

### SD14 — Pending não identifica a revisão a publicar

**Média · A.** `src/vault/repository.js`: booleano global pode sobreviver a troca de cofre, restauro ou desativação. Retry pode usar um registo diferente daquele cuja publicação falhou.

**Aceitação:** pendência identifica cofre/revisão e fase; transições reconciliam ou cancelam o trabalho anterior. Não publicar uma revisão substituta por associação acidental.

### SD15 — Alterar auto-lock não atualiza a sessão atual

**Média · R.** `src/settings.js` e `src/vault/session.js`: reduzir 15 para 1 minuto manteve o deadline de aproximadamente 15 minutos até nova ativação/renovação.

**Aceitação:** definir o efeito sobre a atividade já decorrida e aplicar imediatamente a nova política ao deadline/alarme. Testar popup fechado e worker reiniciado.

### SD16 — Atualizações remotas lineares exigem resolução manual

**Média · A; limitação do desenho atual.** `src/vault/repository.js`: se existir cofre local, é sempre devolvido. Não há adoção automática de um sucessor remoto; a edição deteta o head incompatível, mas leitura/autofill podem continuar antigos.

**Aceitação:** definir atualização linear, concorrência e rotação de chave; detetar novidade e apresentar estado coerente. Decidir quando exigir novo desbloqueio sem perder alterações locais.

### SD17 — Legacy fica invisível quando surge uma geração v2

**Média · A.** `src/vault/sync.js` e `compactSync()`: o legacy só é lido se não existirem gerações v2; a limpeza depende de ele aparecer como head. Pode permanecer a ocupar quota fora do inventário apresentado.

**Aceitação:** inventariar os dois formatos; preservar acesso à cópia antiga até migração confirmada e permitir limpeza explícita verificável.

### SD18 — Import normal não restaura diretamente numa instalação nova

**Média · A.** `src/messageHandlers/vaultHandlers.js`, `IMPORT_VAULT`: exige cofre existente e desbloqueado até para preview. A UI pede ficheiro/password antes de explicar esse pré-requisito.

**Aceitação:** fluxo explícito de criação a partir de backup e desbloqueio do destino existente antes de iniciar trabalho desnecessário. Backup adulterado não cria nem altera o destino.

### SD19 — Preview e conflitos de importação insuficientes

**Média · A.** `IMPORT_VAULT` devolve contagem de origem; UI fixa `skip`. Mesmo site/username com passwords diferentes pode ser ignorado sem decisão individual.

**Aceitação:** preview distingue novas, iguais, conflitantes e inválidas; definir preservar ambas/substituir/ignorar. Confirmar sobre a mesma revisão ou invalidar o preview se o destino mudar.

### SD20 — Operações e diálogos incompatíveis podem sobrepor-se

**Média · A.** Módulos `dataManagement.js`, `sync.js`, `vault.js` e `modalResolver.js`: nem todos os botões ficam ocupados e existe um único resolver de password. Merge também não garante previamente o desbloqueio local.

**Aceitação:** exclusão de operações incompatíveis e diálogo exclusivo com cancelamento consistente. Testar duplo clique, duas ações distintas, auto-lock, fecho do popup e dois contextos de gestão.

### SD21 — Rollback das preferências não reconcilia todos os consumidores

**Média · A.** `popup/modules/settings.js`: recarregar settings após erro não reaplica tema/gerador; uma gravação posterior bem-sucedida não reconcilia necessariamente o estado reposto por uma falha anterior.

**Aceitação:** associar gravação/resposta à versão das preferências e reconciliar todos os controlos. Testar falha anterior seguida de sucesso e alterações rápidas.

### SD22 — Settings inválidos interrompem o arranque e o próprio Reset

**Média · A.** `src/settings.js` e `popup/popup.js`: qualquer erro na validação faz terminar bootstrap antes de ligar os listeners.

**Aceitação:** reparação por campo para preferências comuns, estado operacional conservador e percurso de diagnóstico/reset utilizável sem o bootstrap normal. Nunca alterar o modo Sync silenciosamente como fallback.

### SD23 — Snapshot escolhido por índice mutável

**Média · A.** `RESTORE_RECOVERY` recebe um índice lido antes do diálogo/password. Uma gravação concorrente pode deslocar o histórico até à execução.

**Aceitação:** selecionar por identidade/revisão estável e verificar que corresponde à versão apresentada. Se desaparecer, pedir nova seleção; nunca restaurar outro registo pelo mesmo índice.

## Melhorias funcionais e documentação

| ID | Melhoria aberta | Critério de aceitação |
|---|---|---|
| UX01 | Alcance de Clear Vault | Confirmação distingue eliminação de entradas sincronizadas, retenção histórica e eliminação só local. |
| UX02 | Seletores próprios em vez de prompts numéricos | Origem, identidade, data legível, conflitos e consequências acessíveis; opções ajustadas ao número real de heads. |
| UX03 | Diferenciar backup e Recovery | Mostrar password própria vs histórica, inclusão/exclusão do estado atual, tamanho e fluxo de restauro. |
| UX04 | Diagnóstico/capacidade Sync | Espaço total/por item, margem para próxima publicação, última publicação local e versões em trânsito; não chamar entrega remota confirmada a um `storage.set` local. |
| UX05 | Gestão de cache HIBP | Mostrar ocupação e permitir limpeza; explicar que TTL controla reutilização e não remoção física imediata. |
| UX06 | Retenção e eliminação histórica/remota | Explicar passwords antigas e cópias persistentes; discutir gestão remota e dispositivos offline antes de prometer eliminação global. |
| UX07 | Instruções do repositório | **Documentação atualizada nesta tarefa:** scripts/dependências/testes existem. A correção documental não fecha nenhum SD. |

## Estado de aceitação

Não há correções SD implementadas nesta atualização. Os 38 testes existentes são uma baseline, não prova de que estes 23 casos passam. A conclusão exige regressões persistentes, checks no browser e evidência nas plataformas/transportes que forem declarados suportados. O objetivo de cobertura completa inclui limites reais e mensagens claras quando um cenário não é suportado; não permite ultrapassar quotas do Chrome por promessa de interface.
