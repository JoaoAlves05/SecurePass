# Revisão Drive protegida na gestão — 08/11/2026

Expor inspeção de cópias verificadas e preview/decisões/commit apenas à página
bundled de gestão. Vincular os tokens à instância/documento de gestão, sessão,
revisão, conta/geração e autorização. Expirar/descartar em bloqueio/cancelamento;
limitar pedidos pendentes e dados. Nunca guardar passwords de preview em storage
nem aceitar decisões para linhas não revistas. Inspeção sem alterações locais.

A UI estende o grupo Google existente e só disponibiliza o percurso com writer
internamente inscrito, conta ligada, autorização válida e cofre desbloqueado.
Mostra diferenças sem passwords, escolhas explícitas e confirmação do resultado.
Não cria inscrição nem ativa envio Drive. Testes emulados não aceitam OAuth real.


Implementado no serviço `vault/driveReview.js`, handlers/cleanup do worker e módulo
UI homónimo. Inspeção verifica assinaturas e plaintext antes de apresentar
metadados; cópias inválidas, divergentes e cíclicas são isoladas. Conta/revisão/
autorização são revistas no final. Pacotes locais pendentes assinados completam
a história sem publicação. Preparações não retêm o lock global durante I/O,
limitam oito pedidos e dois minutos, e propagam abort até ao token/account reader.
Commit revalida cancelamento/expiração na transação além da sessão existente.

UI: pesquisa, oito conflitos por página, escolhas preservadas, políticas em lote
apenas para conflitos que correspondem à pesquisa e ainda não têm escolha.
Deleções ficam explícitas nas opções. Dados da revisão desaparecem ao bloquear,
cancelar ou mudar de ligação. A feature é condicional a inscrição interna válida;
a conta Google ligada por si só não disponibiliza edição/sending Drive.

Evidência: 266 testes Node, 148 módulos e cenários Chromium de revisão/Settings/
commit aprovados. [Design](../DRIVE_REVIEW_DESIGN.md),
[validação e limites](../VALIDATION.md). Não fecha enrollment, rebase, migração,
retenção distribuída, Google real, hardware ou revisão de segurança independente.
