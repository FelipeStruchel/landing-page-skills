# Skills de criação de landing page: design

Data: 2026-10-15. Autor do pedido: Felipe. Status: aguardando revisão do Felipe.

## 1. Objetivo

Um conjunto de skills pessoais que leva o Felipe de um cliente novo (negócio local) até uma landing publicada, com extensão para software extra (como a agenda da Cliente A). As skills aplicam, de forma estrita, o que os três projetos (Cliente A, Cliente B, Cliente C) ensinaram, e **se retroalimentam**: o feedback é registrado durante o trabalho e um redesenho periódico transforma o que ainda não foi processado em regras novas.

**Critério de sucesso:**
1. Num cliente novo, a skill produz o questionário de entrada único, 2 a 3 direções de estilo derivadas do perfil da empresa e do cliente dela, e para esperando a escolha do Felipe.
2. Nenhum erro já registrado nos três relatórios (contraste do botão, cache, rede Docker, horário fixo no código, decisão de stack sem perguntar, tela sem `frontend-design`) se repete sem que uma Iron Law ou checagem o barre.
3. Toda reação do Felipe durante um projeto vira entrada `E<nn>` na hora, não no fim.
4. O redesenho lista só o que está `processado: não`, traça paralelos entre clientes e só altera uma skill depois de um teste que falha.

## 2. Premissas confirmadas

- Local: `~/.claude/skills/` (pessoal). Dados vivos em `~/projetos/criar-site/`.
- Estrutura **B**: várias skills com um orquestrador, todas em regra estrita no molde do superpowers (Iron Law em bloco, Gate Function, Red Flags, tabela Racionalização → Realidade, "violar a letra é violar o espírito", descrição só com gatilho "Use when...", sem resumo de fluxo).
- Visual sempre via `frontend-design`, inclusive telas internas.
- Plano com `superpowers:writing-plans`, executado **na própria sessão** (`superpowers:executing-plans`), com revisão independente ao fim (`superpowers:requesting-code-review`). Referências entre skills por `REQUIRED SUB-SKILL`, nunca por `@`.
- MCP do Cloudflare é **opcional**; sem ele, a skill entrega a lista de passos para o Felipe.
- Mockup só para adição a algo existente; a landing nova é construída direto (E31).
- Produção só com aval explícito do Felipe.

## 3. Skills

| Skill | Gatilho (Use when) | Iron Law |
|---|---|---|
| `criar-landing-page` | Pedido de landing ou site para um negócio | Nenhuma fase começa sem o gate da anterior aprovado pelo Felipe |
| `landing-descoberta` | Cliente novo, antes de design | Nenhum design sem questionário respondido ou `PENDENTE` com dono e data |
| `landing-direcao-visual` | Antes de construir | Nenhuma construção sem 2 ou 3 direções apresentadas e uma escolhida; `frontend-design` em todo visual |
| `landing-software-extra` | O plano inclui agenda, painel, API ou similar | Nenhuma decisão de stack, rede ou compartilhamento sem perguntar antes; prefixo do projeto em recursos compartilhados |
| `landing-publicar` | Domínio, cache, deploy, Cloudflare | Nada em produção sem aval explícito; nenhum "pronto" sem verificação na URL publicada |
| `landing-registrar-feedback` | **SEMPRE** durante o trabalho: ao entregar e ao receber reação | Nenhuma entrega sem entrada aberta; nenhuma entrega nova sem ler as entradas da mesma categoria |
| `landing-evoluir-skill` | O Felipe pede redesenho das skills | Nenhuma regra sem evidência e escopo; nenhuma edição sem teste que falha antes |

### 3.0 Regras de escrita dos gatilhos

A `description` de cada skill começa com "Use when", traz gatilhos específicos (termos que o Felipe realmente diria, em português e inglês quando couber), cita o que **não** é o caso quando houver skill vizinha com risco de confusão, e nunca resume o fluxo. Exemplo para `landing-evoluir-skill`: "Use when o Felipe pede para redesenhar skills de landing page, revisar aprendizados acumulados, processar feedbacks pendentes ou atualizar `_regras-vivas.md`; não use durante a construção de um cliente." Cada skill ganha um teste de disparo: um conjunto de frases que devem ativá-la e outro que não devem.

### 3.1 Fluxo do orquestrador (`criar-landing-page`)

0. **Passo 0 obrigatório:** verificar com `test -f ~/projetos/criar-site/_regras-vivas.md`. Se existir, ler (na versão 1, inteiro; seleção por tags conforme 3.8), levantar as tags do projeto, registrar no `01` os ids de regra carregados, e ler as entradas dos clientes anteriores relevantes ao escopo. Se não existir, **parar** e oferecer a rota de fuga na hora, com esta pergunta: "Parece que a migração inicial não foi feita. Quer que eu acione a `landing-evoluir-skill` agora para gerar o `_regras-vivas.md` com base no histórico de `criar-site/`?". Se o Felipe disser sim, a skill invoca `landing-evoluir-skill` em modo migração (seção 6) e volta ao Passo 0 quando o arquivo existir. A Iron Law se mantém: nenhuma fase seguinte começa sem esse passo, e a skill não improvisa regras de memória. Resumir em uma linha as regras que se aplicam ao cliente atual antes do gate da descoberta.
1. **Descoberta** (`landing-descoberta`): questionário único, mídias existentes, nomes, perfil da empresa e do cliente dela. Gate: Felipe aprova o resumo.
2. **Direção visual** (`landing-direcao-visual`): 2 a 3 estilos derivados dos dois perfis, com recomendação. Gate: Felipe escolhe.
3. **Plano curto** (`superpowers:writing-plans`), declarando se há software extra. Gate: Felipe aprova. O plano é um roteiro para executar, não um documento longo.
4. **Execução na sessão** (`superpowers:executing-plans`), com o kit de checagem copiado no dia 1; `landing-software-extra` quando aplicável.
5. **Revisão independente** (`superpowers:requesting-code-review`).
6. **Publicação** (`landing-publicar`), com aval explícito.

`landing-registrar-feedback` atua em todas as fases, não só numa.

### 3.2 Passagem de bastão: o disco é a fonte da verdade

Cada fase grava seu resultado em arquivo antes do gate, e a fase seguinte **começa lendo esse arquivo**, nunca a memória da conversa (que pode ter sido resumida ou a sessão pode ter sido reiniciada). A primeira ação de cada skill subsequente é uma Iron Law própria:

| Skill | Primeira ação obrigatória | Arquivo de entrada | Arquivo de saída |
|---|---|---|---|
| `landing-descoberta` | Passo 0 do orquestrador concluído; ler modelo do `01` | `_regras-vivas.md` | `<cliente>/01-negocio-e-escopo.md` (com `PENDENTE` e tags do projeto) e `<cliente>/inventario-assets.md` (3.7) |
| `landing-direcao-visual` | Ler `01` inteiro e `inventario-assets.md`; rodar `check-assets` | `01`, inventário | `<cliente>/direcao-visual.md` (2-3 direções, escolhida, justificativa pelos dois perfis, assets citados por id) |
| plano (`writing-plans`) | Ler `01` e `direcao-visual.md` | `01`, `direcao-visual` | `<cliente>/plano.md` |
| `landing-software-extra` | Ler `01` e `plano.md` | `01`, `plano` | `<cliente>/03-decisoes.md` (decisões de stack aprovadas) |
| `landing-publicar` | Ler `01`, `03` e o `02` (pendências e reações abertas) | `01`, `02`, `03` | entrada de deploy no `02` |

Se o arquivo de entrada não existir ou estiver incompleto, a skill **para** e diz qual fase precisa ser refeita; não reconstrói o conteúdo a partir da conversa. Todo arquivo de saída de fase começa com **frontmatter YAML obrigatório**, não texto livre:

```yaml
---
schema_version: 1
fase: descoberta
aprovado: true
data: 2026-10-15
artefato_sha256: "<hash do conteúdo aprovado>"
aprovacao:
  via: comando        # comando | conversa
  citacao: "sim, pode seguir"   # trecho literal da mensagem do Felipe
---
```

Valores fixos: `fase` ∈ {`descoberta`, `direcao-visual`, `plano`, `software-extra`, `publicacao`}; `aprovado` é booleano `true` ou `false` (nunca "sim", "Sim" ou "true" entre aspas); `data` em ISO. A Iron Law de cada fase seguinte é: "Rode `node check-gate.js --file <arquivo> --fase <nome>` (ver kit). Se sair com código diferente de 0, pare e avise o Felipe." O script valida sintaxe, valores **e o hash**: se o conteúdo do artefato mudou depois da aprovação, o gate falha como `desatualizado` e a fase volta a pedir aprovação. O agente não interpreta o texto para decidir. As responsabilidades são separadas: o agente produz o artefato e pede a aprovação; `approve.js` registra o aceite (hash e citação); `check-gate.js` verifica; o orquestrador não avança se qualquer um falhar.

**Limite honesto:** o agente tem acesso ao disco e, tecnicamente, pode editar o YAML. Nenhum validador local prova a origem do aceite. Por isso: (a) `approve.js` só grava `aprovado: true` junto da `citacao` literal da mensagem do Felipe e do hash, e o agente nunca inventa um identificador de aceite; (b) nos gates de **alto risco** (decisão de stack ou rede em `software-extra`, e `publicacao`) o aceite é gravado por um comando que o **próprio Felipe roda** (`! node approve.js ...`, `via: comando`), não pelo agente; (c) o bloqueio de produção vive no `publicar.sh`, que exige esse aceite do Felipe e o hash atual, e não depende só da instrução da skill. Os gates de baixo e médio risco aceitam `via: conversa`, com a citação. Cada `description` e Iron Law cita essa leitura inicial.

Red Flag adicional na tabela de racionalização: "Eu lembro do que o cliente disse" → "Leia o arquivo; a memória é a fonte menos confiável".

**Integridade das aprovações e resolução de pendências.** O hash cobre o arquivo **inteiro**: corpo, incluindo a seção de pendências, e os metadados relevantes do frontmatter. Qualquer alteração fora de uma operação autorizada invalida o gate e exige nova aprovação explícita. Nenhuma seção fica fora da proteção.

Resolver uma pendência é a **única exceção**, e é estreita, verificável e auditável:
- Cada pendência tem id e é declarada no frontmatter **antes da aprovação**, então o agente não pode reclassificá-la depois:

```yaml
pendencias:
  - id: P-001
    campo: endereco
    status: pendente        # pendente | resolvida
    # a classe de impacto é DERIVADA do campo (tabela abaixo); o agente não a preenche
    bloqueia: publicacao    # fase que ela bloqueia (ver 3.4)
resolucoes: []              # log: id, valor, data, hash anterior e novo
```

- No corpo, o ponto pendente é um marcador `{{PENDENTE:P-001}}`.
- A única forma de resolver é `node resolve-pendencia.js --file <arquivo> --id P-001 --valor <texto>`. O script verifica que (1) a pendência existe e está `pendente`; (2) a classe do `campo` permite resolução: `campo` é de um vocabulário fechado e a política é imposta pelo código, não por um rótulo do agente (`contato`, `endereco`, `horario`, `preco`: **confirmado**, exigem `--fonte "<quem confirmou e como>"`, e o script avisa para reabrir se o valor afetar região de atendimento ou público; `correcao-tipografica`: livre; `publico`, `escopo`, `area-atuacao`, `condicoes`, `stack`, `dados-persistentes`: **material**, o script recusa e manda reabrir o gate); (3) o **diff** entre o arquivo anterior e o novo é exatamente a troca daquele marcador pelo valor e a mudança de status, sem nenhuma outra alteração; (4) registra a resolução em `resolucoes`; (5) recalcula o hash e mantém `aprovado: true`. A comparação é feita pelo script entre estado anterior e novo, nunca pela afirmação do agente.
- Edição manual do arquivo, mesmo que parecida com uma resolução, deixa o hash inconsistente e o gate falha como `desatualizado`.
- **Limite honesto:** o script confere a estrutura do diff, não o significado. Se o valor resolvido revelar uma mudança material (o endereço exige outra região de atendimento, o WhatsApp pertence a outra empresa, o público muda), o agente deve rodar `node approve.js ... --reabrir` e pedir nova aprovação; em dúvida sobre o impacto, **não** tratar como simples resolução.

### 3.3 Rigor proporcional ao risco (princípio de arquitetura)

O rigor é proporcional ao **risco da ação**, não ao número de etapas.

| Risco | Exemplos | O que se exige |
|---|---|---|
| Baixo | Ajustar texto, corrigir espaçamento, defeito localizado, **dentro de uma fase já aprovada** | Executar direto; rodar as checagens pertinentes do kit; registrar feedback só se houve reação do Felipe. Sem novo gate, sem reler todo o `_regras-vivas.md` |
| Intermediário | Mudar identidade visual, reorganizar seções, funcionalidade nova, alterar decisão já aprovada | Análise de impacto curta; reabrir o gate da fase afetada (o hash já o marca `desatualizado`); `via: conversa` basta |
| Alto | Infraestrutura, recurso compartilhado entre projetos, dados persistentes, produção | Verificações específicas, Iron Law da skill correspondente e aceite `via: comando` |

**Definições:** *nova fase* = a entrega cria um dos artefatos de fase da seção 3.2; *mudança de escopo* = altera algo que um artefato aprovado afirma (hash muda), e reabre aquele gate; *correção dentro da fase* = não altera o que o artefato afirma, e não reabre nada. Dúvida sobre a classificação: tratar como a classe acima e dizer qual foi a classificação.

### 3.4 Questionário em camadas e bloqueio por fase

O questionário é único, mas dividido em quatro camadas: **(1) obrigatórias para começar** (nome, o que vende, cidade, canal de contato, se há reserva no site, **o objetivo principal da página, a ação esperada do visitante e o que torna a entrega aceitável**, ex.: salão = pedido de horário pelo WhatsApp; espaço de eventos = pedido de orçamento); **(2) importantes que podem ficar `PENDENTE`** com dono e data; **(3) condicionais ao tipo de negócio** (ex.: área de atuação para negócio sem loja, regras do conselho para saúde); **(4) decisões que só o Felipe ou o cliente podem tomar**. Cada `PENDENTE` é uma pendência com id (`P-nnn`), `campo` e `bloqueia`, conforme a seção 3.2, e declara **qual fase ele bloqueia**: o endereço definitivo não bloqueia a direção visual, mas bloqueia a publicação; preço não confirmado não bloqueia o plano, mas não pode aparecer na página como confirmado. O `check-content` e o `publicar.sh` barram qualquer `PENDENTE` exibido como fato.

### 3.5 Critérios visuais verificáveis (para `frontend-design` não ser formalidade)

Invocar `frontend-design` é necessário, mas não suficiente. Antes do gate da revisão, a página implementada é avaliada contra critérios, sem exigir estrutura igual entre clientes: hierarquia visual e tipográfica coerente; layout em 375 e 1280 px (captura da **janela**, não `fullPage`, depois de rolar devagar); contraste de texto e controles (`check-contrast`); estados de hover, foco, carregamento, erro e vazio quando existirem; consistência de espaçamento, componentes e cores; conteúdo e chamadas para ação adequados ao negócio; verificação visual da página **realmente implementada**, não do mockup. Vale também para telas internas (agenda, painel). A implementação segue a direção escolhida, mas melhorias justificadas e registradas no `02` são permitidas.

Duas avaliações separadas, sempre declaradas no registro: **qualidade de implementação** (acessibilidade, responsividade, navegação por teclado, desempenho, erros de console e requisições falhas, overflow horizontal; `check-page` mais o script de Lighthouse herdado da Cliente B) e **qualidade de negócio** (clareza da oferta, adequação ao público, confiança, coerência da chamada para ação e facilidade de contato, contra os critérios de aceitação do `01`). Sem dados reais de conversão, o relatório diz que verificou a **implementação**, não a eficácia comercial, e não inventa meta de conversão.

### 3.7 Inventário de assets (desde a primeira versão)

A descoberta gera um inventário confiável das mídias, não uma lista informal. Três conceitos, nunca confundidos: **referência** (o cliente mencionou ou mostrou), **asset disponível** (arquivo localizado e acessível dentro de `<cliente>/`) e **asset aprovado** (uso autorizado e papel definido).

O inventário fica em arquivo próprio, `<cliente>/inventario-assets.md`, e **não dentro do `01`**: o status dos assets muda toda hora (chega foto, direito é confirmado) e, dentro do `01`, cada mudança invalidaria o hash da descoberta. O `01` apenas cita o inventário.

```
| ID | Caminho (relativo) | Tipo | Status | Alt-text | Uso | Direitos | Obs |
|---|---|---|---|---|---|---|---|
| A-001 | fontes/logo.svg | logo | aprovado | Logo da empresa X | header | confirmados | |
| A-002 | fontes/fachada.webp | foto | disponivel | PENDENTE | PENDENTE | pendentes | 1600x900 |
| A-003 | (referência) instagram.com/p/... | foto | referencia | n/a | inspiração | n/a | não é asset |
```

- `Status` ∈ {`pendente`, `referencia`, `disponivel`, `aprovado`, `rejeitado`}; `Direitos` ∈ {`confirmados`, `pendentes`, `nao-autorizados`, `n/a`}.
- **Procedência e integridade:** colunas adicionais `Origem` (quem enviou, por qual canal, data) e `Sha256` (calculado pelo `check-assets`). Asset `aprovado` cujo hash mudou depois vira `desatualizado` e precisa de nova aprovação. Licença ou autorização vai em `Direitos` e `Obs`.
- **Só entram caminhos confirmados** por listagem real do sistema de arquivos; o agente nunca inventa um caminho para completar a tabela.
- **Alt-text pode ficar `PENDENTE` na descoberta** e é exigido só antes da publicação. Imagem decorativa recebe `alt=""` declarado (`Alt-text: decorativa`), não uma descrição.
- Arquivos em `fontes/` que não estão no inventário como `aprovado` não precisam ser usados; podem ser contexto ou versão antiga.

`node check-assets.js --root <cliente>` verifica: arquivos existem; caminhos relativos e dentro de `<cliente>/` (`realpath`); tipo do arquivo compatível com o `Tipo` e o `Uso`; ids únicos; arquivo em `fontes/` sem linha no inventário (aviso, não erro); campos obrigatórios preenchidos ou `PENDENTE`; legível pela ferramenta disponível (imagem: dimensões e formato). `--fase publicacao` endurece: todo asset usado no site precisa estar `aprovado`, com `Direitos: confirmados` e alt resolvido.

`landing-direcao-visual` **consome** o inventário e separa nas direções: assets existentes e aprovados; existentes mas não aprovados; materiais só de referência; materiais a criar ou pedir ao cliente. Se a direção exige uma foto que não existe, registra a necessidade ou propõe alternativa; nunca presume um caminho como `assets/hero-banner.webp`. O inventário não substitui a inspeção visual: o agente abre os arquivos relevantes quando a ferramenta permitir. O `direcao-visual.md` cita assets por id, e `check-assets` reprova id inexistente.

### 3.8 Sistema de regras: simples agora, preparado para crescer

**Versão 1:** arquivo único `_regras-vivas.md`, mas cada regra já com metadados estruturados:

```
id: R-014
categoria: infra          # geral | design | conteudo | infra | agenda | b2b | b2c | saude
escopo: geral             # geral | tag1,tag2 (vocabulário fechado abaixo)
aplica_quando: [tem:cloudflare, fase:publicacao]
severidade: obrigatoria   # obrigatoria | recomendada
evidencia: [cliente-b/E20, cliente-a/E23]
checagem: check-cache     # script do kit, ou "nenhuma"
skill: landing-publicar
```

`aplica_quando` usa um **vocabulário fechado de tags**, definido no cabeçalho do arquivo (`tipo:b2c`, `tipo:b2b`, `nicho:saude`, `tem:agenda`, `tem:cloudflare`, `tem:formulario`, `fase:<fase>`, ...), nunca texto livre; uma regra com tag fora do vocabulário é inválida (o `landing-evoluir-skill` valida). Isso mantém a seleção verificável em vez de interpretativa.

**Passo 0, evoluído:** (1) ler o cabeçalho e o índice; (2) levantar as tags do projeto atual (tipo, nicho, funcionalidades, infraestrutura, fase) e gravá-las no `01`; (3) carregar **todas** as regras `escopo: geral` e `severidade: obrigatoria`, mais as que casam com as tags; (4) registrar no `01` quais ids foram carregados; (5) se houver regra obrigatória sem classificação válida, parar. Regras universais **nunca** são descartadas pela seleção, e as de alto risco têm bloqueio independente do agente (ex.: produção só passa pelo `publicar.sh`). Na versão 1, com poucas regras, o Passo 0 continua **lendo o arquivo inteiro**; a seleção por tag já é registrada para que a migração futura não mude o contrato.

**Quando dividir em `_regras-vivas/` (`_indice.md`, `gerais.md`, `design.md`, `infra.md`, `agenda.md`, `b2b.md`):** só quando um critério medido for atingido, avaliado pela `landing-evoluir-skill` a cada redesenho e registrado em `_evolucao.md`: (a) o arquivo passar do limite de palavras definido na primeira medição (valor inicial a calibrar com um teste de recuperação, não um número universal); (b) o teste de recuperação (carregar as regras certas para cada cliente fictício) começar a falhar; (c) uma categoria ter volume para arquivo próprio; (d) o agente carregar repetidamente muitas regras irrelevantes para a mesma tarefa. Até lá, nenhuma divisão.

### 3.6 Quatro tipos de informação, nunca misturados

| Onde | O que guarda |
|---|---|
| `_regras-vivas.md` | Regras gerais com critério verificável |
| `<cliente>/` (`01`, `03`, `direcao-visual`) | Decisões, requisitos e aprovações daquele cliente |
| `<cliente>/02-registro-de-feedback…` | Observações brutas e lições ainda não processadas |
| `_evolucao.md` | Histórico das mudanças nas skills |

Uma preferência de um cliente não vira regra global só por estar registrada (vale a matriz de promoção da seção 3.11). Uma regra global não é sobrescrita por decisão local, a não ser que o `03` do cliente traga um `override:` citando o id da regra e a aprovação do Felipe, o que também altera deliberadamente o escopo.

### 3.9 Estado, autorização e integridade (separados)

**Máquina de estados única.** O fluxo vive em `assets/kit/fluxo.json`, lido por `check-gate.js`: fases, transições permitidas, arquivos exigidos por fase, eventos que invalidam uma aprovação (mudança de hash, `--reabrir`) e ações irreversíveis (publicação). As skills não redefinem o fluxo; apontam para esse arquivo.

**Três conceitos, três mecanismos:**
| Conceito | Mecanismo |
|---|---|
| Aprovação do **conteúdo** (o Felipe aceita o que está descrito) | `approve.js`, com `citacao` literal |
| Autorização da **ação** (o Felipe permite uma operação específica) | Token de uso único (abaixo) |
| **Integridade** do artefato (não mudou depois) | Hash do arquivo inteiro, verificado por `check-gate.js` |

**Autorização de ação, para as de alto risco (publicação, stack/rede):** o Felipe roda `! node authorize.js --fase <nome> --acao <acao> --destino <destino> --cliente <nome>`. O script lê o hash atual do artefato e grava um token em `<cliente>/.autorizacao` com fase, ação, destino exato, hash, validade (15 minutos) e uso único. O `publicar.sh` (e o fluxo de stack) **reverifica tudo imediatamente antes de escrever**: token existe, não expirou, destino e hash batem; depois consome o token. Fronteira de confiança declarada: o agente roda como o mesmo usuário e, tecnicamente, poderia forjar o arquivo; o ganho é que o caminho normal exige um ato do Felipe, amarrado ao hash e ao destino, e qualquer desvio aparece na auditoria. Não há criptografia nem armazenamento fora do alcance do agente, e o spec não afirma que há.

**Escrita segura de estado:** uma biblioteca compartilhada `assets/kit/lib/` oferece escrita em arquivo temporário com renomeação atômica, conferência do hash anterior antes de aceitar uma atualização (otimista; se mudou, recusa), trava de diretório e ids de operação para retomada idempotente. Todo script que altera artefato de fase, inventário ou registro usa essa biblioteca.

**Auditoria:** `<cliente>/auditoria.log`, somente anexar, com aprovação, reabertura, resolução de pendência, autorização e publicação (data, fase, hash, via, id da operação). Estado inconsistente (arquivo novo sem entrada de auditoria, ou o inverso) é reportado por `check-gate` e resolvido com o Felipe, não corrigido em silêncio.

**Versão de esquema:** todo frontmatter traz `schema_version`; o validador rejeita versão desconhecida e uma mudança futura de formato vem com migração explícita.

### 3.10 Implementação por níveis de maturidade

Mesmo com as sete skills decididas, a **construção** é em níveis, com uma verificação entre eles; nada é removido, só ordenado:

| Nível | Conteúdo |
|---|---|
| 1. Núcleo | Orquestrador, descoberta, direção visual, publicar, software-extra; artefatos persistentes; `check-refs`, `check-contrast`, `check-content`, `check-assets`, `check-cache`, `publicar.sh` (dry-run) |
| 2. Controle de risco | `fluxo.json`, `check-gate`, `approve`, `authorize`, `resolve-pendencia`, `lib/` atômica, auditoria, proteção de caminhos, publicação reversível, `check-page` |
| 3. Aprendizado | `landing-registrar-feedback`, `record-feedback`, `landing-evoluir-skill`, migração, `_regras-vivas.md`, métricas |

Ao fim do nível 2, roda-se **um cliente fictício** pelo fluxo e registra-se o custo real (tempo, intervenções não previstas, aprovações reabertas, falsos positivos dos validadores) em `_evolucao.md`, e só então se decide se o nível 3 mantém o desenho atual ou se algum controle é simplificado. O mesmo briefing também roda com um fluxo reduzido (sem gates por hash) para comparar defeitos achados e esforço; se a diferença não paga o custo, o spec é revisto.

### 3.11 Regras: promoção, ciclo de vida e conflitos

**Promoção por evidência, não por contagem.** A frequência é sinal de prioridade, não o critério. Matriz:

| Situação | Destino |
|---|---|
| Repetida e generalizável | Candidata a regra geral |
| Repetida, mas dependente do ambiente | Regra condicionada a tags (`aplica_quando`) |
| Rara, mas de alto impacto (ex.: segredo exposto) | Regra de segurança, mesmo com uma ocorrência |
| Subjetiva e sem confirmação | Permanece hipótese |
| Sem benefício demonstrado ou já coberta por script | Não promover |

Cada regra traz `status` (`hipotese` | `candidata` | `ativa` | `aposentada`), justificativa, `nao_se_aplica_quando` e critério de remoção. Preferência estética de cliente não vira regra global.

**Precedência:** (1) segurança e integridade; (2) decisão aprovada do cliente, dentro desses limites; (3) regras globais conforme suas condições; (4) exceção local só com `override:` que cita a regra, o motivo e a aprovação. Regras podem declarar `conflita_com: [R-nnn]`, e `landing-evoluir-skill` roda um teste que carrega o conjunto de regras de cada cliente fictício e reprova combinações incompatíveis ou obrigatórias sem classificação.

## 4. Ciclo de feedback

**Durante o projeto** (`landing-registrar-feedback`):
- Pasta `criar-site/<cliente>/` com `01-negocio-e-escopo.md`, `02-registro-de-feedback-por-etapa.md`, `03-decisoes.md`, `04-erros-e-dificuldades.md`, `scripts/`, `fontes/`.
- Entrada de feedback:

```
### E<nn>. <entregável>
- Contexto/critério:
- Entregue:
- Reação: (citada; origem: mensagem, screenshot, teste)
- Acerto/erro:
- Lição / regra / checagem criada:
- Tipo: explícito | hipótese   (explícito = o Felipe ou o cliente disse; hipótese = inferência do agente, nunca em aspas)
- Evidência: preferência | defeito | requisito | resultado-medido
- Impacto: baixo | médio | alto
- Escopo: toda landing | B2C | B2B | saúde/bem-estar | só este cliente
- Já tinha acontecido: <cliente>/E<nn>
- processado: não
```

- A reação entra quando chega, com a frase citada.
- **Momento do registro:** a obrigatoriedade é absoluta, mas o registro é a **última ação da resposta** em que o feedback ocorreu, não uma interrupção no meio do trabalho. Primeiro resolve o problema técnico (refatoração, CSS, correção), e **antes de devolver o turno** anexa a entrada ao `02-registro-de-feedback-por-etapa.md`. Nenhuma resposta que contenha uma reação do Felipe ou uma entrega termina sem a entrada gravada.
- **Registro imediato e visível, nunca "mental":** o modelo não tem buffer oculto entre trechos da resposta. Assim que a reação aparece, a **primeira** coisa da resposta é um bloco delimitado e curto, com a frase citada, o entregável e o escopo:

```
<draft-feedback>
entregavel: <nome>
reacao: "<frase citada>"
escopo: <valor>
</draft-feedback>
```

  O bloco `<draft-feedback>` é só o **mecanismo de recuperação**; a persistência é comprovada por uma operação real. Protocolo:

1. **Triagem:** a mensagem contém uma reação a algo entregue? Pergunta, pedido de alteração e preferência pontual sem reação **não** são feedback; entram só se vierem com reação ("ficou estranho", "amei", "tá errado").
2. **Explícito × hipótese:** só o que o Felipe ou o cliente disse vai em `reacao`, entre aspas. O que o agente infere ("provavelmente não gostou da tipografia") vai como `Tipo: hipótese`, sem aspas, e **não conta** como evidência para promover regra (3.11) até ser confirmado.
3. **Gravação idempotente:** `record-feedback.js` calcula um id a partir de (cliente, entregável, reação); repetir a chamada não duplica. Reserva o `E<nn>` com trava de diretório (`mkdir` atômico) para que duas execuções nunca gerem o mesmo número.
4. **Leitura de volta:** depois de gravar, a skill lê o `02` e confere que a entrada existe com os campos obrigatórios. O script imprime o id e sai 0 só se essa releitura passar.
5. **Confirmação antes de encerrar o turno** (`E<nn> gravada`) ou, se a gravação falhou, **informar a falha** e manter o `<draft-feedback>` visível como conteúdo recuperável.
6. **Próxima sessão:** um `<draft-feedback>` sem entrada correspondente é gravado ou reconstruído da transcrição, ou o Felipe é perguntado, antes de seguir.
- Entrada mínima aceita no momento (campos obrigatórios: entregável, reação citada, escopo, `processado: não`); os demais campos podem ser completados na mesma resposta ou na primeira ação da próxima, nunca depois da próxima entrega.

**Depois** (`landing-evoluir-skill`, só a pedido):
1. Listar entradas `processado: não` em todos os clientes.
2. Traçar paralelos entre clientes e classificar cada lição pela matriz da seção 3.11 (repetição é prioridade, não critério); evidência do tipo `defeito` ou `resultado-medido` pesa mais que `preferência`.
3. Para cada regra candidata: cenário de pressão com subagente sem a skill (RED), edição (GREEN), fechar brechas (REFACTOR).
4. **Poda obrigatória:** a cada redesenho, procurar regras que ficaram redundantes, duplicadas entre skills ou cobertas por um script, e **removê-las ou fundi-las**; nenhum redesenho só acrescenta. Conferir `wc -w` de cada `SKILL.md` antes e depois.
5. Marcar as entradas `processado: <versão>` e registrar a mudança em `criar-site/_evolucao.md`, junto das métricas contáveis a partir dos arquivos: aprovações reabertas, erros por categoria, regressões desde o redesenho anterior, falsos positivos de validador relatados pelo Felipe e vezes em que ele precisou lembrar de um registro de feedback.

Limitação: uma skill não força a própria execução. "SEMPRE" é garantido por descrição e Iron Law. Um hook `UserPromptSubmit` de lembrete fica fora do escopo **por enquanto**: a métrica "vezes em que o Felipe precisou lembrar o registro" (seção 4, passo 5) decide. Se ela recorrer entre redesenhos, o hook, com uma fila de feedback pendente, passa a ser requisito.

## 5. Arquivos

```
~/.claude/skills/
  criar-landing-page/   SKILL.md, assets/kit/ (README.md, check-refs, check-contrast, check-content,
                        check-cache, check-assets, check-gate, approve, resolve-pendencia,
                        record-feedback, publicar),
                        assets/modelos/ (01, 02, 03, 04)
  landing-descoberta/   SKILL.md, references/questionario.md
  landing-direcao-visual/ SKILL.md, references/perfis-e-estilos.md
  landing-software-extra/ SKILL.md, references/agendamento.md
  landing-publicar/     SKILL.md, references/cloudflare-cache.md
  landing-registrar-feedback/ SKILL.md
  landing-evoluir-skill/ SKILL.md

~/projetos/criar-site/
  <cliente>/ ...        (dados vivos)
  _regras-vivas.md      (id, texto, escopo, evidência, checagem automática, skill que aplica)
  _evolucao.md          (histórico de redesenhos)
```

As skills não guardam dado de cliente; apontam para `criar-site/`. O kit de scripts é derivado dos três `scripts/` existentes, com constantes de negócio (WhatsApp, endereço, vocabulário proibido) parametrizadas por cliente. Scripts são invocados por interpretador (`bash`, `node`) na prosa, nunca por caminho solto.

**Contrato do kit:** `assets/kit/README.md` traz, para cada script, o comando exato, os parâmetros tipados, os códigos de saída e um exemplo. Cada script responde a `--help` e falha com mensagem clara se faltar parâmetro obrigatório. Os `SKILL.md` apontam para esse README em vez de repetir flags.

| Script | Comando | Parâmetros |
|---|---|---|
| check-refs | `node check-refs.js --root <dir> [--html <arquivo>...]` | `--root` caminho (obrigatório); `--html` lista de arquivos, padrão `index.html` |
| check-contrast | `node check-contrast.js --css <arquivo> --pairs <arquivo.json> [--min <número>]` | `--min` padrão 4.5 |
| check-content | `node check-content.js --root <dir> --rules <arquivo.json>` | regras do cliente: WhatsApp, endereço antigo proibido, vocabulário proibido, `PENDENTE` |
| check-cache | `node check-cache.js --url <https://...> [--paths <lista>]` | confere cabeçalhos de cache e HTML servido |
| check-assets | `node check-assets.js --root <cliente> [--fase <descoberta\|direcao-visual\|publicacao>] [--site <dir>]` | valida o `inventario-assets.md` (ver 3.7); `--fase publicacao` exige `aprovado`, direitos confirmados e alt resolvido; `--site` reprova imagem do HTML construído que não esteja no inventário como `aprovado` |
| check-page | `node check-page.js --url <url\|arquivo> [--larguras 375,1280]` | Playwright: erros de console, requisições falhas, overflow horizontal, foco visível na navegação por Tab, nomes acessíveis básicos; sai com código distinto por categoria |
| authorize | `node authorize.js --cliente <nome> --fase <nome> --acao <acao> --destino <destino>` | **rodado pelo Felipe** (`!`); grava token de uso único amarrado ao hash e ao destino, com validade de 15 minutos (3.9) |
| publicar | `bash publicar.sh --root <dir> --dest <destino> --cliente <nome> [--dry-run]` | `--dry-run` é o padrão. Execução real só com o token de `authorize.js` válido, `check-gate` da fase `publicacao` e hash atual, sem `PENDENTE` exibido como fato, e confirmação explícita. Faz cópia do destino antes e imprime o comando de reversão |
| check-gate | `node check-gate.js --file <arquivo.md> --fase <nome>` | sai 0 só se o YAML for válido, a `fase` bater, `aprovado: true` e o hash for o do conteúdo atual; sai com código distinto para `ausente`, `inválido`, `não aprovado`, `desatualizado` |
| approve | `node approve.js --file <arquivo.md> --fase <nome> --via <comando\|conversa> [--citacao <texto>] [--reabrir]` | calcula o hash do arquivo inteiro e grava `aprovado: true`; `--via conversa` exige `--citacao`; para as fases de alto risco recusa `--via conversa`; `--reabrir` grava `aprovado: false` |
| resolve-pendencia | `node resolve-pendencia.js --file <arquivo.md> --id <P-nnn> --valor <texto> [--fonte <texto>]` | só resolve pendência aberta cujo `campo` permite (3.2); `--fonte` obrigatória para campos confirmados; falha se o diff for mais do que a troca do marcador e do status; registra em `resolucoes` e recalcula o hash mantendo a aprovação |
| record-feedback | `node record-feedback.js --cliente <nome> --entregavel <texto> --reacao <texto> --escopo <valor> --tipo <explicito\|hipotese> [--contexto <texto>] [--licao <texto>]` | idempotente, com trava de diretório; anexa a próxima `E<nn>` com `processado: não`, relê, imprime o id e sai 0 só se a releitura passar |

Os nomes e flags acima são o contrato alvo; os scripts herdados dos três clientes são adaptados a ele e testados antes de entrarem no kit, cada um com teste próprio.

**Regras do kit:**
- **Falhar de forma segura:** script ausente, erro inesperado, timeout ou impossibilidade de verificar o estado do deploy **nunca** contam como aprovação. O `SKILL.md` diz: "saída diferente de 0, ou nenhuma saída, é reprovação".
- **Verificação parcial não é garantia:** o `kit/README.md` traz, por script, uma linha "o que isto **não** prova" (contraste ≠ página acessível; cache ≠ todos os recursos atualizados; links ≠ conteúdo correto).
- **Estado compartilhado protegido:** os scripts resolvem `--cliente` por `realpath` e recusam qualquer caminho fora de `criar-site/<cliente>/`; não sobrescrevem arquivo existente sem `--force`; `check-content` também procura padrões de segredo (chaves, tokens, senhas) na pasta do cliente e reprova se achar.
- **Publicação:** validação antes do deploy (`--dry-run`), confirmação explícita, cópia do destino antes de escrever, comando de reversão impresso, e um procedimento para **falha parcial** (o que olhar, como voltar ao estado anterior) no `references/` de `landing-publicar`. Depois do deploy: `check-cache` na URL publicada e um caminho real do vizinho, quando houver recurso compartilhado.

## 6. Migração inicial

O primeiro uso de `landing-evoluir-skill` processa as entradas dos três clientes (todas `processado: não`), usando também os `05-aprendizados.md` e os `scripts/` como insumo. Gera `_regras-vivas.md` v1 com paralelos traçados (ex.: cache do Cloudflare aparece nos três, então é regra geral; área de atuação sem loja aparece só na Cliente B, então fica com escopo B2B sem loja).

## 7. Testes

Quatro famílias de teste, não só obediência:

| Família | O que comprova |
|---|---|
| Disparo | A skill certa é acionada pela frase certa, e as erradas não (conjuntos positivo e negativo por skill) |
| Processo | Gates, aprovações, registro de feedback e paradas funcionam sob pressão |
| Artefato | O site gerado funciona: `check-refs`, `check-contrast`, `check-content`, `check-cache`, larguras 375 e 1280, estados |
| Regressão | Cada erro registrado nos três clientes tem uma checagem que o barra em projeto novo |

**Clientes fictícios como fixtures** (briefings fixos, baratos de manter): salão de beleza, espaço de eventos, serviço profissional e negócio com agenda integrada. A geração completa de cada um roda **só no redesenho da skill**, para comparar antes e depois, e não a cada edição pequena; o dia a dia usa os testes de disparo, processo e os scripts do kit.

- RED por Iron Law, com subagente sem a skill, registrando as racionalizações reais. Cenários: cliente com pressa pula o questionário; "só um botão" sem `frontend-design`; "já aprovou antes" publica; reação pequena registrada depois; stack escolhida sem perguntar.
- GREEN: mesmos cenários com a skill; REFACTOR: fechar brechas e repetir.
- Ponta a ponta com cliente fictício, até o gate da direção visual: deve produzir questionário e 2 a 3 estilos e parar.
- Descrições: conferir que nenhuma resume o fluxo; `wc -w` nos `SKILL.md` (alvo < 500 palavras, orquestrador e `registrar-feedback` o mais curtos possível).
- **Não testado de verdade:** publicação em produção e o MCP do Cloudflare. Verificação seca da lista de passos; o relatório final diz isso.

## 7.1 Critérios de conclusão da implementação

A implementação só é declarada pronta quando, com evidência na mesma mensagem:
1. Os sete `SKILL.md` e o kit existem; `wc -w` dentro das metas; nenhuma `description` resume fluxo.
2. Cada Iron Law tem um cenário RED registrado (com as racionalizações reais) e passa em GREEN.
3. Os testes de disparo (positivos e negativos) passam para as sete skills.
4. `check-assets` reprova: caminho inventado, caminho fora de `<cliente>/`, id duplicado, id citado na direção visual e inexistente, e publicação com asset sem direitos confirmados. Os scripts do kit têm teste próprio, incluindo os casos de falha segura (ausente, inválido, não aprovado, desatualizado, caminho fora de `criar-site/`, id duplicado, execução concorrente) e os casos da resolução de pendência: troca legítima mantém a aprovação; edição manual do mesmo trecho invalida; pendência `material` recusada; alteração extra escondida na seção de pendências (o exemplo do público-alvo) invalida.
5. `_regras-vivas.md` v1 e `_evolucao.md` foram gerados pela migração, e todas as entradas dos três clientes estão `processado: v1`.
6. O ponta a ponta de um cliente fictício para no gate da direção visual com questionário e 2 a 3 estilos.
7. O relatório final lista o que **não** foi testado (publicação real, MCP do Cloudflare).
8. **Cada script** do kit tem no README: a propriedade que afirma verificar, casos válidos, inválidos e limítrofes, limitações conhecidas e a evidência da última execução dos testes; e um teste de integração contra os `site-base` reais dos três clientes (já existem em `scripts/site-base/`).
9. `publicar.sh` é testado contra um **destino local temporário**, incluindo falhas simuladas: interrupção no meio da cópia, destino incorreto, permissão insuficiente, arquivo parcial, token expirado ou já consumido, hash divergente e falha da verificação posterior.
10. Testes de concorrência e de escrita atômica para `approve`, `resolve-pendencia`, inventário e `record-feedback` (duas operações simultâneas; interrupção entre a escrita do arquivo e a da auditoria).
11. Um cliente fictício passou pelos níveis 1 e 2 e o custo operacional foi registrado (3.10).

## 8. Fora do escopo

Hook de lembrete, plugin instalável, outros tipos de site além de landing de negócio local com extras, automação de deploy sem aval.

## 9. Riscos

- Skills estritas demais travam trabalho trivial. Mitigação: exceções nomeadas (ex.: ajuste de texto de uma linha não exige direção visual nova), perguntando ao Felipe.
- Dependência de leitura de `criar-site/`: se a pasta mudar de lugar, as skills quebram. Mitigação: o caminho fica em um único ponto (`criar-landing-page/SKILL.md`) e as outras o herdam.
- Regras de um cliente generalizadas cedo demais. Mitigação: a matriz de promoção por evidência, aplicabilidade e risco (3.11), com status `hipotese` até confirmação.
- Excesso de burocracia: o custo de operar o processo competir com o de entregar a landing. Mitigação: rigor proporcional ao risco (3.3), construção por níveis (3.10) e medição do custo real depois do nível 2.
- Os scripts do kit só valem se forem testados. Mitigação: matriz de casos por script e testes de integração contra os `site-base` dos três clientes (7.1).
