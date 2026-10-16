---
name: landing-publicar
description: Use when uma landing page está pronta para ir ao ar: publicar, fazer deploy, configurar domínio ou Cloudflare, limpar cache, ou conferir o site já publicado. Não use para construir a página (criar-landing-page).
---

# Landing: publicar

Produção é do Felipe. **Violar a letra é violar o espírito.**

## Iron Law

```
NADA EM PRODUÇÃO SEM AVAL EXPLÍCITO.
NENHUM "PRONTO" SEM VERIFICAÇÃO NA URL PUBLICADA.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de publicacao`; ler `01`, `03` (se existir) e o `02` (pendências e reações abertas). Não use a memória da conversa.

## Gate Function

1. Rode **antes** do deploy, no site local, e cole a saída real em `publicacao.md`: `check-refs`, `check-contrast`, `check-content` (com `--segredos <cliente>`), `check-assets --fase publicacao --site <site>`, `check-page` (375 e 1280), e o Lighthouse mobile quando houver. Qualquer saída ≠ 0, ou ausente, reprova.
2. Capture a **janela** em 375 e 1280 e abra os arquivos.
3. Liste em `publicacao.md` o que **não** foi verificado.
4. O Felipe roda `! node approve.js --file <publicacao.md> --fase publicacao --via comando` e `! node authorize.js --cliente <nome> --fase publicacao --acao publicar --destino <destino>`.
5. `bash publicar.sh --root <site> --dest <destino> --cliente <nome>` (dry-run); mostre a saída; só então `--executar`.
6. Depois: limpar o cache do Cloudflare, `node check-cache.js --url <https://...>`, abrir o site publicado com um navegador **novo**, e testar um caminho real do vizinho se houver recurso compartilhado.
7. Só então diga "pronto", com o que foi e o que não foi verificado.

Cloudflare: se o MCP do Cloudflare estiver disponível, use-o para zona, registros e purge; senão, entregue ao Felipe a lista de passos de `references/cloudflare-cache.md`. Destino remoto: `publicar.js` só imprime os passos.

## Red Flags: pare

- Escrever `aprovado: true` ou o token à mão · publicar "porque foi aprovado ontem"
- Dizer "pronto" olhando só o arquivo local
- Verificar só a home · navegador com cache velho

| Racionalização | Realidade |
|---|---|
| "O layout foi aprovado" | Layout aprovado não é autorização de ação em produção |
| "O dry-run passou" | Dry-run não é publicação nem verificação |
| "O arquivo está certo" | Confira o HTML **servido** e o cache real |
| "Falhou parcialmente, ajusto na mão" | Use o comando de reversão impresso e recomece |
