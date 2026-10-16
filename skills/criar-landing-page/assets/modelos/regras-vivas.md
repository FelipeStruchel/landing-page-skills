---
schema_version: 1
versao: v0
vocabulario_tags:
  - tipo:b2c
  - tipo:b2b
  - nicho:saude
  - nicho:beleza
  - nicho:eventos
  - nicho:servico-profissional
  - tem:agenda
  - tem:software-extra
  - tem:cloudflare
  - tem:formulario-whatsapp
  - tem:fotos-de-terceiros
  - tem:raspagem-logada
  - tem:docker-compartilhado
  - tem:dominio-novo
  - tem:email-transacional
  - tem:depoimentos
  - tem:area-sem-loja
  - fase:descoberta
  - fase:direcao-visual
  - fase:plano
  - fase:execucao
  - fase:revisao
  - fase:publicacao
---
# Regras vivas

Cada regra: título `### R-nnn <título>` e um bloco `yaml` com `id, categoria, escopo, aplica_quando, severidade, status, evidencia, checagem, skill, nao_se_aplica_quando` (+ `conflita_com`, `criterio_remocao`), seguido do texto. Validar com `node check-regras.js --file <este arquivo>`.
