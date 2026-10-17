# Candidatas da migração v1

Passos 1 a 3 da `landing-evoluir-skill` (modo migração): lições dos três registros e dos `05-aprendizados.md`, classificadas pela matriz (seção 3.11).

| Lição | Clientes | Entradas | Escopo | Destino |
|---|---|---|---|---|
| Perguntar antes de decidir stack, rede ou recurso compartilhado | cliente-a | cliente-a/E17, cliente-a/E10, cliente-a/E18 | geral | ativa |
| Instrução de processo vale para todo entregável, interno ou externo | cliente-a | cliente-a/E30, cliente-a/E31 | geral | ativa |
| Kit de checagem no dia 1; cada fato corrigido vira regra de teste | cliente-a, cliente-b | cliente-a/E07, cliente-a/E08, cliente-b/E05 | geral | ativa |
| Mockup só para adição; landing nova se constrói direto | cliente-a | cliente-a/E31, cliente-a/E04 | geral | ativa |
| Questionário único; o que falta vira PENDENTE que bloqueia a publicação | cliente-a, cliente-b | cliente-a/E09, cliente-b/E02, cliente-a/E16 | geral | ativa |
| Prefixo do projeto em recurso compartilhado; testar um caminho real do vizinho | cliente-a | cliente-a/E27, cliente-a/E12 | [tem:docker-compartilhado] | ativa |
| Verificar o objeto publicado, não a intenção | cliente-a, cliente-b | cliente-b/E06, cliente-a/E23, cliente-b/E20 | geral | ativa |
| Segredo só em .env do servidor; recomendar trocar o que passou pelo chat | cliente-a | cliente-a/E26, cliente-a/E24 | [tem:software-extra] | ativa |
| Produção só com aval, backup antes, nginx -t e reversão escrita | cliente-a, cliente-b | cliente-a/E22, cliente-b/E14, cliente-b/E15, cliente-a/E10 | [fase:publicacao] | ativa |
| Cache do Cloudflare: configurar no dia 1 e verificar o servido | cliente-a, cliente-b, cliente-c | cliente-a/E23, cliente-b/E20, cliente-b/E18, cliente-c/E15 | [tem:cloudflare] | ativa |
| Lighthouse medido na URL publicada | cliente-b, cliente-c | cliente-c/E12, cliente-b/E27 | [fase:publicacao] | ativa |
| Uma fonte por função dentro do mesmo componente | cliente-a | cliente-a/E31 | geral | candidata |
| Título grande em fonte de alto contraste: tamanho óptico baixo e peso 700 | cliente-a, cliente-c | cliente-c/E16, cliente-a/E06 | [tipo:b2c] | ativa |
| Capturar a janela em 375 e 1280, depois de rolar devagar | cliente-b | cliente-b/E06, cliente-b/E08, cliente-b/E09 | [fase:revisao] | ativa |
| Elemento decorativo precisa de tamanho visível e fundo que o sustente | cliente-b | cliente-b/E08, cliente-b/E09 | geral | candidata |
| Texto para o cliente final: uma ideia por frase e prévia antes de aprovar | cliente-b | cliente-b/E24, cliente-b/E25, cliente-b/E09 | geral | ativa |
| Rótulo público compreensível; informação interna não vaza para a cliente | cliente-a | cliente-a/E31 | geral | candidata |
| Não inventar fatos; preço, horário e endereço pendentes ficam PENDENTE | cliente-a, cliente-b | cliente-a/E03, cliente-a/E09, cliente-b/E22 | geral | ativa |
| Depoimento copiado sem alterar, com fonte e só o primeiro nome | cliente-a, cliente-c | cliente-a/E03, cliente-c/E15 | [tem:depoimentos] | ativa |
| Foto: olhar o fundo, direitos, origem registrada e tamanho por uso | cliente-b, cliente-c | cliente-c/E06, cliente-c/E13, cliente-b/E27, cliente-b/E28 | [tem:fotos-de-terceiros] | ativa |
| B2C emocional: foto com gente feliz vende mais que peça sem pessoa | cliente-c | cliente-c/E05 | [tipo:b2c] | candidata |
| Raspagem logada: Chrome visível, o Felipe faz o login e o CAPTCHA, nunca contornar | cliente-a, cliente-c | cliente-c/E05, cliente-c/E13, cliente-a/E02 | [tem:raspagem-logada] | ativa |
| Negócio sem loja: perguntar o que a empresa faz em cada lugar | cliente-b | cliente-b/E02, cliente-b/E22 | [tem:area-sem-loja] | ativa |
| Formulário por wa.me: dizer ao dono o que se perde | cliente-b, cliente-c | cliente-c/E10, cliente-b/E25 | [tem:formulario-whatsapp] | ativa |
| Saúde e bem-estar: sem alegação de saúde ou promessa de cura | cliente-a | cliente-a/E08, cliente-a/E01 | [nicho:saude] | ativa |
| Horário, serviços e preços vêm de uma fonte da verdade (o banco) | cliente-a | cliente-a/E31 | [tem:agenda] | ativa |
| Modelo de dados sem ambiguidade: nome da opção e duração são campos diferentes | cliente-a | cliente-a/E31 | [tem:agenda] | candidata |
| Menos escolhas por tela: grupo grande primeiro, detalhe depois | cliente-a | cliente-a/E31 | [tem:agenda] | candidata |
| Não afirmar que não dá sem testar o caminho que o Felipe lembra | cliente-a | cliente-a/E26 | geral | candidata |
| Perguntar o titular (CPF ou CNPJ) antes de registrar o domínio | cliente-a | cliente-a/E11 | [tem:dominio-novo] | ativa |
| Ler o passado antes de mexer em servidor, app, domínio ou Google | cliente-a, cliente-b | cliente-b/E10, cliente-b/E12, cliente-a/E12 | geral | ativa |
| Plano que o próprio agente executa não é longo | cliente-a | cliente-a/E18 | geral | candidata |
| Revisão independente ao fim de uma entrega grande | cliente-a, cliente-b | cliente-a/E20, cliente-b/E07 | geral | ativa |
| Imagens: um tamanho por uso, conferir sizes e srcset por script | cliente-b, cliente-c | cliente-c/E09, cliente-b/E07, cliente-c/E06 | geral | ativa |

## Não promovidas

- Pivô 'B2B não faz sentido site; um sistema para buffet' (cliente-c/E21): decisão de negócio do cliente, não regra de construção de landing.
- Foto 'tratada' por IA (cliente-b/E28): coberta por R-020 (origem e direitos); o julgamento estético fica com o Felipe.
- Texto da descrição do Google e bios (cliente-b/E29): específico do cliente.
- Lição única de ritmo de trabalho (cliente-b/E14, escopo reduzido por crédito de sessão): circunstância, não regra.

## Paralelos entre clientes

- Cache (R-010): quatro entradas em três clientes (Cliente A E23, Cliente B E18 e E20, Cliente C E15) → regra com tag `tem:cloudflare`.
- Verificar o servido (R-007) e revisão independente (R-033): dois clientes cada.
- Foto e direitos (R-020): dois clientes; raspagem logada (R-022): dois clientes.
- Área de atuação sem loja (R-023): só um cliente, condicionada a tag; fonte da verdade da agenda (R-026): só um cliente, mas defeito apontado pelo Felipe → ativa.
- Preferência estética de um cliente não virou regra global; as de uma ocorrência ficaram `candidata`.
