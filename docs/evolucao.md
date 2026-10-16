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
