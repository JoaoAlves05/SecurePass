# Configurar Google Cloud para o SecurePass

Esta é uma configuração feita pelo responsável pela extensão, uma vez por identidade/projeto; não deve ser exigida a cada utilizador final da versão distribuída.

Estado em 05/11/2026: o utilizador confirmou que ainda não existe configuração Google. Estes passos preparam a identidade/OAuth; não ativam automaticamente a sincronização nem substituem a integração/revisão do protocolo que continua na checklist.

## 1. Escolher a identidade da extensão

Para desenvolvimento local sem uma identidade Web Store, foi gerado `dist/google-development.json` com uma chave **pública** e um ID estável; o campo `clientId` está vazio. Nenhuma chave privada foi guardada. Manter esse ficheiro: regenerar uma identidade altera o ID que deve estar registado no Google.

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

## 3. Gerar uma cópia de desenvolvimento

Executar:

```sh
npm run configure:google -- --config dist/google-development.json
```

O comando valida a correspondência entre chave pública e ID, recusa campos como `client_secret`/tokens e cria uma pasta nova `dist/SecurePass-google-…`. Adiciona `identity`, apenas o scope appData, o host Google e o client ID ao manifesto dessa cópia. O manifesto principal permanece sem configuração Google inventada.

Carregar essa pasta através de **Load unpacked** em `chrome://extensions` no perfil de teste e confirmar que o ID apresentado coincide com o registado no Google. Depois será necessário testar o fluxo OAuth real quando os handlers/interface de ligação estiverem integrados. A existência de `oauth2` no manifesto ou de uma cópia gerada não significa que o cofre esteja ligado nem que uma publicação tenha sido entregue.

## Dados necessários para continuar a integração real

O `clientId`, o `extensionId` e a chave **pública** são configuração pública. Nunca enviar passwords mestras, tokens, client secrets, chaves privadas nem exports reais. O ficheiro gerado em `dist/` está fora do controlo de versões por omissão.
