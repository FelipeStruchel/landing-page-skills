# Evolução das skills de landing page

## Medição do nível 2 (cliente fictício: Salão Aurora), 2026-10-16

Fluxo completo, duas rodadas de agente novo (a segunda só com o estado do disco):

| Medida | Rodada 1 (descoberta) | Rodada 2 (inventário, aprovação, direção visual) | Total |
|---|---|---|---|
| Duração do agente | 42,4 s | 79,8 s | 122,2 s |
| Chamadas de ferramenta | 12 | 19 | 31 |
| Tokens do subagente | 51,9 mil | 70,0 mil | 121,9 mil |

- Parou exatamente nos gates certos: rodada 1 em "sim do Felipe ao 01"; rodada 2 em "escolha A, B ou C". 0 arquivos HTML; `check-gate --antes-de plano` reprova (código 5); auditoria com 2 linhas (approve e resolve), ambas com hash.
- **Intervenções não previstas minhas: 3**, todas defeitos de kit/modelo/fixture, nenhuma do Felipe:
  1. Modelo `01` citava `{{PENDENTE:P-001}}` literal e duplicava o marcador (pego pelo teste e2e automatizado, antes dos agentes).
  2. Faltava `campo` de pendência para mídia e depoimentos (o agente usou `escopo`, material, e a pendência das fotos ficaria irresolúvel por script). Corrigido com teste (88/88) e no questionário.
  3. As fotos fictícias eram placeholders de 1x1 px (defeito do fixture, não do sistema; o agente percebeu abrindo os arquivos e registrou no inventário e na direção).
- Aprovações reabertas: 0. Falsos positivos de validador: 0 (o aviso "foto em `fontes/` sem linha no inventário" estava correto).
- Passos pulados: **o agente não gravou feedback de entrega** (`record-feedback`) em nenhuma rodada, apesar de o orquestrador citar `landing-registrar-feedback` como sub-skill obrigatória; os prompts não apontavam essa skill. Verificar nos testes S05 e de disparo (Tasks 19 e 21).
- Achados bons: o agente abriu as imagens (pegou o placeholder), resolveu P-003 depois da aprovação sem invalidá-la, rodou `check-contrast` com 12 pares (menor 5,75:1) e recomendou B justificando pelos dois perfis.

Fluxo reduzido (mesmo briefing, **sem** check-gate, approve, resolve-pendencia, hash ou auditoria; o prompt mandava ignorar as fotos, então o trabalho não é 100% comparável):

| Medida | Reduzido |
|---|---|
| Duração | 72,0 s |
| Chamadas | 13 |
| Tokens | 60,7 mil |

- Defeitos achados pelos scripts no reduzido: 1 (direção citando ids de ativo inexistentes; pego pelo `check-assets`, que existe nos dois fluxos).
- O que o reduzido **não** tem: aprovação ligada a hash, trilha de auditoria, bloqueio de edição escondida, resolução de pendência verificável, inventário com hash.

**Leitura (3 linhas):** o fluxo completo custou cerca de 1,7x o tempo e 2,4x as chamadas do reduzido neste trecho, em valores absolutos pequenos (cerca de 50 s a mais). Esta única rodada não mostra um defeito evitado pelos gates (o benefício deles é para a edição e a publicação posteriores, que não rodaram aqui), então o custo é medido e o ganho só é argumentado. Recomendação: seguir para o nível 3 sem simplificar nada, e reavaliar com um segundo cliente que passe por reabertura e publicação.

## v1 (migração inicial), 2026-10-17

- **Antes:** 88 entradas `processado: não` (cliente-a 32, cliente-b 31, cliente-c 25). **Depois:** 0; todas `processado: v1`. A marcação só acrescentou a linha `- processado: v1` ao fim de cada entrada (88 linhas, 0 removidas; cópias de segurança feitas antes).
- **`_regras-vivas.md` v1:** 34 regras, todas validadas por `check-regras.js` (campos, vocabulário de tags, evidência `cliente/E<nn>` existente). Status: 26 `ativa`, 8 `candidata`, 0 `hipotese`, 0 `aposentada`. Tabela de candidatas e itens não promovidos em `_testes-skills/migracao/candidatas.md`.
- **Paralelos traçados:** cache do Cloudflare nos três clientes (R-010, com tag `tem:cloudflare`); verificação do servido e revisão independente em dois clientes; foto e direitos, e raspagem logada, em dois clientes; área de atuação sem loja só na Cliente B, condicionada a tag.
- **Preferência não virou regra global:** lições de uma ocorrência ficaram `candidata` (R-012, R-015, R-017, R-021, R-027, R-028, R-029, R-032).
- **Poda:** nada podado nesta primeira passada (não havia regras anteriores a podar).
- **Teste de seleção por tags** (`selecao.test.mjs`): o cliente com agenda carrega a regra de fonte da verdade e o B2B sem agenda não; toda regra geral obrigatória é carregada em qualquer conjunto de tags.
- **Métricas de base:** aprovações reabertas 0; regressões 0; falsos positivos de validador relatados 0; vezes em que o Felipe precisou lembrar o registro de feedback: 0 (o registro ainda não foi exercido em projeto real).
- **Descrições das skills:** teste de disparo 28 de 28 na primeira rodada; nenhuma `description` foi alterada.
