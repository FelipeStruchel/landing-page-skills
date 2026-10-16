# Kit de checagem das landing pages

Todos os scripts: `node <script> --help` mostra o uso. Saída `0` = ok; qualquer outra saída, ou nenhuma saída, é **reprovação**.
Códigos: 1 reprovado, 2 uso, 3 ausente, 4 inválido, 5 não aprovado, 6 desatualizado, 7 proibido.
Dados vivos: `~/projetos/criar-site/` (ou `CRIAR_SITE_ROOT`). Instalar uma vez: `cd <este diretório> && npm install`.

| Script | Comando | O que verifica | O que **não** prova |
|---|---|---|---|
| check-gate | `node check-gate.js --file <arq.md> --fase <nome>` / `--cliente <nome> --antes-de <fase>` | YAML válido, `schema_version`, fase, `aprovado` booleano, hash atual, auditoria, via `comando` nas fases de alto risco | Que a decisão aprovada esteja certa, nem quem digitou o aceite |
| approve | `node approve.js --file <arq.md> --fase <nome> --via <comando\|conversa> [--citacao "<texto>"] [--reabrir]` | Grava aprovação com hash, citação e auditoria | Que o Felipe aprovou de fato (o agente roda como o mesmo usuário) |
| resolve-pendencia | `node resolve-pendencia.js --file <arq.md> --id P-001 --valor "<texto>" [--fonte "<texto>"]` | Só troca o marcador; recusa campo material; invalida edição manual | O significado do valor: o agente avalia o impacto |
| authorize | `! node authorize.js --cliente <nome> --fase publicacao --acao publicar --destino <destino>` | Token de uso único, 15 min, amarrado a hash e destino | Segurança contra um agente malicioso com acesso ao disco |
| publicar | `bash publicar.sh --root <site> --dest <destino> --cliente <nome> [--executar]` | Sem `PENDENTE`, gates, assets, token; cópia, backup, troca atômica e reversão | Remoto: só imprime passos; MCP do Cloudflare: não testado |
| check-refs | `node check-refs.js --root <site> [--html index.html]` | Todo arquivo citado existe | Que o link leve ao destino certo |
| check-contrast | `node check-contrast.js --css <arq.css> --pairs <pares.json> [--min 4.5]` | Razão de contraste dos pares declarados e se as cores existem no CSS | Que a página inteira seja acessível |
| check-content | `node check-content.js --root <site> --rules <regras.json> [--segredos <dir>]` | Proibidos, obrigatórios, `PENDENTE`, `alt`, JSON-LD, description; padrões de segredo | Ausência de dado sensível fora dos padrões |
| check-assets | `node check-assets.js --root <cliente> [--fase …] [--site <dir>] [--gravar-hash]` | Inventário, caminhos, hash, direitos, imagens do site no inventário | Que o arquivo seja a imagem certa: abrir e olhar |
| check-cache | `node check-cache.js --url <https://…> [--paths /,/x]` | Status, cache-control, versionamento, ofuscação de e-mail | Que todos os visitantes recebam a versão nova |
| check-page | `node check-page.js --url <url\|arq.html> [--larguras 375,1280]` | Console, requisições, overflow, foco, nomes acessíveis | Qualidade visual e de negócio |
| record-feedback | `node record-feedback.js --cliente <nome> --entregavel "<…>" --escopo <…> --tipo <explicito\|hipotese> --reacao "<citação>"` | Grava `E<nn>` idempotente, com trava e releitura | Que a reação foi bem interpretada |
| processar-feedback | `node processar-feedback.js listar [--contar]` / `marcar --versao v1 [--cliente <nome> --ids E01,E02]` | Entradas sem `processado: v<N>` (inclui formato antigo) | Que a lição foi bem generalizada |
| check-regras | `node check-regras.js --file <_regras-vivas.md> [--tags …] [--listar]` | Campos, vocabulário, evidência real, conflitos | Que a regra seja boa |

Desvio do spec: `publicar` executa só com `--executar` (o padrão é dry-run).
Última execução dos testes (2026-10-15, Tasks 1-10): ℹ tests 78 ℹ pass 78 ℹ fail 0 ℹ skipped 0 
