# Cloudflare e cache: regras de partida

Configure no **dia 1** da zona:
1. Browser Cache TTL em **"respeitar os cabeçalhos do servidor"**.
2. **Desligar** a ofuscação de e-mail se houver `mailto:`.
3. `img/` e `fonts/`: `Cache-Control: public, max-age=31536000, immutable`, **e nome novo ao trocar o arquivo**. `css/` e `js/`: `no-cache`, ou CSS inline e `?v=<hash do conteúdo>`.
4. Limpar o cache **a cada publicação**, por URL dos arquivos que mudaram; conferir o HTML **servido** (`curl`), não só o arquivo.
5. Verificar com um navegador **novo** (o perfil de teste também guarda cópia velha) e, no fim, no do Felipe.

## Domínio e e-mail
Perguntar o **titular** (CPF ou CNPJ) antes de registrar. Zona e registros no Cloudflare; e-mail só de recebimento não exige SMTP; envio transacional é decisão de `landing-software-extra`.

## Lighthouse
O padrão não conecta ao Chrome do WSL2: subir um Chrome headless com `--remote-debugging-port=9444` e rodar `npx lighthouse@12 --port=9444 --form-factor=mobile`. Medir **na URL publicada**; o servidor local não comprime nem cacheia. Relatar o que não foi medido.

## Se a publicação falhar no meio
`publicar.sh` reverte sozinho quando a falha é na troca. Se o destino for remoto ou o erro for depois: usar o comando de reversão impresso, conferir o site antigo no ar, e só recomeçar com um **novo** `authorize.js`. Nunca "consertar na mão" sem registrar no `02`.
