# Leitura limitada de arquivos de recuperação grandes — SD07, SC37

Continuação de 08/11/2026: inventariar arquivos legacy de recuperação sem carregar
o JSON completo em memória. Ler janelas de 64 KiB, limitar arquivo a 256 MiB,
100 versões e 16 MiB por registo, e reler apenas a versão explicitamente escolhida.
A estrutura completa tem de ser válida antes de mostrar escolhas. Recusar chaves
raiz repetidas, profundidade excessiva e limites antes de qualquer efeito no cofre.

Guardar identidade/digest/intervalo privado para cada registo; verificar o digest
ao reler a escolha para impedir substituição entre inventário e restauro.
Isolar envelopes inválidos com diagnóstico, mantendo versões válidas acessíveis.
Backups normais continuam limitados a 16 MiB. Nenhum ficheiro se restaura sozinho;
password, revisão do destino e confirmação mantêm os percursos existentes.
