# Seletor de login junto ao campo — implementação de 05/11/2026

O percurso normal passa a ser chave no campo → desbloqueio protegido se necessário → lista de contas junto ao campo → selecionar e preencher. A seleção não submete o formulário nem pede uma segunda autenticação enquanto a sessão for válida.

A lista é renderizada por `selector/selector.html`, de origem da extensão, num iframe dentro do host visual do content script. O site não recebe a lista de nomes através de mensagens nem partilha o DOM desse frame. A password mestra, PRF e criação/gestão de logins ficam na janela protegida existente. Só a conta escolhida é entregue ao documento/campo originais pelo percurso de autofill já validado.

Nesta entrega aparecem até **duas sugestões** junto ao campo. As restantes contas continuam utilizáveis através de **Open SecurePass window**, sem nova autenticação numa sessão válida. A tentativa de paginação dentro do iframe falhou no teste de ponteiro do Chromium; foi retirada, em vez de ser declarada concluída. Pesquisa/paginação ancorada e aceitação de listas longas continuam pendentes (AF08/AF11). Nomes longos têm elipse visual e rótulo/título completos.

## Capacidades e vinculação

- Na política de mensagens do background, a página do seletor só pode pedir detalhes da seleção, preencher uma conta, cancelar, reportar altura limitada e ler preferências públicas de apresentação. Não pode desbloquear, listar o cofre inteiro, gerir entradas ou chamar biometria.
- Cada pedido tem ID aleatório, origem/tab/documento/campo e prazo de dois minutos. O frame tem de estar no tab de origem, ter frameId positivo e fica vinculado ao seu documentId. Outro frame, janela ou reload não reutiliza essa identidade.
- Preenchimento exige um evento de seleção confiável no frame, a revisão apresentada do cofre e confirmação do campo original. O content script atesta foco, estilos de visibilidade/opacidade/transformação dos ancestrais e hit-testing no ponto escolhido, antes da entrega e antes de aplicar os valores; um host transparente é recusado. Estas verificações reduzem ataques de ocultação/oclusão e não provam imunidade a toda a forma de engano visual. Fecho, lock, expiração, navegação e consumo de uma vez invalidam o percurso.
- O desbloqueio transfere o pedido da janela protegida para o frame e remove a propriedade da janela anterior. Fechar essa janela após a transferência não revoga o novo seletor.
- O canal de layout passa pelo background e aceita apenas alturas inteiras de 80–240px; não usa mensagens `postMessage` do site. A largura e posição são limitadas ao viewport, acompanhando scroll/resize. O menu não existe no percurso bloqueado antes de autenticar.
- O frame não envia referrer em navegações. Nomes são texto, nunca HTML. O site recebe a password apenas quando o utilizador escolhe preencher e pode lê-la depois de preenchida.

## Manifesto e limites

A única página HTML nova acessível a páginas web é `selector/selector.html`; auth e popup de gestão continuam fora de `web_accessible_resources`. A diretiva global `frame-ancestors 'none'` passou a `frame-ancestors 'self' http: https:` para permitir esta superfície específica apenas sob esses esquemas/origem própria. Isto restringe as mensagens autorizadas, não cria permissões Chrome diferentes por página da extensão. O controlo de acesso aos dados depende da origem/CSP, do código mínimo da página, das capacidades e da vinculação do pedido, não de Shadow DOM fechado. O frame não possui o fluxo de autenticação.

Uma página pode impedir o frame com a sua CSP, movê-lo, escondê-lo ou tentar enganar visualmente o utilizador. A origem da extensão e os testes de mensagens não equivalem à interface nativa do navegador nem garantem imunidade a clickjacking. O botão **Open SecurePass window** permanece como alternativa protegida, incluindo quando a CSP bloqueia o frame. No estado vazio, essa alternativa permite **Add login** com confirmação explícita. A janela de desbloqueio permite manter a seleção na própria janela quando necessário.

## Evidência

`npm run test:anchored-browser` testa origem correta, uma conta, preenchimento direto/sem submit, isolamento do DOM, capacidades negadas, segundo frame recusado, handoff após desbloqueio, teclado/Escape/reabertura, layout claro/escuro a 320px, scroll, lock cleanup, fallback com `frame-src 'none'`, criação no estado vazio e revisão desatualizada/refrescada. O cenário adicional cria 27 contas, verifica a segunda sugestão diretamente e escolhe a última na janela protegida. Dados e perfis são descartáveis. Capturas em `screenshots/anchored-selector/`.

As suites existentes de account prompts e browser geral exercitam explicitamente o fallback em janela para preservar os percursos de guardar/atualizar, backup e PRF virtual. Os testes Node adicionais exercitam vinculação e metadados sem password. Hardware/SSO/sites reais, leitores de ecrã e revisão adversarial visual mais ampla continuam na matriz de aceitação, sem serem declarados concluídos por estes testes.
