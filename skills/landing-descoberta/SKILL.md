---
name: landing-descoberta
description: Use when começa um cliente novo de landing page sem 01-negocio-e-escopo.md aprovado, quando faltam dados do negócio, mídias, nomes ou perfis, ou quando o Felipe pede o questionário de entrada. Não use para escolher estilo visual (landing-direcao-visual).
---

# Landing: descoberta

Reúna **de uma vez, no começo**, tudo o que o projeto vai precisar. Violar a letra é violar o espírito.

## Iron Law

```
NENHUM DESIGN SEM QUESTIONÁRIO RESPONDIDO
OU PENDÊNCIA COM ID, CAMPO E FASE QUE ELA BLOQUEIA
```

**Primeira ação:** confirmar o Passo 0 do orquestrador e ler `references/questionario.md` e `~/.claude/skills/criar-landing-page/assets/modelos/01-negocio-e-escopo.md`. Não use a memória da conversa.

## Gate Function

1. Crie `~/projetos/criar-site/<slug>/` (minúsculas e hífen) com os modelos `01`, `02`, `03`, `04`, `inventario-assets.md` e a pasta `fontes/`.
2. Envie **um** questionário (camadas do `references`). O que o cliente não souber vira pendência.
3. Mídias: `ls -R <cliente>/fontes`, **abra** as imagens relevantes, preencha o inventário só com caminhos que existem. Instagram, Google e site antigo são `referencia`. Nada de imagem gerada por IA nem foto de cliente sem autorização.
4. Nomes: marca, domínio, serviços como o cliente os chama.
5. Dois perfis: da empresa e do cliente dela (quem decide, onde chega, como decide). Objetivo da página, ação esperada e critério de aceitação.
6. Pendências: `{{PENDENTE:P-nnn}}` no corpo e entrada em `pendencias` (id, `campo` do vocabulário fechado, `bloqueia`). Nunca invente um fato.
7. `tags` do `01`: `tipo:`, `nicho:`, `tem:`.
8. `node check-assets.js --root <cliente> --fase descoberta`; corrija e rode de novo.
9. Mostre o resumo; após o "sim", aprove (Gate Function do orquestrador).

## Red Flags: pare

- Escolher cor ou layout antes do `01` aprovado
- "O Instagram dela já mostra tudo"
- Caminho de arquivo que você não listou
- Preço, horário ou endereço "provável"

| Racionalização | Realidade |
|---|---|
| "Pergunto aos poucos" | Aos poucos custou retrabalho em todos os projetos anteriores: junte no início |
| "Vi a foto no Instagram, uso essa" | Referência não é asset: peça o arquivo e os direitos |
| "É uma suposição razoável" | Vira pendência com dono; o `publicar` bloqueia |
| "Falta pouco, desenho já" | O que falta e bloqueia o design bloqueia o design |
