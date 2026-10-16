---
schema_version: 1
fase: descoberta
aprovado: false
tags: []              # tipo:b2c|tipo:b2b, nicho:..., tem:agenda, tem:software-extra, tem:cloudflare ...
regras_carregadas: [] # ids do Passo 0
pendencias: []        # {id: P-001, campo: endereco, status: pendente, bloqueia: publicacao}
resolucoes: []
---
# 01. Negócio e escopo: <Cliente>

## Negócio
O que vende, para quem, onde, desde quando.

## Perfil da empresa
Porte, tom, diferenciais, o que a empresa **não** faz.

## Perfil do cliente da empresa
Quem decide, onde chega (Google, Instagram, indicação), com que dispositivo, como decide (WhatsApp, orçamento), objeções comuns.

## Objetivo da página e critério de aceitação
Ação esperada do visitante: <…>. A entrega é aceitável quando: <…>.

## Serviços, preços e horários
Fonte única. Preço "a partir de" quando for o caso.

## Contato e endereço
Endereço **atual** (e antigos que ainda aparecem), WhatsApp comercial, redes.

## Mídias
Ver `inventario-assets.md`.

## Restrições legais e de marca
Conselho/nicho, LGPD, o que não pode ser dito.

## Pendências
Cada ponto aberto aparece no corpo como `{{PENDENTE:P-nnn}}` (nnn = número da pendência) e na lista `pendencias` do frontmatter.
