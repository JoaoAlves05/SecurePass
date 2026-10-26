# Revisão funcional — Backups & recovery e Advanced

Data: 26/10/2026. SecurePass 0.2.0, revisão sobre a working tree baseada em `0e75d37962e1e0e12dfb0d8d1a6fc4f870f86fe2`. Os dados e perfis de teste são descartáveis. Este relatório regista correções concretas e a evidência executada; não certifica todos os cenários possíveis nem fecha o plano de Sync/Drive.

## Problemas reproduzidos e corrigidos

| Caso | Comportamento anterior | Comportamento corrigido |
|---|---|---|
| Reimportar com Keep both | Recriava a mesma cópia conflitante com outro ID | Reconhece o conteúdo já importado e mantém as duas versões existentes |
| Replace com ID e conta a apontarem para entradas diferentes | A ordem do array podia escolher e substituir a entrada errada | O ID estável tem prioridade; a conta é o critério secundário |
| Importação sem alterações | Criava revisão, consumia um dos cinco snapshots e podia publicar | Retorna zero importações, sem alterar revisão, histórico ou remoto |
| Importação com ramo remoto divergente | O novo fluxo de preview não aplicava a verificação das mutações normais | Recusa o commit antes da gravação e mantém ambos os lados |
| Sync indisponível | VAULT_STATUS podia falhar e impedir o desbloqueio/exportação de uma cópia local saudável | O estado do cofre consulta apenas dados locais; a inspeção remota devolve o erro separadamente |
| Falha na inspeção remota em Advanced | Perdia o estado dos controlos locais e podia manter candidatos remotos desatualizados | Conserva o acesso ao arquivo local, limpa candidatos da inspeção falhada e apresenta o erro |
| Recuperação interrompida entre IndexedDB e preferências | O marcador suspendia publicação permanentemente, sem percurso de conclusão | Startup/alarme ou uma transição explícita concluem a limpeza de forma repetível e mantêm Sync desligado |
| Restauração de versão remota | Tinha uma segunda implementação da sequência de recuperação | Usa a mesma sequência recuperável dos snapshots/importações locais |
| Eliminação forçada com IndexedDB ilegível | Tentava abrir a base de dados antes de validar a confirmação | Valida ERASE THIS DEVICE e elimina sem abrir nem decifrar a base de dados |
| Eliminação interrompida | Podia deixar preferências de Sync ativas depois de apagar o cofre | Persiste suspensão antes de apagar; exige repetir explicitamente a eliminação |
| Eliminação sem cofre atual | O modo de verificar password podia apagar arquivos sem verificar nada | Exige o modo sem desbloqueio e a confirmação textual |
| Ativar publicação sem qualquer cofre | O serviço podia ativar Sync sem uma origem local/remota | Rejeita a operação e conserva o modo desligado |
| Primeiro dispositivo com vários heads remotos | A interface selecionava uma versão mas o serviço exigia haver apenas uma | Adoção aceita a revisão explicitamente selecionada e preserva as restantes |
| Retries automáticos simultâneos | Podiam atravessar em conjunto a verificação inicial e publicar repetidamente | A exclusão começa antes do primeiro await e abrange toda a tentativa |
| Atualizações da interface em paralelo | Uma leitura antiga podia sobrepor o estado mais recente; a exclusividade terminava antes da atualização | Só a leitura mais recente renderiza e a operação permanece ocupada até atualizar o estado local |
| Ficheiros inválidos | JSON inválido mostrava o erro técnico do parser; o limite cifrado contava caracteres | Mensagem específica, limite em bytes UTF-8 e rejeição de payload UTF-8 inválido |

A substituição de um cofre local por uma versão remota exige também uma sessão local desbloqueada e remove a configuração biométrica anterior. A password do backup continua separada da master password; importação em cofre existente conserva a chave e password de destino. Os snapshots conservam as passwords históricas.

## Validação

A baseline tinha **57 testes Node aprovados** e **73 módulos verificados**. Foram acrescentadas regressões persistentes em [backupAdvanced.test.js](../tests/backupAdvanced.test.js) e percursos em [settings-browser.mjs](../tests/settings-browser.mjs).

Os testes novos cobrem repetição de conflitos, prioridade de ID, no-op, expiração/bloqueio de previews, indisponibilidade remota, eliminação sem abertura da base de dados, recuperação interrompida, rollback transacional, divergência remota, políticas inválidas, IDs duplicados, limites de 5.000 entradas e 3 MiB, passwords históricas erradas, destinos desatualizados, eliminação bloqueada, confirmação sem cofre, seleção entre heads e retries simultâneos. Os percursos Chromium acrescentam JSON inválido, erro de inspeção remota e reimportação cifrada sem consumir histórico.

Resultados finais registados em [VALIDATION.md](VALIDATION.md). Os testes gerais existentes continuam a verificar exportação/restauração, criação local, conflitos, cache HIBP, limpeza de entradas/arquivo, eliminação local, rotação da master password, autofill e PRF virtual.

## Limites e aceitação restante

- Chrome Sync continua a ser um transporte legacy com capacidade reduzida. Uma revisão pode caber isoladamente mas não caber juntamente com a anterior; compaction não garante espaço para publicar a próxima. Erros de quota deixam os dados locais e a publicação pendente. Ver [revisão SD](REVIEW_SETTINGS_SYNC_DATA.md).
- Não existe garantia distribuída de atomicidade entre IndexedDB, chrome.storage e outros dispositivos. A reconciliação acrescentada conclui a suspensão/limpeza local; não retoma automaticamente uma gravação de cofre que tenha falhado nem resolve todas as interrupções de mudanças de modo remoto. Numa falha anterior ao commit mantém-se o cofre anterior, com Sync conservadoramente desligado.
- Adoção de um head entre vários conserva os outros; novas edições podem exigir resolução explícita das versões divergentes. Não há fast-forward automático, tombstones ou protocolo de dispositivos assinados.
- Cada ficheiro importado tem limite de 16 MiB. Exportar um snapshot por ficheiro continua a ser o percurso suportado; arquivos agregados legacy maiores exigem o leitor streaming ainda proposto.
- A recuperação sobre um cofre existente exige desbloquear o destino. Para dados atuais esquecidos/ilegíveis existe a eliminação local explicitamente confirmada; esta apaga também os snapshots e deve ser precedida da exportação das cópias cifradas disponíveis.
- Google Drive, kit de recuperação e eliminação remota permanecem propostas. Os testes de dois perfis emulam o transporte; não demonstram Chrome Sync autenticado com Google. PRF virtual não valida um autenticador físico.
- Não foi executada uma matriz de sistemas operativos, leitor de ecrã ou auditoria independente. A eliminação local não promete apagamento físico seguro dos suportes nem eliminação de cópias remotas.

## Verificação manual reproduzível

1. Recarregar a extensão e abrir Settings num perfil descartável. Criar um cofre, guardar duas entradas e exportar com password de backup diferente da master password.
2. Importar uma alteração com Keep both e voltar a importar o mesmo ficheiro: devem continuar apenas as duas versões do conflito. Reimportar o backup atual: zero importações e histórico inalterado.
3. Restaurar um snapshot com a sua password histórica: o cofre anterior fica no histórico e o toggle/status indicam Sync desligado. Uma password errada não altera os dados.
4. Em Advanced, limpar HIBP e confirmar que as entradas permanecem; limpar entradas e confirmar que o histórico permite recuperar. Cancelar cada diálogo destrutivo e verificar que não há alterações.
5. Num perfil sem dados reais, eliminar o dispositivo usando o modo sem desbloqueio: texto incorreto deve falhar; ERASE THIS DEVICE deve limpar cofre, histórico e preferências e mostrar o estado sem cofre. Cópias remotas permanecem.
6. Num ambiente com Chrome Sync Google autenticado e hardware PRF físico, executar os percursos de compatibilidade/autenticação antes de aceitar esses ambientes. Este passo permanece por executar.
