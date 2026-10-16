---
name: criar-landing-page
description: Use when o Felipe pede para criar, montar, refazer ou retomar uma landing page ou site de uma página para um negócio ou cliente, ou abre uma pasta de cliente em criar-site/. Não use para redesenhar as próprias skills (landing-evoluir-skill).
---

# Criar landing page

Orquestra fases e gates. **O disco é a fonte da verdade; a memória da conversa não é.** Violar a letra é violar o espírito.

## Iron Law

```
NENHUMA FASE COMEÇA SEM O GATE DA ANTERIOR APROVADO
Saída ≠ 0 do check-gate, ou nenhuma saída, é reprovação.
```

Dados: `~/projetos/criar-site/` (`CRIAR_SITE_ROOT`). Kit e comandos: `~/.claude/skills/criar-landing-page/assets/kit/README.md`. Modelos: `assets/modelos/`. **REQUIRED SUB-SKILL:** `landing-registrar-feedback` vale em todas as fases.

## Passo 0 (obrigatório ao iniciar ou retomar um cliente; ajuste de baixo risco numa fase aprovada o dispensa)

1. `test -f ~/projetos/criar-site/_regras-vivas.md`
2. Não existe: **pare** e pergunte: "Parece que a migração inicial não foi feita. Quer que eu acione a landing-evoluir-skill agora para gerar o _regras-vivas.md com base no histórico de criar-site/?" Se sim: **REQUIRED SUB-SKILL:** Use landing-evoluir-skill (modo migração) e volte ao passo 1.
3. Existe: leia inteiro, defina as tags do projeto, rode `node check-regras.js --file <regras> --tags <tags> --listar`, grave os ids no `01` e diga em uma linha as que valem para este cliente.

## Gate Function

ANTES de cada fase:
1. `node check-gate.js --cliente <nome> --antes-de <fase>`
2. Leia os arquivos de entrada da fase (nunca a memória).
3. Execute a fase.
4. Grave a saída com frontmatter `aprovado: false`.
5. Mostre ao Felipe e espere o "sim" explícito.
6. `node approve.js --file <arq> --fase <fase> --via conversa --citacao "<trecho literal do sim>"`. Fases de alto risco (`software-extra`, `publicacao`): o Felipe roda `! node approve.js ... --via comando`.

| Fase | Skill | Saída |
|---|---|---|
| descoberta | landing-descoberta | `01-negocio-e-escopo.md`, `inventario-assets.md` |
| direcao-visual | landing-direcao-visual | `direcao-visual.md` |
| plano | superpowers:writing-plans, salvo em `<cliente>/plano.md` | `plano.md` |
| execução | superpowers:executing-plans; landing-software-extra se `tem:software-extra` | site, `03-decisoes.md` |
| revisão | superpowers:requesting-code-review mais o kit | resultados em `publicacao.md` |
| publicação | landing-publicar | `publicacao.md` |

Na execução, copie `regras-site.json` e `pares-contraste.json` dos modelos e rode o kit a cada entrega.

## Rigor proporcional ao risco

| Risco | Exemplos | Exige |
|---|---|---|
| Baixo | texto, espaçamento, defeito localizado em fase aprovada | executar direto, **sem Passo 0 nem gates**; só as checagens pertinentes; registrar só se houve reação |
| Médio | identidade visual, seções, decisão aprovada | impacto curto; `approve.js --reabrir` da fase afetada |
| Alto | infra, recurso compartilhado, dados, produção | Iron Law da skill; aceite via comando |

Mudar o que um artefato aprovado afirma reabre aquele gate; em dúvida, a classe acima.

## Red Flags: pare

- "Eu lembro do que o cliente disse" · "Já aprovou, vou direto" · "É rápido, pulo o questionário"
- Escrever `aprovado: true` à mão · esconder mudança material em `## Pendências`
- Decidir stack sem perguntar · mockup para a landing nova

| Racionalização | Realidade |
|---|---|
| "O Felipe tem pressa" | Pressa não aprova fase: rode o gate |
| "É só um ajuste" | Classifique o risco; baixo risco já pode ir direto |
| "A memória basta" | Leia o arquivo; a memória é a fonte menos confiável |
