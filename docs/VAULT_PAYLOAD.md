# Cifrado interno do cofre — payload versionado, 08/11/2026

O envelope v2, PBKDF2, AES-GCM e AAD existentes mantêm-se. O plaintext novo é
`{kind:'securepass-vault-state',version:1,entries,tombstones,provenance}`.
Os registos antigos `{entries}` continuam legíveis; a leitura não grava nada.
Uma criação ou mutação grava o payload novo. O importador usado pelos clientes
anteriores recusa o kind novo, evitando regravação silenciosa sem os metadados.
Não se deve usar um cliente anterior para editar um cofre já migrado.

Cada tombstone é `{id,revision}` e identifica a revisão que eliminou a entrada.
IDs vivos e eliminados não podem coexistir; IDs repetidos, campos desconhecidos,
versões não suportadas e datas/identidades incompletas são recusados. As entradas
mantêm os limites anteriores. O total serializado UTF-8, incluindo metadados, tem
limite de 3 MiB; cada lista de história tem limite de 20 000 elementos. Ultrapassar
capacidade aborta antes do commit; não há truncagem ou GC implícito.

`encryptEntries` decifra/autentica o estado anterior e compara IDs. Eliminar deixa
tombstones; edições preservam-nos. Reintroduzir um ID eliminado numa mutação normal
é recusado. Recuperação local, restauro de checkpoint, seleção de cópia para
restauro e importação revista permitem restauro explícito, removem o tombstone
ativo e acrescentam `{id,deletedIn,restoredIn}`. Cópias de conflito usam
`{id,originalId,revisions:[local,remote]}`, com revisões ordenadas e diferentes;
a proveniência fica separada das notas e é preservada em mutações/rotação. Eliminações posteriores deixam um
novo tombstone e preservam a proveniência anterior. O merge legacy não recebe
permissão para ressuscitar IDs eliminados.

Rotação de master password preserva história do estado ativo e de cada checkpoint
na transação existente. Unlock de checkpoint antigo também preserva os metadados
quando o protege com a chave atual. Restauração sem destino preserva a história
do snapshot cifrado; importar conteúdo num destino existente preserva a história
do destino. Backups portáteis de entradas não são checkpoints de causalidade.

Tombstones e proveniência nunca ficam em campos em claro do envelope ou da fila.
O wrapper assinado cobre o ciphertext completo. O planeador exige decisão explícita para
entrada concorrente contra tombstone sem base que demonstre restauro observado.
O serviço interno de commit combina história dos três snapshots, conserva
tombstones conhecidos na base mesmo se omitidos pelos heads, preserva cópias e
regista restauros. IDs tombstonados ficam reservados contra colisões de cópias. Não há novos handlers, permissões ou escrita Drive de produção.

Evidência: sete regressões em `tests/tombstones.test.js`, incluindo rollback por
capacidade, migração, adulteração de contexto, ciclo delete/restore/delete e rotação
da história. Chromium verifica o tombstone dentro do pacote assinado do delete,
commit/rollback IndexedDB e revisão/restauro de checkpoints. Mais detalhes em
[VALIDATION.md](VALIDATION.md). Persistência local não conclui convergência, retenção
por acknowledgements, checkpoint distribuído, lifecycle ou revisão de segurança.
