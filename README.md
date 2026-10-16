# landing-page-skills

Sete skills do Claude Code para criar landing pages de negócios locais (descoberta, direção visual, software extra, publicação, registro de feedback e evolução das próprias skills), mais um kit de scripts Node que verifica o que pode ser verificado por código: gates com hash e auditoria, pendências, inventário de assets, cache, contraste, acessibilidade básica e publicação reversível.

> Licença de uso pessoal e não comercial (ver `LICENSE`). Não é uma licença open source.

## Aviso: nomes trocados

Os nomes dos três clientes reais que originaram estas skills foram **trocados por nomes genéricos** neste repositório: **Cliente A** (massoterapia e depoimentos, com agenda), **Cliente B** (toalhas sob medida, B2B sem loja) e **Cliente C** (festas, B2C emocional). Pastas e caminhos seguem o mesmo padrão (`cliente-a`, `cliente-b`, `cliente-c`). Os resultados dos testes (baselines, verdes e medições) foram mantidos integralmente; só os nomes mudaram. Por isso os testes de integração que procuram os `site-base` dos clientes reais são pulados fora da máquina do autor.

## Conteúdo

| Pasta | O que é |
|---|---|
| `skills/` | As sete skills (`criar-landing-page` orquestra as outras seis) e o kit em `skills/criar-landing-page/assets/kit/` |
| `docs/superpowers/specs/` | O design (spec) |
| `docs/superpowers/plans/` | O plano de implementação |
| `docs/evolucao.md` | Medições de custo do fluxo e histórico de redesenhos |
| `tests-skills/` | Cenários de pressão (RED/GREEN com subagentes), baselines, fixtures fictícios e testes de disparo |

## Instalar (Claude Code)

```bash
cp -r skills/* ~/.claude/skills/
cd ~/.claude/skills/criar-landing-page/assets/kit && npm install && npm test
```

Os dados de cada cliente ficam em `~/projetos/criar-site/<cliente>/` (ou em `CRIAR_SITE_ROOT`). Este repositório não inclui dados de clientes. Alguns testes de integração do kit procuram os `site-base` de projetos reais e são pulados quando eles não existem.

## Aviso

Material de uso pessoal do autor. O fluxo foi pensado para o Felipe: caminhos, nomes e decisões refletem os projetos dele.
