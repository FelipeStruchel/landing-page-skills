---
name: landing-evoluir-skill
description: Use when o Felipe pede para redesenhar skills de landing page, revisar aprendizados acumulados, processar feedbacks pendentes, atualizar o _regras-vivas.md, fazer a migração inicial das regras, ou quando o Passo 0 oferece a migração. Não use durante a construção de um cliente.
---

# Landing: evoluir as skills

Transforma feedback bruto em regra verificada. **Regra sem teste vira dogma.** Violar a letra é violar o espírito.

## Iron Law

```
NENHUMA REGRA SEM EVIDÊNCIA E ESCOPO.
NENHUMA EDIÇÃO DE SKILL SEM UM TESTE QUE FALHA ANTES.
```

**REQUIRED BACKGROUND:** superpowers:writing-skills (cenários de pressão com subagente; RED, GREEN, REFACTOR).

## Gate Function

1. **Listar:** `node kit/processar-feedback.js listar` (kit = `~/.claude/skills/criar-landing-page/assets/kit`). Agrupe por escopo e categoria.
2. **Paralelos:** para cada lição, procure a mesma em outros clientes (`grep -n` nos `02` e nos `05-aprendizados.md`) e leia as entradas. Evidência `defeito` ou `resultado-medido` pesa mais que `preferencia`. Hipótese não conta.
3. **Classificar** pela matriz:

| Situação | Destino |
|---|---|
| Repetida e generalizável | candidata a regra geral |
| Repetida, dependente do ambiente | regra com tags (`aplica_quando`) |
| Rara, alto impacto (segredo exposto) | regra de segurança, mesmo com uma ocorrência |
| Subjetiva, sem confirmação | permanece hipótese |
| Sem benefício ou já coberta por script | não promover |

4. **Regra nova:** id `R-nnn`, evidência real (`cliente/E<nn>`), escopo, `aplica_quando` do vocabulário fechado, `nao_se_aplica_quando`, critério de remoção, checagem (script do kit ou `nenhuma`) e skill responsável.
5. **Se a regra muda uma skill:** escreva o cenário de pressão em `_testes-skills/cenarios/`, rode **sem** a mudança (RED, registre a racionalização), edite, rode **com** (GREEN), feche as brechas (REFACTOR). Sem RED, apague a edição.
6. **Poda obrigatória:** remova ou funda regras redundantes, duplicadas entre skills ou cobertas por script. Nenhum redesenho só acrescenta. `node _testes-skills/lint-skill.mjs <skill>` antes e depois (palavras).
7. **Validar:** `node kit/check-regras.js --file ~/projetos/criar-site/_regras-vivas.md` e o teste de seleção por tags dos clientes fictícios.
8. **Fechar:** `node kit/processar-feedback.js marcar --versao v<N>`; registrar em `_evolucao.md`: o que mudou, o que foi podado e as métricas (aprovações reabertas, erros por categoria, regressões, falsos positivos, vezes em que o Felipe lembrou o registro).

**Modo migração:** mesmo processo com todas as entradas `processado: não`, partindo dos `05-aprendizados.md`, gerando `_regras-vivas.md` v1 e `_evolucao.md`. Divida o arquivo em `_regras-vivas/` só por critério medido (tamanho, falha de recuperação, categoria com volume).

## Red Flags: pare

- "Aconteceu uma vez, vira regra geral" (exceto segurança)
- "É óbvio, pulo o teste" · evidência inventada ou sem `E<nn>` real
- Regra de um cliente promovida a global · acrescentar sem podar

| Racionalização | Realidade |
|---|---|
| "O Felipe gosta, então é regra" | Preferência sem confirmação fica como hipótese com escopo |
| "É só uma linha na skill" | Edição sem RED é a mesma violação do TDD |
| "Duas ocorrências bastam" | Frequência é prioridade, não critério: avalie aplicabilidade e risco |
| "Mais regras, mais segurança" | Regra demais vira ruído; podar é parte do trabalho |
