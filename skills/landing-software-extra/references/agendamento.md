# Agenda e reserva: o que decidir e as armadilhas

## Perguntas de produto (antes de desenhar)
Reserva no site ou só WhatsApp? Quem confirma e como? Tempo entre sessões? Antecedência mínima? Limite por pessoa? Como a dona quer ser avisada (celular, e-mail, WhatsApp)? Quem mais acessa a tela? Política de cancelamento e falta? O que dizer ao cliente depois de reservar?

## Dados e privacidade
Depoimentos só com primeiro nome; aviso de privacidade onde se coleta dado; retenção definida; nada de dado pessoal do desenvolvedor em cabeçalhos ou remetentes.

## E-mail transacional
Pesquisar e **testar** o caminho que o Felipe lembra antes de dizer "não dá" (OAuth2 via nodemailer funcionou onde o SMTP básico do Outlook não). Marcar o remetente como "não é spam" no primeiro envio.

## Armadilhas
- O servidor local do site não mostra a aba de reserva sem a API; suba a API contra o banco de teste.
- Depois de publicar, limpe o cache do Cloudflare por URL do site e da agenda.
- Migração com dados: conferir as linhas no banco depois de rodar.
- O formulário do WhatsApp só conhece o serviço, não a opção; use a opção mais longa para o último horário.
- Tempo reservado interno não é público (teste cobrindo).
- Rótulo público lido por quem não é da área precisa soar natural.
