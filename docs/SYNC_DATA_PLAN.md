# Plano completo — Settings, Sync, dispositivos e Data Management

Data: 25/10/2026. Versão do plano: 2. Estado: **especificação recomendada para implementação; não implementada**. Baseline: SecurePass 0.2.0, commit `e97f4c6558be23e50016a9b473441ce4c431490a`. O utilizador concordou com a direção de cofre local cifrado, sincronização opcional e proteção ponta a ponta e pediu cobertura dos diferentes cenários. Este plano concretiza essa direção sem apresentar decisões técnicas por validar como garantias já existentes.

Origem: [23 problemas SD e sete melhorias UX](REVIEW_SETTINGS_SYNC_DATA.md). [VALIDATION.md](VALIDATION.md) continua a ser o registo de evidência executada. Nenhum SD é fechado por escrever este plano.

## 1. Resultado e decisões recomendadas

1. **Cofre local completo e autónomo**, com gravação transacional em IndexedDB, até aos limites explicitamente suportados. A rede nunca é necessária para ler uma cópia local já autenticada ou exportar os dados acessíveis.
2. **Google Drive como primeiro transporte opcional**, através de `appDataFolder` e `drive.appdata`, sem acesso geral aos documentos do utilizador e sem servidor próprio de contas. Chrome Sync deixa de transportar novas versões do cofre após migração verificada; mantém-se leitura de migração. Não implementar dois transportes de escrita simultâneos para o mesmo vínculo.
3. **Cifragem ponta a ponta e HTTPS**, com conteúdo cifrado antes de sair do dispositivo. Google autentica acesso ao armazenamento; a master password autentica acesso criptográfico ao cofre. Tokens Google não são chaves de decifragem.
4. **Uma master password vigente por cofre lógico**, comum aos dispositivos desse cofre. Biometria/PIN suportados pelo autenticador são formas locais de desbloqueio. Não oferecer passwords mestras diferentes por dispositivo para o mesmo cofre nesta versão.
5. **Um cofre ativo por perfil**, com seleção explícita se forem encontrados vários cofres remotos. Cofres substituídos podem ficar em arquivo local cifrado acessível na gestão de dados; não criar uma interface de múltiplos cofres ativos nesta etapa.
6. **Password errada nunca cria, reinicializa, substitui ou publica um cofre.** Cofres distintos podem ter passwords diferentes ou iguais; identidade do cofre e validação criptográfica, não igualdade textual de passwords, determinam a relação.
7. **Sincronização e backup são independentes.** Haverá exportação portátil do estado atual, snapshots locais e histórico remoto limitado. Eliminações sincronizadas não devem destruir automaticamente todas as cópias históricas.
8. **Correções comuns antes do transporte novo.** Não portar o merge, as corridas e os estados incorretos atuais diretamente para Drive. Implementar as regressões SD antes de substituir o protocolo.

Google Drive não elimina quotas nem fornece por si só gestão de conflitos ou cifragem ponta a ponta. A escolha é uma avaliação para este projeto, não uma propriedade de segurança automática do fornecedor. Ver as fontes na secção 22.

## 2. Contrato de segurança e limites da promessa

| Ameaça/situação | Proteção exigida | Limite que deve ser comunicado |
|---|---|---|
| Interceção de rede | HTTPS, validação TLS pelo browser e conteúdo já cifrado | Metadados de tráfego não desaparecem. |
| Acesso aos ficheiros remotos | AES-GCM e chaves de conteúdo protegidas pela master password | Cópias cifradas permitem tentativas offline; password forte é indispensável. |
| Conteúdo alterado ou ficheiro de outro cofre | Validar formato, identidade, autenticação criptográfica e autorização antes de aplicar | Um checksum de transporte não substitui autenticação. |
| Repetição de uma versão antiga | Comparar checkpoints e estado de chaves/autorização já conhecidos | Um dispositivo vazio sem fonte independente não consegue provar que recebeu a versão mais recente. |
| Upload de um dispositivo retirado | Registo autenticado de dispositivos e assinatura de revisões; rejeitar autores revogados | Uma listagem de dispositivos, sozinha, não revoga chaves nem tokens. |
| Conta Google comprometida | Conteúdo cifrado sem chaves em claro no remoto, permissões mínimas e backup independente | O atacante pode apagar ficheiros, impedir sincronização e tentar quebrar passwords fracas. |
| Dispositivo comprometido enquanto desbloqueado | Isolamento de contextos, sessão curta, permissões mínimas, higiene de segredos | Não se promete proteção contra controlo total do SO/processo desbloqueado. |
| Disco/cópia local roubados | Dados cifrados; nenhuma master password em armazenamento persistente | Criptografia do disco/SO acrescenta proteção; não substitui a da extensão. |
| Perda de todos os dispositivos | Backup e kit de recuperação opcional previamente criado | Sem password, chave válida ou recuperação preparada, não há desbloqueio por suporte ou conta Google. |
| Dados apagados remotamente | Cópia local, snapshots e exportações | Não há garantia de recuperar cópias que já não existem. |

Segurança do conteúdo, integridade do histórico, disponibilidade e recuperação são objetivos separados. Um erro de sincronização não deve apagar o último estado local válido. Nenhuma mensagem de interface deve prometer proteção absoluta, entrega imediata ou eliminação de backups externos.

## 3. Identidade do cofre, conta e dispositivos

- `vaultId`: identidade aleatória estável do cofre; não derivada da password, email ou nome apresentado.
- `providerAccountId`: identificador estável da conta autorizada; email é apenas informação de interface. Cada vínculo inclui conta, fornecedor, cofre, versão do protocolo e geração do vínculo.
- `revisionId`: identidade de uma revisão imutável; o mesmo identificador nunca pode representar dois conteúdos diferentes.
- `deviceId`: identidade desta instalação, separada do nome editável do computador. Reinstalar gera uma nova identidade e exige nova inscrição.
- `keyEpoch` e `authorizationRevision`: identificam proteção de conteúdo e estado autenticado de autorização. Um contador maior sem cadeia validada não prova legitimidade.
- O catálogo remoto serve para descoberta e pode conter múltiplos candidatos. Nomes, contagens e datas não são prova de que um cofre é o pretendido. Mostrar uma identificação curta verificável do cofre e permitir comparação com um dispositivo existente.
- Minimizar metadados remotos: usar IDs opacos em nomes de ficheiros; sites, usernames, passwords e nomes descritivos do cofre/dispositivo ficam dentro do conteúdo cifrado. Tamanho, frequência, conta e identificadores técnicos continuam observáveis ao fornecedor.
- Mudar a conta Google nunca reaponta automaticamente a fila pendente. Criar novo vínculo e confirmar se se pretende transferir uma cópia, ligar outro cofre ou cancelar.
- Partilha entre pessoas/contas e cofres empresariais ficam fora deste desenho. A pasta de aplicação não é uma solução de partilha entre utilizadores.

## 4. Primeiro dispositivo e descoberta inicial

O arranque apresenta três percursos: **Criar cofre local**, **Já tenho um cofre sincronizado** e **Restaurar backup**. A escolha é guardada apenas quando o respetivo percurso termina com sucesso.

### 4.1 Criar cofre local

1. Explicar diferença entre conta Google, master password e desbloqueio biométrico.
2. Pedir e confirmar uma master password forte, permitindo colar e mostrar temporariamente. Política proposta: mínimo de 16 caracteres para novas passwords, incentivo a frase longa e limite superior explícito; passwords antigas válidas continuam aceites para desbloqueio/migração, sem impor retroativamente o mínimo novo. Preservar exatamente espaços e Unicode; nunca normalizar ou truncar silenciosamente. Indicar Caps Lock/layout quando detetável, sem registar o valor.
3. Validar capacidade/formato, gerar chaves e gravar o cofre local numa transação. Uma criação interrompida não se apresenta como concluída.
4. Oferecer configurar biometria local e exportar backup. Oferecer o kit de recuperação descrito na secção 7; o utilizador pode adiar com informação clara sobre as consequências.
5. Sincronização é opt-in. Ao ativar, autenticar conta, confirmar permissão, enumerar o remoto completamente e tratar os candidatos existentes antes de publicar.

### 4.2 Quando não se encontram cofres remotos

Só apresentar **“Nenhum cofre encontrado nesta conta”** depois de autorização válida e enumeração completa, incluindo todas as páginas. Timeout, acesso recusado, catálogo incompleto, erro de parsing ou versão incompatível não são ausência de cofre.

Uma instalação nova que pretendia ligar um cofre existente deve primeiro oferecer verificar conta, repetir ou restaurar backup. Criar outro cofre exige escolha explícita. Se dois dispositivos criarem cofres simultaneamente, conservar as duas identidades e apresentar seleção; nunca escolher um por nome/data nem substituir um manifesto global.

## 5. Segundo dispositivo e passwords diferentes

### 5.1 Perfil sem cofre local

1. Escolher **Já tenho um cofre**, autorizar a conta e selecionar o cofre encontrado.
2. Descarregar para staging sem substituir dados nem permitir execução de conteúdo remoto. Validar tamanho, esquema, assinaturas e cadeia conhecida quando existir.
3. Pedir **a master password vigente desse cofre**; não apresentar um formulário de criar password nesta etapa.
4. Derivar a chave com os parâmetros autenticados e limitados do envelope; decifrar a chave protegida e validar o conteúdo completo. Não é necessário enviar a password nem adicionar uma comparação de passwords no servidor.
5. Inscrever o dispositivo através de uma alteração autenticada de autorização, confirmar gravação local e só depois ativar escrita remota. Se houver outro dispositivo disponível, oferecer comparação/aprovação por código de verificação do cofre; o código liga identidades e revisões e não transporta a master password.
6. Configurar biometria local separadamente. Só mostrar “Pronto” quando a cópia local for utilizável e o estado de ligação estiver persistido; falha de inscrição remota deixa a cópia validada utilizável localmente, com escrita remota pendente ou bloqueada.

### 5.2 Password introduzida não abre o cofre

**Não alterar qualquer dado local/remoto.** Manter o candidato cifrado e apresentar: “Não foi possível desbloquear este cofre. Confirma a password e o cofre selecionado; os dados também podem estar danificados.” Permitir repetir, mostrar password, mudar conta/cofre, cancelar ou iniciar recuperação. Não afirmar sempre que houve apenas erro de password.

Aplicar atraso progressivo local após falhas repetidas, sem eliminação automática e sem alegar que isto impede ataques offline a ficheiros roubados. Nunca tentar todas as versões/passwords de forma ilimitada nem fazer uploads após uma falha.

### 5.3 Já existe outro cofre local com password diferente

A extensão não exige que a password desse outro cofre seja igual à remota. Identifica dois cofres e oferece:

| Escolha | Provas e confirmação | Resultado |
|---|---|---|
| Usar o cofre remoto neste perfil | Desbloquear o remoto; autenticar a substituição local quando o cofre atual for utilizável | Arquivar a cópia local antes de ativar a remota; password remota vigente continua a proteger o cofre remoto. |
| Combinar os dados no cofre remoto | Desbloquear ambos, escolher remoto como destino e rever conflitos | Importar o conteúdo local como revisão descendente do destino; conservar a password do destino, sem mudança implícita de chave. |
| Combinar os dados no cofre local | Desbloquear ambos e escolher local como destino | Criar/selecionar ligação remota própria da identidade local; não substituir o outro cofre remoto. |
| Continuar apenas com o local | Nenhuma alteração remota | Cancelar a ligação; preservar ambos. |
| Criar outro cofre separado | Criação explícita e nome/identidade próprios | Novo `vaultId`; não é um reset da password do cofre anterior. |

Mesmo com passwords iguais, cofres com identidades diferentes são distintos. Para combinar não se comparam strings de passwords: autenticam-se ambos os conteúdos. O preview fixa as revisões de origem/destino; se mudarem, deve ser recalculado.

### 5.4 Mesmo cofre, password antiga ou chaves divergentes

- Se o dispositivo conhece uma rotação válida mais recente, pedir a password nova. A password antiga pode abrir uma cópia histórica local, mas isso não autoriza publicar na época atual.
- Guardar alterações offline da época anterior como ramo pendente; após desbloquear a época atual, oferecer rebase/merge validado. Não as descartar e não republicar a época antiga como atual.
- Se existirem rotações concorrentes, suspender publicação automática e conservar ambos os ramos. Pedir resolução autenticada das épocas envolvidas; se um ramo não puder ser decifrado, mantê-lo arquivado como não resolvido e permitir exportação.
- Não escolher a password “vencedora” pela data, contador isolado ou ordem de chegada.

## 6. Formato criptográfico e ciclo de chaves

Introduzir um formato versionado novo apenas após especificação, vetores de teste e revisão do protocolo. Os leitores legacy/v2 ficam separados; clientes antigos não podem gravar no espaço novo. O formato proposto deve conter:

| Componente | Regra |
|---|---|
| Chave de conteúdo | Aleatória de 256 bits por época, gerada com Web Crypto; não é a password. |
| Proteção pela master password | KDF versionada, salt aleatório e limites de custo verificados antes de executar; baseline PBKDF2-SHA256 do projeto com mínimo de 600 000 iterações, sujeito a benchmark/revisão. Não baixar custo silenciosamente por lentidão. |
| Cifragem | AES-256-GCM com nonces de 96 bits e política de unicidade/limites por chave entre dispositivos; definir orçamento e rotação, não assumir colisões impossíveis. |
| Dados autenticados | Versão, domínio da operação, cofre, revisão, pais, época, autor e autorização; serialização canónica especificada. |
| Revisão | Conteúdo cifrado, esquema estrito, digest de transporte, assinatura do autor e referências autenticadas; datas são informativas. |
| Autorização | Cadeia assinada de estados de dispositivos/chaves, separada do conteúdo e validada antes de aceitar revisões. |
| Compatibilidade | Versão mínima de leitor/escritor, algoritmos permitidos e rejeição de formato desconhecido sem reset. |

Assinaturas de dispositivos são necessárias se quisermos que “retirar dispositivo” signifique recusar futuras escritas desse autor. Proposta: ECDSA P-256 via Web Crypto, com chaves próprias de Sync, separadas das credenciais WebAuthn. Uma chave administrativa do cofre autentica inscrições/revogações; a chave privada administrativa fica protegida por master password/recuperação e não permanentemente disponível na sessão normal. Cada dispositivo protege a sua chave privada local e o registo identifica as chaves públicas autorizadas. Não colocar uma chave administrativa em claro no Drive.

Não inventar primitivas criptográficas nem assumir que um novo protocolo é seguro por usar AES. A representação canónica, assinaturas, cadeia de autorização, nonces multi-dispositivo e bootstrap exigem revisão especializada antes da release. Se esta verificação não estiver concluída, não anunciar revogação criptográfica de dispositivos nem lançar a nova escrita remota como concluída.

### 6.1 Alterar a master password

Exigir reautenticação recente, nova password confirmada, estado remoto conhecido e ausência de conflito administrativo por resolver. Preparar uma nova época e um novo snapshot completo; para retirar acesso por uma chave comprometida, rodar também conteúdo e autoridade administrativa, não apenas o invólucro da password.

Num cofre ligado a sincronização, iniciar uma rotação global exige verificação remota completa recente; offline, oferecer aguardar ou recuperar os dados para um novo cofre local independente, sem anunciar alteração da password nos outros dispositivos. Um cofre exclusivamente local pode rodar offline. Mesmo após verificação, uma rotação concorrente posterior é tratada como conflito administrativo.

Persistir intenção e cópia anterior antes de publicar. A operação é retomável: distinguir “nova password aplicada localmente; publicação pendente” de “alteração publicada”. Se falhar depois da publicação, retomar a mesma operação e não apresentar a password antiga como a única válida. Bloquear/revogar sessões e biometria locais afetadas; outros dispositivos pedem a nova password ao observar a transição validada e reinscrevem o desbloqueio local.

Rotações concorrentes formam conflito administrativo, não uma regra de maior contador. Um dispositivo novo sem checkpoint independente não tem uma garantia absoluta contra um fornecedor que lhe sirva uma história antiga válida. Comparação com dispositivo confiável melhora o bootstrap. Mudar a password nunca torna ilegíveis cópias antigas já exportadas ou roubadas.

## 7. Password esquecida e recuperação de acesso

Percursos suportados, por ordem de capacidade disponível:

1. **Dispositivo ainda desbloqueado ou biometria válida:** permitir exportar os dados acessíveis para backup protegido por nova password, após verificação local fresca. A sessão de conteúdo não concede automaticamente poderes administrativos para alterar o cofre sincronizado. Sem master password/kit, recuperar para um novo cofre e preservar o antigo; explicar a diferença entre recuperar dados e alterar a autoridade do cofre existente.
2. **Kit de recuperação previamente ativado:** segredo aleatório de alta entropia, independente da password, com versão/checksum e identificação do cofre. Guarda-se remotamente apenas material cifrado por esse segredo. Ativação exige teste de recuperação numa cópia temporária e confirmação de que foi guardado fora da extensão. Nunca telemetria, clipboard automático ou armazenamento da parte secreta na conta Google usada para Sync.
3. **Backup com password conhecida:** restaurar para um cofre local novo ou importar para destino autenticado, sem alterar automaticamente o remoto antigo.
4. **Nenhuma chave/password/backup acessível:** explicar que não é possível decifrar. Permitir manter/exportar a cópia cifrada, cancelar ou criar um cofre independente. Não existe “reset por email” que preserve magicamente os dados.

O kit é opcional, mas recomendado e oferecido no onboarding. Quem o possui pode recuperar acesso; tratá-lo como segredo equivalente. Perda/roubo exige rotação de recuperação e avaliação de rotação de conteúdo/autoridade, sabendo que cópias antigas continuam expostas às chaves antigas. Não incluir o segredo de recuperação por omissão nos backups normais. Repor o acesso num perfil novo exige também obter uma cópia dos dados; o kit sozinho não restaura ficheiros apagados.

## 8. Separação de estados e interface

Não representar tudo num booleano `useSync`. Guardar e apresentar três eixos separados:

| Eixo | Estados exemplificativos |
|---|---|
| Cofre local | ausente, bloqueado, desbloqueado, corrompido, versão incompatível, limite atingido |
| Ligação/transporte | desligado, a autorizar, a descobrir, ligado, offline, autorização necessária, erro de quota, revogado |
| Trabalho de Sync | sem trabalho, alterações locais pendentes, a enviar, novidade remota, a validar, conflito de dados, conflito de chaves, recuperação necessária |

Guardar `operationId`, conta/vínculo/cofre, revisão alvo, época, fases, tentativas e erro tipificado. Separar `lastPublishedRevision`, `lastValidatedRemoteRevision` e `lastAppliedRevision`. “Pedido aceite pelo Drive” não significa “todos os dispositivos receberam”. Mostrar última verificação e pendência sem expor credenciais em mensagens.

Atualizar a vista por eventos do estado efetivo, incluindo outros separadores e mudanças de storage. Consultas de histórico local não aguardam o remoto. Erros de leitura de status não reativam controlos perigosos nem apagam seleções. Botões indicam progresso, cancelamento e o que ficou concluído.

## 9. Gravação local, outbox e retomada

1. Validar a mutação e o resultado completo, incluindo campos, IDs, datas, tombstones, contagem e bytes UTF-8.
2. Dentro de uma transação IndexedDB, confirmar revisão esperada, guardar o novo registo cifrado, o snapshot anterior e a operação de outbox com identidade de vínculo. Se a transação abortar, nada é confirmado.
3. Atualizar a sessão/UI apenas depois do commit; devolver sucesso local com estado de publicação separado.
4. O worker retoma outbox após arranque, alarme, reconexão e ação explícita, respeitando modo/autorização. Não depender de timers longos, popup aberto ou memória do service worker.
5. Guardar fases antes/depois de I/O remoto; um upload de resultado desconhecido deve ser procurado/verificado pelo identificador lógico antes de repetir. Nunca assumir que timeout significa que nada foi gravado.
6. Desligar Sync invalida a geração do vínculo e impede novos pedidos de escrita. Cancelar pedidos em curso quando possível; se o servidor já os recebeu, reconciliar o efeito sem prometer desfazer a rede. Não iniciar retries nem limpeza remota depois de desligado.
7. Desligado suspende toda a comunicação remota automática. Consultar/descarregar uma versão remota manualmente exige ação explícita e autorização; essa leitura não ativa publicação nem substitui o cofre sem confirmação.
8. Outbox antiga não muda de conta nem de cofre por efeito de uma preferência. Dados válidos continuam locais; trabalho cancelado ou incompatível fica diagnosticável e exportável.

## 10. Protocolo de sincronização Drive

Interface de transporte proposta: listar candidatos/revisões com paginação, obter conteúdo limitado, criar revisão imutável, confirmar conteúdo remoto, enumerar metadados e eliminar apenas IDs explicitamente aprovados. Catálogos/ponteiros aceleram descoberta, mas não são autoridade exclusiva nem ponto único que possa esconder um ramo.

### 10.1 Publicar

- Reconfirmar geração do vínculo, conta, autorização do autor e época antes de enviar; alterações administrativas ou conflitos podem exigir suspender publicação, mantendo gravação local.
- Usar revisões completas cifradas, imutáveis e com pais imediatos, adequadas ao limite local atual; evitar deltas e uma cadeia ilimitada dentro de cada manifesto nesta primeira versão.
- O identificador lógico da operação/revisão torna duplicações de um `files.create` reconhecíveis. Se Drive gerar dois file IDs para a mesma revisão, deduplicar apenas após comparar conteúdo; mesmo ID lógico com conteúdos diferentes é um erro de integridade.
- Um corpo completo assinado/cifrado é a unidade de publicação. Receção parcial permanece em staging e não entra no conjunto de heads válidos.
- Confirmar persistência por leitura/verificação antes de marcar a revisão como publicada. Reenumerar ramos concorrentes; confirmação não prova propagação para outros clientes.

### 10.2 Receber

- Limitar páginas, número/tamanho de ficheiros, profundidade de histórico, custo KDF e memória. Se um limite impedir concluir a enumeração, apresentar descoberta incompleta; não concluir que não há outros heads.
- Verificar cadeia de autorização e assinatura, identidade/época, conteúdo e pais. Decifrar/aplicar apenas quando houver chave e sessão válidas.
- Enquanto bloqueado, pode descarregar conteúdo cifrado limitado e verificar assinaturas conhecidas; não manter credenciais em claro nem desbloquear automaticamente. Aplicar ao próximo desbloqueio.
- Se for sucessor linear autenticado da mesma época e não houver alterações locais incompatíveis, aplicar transacionalmente; invalidar snapshots de sessão/UI antigos. Mudança de chave exige novo desbloqueio.
- Se houver alterações concorrentes, calcular a política da secção 11. Uma versão incompleta ou inválida fica em quarentena; não torna as outras vazias ou automaticamente resolvidas.
- Se a versão incompleta puder esconder um ramo relevante, preservar edições locais e adiar resolução/compactação destrutiva até esclarecer a dependência. Disponibilidade local não justifica ignorar conflitos desconhecidos.

### 10.3 Rede, erros e permissões

| Condição | Ação |
|---|---|
| Sem rede, timeout, 5xx | Preservar outbox; retry limitado com backoff exponencial/jitter; verificar sucesso anterior incerto. |
| 401/token expirado | Renovação silenciosa quando possível; pedir login só após ação/estado visível, sem loops de popups. |
| 403 | Interpretar motivo: autorização, política, quota ou rate limit; não tratar todos os 403 como logout. |
| 429/rate limit | Respeitar instruções de espera quando presentes e aplicar backoff persistido. |
| Quota/espaço esgotados | Manter sucesso local e estado pendente; oferecer diagnóstico, limpeza segura e backup. |
| 404/recurso ausente | Reenumerar e verificar conta/vínculo; não inicializar automaticamente outro cofre. |
| Resposta inválida, demasiado grande ou formato desconhecido | Rejeitar/quarentena, preservar evidência limitada e cópia local; atualização ou recuperação explícita. |
| Acesso Google revogado | Parar transporte; manter cofre local. Reconectar autentica o mesmo vínculo antes de retomar. |

Solicitar interação OAuth apenas em contexto de ação do utilizador. Usar os mecanismos de token do browser; não embutir segredos OAuth num pacote distribuído. Restringir hosts, permissões e mensagens; nunca entregar tokens Drive a content scripts. O projeto OAuth, identificador estável da extensão e consentimento têm de ser configurados e validados para o pacote publicado e para desenvolvimento.

Não prometer sincronização instantânea com browser fechado. Implementar verificação ao abrir/desbloquear, após alterações agrupadas e periodicamente quando Chrome permitir; o service worker pode ser terminado. Notificações push com servidor não fazem parte desta arquitetura inicial.

## 11. Conflitos, eliminações e convergência

- Usar identidade e ancestralidade autenticadas, não datas, para estabelecer causalidade. Com base comum disponível, realizar merge de três vias; sem base verificável, preservar ramos e pedir decisão conservadora.
- Mudanças em entradas diferentes combinam-se automaticamente após validação. A mesma entrada com conteúdo igual deduplica; com conteúdos diferentes gera conflito. Não combinar automaticamente campos de uma credencial se isso puder juntar username/password de versões incompatíveis.
- Mostrar versões sem revelar passwords por omissão; permitir manter local, manter remota ou ambas. Manter ambas cria ID novo e metadados de proveniência próprios; não acrescentar texto que ultrapasse o limite das notas.
- Um merge só marca como resolvidos os heads efetivamente incluídos ou explicitamente descartados. Heads não selecionados continuam ativos. O resultado usa a password/época do destino escolhido; nenhum merge é uma rotação implícita.
- Eliminações são tombstones autenticados. Eliminar de um lado e editar do outro gera conflito; não ressuscitar nem apagar silenciosamente. Recuperação explícita pode criar uma nova entrada com proveniência.
- Importações idênticas repetidas são idempotentes segundo IDs/digests e política escolhida. Site/username iguais com passwords diferentes não são automaticamente “o mesmo dado”.
- Checkpoints autenticados compactam o histórico de causalidade e tombstones sem fingir que todos os dispositivos já viram as alterações. Dispositivos fora da janela suportada têm de voltar a ligar/rebasear; revisões antigas não podem reintroduzir entradas eliminadas como se fossem novas.
- Definir uma janela inicial de inatividade de dispositivo de 90 dias, visível e revista nos testes: ao regressar, nunca descartar o trabalho offline; importá-lo como ramo a rever sobre o checkpoint atual. Remover tombstones só após checkpoint/ack adequados ou retirada explícita dos dispositivos que impedem avanço seguro.
- Três ou mais dispositivos, duplicação de mensagens e ordem diferente de chegada devem convergir para o mesmo resultado quando as mesmas decisões de conflito forem tomadas. Resolver uma vez não deve gerar cópias conflitantes infinitas nas sincronizações seguintes.

## 12. Passwords, biometria e dispositivos retirados

A master password vigente protege o cofre lógico; biometria não é sincronizada. Inscrição exige autenticação fresca e teste real de desbloqueio PRF no dispositivo. Falta de PRF oferece password; não criar chave local de bypass persistente. Cancelamento, bloqueio ou navegação revogam a cerimónia.

Retirar um dispositivo implica atualizar o registo autenticado e rejeitar novas revisões da sua chave de assinatura após a retirada. Se houver suspeita de acesso às chaves, rodar conteúdo/autoridade e reinscrever os dispositivos mantidos. Não afirmar que se revogou remotamente um token OAuth de outra instalação sem suporte do fornecedor: orientar para revogação na conta e fornecer estado explícito.

Um dispositivo retirado ainda pode possuir dados/chaves antigos. Não há apagamento físico garantido à distância. Se regressar com alterações, não publicar automaticamente: permitir exportar os dados acessíveis ou importar para um dispositivo autorizado após reautenticação e revisão. A listagem de dispositivos mostra última observação conhecida, não vigilância em tempo real.

## 13. Backups, importação e recuperação histórica

### 13.1 Formatos e limites

- Manter separação entre backup portátil de credenciais atuais, snapshot cifrado histórico e arquivo de migração legacy. Cada um tem `kind`, versão, limites e mensagens próprias.
- Backup portátil usa password própria confirmada e pode ser restaurado sem conta Google ou instalação anterior. Não incluir tokens OAuth, chaves privadas de dispositivos, configuração biométrica ou o segredo do kit de recuperação.
- Fixar inicialmente limite de 3 MiB de dados de credenciais e 5000 entradas, medidos de forma uniforme em todos os caminhos. Fixar limite de ficheiro individual exportado/importado em 16 MiB, cobrindo cifragem/base64/metadados e formatos atuais válidos. Validar bytes reais e orçamento antes de alocar/derivar.
- Recovery novo exporta cada snapshot selecionado como ficheiro individual importável, com data/identidade próprias. “Exportar todos” é um lote desses ficheiros com progresso e falhas identificadas; não produzir por omissão um JSON agregado que o importador rejeite. Não declarar um download concluído só por executar `anchor.click()`; distinguir pedido de download de confirmação suportada pelo browser.
- Leitura de arquivos Recovery legacy agregados usa percurso separado com limite de 256 MiB, validação incremental e limites por registo/quantidade. Selecionar e validar apenas os registos necessários, sem confiar no tamanho declarado. O parser escolhido precisa de testes de memória/cancelamento; exceder o orçamento leva a erro controlado e preservação do ficheiro, não importação parcial silenciosa.
- Se uma origem válida antiga exceder a capacidade do destino, apresentar contagem/tamanho e permitir seleção/divisão/exportação; nunca truncar para caber. Não anunciar suporte ao limite de arquivo legacy antes de o demonstrar em browser.

### 13.2 Importar ou restaurar

1. Identificar o formato e validar estrutura/tamanho/versão antes de pedir passwords desnecessárias.
2. Desbloquear origem e destino quando necessário; num perfil vazio, criar destino explicitamente após validar o backup. A password do backup não passa automaticamente a master password.
3. Preview mostra novas entradas, idênticas, conflitos e inválidas; opções manter ambas/substituir/ignorar. Importação inválida não altera o destino. Uma importação parcial só existe como seleção explícita sobre preview válido.
4. Fixar revisão de destino e digest da origem; se mudarem, refazer preview. Validar resultado agregado e usar um único commit transacional com snapshot prévio.
5. Restaurar histórico por `snapshotId`/revisão, nunca índice da lista. Por omissão, restaurar como nova cópia local com Sync desligado. Publicar essa história no cofre sincronizado exige operação separada de merge/substituição autenticada.
6. Usar a password histórica do snapshot quando necessária. Se a época atual continuar desbloqueável, oferecer recuperação de entradas para a época atual, sem voltar silenciosamente à password antiga.
7. Snapshots locais são proteção limitada; manter uma exportação fora do dispositivo e testar restauro num perfil descartável.

## 14. Retenção, compactação e capacidade

Defaults propostos para a nova implementação: até 20 snapshots locais e 30 revisões históricas remotas, com orçamentos de 128 MiB locais e 256 MiB remotos para histórico. Preservar pelo menos cinco snapshots locais quando o espaço permitir. Estes valores são política inicial a validar com os tamanhos máximos e não quotas garantidas pelo fornecedor.

Heads ativos, ramos não resolvidos, operações em curso e cópias necessárias à migração não são eliminados para cumprir um contador. Se a política não puder ser cumprida com segurança, exceder o orçamento lógico com diagnóstico ou parar publicação por falta de espaço, mantendo os dados locais; nunca sacrificar a última cópia válida. Espaço físico em disco e quota real do Drive também podem falhar.

- Compactação só considera revisões completas, causalidade/checkpoints autenticados e uma enumeração final de concorrência. Define IDs exatos a apagar e é retomável; ficheiros recém-chegados não entram numa limpeza calculada antes de existirem.
- Nunca eliminar cabeças não reconhecidas nem um upload em curso apenas por ser antigo no relógio local. Identificar órfãos com operações/manifestações e período de segurança definido; se não for possível provar abandono, conservar e mostrar diagnóstico.
- A limpeza remota mostra previamente o alcance e o que permanece recuperável. No `appDataFolder`, eliminar ficheiros não beneficia da lixeira normal; não usar esse mecanismo como rede de segurança.
- Não assumir que a retenção/revisões internas do Drive substitui o histórico cifrado da aplicação. Manter controlo de revisão, autorização e política no protocolo da extensão.
- Armazenar histórico cifrado e outbox em IndexedDB, evitando grandes arrays em `storage.local`. Usar `storage.local` para preferências/metadados pequenos; tratar falhas de quota de ambas as áreas.

## 15. Desligar, apagar e mudar de conta

| Ação apresentada | Efeito e condições |
|---|---|
| Desligar Sync | Parar novos pedidos, invalidar vínculo em execução e manter cofre/histórico locais; informar uploads já aceites. |
| Desconectar conta | Desligar transporte e remover associação/token desta instalação pelo mecanismo suportado; dados remotos mantêm-se. |
| Limpar entradas | Commit de tombstones; se ligado, publicar a limpeza após confirmação que explica outros dispositivos e retenção. |
| Restaurar snapshot local | Novo estado local com publicação desligada; cópia prévia preservada. |
| Apagar deste dispositivo | Apagar IndexedDB/local/session e referências de chaves; fechar operações/UI e limpar clipboard apenas se ainda pertencer à extensão. Remoto não é apagado. |
| Apagar dados remotos deste cofre | Ação distinta e autenticada, com identificação de conta/cofre, heads, histórico e consequências; interrupções mostram o que falta apagar. |
| Mudar conta de Sync | Novo vínculo e confirmação de transferência/seleção; outbox antiga não segue automaticamente. |

Para apagar um cofre saudável, pedir reautenticação. Para cofre corrompido/ausente ou password perdida, disponibilizar eliminação local sem decifrar, com confirmação explícita de irreversibilidade e oportunidade de exportar os bytes cifrados; não depender de remoto. Esta exceção elimina dados, nunca concede acesso aos segredos. A eliminação começa por invalidar gerações e estabelecer uma barreira para escritas: respostas antigas de Sync, cache ou diálogos não podem recriar dados depois do wipe. Se um pedido remoto já tiver sido aceite, informar esse efeito separadamente.

Apagamento remoto com outros dispositivos offline não pode garantir que eles eliminem cópias. Publicar um estado administrativo de encerramento quando possível, desligar a escrita e exigir nova decisão ao regressarem. Se a conta/aplicação perder esse registo ou o fornecedor ocultar dados, não prometer impedir toda a republicação futura: um novo cofre exige identidade nova e a UI trata o cofre remoto conhecido desaparecido como incidente, não como convite automático a recriar.

Não apagar todos os dados da conta/aplicação se houver outros cofres: limitar por identidade e enumerar os objetos alvo. Apagamento físico seguro em SSD, memória JavaScript, backups externos e dispositivos alheios não é uma garantia da extensão.

## 16. Settings, sessão e interface

- Separar `preferences` de `syncBinding`, `syncOperations` e estado criptográfico. `SAVE_SETTINGS` aceita um patch validado apenas de preferências, com revisão esperada; não pode alterar Sync por um snapshot atrasado.
- Reparar campos comuns inválidos com defaults e diagnóstico, sem alterar implicitamente conta, cofre ou publicação. O percurso de recuperação/reset deve arrancar mesmo com settings corrompidos.
- Auto-lock usa `lastActivity` e deadline persistidos; ao reduzir o intervalo, recalcular a partir da última atividade válida e bloquear imediatamente se o prazo já tiver passado. Aumentar o intervalo não desbloqueia uma sessão expirada. Ler status ou executar Sync não renova atividade do utilizador.
- Ao bloquear, cancelar operações de texto em claro pendentes e diálogos; outbox já cifrada pode ser enviada se o vínculo/autorização ainda forem válidos. Não executar merges/decifragem sem sessão. Nenhuma operação antiga reativa uma sessão bloqueada.
- Gravação de preferências deve reconciliar sucesso/erro por versão e atualizar tema, gerador, sliders e outros contextos. Corridas em separadores não podem repor uma política operacional anterior.
- Um gestor exclusivo de diálogos e operações incompatíveis trata duplo clique, Escape, cancelamento, fecho de popup, foco/inert e leitor de ecrã. Oferecer separador de gestão para tarefas longas.
- Clipboard tem política best effort e limpa apenas conteúdo ainda pertencente à extensão; nunca apagar texto posterior do utilizador. Alterar o timeout deve ter comportamento explícito para a cópia em curso, com possibilidade de aplicar a redução imediatamente se ainda houver prova de posse.
- HIBP continua opt-in; TTL controla reutilização. Oferecer limpeza e ocupação; impedir que um pedido antigo repovoe a cache depois de limpeza/wipe usando geração de cache/operação. Reset de preferências não apaga cofre nem muda vínculo.
- Estados técnicos detalhados ficam no diagnóstico; o percurso comum mostra ações compreensíveis, sem expor epochs, manifests ou tokens.

## 17. Migração da implementação atual

1. Inventariar separadamente IndexedDB local, snapshots, arquivo Sync e formatos legacy/v2, mesmo quando coexistem. Não escolher apenas os heads do leitor atual e ignorar o legacy.
2. Criar cópia cifrada de migração e oferecer exportação; não apagar formatos antigos enquanto a nova cópia não tiver passado round-trip e confirmação de leitura remota.
3. Corrigir primeiro os SD de integridade/estado. Introduzir leitores novos e adaptadores de transporte isolados. O writer novo usa outro namespace/versão e clientes antigos não podem escrever nele.
4. Desligar publicação antiga neste dispositivo de forma durável. Outros dispositivos com extensão antiga podem continuar a escrever no Chrome Sync antigo: explicar a necessidade de atualização e detetar alterações tardias para importação explícita, sem as projetar automaticamente sobre Drive.
5. Desbloquear os cofres/fontes necessários. Definir destino/password vigente, resolver heads selecionados e preservar os restantes como não resolvidos/arquivados. Não exigir que todas as fontes tenham a mesma password.
6. Publicar a primeira versão nova, verificar download, assinatura/decifragem e conteúdo, e concluir vínculo local. Só depois considerar a migração terminada.
7. Migração interrompida retoma pelo mesmo ID e digest. Não voltar a importar entradas ou duplicar cofres a cada arranque.
8. Apagar dados antigos é uma ação posterior explícita, com informação sobre dispositivos antigos/offline e impossibilidade de garantia global. Um rollback de extensão nunca deve gravar silenciosamente num formato novo desconhecido.

## 18. Organização de implementação proposta

Manter os handlers como adaptadores e a UI sem autoridade de segurança. Caminhos abaixo são módulos propostos, não ficheiros já criados:

| Área | Responsabilidade proposta | Integração com código atual |
|---|---|---|
| `src/vault/crypto.js` e formato versionado | Envelopes, validação, KDF, assinaturas e épocas | Preservar leitores legacy/v2 e Web Crypto. |
| `src/vault/session.js` | Desbloqueio, deadline, gerações e revogação | Aplicar política imediata de timeout e separar poderes administrativos. |
| `src/vault/repository.js` / `queue.js` | Transações, revisão esperada, snapshots e outbox | Um commit local durável por mutação. |
| `src/sync/state.js` | Vínculos, estados tipificados, checkpoints e operações | Substituir booleanos globais/pendência sem revisão. |
| `src/sync/engine.js` | Push/pull, retoma e limites | Orquestração fora de callbacks de UI. |
| `src/sync/transports/drive.js` | OAuth/rede/ficheiros Drive limitados | Interface de transporte sem receber passwords/entradas em claro. |
| `src/sync/authorization.js` | Dispositivos, cadeia administrativa e revogação | Não reutilizar assinatura de autenticação WebAuthn. |
| `src/sync/merge.js` | Causalidade, tombstones, preview e resolução | Funções testáveis; validação final obrigatória. |
| `src/vault/recovery.js` e serviços de backup | Import/export, snapshots e wipe locais | Sem consulta remota implícita em emergência local. |
| `src/settings.js` | Preferências e migração de schema | Patch/revisão; impedir alterações de vínculo por SAVE_SETTINGS. |
| `src/messageHandlers/` | DTOs, validação e capacidades por contexto | Registar handlers no worker e limitar ao management. |
| `popup/modules/` | Assistentes, preview e estado efetivo | Diálogos exclusivos, acessibilidade e eventos entre contextos. |
| `tests/` | Regressões, falhas e cenários de browser | Testes significativos persistentes, não apenas snippets exploratórios. |

Qualquer biblioteca de parsing/canonicalização que seja necessária deve ter escolha justificada, versão fixa, licença e revisão de dependência. Não introduzir SDK remoto por conveniência se a API REST e Web Crypto forem suficientes. Manter módulos carregados do pacote, sem código remoto executável.

## 19. Fases, entregáveis e cobertura dos problemas

| Fase | Entregáveis e critério de saída | Cobertura |
|---|---|---|
| P0 — Especificação e baseline | Issues focados, contratos de estado/formato, ameaça e fixtures descartáveis; 38 testes existentes preservados, reproduções viram regressões. | Todos SD como baseline; UX07 já documental. |
| P1 — Integridade e autoridade | Validar merge completo; apenas heads selecionados; nenhuma publicação off; patches de settings serializados; sem efeitos de password implícitos. | SD01–SD03, SD06, SD20–SD22 |
| P2 — Persistência e retomada | Transação cofre/snapshot/outbox; pendência por revisão; falhas em cada fronteira; recuperação/wipe independentes e deadline imediato. | SD10–SD11, SD14–SD15, SD23 |
| P3 — Formato/chaves/inscrição | Onboarding, passwords diferentes, épocas, autenticação de dispositivos, kit e compatibilidade com revisão especializada. | Cenários SC01–SC27, SC44–SC47; SD01–SD03, SD16 |
| P4 — Transporte e convergência | Drive opcional, paginação completa, retries idempotentes, quota/entrega parcial, tombstones e checkpoints. | SD04–SD05, SD08–SD09, SD16–SD17 |
| P5 — Dados e UX | Restauro em perfil novo, formatos exportáveis/importáveis, preview de conflitos, retenção, seletores e estados atualizados. | SD07, SD12–SD13, SD18–SD19, UX01–UX06 |
| P6 — Migração e aceitação | Migração retomável, coexistência de versões antigas, testes reais Google/hardware/SO e auditoria independente; documentação final e pacote verificado. | Todos SD/UX e cenários aplicáveis |

A nova Sync não deve ser lançada como completa sem autenticação de alterações administrativas e sem os testes de bootstrap/rotação. É possível disponibilizar primeiro correções locais e Data Management, mantendo a nova ligação remota indisponível até passar os gates. Não confundir etapas com alterações já implementadas ou prometer prazo sem estimar os issues.

## 20. Matriz de cenários obrigatórios

Cada linha precisa de teste persistente adequado e evidência do comportamento observado. A matriz é mínima; testes gerados por combinações de estado e injeção de falhas devem ampliá-la.

| ID | Cenário | Resultado exigido |
|---|---|---|
| SC01 | Criar offline no primeiro dispositivo | Cofre local válido; Sync não é pré-requisito. |
| SC02 | Criar com passwords de confirmação diferentes | Não criar; permitir correção sem perder contexto não sensível. |
| SC03 | Segundo dispositivo, conta/cofre/password corretos | Desbloqueio e inscrição verificáveis; mesma identidade/época. |
| SC04 | Segundo dispositivo, password errada | Nenhuma criação, escrita ou substituição; tentativas limitadas localmente. |
| SC05 | Password correta mas dados adulterados | Rejeitar; não atribuir automaticamente a culpa à password. |
| SC06 | Conta Google errada | Mostrar identidade e permitir mudar; não recriar o cofre conhecido. |
| SC07 | Sem rede/erro ao descobrir | Estado desconhecido, nunca “cofre vazio”. |
| SC08 | Nenhum cofre após listagem completa | Criação apenas explícita; alternativa de backup/conta. |
| SC09 | Dois primeiros dispositivos criam ao mesmo tempo | Duas identidades conservadas; seleção explícita. |
| SC10 | Local e remoto diferentes, passwords diferentes | Autenticar ambos para merge; preservar destino e origens. |
| SC11 | Password igual em dois cofres distintos | Não confundir identidades nem juntar automaticamente. |
| SC12 | Cancelar/desligar/fechar a meio do onboarding | Sem vínculo parcial de escrita; staging seguro e retoma clara. |
| SC13 | Vários cofres ou vários heads no catálogo | Enumerar/selecionar; nenhuma escolha por data/nome. |
| SC14 | Dispositivo conhecido usa password antiga após rotação | Preservar ramo antigo e pedir password atual para publicar. |
| SC15 | Edições offline durante rotação noutro dispositivo | Rebase autenticado após novo desbloqueio; sem perda. |
| SC16 | Duas rotações/administrações concorrentes | Conflito explícito, sem vencedor por relógio/contador isolado. |
| SC17 | Falha em cada fase da rotação | Retoma da mesma operação; informar password/época efetivas. |
| SC18 | Password esquecida, biometria/dispositivo acessível | Exportar dados com verificação; sem poderes administrativos implícitos. |
| SC19 | Kit correto/errado/incompleto | Recuperar apenas com prova válida e dados disponíveis. |
| SC20 | Sem qualquer password/chave/backup | Não conceder acesso; novo cofre independente só por escolha. |
| SC21 | Kit roubado ou password comprometida | Procedimento de rotação e limites históricos comunicados. |
| SC22 | Mudanças em entradas diferentes | Merge automático validado e convergente. |
| SC23 | Mesma entrada muda em dois/três dispositivos | Conflito com manter ambas sem ultrapassar campos nem duplicar repetidamente. |
| SC24 | Eliminar contra editar/criar offline antigo | Tombstone/conflito; nenhuma ressurreição silenciosa. |
| SC25 | Dispositivo volta depois de checkpoint/90 dias | Trabalho preservado; rebase/seleção, sem escrita cega. |
| SC26 | Retirar dispositivo e receber escrita desse autor | Rejeitar nova revisão; preservar dados antigos para exportação local. |
| SC27 | Dispositivo novo sem fonte independente recebe história antiga válida | Não prometer frescura demonstrada; comparação/checkpoint quando disponíveis. |
| SC28 | Upload termina no servidor mas resposta perde-se | Encontrar/verificar pelo ID lógico; sem duplicação funcional. |
| SC29 | Falha local/remote em cada fronteira e restart do worker | Commit/outbox coerentes; sem falso rollback ou sucesso distribuído. |
| SC30 | Ficheiro parcial/corrompido junto de versões válidas | Quarentena; local utilizável; sem compactar dependência incerta. |
| SC31 | Quotas, 401, 403, 404, 429, 5xx e autorização revogada | Estado e retry corretos por motivo; sem loops de OAuth ou perda local. |
| SC32 | Sync desligado por UI ou handler direto | Nenhum novo pedido remoto de escrita/limpeza/retry. |
| SC33 | Desligar/mudar conta durante upload | Invalidar vínculo, informar resultado incerto e não transferir outbox. |
| SC34 | Repetição, reordenação e três perfis | Mesmos resultados para mesmas decisões; conflitos não desaparecem. |
| SC35 | Cofre, campos, UTF-8, ficheiros e KDF nos limites | Aceitar válidos; rejeitar excedidos antes de efeitos/uso descontrolado de recursos. |
| SC36 | Backup exportado no limite e restauro em perfil novo | Round-trip exato sem Google; sem exigir cofre prévio. |
| SC37 | Backup com password errada/versão desconhecida/JSON hostil | Erro controlado, sem alterar destino nem executar conteúdo. |
| SC38 | Preview muda de origem/destino antes do commit | Invalidar/recalcular; nenhuma decisão aplicada a outra revisão. |
| SC39 | Restaurar snapshot enquanto chegam novas gravações | Identidade estável; restaurar o selecionado ou pedir nova seleção. |
| SC40 | Recovery legacy grande e exportação em lote nova | Memória/cancelamento limitados; todos os ficheiros novos reimportáveis. |
| SC41 | Wipe com cofre corrompido, ausente e remoto indisponível | Eliminação local explícita possível; remoto preservado. |
| SC42 | Eliminação remota interrompida e dispositivo offline regressa | Alcance/pendências claros; nenhuma promessa de apagamento físico global. |
| SC43 | Compactação com novo ramo/upload/dispositivo antigo | Preservar heads/cópias necessárias e respeitar checkpoint. |
| SC44 | Lock/auto-lock durante password, merge, export ou biometria | Cancelar texto em claro; nenhuma sessão reativada por operação velha. |
| SC45 | Reduzir timeout, suspensão e restart | Prazo efetivo imediato; Sync/status não renovam atividade. |
| SC46 | PRF ausente/cancelado, reinstalação e chave rodada | Password disponível; nova inscrição; sem bypass nem biometria transferida. |
| SC47 | Assinatura, cadeia ou época forjadas; escritor revogado | Rejeitar antes de aplicar; nenhuma alteração de autoridade por metadados soltos. |
| SC48 | Gravações de settings em corrida com Sync/dois separadores | Sem reverter vínculo; respostas/UI reconciliadas por revisão. |
| SC49 | Settings inválidos, falha anterior e sucesso posterior | Reparação conservadora; reset/recuperação acessíveis; tema/gerador coerentes. |
| SC50 | Restauro/clear/import alteram status | Toggle, contadores, seleção e botões refletem estado efetivo. |
| SC51 | Duplo clique, vários diálogos, Escape, fecho e leitor de ecrã | Exclusão/cancelamento/foco previsíveis; sem promessas pendentes esquecidas. |
| SC52 | Clipboard/cache HIBP durante lock/wipe/clear | Não apagar conteúdo alheio nem repovoar estado eliminado por pedido antigo. |
| SC53 | Legacy e v2 coexistem; múltiplas passwords e heads | Inventário completo, autenticação separada e preservação das fontes. |
| SC54 | Migração interrompida e dispositivo antigo publica depois | Retoma idempotente; alteração tardia não é ignorada nem aplicada silenciosamente. |
| SC55 | Cliente antigo recebe versão nova e downgrade da extensão | Não gravar formato desconhecido; oferecer atualização/exportação compatível. |
| SC56 | Tokens/segredos em logs, mensagens, export e content scripts | Ausência comprovada; apenas contextos de gestão autorizados. |
| SC57 | Sessão Google perdida, dados remotos apagados ou disco cheio | Cofre acessível preservado; diagnóstico e backup/restauro independentes. |
| SC58 | Identidade/fingerprint de cofre não corresponde à fonte confiável | Bloquear ligação/substituição até decisão verificada; não aceitar só pelo nome. |

## 21. Verificação, release e operação

- Testes Node de validação/merge/estados e IndexedDB, interleavings determinísticos, fault injection e vetores criptográficos; nenhuma afirmação de correção baseada apenas no percurso feliz.
- Testes de propriedades: idempotência, preservação de entradas, nenhuma publicação off, aplicação apenas de revisões autorizadas, convergência por permutação de eventos e limites de memória/filas.
- Playwright com três perfis descartáveis, rede emulada e real, suspensão/restart, dois contextos de gestão e UI real. Simulação não substitui autenticação Drive, quotas e comportamento do Chrome empacotado.
- Aceitação em contas Google descartáveis, autenticadores/SO alvo, teclado/leitor de ecrã, clipboard sleep/wake, reinstalação e atualização a partir de fixtures antigas. Nada de dados reais em CI ou screenshots.
- Revisão independente de formato/protocolo, isolamento da extensão, dependências e permissões antes de recomendar uso com credenciais reais. Corrigir os resultados e repetir os testes afetados; auditoria não é prova de ausência de falhas.
- Release só após todos os SD aplicáveis fechados com evidência, UX concluídos ou explicitamente fora de âmbito sem controlos enganosos, migração verificada e package/check/whitespace aprovados. Uma funcionalidade ainda insegura fica indisponível, não apenas com toggle aparentemente funcional.
- Diagnóstico local exportável apenas por ação explícita e revisto pelo utilizador: códigos, versão e fase, sem passwords, conteúdo de entradas, tokens ou chaves. Evitar também URLs/sites/nomes de cofres e identificadores correlacionáveis por omissão.
- Procedimento de incidente: parar publicação mantendo leitura/exportação local, preservar cópias cifradas, rodar chaves/autorizações quando indicado e distribuir correção assinada pelo canal da extensão. Não usar kill switch remoto que possa executar código ou apagar cofres.
- Registar por issue: SD/SC cobertos, alteração, migração, testes, limitações e decisão de aceitação. Não marcar testes propostos como executados nem prometer “todos os cenários imagináveis”; combinar matriz explícita, testes gerados e tratamento conservador de estados desconhecidos.

## 22. Fontes verificadas e pontos de validação técnica

As políticas de produto e a organização de módulos acima são recomendações específicas deste plano. As APIs e princípios de suporte foram verificados em documentação primária:

- [Drive appDataFolder](https://developers.google.com/workspace/drive/api/guides/appdata): pasta de aplicação, scope próprio, ausência de partilha/lixeira e possibilidade de eliminação pelo utilizador. Fundamenta transporte com permissão limitada; não fornece o protocolo de Sync descrito.
- [Chrome Identity](https://developer.chrome.com/docs/extensions/reference/api/identity): OAuth/tokens e interação; fundamenta autorização explícita por conta.
- [Erros Drive](https://developers.google.com/workspace/drive/api/guides/handle-errors): erros e estratégias de retry; o cliente distingue motivo e preserva trabalho local.
- [Ciclo do service worker MV3](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle): estado durável e retomada não podem depender da vida do popup/worker.
- [OWASP Cryptographic Storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html): ameaça, cifragem autenticada, gestão/rotação de chaves e revisão de desenho; não certifica este protocolo proposto.
- [Web Crypto AES-GCM](https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams): autenticação de dados associados e unicidade de IV por chave.
- [Chrome Storage](https://developer.chrome.com/docs/extensions/reference/api/storage): quotas e áreas de armazenamento; não usar o limite local de credenciais como promessa de capacidade Chrome Sync.

Antes de codificar o formato novo, fechar numa revisão técnica: serialização canónica, cadeia administrativa/inscrição, limites multi-dispositivo de nonces, critérios de checkpoint/GC, orçamento real de arquivos legacy, OAuth no pacote estável e prova de retoma em cada fronteira. Se uma garantia depender de uma dessas peças, a release espera pela respetiva validação ou retira explicitamente a garantia/funcionalidade.
