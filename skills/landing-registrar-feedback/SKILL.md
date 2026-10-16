---
name: landing-registrar-feedback
description: Use when SEMPRE durante o trabalho em uma landing page de cliente: ao entregar qualquer coisa (texto, foto, tela, deploy) e ao receber reação, correção, elogio ou aprovação do Felipe ou do cliente.
---

# Landing: registrar feedback

O registro acontece **durante** o trabalho, não depois. **Violar a letra é violar o espírito.**

## Iron Law

```
NENHUMA RESPOSTA COM REAÇÃO OU ENTREGA TERMINA
SEM A ENTRADA E<nn> GRAVADA E RELIDA.
```

## Gate Function

1. **Triagem.** É reação a algo entregue? Pergunta, pedido de alteração e preferência pontual sem reação não são feedback. Ajuste de baixo risco sem reação não gera entrada.
2. **Primeira coisa da resposta**, se há reação:

```
<draft-feedback>
entregavel: <nome>
reacao: "<frase literal>"
escopo: <toda-landing|b2c|b2b|saude-bem-estar|so-este-cliente>
</draft-feedback>
```

3. Resolva o problema técnico normalmente.
4. **Última ação da resposta**, antes de devolver o turno:
`node ~/.claude/skills/criar-landing-page/assets/kit/record-feedback.js --cliente <nome> --entregavel "<…>" --escopo <…> --tipo explicito --reacao "<frase literal>" [--evidencia preferencia|defeito|requisito|resultado-medido] [--impacto baixo|medio|alto] [--licao "<regra>"] [--ja-aconteceu "<cliente>/E<nn>"]`
5. O comando imprime `E<nn>` só depois de reler o arquivo. Escreva "E<nn> gravada". Se falhar, **diga** que falhou e mantenha o bloco visível.
6. **Hipótese** (você inferiu, ninguém disse): `--tipo hipotese --hipotese "<texto>"`, sem `--reacao`. Nunca entre aspas.

**Antes de uma entrega nova**, leia as entradas da mesma categoria no `02` de todos os clientes e as regras do `_regras-vivas.md`; se houver `<draft-feedback>` na conversa sem `E<nn>` gravada depois dele, grave-o primeiro.

## Red Flags: pare

- "Registro no fim do projeto" · "Foi um comentário pequeno" · "Estou no meio de uma refatoração"
- Gravar uma suposição como se fosse citação
- Dizer "registrado" sem ter rodado o comando

| Racionalização | Realidade |
|---|---|
| "Perco o fio se parar agora" | Por isso o registro é a **última** ação, e o bloco vem primeiro |
| "Resumo com minhas palavras" | A reação entra **citada** |
| "O script falhou, anoto mentalmente" | Não existe buffer oculto: avise a falha e mantenha o bloco |
| "É óbvio que ele não gostou" | Isso é hipótese: `--tipo hipotese` |
