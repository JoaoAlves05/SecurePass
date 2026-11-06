# Checklist de implementação e aceitação

Atualizada em 06/11/2026. Fonte: [SYNC_DATA_PLAN.md](SYNC_DATA_PLAN.md), versão 3. Release ainda não aceite.

Uma caixa marcada exige implementação e evidência indicada. Caixas abertas incluem trabalho parcial e aceitação ainda não demonstrada. Os incrementos existentes estão descritos em [SETTINGS_UX_IMPLEMENTATION.md](SETTINGS_UX_IMPLEMENTATION.md); resultados históricos em [VALIDATION.md](VALIDATION.md) não equivalem a testes desta execução.

## Integração de 06/11/2026

Issue local: [DRIVE_INTEGRATION.md](issues/DRIVE_INTEGRATION.md). Branch: `feature/drive-integration-completion`.

- [x] Client ID público fornecido pelo utilizador e guardado na configuração local ignorada; cópia com identidade estável gerada. Não equivale a autorização Google executada.
- [x] Rotas de gestão e UI para ligar/desligar conta e inspecionar completamente a pasta appData, sem escrever ou aplicar conteúdos remotos. Conta técnica verificada via `about.get`; token nunca persiste em storage/mensagens da extensão.
- [x] Mudança de conta, cancelamento durante OAuth e disconnect invalidam resultados tardios e suspendem operações antigas; descoberta incompleta nunca se apresenta como pasta vazia.
- [x] Preparação automática de assinaturas nas mutações normais para um writer interno previamente inscrito; commit do cofre/checkpoint/fila compara vínculo, autorização e sessão. Enrollment do protótipo continua sem rota pública.
- [x] Coordenador ligado ao arranque/alarme do worker, com escrita bloqueada por condição de release no código. Runtime exercitado com política de teste explícita e fornecedor emulado.
- [x] Restauro local suspende Drive na mesma transação; não publica a revisão restaurada nem elimina silenciosamente a fila anterior. Rotação de época não autorizada é recusada antes do commit.
- [x] Upload retomável até 16 MiB de pacote, blocos de 1 MiB, URI durável antes de enviar conteúdo, consulta de offset após restart e recuperação da resposta perdida. Mantém validação de bytes e reenumeração antes do acknowledgement.
- [x] Pesquisa e paginação ancoradas, duas contas por página e controlos antes da lista. Cliques reais, pesquisa sem resultados, seleção na página seguinte e pesquisa da última de 27 contas exercitados em Chromium; fallback protegido preservado.
- [ ] Executar ligação/inspeção com o cliente real no Chrome e registar o resultado; o utilizador faz a autorização no seu browser.
- [ ] Rever independentemente formato/nonces/bootstrap e concluir ciclo administrativo, inscrição/revogação/rotação, kit, convergência e migração antes de habilitar escrita Drive.
- [ ] Concluir AF/SC e matriz física/acessibilidade/sites. Os novos testes não fecham automaticamente os problemas SD nem a release.

## Trabalho desta execução

- [x] Ler o plano completo e criar esta checklist.
- [x] Criar branch `feature/sync-data-plan-completion`.
- [x] Validar a revisão do cofre na seleção para autofill (parte de AF06): backend rejeita revisão ausente/alterada e a UI envia a revisão apresentada. Regressão em `tests/accountPrompts.test.js`; AF06 completo permanece aberto.
- [x] Baseline: 138 testes Node aprovados. Após a correção: 22 testes de account prompts e check de 93 módulos aprovados; `git diff --check` aprovado.
- [x] `npm run test:browser` aprovado: autofill, origem, ausência de submit, bloqueio e PRF virtual. Não substitui AF12 físico nem a suite dedicada de login compacto.

## Incremento em curso — login e leitura Drive

- [x] **Apresentação ancorada implementada:** lista de contas junto ao campo, desbloqueio em janela protegida e regresso à lista para preencher diretamente. `test:anchored-browser` cobre o percurso normal e fallback, origem, frame recusado, CSP, vazio/criação e revisão alterada. A aceitação ampla de hardware/sites/acessibilidade continua em AF10–AF12. [Contrato](ANCHORED_SELECTOR.md).

- [x] Backend exige revisão apresentada antes de preencher.
- [x] Leitor Drive isolado: paginação, limites, guardas de vínculo, códigos de erro; cinco testes simulados aprovados. [Limites de integração](DRIVE_TRANSPORT.md).
- [x] Cancelamento do cliente biométrico antes/depois da resposta do autenticador: três regressões aprovadas.
- [x] Settings Chromium e Sync emulado de dois perfis novamente aprovados.
- [x] Login compacto: suite dedicada Chromium aprovada, incluindo fallback, escolha direta, guardar/atualizar e geração contextual. O fallback durante diálogo nativo usa dispatch programático no teste; cliques com diálogo do SO aberto e PRF físico continuam em AF12.
- [ ] Ligar transporte a OAuth/estado persistente e UI após protocolo revisto.
- [ ] Integrar a publicação e autorização assinada no produto e concluir migração; os componentes internos já implementados estão registados nas secções seguintes.

## Incremento de 05/11/2026 — publicação e persistência Drive

Validação: 161 testes Node e check de 101 módulos aprovados; suites de browser não repetidas, pois este incremento não altera a UI. Uma guarda adicional no reaproveitamento remoto foi verificada depois na suite dirigida.

- [x] Transporte de publicação imutável com validação obrigatória do pacote pelo chamador e guarda de escrita separada da leitura.
- [x] Confirmar bytes por download e reenumerar antes de reconhecer publicação; divergência da mesma revisão produz erro de integridade.
- [x] Recuperar upload aceite cuja resposta se perdeu, reutilizando os ficheiros existentes sem outro create.
- [x] Verificar todas as cópias com o mesmo ID lógico; não eliminar duplicados automaticamente.
- [x] Coordenador com estado de envio incerto persistido antes de I/O, backoff/jitter/Retry-After, limite de 20 tentativas e bloqueio de erros permanentes.
- [x] Fila IndexedDB vinculada a conta/cofre/geração, preservada ao mudar de vínculo; acknowledgement rejeitado após desligar/mudar de conta.
- [x] API `commitRecord`/`writeLocalVaultRecordRaw` aceita operação Drive explícita e grava cofre/checkpoint/fila na mesma transação. Regressões cobrem sucesso, mudança de vínculo e abort após put.
- [x] Produzir automaticamente o pacote assinado nas mutações normais quando existe inscrição interna válida; integração e regressões de 06/11 acima. Não ativa inscrição/escrita no produto.
- [x] Integrar coordenador/alarme/router e OAuth/UI de inspeção em 06/11; publicação de produção continua bloqueada até revisão e lifecycle completos.
- [x] Implementar percurso resumable para pacotes acima do limite multipart; até 16 MiB de pacote. Aceitação Google e capacidade de todo o produto continuam separadas.
- [ ] Concluir formato de cifragem e ciclo administrativo de produção, kit, convergência e migração; o protótipo de autorização assinada já existe.
- [x] Lista ancorada ao campo implementada com frame isolado e vinculação de documento; revisão visual adversarial ampla e aceitação manual continuam pendentes.

## Continuação — commit atómico da fila Drive

Verificação atual: **166 testes Node e check de 104 módulos aprovados**; `npm run test:drive-commit-browser` aprovado em IndexedDB real (commit e rollback). O cenário não usa Google nem testa o protocolo assinado.

- [x] Extrair modelo de fila sem dependência de storage para evitar ciclos de imports.
- [x] Enfileirar uma operação explícita em conjunto com cofre e checkpoint; validar revisão, identidade e vínculo dentro da transação.
- [x] Recusar publicação simultânea pelo transporte legacy e pelo Drive na mesma gravação.
- [x] Confirmar rollback do cofre/checkpoint/fila quando a gravação da fila aborta ou a geração do vínculo muda.
- [x] Testar limite persistido de retentativas sem novo I/O.
- [x] Integrar assinatura/preparação automática, worker e OAuth/UI de inspeção em 06/11. Mantém condição de release e inscrição internas sem rota de ativação.

## Continuação — autorização e revisões assinadas (protótipo interno)

- [x] Especificação de tuplos assinados, domínios separados, limites e raiz de confiança explícita em [SIGNED_PROTOCOL.md](SIGNED_PROTOCOL.md).
- [x] Verificar cadeia administrativa ECDSA P-256, predecessores, raiz independente e checkpoint conhecido; recusar replay, divergência e substituição silenciosa de raiz.
- [x] Assinar/verificar revisões cifradas v2 vinculadas a autor, cofre, época e estado de autorização exato; rejeitar autores retirados do estado atual.
- [x] Rejeitar campos em claro inesperados, representação não canónica, JSON com chaves duplicadas, assinaturas erradas e ciphertext adulterado.
- [x] Proteger chave administrativa pela master password e chave de escrita pela chave de conteúdo, com contextos separados; devolver CryptoKeys não extraíveis.
- [x] Persistir checkpoint e cadeia em IndexedDB, reverificar ao carregar e usar comparação transacional para atualizações administrativas concorrentes.
- [x] Vetor fixo público sem chaves privadas e teste integrado de assinatura → commit atómico → publicação emulada → verificação → acknowledgement.
- [ ] Rever protocolo independentemente, definir formato de cifragem novo/limites de nonces e integrar ciclo administrativo/UI. O protótipo não está ativado no produto.
- [ ] Implementar inscrição/revogação/rotação completas, gestão de chaves e kit de recuperação nas superfícies autorizadas.
- [x] Pacotes assinados preparados incluem o checkpoint esperado: a transação de commit verifica-o, e a fila recusa envio/acknowledgement se a autorização mudou.
- [ ] Integrar estes mecanismos nas mutações e envios normais do produto, com rebase de pacotes antigos e resolução administrativa.

Verificação desta continuação: **180 testes Node e check de 113 módulos aprovados**; `npm run test:signed-protocol-browser` aprovado para vetor fixo, checkpoint e proteção de chaves no WebCrypto real do Chromium; cenário de commit/rollback em IndexedDB real repetido e aprovado após as guardas de autorização. Os estados SC correspondentes continuam abertos para integração e aceitação completas.

## Integração visível e preparação Google

- [x] Seletor ancorado com até duas sugestões utilizável na extensão, com handoff de desbloqueio e alternativa em janela; atestação de visibilidade/foco/oclusão recusa preenchimento através de host transparente.
- [x] Muitas contas continuam utilizáveis: duas sugestões diretas e seleção completa na janela protegida; cenário Chromium com 27 contas aprovado.
- [x] Pesquisa/paginação de todas as contas dentro do seletor ancorado em 06/11: duas contas por página, navegação no topo e seleção via cliques reais; fallback protegido preservado (aceitação ampla AF08/AF11 continua aberta).
- [x] Empacotamento inclui HTML/CSS/JS do seletor e partilha os runtime roots com a ferramenta de configuração; `test:package-browser` executa o percurso ancorado completo a partir do ZIP extraído.
- [x] Ferramenta de configuração pública Google valida chave/ID e gera cópia de desenvolvimento; não aceita secrets/tokens.
- [x] Identidade pública de desenvolvimento gerada em `dist/google-development.json`, sem guardar chave privada.
- [x] Guia de configuração Cloud em [GOOGLE_CLOUD_SETUP.md](GOOGLE_CLOUD_SETUP.md); o utilizador confirmou que ainda não configurou OAuth.
- [ ] Configuração pública recebida em 06/11; concluir autorização Google real e verificar ligação/inspeção. Depende da conta/projeto do utilizador.
- [ ] Ativar sincronização Drive completa após terminar integração/lifecycle/protocolo e condições de revisão. A ferramenta de manifesto não conclui esses requisitos.

Validação da integração visível: **186 testes Node e check de 120 módulos**, suites Chromium ancorada, account prompts, geral/PRF virtual, configuração Google e ZIP extraído aprovados. O cliente Google do teste é fictício e não foi autenticado. O plano completo continua por concluir: integração Drive/OAuth, lifecycle de dispositivos/chaves, kit de recuperação, convergência, migração e revisão independente. Esta entrega não os declara disponíveis.

## Entregáveis por secção

- [ ] 1. Resultado e decisões recomendadas — verificar requisitos e evidências antes de fechar.
- [ ] 2. Contrato de segurança e limites da promessa — verificar requisitos e evidências antes de fechar.
- [ ] 3. Identidade do cofre, conta e dispositivos — verificar requisitos e evidências antes de fechar.
- [ ] 4. Primeiro dispositivo e descoberta inicial — verificar requisitos e evidências antes de fechar.
- [ ] 5. Segundo dispositivo e passwords diferentes — verificar requisitos e evidências antes de fechar.
- [ ] 6. Formato criptográfico e ciclo de chaves — verificar requisitos e evidências antes de fechar.
- [ ] 7. Password esquecida e recuperação de acesso — verificar requisitos e evidências antes de fechar.
- [ ] 8. Separação de estados e interface — verificar requisitos e evidências antes de fechar.
- [ ] 9. Gravação local, outbox e retomada — verificar requisitos e evidências antes de fechar.
- [ ] 10. Protocolo de sincronização Drive — verificar requisitos e evidências antes de fechar.
- [ ] 11. Conflitos, eliminações e convergência — verificar requisitos e evidências antes de fechar.
- [ ] 12. Passwords, biometria e dispositivos retirados — verificar requisitos e evidências antes de fechar.
- [ ] 13. Backups, importação e recuperação histórica — verificar requisitos e evidências antes de fechar.
- [ ] 14. Retenção, compactação e capacidade — verificar requisitos e evidências antes de fechar.
- [ ] 15. Desligar, apagar e mudar de conta — verificar requisitos e evidências antes de fechar.
- [ ] 16. Settings, sessão e interface — verificar requisitos e evidências antes de fechar.
- [ ] 17. Migração da implementação atual — verificar requisitos e evidências antes de fechar.
- [ ] 18. Organização de implementação proposta — verificar requisitos e evidências antes de fechar.
- [ ] 19. Fases, entregáveis e cobertura dos problemas — verificar requisitos e evidências antes de fechar.
- [ ] 20. Matriz de cenários obrigatórios — verificar requisitos e evidências antes de fechar.
- [ ] 21. Verificação, release e operação — verificar requisitos e evidências antes de fechar.
- [ ] 22. Fontes verificadas e pontos de validação técnica — verificar requisitos e evidências antes de fechar.
- [ ] 23. Retoma e fluxo compacto de login — 04/11/2026 — verificar requisitos e evidências antes de fechar.

## Cenários de aceitação

SC01/SC02 foram fechados para criação local pelas regressões de cofre e percurso Chromium de criação com confirmação errada/correta; AF03/AF09 pelas suites Chromium de seletor ancorado/account prompts. Isto não fecha os requisitos Drive nem a aceitação física.

- [x] **SC01** — Criar offline no primeiro dispositivo — Cofre local válido; Sync não é pré-requisito.
- [x] **SC02** — Criar com passwords de confirmação diferentes — Não criar; permitir correção sem perder contexto não sensível.
- [ ] **SC03** — Segundo dispositivo, conta/cofre/password corretos — Desbloqueio e inscrição verificáveis; mesma identidade/época.
- [ ] **SC04** — Segundo dispositivo, password errada — Nenhuma criação, escrita ou substituição; tentativas limitadas localmente.
- [ ] **SC05** — Password correta mas dados adulterados — Rejeitar; não atribuir automaticamente a culpa à password.
- [ ] **SC06** — Conta Google errada — Mostrar identidade e permitir mudar; não recriar o cofre conhecido.
- [ ] **SC07** — Sem rede/erro ao descobrir — Estado desconhecido, nunca “cofre vazio”.
- [ ] **SC08** — Nenhum cofre após listagem completa — Criação apenas explícita; alternativa de backup/conta.
- [ ] **SC09** — Dois primeiros dispositivos criam ao mesmo tempo — Duas identidades conservadas; seleção explícita.
- [ ] **SC10** — Local e remoto diferentes, passwords diferentes — Autenticar ambos para merge; preservar destino e origens.
- [ ] **SC11** — Password igual em dois cofres distintos — Não confundir identidades nem juntar automaticamente.
- [ ] **SC12** — Cancelar/desligar/fechar a meio do onboarding — Sem vínculo parcial de escrita; staging seguro e retoma clara.
- [ ] **SC13** — Vários cofres ou vários heads no catálogo — Enumerar/selecionar; nenhuma escolha por data/nome.
- [ ] **SC14** — Dispositivo conhecido usa password antiga após rotação — Preservar ramo antigo e pedir password atual para publicar.
- [ ] **SC15** — Edições offline durante rotação noutro dispositivo — Rebase autenticado após novo desbloqueio; sem perda.
- [ ] **SC16** — Duas rotações/administrações concorrentes — Conflito explícito, sem vencedor por relógio/contador isolado.
- [ ] **SC17** — Falha em cada fase da rotação — Retoma da mesma operação; informar password/época efetivas.
- [ ] **SC18** — Password esquecida, biometria/dispositivo acessível — Exportar dados com verificação; sem poderes administrativos implícitos.
- [ ] **SC19** — Kit correto/errado/incompleto — Recuperar apenas com prova válida e dados disponíveis.
- [ ] **SC20** — Sem qualquer password/chave/backup — Não conceder acesso; novo cofre independente só por escolha.
- [ ] **SC21** — Kit roubado ou password comprometida — Procedimento de rotação e limites históricos comunicados.
- [ ] **SC22** — Mudanças em entradas diferentes — Merge automático validado e convergente.
- [ ] **SC23** — Mesma entrada muda em dois/três dispositivos — Conflito com manter ambas sem ultrapassar campos nem duplicar repetidamente.
- [ ] **SC24** — Eliminar contra editar/criar offline antigo — Tombstone/conflito; nenhuma ressurreição silenciosa.
- [ ] **SC25** — Dispositivo volta depois de checkpoint/90 dias — Trabalho preservado; rebase/seleção, sem escrita cega.
- [ ] **SC26** — Retirar dispositivo e receber escrita desse autor — Rejeitar nova revisão; preservar dados antigos para exportação local.
- [ ] **SC27** — Dispositivo novo sem fonte independente recebe história antiga válida — Não prometer frescura demonstrada; comparação/checkpoint quando disponíveis.
- [ ] **SC28** — Upload termina no servidor mas resposta perde-se — Encontrar/verificar pelo ID lógico; sem duplicação funcional.
- [ ] **SC29** — Falha local/remote em cada fronteira e restart do worker — Commit/outbox coerentes; sem falso rollback ou sucesso distribuído.
- [ ] **SC30** — Ficheiro parcial/corrompido junto de versões válidas — Quarentena; local utilizável; sem compactar dependência incerta.
- [ ] **SC31** — Quotas, 401, 403, 404, 429, 5xx e autorização revogada — Estado e retry corretos por motivo; sem loops de OAuth ou perda local.
- [ ] **SC32** — Sync desligado por UI ou handler direto — Nenhum novo pedido remoto de escrita/limpeza/retry.
- [ ] **SC33** — Desligar/mudar conta durante upload — Invalidar vínculo, informar resultado incerto e não transferir outbox.
- [ ] **SC34** — Repetição, reordenação e três perfis — Mesmos resultados para mesmas decisões; conflitos não desaparecem.
- [ ] **SC35** — Cofre, campos, UTF-8, ficheiros e KDF nos limites — Aceitar válidos; rejeitar excedidos antes de efeitos/uso descontrolado de recursos.
- [ ] **SC36** — Backup exportado no limite e restauro em perfil novo — Round-trip exato sem Google; sem exigir cofre prévio.
- [ ] **SC37** — Backup com password errada/versão desconhecida/JSON hostil — Erro controlado, sem alterar destino nem executar conteúdo.
- [ ] **SC38** — Preview muda de origem/destino antes do commit — Invalidar/recalcular; nenhuma decisão aplicada a outra revisão.
- [ ] **SC39** — Restaurar snapshot enquanto chegam novas gravações — Identidade estável; restaurar o selecionado ou pedir nova seleção.
- [ ] **SC40** — Recovery legacy grande e exportação em lote nova — Memória/cancelamento limitados; todos os ficheiros novos reimportáveis.
- [ ] **SC41** — Wipe com cofre corrompido, ausente e remoto indisponível — Eliminação local explícita possível; remoto preservado.
- [ ] **SC42** — Eliminação remota interrompida e dispositivo offline regressa — Alcance/pendências claros; nenhuma promessa de apagamento físico global.
- [ ] **SC43** — Compactação com novo ramo/upload/dispositivo antigo — Preservar heads/cópias necessárias e respeitar checkpoint.
- [ ] **SC44** — Lock/auto-lock durante password, merge, export ou biometria — Cancelar texto em claro; nenhuma sessão reativada por operação velha.
- [ ] **SC45** — Reduzir timeout, suspensão e restart — Prazo efetivo imediato; Sync/status não renovam atividade.
- [ ] **SC46** — PRF ausente/cancelado, reinstalação e chave rodada — Password disponível; nova inscrição; sem bypass nem biometria transferida.
- [ ] **SC47** — Assinatura, cadeia ou época forjadas; escritor revogado — Rejeitar antes de aplicar; nenhuma alteração de autoridade por metadados soltos.
- [ ] **SC48** — Gravações de settings em corrida com Sync/dois separadores — Sem reverter vínculo; respostas/UI reconciliadas por revisão.
- [ ] **SC49** — Settings inválidos, falha anterior e sucesso posterior — Reparação conservadora; reset/recuperação acessíveis; tema/gerador coerentes.
- [ ] **SC50** — Restauro/clear/import alteram status — Toggle, contadores, seleção e botões refletem estado efetivo.
- [ ] **SC51** — Duplo clique, vários diálogos, Escape, fecho e leitor de ecrã — Exclusão/cancelamento/foco previsíveis; sem promessas pendentes esquecidas.
- [ ] **SC52** — Clipboard/cache HIBP durante lock/wipe/clear — Não apagar conteúdo alheio nem repovoar estado eliminado por pedido antigo.
- [ ] **SC53** — Legacy e v2 coexistem; múltiplas passwords e heads — Inventário completo, autenticação separada e preservação das fontes.
- [ ] **SC54** — Migração interrompida e dispositivo antigo publica depois — Retoma idempotente; alteração tardia não é ignorada nem aplicada silenciosamente.
- [ ] **SC55** — Cliente antigo recebe versão nova e downgrade da extensão — Não gravar formato desconhecido; oferecer atualização/exportação compatível.
- [ ] **SC56** — Tokens/segredos em logs, mensagens, export e content scripts — Ausência comprovada; apenas contextos de gestão autorizados.
- [ ] **SC57** — Sessão Google perdida, dados remotos apagados ou disco cheio — Cofre acessível preservado; diagnóstico e backup/restauro independentes.
- [ ] **SC58** — Identidade/fingerprint de cofre não corresponde à fonte confiável — Bloquear ligação/substituição até decisão verificada; não aceitar só pelo nome.
- [ ] **AF01** — Cofre bloqueado, com/sem biometria — Nenhum nome/contagem guardada antes de autenticar; biometria inicia uma vez quando configurada; password direta quando ausente.
- [ ] **AF02** — Sucesso biométrico ou password correta — Lista apenas da origem atual; escolha explícita mesmo para uma conta; um clique preenche sem nova autenticação ou submit.
- [x] **AF03** — Cofre já desbloqueado — Lista direta e preenchimento imediato; nenhum prompt biométrico redundante.
- [ ] **AF04** — Biometria falha, PRF ausente, timeout, cancelamento ou falta de ativação — Sem bypass nem loop; password/repetição explícita conforme estado; cancelar o fluxo não preenche.
- [ ] **AF05** — Trocar para password com biometria pendente — Cerimónia abortada e resposta tardia rejeitada; não duplicar sessão/pedido nem preencher após fecho.
- [ ] **AF06** — Expiração/lock, navegação, campo removido, revisão alterada ou replay — Rejeição antes de entregar; lista e segredos descartados; nova seleção/autenticação quando necessária.
- [ ] **AF07** — Cliques rápidos, refoco, várias contas/pedidos — Uma cerimónia por ação válida; sem duplicações nem mistura de origem, documento, campo ou conta.
- [ ] **AF08** — Zero/uma/muitas contas, nomes repetidos/longos — Estado vazio com adicionar, seleção inequívoca e scroll limitado; guardar não preenche por si só.
- [x] **AF09** — Login versus registo/alteração de password — Login sem os dois menus removidos; geração continua disponível no contexto correto e não altera password atual.
- [ ] **AF10** — Página hostil e capacidades — Sem acesso da página a master/chaves/lista completa; pedidos forjados, sobreposição e redirecionamento testados conforme superfície escolhida.
- [ ] **AF11** — Teclado/leitor de ecrã, claro/escuro, 320px, zoom, scroll/resize — Foco, fallback e cancelamento utilizáveis; lista ancorada ao campo no percurso normal; janela protegida apenas como fallback documentado; feedback não bloqueia o site.
- [ ] **AF12** — Hardware e browser reais — Testar sucesso, falha/cancelamento e fallback nos SO/autenticadores alvo; registar limitações de ativação e toolbar sem equiparar PRF virtual a aceitação física.

## Evidência atual das correções locais

Suite completa desta execução: **147 testes Node aprovados**. Check: **96 módulos**. Suites Chromium geral/PRF virtual, account prompts, Settings e Sync emulado aprovadas. A aceitação completa dos cenários permanece separada dos testes abaixo.

| Requisitos | Comportamento já implementado e exercitado | Evidência |
|---|---|---|
| SD01, SD02 | Merge preserva notas nos limites, password do destino, heads não selecionados e identidade de conflitos | `settingsData.test.js` SC10/23/34 |
| SD03, SD14 | Download/merge local não publicam off; outbox cifrada por revisão e retry no arranque | `settingsData.test.js` SC32 e SC29/31/32 |
| SD04, SD05 | Recusa preventiva de orçamento insuficiente para duas versões e quota por item | `syncSetup.test.js`, `settingsData.test.js` SC35; não fecha todo o ciclo de GC |
| SD06, SD15, SD22 | Patches não alteram modo, transições serializadas, redução imediata de timeout e reparação de settings | `settingsData.test.js` SC48/49 e SC45 |
| SD07, SD18, SD19, SD23 | Snapshot individual reimportável, restauro em perfil novo, preview vinculado e IDs estáveis | `settingsData.test.js` SC36–SC40; arquivos grandes/lotes continuam pendentes |
| SD08, SD11 | Cópia completa restaurável apesar de outra incompleta; wipe local de dados danificados independente do remoto | `syncSetup.test.js`, `backupAdvanced.test.js` |
| SD09, SD10 | Reparação de chunks, rollback transacional e retoma de recuperação local | `settingsData.test.js`, `backupAdvanced.test.js`; GC órfão/retoma distribuída pendentes |
| SD12, SD13, SD20, SD21 | Percursos de navegação, import/conflitos, restauro e eliminação exercitados em Chromium | `test:settings-browser`; matriz de acessibilidade real pendente |
| SD16 | Aplicação linear remota automática | Por implementar no protocolo novo |
| SD17 | Inventário legacy/v2 e adoção explícita antes de retirada | `syncSetup.test.js`; migração Drive ainda pendente |

## Revisão original e fecho de problemas

Cada SD deve ser reconciliado com as correções posteriores, testes persistentes, falhas injetadas e resultado de aceitação. Não assumir que o defeito da revisão original ainda existe.

- [ ] SD01 — Merge pode gravar um cofre que deixa de desbloquear
- [ ] SD02 — Resolver uma versão retira outras versões da lista de conflitos
- [ ] SD03 — Publicação remota com Sync desligado e download com efeitos globais
- [ ] SD04 — Falta de espaço que compactação e Retry não resolvem
- [ ] SD05 — Manifesto pode exceder quota individual
- [ ] SD06 — Gravação de preferências pode reverter uma transição Sync
- [ ] SD07 — Recovery exportado pode ser recusado pelo próprio importador
- [ ] SD08 — Uma geração incompleta bloqueia toda a leitura remota
- [ ] SD09 — Uploads abandonados e Retry sem verificação completa
- [ ] SD10 — Transições parcialmente aplicadas entre vários armazenamentos
- [ ] SD11 — Recuperação/eliminação local podem depender de dados remotos ou corrompidos
- [ ] SD12 — Restauração deixa o interruptor e texto Sync incorretos
- [ ] SD13 — Contadores e controlos Sync/Recovery ficam desatualizados
- [ ] SD14 — Pending não identifica a revisão a publicar
- [ ] SD15 — Alterar auto-lock não atualiza a sessão atual
- [ ] SD16 — Atualizações remotas lineares exigem resolução manual
- [ ] SD17 — Legacy fica invisível quando surge uma geração v2
- [ ] SD18 — Import normal não restaura diretamente numa instalação nova
- [ ] SD19 — Preview e conflitos de importação insuficientes
- [ ] SD20 — Operações e diálogos incompatíveis podem sobrepor-se
- [ ] SD21 — Rollback das preferências não reconcilia todos os consumidores
- [ ] SD22 — Settings inválidos interrompem o arranque e o próprio Reset
- [ ] SD23 — Snapshot escolhido por índice mutável

## Dependências externas e condições de release

- [ ] Configurar OAuth Google para a identidade estável da extensão; não inventar client ID nem credenciais.
- [ ] Revisar formato, serialização canónica, assinaturas, cadeia administrativa, nonces e bootstrap antes de habilitar escrita Drive.
- [ ] Testar Google autenticado com contas/perfis descartáveis e entrega real.
- [ ] Testar PRF/autenticadores físicos e sistemas operativos suportados.
- [ ] Verificar toolbar real, sites reais/SSO, leitor de ecrã, teclado e clipboard sleep/wake.
- [ ] Revisão de segurança independente e correção dos resultados.
- [ ] Validar migração, pacote, checks e critérios de release.

## Próximos blocos de implementação

1. Consolidar SD/UX e condições de falha sobre a baseline atual.
2. Login compacto e biometria inicial, mantendo autenticação isolada e nomes protegidos.
3. Fechar persistência/recuperação, quotas e arquivos legacy.
4. Especificar e revisar protocolo novo, depois implementar Drive, autorização de dispositivos, recuperação, convergência e migração.
5. Executar aceitação externa e atualizar o estado de cada cenário.
