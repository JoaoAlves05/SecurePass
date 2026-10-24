# SecurePass — revisão de funcionamento e preparação da primeira versão

Nota: este documento preserva os problemas da revisão inicial. O estado das correções está em [IMPLEMENTATION.md](IMPLEMENTATION.md).

Data: 24/10/2026. Código revisto: `5aed51c` (`Refactor frontend and improve security`), sem alterações ao código de produção.

## Parecer

**A extensão ainda não reúne condições para uma primeira versão com credenciais reais.** Existem falhas reproduzidas de exposição de segredos, desbloqueio sem prova biométrica, perda de gravações e substituição indevida do cofre. O assistente nas páginas também falha no arranque e várias funcionalidades apresentadas no popup não estão ligadas.

Há uma base aproveitável: ES modules, separação entre interface e background, Web Crypto, AES-GCM com IV aleatório, PBKDF2-SHA256 com 600 000 iterações no cofre, backups encriptados e consultas HIBP por prefixo. Os testes isolados confirmaram que guardar/reabrir o cofre funciona no percurso normal e que os backups rejeitam uma palavra-passe errada e adulteração. Os problemas principais estão na autorização, no ciclo de vida e na coordenação entre estas peças.

Esta revisão identifica problemas concretos e estabelece condições de aceitação; não equivale a uma certificação de segurança nem garante ausência de outras vulnerabilidades.

## Método e limites

Foram inspecionados os 33 ficheiros JavaScript, o manifesto, os HTML, os estilos e a documentação. Foram executados:

- Verificação de sintaxe dos 33 JavaScript: sem erros.
- 21 verificações isoladas dos módulos e handlers, com Web Crypto real, armazenamento Chrome simulado e IndexedDB emulado por `fake-indexeddb`: 19 reproduções de problemas e dois controlos positivos de encriptação.
- Verificações do popup num DOM emulado: ações sem handlers, nove botões de mostrar palavra-passe sem handlers, erro de resposta biométrica e editor que permanece preenchido após bloquear.
- Carregamento da extensão original em Chromium 141, via Playwright, com perfil descartável: service worker e popup arrancam; o content script falha ao importar `src/constants.js`.
- No mesmo Chromium: uma página da extensão aberta num separador recebe `Forbidden` ao inicializar o cofre; um input de palavra-passe num Shadow DOM fechado permite que a página observe as teclas através de um listener de captura.
- Cruzamento das APIs com documentação oficial do Chrome e especificações W3C.

Os testes usaram exclusivamente dados fictícios. As ferramentas e dependências de investigação ficaram em `/tmp`, sem adicionar dependências ao projeto. A simulação de corridas assíncronas controla deliberadamente a ordem das operações; demonstra interleavings possíveis, não mede a frequência em utilização normal. O teste de teclado demonstra o mecanismo de exposição do campo inline; o fluxo inline original está atualmente bloqueado pela falha de importação.

Não foram validados Windows Hello, Touch ID, PRF em hardware real, sincronização entre dois perfis reais, clipboard do sistema em diferentes plataformas, publicação na Chrome Web Store ou compatibilidade visual em todos os tamanhos. Estes pontos têm testes de aceitação abaixo; não são apresentados como aprovados.

Prioridades:

- **P0:** bloqueia disponibilização com dados reais; exposição de segredos ou risco comprovado de perda/integridade.
- **P1:** necessário para a primeira fase se a funcionalidade continuar disponível.
- **P2:** qualidade, clareza e consolidação; parte pode seguir para uma fase posterior com limitações explícitas.

## P0 — corrigir antes de disponibilizar

### F01 — A palavra-passe mestra é pedida dentro da página visitada

**Onde:** [campo inline](../content/modules/autofill.js#L339), [leitura e envio](../content/modules/autofill.js#L399), [Shadow DOM fechado](../content/modules/ui.js#L45).

O formulário de desbloqueio vive no documento do site. Um Shadow DOM fechado não cria uma fronteira de origem: listeners de teclado em captura na página continuam a receber as teclas. Num ensaio real, a página recuperou integralmente `FictionalMaster123!` escrito num input de palavra-passe nesse tipo de Shadow DOM. O site também controla o ambiente visual que rodeia o formulário.

**Correção:** pedir a palavra-passe mestra apenas num popup/janela/página de origem da extensão. O assistente pode iniciar o pedido e receber um resultado limitado à credencial selecionada. Não tentar resolver apenas com `stopPropagation`, CSS ou Shadow DOM.

**Aceitação:** um site de teste com listeners de teclado, clipboard e eventos de input não consegue observar o segredo de desbloqueio. Cancelar ou mudar de página invalida o pedido.

### F02 — Content scripts recebem o cofre inteiro, sem autorização por origem

**Onde:** [router](../background/serviceWorker.js#L56), [listar e obter credenciais](../src/messageHandlers/vaultHandlers.js#L95), [desbloquear e preencher](../src/messageHandlers/vaultHandlers.js#L121), [lista completa no assistente](../content/modules/autofill.js#L579), [matching](../content/modules/autofill.js#L516), [resultado biométrico](../src/messageHandlers/biometricHandlers.js#L147).

`LIST_CREDENTIALS` devolve todas as palavras-passe a qualquer content script da extensão quando o cofre está aberto. `GET_CREDENTIAL` e `UNLOCK_AND_FILL` aceitam um ID sem verificar se pertence à origem do remetente. Reproduzido: um remetente simulado em `https://unrelated.example` recebeu a credencial de `https://bank.example`. A filtragem feita depois, no cliente, não constitui autorização.

O matching também aceita relações de subdomínio nos dois sentidos e ignora protocolo e porta. Não há confirmação de que o documento que pediu o preenchimento continua ativo quando o resultado biométrico chega. `tabs.sendMessage` é usado sem vincular o resultado a um documento/frame específico.

**Correção:** matriz explícita de capacidades por tipo de remetente. Reservar a listagem completa ao contexto de gestão; no autofill validar `sender.id`, origem, documento e frame, filtrar no background e entregar só a entrada escolhida. Normalizar sites ao guardar; rejeitar protocolos impróprios. Usar matching exato por defeito, com exceções explícitas para domínios relacionados e sem downgrade silencioso de HTTPS para HTTP. Revalidar antes de entregar e preencher.

**Aceitação:** um script de outro domínio não lista nem obtém credenciais alheias por ID. Navegar durante um pedido, mudar de frame ou reutilizar um pedido já concluído não entrega segredos. A política deve seguir a recomendação do Chrome de tratar content scripts como menos confiáveis e limitar os dados enviados. [Documentação oficial](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#security-considerations).

### F03 — O desbloqueio biométrico sem PRF aceita conclusão sem autenticação

**Onde:** [sessões e conclusão biométrica](../src/messageHandlers/biometricHandlers.js#L63), [chave Trusted Device](../src/cryptoVault.js#L471), [segredo de sessão](../background/serviceWorker.js#L32), [bloqueio](../src/cryptoVault.js#L245).

`BIOMETRIC_AUTH_COMPLETE` não verifica uma assertion, assinatura, challenge, UV, origem ou identidade do remetente. Em `verify-only`, basta existir a palavra-passe sem encriptação em `storage.session`. Em `trusted-device`, a chave de desencriptação está em `storage.local`, junto dos dados que permite abrir. Os handlers de início/conclusão aceitam mensagens de content scripts.

Reprodução: desbloquear uma vez, configurar `verify-only`, bloquear, enviar início e conclusão de biometria sem chamar WebAuthn. O cofre volta a abrir. O segredo de sessão permanece após bloquear, mesmo quando a biometria nunca foi necessária. `storage.local` e `storage.sync` também não têm acesso restringido a contextos confiáveis; a configuração atual expõe a chave Trusted Device aos content scripts.

**Correção:** retirar os fallbacks sem PRF da primeira versão ou implementar um protocolo verificável num contexto confiável. Para uma porta baseada em WebAuthn, guardar a chave pública e verificar a assertion, challenge de uso único, validade temporal, origem, RP ID e UV; ligar a sessão ao pedido original e consumi-la atomicamente. No modo PRF, manter o segredo PRF fora dos contextos das páginas e restringir quem pode concluir a operação. Eliminar a palavra-passe mestra sem encriptação de `storage.session`; bloquear deve revogar todo o material volátil de desbloqueio. Restringir `local` e `sync` com `setAccessLevel` e fornecer preferências públicas por mensagens.

Guardar a chave de abertura no mesmo armazenamento persistente dos dados não oferece proteção criptográfica contra alguém que lê esse perfil; não apresentar isso como proteção biométrica dos dados em repouso. Desligar o toggle Trusted Device deve também revogar a configuração e a chave: atualmente só muda uma preferência.

**Aceitação:** início + conclusão fabricados nunca abrem o cofre. Sessões expiradas, concorrentes ou de outro documento são recusadas. Depois de bloquear, não subsiste um segredo reutilizável para contornar o desbloqueio. A verificação de assertions é descrita pela [W3C](https://www.w3.org/TR/webauthn-3/#sctn-verifying-assertion); os níveis de acesso constam da [API storage](https://developer.chrome.com/docs/extensions/reference/api/storage#storage-areas).

### F04 — Uma operação em curso pode anular um bloqueio posterior

**Onde:** [writeVault](../src/cryptoVault.js#L169), [unlockVault](../src/cryptoVault.js#L211), [lockVault](../src/cryptoVault.js#L245).

Não existe geração de sessão ou cancelamento que impeça uma operação iniciada antes de bloquear de voltar a publicar `cache.data`. Reproduzido: suspender uma gravação durante a encriptação, bloquear e terminar a gravação. `vaultStatus()` volta a indicar desbloqueado. Um desbloqueio ainda em curso tem o mesmo tipo de problema.

**Correção:** estado de sessão com versão/generation e invalidação imediata ao bloquear. Verificar a validade depois de cada operação assíncrona sensível; uma operação de uma sessão revogada não pode restaurar cache, segredos, atividade ou estado de interface.

**Aceitação:** bloquear durante desbloqueio, gravação, importação e biometria deixa sempre o cofre bloqueado no final.

### F05 — Gravações concorrentes perdem credenciais

**Onde:** [mutação e escrita](../src/cryptoVault.js#L263), [atualização e eliminação](../src/cryptoVault.js#L278), [importação](../src/cryptoVault.js#L344).

As operações alteram dados partilhados e encriptam snapshots sem uma fila. Reproduzido: duas inserções A e B terminam com sucesso; a interface vê A+B, mas reabrir o cofre recupera apenas A quando a gravação mais antiga termina por último. O índice de metadados também usa read-modify-write sem coordenação.

**Correção:** serializar operações sobre o cofre, incluindo alteração da mestra, importação, limpeza e mudança de backend. Trabalhar sobre cópias e publicar cache/metadados só após commit confirmado. Incluir revisão de registo para detetar estado obsoleto; proteger também a coordenação entre contextos.

**Aceitação:** duas gravações simultâneas, editar enquanto se importa e guardar a partir de uma notificação nunca perdem alterações aceites nem ressuscitam entradas eliminadas.

### F06 — Mudar de cofre Local/Sync conserva dados e palavra-passe da origem anterior

**Onde:** [transição](../src/messageHandlers/utilHandlers.js#L62), [seleção de armazenamento](../src/cryptoVault.js#L75), [cache e escrita](../src/cryptoVault.js#L169).

A transição muda os settings sem bloquear/inutilizar a sessão atual. Reproduzido: selecionar o cofre local A enquanto a cache contém o cofre Sync B; a próxima inserção grava B+C sobre A. O utilizador perde precisamente os dados que escolheu preservar. Com palavras-passe diferentes, a próxima escrita pode também usar a mestra da origem anterior.

**Correção:** transição exclusiva e transacional, com snapshot recuperável, invalidação da sessão e desbloqueio obrigatório do destino. Reconciliar metadados e biometria com a identidade do cofre. Tratar atualizações remotas e estratégias inválidas; `SAVE_SETTINGS` não pode alterar `useSync` por fora deste procedimento.

**Aceitação:** alternar entre cofres distintos, com mestras diferentes, nunca permite gravar a cache anterior no novo destino. Cancelamentos e falhas preservam ambas as cópias.

### F07 — Uma falha ao escrever Sync pode tornar ilegível a cópia anterior

**Onde:** [escrita dos chunks](../src/utils/storage.js#L153), [leitura dos chunks](../src/utils/storage.js#L132).

Ao reduzir o cofre, os chunks antigos excedentes são removidos antes de confirmar a nova escrita. Reproduzido: falhar o `set` depois dessa remoção; o manifesto antigo aponta para chunks já apagados e a leitura passa a devolver `null`. Não há geração imutável, checksum/revisão nem mecanismo para resolver edições concorrentes em dispositivos distintos.

**Correção:** para a primeira fase, retirar a sincronização de cofres ou usar gravações por geração, verificar completude/integridade, publicar o manifesto depois e só então recolher gerações antigas. Não tratar um conjunto incompleto como cofre inexistente. Definir conflitos, recuperação e limites de espaço; o simples fracionamento não remove quotas nem garante atomicidade entre dispositivos.

**Aceitação:** simular falhas em cada passo, chunks em falta e mudanças concorrentes em dois dispositivos; a última geração completa mantém-se recuperável e conflitos não apagam dados silenciosamente.

## P1 — necessário para os fluxos mantidos na primeira fase

### F08 — Erros de leitura são confundidos com ausência de cofre

**Onde:** [IndexedDB](../src/utils/storage.js#L96), [Sync](../src/utils/storage.js#L132), [inicialização automática](../src/cryptoVault.js#L198), [handler de desbloqueio](../src/messageHandlers/vaultHandlers.js#L38).

Falhas de leitura, JSON inválido e chunks em falta podem resultar em `null`. `UNLOCK_VAULT` chama `initializeVault`, e o próprio `unlockVault` cria um cofre se não encontrar registo. Um problema transitório pode transformar-se numa tentativa de substituir dados por um cofre vazio.

**Correção/aceitação:** separar explicitamente estados ausente, existente, indisponível e corrompido. Só uma ação explícita de criação pode criar um cofre. Injetar erros de leitura deve produzir uma mensagem recuperável e zero escritas.

### F09 — Guardar altera silenciosamente palavras-passe e outros dados

**Onde:** [sanitização no popup](../popup/popup.js#L79), [guardar](../popup/modules/vault.js#L278), [validação partilhada](../src/validation.js#L24).

O popup remove `<` e `>` de palavras-passe; o backend aplica `trim()` e remove caracteres de controlo. As notas perdem todos os espaços; usernames também são modificados. O gerador pode produzir `<` e `>`, pelo que uma palavra-passe gerada pode deixar de corresponder ao segredo guardado.

**Correção/aceitação:** preservar exatamente os segredos; validar tipo e comprimento sem transformação silenciosa. Escapar na apresentação com `textContent`. Confirmar igualdade exata gerar → guardar → copiar → exportar/importar para espaços, símbolos, Unicode e strings como ` a<>b `; notas devem preservar espaços e quebras de linha. Aplicar uma política consistente também à mestra.

### F10 — O assistente inline falha ao arrancar

**Onde:** [inicialização](../content/content.js#L17), [tema](../content/modules/ui.js#L522), [import transitivo](../src/utils/storage.js#L1), [recursos públicos](../manifest.json#L42).

Confirmado no Chromium: `src/utils/storage.js` importa `src/constants.js`, ausente de `web_accessible_resources`. `initThemeSync` rejeita e o fluxo nunca chega a `initAutofill`/`observePasswordFields`. A presença do host vazio não significa que o assistente funciona.

**Correção/aceitação:** corrigir o grafo de imports e a exposição mínima dos recursos; preferencialmente evitar importar o módulo completo de armazenamento nas páginas e pedir preferências ao background. Carregar uma página simples de login e outra com formulário dinâmico deve produzir botões funcionais sem erros no console.

### F11 — Exportar, importar e limpar são botões sem comportamento

**Onde:** [elementos declarados](../popup/popup.js#L61), [botões](../popup/popup.html#L521), [handlers existentes](../src/messageHandlers/vaultHandlers.js#L148).

Os controlos existem, mas não têm listeners, incluindo o input de ficheiro. Os handlers do background não estão ligados à interface. Não há também uma ação de interface para desativar biometria, apesar de existir `DISABLE_BIOMETRIC`.

**Correção/aceitação:** ligar os fluxos completos. Exportação encriptada por defeito, confirmação de palavra-passe de backup, download e revogação do object URL; importação com limite de ficheiro, validação, pré-visualização e política de conflitos; limpeza com significado preciso e confirmação. Restaurar um backup num perfil vazio deve recuperar as credenciais. Distinguir limpar entradas de apagar o cofre/configuração.

### F12 — O contrato do gerador perde as opções da interface

**Onde:** [payload do popup](../popup/modules/generator.js#L54), [validador](../src/validation.js#L80), [handler](../src/messageHandlers/utilHandlers.js#L106), [payload inline](../content/modules/autofill.js#L655).

`validateConstraints` remove `overrides`, `minLength`, `maxLength`, `pattern` e `customRequirements`. Conserva flags chamadas `uppercase`/`symbols`, mas o gerador espera `includeUppercase`/`includeSymbols`. As preferências podem parecer funcionar depois de serem persistidas, mas o pedido imediato e as regras do site são ignorados. O payload inline inclui ainda referências DOM (`usernameField`, `confirmField`) que não devem atravessar mensagens JSON.

**Correção/aceitação:** definir um DTO único de geração, validado no background; enviar apenas valores serializáveis. Gerar imediatamente após mudar opções deve respeitá-las sem depender do debounce dos settings. Testar limites e requisitos de formulários reais.

### F13 — O gerador pode devolver resultados que violam as regras

**Onde:** [substituições](../src/passwordGenerator.js#L49), [limites e tentativas](../src/passwordGenerator.js#L83), [extração de limites](../src/formAnalyzer.js#L75).

Mesmo chamado diretamente, ignora `minLength`; depois de 50 tentativas devolve a última palavra-passe inválida. As substituições podem usar a mesma posição, apagar um requisito já satisfeito e reintroduzir caracteres proibidos por `avoidSimilar`. Reproduzido de forma determinística: `0aaa` sem maiúscula, apesar de a exigir e de excluir `0`. O regex não assegura correspondência integral e regras impossíveis não produzem um erro claro. O extrator também pode aumentar um `maxlength` real para o mínimo que ele próprio escolhe.

**Correção/aceitação:** validar limites inteiros/consistentes, selecionar caracteres obrigatórios em posições distintas, baralhar com aleatoriedade adequada, preservar exclusões e validar integralmente o resultado final. Requisitos incompatíveis devem falhar explicitamente. Limitar a complexidade de patterns fornecidos por sites; não executar regex arbitrário sem política de custo. Testar gerações repetidas para todas as combinações e constraints impossíveis. Eliminar também o pequeno viés de módulo com rejection sampling.

### F14 — Falhas de persistência deixam a cache a simular sucesso

**Onde:** [mutações](../src/cryptoVault.js#L263), [commit IndexedDB](../src/utils/storage.js#L116), [wipe](../src/messageHandlers/vaultHandlers.js#L203).

Adicionar/editar/apagar alteram a cache antes de a escrita ser confirmada. Reproduzido: uma inserção falha por quota, mas continua a aparecer na lista; depois de bloquear/reabrir desaparece. IndexedDB resolve no sucesso do request, antes de `transaction.oncomplete`, e não trata `onabort` explicitamente. O wipe usa `Promise.allSettled` e responde sucesso sem verificar falhas.

**Correção/aceitação:** commit transacional como fronteira do sucesso, cópias de trabalho, rollback e erros discriminados. Esperar `oncomplete`; tratar abort e fechar ligações em todos os percursos. Falhas de quota, abort e apagamento bloqueado nunca devem produzir confirmação de sucesso ou cache divergente.

### F15 — Auto-lock, suspensão do worker e interface não partilham uma sessão coerente

**Onde:** [atividade](../src/cryptoVault.js#L105), [cache global](../src/cryptoVault.js#L21), [alarme](../background/serviceWorker.js#L225), [timer do popup](../popup/popup.js#L86), [cache inline](../content/modules/autofill.js#L553).

O alarme renova o prazo se o utilizador estiver ativo no sistema, mesmo sem usar o cofre. Reproduzido com atividade do cofre expirada há uma hora. Em contrapartida, ao terminar o service worker perdem-se cache e mestra; o popup mantém cópias antigas e pode achar que continua aberto. Painéis inline retêm entradas completas e podem preenchê-las sem voltar ao background, mesmo depois de um bloqueio. Não existe evento central de revogação.

**Correção/aceitação:** definir se o timeout é inatividade do cofre ou do sistema e implementá-lo a partir de um deadline validado em cada operação. Definir uma estratégia explícita de sessão para MV3, sem a mestra sem encriptação e sem manter o worker artificialmente vivo. Notificar/revalidar todos os clientes e não conservar segredos em painéis. Testar com DevTools fechado: timeout configurado, atividade noutro site, suspensão/retoma do worker, sono do sistema e bloqueio do SO. O Chrome pode terminar o worker após inatividade e perde as variáveis globais. [Ciclo de vida oficial](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle).

### F16 — Bloquear não fecha nem limpa os editores de segredos

**Onde:** [bloqueio no popup](../popup/modules/vault.js#L238), [modal](../popup/modules/ui.js#L87), [abertura da alteração da mestra](../popup/modules/ui.js#L118).

Num ensaio do DOM, bloquear com o editor aberto deixou o modal visível e a palavra-passe preenchida. Fechar modais também não limpa os campos. A limpeza do modal da mestra usa os IDs errados (`newMaster` e `confirmNewMaster`, em vez de `nextMaster`/`confirmNextMaster`). Reatribuir números às propriedades no background não elimina strings nem cópias já enviadas.

**Correção/aceitação:** revogação central fecha e limpa formulários, valores revelados, timers, estado sensível e closures. Fechar/cancelar os modais também deve limpar segredos. Depois de bloquear, inspecionar DOM e clientes abertos não deve revelar cópias retidas pela aplicação.

### F17 — A interface biométrica falha mesmo quando o background desbloqueia

**Onde:** [resposta errada](../popup/modules/biometricSetup.js#L53), [visibilidade](../popup/popup.js#L104), [registo](../popup/modules/biometricSetup.js#L113), [retry no site](../content/modules/autofill.js#L462), [assertion](../content/modules/biometric.js#L20).

O popup lê `entriesRes.data`, mas `LIST_CREDENTIALS` responde `entries`; `renderEntries()` recebe `undefined` e lança. Reproduzido: cofre aberto e mensagem “Authentication failed.” O botão é mostrado quer a biometria esteja ativa quer não. O setup infere PRF só do resultado de `create()`, sem o ensaio de assertion que a documentação do projeto promete. O retry inline chama WebAuthn no contexto do site com RP ID da extensão e usa o ID da entrada do cofre como ID WebAuthn. Sessões canceladas/expiradas não têm limpeza uniforme.

**Correção/aceitação:** contrato único de resposta, uma única implementação de autenticação numa origem confiável, distinção clara entre ID de entrada e ID WebAuthn, ensaio real de PRF, cancelamento e expiração. Testar registo, cancelamento, fallback explícito e reabertura em hardware suportado. Retirar a funcionalidade da primeira fase se estes testes não puderem ser concluídos.

### F18 — Alterar a mestra invalida a biometria configurada

**Onde:** [alteração da mestra](../src/cryptoVault.js#L312), [handler](../src/messageHandlers/vaultHandlers.js#L136), [wrapper biométrico](../src/cryptoVault.js#L458).

A mestra é alterada no cofre, mas o wrapper PRF/Trusted Device continua a devolver a antiga. Reproduzido com PRF sintético: desencriptar o wrapper recupera a mestra anterior e o desbloqueio falha.

**Correção/aceitação:** invalidar/revogar a biometria de forma explícita e pedir nova configuração, ou implementar rotação segura do material correspondente. Trocar mestra, bloquear e tentar biometria não pode resultar numa configuração aparentemente válida que já não funciona.

### F19 — Importações não asseguram identidade nem resolução de duplicados

**Onde:** [validação](../src/validation.js#L102), [merge](../src/cryptoVault.js#L344).

São aceites entradas sem ID e IDs repetidos; importar concatena tudo sem normalização. Reproduzido com duas entradas sem ID e duas com o mesmo ID. Isto afeta edição, eliminação, timers e metadados, além de duplicar entradas a cada restauro. `updatedAt` também não é preservado pelo validador.

**Correção/aceitação:** schema versionado, gerar IDs para formatos legados, validar unicidade, definir merge/substituição/ignorar e preservar datas válidas. Importar duas vezes o mesmo backup deve seguir uma política previsível; uma entrada inválida não pode deixar uma importação parcial.

### F20 — Metadados expõem contas e ficam desatualizados

**Onde:** [índice local](../src/cryptoVault.js#L377), [backfill](../src/cryptoVault.js#L413).

Sites e usernames ficam sem encriptação em `storage.local` e são acessíveis aos content scripts por defeito. O backfill só acrescenta IDs novos: não remove entradas eliminadas noutro contexto/cofre nem atualiza as existentes. Um cofre vazio não limpa o índice.

**Correção/aceitação:** minimizar metadados, definir explicitamente o que se pode revelar com o cofre bloqueado e impedir listagem global nas páginas. Reconstruir/substituir o índice da versão ativa, incluindo vazio, em vez de fazer apenas append. Trocar/restaurar um cofre nunca deve mostrar contas da versão anterior.

### F21 — Settings sem schema, alterações atrasadas e erros ignorados

**Onde:** [persistência](../src/settings.js#L18), [handler](../src/messageHandlers/utilHandlers.js#L121), [debounce](../popup/modules/settings.js#L27), [atualizações genéricas](../popup/popup.js#L237), [preferências duplicadas](../popup/modules/settings.js#L61).

Não há validação de tipos, intervalos ou propriedades. O `catch` do popup não deteta respostas `{ok:false}`, porque `sendMessage` resolve a Promise. Fechar o popup antes dos 250 ms pode perder a alteração. Alterações em qualquer chave local/sync recarregam os settings e podem repor controlos a partir de valores antigos. Existem dois schemas de defaults do gerador; `generatorDefaults` sobrepõe o que os listeners atualizam nos campos de topo.

**Correção/aceitação:** um schema com validação e defaults únicos; persistência serializada/confirmada; erros visíveis e rollback da interface. Filtrar eventos por chave e proibir mudar `useSync` fora do fluxo seguro. Reabrir imediatamente após uma alteração deve manter os valores, incluindo após falha de armazenamento simulada.

### F22 — Guardar no assistente inline é sempre recusado

**Onde:** [envio inline](../content/modules/autofill.js#L688), [restrição do router](../background/serviceWorker.js#L56).

O assistente envia `STORE_CREDENTIAL`, mas o router só o aceita sem `sender.tab`. A reprodução devolveu `Forbidden`.

**Correção/aceitação:** criar um pedido limitado de guardar a credencial da origem atual com confirmação em UI confiável, validado no background. Preservar a restrição da operação genérica de gestão. Guardar numa página de registo deve funcionar sem dar às páginas permissão de alterar arbitrariamente o cofre.

### F23 — Deteção de submissão duplica e perde pedidos de guardar

**Onde:** [captura do submit](../content/modules/autofill.js#L19), [pedido sem validação](../src/messageHandlers/utilHandlers.js#L158), [pendingSaves](../background/serviceWorker.js#L30).

Cada password field de um formulário pode gerar uma notificação, incluindo confirmação e palavras-passe antigas. Não se verifica se a credencial já existe ou se o login teve sucesso. Os pedidos ficam apenas num `Map` do worker e desaparecem se ele terminar antes do clique. `entry` e `origin` são aceites do remetente sem normalização/limites nesse handler.

**Correção/aceitação:** um candidato por formulário/ação, distinguir login, registo e mudança de password, deduplicar por conta/origem e oferecer atualização. Derivar a origem do remetente. Se mantidos pedidos pendentes, usar armazenamento volátil restrito com TTL e revogação ao bloquear; nunca guardar o candidato sem encriptação em armazenamento persistente. Após suspensão do worker, a confirmação deve funcionar ou informar claramente que expirou.

### F24 — O clipboard tem limpeza inconsistente e pode deixar de limpar

**Onde:** [cópia inline](../content/modules/autofill.js#L245), [cópia do popup](../src/utils/clipboard.js#L3), [alarme](../src/messageHandlers/utilHandlers.js#L146), [offscreen](../background/serviceWorker.js#L208), [limpeza](../offscreen.js#L13).

A cópia inline não agenda limpeza. O offscreen é procurado com `documentUrls: ['offscreen.html']`, em vez da URL completa, e não existe proteção contra criação concorrente. Após a primeira criação, novas tentativas podem tentar criar um segundo documento e falhar antes de limpar. O resultado de `execCommand` é ignorado e o clipboard é sobrescrito sem saber se entretanto o utilizador copiou outra coisa. Alterar o timeout para zero não cancela um alarme anterior.

**Correção/aceitação:** um fluxo de cópia/limpeza, URL completa, Promise de criação partilhada, confirmação do resultado e política explícita para novas cópias. Validar e cancelar alarmes quando necessário; evitar pedir leitura do clipboard sem decidir o custo de permissões. Não prometer prazos inferiores à precisão da API: em extensões empacotadas os alarmes têm limite mínimo e podem atrasar. A documentação mostra tanto a [URL completa no offscreen](https://developer.chrome.com/docs/extensions/reference/api/offscreen#examples) como as [restrições dos alarmes](https://developer.chrome.com/docs/extensions/reference/api/alarms#method-create).

Testar duas cópias seguidas, 10/30/120 s, Never, popup fechado e sono/retoma, no sistema operativo alvo. A limpeza real do clipboard não foi aprovada nesta revisão.

### F25 — O router não distingue corretamente contextos nem responde a todas as falhas

**Onde:** [identificação do remetente](../background/serviceWorker.js#L48), [despacho](../background/serviceWorker.js#L142).

`!sender.tab` não prova que uma origem é confiável e recusa páginas legítimas da extensão abertas num separador. Confirmado no Chromium: `INITIALIZE_VAULT` respondeu `Forbidden` nesse contexto. Há também handlers que lançam sem `try/catch`; o `handle()` não tem tratamento final. Uma mensagem inválida ou falha de storage pode fechar o canal sem resposta útil.

**Correção/aceitação:** validar o envelope e aplicar capacidades com base em ID, URL/origem, documento e tipo de contexto. Restringir a página pública de autenticação às operações de autenticação necessárias. Um ponto central deve responder de forma consistente a erros. Mensagens nulas, desconhecidas, malformed e falhas de API nunca devem produzir rejeições não tratadas ou canais pendurados.

### F26 — Validação de formatos criptográficos, limites e tentativas é incompleta

**Onde:** [registo do cofre](../src/cryptoVault.js#L64), [backup](../src/backupCrypto.js#L68), [limites de mensagens](../src/validation.js#L80), [tentativas](../src/cryptoVault.js#L211).

O cofre não tem schema/versionamento explícito; campos e estrutura desencriptada são usados sem validação. Backups não recusam versões desconhecidas, não limitam tamanho e só impõem limite inferior às iterações PBKDF2; um ficheiro pode pedir trabalho excessivo. Os contadores de tentativas existem apenas em memória e reiniciam com o worker; pedidos concorrentes não são serializados. Não há política consistente de robustez da mestra, para lá de não vazia.

**Correção/aceitação:** formato versionado, validação de algoritmos, tamanhos de salt/IV/ciphertext, iterações inteiras com limites inferior/superior e tamanho máximo de importação. Validar o payload depois de desencriptar. Persistir limitação de tentativas em sessão restrita, aplicar antes de iniciar trabalho dispendioso e definir uma política de mestra apropriada. Testar formato antigo, versão futura, corrupção, ficheiro grande e pedidos paralelos. O bloqueio de interface não substitui resistência a ataques offline ao ciphertext.

## P2 — consolidação e melhorias

### F27 — Autofill não deve submeter automaticamente e precisa de compatibilidade definida

**Onde:** [auto-submit](../content/modules/autofill.js#L9), [preenchimento](../content/modules/autofill.js#L263), [heurísticas de formulários](../src/formAnalyzer.js#L1), [observação](../src/formAnalyzer.js#L90), [manifesto](../manifest.json#L34).

O preenchimento submete o formulário 800 ms depois sem opção do utilizador. Isto pode enviar antes de preencher outros campos e dispara os próprios pedidos de guardar. Atribuir `.value` e emitir só `input` não cobre todos os controlos geridos por frameworks. A heurística trata vários campos de password como registo, podendo sobrescrever a password antiga num formulário de alteração. Não cobre iframes nem campos dentro de shadow roots e não observa mudanças de atributos. Reinserir o mesmo elemento pode deixá-lo sem botão por causa de `seen`/`data-securepass`.

**Melhoria:** preencher sem submit por defeito; respeitar `autocomplete`, distinguir password atual/nova/confirmação e validar visibilidade/conectividade. Definir suporte inicial para formulários nativos e SPAs; testar React/Vue, registo, alteração de password e re-render. Iframes e shadow roots podem ser adiados, desde que a limitação seja explícita. Corrigir o overwrite de campos de alteração antes de anunciar suporte a esse fluxo.

### F28 — HTML de usernames é interpretado no assistente

**Onde:** [construção de stubs](../content/modules/autofill.js#L534).

`m.username` entra em `innerHTML` sem escaping. Importações aceitam esses caracteres e o índice local pode conter HTML. Isto permite injeção de markup; execução de event handlers depende do contexto/CSP da página e não foi demonstrada nesta revisão. Não se deve classificar isto automaticamente como execução com privilégios da extensão.

**Melhoria/aceitação:** usar `textContent` para todos os dados de entradas; reservar HTML para templates constantes. Um username como `<img src=x>` deve aparecer literalmente. Tratar esta correção como necessária ao reativar o assistente, independentemente da classificação P2.

### F29 — O medidor apresenta precisão que o algoritmo não sustenta

**Onde:** [estimativa](../src/passwordStrength.js#L35), [crack time](../src/passwordStrength.js#L59), [resultado inline HIBP](../content/modules/autofill.js#L754).

A entropia assume caracteres independentes escolhidos aleatoriamente. Isso não representa palavras-passe humanas previsíveis; a penalização de padrões reduz o score mas não o tempo de quebra mostrado. Os intervalos de “minutes/hours/days/months” são pouco coerentes com os segundos calculados. “Not found in breaches (Safe)” transforma ausência no HIBP numa garantia que a consulta não dá.

**Melhoria/aceitação:** usar um estimador adequado a passwords humanas ou apresentar claramente uma heurística aproximada, sem tempos categóricos. Não desencorajar passphrases só por terem espaços. Usar “Não encontrada nas fugas conhecidas”, sem “Safe”. Validar com padrões comuns, frases, Unicode e passwords aleatórias.

### F30 — HIBP precisa de controlo de pedidos e resultados obsoletos

**Onde:** [rede/cache](../src/hibp.js#L63), [popup](../popup/modules/tester.js#L139), [inline](../content/modules/autofill.js#L736).

A consulta usa corretamente SHA-1 por prefixo e pede padding. Falta timeout/cancelamento e vincular o resultado ao valor original: mudar a password enquanto o pedido está em curso pode mostrar o resultado antigo junto do novo valor. O cache inteiro é regravado em cada miss, com risco de concorrência/quota; a poda pode manter 201 entradas porque acontece antes de inserir. A interpretação deve também considerar que linhas de padding têm contagem zero.

**Melhoria/aceitação:** identificar cada consulta, descartar respostas obsoletas, impor deadline e limitar cache por tamanho real. Preservar padding ou sinalizar explicitamente a política de fallback. Testar offline, timeout, mudança de valor e storage cheio, sem divulgar passwords nem hashes completos em logs. Consultar os detalhes de padding na [API HIBP](https://haveibeenpwned.com/API/v3#PwnedPasswords).

### F31 — Acessibilidade e controlos incompletos

**Onde:** [botões de mostrar password](../popup/popup.html#L184), [listeners de UI](../popup/modules/ui.js#L135), [setup biométrico](../popup/popup.html#L413), [teclado inline](../content/modules/autofill.js#L623), [tema](../popup/modules/theme.js#L30).

Os nove botões `data-toggle-password` não têm handlers. O setup usa um `div role=button` sem suporte Enter/Espaço nem atualização de `aria-expanded`. Falta gestão completa de foco/inert ao abrir modais e settings. No Shadow DOM, procurar o foco em `document.activeElement` não localiza o elemento interno. Existe `watchSystemTheme`, mas não é ligado no popup. Há ainda um listener duplicado para abrir a alteração da mestra.

**Melhoria/aceitação:** ligar ou retirar controlos, preferir elementos nativos, restaurar foco, impedir tabulação para conteúdo inativo, sincronizar labels/estado e usar `shadowRoot.activeElement`. Percorrer toda a interface só com teclado e verificar leitor de ecrã, temas, contraste e zoom. A avaliação visual completa permanece pendente.

### F32 — Manifesto, documentação e preparação da release estão divergentes

**Onde:** [manifesto](../manifest.json#L5), [versão apresentada](../popup/popup.html#L599), [README](../README.md#L101), [arquitetura](../ARCHITECTURE.md#L58).

A versão é `0.1.0` no manifesto e `v1.2.0` no popup. O README anuncia uma página `options/` ausente, um `LICENSE` ausente, deteção de PRF por assertion e garantias de limpeza de memória que o código não cumpre. A arquitetura descreve uma chave derivada em `storage.session`, mas o que o serviço guarda aí é a mestra sem encriptação. Existem referências a controlos de settings que não estão no HTML. `windows` não é uma permissão necessária para a API de janelas e deve ser removida; rever também se `tabs`, recursos públicos e permissões amplas têm necessidade atual.

**Melhoria/aceitação:** obter versão via `chrome.runtime.getManifest()`, ajustar documentação às funcionalidades efetivas, decidir licença e incluir o ficheiro correspondente. Definir versão mínima de Chrome com base nas APIs usadas, suporte a incógnito/file URLs, privacidade, atualização/migração e pacote sem ficheiros de desenvolvimento. A API de janelas explica quais campos requerem `tabs`, sem pedir uma permissão `windows`. [Documentação oficial](https://developer.chrome.com/docs/extensions/reference/api/windows#permissions).

## Primeira fase recomendada

Uma primeira fase concluída pode ter um âmbito menor e verificável:

| Área | Incluir na primeira fase | Condição para considerar concluída |
|---|---|---|
| Cofre local | Criar, desbloquear, bloquear, listar, pesquisar, adicionar, editar, apagar e alterar mestra | Integridade transacional, segredos exatos, sessão/revogação coerentes |
| Backups | Exportação encriptada e restauro num perfil novo | Round-trip completo, erros sem perda de dados e política de duplicados |
| Gerador | Comprimento, conjuntos de caracteres, exclusões e constraints suportadas | Resultado validado ou erro explícito; interface e background usam o mesmo contrato |
| Tester/HIBP | Análise local e consulta explícita opcional | Estimativas honestas, sem resultados obsoletos nem promessa de segurança absoluta |
| Autofill | Pedido explícito e uma credencial autorizada por origem | Desbloqueio apenas em origem da extensão; sem listagem global nas páginas e sem auto-submit |
| Preferências | Tema, timeout e clipboard dentro das capacidades comprovadas | Settings validados, persistidos e com erros apresentados |
| Biometria | Adiar, ou manter apenas o percurso comprovado e seguro | Revogação, rotação, cancelamento e testes de hardware concluídos |
| Sync de cofres | Adiar | Só regressa depois de atomicidade, quotas, recuperação e conflitos entre dispositivos |

Adiar uma funcionalidade implica retirar/desativar os controlos e promessas correspondentes; não basta deixar um toggle que aparenta funcionar. A opção por um MVP local não dispensa corrigir a arquitetura que sustenta o cofre e o autofill.

## Ordem de execução

1. **Conter segredos e definir autorização:** F01–F03, F20, F25; retirar os caminhos inseguros de biometria/Sync que não forem concluídos nesta fase.
2. **Garantir integridade:** F04–F09, F14, F19, F26; fila de operações, sessões revogáveis, estados de erro distintos, commit e recuperação.
3. **Concluir os percursos de produto:** F10–F13, F15–F18, F21–F24; ligar backups e corrigir contratos de UI/background.
4. **Consolidar a release:** F27–F32, documentação, testes em navegador empacotado e evidências de aceitação.

Criar primeiro issues com os cenários de reprodução e trabalhar em alterações focadas, conforme as regras do repositório. Não fazer uma única refatoração que altere simultaneamente crypto, Sync, biometria e UI sem regressões verificáveis.

## Testes mínimos para fechar a fase

| Teste | Resultado exigido |
|---|---|
| Instalar num perfil vazio e recarregar a extensão | Sem erros de manifesto/imports; popup e content script funcionais |
| Criar → guardar → fechar popup → reabrir | Estado previsível, sem desaparecimento de credenciais |
| Desbloquear com mestra errada/certa e pedidos concorrentes | Sem escrita indevida; limitações de tentativas consistentes |
| Guardar passwords com espaços, `<`, `>`, Unicode e comprimento máximo | Igualdade exata no restauro, na cópia e no autofill |
| Adicionar/editar/apagar/importar simultaneamente | Nenhuma operação confirmada é perdida |
| Bloquear durante encriptação/desbloqueio/biometria | Permanece bloqueado; sem segredos retidos nos clientes |
| Auto-lock com popup fechado e worker suspenso | Prazo e estado coerentes em todos os contextos |
| Site A tentar listar/obter credenciais de B | Recusa no background, mesmo conhecendo o ID |
| Navegar/alterar frame durante um pedido de preenchimento | Pedido revogado; nenhum segredo entregue ao novo documento |
| Copiar/gerar/preencher com constraints suportadas | Regras respeitadas; erros explícitos se impossíveis |
| Formulário de alteração com password atual/nova/confirmação | Não sobrescrever o campo atual nem guardar candidatos duplicados |
| Exportar backup → restaurar num perfil novo | Todas as entradas, IDs/datas e segredos recuperados conforme a política |
| Backup adulterado, palavra-passe errada, versão desconhecida e ficheiro enorme | Erro controlado, sem alterações ao cofre existente |
| Falha de quota, abort IndexedDB e storage indisponível | Sem falso sucesso, criação silenciosa ou perda da última cópia válida |
| Clipboard em duas cópias consecutivas e com timeout desativado | Comportamento conforme a política apresentada e comprovado no SO alvo |
| Teclado, foco, temas, zoom e leitor de ecrã | Sem controlos mortos, foco perdido ou segredos visíveis após bloquear |
| Se existir biometria: cancelamento, bloqueio, restart e mudança da mestra | Prova válida obrigatória e configuração coerente no hardware alvo |
| Se existir Sync: dois dispositivos, offline, edições concorrentes e quota | Conflitos explícitos e recuperação da última geração válida |
| Atualização de uma instalação anterior | Migração versionada sem perder acesso aos dados |
| Pacote final e `git diff --check` | Documentação correta, permissões justificadas e whitespace limpo |

Para automatização, começar pelos contratos de mensagens, persistência sob falhas, revogação de sessão, geração de constraints e round-trips criptográficos. Acrescentar testes de navegador para os percursos entre popup/background/content script; testes unitários não detetam sozinhos o erro real de recursos públicos encontrado nesta revisão.

O critério de saída é fechar todos os P0, fechar os P1 das funcionalidades mantidas e executar os testes aplicáveis ao pacote que será disponibilizado. Funcionalidades adiadas devem ficar claramente indisponíveis e documentadas.
