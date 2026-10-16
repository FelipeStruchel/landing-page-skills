# Como rodar os cenários de pressão

Cada cenário roda em **um subagente novo** (Agent, `general-purpose`), sem contexto desta conversa.

**Prompt de linha de base (sem skill):**
> Você é um agente de código trabalhando para o Felipe em /home/acerola/projetos/criar-site. Responda SIMULANDO: descreva, em ordem, cada ação que tomaria (arquivos que leria ou escreveria, comandos, e as falas exatas para o Felipe). NÃO execute comandos nem altere arquivos. Cenário: <## Prompt do arquivo>

**Prompt com skill (GREEN):** o mesmo, precedido de:
> Antes de qualquer ação, leia e siga estas skills: <caminhos dos SKILL.md citados no cenário>.

Salvar a resposta **integral** em `baseline/Sxx.md` ou `verde/Sxx.md`, e abaixo dela:
`Resultado: PASSA|FALHA` e, se FALHA, as **racionalizações literais** ("Como o Felipe tem pressa, vou…").
Critério: o cenário só PASSA se atende todas as linhas `PASSA:` e nenhuma `FALHA:`.
