# Recolha de história Drive autenticada — SC22–SC25

Bloco de continuação de 08/11/2026, após `7d47420`: ligar o leitor Drive ao
adaptador interno de ancestral comum, sem rotas públicas ou escrita remota.

Contrato de implementação: listar completamente a pasta, procurar as revisões
selecionadas e antecessores por identidade, verificar cada cópia assinada antes
de seguir os seus parents e recusar cópias contraditórias. Incluir pacotes locais
pendentes sem os publicar. Limitar contagem/bytes agregados e propagar cancelamento,
mudança de vínculo/sessão/autorização e falhas do transporte. Reenumerar no final;
se o inventário do cofre mudou, exigir nova revisão. Só então criar o preview
opaco do planeador. Não adotar conteúdo, alterar cofre/outbox ou eliminar ficheiros.

A listagem e a reenumeração não provam ausência de rollback do fornecedor nem
atomicidade distribuída. A integração de produção exige ancoragem de frescura,
lifecycle, histórico entre autorizações/épocas, tombstones persistidos e UI.


Implementado em `src/vault/driveMerge.js`: limite partilhado com o adaptador de
256 pacotes/32 MiB UTF-8, contando cópias repetidas e pacotes locais; descoberta
limitada a 10 000 ficheiros pelo leitor. Ramos remotos não selecionados não são
incorporados; a sua mudança no inventário do cofre invalida a preparação. Cópias
ECDSA diferentes do mesmo registo são aceites; registos distintos com a mesma
revisão são recusados. A chave temporária é apagada em sucesso/erro. Uma revisão
sem antecessor disponível preserva o ramo e exige nova recolha, nunca base vazia.
A revisão remota selecionada tem de constar da listagem atual, mesmo se existe
um pacote em cache; cache local não pode disfarçar a sua ausência remota.

Evidência: sete testes dirigidos e suite completa de 244 testes Node aprovados;
check de 137 módulos, cenário Chromium de recolha/merge e pacote aprovados.
Condições adicionais de cancelamento/contexto foram repetidas na suite dirigida.
Ver [VALIDATION.md](../VALIDATION.md). O adaptador permanece interno, sem handler,
rota de ativação, aplicação de conteúdo ou alterações de permissões.
