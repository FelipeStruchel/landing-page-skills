---
name: landing-software-extra
description: Use when uma landing page precisa de software além da página estática: agenda ou reserva, painel, API, banco, e-mail transacional, notificação, ou qualquer serviço que roda no servidor ao lado de outro sistema. Não use para páginas só de HTML, CSS e JS.
---

# Landing: software extra

Decisão de arquitetura é do dono do projeto. **Violar a letra é violar o espírito.**

## Iron Law

```
NENHUMA DECISÃO DE STACK, REDE OU RECURSO COMPARTILHADO
SEM PERGUNTAR ANTES. FASE DE ALTO RISCO: ACEITE SÓ VIA COMANDO DO FELIPE.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de software-extra`; ler `01` e `plano.md`; ler `references/agendamento.md` se houver reserva.

## Gate Function

1. Liste as decisões em aberto (stack, banco, onde roda, o que é compartilhado, e-mail, notificação, backup).
2. Para cada uma: opções, **recomendação com o porquê**, custo se errar. Pergunte; não escolha.
3. Registre no `03-decisoes.md` (D<nn>). Se contrariar uma regra global, registre `override: R-nnn` com a aprovação do Felipe.
4. O Felipe roda `! node approve.js --file <03> --fase software-extra --via comando`. Só então implemente.
5. Implemente com TDD. Revisor independente ao fim.
6. Depois do deploy: um caminho **real do vizinho** (ex.: `GET /api/health` do outro sistema) e `docker logs <proxy> --since 2m | grep -c "502\|refused"`.

## Regras fixas

- **Prefixo do projeto** em todo serviço, container e apelido de rede compartilhada (`agenda-api`, `agenda-db`). Antes de entrar numa rede, liste os nomes que o vizinho resolve (`set $api`, `upstream`, `proxy_pass`).
- Segredo só em `.env` do servidor, permissão 600; o que passou pelo chat se recomenda trocar.
- Horário, serviços e preços vêm de **uma** fonte (o banco); o HTML estático é só reserva.
- Nome da opção e duração são campos diferentes; a tela decide o que mostrar por regra explícita.
- Tela interna passa por `landing-direcao-visual` e `frontend-design`; adição tem mockup e conferência item por item.
- Produção: backup antes, `nginx -t` antes de recarregar, janela que não derruba, instrução de reversão escrita. O que exige root vira uma linha para o Felipe.

## Red Flags: pare

- Escolher o banco "porque é o melhor" · reutilizar o nome `api` · deploy sem backup
- Repetir no servidor um plano de 5.000 linhas que você mesmo executaria
- "Funcionou aqui" sem testar o vizinho

| Racionalização | Realidade |
|---|---|
| "A escolha é óbvia" | Se o Felipe descobrisse pelo código, ficaria surpreso? Então pergunte |
| "O nome curto é mais limpo" | `api` na rede `edge` derrubou o vizinho com 502 |
| "O aval foi para a landing" | Aprovação de um contexto não vale para o outro |
