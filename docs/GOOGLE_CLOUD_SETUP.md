# Configurar Google Cloud para o SecurePass

Esta é uma configuração feita pelo responsável pela extensão, uma vez por identidade/projeto; não deve ser exigida a cada utilizador final da versão distribuída.

Estado em 06/11/2026: o utilizador forneceu o client ID público, guardado na configuração local ignorada por Git. A cópia configurada permite autorizar a conta e inspecionar a pasta da aplicação sem enviar o cofre. A autorização Google real ainda precisa de ser executada no Chrome; o teste automatizado usa um fornecedor emulado. A escrita Drive continua bloqueada no código até revisão/aceitação do protocolo e conclusão do ciclo administrativo.

## 1. Escolher a identidade da extensão

Para desenvolvimento local sem uma identidade Web Store, foi gerado `dist/google-development.json` com uma chave **pública** e o ID estável `mhppemdaompjbcooeomnaoailgcpbjjg`. O client ID fornecido foi acrescentado nesse ficheiro local. Nenhuma chave privada foi guardada. Manter esse ficheiro: regenerar uma identidade altera o ID que deve estar registado no Google.

Para criar esse ficheiro noutro checkout: `npm run configure:google -- --create-development-identity`. O comando recusa sobrescrever uma identidade existente. Esta identidade de desenvolvimento não reserva um ID de publicação na Web Store.

Se pretendes preparar a identidade de distribuição, usar o ID e a chave pública da entrada da extensão no Chrome Developer Dashboard. O procedimento oficial permite obter a chave pública antes de publicar. Não enviar nem colocar uma chave privada/PEM de assinatura no repositório. [Instruções do Chrome](https://developer.chrome.com/docs/extensions/reference/manifest/key).

Usar um perfil Chrome descartável para configurar/testar a nova identidade. Uma extensão com outro ID tem armazenamento e inscrição biométrica próprios; o ID novo não migra o cofre existente. Preservar a instalação original e um backup cifrado antes de uma migração deliberada.

## 2. Criar/configurar o projeto Google

1. Abrir o [Google Cloud Console](https://console.cloud.google.com/) e selecionar/criar o projeto dedicado ao SecurePass.
2. Ativar a **Google Drive API** na biblioteca de APIs desse projeto.
3. Configurar a aplicação/consentimento na Google Auth Platform: nome, contactos e audiência apropriada. Durante desenvolvimento, manter em teste e adicionar as contas de teste quando o tipo de audiência exigir.
4. Em Clients/Credentials, criar um cliente OAuth do tipo **Chrome Extension**, associando o ID estável do passo 1. Não escolher Web application nem inventar um client secret dentro da extensão.
5. Configurar o acesso solicitado a `https://www.googleapis.com/auth/drive.appdata`, sem acesso geral aos documentos. Este scope permite a pasta específica da aplicação; não fornece cifragem ou protocolo de conflitos. [Documentação Drive](https://developers.google.com/workspace/drive/api/guides/appdata).
6. Copiar o **client ID público** terminado em `.apps.googleusercontent.com` para o campo `clientId` de `dist/google-development.json` (ou para um ficheiro JSON público equivalente com `clientId`, `extensionId`, `publicKey`).

A aplicação OAuth tem de corresponder à identidade efetivamente carregada. O código não consegue criar nem validar as permissões do teu projeto Google apenas a partir de um client ID. [Fluxo OAuth para extensões](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth).

Podes entrar no Cloud com o teu Gmail pessoal. Na configuração da aplicação, podes usar esse email em **User support email** e **Developer contact information**. Para contas pessoais, escolher audiência **External**, manter **Testing** e adicionar o próprio Gmail em **Audience → Test users**; acrescentar outras contas se forem usadas nos testes. Esta configuração é do responsável pela extensão, não uma tarefa de cada utilizador final.

No formulário de cliente, selecionar **Chrome Extension**, nome `SecurePass Desenvolvimento` e **Item ID** `mhppemdaompjbcooeomnaoailgcpbjjg`. Não são necessários URIs de redirecionamento de uma aplicação web.

## 3. Gerar uma cópia de desenvolvimento

Executar:

```sh
npm run configure:google -- --config dist/google-development.json
```

O comando valida a correspondência entre chave pública e ID, recusa campos como `client_secret`/tokens e cria uma pasta nova `dist/SecurePass-google-…`. Adiciona `identity`, apenas o scope appData, o host Google e o client ID ao manifesto dessa cópia. O manifesto principal permanece sem configuração Google inventada.

Carregar a pasta indicada pelo comando através de **Load unpacked** em `chrome://extensions` num perfil Chrome de teste e confirmar que o ID apresentado é `mhppemdaompjbcooeomnaoailgcpbjjg`. Não substituir a instalação que contém um cofre real.

1. Abrir SecurePass → Settings → **Advanced → Google Drive**. É possível abrir a gestão numa tab para evitar que o popup feche durante a autorização.
2. Escolher **Connect Google account** e autorizar com uma conta incluída nos test users. O email apresentado vem do Drive; não é usado como identidade técnica do vínculo.
3. Escolher **Check app folder**. O resultado distingue enumeração concluída de erro e conta ficheiros, sem afirmar que foram autenticados como cofres. Não cria, descarrega conteúdos de cofres ou publica dados.
4. Escolher **Disconnect** para esquecer a ligação local e suspender a fila. Isto não apaga ficheiros Drive nem afirma revogar globalmente a permissão Google.
5. Registar se a ligação e a inspeção passam. Em caso de erro, comunicar apenas o texto/código mostrado e o passo; não enviar tokens ou dados do cofre.

A autorização usa somente `drive.appdata`; a identidade estável da conta é confirmada por `about.get`, também permitido por esse scope. Tokens ficam na cache da API Chrome Identity, nunca no armazenamento/mensagens da extensão. [Chrome Identity](https://developer.chrome.com/docs/extensions/reference/api/identity), [Drive about.get](https://developers.google.com/workspace/drive/api/reference/rest/v3/about/get).

A existência de `oauth2` no manifesto e uma ligação autorizada não significam que o cofre esteja sincronizado. Não existe controlo de ativação de escrita Drive nesta entrega.

## Dados necessários para continuar a integração real

O `clientId`, o `extensionId` e a chave **pública** são configuração pública. Nunca enviar passwords mestras, tokens, client secrets, chaves privadas nem exports reais. O ficheiro gerado em `dist/` está fora do controlo de versões por omissão.
