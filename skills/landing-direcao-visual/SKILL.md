---
name: landing-direcao-visual
description: Use when o 01-negocio-e-escopo.md está aprovado e falta escolher o estilo visual de uma landing page, ou quando uma tela interna (agenda, painel) de um cliente precisa de visual. Não use para levantar dados do negócio (landing-descoberta).
---

# Landing: direção visual

Estilo vem do perfil da empresa e do perfil do cliente dela, não do gosto do momento.

## Iron Law

```
NENHUMA CONSTRUÇÃO SEM 2 OU 3 DIREÇÕES APRESENTADAS
E UMA ESCOLHIDA PELO FELIPE.
TODO VISUAL, INTERNO OU EXTERNO, PASSA POR frontend-design.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de direcao-visual`; ler o `01` e o `inventario-assets.md` **inteiros**; `node check-assets.js --root <cliente> --fase direcao-visual`. Não use a memória da conversa.

## Gate Function

1. Derive os eixos dos dois perfis (`references/perfis-e-estilos.md`).
2. **REQUIRED SUB-SKILL:** Use frontend-design:frontend-design para cada direção.
3. Cada direção traz: nome, ideia em uma frase, tipografia (display e texto, auto-hospedadas), paleta com hex, estrutura de seções, hero, assets por id (`A-nnn`) e o que falta, risco.
4. Para cada paleta, preencha `pares-contraste.json` e rode `node check-contrast.js --css <css> --pairs <pares>`; não apresente paleta reprovada.
5. Recomende **uma**, ligando a recomendação aos dois perfis.
6. Espere a escolha do Felipe. Grave `direcao-visual.md` (frontmatter, `escolhida`) e aprove.

Landing nova: **sem mockup**, construa a página (dá o mesmo trabalho). Adição a algo existente: mockup primeiro; depois de aprovado, confira item por item o construído contra o mostrado. Melhoria justificada durante a construção é permitida e vai para o registro de feedback.

## Revisão visual (antes do gate de publicação)

Hierarquia e tipografia coerentes · 375 e 1280 px, captura da **janela** (não `fullPage`), depois de rolar devagar · contraste (`check-contrast`) · estados de foco, hover, erro, vazio e carregamento · espaçamento, componentes e cores consistentes · CTA adequada ao negócio · a página **implementada**, não o mockup · `check-page`.

## Red Flags: pare

- Escolher o estilo "que achar melhor" e construir
- CSS genérico para tela interna "porque é só para ela"
- Apresentar uma direção só
- Asset citado sem id ou caminho inventado

| Racionalização | Realidade |
|---|---|
| "Interno não precisa de design" | A tela que o cliente usa todo dia faz parte da marca |
| "O Felipe falou 'o que achar melhor'" | Isso é delegação da recomendação, não da escolha |
| "Uma direção é mais rápida" | Duas ou três com recomendação foi mais rápido que discutir por texto |
| "A foto que eu preciso deve existir" | Registre a necessidade; nunca presuma o arquivo |
