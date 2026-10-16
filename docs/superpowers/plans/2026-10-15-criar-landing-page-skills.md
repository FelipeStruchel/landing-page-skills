# Skills de criação de landing page: plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir sete skills pessoais (`criar-landing-page` e seis subordinadas) mais um kit de scripts verificáveis, que levam um cliente novo da descoberta à publicação e se retroalimentam por feedback registrado durante o trabalho.

**Architecture:** Skills estritas (Iron Law, Gate Function, Red Flags, tabela Racionalização → Realidade) orquestram o agente; tudo que é verificável vai para scripts Node sem dependência de rede (`assets/kit/`), com estado em arquivos (`criar-site/<cliente>/`) protegidos por hash, auditoria e token de autorização de uso único. A construção segue três níveis (núcleo, controle de risco, aprendizado) com verificação entre eles.

**Tech Stack:** Node 25 (ESM, `node:test`), pacote `yaml` (frontmatter), `playwright` (opcional, só `check-page`), Markdown, subagentes para os testes RED/GREEN das skills.

**Spec:** `/home/acerola/projetos/criar-site/docs/superpowers/specs/2026-10-15-criar-landing-page-skills-design.md` (executores leem os dois; a seção citada em cada tarefa é a fonte).

## Global Constraints

- Skills em `~/.claude/skills/<nome>/SKILL.md`; dados vivos em `~/projetos/criar-site/` (substituível por `CRIAR_SITE_ROOT`, usado pelos testes).
- Sete skills: `criar-landing-page`, `landing-descoberta`, `landing-direcao-visual`, `landing-software-extra`, `landing-publicar`, `landing-registrar-feedback`, `landing-evoluir-skill`.
- `description` começa com "Use when", traz gatilhos específicos e **nunca resume o fluxo**. `SKILL.md` < 500 palavras (orquestrador e `landing-registrar-feedback` o mais curtos possível). Referências entre skills por `**REQUIRED SUB-SKILL:** Use <nome>`, nunca por `@`.
- Scripts do kit: ESM `.js` em `assets/kit/` (`"type": "module"`), chamados por `node <script>` (e `bash publicar.sh`) na prosa, nunca por caminho solto. Todo script responde a `--help` e sai com código ≠ 0 se faltar parâmetro obrigatório.
- Códigos de saída do kit: `0` ok, `1` reprovado, `2` uso, `3` ausente, `4` inválido, `5` não aprovado, `6` desatualizado, `7` proibido. Saída ≠ 0, ou nenhuma saída, é reprovação.
- Frontmatter de artefato de fase: `schema_version: 1`, `fase` ∈ {`descoberta`, `direcao-visual`, `plano`, `software-extra`, `publicacao`}, `aprovado` booleano, `data` ISO, `artefato_sha256`, `aprovacao.via` ∈ {`comando`, `conversa`}.
- Fases de alto risco (`software-extra`, `publicacao`): aprovação só `via: comando`; publicação só com token de `authorize.js` (uso único, 15 min, amarrado a hash e destino).
- Nenhum segredo em arquivo do repositório ou da skill. Produção só com aval explícito do Felipe.
- `~/projetos/criar-site` **não é repositório git**: onde o padrão pede "commit", o checkpoint é `npm test` verde (kit) ou o teste da skill passando. Não rodar `git init` sem pedido.
- O texto das skills é em português do Brasil, imperativo e direto.

## Review Focus

1. **Nome de cliente ou caminho com `..`, link simbólico ou fora da raiz de dados** em qualquer script: deve recusar com erro claro, nunca escrever fora de `criar-site/<cliente>/` (Task 1 e Task 8).
2. **Duas execuções simultâneas** de `record-feedback`, `approve` ou `resolve-pendencia`: sem ids duplicados nem arquivo corrompido (Task 2, Task 3, Task 8).
3. **Artefato com CRLF, sem frontmatter, YAML quebrado, `aprovado: "true"` entre aspas ou `schema_version` desconhecida**: erro claro, nunca "aprovado" (Task 2).
4. **Script que quebra com exceção inesperada, ou alvo que é diretório em vez de arquivo**: sai ≠ 0 (reprovação), nunca 0 (Task 1, Task 2).
5. **Inventário de assets com tabela malformada, caminho com acento ou espaço, hash que mudou depois da aprovação, ou imagem do site que não está no inventário** (Task 6).

---

## Mapa de arquivos

```
~/.claude/skills/criar-landing-page/
  SKILL.md                              # Task 13
  assets/kit/                           # Tasks 1-10
    package.json  fluxo.json  README.md
    lib/args.js  lib/fm.js  lib/hash.js  lib/fsx.js  lib/gate.js  lib/campos.js  lib/token.js
    check-gate.js  approve.js  resolve-pendencia.js  authorize.js  publicar.js  publicar.sh
    check-refs.js  check-contrast.js  check-content.js  check-assets.js  check-cache.js
    check-page.js  record-feedback.js  check-regras.js  processar-feedback.js
    test/helpers.js  test/*.test.js
  assets/modelos/                       # Task 12
    01-negocio-e-escopo.md  02-registro-de-feedback.md  03-decisoes.md  04-erros.md
    direcao-visual.md  inventario-assets.md  publicacao.md  plano.md  regras-vivas.md
~/.claude/skills/landing-descoberta/SKILL.md + references/questionario.md          # Task 14
~/.claude/skills/landing-direcao-visual/SKILL.md + references/perfis-e-estilos.md  # Task 15
~/.claude/skills/landing-software-extra/SKILL.md + references/agendamento.md       # Task 16
~/.claude/skills/landing-publicar/SKILL.md + references/cloudflare-cache.md        # Task 17
~/.claude/skills/landing-registrar-feedback/SKILL.md                               # Task 19
~/.claude/skills/landing-evoluir-skill/SKILL.md                                    # Task 20
~/projetos/criar-site/_testes-skills/                                              # Tasks 11, 18, 21, 22
  cenarios/S01..S11.md  baseline/  verde/  disparo.json  extrair-descricoes.mjs  pontuar-disparo.mjs
  fixtures/salao.md  eventos.md  profissional.md  agenda.md
~/projetos/criar-site/_regras-vivas.md  _evolucao.md                               # Tasks 18 e 22
```

`K` abaixo = `~/.claude/skills/criar-landing-page/assets/kit`.

**Ordem de construção:** o kit inteiro primeiro (Tasks 1-10, níveis 1 e 2 do spec, porque as Iron Laws das skills chamam os scripts); cenários RED (11); modelos e as cinco skills dos níveis 1 e 2 (12-17); **verificação ponta a ponta com decisão do Felipe (18)**; só então o nível 3, com `landing-registrar-feedback`, `landing-evoluir-skill`, testes de disparo e a migração (19-22); fechamento (23).

---

# NÍVEL 1 e 2: o kit

## Task 1: Esqueleto do kit e bibliotecas (args, frontmatter, hash, arquivos seguros)

**Spec:** seções 3.2, 3.9, 5 (regras do kit).

**Files:**
- Create: `K/package.json`, `K/fluxo.json`, `K/lib/args.js`, `K/lib/fm.js`, `K/lib/hash.js`, `K/lib/fsx.js`, `K/test/helpers.js`
- Test: `K/test/lib.test.js`

**Interfaces:**
- Produces:
  - `lib/args.js`: `EXIT` (`{OK:0,FAIL:1,USAGE:2,MISSING:3,INVALID:4,NOT_APPROVED:5,STALE:6,FORBIDDEN:7}`), `class Falha(codigo, msg)`, `cli(spec, uso, argv?) -> values`, `executar(fn)` (captura `Falha` e erros inesperados, imprime a mensagem e sai com o código; erro inesperado sai `1`).
  - `lib/fm.js`: `parse(text) -> {fm|null, body}` (lança em YAML inválido), `stringify(fm, body) -> string`.
  - `lib/hash.js`: `sha256(str)`, `hashArtefato(text) -> hex` (exclui `aprovado`, `data`, `aprovacao`, `artefato_sha256`; inclui o resto do frontmatter ordenado e o corpo sem espaços finais).
  - `lib/fsx.js`: `raizDados()`, `dentroDe(base, alvo) -> bool`, `clienteDir(nome) -> abs`, `arquivoDeDados(file) -> abs` (lança com `.code === "AUSENTE"` se não existe), `escreverAtomico(file, conteudo, sha256DoBrutoAnterior?)`, `comTrava(dir, nome, fn, opts?)`, `auditar(dir, entrada)`, `lerAuditoria(dir) -> []`.
  - `test/helpers.js`: `KIT`, `tmpRaiz()`, `run(script, args, {raiz, env, input}) -> {code,out,err}`, `novoCliente(raiz, nome?) -> dir`, `escreveArtefato(dir, arquivo, fm, body) -> abs`.

- [ ] **Step 1: Criar a estrutura e instalar a dependência**

```bash
mkdir -p ~/.claude/skills/criar-landing-page/assets/kit/{lib,test} ~/.claude/skills/criar-landing-page/assets/modelos
cd ~/.claude/skills/criar-landing-page/assets/kit
cat > package.json <<'EOF'
{
  "name": "criar-landing-kit",
  "private": true,
  "type": "module",
  "scripts": { "test": "node --test \"test/*.test.js\"" },
  "dependencies": { "yaml": "^2.8.0" },
  "optionalDependencies": { "playwright": "^1.50.0" }
}
EOF
cat > fluxo.json <<'EOF'
{
  "schema_version": 1,
  "fases": {
    "descoberta":     { "arquivo": "01-negocio-e-escopo.md", "requer": [],                                          "alto_risco": false },
    "direcao-visual": { "arquivo": "direcao-visual.md",      "requer": ["descoberta"],                              "alto_risco": false },
    "plano":          { "arquivo": "plano.md",               "requer": ["descoberta", "direcao-visual"],            "alto_risco": false },
    "software-extra": { "arquivo": "03-decisoes.md",         "requer": ["descoberta", "plano"],                     "alto_risco": true  },
    "publicacao":     { "arquivo": "publicacao.md",          "requer": ["descoberta", "direcao-visual", "plano"],   "alto_risco": true,
                        "requer_se": { "software-extra": "tem:software-extra" } }
  },
  "invalida_aprovacao": ["hash-diferente", "reabrir"],
  "irreversiveis": ["publicacao"]
}
EOF
npm install --no-audit --no-fund 2>&1 | tail -5
```

Expected: `yaml` instalado; `playwright` pode instalar (ou avisar); `node_modules/yaml` existe.

- [ ] **Step 2: Escrever o teste que falha (`test/lib.test.js`) e o helper**

```js
// test/helpers.js
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "../lib/fm.js";

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function tmpRaiz() {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "kit-")));
}

export function run(script, args = [], { raiz, env = {}, input } = {}) {
  const r = spawnSync("node", [path.join(KIT, script), ...args], {
    encoding: "utf8",
    input,
    env: { ...process.env, ...(raiz ? { CRIAR_SITE_ROOT: raiz } : {}), ...env },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

export function novoCliente(raiz, nome = "cli-teste") {
  const d = path.join(raiz, nome);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function escreveArtefato(dir, arquivo, fm, body = "# corpo\n") {
  const f = path.join(dir, arquivo);
  fs.writeFileSync(f, stringify(fm, body));
  return f;
}
```

```js
// test/lib.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "../lib/fm.js";
import { hashArtefato } from "../lib/hash.js";
import { clienteDir, dentroDe, escreverAtomico, comTrava, auditar, lerAuditoria } from "../lib/fsx.js";
import { sha256 } from "../lib/hash.js";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

test("parse/stringify preservam frontmatter e corpo (inclui CRLF)", () => {
  const t = "---\r\nfase: descoberta\r\naprovado: false\r\n---\r\n# Oi\r\n";
  const { fm, body } = parse(t);
  assert.equal(fm.fase, "descoberta");
  assert.equal(fm.aprovado, false);
  assert.equal(body, "# Oi\n");
  assert.equal(parse(stringify(fm, body)).fm.fase, "descoberta");
});

test("parse devolve fm null sem frontmatter e lança em YAML inválido", () => {
  assert.equal(parse("# só corpo").fm, null);
  assert.throws(() => parse("---\nfase: [quebrado\n---\nx"));
});

test("hashArtefato ignora campos de aprovação e muda com o corpo ou o resto do frontmatter", () => {
  const base = { schema_version: 1, fase: "descoberta", aprovado: false };
  const a = hashArtefato(stringify(base, "corpo\n"));
  const b = hashArtefato(stringify({ ...base, aprovado: true, data: "2026-10-15", artefato_sha256: "x", aprovacao: { via: "comando" } }, "corpo\n"));
  assert.equal(a, b);
  assert.notEqual(a, hashArtefato(stringify(base, "corpo alterado\n")));
  assert.notEqual(a, hashArtefato(stringify({ ...base, tags: ["a"] }, "corpo\n")));
});

test("clienteDir recusa nome com .., barra, maiúscula ou pasta inexistente", () => {
  const raiz = tmpRaiz();
  process.env.CRIAR_SITE_ROOT = raiz;
  novoCliente(raiz, "ok-1");
  assert.equal(clienteDir("ok-1"), path.join(raiz, "ok-1"));
  for (const ruim of ["../x", "a/b", "A", "_x", "", "nao-existe"]) assert.throws(() => clienteDir(ruim), undefined, ruim);
});

test("dentroDe recusa caminho fora da base e link simbólico que escapa", () => {
  const raiz = tmpRaiz();
  const fora = tmpRaiz();
  fs.writeFileSync(path.join(fora, "x.txt"), "x");
  fs.symlinkSync(fora, path.join(raiz, "link"));
  assert.equal(dentroDe(raiz, path.join(raiz, "link", "x.txt")), false);
  fs.writeFileSync(path.join(raiz, "ok.txt"), "x");
  assert.equal(dentroDe(raiz, path.join(raiz, "ok.txt")), true);
});

test("escreverAtomico recusa quando o arquivo mudou desde a leitura", () => {
  const d = tmpRaiz();
  const f = path.join(d, "a.md");
  fs.writeFileSync(f, "v1");
  escreverAtomico(f, "v2", sha256("v1"));
  assert.equal(fs.readFileSync(f, "utf8"), "v2");
  assert.throws(() => escreverAtomico(f, "v3", sha256("v1")), /conflito/);
  assert.equal(fs.readdirSync(d).filter((n) => n.includes(".tmp-")).length, 0);
});

test("comTrava serializa e libera a trava mesmo com exceção", () => {
  const d = tmpRaiz();
  assert.throws(() => comTrava(d, "x", () => { throw new Error("boom"); }), /boom/);
  assert.equal(comTrava(d, "x", () => 7), 7);
  fs.mkdirSync(path.join(d, ".trava-y"));
  assert.throws(() => comTrava(d, "y", () => 1, { espera: 100 }), /trava ocupada/);
});

test("auditar anexa linhas JSON e lerAuditoria as devolve", () => {
  const d = tmpRaiz();
  auditar(d, { op: "approve", fase: "descoberta", hash: "h1" });
  auditar(d, { op: "reabrir", fase: "descoberta", hash: "h1" });
  const l = lerAuditoria(d);
  assert.equal(l.length, 2);
  assert.equal(l[0].op, "approve");
  assert.ok(l[0].ts);
});

test("executar: exceção inesperada sai com código 1 (reprovação, nunca 0)", () => {
  const raiz = tmpRaiz();
  const r = run("check-gate.js", ["--file", raiz, "--fase", "descoberta"], { raiz });
  assert.notEqual(r.code, 0);
});
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/lib.test.js"`
Expected: FAIL (`Cannot find module '../lib/fm.js'`).

- [ ] **Step 4: Implementar as bibliotecas**

```js
// lib/args.js
import { parseArgs } from "node:util";

export const EXIT = { OK: 0, FAIL: 1, USAGE: 2, MISSING: 3, INVALID: 4, NOT_APPROVED: 5, STALE: 6, FORBIDDEN: 7 };

export class Falha extends Error {
  constructor(codigo, msg) { super(msg); this.codigo = codigo; }
}

export function fail(codigo, msg) {
  console.error(msg);
  process.exit(codigo);
}

export function cli(spec, uso, argv = process.argv.slice(2)) {
  const options = { help: { type: "boolean" } };
  for (const [k, s] of Object.entries(spec)) options[k] = { type: s.type ?? "string", multiple: !!s.multiple };
  let values;
  try { ({ values } = parseArgs({ args: argv, options, allowPositionals: false })); }
  catch (e) { fail(EXIT.USAGE, `${e.message}\n${uso}`); }
  if (values.help) { console.log(uso); process.exit(0); }
  for (const [k, s] of Object.entries(spec)) {
    if (s.required && values[k] === undefined) fail(EXIT.USAGE, `falta --${k}\n${uso}`);
  }
  return values;
}

export function executar(fn) {
  const trata = (e) => {
    if (e instanceof Falha) fail(e.codigo, e.message);
    fail(EXIT.FAIL, `erro inesperado (tratado como reprovação): ${e.message}`);
  };
  try {
    const r = fn();
    if (r && typeof r.then === "function") r.then(() => {}, trata);
  } catch (e) { trata(e); }
}
```

```js
// lib/fm.js
import YAML from "yaml";

export function parse(text) {
  const t = text.replace(/\r\n/g, "\n");
  const m = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: null, body: t };
  const fm = YAML.parse(m[1]);
  return { fm: fm && typeof fm === "object" ? fm : {}, body: m[2] };
}

export function stringify(fm, body) {
  return `---\n${YAML.stringify(fm).trimEnd()}\n---\n${body}`;
}
```

```js
// lib/hash.js
import { createHash } from "node:crypto";
import { parse } from "./fm.js";

const EXCLUIDOS = ["aprovado", "data", "aprovacao", "artefato_sha256"];
export const sha256 = (s) => createHash("sha256").update(s).digest("hex"); // aceita string ou Buffer

const ordena = (v) =>
  Array.isArray(v) ? v.map(ordena)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordena(v[k])]))
  : v;

export function hashArtefato(text) {
  const { fm, body } = parse(text);
  const mantido = Object.fromEntries(Object.entries(fm ?? {}).filter(([k]) => !EXCLUIDOS.includes(k)));
  return sha256(JSON.stringify({ fm: ordena(mantido), body: body.replace(/\s+$/, "") }));
}
```

```js
// lib/fsx.js
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { sha256 } from "./hash.js";

export const raizDados = () => path.resolve(process.env.CRIAR_SITE_ROOT ?? path.join(os.homedir(), "projetos", "criar-site"));

export function dentroDe(base, alvo) {
  const b = fs.realpathSync(base);
  const a = fs.existsSync(alvo)
    ? fs.realpathSync(alvo)
    : path.join(fs.realpathSync(path.dirname(alvo)), path.basename(alvo));
  const rel = path.relative(b, a);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

export function clienteDir(nome) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(nome ?? "")) throw new Error(`nome de cliente inválido: '${nome}'`);
  const raiz = raizDados();
  const dir = path.join(raiz, nome);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw new Error(`pasta do cliente não existe: ${dir}`);
  if (!dentroDe(raiz, dir)) throw new Error(`fora da raiz de dados: ${dir}`);
  return fs.realpathSync(dir);
}

export function arquivoDeDados(file) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) { const e = new Error(`ausente: ${abs}`); e.code = "AUSENTE"; throw e; }
  if (!fs.statSync(abs).isFile()) throw new Error(`não é um arquivo: ${abs}`);
  if (!dentroDe(raizDados(), abs)) throw new Error(`fora da raiz de dados: ${abs}`);
  return fs.realpathSync(abs);
}

export function escreverAtomico(file, conteudo, sha256DoBrutoAnterior) {
  if (sha256DoBrutoAnterior !== undefined) {
    const atual = fs.existsSync(file) ? sha256(fs.readFileSync(file, "utf8")) : "";
    if (atual !== sha256DoBrutoAnterior) throw new Error(`conflito: ${file} mudou durante a operação`);
  }
  const tmp = `${file}.tmp-${process.pid}-${randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, conteudo);
  fs.renameSync(tmp, file);
}

const dorme = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function comTrava(dir, nome, fn, { espera = 10000, obsoleta = 30000 } = {}) {
  const trava = path.join(dir, `.trava-${nome}`);
  const ini = Date.now();
  for (;;) {
    try { fs.mkdirSync(trava); break; }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      try { if (Date.now() - fs.statSync(trava).mtimeMs > obsoleta) { fs.rmdirSync(trava); continue; } } catch { /* outra execução liberou */ }
      if (Date.now() - ini > espera) throw new Error(`trava ocupada: ${trava}`);
      dorme(20);
    }
  }
  try { return fn(); } finally { try { fs.rmdirSync(trava); } catch { /* já liberada */ } }
}

export function auditar(dir, entrada) {
  fs.appendFileSync(path.join(dir, "auditoria.log"), JSON.stringify({ ts: new Date().toISOString(), ...entrada }) + "\n");
}

export function lerAuditoria(dir) {
  const f = path.join(dir, "auditoria.log");
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, "utf8").split("\n").filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}
```

O último teste de `lib.test.js` (executar) depende do `check-gate.js` da Task 2; ele passa a verde lá. Por ora, rode só os testes anteriores.

- [ ] **Step 5: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test --test-name-pattern='/^(?!executar)/' "test/lib.test.js"`
Expected: PASS em todos exceto `executar` (que ainda não existe e é filtrado).

- [ ] **Step 6: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && ls lib test && node --test "test/lib.test.js" 2>&1 | tail -8`
Expected: só o teste `executar` falha (módulo `check-gate.js` ainda ausente). Anotar e seguir.

---

## Task 2: `check-gate`, `approve` e a tabela de campos (gates com hash e auditoria)

**Spec:** seções 3.2, 3.9, 7.1 item 4.

**Files:**
- Create: `K/lib/gate.js`, `K/check-gate.js`, `K/approve.js`
- Test: `K/test/gate.test.js`

**Interfaces:**
- Consumes: `lib/args.js`, `lib/fm.js`, `lib/hash.js`, `lib/fsx.js` (Task 1).
- Produces:
  - `lib/gate.js`: `fluxo` (conteúdo de `fluxo.json`), `verificar(file, fase) -> {codigo, msg, hash?, fm?, abs?}`, `antesDe(dirCliente, fase) -> {codigo, msg}`.
  - CLI `node check-gate.js --file <arquivo.md> --fase <nome>` e `node check-gate.js --cliente <nome> --antes-de <fase>`: sai `0` só se aprovado, hash atual e auditoria batem.
  - CLI `node approve.js --file <arquivo.md> --fase <nome> --via <comando|conversa> [--citacao <texto>] [--reabrir]`.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/gate.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, escreveArtefato, run } from "./helpers.js";
import { stringify } from "../lib/fm.js";
import { hashArtefato } from "../lib/hash.js";

const FM = (fase, extra = {}) => ({ schema_version: 1, fase, aprovado: false, ...extra });
const setup = () => { const raiz = tmpRaiz(); const dir = novoCliente(raiz); return { raiz, dir }; };

test("não aprovado → 5; approve por conversa sem citação → 2; com citação → 0 e gate 0", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta"));
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 5);
  assert.equal(run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "conversa"], { raiz }).code, 2);
  assert.equal(run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim, pode seguir"], { raiz }).code, 0);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 0);
  assert.match(fs.readFileSync(path.join(dir, "auditoria.log"), "utf8"), /"op":"approve"/);
});

test("editar o corpo depois de aprovar → desatualizado (6)", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta"));
  run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { raiz });
  fs.appendFileSync(f, "\nPúblico agora inclui empresas.\n");
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 6);
});

test("forjar aprovado:true com hash correto mas sem auditoria → 4", () => {
  const { raiz, dir } = setup();
  const texto = stringify(FM("descoberta"), "# corpo\n");
  const hash = hashArtefato(texto);
  const f = path.join(dir, "01-negocio-e-escopo.md");
  fs.writeFileSync(f, stringify({ ...FM("descoberta"), aprovado: true, artefato_sha256: hash, aprovacao: { via: "conversa", citacao: "x" } }, "# corpo\n"));
  const r = run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz });
  assert.equal(r.code, 4);
  assert.match(r.err, /auditoria/);
});

test("aprovado como string, schema desconhecida, fase trocada e YAML quebrado → 4", () => {
  const { raiz, dir } = setup();
  const f = path.join(dir, "01-negocio-e-escopo.md");
  const casos = [
    "---\nschema_version: 1\nfase: descoberta\naprovado: \"true\"\n---\nx",
    "---\nschema_version: 2\nfase: descoberta\naprovado: true\n---\nx",
    "---\nschema_version: 1\nfase: plano\naprovado: true\n---\nx",
    "---\nschema_version: 1\nfase: [quebrado\n---\nx",
    "# sem frontmatter",
  ];
  for (const c of casos) {
    fs.writeFileSync(f, c);
    assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 4, c);
  }
});

test("arquivo ausente → 3; diretório no lugar do arquivo → ≠0; arquivo fora da raiz → 4", () => {
  const { raiz, dir } = setup();
  assert.equal(run("check-gate.js", ["--file", path.join(dir, "nao.md"), "--fase", "descoberta"], { raiz }).code, 3);
  assert.notEqual(run("check-gate.js", ["--file", dir, "--fase", "descoberta"], { raiz }).code, 0);
  const fora = tmpRaiz();
  const g = escreveArtefato(fora, "01.md", FM("descoberta"));
  assert.equal(run("check-gate.js", ["--file", g, "--fase", "descoberta"], { raiz }).code, 4);
});

test("fase de alto risco: conversa → 7; comando → 0 e gate 0", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "publicacao.md", FM("publicacao"));
  assert.equal(run("approve.js", ["--file", f, "--fase", "publicacao", "--via", "conversa", "--citacao", "sim"], { raiz }).code, 7);
  assert.equal(run("approve.js", ["--file", f, "--fase", "publicacao", "--via", "comando"], { raiz }).code, 0);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "publicacao"], { raiz }).code, 0);
});

test("alto risco aprovado por conversa (forjado no YAML + auditoria falsa) → 5", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "publicacao.md", FM("publicacao"));
  run("approve.js", ["--file", f, "--fase", "publicacao", "--via", "comando"], { raiz });
  const txt = fs.readFileSync(f, "utf8").replace("via: comando", "via: conversa");
  fs.writeFileSync(f, txt);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "publicacao"], { raiz }).code, 5);
});

test("--reabrir derruba a aprovação", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta"));
  run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { raiz });
  assert.equal(run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "comando", "--reabrir"], { raiz }).code, 0);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 5);
});

test("--antes-de: direcao-visual exige descoberta aprovada; software-extra só se a tag existir", () => {
  const { raiz, dir } = setup();
  const f1 = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta", { tags: ["tipo:b2c"] }));
  const antes = () => run("check-gate.js", ["--cliente", "cli-teste", "--antes-de", "direcao-visual"], { raiz }).code;
  assert.notEqual(antes(), 0);
  run("approve.js", ["--file", f1, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { raiz });
  assert.equal(antes(), 0);
  // publicacao sem a tag tem:software-extra não exige 03; com a tag, exige
  const f2 = escreveArtefato(dir, "direcao-visual.md", FM("direcao-visual"));
  const f3 = escreveArtefato(dir, "plano.md", FM("plano"));
  for (const [f, fase] of [[f2, "direcao-visual"], [f3, "plano"]]) run("approve.js", ["--file", f, "--fase", fase, "--via", "conversa", "--citacao", "sim"], { raiz });
  assert.equal(run("check-gate.js", ["--cliente", "cli-teste", "--antes-de", "publicacao"], { raiz }).code, 0);
  run("approve.js", ["--file", f1, "--fase", "descoberta", "--via", "comando", "--reabrir"], { raiz });
  fs.writeFileSync(f1, stringify(FM("descoberta", { tags: ["tem:software-extra"] }), "# corpo\n"));
  run("approve.js", ["--file", f1, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { raiz });
  assert.notEqual(run("check-gate.js", ["--cliente", "cli-teste", "--antes-de", "publicacao"], { raiz }).code, 0);
});

test("duas aprovações simultâneas não corrompem o arquivo", async () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta"));
  const { spawn } = await import("node:child_process");
  const { KIT } = await import("./helpers.js");
  const lancar = () => new Promise((res) => {
    const p = spawn("node", [path.join(KIT, "approve.js"), "--file", f, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { env: { ...process.env, CRIAR_SITE_ROOT: raiz } });
    p.on("close", res);
  });
  await Promise.all([lancar(), lancar(), lancar()]);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/gate.test.js"`
Expected: FAIL (scripts inexistentes; códigos de saída ≠ esperados).

- [ ] **Step 3: Implementar `lib/gate.js`, `check-gate.js` e `approve.js`**

```js
// lib/gate.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "./fm.js";
import { hashArtefato } from "./hash.js";
import { arquivoDeDados, lerAuditoria } from "./fsx.js";
import { EXIT } from "./args.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const fluxo = JSON.parse(fs.readFileSync(path.join(aqui, "..", "fluxo.json"), "utf8"));

export function verificar(file, fase) {
  const def = fluxo.fases[fase];
  if (!def) return { codigo: EXIT.INVALID, msg: `fase desconhecida: ${fase}` };
  let abs;
  try { abs = arquivoDeDados(file); }
  catch (e) { return { codigo: e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, msg: e.message }; }
  const texto = fs.readFileSync(abs, "utf8");
  let fm;
  try { ({ fm } = parse(texto)); } catch (e) { return { codigo: EXIT.INVALID, msg: `YAML inválido: ${e.message}` }; }
  if (!fm) return { codigo: EXIT.INVALID, msg: "sem frontmatter" };
  if (fm.schema_version !== 1) return { codigo: EXIT.INVALID, msg: `schema_version desconhecida: ${fm.schema_version}` };
  if (fm.fase !== fase) return { codigo: EXIT.INVALID, msg: `fase do arquivo (${fm.fase}) difere de ${fase}` };
  if (typeof fm.aprovado !== "boolean") return { codigo: EXIT.INVALID, msg: "aprovado deve ser booleano (true|false)" };
  if (!fm.aprovado) return { codigo: EXIT.NOT_APPROVED, msg: `fase ${fase} não aprovada` };
  const hash = hashArtefato(texto);
  if (hash !== fm.artefato_sha256) return { codigo: EXIT.STALE, msg: `${fase}: artefato mudou depois da aprovação (desatualizado)` };
  const registrado = lerAuditoria(path.dirname(abs)).some((e) => e.fase === fase && e.hash === hash && ["approve", "resolve"].includes(e.op));
  if (!registrado) return { codigo: EXIT.INVALID, msg: `${fase}: sem registro de auditoria para este hash` };
  if (def.alto_risco && fm.aprovacao?.via !== "comando") return { codigo: EXIT.NOT_APPROVED, msg: `${fase}: alto risco exige aprovação via comando do Felipe` };
  return { codigo: EXIT.OK, msg: `${fase} aprovada`, hash, fm, abs };
}

export function antesDe(dirCliente, fase) {
  const def = fluxo.fases[fase];
  if (!def) return { codigo: EXIT.INVALID, msg: `fase desconhecida: ${fase}` };
  const exigidas = [...def.requer];
  for (const [outra, tag] of Object.entries(def.requer_se ?? {})) {
    const r = verificar(path.join(dirCliente, fluxo.fases.descoberta.arquivo), "descoberta");
    if (r.codigo === EXIT.OK && (r.fm.tags ?? []).includes(tag)) exigidas.push(outra);
  }
  for (const f of exigidas) {
    const r = verificar(path.join(dirCliente, fluxo.fases[f].arquivo), f);
    if (r.codigo !== EXIT.OK) return r;
  }
  return { codigo: EXIT.OK, msg: `pré-condições de ${fase} ok` };
}
```

```js
// check-gate.js
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { verificar, antesDe } from "./lib/gate.js";
import { clienteDir } from "./lib/fsx.js";

const USO = `uso: node check-gate.js --file <arquivo.md> --fase <nome>
     node check-gate.js --cliente <nome> --antes-de <fase>
saída 0 só se a fase estiver aprovada, com hash atual e auditoria; qualquer outra saída é reprovação.`;

executar(() => {
  const v = cli({ file: {}, fase: {}, cliente: {}, "antes-de": {} }, USO);
  let r;
  if (v["antes-de"]) {
    if (!v.cliente) throw new Falha(EXIT.USAGE, USO);
    let dir;
    try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
    r = antesDe(dir, v["antes-de"]);
  } else {
    if (!v.file || !v.fase) throw new Falha(EXIT.USAGE, USO);
    r = verificar(v.file, v.fase);
  }
  if (r.codigo !== EXIT.OK) throw new Falha(r.codigo, `REPROVADO: ${r.msg}`);
  console.log(`OK: ${r.msg}`);
});
```

```js
// approve.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse, stringify } from "./lib/fm.js";
import { hashArtefato, sha256 } from "./lib/hash.js";
import { arquivoDeDados, escreverAtomico, comTrava, auditar } from "./lib/fsx.js";
import { fluxo } from "./lib/gate.js";

const USO = "uso: node approve.js --file <arquivo.md> --fase <nome> --via <comando|conversa> [--citacao <texto>] [--reabrir]\n--via conversa exige --citacao (trecho literal do 'sim' do Felipe); fases de alto risco só aceitam --via comando (rodado pelo Felipe com '!').";

executar(() => {
  const v = cli({ file: { required: true }, fase: { required: true }, via: {}, citacao: {}, reabrir: { type: "boolean" } }, USO);
  const def = fluxo.fases[v.fase];
  if (!def) throw new Falha(EXIT.INVALID, `fase desconhecida: ${v.fase}`);
  let abs;
  try { abs = arquivoDeDados(v.file); }
  catch (e) { throw new Falha(e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, e.message); }
  const dir = path.dirname(abs);
  comTrava(dir, "estado", () => {
    const bruto = fs.readFileSync(abs, "utf8");
    let fm, body;
    try { ({ fm, body } = parse(bruto)); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
    if (!fm || fm.fase !== v.fase || fm.schema_version !== 1) throw new Falha(EXIT.INVALID, "frontmatter ausente, fase diferente ou schema_version != 1");
    if (v.reabrir) {
      const hashAntes = hashArtefato(bruto);
      fm.aprovado = false; delete fm.artefato_sha256; delete fm.aprovacao;
      escreverAtomico(abs, stringify(fm, body), sha256(bruto));
      auditar(dir, { op: "reabrir", fase: v.fase, hash: hashAntes, via: v.via ?? "n/d" });
      console.log("reaberta");
      return;
    }
    if (!["comando", "conversa"].includes(v.via)) throw new Falha(EXIT.USAGE, USO);
    if (v.via === "conversa" && !(v.citacao && v.citacao.trim())) throw new Falha(EXIT.USAGE, "--via conversa exige --citacao");
    if (v.via === "conversa" && def.alto_risco) throw new Falha(EXIT.FORBIDDEN, `fase ${v.fase} é de alto risco: o Felipe deve rodar o comando (--via comando)`);
    fm.aprovado = true;
    fm.data = new Date().toISOString().slice(0, 10);
    fm.aprovacao = { via: v.via, ...(v.citacao ? { citacao: v.citacao } : {}) };
    const hash = hashArtefato(stringify(fm, body));
    fm.artefato_sha256 = hash;
    escreverAtomico(abs, stringify(fm, body), sha256(bruto));
    auditar(dir, { op: "approve", fase: v.fase, hash, via: v.via, citacao: v.citacao ?? null });
    console.log(`aprovada ${hash}`);
  });
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/gate.test.js" "test/lib.test.js"`
Expected: PASS em todos, inclusive `executar: exceção inesperada...` da Task 1.

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -12`
Expected: 0 falhas.

---

## Task 3: `resolve-pendencia` (exceção estreita e verificável)

**Spec:** seção 3.2 ("Integridade das aprovações e resolução de pendências").

**Files:**
- Create: `K/lib/campos.js`, `K/resolve-pendencia.js`
- Test: `K/test/pendencia.test.js`

**Interfaces:**
- Consumes: `lib/*` (Task 1), `approve.js` via CLI nos testes (Task 2).
- Produces:
  - `lib/campos.js`: `CAMPOS` (`{contato:"confirmado", endereco:"confirmado", horario:"confirmado", preco:"confirmado", "correcao-tipografica":"livre", publico:"material", escopo:"material", "area-atuacao":"material", condicoes:"material", stack:"material", "dados-persistentes":"material"}`).
  - CLI `node resolve-pendencia.js --file <arquivo.md> --id <P-nnn> --valor <texto> [--fonte <texto>]`.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/pendencia.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, escreveArtefato, run } from "./helpers.js";
import { parse } from "../lib/fm.js";

const CORPO = "## Público-alvo\nMulheres de 25 a 45 anos.\n\n## Contato\nEndereço: {{PENDENTE:P-001}}\nPúblico extra: {{PENDENTE:P-002}}\nTexto: {{PENDENTE:P-003}}\n";
const FM = () => ({
  schema_version: 1, fase: "descoberta", aprovado: false,
  pendencias: [
    { id: "P-001", campo: "endereco", status: "pendente", bloqueia: "publicacao" },
    { id: "P-002", campo: "publico", status: "pendente", bloqueia: "plano" },
    { id: "P-003", campo: "correcao-tipografica", status: "pendente", bloqueia: "publicacao" },
  ],
  resolucoes: [],
});
const setup = () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM(), CORPO);
  run("approve.js", ["--file", f, "--fase", "descoberta", "--via", "conversa", "--citacao", "sim"], { raiz });
  return { raiz, dir, f };
};
const gate = (raiz, f) => run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code;
const resolve = (raiz, f, id, valor, fonte) => run("resolve-pendencia.js", ["--file", f, "--id", id, "--valor", valor, ...(fonte ? ["--fonte", fonte] : [])], { raiz });

test("troca legítima: mantém a aprovação, grava a resolução e a auditoria", () => {
  const { raiz, dir, f } = setup();
  const r = resolve(raiz, f, "P-001", "Rua das Flores, 10, São Paulo", "Cliente A, WhatsApp 15/10");
  assert.equal(r.code, 0, r.err);
  assert.equal(gate(raiz, f), 0);
  const { fm, body } = parse(fs.readFileSync(f, "utf8"));
  assert.match(body, /Endereço: Rua das Flores, 10/);
  assert.equal(fm.pendencias[0].status, "resolvida");
  assert.equal(fm.resolucoes[0].id, "P-001");
  assert.match(fs.readFileSync(path.join(dir, "auditoria.log"), "utf8"), /"op":"resolve"/);
});

test("campo confirmado sem --fonte → 2; campo material → 7; correção tipográfica livre → 0", () => {
  const { raiz, f } = setup();
  assert.equal(resolve(raiz, f, "P-001", "Rua X").code, 2);
  assert.equal(resolve(raiz, f, "P-002", "Empresas e organizadores").code, 7);
  assert.equal(resolve(raiz, f, "P-003", "texto corrigido").code, 0);
  assert.equal(gate(raiz, f), 0);
});

test("edição manual escondida na seção de pendências invalida o gate e bloqueia a resolução (6)", () => {
  const { raiz, f } = setup();
  fs.appendFileSync(f, "- Público-alvo: agora inclui empresas corporativas.\n");
  assert.equal(gate(raiz, f), 6);
  assert.equal(resolve(raiz, f, "P-003", "ok").code, 6);
});

test("editar manualmente o trecho do marcador também invalida (6)", () => {
  const { raiz, f } = setup();
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("{{PENDENTE:P-001}}", "Rua escondida, 1"));
  assert.equal(gate(raiz, f), 6);
});

test("valor com várias linhas, '{{', '#' inicial ou longo demais → 4; id inexistente → 4; já resolvida → 1", () => {
  const { raiz, f } = setup();
  for (const ruim of ["a\nb", "{{PENDENTE:P-002}}", "# Novo título", "x".repeat(201)]) {
    assert.equal(resolve(raiz, f, "P-003", ruim).code, 4, ruim);
  }
  assert.equal(resolve(raiz, f, "P-999", "x").code, 4);
  assert.equal(resolve(raiz, f, "P-003", "ok").code, 0);
  assert.equal(resolve(raiz, f, "P-003", "de novo").code, 1);
});

test("marcador ausente ou repetido → 4", () => {
  const { raiz, dir } = setup();
  const f2 = escreveArtefato(dir, "dup.md", { ...FM(), fase: "descoberta" }, "{{PENDENTE:P-003}} e {{PENDENTE:P-003}}\n");
  assert.equal(resolve(raiz, f2, "P-003", "x").code, 4);
});

test("duas resoluções simultâneas de pendências diferentes preservam as duas", async () => {
  const { raiz, f } = setup();
  const { spawn } = await import("node:child_process");
  const { KIT } = await import("./helpers.js");
  const lancar = (id, valor, fonte) => new Promise((res) => {
    const p = spawn("node", [path.join(KIT, "resolve-pendencia.js"), "--file", f, "--id", id, "--valor", valor, "--fonte", fonte], { env: { ...process.env, CRIAR_SITE_ROOT: raiz } });
    p.on("close", res);
  });
  await Promise.all([lancar("P-001", "Rua A, 1", "cliente"), lancar("P-003", "ok", "cliente")]);
  const { fm } = parse(fs.readFileSync(f, "utf8"));
  assert.deepEqual(fm.pendencias.map((p) => p.status), ["resolvida", "pendente", "resolvida"]);
  assert.equal(gate(raiz, f), 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/pendencia.test.js"`
Expected: FAIL (`resolve-pendencia.js` inexistente).

- [ ] **Step 3: Implementar**

```js
// lib/campos.js
export const CAMPOS = {
  contato: "confirmado", endereco: "confirmado", horario: "confirmado", preco: "confirmado",
  "correcao-tipografica": "livre",
  publico: "material", escopo: "material", "area-atuacao": "material",
  condicoes: "material", stack: "material", "dados-persistentes": "material",
};
```

```js
// resolve-pendencia.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse, stringify } from "./lib/fm.js";
import { hashArtefato, sha256 } from "./lib/hash.js";
import { arquivoDeDados, escreverAtomico, comTrava, auditar } from "./lib/fsx.js";
import { CAMPOS } from "./lib/campos.js";

const USO = "uso: node resolve-pendencia.js --file <arquivo.md> --id <P-nnn> --valor <texto> [--fonte <texto>]\nSó troca o marcador {{PENDENTE:<id>}} pelo valor. Campos 'confirmado' exigem --fonte; campos 'material' são recusados (reabrir o gate).";

executar(() => {
  const v = cli({ file: { required: true }, id: { required: true }, valor: { required: true }, fonte: {} }, USO);
  let abs;
  try { abs = arquivoDeDados(v.file); }
  catch (e) { throw new Falha(e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, e.message); }
  if (/[\n\r]/.test(v.valor) || v.valor.length > 200 || v.valor.includes("{{") || /^\s*#/.test(v.valor)) {
    throw new Falha(EXIT.INVALID, "valor inválido: uma linha, até 200 caracteres, sem '{{' e sem começar com '#'");
  }
  const dir = path.dirname(abs);
  comTrava(dir, "estado", () => {
    const bruto = fs.readFileSync(abs, "utf8");
    let fm, body;
    try { ({ fm, body } = parse(bruto)); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
    if (!fm) throw new Falha(EXIT.INVALID, "sem frontmatter");
    const p = (fm.pendencias ?? []).find((x) => x.id === v.id);
    if (!p) throw new Falha(EXIT.INVALID, `pendência ${v.id} não existe`);
    if (p.status !== "pendente") throw new Falha(EXIT.FAIL, `${v.id} já está ${p.status}`);
    const classe = CAMPOS[p.campo];
    if (!classe) throw new Falha(EXIT.INVALID, `campo desconhecido: ${p.campo}`);
    if (classe === "material") throw new Falha(EXIT.FORBIDDEN, `campo '${p.campo}' é material: reabra o gate (approve.js --reabrir) e peça nova aprovação`);
    if (classe === "confirmado" && !(v.fonte && v.fonte.trim())) throw new Falha(EXIT.USAGE, `campo '${p.campo}' exige --fonte (quem confirmou e como)`);
    const hashAntes = hashArtefato(bruto);
    if (fm.aprovado === true && fm.artefato_sha256 !== hashAntes) throw new Falha(EXIT.STALE, "artefato foi alterado fora do script depois da aprovação; reabra o gate");
    const marcador = `{{PENDENTE:${v.id}}}`;
    const n = body.split(marcador).length - 1;
    if (n !== 1) throw new Falha(EXIT.INVALID, `marcador ${marcador} deve aparecer exatamente 1 vez (achei ${n})`);
    p.status = "resolvida";
    fm.resolucoes = [...(fm.resolucoes ?? []), { id: v.id, campo: p.campo, valor: v.valor, fonte: v.fonte ?? null, data: new Date().toISOString().slice(0, 10), hash_anterior: hashAntes }];
    const novoBody = body.replace(marcador, () => v.valor);
    const hashNovo = hashArtefato(stringify(fm, novoBody));
    if (fm.aprovado === true) fm.artefato_sha256 = hashNovo;
    escreverAtomico(abs, stringify(fm, novoBody), sha256(bruto));
    auditar(dir, { op: "resolve", fase: fm.fase, hash: hashNovo, id: v.id, campo: p.campo, fonte: v.fonte ?? null });
    console.log(`${v.id} resolvida`);
  });
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/pendencia.test.js"`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -10`
Expected: 0 falhas.


## Task 4: `authorize` e `publicar` (token de uso único, publicação reversível)

**Spec:** seções 3.9, 5 (regras do kit: publicação), 7.1 item 9.

**Files:**
- Create: `K/lib/token.js`, `K/authorize.js`, `K/publicar.js`, `K/publicar.sh`
- Test: `K/test/publicar.test.js`

**Interfaces:**
- Consumes: `lib/gate.js` (`verificar`, `antesDe`, `fluxo`), `lib/fsx.js`, `check-assets.js` por CLI (Task 6; o teste desta tarefa não cria `inventario-assets.md`, então o desvio fica inerte até lá).
- Produces:
  - `lib/token.js`: `ARQ = ".autorizacao"`, `lerToken(dir) -> obj|null`, `gravarToken(dir, tok)`, `normDestino(d) -> string` (caminho absoluto, ou o texto `host:caminho` se remoto), `validarToken(tok, {fase, acao, destino, hash, agora?}) -> string|null` (mensagem de erro ou `null`).
  - CLI `node authorize.js --cliente <nome> --fase <nome> --acao <acao> --destino <destino>` (rodado pelo Felipe com `!`).
  - CLI `bash publicar.sh --root <dir> --dest <destino> --cliente <nome> [--executar] [--dry-run]`: **dry-run é o padrão**; só executa com `--executar` e token válido. Desvio deliberado do spec (que escreve só `[--dry-run]`): a flag positiva torna a execução explícita.
  - Variável de teste `PUBLICAR_FALHA_APOS=copia|swap` simula falha.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/publicar.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { tmpRaiz, novoCliente, escreveArtefato, run, KIT } from "./helpers.js";

const FM = (fase, extra = {}) => ({ schema_version: 1, fase, aprovado: false, ...extra });

function cenario() {
  const raiz = tmpRaiz();
  const dir = novoCliente(raiz);
  const conv = (arq, fase) => { const f = escreveArtefato(dir, arq, FM(fase)); run("approve.js", ["--file", f, "--fase", fase, "--via", "conversa", "--citacao", "sim"], { raiz }); return f; };
  conv("01-negocio-e-escopo.md", "descoberta"); conv("direcao-visual.md", "direcao-visual"); conv("plano.md", "plano");
  const pub = escreveArtefato(dir, "publicacao.md", FM("publicacao"));
  run("approve.js", ["--file", pub, "--fase", "publicacao", "--via", "comando"], { raiz });
  const site = path.join(tmpRaiz(), "site"); fs.mkdirSync(site);
  fs.writeFileSync(path.join(site, "index.html"), "<h1>novo</h1>");
  const destPai = tmpRaiz(); const dest = path.join(destPai, "www");
  return { raiz, dir, pub, site, dest, destPai };
}
const auth = (c, destino = c.dest) => run("authorize.js", ["--cliente", "cli-teste", "--fase", "publicacao", "--acao", "publicar", "--destino", destino], { raiz: c.raiz });
const pub = (c, extra = [], env = {}) => run("publicar.js", ["--root", c.site, "--dest", c.dest, "--cliente", "cli-teste", ...extra], { raiz: c.raiz, env });

test("dry-run é o padrão: não escreve nada e mostra backup e reversão", () => {
  const c = cenario();
  const r = pub(c);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /DRY-RUN/);
  assert.match(r.out, /reverter/);
  assert.equal(fs.existsSync(c.dest), false);
});

test("--executar sem token → 7; com token → publica, faz backup, consome o token", () => {
  const c = cenario();
  fs.mkdirSync(c.dest); fs.writeFileSync(path.join(c.dest, "index.html"), "velho");
  assert.equal(pub(c, ["--executar"]).code, 7);
  assert.equal(auth(c).code, 0);
  const r = pub(c, ["--executar"]);
  assert.equal(r.code, 0, r.err);
  assert.equal(fs.readFileSync(path.join(c.dest, "index.html"), "utf8"), "<h1>novo</h1>");
  const baks = fs.readdirSync(c.destPai).filter((n) => n.startsWith("www.bak-"));
  assert.equal(baks.length, 1);
  assert.equal(fs.readFileSync(path.join(c.destPai, baks[0], "index.html"), "utf8"), "velho");
  assert.equal(pub(c, ["--executar"]).code, 7, "token de uso único");
  assert.match(fs.readFileSync(path.join(c.dir, "auditoria.log"), "utf8"), /"op":"publicar"/);
});

test("token para outro destino, expirado ou com artefato alterado → recusa", () => {
  const c = cenario();
  assert.equal(auth(c, path.join(c.destPai, "outro")).code, 0);
  assert.equal(pub(c, ["--executar"]).code, 7);
  assert.equal(auth(c).code, 0);
  const tf = path.join(c.dir, ".autorizacao");
  const t = JSON.parse(fs.readFileSync(tf, "utf8")); t.expira = new Date(Date.now() - 1000).toISOString();
  fs.writeFileSync(tf, JSON.stringify(t));
  assert.equal(pub(c, ["--executar"]).code, 7);
  assert.equal(auth(c).code, 0);
  fs.appendFileSync(c.pub, "\nmudou depois\n");
  assert.notEqual(pub(c, ["--executar"]).code, 0);
});

test("PENDENTE no site → 1 (mesmo em dry-run)", () => {
  const c = cenario();
  fs.writeFileSync(path.join(c.site, "index.html"), "<p>Endereço: PENDENTE</p>");
  assert.equal(pub(c).code, 1);
});

test("authorize recusa fase de baixo risco e fase não aprovada", () => {
  const c = cenario();
  assert.equal(run("authorize.js", ["--cliente", "cli-teste", "--fase", "plano", "--acao", "x", "--destino", c.dest], { raiz: c.raiz }).code, 4);
  run("approve.js", ["--file", c.pub, "--fase", "publicacao", "--via", "comando", "--reabrir"], { raiz: c.raiz });
  assert.notEqual(auth(c).code, 0);
});

test("falha simulada após a cópia: destino antigo intacto e sem sobras", () => {
  const c = cenario();
  fs.mkdirSync(c.dest); fs.writeFileSync(path.join(c.dest, "index.html"), "velho");
  auth(c);
  const r = pub(c, ["--executar"], { PUBLICAR_FALHA_APOS: "copia" });
  assert.equal(r.code, 1);
  assert.equal(fs.readFileSync(path.join(c.dest, "index.html"), "utf8"), "velho");
  assert.deepEqual(fs.readdirSync(c.destPai).filter((n) => n !== "www"), []);
});

test("falha simulada no swap: destino antigo é restaurado", () => {
  const c = cenario();
  fs.mkdirSync(c.dest); fs.writeFileSync(path.join(c.dest, "index.html"), "velho");
  auth(c);
  const r = pub(c, ["--executar"], { PUBLICAR_FALHA_APOS: "swap" });
  assert.equal(r.code, 1);
  assert.equal(fs.readFileSync(path.join(c.dest, "index.html"), "utf8"), "velho");
  assert.match(fs.readFileSync(path.join(c.dir, "auditoria.log"), "utf8"), /publicar-falhou/);
});

test("destino remoto (host:caminho) não executa: imprime os passos manuais", () => {
  const c = cenario();
  const r = run("publicar.js", ["--root", c.site, "--dest", "servidor:/var/www/x", "--cliente", "cli-teste", "--executar"], { raiz: c.raiz });
  assert.equal(r.code, 0);
  assert.match(r.out, /rsync/);
  assert.match(r.out, /não executo destino remoto/);
});

test("publicar.sh repassa os argumentos", () => {
  const c = cenario();
  const r = spawnSync("bash", [path.join(KIT, "publicar.sh"), "--root", c.site, "--dest", c.dest, "--cliente", "cli-teste"], { encoding: "utf8", env: { ...process.env, CRIAR_SITE_ROOT: c.raiz } });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /DRY-RUN/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/publicar.test.js"`
Expected: FAIL (scripts inexistentes).

- [ ] **Step 3: Implementar**

```js
// lib/token.js
import fs from "node:fs";
import path from "node:path";
import { escreverAtomico } from "./fsx.js";

export const ARQ = ".autorizacao";
const REMOTO = /^[^/.][^/]*:/;

export const normDestino = (d) => (REMOTO.test(d) ? d : path.resolve(d));
export const ehRemoto = (d) => REMOTO.test(d);

export function lerToken(dir) {
  const f = path.join(dir, ARQ);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

export function gravarToken(dir, tok) {
  escreverAtomico(path.join(dir, ARQ), JSON.stringify(tok, null, 2));
}

export function validarToken(tok, { fase, acao, destino, hash, agora = Date.now() }) {
  if (!tok) return "sem autorização: peça ao Felipe para rodar authorize.js";
  if (tok.usado) return "autorização já foi usada";
  if (!(Date.parse(tok.expira) >= agora)) return "autorização expirada";
  if (tok.fase !== fase || tok.acao !== acao) return "autorização é de outra fase ou ação";
  if (tok.destino !== destino) return `autorização é para outro destino (${tok.destino})`;
  if (tok.hash !== hash) return "o artefato mudou depois da autorização";
  return null;
}
```

```js
// authorize.js
import path from "node:path";
import { randomBytes } from "node:crypto";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, auditar } from "./lib/fsx.js";
import { fluxo, verificar } from "./lib/gate.js";
import { gravarToken, normDestino } from "./lib/token.js";

const USO = "uso: node authorize.js --cliente <nome> --fase <nome> --acao <acao> --destino <destino>\nRodado pelo Felipe (com '!'). Grava um token de uso único, válido por 15 minutos, amarrado ao hash atual da fase e ao destino exato.";

executar(() => {
  const v = cli({ cliente: { required: true }, fase: { required: true }, acao: { required: true }, destino: { required: true } }, USO);
  const def = fluxo.fases[v.fase];
  if (!def?.alto_risco) throw new Falha(EXIT.INVALID, "authorize só vale para fases de alto risco");
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
  const r = verificar(path.join(dir, def.arquivo), v.fase);
  if (r.codigo !== EXIT.OK) throw new Falha(r.codigo, `fase não está pronta: ${r.msg}`);
  const destino = normDestino(v.destino);
  const agora = Date.now();
  const tok = { id: randomBytes(6).toString("hex"), fase: v.fase, acao: v.acao, destino, hash: r.hash, criada: new Date(agora).toISOString(), expira: new Date(agora + 15 * 60 * 1000).toISOString(), usado: false };
  comTrava(dir, "estado", () => {
    gravarToken(dir, tok);
    auditar(dir, { op: "authorize", fase: v.fase, hash: r.hash, destino, id: tok.id, via: "comando" });
  });
  console.log(`autorização ${tok.id}: ${v.acao} em ${destino}, válida por 15 minutos, uso único`);
});
```

```js
// publicar.js
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, auditar } from "./lib/fsx.js";
import { fluxo, verificar, antesDe } from "./lib/gate.js";
import { lerToken, gravarToken, validarToken, normDestino, ehRemoto } from "./lib/token.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const USO = "uso: bash publicar.sh --root <dir-do-site> --dest <diretório|host:caminho> --cliente <nome> [--executar] [--dry-run]\nSem --executar (ou com --dry-run) só valida e mostra o plano. --executar exige token de authorize.js. Destino remoto: só imprime os passos manuais.";

function arquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc); else acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, dest: { required: true }, cliente: { required: true }, executar: { type: "boolean" }, "dry-run": { type: "boolean" } }, USO);
  const executando = v.executar && !v["dry-run"];
  const root = path.resolve(v.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Falha(EXIT.MISSING, `--root não é diretório: ${root}`);
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }

  const todos = arquivos(root);
  const comPendente = todos.filter((f) => /\.(html|css|js|json|txt|xml)$/.test(f) && /PENDENTE/.test(fs.readFileSync(f, "utf8")));
  if (comPendente.length) throw new Falha(EXIT.FAIL, `REPROVADO: PENDENTE no site: ${comPendente.map((f) => path.relative(root, f)).join(", ")}`);

  const pre = antesDe(dir, "publicacao");
  if (pre.codigo !== EXIT.OK) throw new Falha(pre.codigo, `REPROVADO: ${pre.msg}`);
  const g = verificar(path.join(dir, fluxo.fases.publicacao.arquivo), "publicacao");
  if (g.codigo !== EXIT.OK) throw new Falha(g.codigo, `REPROVADO: ${g.msg}`);

  if (fs.existsSync(path.join(dir, "inventario-assets.md"))) {
    const r = spawnSync("node", [path.join(aqui, "check-assets.js"), "--root", dir, "--fase", "publicacao", "--site", root], { encoding: "utf8", env: process.env });
    if (r.status !== 0) throw new Falha(EXIT.FAIL, `REPROVADO: check-assets\n${r.stdout}${r.stderr}`);
  }

  const destino = normDestino(v.dest);
  const ts = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const bak = `${destino}.bak-${ts}`;
  const reversao = `rm -rf '${destino}' && mv '${bak}' '${destino}'`;

  if (ehRemoto(v.dest)) {
    const [host, caminho] = [v.dest.split(":")[0], v.dest.slice(v.dest.indexOf(":") + 1)];
    console.log(`não executo destino remoto. Passos manuais (Felipe):\n  1. ssh ${host} "cp -a '${caminho}' '${caminho}.bak-${ts}'"\n  2. rsync -a --delete '${root}/' '${v.dest}/'\n  3. node check-cache.js --url <https://dominio>\n  reverter: ssh ${host} "rm -rf '${caminho}' && mv '${caminho}.bak-${ts}' '${caminho}'"`);
    return;
  }
  if (!fs.existsSync(path.dirname(destino))) throw new Falha(EXIT.MISSING, `diretório pai do destino não existe: ${path.dirname(destino)}`);

  if (!executando) {
    console.log(`DRY-RUN: ${todos.length} arquivos de ${root} → ${destino}\n  backup: ${fs.existsSync(destino) ? bak : "(destino novo, sem backup)"}\n  reverter: ${reversao}\n  para executar: authorize.js (Felipe) e depois --executar`);
    return;
  }

  const erro = validarToken(lerToken(dir), { fase: "publicacao", acao: "publicar", destino, hash: g.hash });
  if (erro) throw new Falha(EXIT.FORBIDDEN, erro);
  comTrava(dir, "estado", () => gravarToken(dir, { ...lerToken(dir), usado: true, usado_em: new Date().toISOString() }));

  const novo = `${destino}.novo-${ts}`;
  const existia = fs.existsSync(destino);
  try {
    fs.cpSync(root, novo, { recursive: true });
    if (process.env.PUBLICAR_FALHA_APOS === "copia") throw new Error("falha simulada após a cópia");
    if (existia) fs.renameSync(destino, bak);
    if (process.env.PUBLICAR_FALHA_APOS === "swap") throw new Error("falha simulada no swap");
    fs.renameSync(novo, destino);
  } catch (e) {
    if (existia && fs.existsSync(bak) && !fs.existsSync(destino)) fs.renameSync(bak, destino);
    fs.rmSync(novo, { recursive: true, force: true });
    auditar(dir, { op: "publicar-falhou", fase: "publicacao", hash: g.hash, destino, motivo: e.message });
    throw new Falha(EXIT.FAIL, `publicação falhou e foi revertida: ${e.message}`);
  }
  auditar(dir, { op: "publicar", fase: "publicacao", hash: g.hash, destino, backup: existia ? bak : null });
  console.log(`publicado em ${destino}\n  backup: ${existia ? bak : "(nenhum)"}\n  reverter: ${reversao}\n  agora: node check-cache.js --url <https://dominio> e abrir o site publicado`);
});
```

```bash
# publicar.sh
#!/usr/bin/env bash
# Wrapper: a lógica e os testes vivem em publicar.js.
# Uso: bash publicar.sh --root <dir> --dest <destino> --cliente <nome> [--executar] [--dry-run]
set -euo pipefail
exec node "$(dirname "$0")/publicar.js" "$@"
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/publicar.test.js"`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -10`
Expected: 0 falhas.

---

## Task 5: `check-refs`, `check-contrast`, `check-content` (parametrizados) e integração com os sites reais

**Spec:** seção 5 (tabela do kit), 7.1 itens 4 e 8.

**Files:**
- Create: `K/check-refs.js`, `K/check-contrast.js`, `K/check-content.js`
- Test: `K/test/checks.test.js`

**Interfaces:**
- Consumes: `lib/args.js`.
- Produces:
  - `node check-refs.js --root <dir> [--html <arquivo>...]` → `N referências, M faltando`; sai `1` se faltar.
  - `node check-contrast.js --css <arquivo.css> --pairs <pares.json> [--min <n>]`; `pares.json = [{"nome","fg","bg","min"?}]`.
  - `node check-content.js --root <dir-do-site> --rules <regras.json> [--segredos <dir>]`; `regras.json = {"proibidos":[{"re","msg","flags"?}],"obrigatorios":[{"contem","msg"}]}`.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/checks.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tmpRaiz, run } from "./helpers.js";

const site = (arquivos) => {
  const d = tmpRaiz();
  for (const [n, c] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(d, n)), { recursive: true }); fs.writeFileSync(path.join(d, n), c); }
  return d;
};

test("check-refs: tudo existe → 0; falta imagem, srcset, url() e import → 1 listando cada um", () => {
  const ok = site({ "index.html": '<img src="img/a.webp" srcset="img/a.webp 1x, img/b.webp 2x"><a href="#x">', "img/a.webp": "x", "img/b.webp": "x", "css/s.css": "a{background:url(../img/a.webp)}", "js/m.js": 'import "./u.js"', "js/u.js": "" });
  assert.equal(run("check-refs.js", ["--root", ok]).code, 0);
  const ruim = site({ "index.html": '<img src="img/falta.webp" srcset="img/falta2.webp 1x"><link href="css/s.css">', "css/s.css": "a{background:url(../img/nao.png)}", "js/m.js": 'import "./nao.js"' });
  const r = run("check-refs.js", ["--root", ruim]);
  assert.equal(r.code, 1);
  for (const f of ["img/falta.webp", "img/falta2.webp", "img/nao.png", "js/nao.js"]) assert.match(r.err, new RegExp(f.replace(".", "\\.")));
});

test("check-refs: ignora links externos, mailto, tel, data: e âncoras; aceita caminho com espaço e acento", () => {
  const d = site({ "index.html": '<a href="https://x.com">a</a><a href="mailto:a@b.c">b</a><a href="tel:1">c</a><img src="data:image/png;base64,AA"><img src="img/foto%20café.jpg">', "img/foto café.jpg": "x" });
  assert.equal(run("check-refs.js", ["--root", d]).code, 0);
});

test("check-refs: raiz inexistente → 3; sem --root → 2", () => {
  assert.equal(run("check-refs.js", ["--root", "/nao/existe"]).code, 3);
  assert.equal(run("check-refs.js", []).code, 2);
});

const pares = (d, lista) => { const f = path.join(d, "pares.json"); fs.writeFileSync(f, JSON.stringify(lista)); return f; };

test("check-contrast: passa com contraste suficiente, reprova abaixo do mínimo e par obsoleto", () => {
  const d = tmpRaiz();
  fs.writeFileSync(path.join(d, "s.css"), ":root{--fg:#2A2623;--bg:#F6F1E9;--claro:#CCCCCC;--branco:#fff}");
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "texto", fg: "#2A2623", bg: "#F6F1E9" }])]).code, 0);
  const r = run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "fraco", fg: "#CCCCCC", bg: "#FFF" }])]);
  assert.equal(r.code, 1);
  assert.match(r.out, /FALHA/);
  const obsoleto = run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "x", fg: "#123456", bg: "#F6F1E9" }])]);
  assert.equal(obsoleto.code, 1);
  assert.match(obsoleto.err + obsoleto.out, /não aparece no CSS/);
});

test("check-contrast: --min global e min por par; hex inválido → 4", () => {
  const d = tmpRaiz();
  fs.writeFileSync(path.join(d, "s.css"), "a{color:#767676;background:#fff}");
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "#767676", bg: "#FFFFFF" }]), "--min", "4.5"]).code, 0);
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "#767676", bg: "#FFFFFF", min: 7 }])]).code, 1);
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "azul", bg: "#FFFFFF" }])]).code, 4);
});

const regras = (d, r) => { const f = path.join(d, "regras.json"); fs.writeFileSync(f, JSON.stringify(r)); return f; };

test("check-content: proibidos, obrigatórios, PENDENTE exposto, img sem alt, JSON-LD inválido, description longa", () => {
  const html = `<html><head><meta name="description" content="${"x".repeat(170)}"><script type="application/ld+json">{quebrado</script></head><body><p>lorem ipsum</p><p>Endereço: PENDENTE</p><img src="a.png"></body></html>`;
  const d = site({ "index.html": html });
  const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/5511999999999", msg: "wa.me ausente" }] });
  const r = run("check-content.js", ["--root", d, "--rules", f]);
  assert.equal(r.code, 1);
  for (const m of ["lorem", "wa.me ausente", "PENDENTE", "sem alt", "JSON-LD", "description"]) assert.match(r.err, new RegExp(m));
});

test("check-content: página correta passa; alt vazio (decorativa) é aceito", () => {
  const d = site({ "index.html": '<html><head><meta name="description" content="curta"></head><body><a href="https://wa.me/5511999999999">zap</a><img src="a.png" alt=""></body></html>' });
  const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/5511999999999", msg: "wa" }] });
  assert.equal(run("check-content.js", ["--root", d, "--rules", f]).code, 0);
});

test("check-content --segredos: acha chave/token/senha com valor; ignora a palavra sozinha", () => {
  const d = site({ "index.html": '<p>ok</p>' });
  const f = regras(d, { proibidos: [], obrigatorios: [] });
  const dados = site({ "notas.md": "A senha do painel será trocada. Sem valor aqui." });
  assert.equal(run("check-content.js", ["--root", d, "--rules", f, "--segredos", dados]).code, 0);
  fs.writeFileSync(path.join(dados, ".env"), "API_KEY=abcdef1234567890\n");
  fs.writeFileSync(path.join(dados, "chave.md"), "ghp_" + "a".repeat(36));
  const r = run("check-content.js", ["--root", d, "--rules", f, "--segredos", dados]);
  assert.equal(r.code, 1);
  assert.match(r.err, /segredo/);
});

// Integração com os sites reais já entregues (site-base dos clientes anteriores). As imagens não foram copiadas para site-base.
const CRIAR = path.join(os.homedir(), "projetos", "criar-site");
for (const cliente of ["cliente-b", "cliente-c"]) {
  test(`integração ${cliente}: check-refs conta referências e só reclama de arquivos que não foram copiados`, (t) => {
    const base = path.join(CRIAR, cliente, "scripts", "site-base");
    if (!fs.existsSync(base)) return t.skip("site-base ausente");
    const r = run("check-refs.js", ["--root", base]);
    const m = r.out.match(/(\d+) referências, (\d+) faltando/);
    assert.ok(m, r.out + r.err);
    assert.ok(Number(m[1]) >= 20);
    for (const l of r.err.split("\n").filter((x) => x.startsWith("FALTA"))) assert.match(l, /FALTA (img\/|fonts\/|[^/ ]+\.png)/, l);
  });
  test(`integração ${cliente}: check-content aplica as regras genéricas e não trava`, (t) => {
    const base = path.join(CRIAR, cliente, "scripts", "site-base");
    if (!fs.existsSync(base)) return t.skip("site-base ausente");
    const d = tmpRaiz();
    const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/", msg: "wa.me ausente" }] });
    assert.equal(run("check-content.js", ["--root", base, "--rules", f]).code, 0);
  });
}
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/checks.test.js"`
Expected: FAIL (scripts inexistentes).

- [ ] **Step 3: Implementar**

```js
// check-refs.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-refs.js --root <dir> [--html <arquivo>...]\nConfere que todo arquivo citado em HTML (src, href, srcset, data-grande, poster), CSS (url()) e JS (import estático) existe. --html padrão: index.html.\nNÃO prova que cada link leva ao destino certo.";
const EXTERNA = /^(https?:|mailto:|tel:|data:|#|\/\/|javascript:)/;

function varre(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varre(p, acc); else acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, html: { multiple: true } }, USO);
  const root = path.resolve(v.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Falha(EXIT.MISSING, `--root não é diretório: ${root}`);
  const refs = new Map();
  const add = (ref, origem, base) => {
    if (!ref || EXTERNA.test(ref.trim())) return;
    const limpo = ref.trim().split("#")[0].split("?")[0];
    if (!limpo) return;
    let dec = limpo;
    try { dec = decodeURI(limpo); } catch { /* usa o texto cru */ }
    refs.set(dec.startsWith("/") ? path.join(root, dec) : path.resolve(base, dec), origem);
  };
  for (const h of v.html?.length ? v.html : ["index.html"]) {
    const f = path.join(root, h);
    if (!fs.existsSync(f)) throw new Falha(EXIT.MISSING, `html ausente: ${h}`);
    const t = fs.readFileSync(f, "utf8");
    for (const m of t.matchAll(/\b(?:src|href|data-grande|poster)="([^"]+)"/g)) add(m[1], h, path.dirname(f));
    for (const m of t.matchAll(/\bsrcset="([^"]+)"/g)) for (const p of m[1].split(",")) add(p.trim().split(/\s+/)[0], `${h} srcset`, path.dirname(f));
  }
  for (const f of varre(root)) {
    const rel = path.relative(root, f);
    if (f.endsWith(".css")) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(m[1], rel, path.dirname(f));
    } else if (/\.(js|mjs)$/.test(f)) {
      const t = fs.readFileSync(f, "utf8");
      for (const m of t.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["'](\.[^"']+)["']/g)) add(m[1], rel, path.dirname(f));
    }
  }
  let faltando = 0;
  for (const [p, origem] of refs) {
    if (!fs.existsSync(p)) { console.error(`FALTA ${path.relative(root, p)} <- ${origem}`); faltando++; }
  }
  console.log(`${refs.size} referências, ${faltando} faltando`);
  if (faltando) throw new Falha(EXIT.FAIL, "REPROVADO: referências faltando");
});
```

```js
// check-contrast.js
import fs from "node:fs";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-contrast.js --css <arquivo.css> --pairs <pares.json> [--min <número>]\npares.json: [{\"nome\":\"texto no fundo\",\"fg\":\"#RRGGBB\",\"bg\":\"#RRGGBB\",\"min\":4.5}]\nCores que não aparecem no CSS reprovam (par obsoleto). NÃO prova que a página inteira é acessível.";

const hex = (c) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c));
  if (!m) throw new Falha(EXIT.INVALID, `cor inválida: ${c}`);
  const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1];
  return `#${h.toLowerCase()}`;
};
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const expande = (css) => css.toLowerCase().replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/g, "#$1$1$2$2$3$3");

executar(() => {
  const v = cli({ css: { required: true }, pairs: { required: true }, min: {} }, USO);
  if (!fs.existsSync(v.css)) throw new Falha(EXIT.MISSING, `css ausente: ${v.css}`);
  if (!fs.existsSync(v.pairs)) throw new Falha(EXIT.MISSING, `pares ausente: ${v.pairs}`);
  const css = expande(fs.readFileSync(v.css, "utf8"));
  const padrao = v.min ? Number(v.min) : 4.5;
  let pares;
  try { pares = JSON.parse(fs.readFileSync(v.pairs, "utf8")); } catch (e) { throw new Falha(EXIT.INVALID, `pares.json inválido: ${e.message}`); }
  let falhou = false;
  for (const p of pares) {
    const fg = hex(p.fg), bg = hex(p.bg);
    for (const c of [fg, bg]) if (!css.includes(c)) { console.error(`FALHA ${p.nome}: ${c} não aparece no CSS (par obsoleto)`); falhou = true; }
    const min = p.min ?? padrao;
    const r = razao(fg, bg);
    const ok = r >= min;
    if (!ok) falhou = true;
    console.log(`${ok ? "OK   " : "FALHA"} ${r.toFixed(2)} (min ${min})  ${p.nome}`);
  }
  if (falhou) throw new Falha(EXIT.FAIL, "REPROVADO: contraste");
});
```

```js
// check-content.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-content.js --root <dir-do-site> --rules <regras.json> [--segredos <dir>]\nregras.json: {\"proibidos\":[{\"re\":\"regex\",\"msg\":\"...\",\"flags\":\"i\"}],\"obrigatorios\":[{\"contem\":\"texto\",\"msg\":\"...\"}]}\nEmbutido: PENDENTE exposto, <img> sem alt (alt=\"\" é aceito), JSON-LD inválido, meta description > 160. --segredos varre a pasta por padrões de chave/token/senha. NÃO prova ausência de dado sensível fora dos padrões.";
const SEGREDOS = [
  [/AKIA[0-9A-Z]{16}/, "chave AWS"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "chave privada"],
  [/gh[pousr]_[A-Za-z0-9]{36}/, "token GitHub"],
  [/\bsk-[A-Za-z0-9]{20,}/, "chave sk-"],
  [/xox[abp]-[A-Za-z0-9-]{10,}/, "token Slack"],
  [/(?:senha|password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-./+=]{8,}/i, "credencial com valor"],
];

function varre(dir, ext, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varre(p, ext, acc); else if (!ext || ext.test(e.name)) acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, rules: { required: true }, segredos: {} }, USO);
  if (!fs.existsSync(v.root)) throw new Falha(EXIT.MISSING, `--root ausente: ${v.root}`);
  let regras;
  try { regras = JSON.parse(fs.readFileSync(v.rules, "utf8")); } catch (e) { throw new Falha(EXIT.INVALID, `regras.json inválido: ${e.message}`); }
  const erros = [];
  for (const f of varre(v.root, /\.html$/)) {
    const rel = path.relative(v.root, f);
    const html = fs.readFileSync(f, "utf8");
    for (const r of regras.proibidos ?? []) if (new RegExp(r.re, r.flags ?? "i").test(html)) erros.push(`${rel}: ${r.msg}`);
    if (/PENDENTE/.test(html)) erros.push(`${rel}: PENDENTE exposto no site`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt\s*=/.test(m[0])) erros.push(`${rel}: img sem alt: ${m[0].slice(0, 60)}`);
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { erros.push(`${rel}: JSON-LD inválido`); } }
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (desc !== undefined && desc.length > 160) erros.push(`${rel}: meta description com ${desc.length} caracteres (máx 160)`);
    if (path.basename(f) === "index.html") for (const o of regras.obrigatorios ?? []) if (!html.includes(o.contem)) erros.push(`${rel}: ${o.msg}`);
  }
  if (v.segredos) {
    if (!fs.existsSync(v.segredos)) throw new Falha(EXIT.MISSING, `--segredos ausente: ${v.segredos}`);
    for (const f of varre(v.segredos, /\.(md|json|txt|env|js|mjs|html|sh|ya?ml)$|^\.env/)) {
      const t = fs.readFileSync(f, "utf8");
      for (const [re, nome] of SEGREDOS) if (re.test(t)) erros.push(`segredo (${nome}) em ${path.relative(v.segredos, f)}`);
    }
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s)`); }
  console.log("check-content: ok");
});
```

Nota sobre `.env`: a expressão `/\.(…|env|…)$|^\.env/` casa `.env` pelo segundo ramo; o teste de segredos cobre isso.

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/checks.test.js"`
Expected: PASS. Se a integração com um `site-base` real expuser uma referência faltando que **não** é de `img/`, `fonts/` ou `.png` na raiz, não afrouxar a regex: investigar e registrar (pode ser um bug real do script ou um achado do site).

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -10`
Expected: 0 falhas.

---

## Task 6: `check-assets` (inventário, hash, direitos, `--site`)

**Spec:** seção 3.7, 7.1 item 4.

**Files:**
- Create: `K/check-assets.js`
- Test: `K/test/assets.test.js`

**Interfaces:**
- Consumes: `lib/args.js`, `lib/fsx.js` (`dentroDe`, `escreverAtomico`, `comTrava`), `lib/hash.js` (`sha256`).
- Produces: `node check-assets.js --root <cliente> [--fase descoberta|direcao-visual|publicacao] [--site <dir>] [--gravar-hash]`. Lê `<root>/inventario-assets.md` (tabela Markdown com as colunas `ID | Caminho | Tipo | Status | Alt-text | Uso | Direitos | Origem | Sha256 | Site | Obs`; `Obs` opcional). `Site` lista os caminhos publicados no site (separados por espaço). Códigos: `0` ok, `1` reprovado, `3` inventário ausente, `4` tabela malformada.
  - Vocabulários: `Status` ∈ {`pendente`,`referencia`,`disponivel`,`aprovado`,`rejeitado`}; `Direitos` ∈ {`confirmados`,`pendentes`,`nao-autorizados`,`n/a`}; `Tipo` ∈ {`logo`,`foto`,`icone`,`video`,`fonte`,`documento`}.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/assets.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const CAB = "| ID | Caminho | Tipo | Status | Alt-text | Uso | Direitos | Origem | Sha256 | Site | Obs |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
const linha = (o) => `| ${o.id ?? "A-001"} | ${o.caminho ?? "fontes/logo.svg"} | ${o.tipo ?? "logo"} | ${o.status ?? "aprovado"} | ${o.alt ?? "Logo X"} | ${o.uso ?? "header"} | ${o.direitos ?? "confirmados"} | ${o.origem ?? "cliente, WhatsApp 15/10"} | ${o.sha ?? ""} | ${o.site ?? ""} | |\n`;

function setup(linhas, arquivos = { "fontes/logo.svg": "<svg/>" }) {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  for (const [n, c] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true }); fs.writeFileSync(path.join(dir, n), c); }
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), `# Inventário\n\n${CAB}${linhas.join("")}`);
  return { raiz, dir };
}
const rodar = (s, extra = []) => run("check-assets.js", ["--root", s.dir, ...extra], { raiz: s.raiz });

test("inventário válido passa; hash ausente em aprovado é cobrado e --gravar-hash resolve", () => {
  const s = setup([linha({})]);
  assert.equal(rodar(s).code, 1);
  assert.match(rodar(s).err, /sem hash/);
  assert.equal(rodar(s, ["--gravar-hash"]).code, 0);
  assert.equal(rodar(s).code, 0);
});

test("arquivo alterado depois da aprovação → desatualizado", () => {
  const s = setup([linha({})]);
  rodar(s, ["--gravar-hash"]);
  fs.writeFileSync(path.join(s.dir, "fontes/logo.svg"), "<svg>mudou</svg>");
  const r = rodar(s);
  assert.equal(r.code, 1);
  assert.match(r.err, /desatualizado/);
});

test("arquivo inexistente, caminho com .., caminho absoluto e link simbólico para fora → reprova", () => {
  for (const caminho of ["fontes/nao.png", "../fora.png", "/etc/hostname"]) {
    const s = setup([linha({ caminho, tipo: "foto" })]);
    assert.equal(rodar(s).code, 1, caminho);
  }
  const s = setup([linha({ caminho: "fontes/link.png", tipo: "foto", status: "disponivel" })]);
  const fora = tmpRaiz(); fs.writeFileSync(path.join(fora, "x.png"), "x");
  fs.symlinkSync(path.join(fora, "x.png"), path.join(s.dir, "fontes/link.png"));
  assert.equal(rodar(s).code, 1);
});

test("id duplicado, status/direitos/tipo inválidos e extensão incompatível → reprova", () => {
  const s = setup([linha({}), linha({ caminho: "fontes/logo.svg" })]);
  assert.match(rodar(s).err, /duplicado/);
  for (const o of [{ status: "ok" }, { direitos: "talvez" }, { tipo: "gif" }, { tipo: "foto", caminho: "fontes/doc.txt" }]) {
    const t = setup([linha(o)], { "fontes/logo.svg": "x", "fontes/doc.txt": "x" });
    assert.equal(rodar(t).code, 1, JSON.stringify(o));
  }
});

test("referência (instagram) não precisa de arquivo; arquivo solto em fontes/ vira aviso, não erro", () => {
  const s = setup([linha({ id: "A-003", caminho: "instagram.com/p/abc", tipo: "foto", status: "referencia", alt: "n/a", uso: "inspiração", direitos: "n/a" }), linha({})], { "fontes/logo.svg": "<svg/>", "fontes/solto.png": "x" });
  rodar(s, ["--gravar-hash"]);
  const r = rodar(s);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /AVISO.*solto\.png/);
});

test("caminho com acento e espaço funciona", () => {
  const s = setup([linha({ caminho: "fontes/foto café.jpg", tipo: "foto" })], { "fontes/foto café.jpg": "x" });
  assert.equal(rodar(s, ["--gravar-hash"]).code, 0);
});

test("tabela malformada (sem cabeçalho, coluna faltando) → 4; inventário ausente → 3", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 3);
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), "# nada de tabela aqui\n");
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 4);
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), "| ID | Caminho |\n|---|---|\n| A-001 | x |\n");
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 4);
});

test("fase direcao-visual: cita id inexistente ou só pendente → reprova", () => {
  const s = setup([linha({})]);
  rodar(s, ["--gravar-hash"]);
  fs.writeFileSync(path.join(s.dir, "direcao-visual.md"), "usa A-001 no header");
  assert.equal(rodar(s, ["--fase", "direcao-visual"]).code, 0);
  fs.writeFileSync(path.join(s.dir, "direcao-visual.md"), "usa A-009 no hero");
  assert.match(rodar(s, ["--fase", "direcao-visual"]).err, /A-009/);
});

test("fase publicacao: direitos pendentes, alt PENDENTE → reprova; decorativa aceita", () => {
  const s = setup([linha({ direitos: "pendentes" })]);
  rodar(s, ["--gravar-hash"]);
  assert.equal(rodar(s, ["--fase", "publicacao"]).code, 1);
  const t = setup([linha({ alt: "PENDENTE" })]); rodar(t, ["--gravar-hash"]);
  assert.equal(rodar(t, ["--fase", "publicacao"]).code, 1);
  const u = setup([linha({ alt: "decorativa" })]); rodar(u, ["--gravar-hash"]);
  assert.equal(rodar(u, ["--fase", "publicacao"]).code, 0);
});

test("--site: imagem do HTML fora do inventário reprova; decorativa exige alt vazio", () => {
  const s = setup([linha({ caminho: "fontes/f.jpg", tipo: "foto", site: "img/f-640.webp", alt: "Fachada" })], { "fontes/f.jpg": "x" });
  rodar(s, ["--gravar-hash"]);
  const site = tmpRaiz(); fs.mkdirSync(path.join(site, "img"));
  fs.writeFileSync(path.join(site, "img/f-640.webp"), "x");
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="Fachada">');
  assert.equal(rodar(s, ["--fase", "publicacao", "--site", site]).code, 0);
  fs.writeFileSync(path.join(site, "img/intruso.webp"), "x");
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="Fachada"><img src="img/intruso.webp" alt="x">');
  assert.match(rodar(s, ["--fase", "publicacao", "--site", site]).err, /intruso/);
  const d = setup([linha({ caminho: "fontes/f.jpg", tipo: "foto", site: "img/f-640.webp", alt: "decorativa" })], { "fontes/f.jpg": "x" });
  rodar(d, ["--gravar-hash"]);
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="descrição">');
  assert.match(rodar(d, ["--fase", "publicacao", "--site", site]).err, /decorativa/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/assets.test.js"`
Expected: FAIL (`check-assets.js` inexistente).

- [ ] **Step 3: Implementar**

```js
// check-assets.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { dentroDe, escreverAtomico, comTrava } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const USO = "uso: node check-assets.js --root <pasta-do-cliente> [--fase descoberta|direcao-visual|publicacao] [--site <dir>] [--gravar-hash]\nValida inventario-assets.md. --fase publicacao exige aprovado, direitos confirmados e alt resolvido; --site confere as imagens do HTML construído contra a coluna Site.\nNÃO substitui abrir e olhar os arquivos.";
const STATUS = ["pendente", "referencia", "disponivel", "aprovado", "rejeitado"];
const DIREITOS = ["confirmados", "pendentes", "nao-autorizados", "n/a"];
const TIPOS = { logo: /\.(svg|png|webp|jpe?g)$/i, foto: /\.(jpe?g|png|webp|avif|gif)$/i, icone: /\.(svg|png|ico|webp)$/i, video: /\.(mp4|webm|mov)$/i, fonte: /\.(woff2?|ttf|otf)$/i, documento: /\.pdf$/i };
const COLUNAS = ["id", "caminho", "tipo", "status", "alt-text", "uso", "direitos", "origem", "sha256", "site"];
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const celulas = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

function lerTabela(md) {
  const linhas = md.replace(/\r\n/g, "\n").split("\n");
  const i = linhas.findIndex((l) => /^\s*\|/.test(l));
  if (i < 0 || !/^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] ?? "")) return null;
  const cab = celulas(linhas[i]).map(norm);
  const falta = COLUNAS.filter((c) => !cab.includes(c));
  if (falta.length) return { falta };
  const rows = [];
  for (let j = i + 2; j < linhas.length && /^\s*\|/.test(linhas[j]); j++) {
    const c = celulas(linhas[j]);
    const o = Object.fromEntries(cab.map((k, n) => [k, (c[n] ?? "").replace(/^`|`$/g, "")]));
    rows.push({ o, linha: j });
  }
  return { linhas, cab, rows };
}

function imagensDoSite(site) {
  const out = new Set();
  const varre = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) varre(p);
      else if (e.name.endsWith(".html")) {
        const t = fs.readFileSync(p, "utf8");
        for (const m of t.matchAll(/<img\b[^>]*>/g)) {
          const alt = /\balt\s*=\s*"([^"]*)"/.exec(m[0])?.[1] ?? null;
          const refs = [];
          const src = /\bsrc\s*=\s*"([^"]+)"/.exec(m[0])?.[1]; if (src) refs.push(src);
          const ss = /\bsrcset\s*=\s*"([^"]+)"/.exec(m[0])?.[1]; if (ss) for (const x of ss.split(",")) refs.push(x.trim().split(/\s+/)[0]);
          for (const r of refs) {
            if (/^(https?:|data:|\/\/)/.test(r)) continue;
            out.add(JSON.stringify({ rel: path.relative(site, path.resolve(path.dirname(p), r.split("?")[0])), alt }));
          }
        }
      }
    }
  };
  varre(site);
  return [...out].map((s) => JSON.parse(s));
}

executar(() => {
  const v = cli({ root: { required: true }, fase: {}, site: {}, "gravar-hash": { type: "boolean" } }, USO);
  const root = path.resolve(v.root);
  const inv = path.join(root, "inventario-assets.md");
  if (!fs.existsSync(inv)) throw new Falha(EXIT.MISSING, `inventário ausente: ${inv}`);
  const bruto = fs.readFileSync(inv, "utf8");
  const tab = lerTabela(bruto);
  if (!tab) throw new Falha(EXIT.INVALID, "tabela do inventário não encontrada (cabeçalho e separador Markdown)");
  if (tab.falta) throw new Falha(EXIT.INVALID, `colunas faltando: ${tab.falta.join(", ")}`);

  const erros = [], avisos = [];
  const ids = new Set();
  const usadosNoInventario = new Set();
  let precisaGravar = false;
  for (const { o, linha } of tab.rows) {
    const q = `${o.id || "(sem id)"}`;
    if (!/^A-\d{3}$/.test(o.id)) erros.push(`${q}: id deve ser A-nnn`);
    if (ids.has(o.id)) erros.push(`${q}: id duplicado`);
    ids.add(o.id);
    if (!STATUS.includes(o.status)) erros.push(`${q}: status inválido '${o.status}'`);
    if (!DIREITOS.includes(o.direitos)) erros.push(`${q}: direitos inválido '${o.direitos}'`);
    if (!TIPOS[o.tipo]) erros.push(`${q}: tipo inválido '${o.tipo}'`);
    if (o.status === "referencia") continue;
    if (!o.caminho || path.isAbsolute(o.caminho) || o.caminho.split(/[\\/]/).includes("..")) { erros.push(`${q}: caminho deve ser relativo e dentro da pasta do cliente ('${o.caminho}')`); continue; }
    const abs = path.join(root, o.caminho);
    usadosNoInventario.add(path.relative(root, abs));
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) { erros.push(`${q}: arquivo não existe: ${o.caminho}`); continue; }
    if (!dentroDe(root, abs)) { erros.push(`${q}: caminho escapa da pasta do cliente: ${o.caminho}`); continue; }
    if (TIPOS[o.tipo] && !TIPOS[o.tipo].test(abs)) erros.push(`${q}: extensão incompatível com tipo '${o.tipo}': ${o.caminho}`);
    const h = sha256(fs.readFileSync(abs));
    if (o.sha256 && o.sha256 !== h) erros.push(`${q}: arquivo desatualizado (hash mudou depois da aprovação): ${o.caminho}`);
    if (!o.sha256 && o.status === "aprovado") {
      if (v["gravar-hash"]) {
        const cab = tab.cab; const c = celulas(tab.linhas[linha]); c[cab.indexOf("sha256")] = h;
        tab.linhas[linha] = `| ${c.join(" | ")} |`; precisaGravar = true;
      } else erros.push(`${q}: aprovado sem hash (rode com --gravar-hash)`);
    }
  }
  if (precisaGravar) comTrava(root, "inventario", () => escreverAtomico(inv, tab.linhas.join("\n"), sha256(bruto)));

  const pasta = path.join(root, "fontes");
  if (fs.existsSync(pasta)) {
    const lista = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? lista(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const f of lista(pasta)) if (!usadosNoInventario.has(path.relative(root, f))) avisos.push(`${path.relative(root, f)} em fontes/ sem linha no inventário`);
  }

  const porId = new Map(tab.rows.map(({ o }) => [o.id, o]));
  if (v.fase === "direcao-visual") {
    const dv = path.join(root, "direcao-visual.md");
    if (fs.existsSync(dv)) for (const id of new Set(fs.readFileSync(dv, "utf8").match(/A-\d{3}/g) ?? [])) {
      const o = porId.get(id);
      if (!o) erros.push(`direcao-visual.md cita ${id}, que não existe no inventário`);
      else if (!["disponivel", "aprovado"].includes(o.status)) erros.push(`direcao-visual.md cita ${id} com status '${o.status}' (precisa estar disponivel ou aprovado)`);
    }
  }
  if (v.fase === "publicacao") {
    for (const { o } of tab.rows) {
      if (o.status !== "aprovado") continue;
      if (o.direitos !== "confirmados") erros.push(`${o.id}: publicação exige direitos confirmados`);
      if (!o["alt-text"] || /^PENDENTE$/i.test(o["alt-text"])) erros.push(`${o.id}: alt-text pendente`);
    }
  }
  if (v.site) {
    const site = path.resolve(v.site);
    const publicados = new Map();
    for (const { o } of tab.rows) for (const s of (o.site ?? "").split(/\s+/).filter(Boolean)) {
      publicados.set(path.normalize(s), o);
      if (!fs.existsSync(path.join(site, s))) erros.push(`${o.id}: coluna Site cita ${s}, que não existe no site`);
    }
    for (const { rel, alt } of imagensDoSite(site)) {
      const o = publicados.get(path.normalize(rel));
      if (!o) { erros.push(`imagem do site fora do inventário: ${rel}`); continue; }
      if (o.status !== "aprovado" || o.direitos !== "confirmados") erros.push(`${o.id}: imagem ${rel} usada no site sem estar aprovada com direitos confirmados`);
      if (norm(o["alt-text"]) === "decorativa" && alt !== "") erros.push(`${o.id}: imagem decorativa deve ter alt="" em ${rel}`);
    }
  }
  for (const a of avisos) console.log(`AVISO ${a}`);
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) no inventário`); }
  console.log(`check-assets: ok (${tab.rows.length} linhas)`);
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/assets.test.js"`
Expected: PASS (com a correção da nota aplicada).

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -10`
Expected: 0 falhas, incluindo `publicar.test.js` (que agora pode invocar `check-assets` quando houver inventário).

---

## Task 7: `check-cache` e `check-page`

**Spec:** seção 3.5, 5 (tabela do kit), 7.1 item 4.

**Files:**
- Create: `K/check-cache.js`, `K/check-page.js`
- Test: `K/test/cache.test.js`, `K/test/page.test.js`

**Interfaces:**
- Consumes: `lib/args.js`.
- Produces:
  - `node check-cache.js --url <https://...> [--paths /,/x] [--timeout <ms>]`: `0` ok; `1` reprovado, **inclusive quando não consegue acessar** (falha segura).
  - `node check-page.js --url <url|arquivo.html> [--larguras 375,1280]`: `0` ok; `10` console/erro de página, `11` requisições falhas, `12` overflow horizontal, `13` foco invisível, `14` nome acessível ausente (sai com o menor código com problema e imprime todos); `20` playwright ou navegador indisponível.

- [ ] **Step 1: Escrever os testes que falham**

```js
// test/cache.test.js
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { run } from "./helpers.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { KIT } from "./helpers.js";

function servidor(rotas) {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      const r = rotas[req.url.split("?")[0]];
      if (!r) { rsp.writeHead(404); return rsp.end("nao"); }
      rsp.writeHead(r.status ?? 200, { "content-type": r.tipo ?? "text/plain", ...(r.cc ? { "cache-control": r.cc } : {}) });
      rsp.end(r.corpo ?? "x");
    });
    s.listen(0, "127.0.0.1", () => res({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}
const rodar = (args) => new Promise((res) => {
  const p = spawn("node", [path.join(KIT, "check-cache.js"), ...args]);
  let out = "", err = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
  p.on("close", (code) => res({ code, out, err }));
});

const HTML = (css = "css/s.css", js = "js/m.js") => `<link rel="stylesheet" href="${css}"><script src="${js}"></script><img src="img/a.webp">`;

test("css/js versionados ou com no-cache passam", async () => {
  const { s, url } = await servidor({
    "/": { tipo: "text/html", cc: "no-cache", corpo: HTML("css/s.css?v=abc", "js/m.js") },
    "/css/s.css": { cc: "public, max-age=31536000" }, "/js/m.js": { cc: "no-cache" }, "/img/a.webp": { cc: "public, max-age=31536000, immutable" },
  });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 0, r.err);
});

test("css sem versão e com cache longo reprova; HTML com cache longo reprova; 404 reprova", async () => {
  const { s, url } = await servidor({
    "/": { tipo: "text/html", cc: "public, max-age=86400", corpo: HTML() },
    "/css/s.css": { cc: "public, max-age=31536000" }, "/js/m.js": { cc: "no-cache" },
  });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 1);
  assert.match(r.err, /css\/s\.css.*sem versão/);
  assert.match(r.err, /HTML com cache longo/);
  assert.match(r.err, /404.*a\.webp/);
});

test("ofuscação de e-mail do Cloudflare no HTML reprova", async () => {
  const { s, url } = await servidor({ "/": { tipo: "text/html", cc: "no-cache", corpo: '<a href="/cdn-cgi/l/email-protection#abc">e</a>' } });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 1);
  assert.match(r.err, /ofuscação de e-mail/);
});

test("servidor inacessível é reprovação (falha segura), nunca aprovação", async () => {
  const r = await rodar(["--url", "http://127.0.0.1:1", "--timeout", "500"]);
  assert.equal(r.code, 1);
  assert.match(r.err, /não foi possível verificar/);
});
```

```js
// test/page.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tmpRaiz, run } from "./helpers.js";

const pagina = (corpo, head = "") => { const d = tmpRaiz(); const f = path.join(d, "index.html"); fs.writeFileSync(f, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}</head><body>${corpo}</body></html>`); return f; };

function chromium() {
  const base = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) { const p = path.join(base, d, sub); if (fs.existsSync(p)) return p; }
  }
}
const rodar = (f, extra = []) => {
  let r = run("check-page.js", ["--url", f, "--larguras", "375,1280", ...extra]);
  if (r.code === 20 && chromium()) r = run("check-page.js", ["--url", f, "--larguras", "375,1280", ...extra], { env: { CHROMIUM_PATH: chromium() } });
  return r;
};

test("página correta passa (0)", (t) => {
  const r = rodar(pagina('<main><h1>Oi</h1><a href="#x">Ir para x</a><button>Enviar</button><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="ponto"></main>'));
  if (r.code === 20) return t.skip(`navegador indisponível: ${r.err}`);
  assert.equal(r.code, 0, r.err + r.out);
});

test("página com problemas: reporta todas as categorias e sai com o menor código (10)", (t) => {
  const f = pagina(
    '<div style="width:2000px">largo</div><a class="sf" href="#a">link</a><button></button><img src="nao-existe.png" alt="x"><script>console.error("quebrou")</script>',
    "<style>.sf:focus,.sf:focus-visible{outline:none;box-shadow:none}</style>"
  );
  const r = rodar(f);
  if (r.code === 20) return t.skip(`navegador indisponível: ${r.err}`);
  assert.equal(r.code, 10, r.err + r.out);
  const tudo = r.err + r.out;
  for (const m of ["console", "falhou|404", "overflow horizontal", "sem foco visível", "sem nome acessível"]) assert.match(tudo, new RegExp(m));
});

test("--url ausente → 2; arquivo inexistente é reprovação", () => {
  assert.equal(run("check-page.js", []).code, 2);
  assert.notEqual(run("check-page.js", ["--url", "/nao/existe.html"]).code, 0);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/cache.test.js" "test/page.test.js"`
Expected: FAIL (scripts inexistentes).

- [ ] **Step 3: Implementar**

```js
// check-cache.js
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-cache.js --url <https://...> [--paths /,/outra] [--timeout <ms>]\nConfere status e cabeçalhos de cache do HTML servido e dos css/js/imagens/fontes que ele cita. Falha ao acessar = reprovado.\nNÃO prova que todos os visitantes recebem a versão nova (cache do navegador e do CDN variam).";
const LONGO = /max-age=(\d+)/;

executar(async () => {
  const v = cli({ url: { required: true }, paths: {}, timeout: {} }, USO);
  const base = new URL(v.url);
  const ms = Number(v.timeout ?? 10000);
  const erros = [];
  const buscar = async (url) => {
    try { return await fetch(url, { signal: AbortSignal.timeout(ms), redirect: "follow" }); }
    catch (e) { throw new Falha(EXIT.FAIL, `REPROVADO: não foi possível verificar ${url}: ${e.cause?.code ?? e.message}`); }
  };
  for (const p of (v.paths ?? "/").split(",")) {
    const r = await buscar(new URL(p, base));
    if (r.status !== 200) { erros.push(`${p}: status ${r.status}`); continue; }
    const cc = r.headers.get("cache-control") ?? "";
    const html = await r.text();
    const max = Number(LONGO.exec(cc)?.[1] ?? 0);
    if (/text\/html/.test(r.headers.get("content-type") ?? "") ) {
      if (max > 3600 && !/must-revalidate|no-cache/.test(cc)) erros.push(`${p}: HTML com cache longo (${cc}); publicação pode não aparecer`);
      if (/cdn-cgi\/l\/email-protection/.test(html)) erros.push(`${p}: ofuscação de e-mail do Cloudflare ativa`);
      const refs = new Set();
      for (const m of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)) {
        if (/^(mailto:|tel:|data:|javascript:)/.test(m[1])) continue;
        const u = new URL(m[1], new URL(p, base));
        if (u.origin === base.origin && /\.(css|js|mjs|webp|avif|png|jpe?g|svg|woff2?)$/i.test(u.pathname)) refs.add(u.href);
      }
      for (const href of refs) {
        const a = await buscar(href);
        const nome = new URL(href).pathname;
        if (a.status !== 200) { erros.push(`${a.status} ${nome}`); continue; }
        const c = a.headers.get("cache-control") ?? "";
        const m = Number(LONGO.exec(c)?.[1] ?? 0);
        if (/\.(css|m?js)$/i.test(nome)) {
          const versionado = new URL(href).searchParams.has("v");
          if (!versionado && m > 0 && !/no-cache|no-store/.test(c)) erros.push(`${nome}: css/js sem versão (?v=) e com cache longo (${c})`);
        } else if (m < 31536000) console.log(`AVISO ${nome}: imagem/fonte sem cache de 1 ano (${c || "sem cache-control"})`);
        console.log(`${a.status} ${nome} cache-control: ${c || "(nenhum)"} cf-cache-status: ${a.headers.get("cf-cache-status") ?? "-"}`);
      }
    }
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) de cache`); }
  console.log("check-cache: ok");
});
```

```js
// check-page.js
import path from "node:path";
import { pathToFileURL } from "node:url";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-page.js --url <url|arquivo.html> [--larguras 375,1280]\nPlaywright: erros de console e de página (10), requisições falhas (11), overflow horizontal (12), foco invisível ao navegar com Tab (13), nome acessível ausente em link/botão/imagem (14). 20 = playwright ou navegador indisponível.\nNÃO substitui a captura da janela nem a inspeção visual. CHROMIUM_PATH aponta para um Chromium alternativo.";

executar(async () => {
  const v = cli({ url: { required: true }, larguras: {} }, USO);
  let pw;
  try { pw = await import("playwright"); } catch { throw new Falha(20, "playwright não instalado: rode `npm install` em assets/kit"); }
  const alvo = /^(https?|file):/.test(v.url) ? v.url : pathToFileURL(path.resolve(v.url)).href;
  let browser;
  try { browser = await pw.chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined }); }
  catch (e) { throw new Falha(20, `navegador indisponível: ${e.message.split("\n")[0]}`); }
  const prob = { 10: [], 11: [], 12: [], 13: [], 14: [] };
  try {
    for (const w of (v.larguras ?? "375,1280").split(",").map(Number)) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
      const page = await ctx.newPage();
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) prob[10].push(`[${w}] console: ${m.text()}`); });
      page.on("pageerror", (e) => prob[10].push(`[${w}] erro de página: ${e.message}`));
      page.on("requestfailed", (r) => prob[11].push(`[${w}] requisição falhou: ${r.url()}`));
      page.on("response", (r) => { if (r.status() >= 400) prob[11].push(`[${w}] ${r.status()} ${r.url()}`); });
      try { await page.goto(alvo, { waitUntil: "networkidle", timeout: 20000 }); }
      catch (e) { throw new Falha(EXIT.FAIL, `REPROVADO: não foi possível abrir ${alvo}: ${e.message.split("\n")[0]}`); }
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 1) prob[12].push(`[${w}] overflow horizontal de ${ov}px`);
      const nomes = await page.evaluate(() => {
        const vis = (e) => e.getClientRects().length > 0 || getComputedStyle(e).position === "fixed";
        const sem = [];
        for (const e of document.querySelectorAll("a[href],button,[role=button]")) {
          if (!vis(e)) continue;
          const nome = e.getAttribute("aria-label") || e.getAttribute("aria-labelledby") || e.textContent.trim() || e.getAttribute("title") || e.querySelector("img[alt]:not([alt=''])");
          if (!nome) sem.push(`${e.tagName.toLowerCase()} ${e.outerHTML.slice(0, 60)}`);
        }
        for (const i of document.querySelectorAll("img:not([alt])")) sem.push(`img sem atributo alt: ${i.outerHTML.slice(0, 60)}`);
        return sem;
      });
      for (const n of nomes) prob[14].push(`[${w}] sem nome acessível: ${n}`);
      const total = await page.evaluate(() => document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])").length);
      for (let i = 0; i < Math.min(total, 40); i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const e = document.activeElement;
          if (!e || e === document.body) return null;
          const cs = getComputedStyle(e);
          const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
          const sombra = cs.boxShadow && cs.boxShadow !== "none";
          return { visivel: outline || sombra, desc: `${e.tagName.toLowerCase()} ${e.outerHTML.slice(0, 50)}` };
        });
        if (info && !info.visivel) prob[13].push(`[${w}] sem foco visível: ${info.desc}`);
      }
      await ctx.close();
    }
  } finally { await browser.close(); }
  const codigos = Object.keys(prob).map(Number).filter((c) => prob[c].length).sort((a, b) => a - b);
  for (const c of codigos) for (const l of [...new Set(prob[c])]) console.error(`[${c}] ${l}`);
  if (codigos.length) throw new Falha(codigos[0], `REPROVADO: ${codigos.length} categoria(s) com problema`);
  console.log("check-page: ok");
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/cache.test.js" "test/page.test.js"`
Expected: `cache.test.js` PASS. `page.test.js` PASS, ou os dois primeiros testes `skipped` com a mensagem "navegador indisponível". **Se pularem, isso é um item não verificado e vai para o relatório final**; tente `npx playwright install chromium` no kit antes de aceitar o skip.

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -12`
Expected: 0 falhas; anotar quantos testes foram `skipped`.

---

## Task 8: `record-feedback` (idempotente, com trava e releitura)

**Spec:** seção 4 (protocolo de seis passos), 7.1 itens 4 e 10.

**Files:**
- Create: `K/record-feedback.js`
- Test: `K/test/feedback.test.js`

**Interfaces:**
- Consumes: `lib/args.js`, `lib/fsx.js`, `lib/hash.js`.
- Produces: `node record-feedback.js --cliente <nome> --entregavel <texto> --escopo <valor> --tipo <explicito|hipotese> [--reacao <texto>] [--hipotese <texto>] [--contexto <texto>] [--licao <texto>] [--evidencia <valor>] [--impacto <valor>] [--ja-aconteceu <texto>]`. Imprime o id (`E07`); sai `0` só se a releitura confirmar a entrada. Escopos: `toda-landing|b2c|b2b|saude-bem-estar|so-este-cliente`. `--tipo explicito` exige `--reacao`; `--tipo hipotese` exige `--hipotese` e **recusa** `--reacao` (hipótese nunca vira citação).

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/feedback.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { tmpRaiz, novoCliente, run, KIT } from "./helpers.js";

const base = ["--cliente", "cli-teste", "--escopo", "toda-landing"];
const rf = (raiz, extra) => run("record-feedback.js", [...base, ...extra], { raiz });
const arq = (dir) => fs.readFileSync(path.join(dir, "02-registro-de-feedback-por-etapa.md"), "utf8");

test("explícito: grava E01 com reação entre aspas, escopo e processado: não", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  const r = rf(raiz, ["--entregavel", "Botão flutuante", "--tipo", "explicito", "--reacao", "ficou feio no celular", "--evidencia", "defeito", "--impacto", "medio"]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /E01/);
  const t = arq(dir);
  assert.match(t, /### E01\. Botão flutuante/);
  assert.match(t, /Reação: "ficou feio no celular"/);
  assert.match(t, /Escopo: toda-landing/);
  assert.match(t, /Evidência: defeito/);
  assert.match(t, /processado: não/);
});

test("idempotente: repetir a mesma reação devolve o mesmo id e não duplica", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  const args = ["--entregavel", "Hero", "--tipo", "explicito", "--reacao", "amei"];
  assert.match(rf(raiz, args).out, /E01/);
  assert.match(rf(raiz, args).out, /E01/);
  assert.equal((arq(dir).match(/^### E\d+\./gm) ?? []).length, 1);
  assert.match(rf(raiz, ["--entregavel", "Hero", "--tipo", "explicito", "--reacao", "outra coisa"]).out, /E02/);
});

test("continua a numeração de um registro existente (E31 → E32)", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  fs.writeFileSync(path.join(dir, "02-registro-de-feedback-por-etapa.md"), "# Registro\n\n### E31. antigo\n- x\n");
  assert.match(rf(raiz, ["--entregavel", "Novo", "--tipo", "explicito", "--reacao", "ok"]).out, /E32/);
});

test("hipótese: vai em Hipótese, nunca em Reação; recusa --reacao junto", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  assert.equal(rf(raiz, ["--entregavel", "Tipografia", "--tipo", "hipotese", "--reacao", "x", "--hipotese", "talvez não goste"]).code, 2);
  assert.equal(rf(raiz, ["--entregavel", "Tipografia", "--tipo", "hipotese", "--hipotese", "talvez não goste da serifa"]).code, 0);
  const t = arq(dir);
  assert.match(t, /Hipótese: talvez não goste da serifa/);
  assert.match(t, /Reação: \(nenhuma citada\)/);
  assert.match(t, /Tipo: hipótese/);
});

test("validações: explícito sem reação, escopo inválido, quebra de linha, cliente inválido", () => {
  const raiz = tmpRaiz(); novoCliente(raiz);
  assert.equal(rf(raiz, ["--entregavel", "A", "--tipo", "explicito"]).code, 2);
  assert.equal(run("record-feedback.js", ["--cliente", "cli-teste", "--escopo", "mundial", "--entregavel", "A", "--tipo", "explicito", "--reacao", "x"], { raiz }).code, 2);
  assert.equal(rf(raiz, ["--entregavel", "A\n### E99. injetado", "--tipo", "explicito", "--reacao", "x"]).code, 2);
  assert.equal(run("record-feedback.js", ["--cliente", "../fora", "--escopo", "b2c", "--entregavel", "A", "--tipo", "explicito", "--reacao", "x"], { raiz }).code, 4);
  assert.equal(run("record-feedback.js", ["--cliente", "nao-existe", "--escopo", "b2c", "--entregavel", "A", "--tipo", "explicito", "--reacao", "x"], { raiz }).code, 4);
});

test("concorrência: 8 gravações simultâneas geram E01..E08 sem repetição", async () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  const lancar = (n) => new Promise((res) => {
    const p = spawn("node", [path.join(KIT, "record-feedback.js"), ...base, "--entregavel", `Item ${n}`, "--tipo", "explicito", "--reacao", `reação ${n}`], { env: { ...process.env, CRIAR_SITE_ROOT: raiz } });
    let out = ""; p.stdout.on("data", (d) => (out += d)); p.on("close", (code) => res({ code, out }));
  });
  const rs = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(lancar));
  assert.ok(rs.every((r) => r.code === 0));
  const ids = (arq(dir).match(/^### E(\d+)\./gm) ?? []).map((l) => Number(l.match(/E(\d+)/)[1])).sort((a, b) => a - b);
  assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8]);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/feedback.test.js"`
Expected: FAIL (`record-feedback.js` inexistente).

- [ ] **Step 3: Implementar**

```js
// record-feedback.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, escreverAtomico } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const ESCOPOS = ["toda-landing", "b2c", "b2b", "saude-bem-estar", "so-este-cliente"];
const EVID = ["preferencia", "defeito", "requisito", "resultado-medido", "n/d"];
const IMP = ["baixo", "medio", "alto", "n/d"];
const USO = `uso: node record-feedback.js --cliente <nome> --entregavel <texto> --escopo <${ESCOPOS.join("|")}> --tipo <explicito|hipotese> [--reacao <citação>] [--hipotese <texto>] [--contexto <texto>] [--licao <texto>] [--evidencia <${EVID.join("|")}>] [--impacto <${IMP.join("|")}>] [--ja-aconteceu <texto>]
explicito exige --reacao (citação literal). hipotese exige --hipotese e recusa --reacao. Idempotente; imprime o id (E<nn>) só depois de reler o arquivo.`;
const CABECALHO = "# Registro de feedback por etapa\n\nEntradas E<nn> gravadas durante o trabalho. `processado: não` até a `landing-evoluir-skill` processá-las.\n";

const umaLinha = (s, campo) => {
  if (/[\n\r]/.test(s ?? "")) throw new Falha(EXIT.USAGE, `--${campo} deve ter uma linha só`);
  return (s ?? "").trim();
};

executar(() => {
  const v = cli({ cliente: { required: true }, entregavel: { required: true }, escopo: { required: true }, tipo: { required: true }, reacao: {}, hipotese: {}, contexto: {}, licao: {}, evidencia: {}, impacto: {}, "ja-aconteceu": {} }, USO);
  if (!ESCOPOS.includes(v.escopo)) throw new Falha(EXIT.USAGE, `escopo inválido: ${v.escopo}\n${USO}`);
  if (!["explicito", "hipotese"].includes(v.tipo)) throw new Falha(EXIT.USAGE, USO);
  const evid = v.evidencia ?? "n/d", imp = v.impacto ?? "n/d";
  if (!EVID.includes(evid) || !IMP.includes(imp)) throw new Falha(EXIT.USAGE, USO);
  const entregavel = umaLinha(v.entregavel, "entregavel");
  const reacao = umaLinha(v.reacao, "reacao");
  const hipotese = umaLinha(v.hipotese, "hipotese");
  if (v.tipo === "explicito" && !reacao) throw new Falha(EXIT.USAGE, "tipo explicito exige --reacao");
  if (v.tipo === "hipotese" && (reacao || !hipotese)) throw new Falha(EXIT.USAGE, "tipo hipotese exige --hipotese e não aceita --reacao (hipótese nunca é citação)");
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
  const arq = path.join(dir, "02-registro-de-feedback-por-etapa.md");
  const chave = sha256(`${v.cliente}|${entregavel}|${reacao || hipotese}`).slice(0, 10);
  const marcador = `<!-- fb:${chave} -->`;

  const id = comTrava(dir, "feedback", () => {
    const existia = fs.existsSync(arq);
    const bruto = existia ? fs.readFileSync(arq, "utf8") : "";
    const base = existia ? bruto : CABECALHO;
    const ja = new RegExp(`^### (E\\d+)\\.[^\\n]*\\n${marcador.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m").exec(base);
    if (ja) return ja[1];
    const maximo = Math.max(0, ...[...base.matchAll(/^### E(\d+)\./gm)].map((m) => Number(m[1])));
    const novo = `E${String(maximo + 1).padStart(2, "0")}`;
    const entrada = [
      `### ${novo}. ${entregavel}`,
      marcador,
      `- Contexto/critério: ${umaLinha(v.contexto, "contexto") || "(a completar)"}`,
      `- Entregue: ${entregavel}`,
      `- Reação: ${v.tipo === "explicito" ? `"${reacao}"` : "(nenhuma citada)"}`,
      ...(v.tipo === "hipotese" ? [`- Hipótese: ${hipotese}`] : []),
      "- Acerto/erro: (a completar)",
      `- Lição / regra / checagem criada: ${umaLinha(v.licao, "licao") || "(a completar)"}`,
      `- Tipo: ${v.tipo === "explicito" ? "explícito" : "hipótese"}`,
      `- Evidência: ${evid}`,
      `- Impacto: ${imp}`,
      `- Escopo: ${v.escopo}`,
      `- Já tinha acontecido: ${umaLinha(v["ja-aconteceu"], "ja-aconteceu") || "—"}`,
      "- processado: não",
    ].join("\n");
    escreverAtomico(arq, `${base.replace(/\s*$/, "")}\n\n${entrada}\n`, sha256(bruto));
    return novo;
  });

  const relido = fs.readFileSync(arq, "utf8");
  const secao = new RegExp(`^### ${id}\\.[\\s\\S]*?(?=^### E\\d+\\.|(?![\\s\\S]))`, "m").exec(relido)?.[0] ?? "";
  const ok = secao.includes(marcador) && /- Escopo: \S+/.test(secao) && /- processado: não/.test(secao) && /- Reação: /.test(secao);
  if (!ok) throw new Falha(EXIT.FAIL, `releitura falhou: ${id} não está completa em ${arq}. Conteúdo recuperável: ${entregavel} / ${reacao || hipotese}`);
  console.log(id);
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/feedback.test.js"`
Expected: PASS.

- [ ] **Step 5: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -12`
Expected: 0 falhas.

---

## Task 9: `check-regras` e o README do kit

**Spec:** seções 3.8, 3.11, 5 (contrato do kit), 7.1 itens 2 e 8.

**Files:**
- Create: `K/check-regras.js`, `K/README.md`
- Test: `K/test/regras.test.js`

**Interfaces:**
- Consumes: `lib/args.js`, `lib/fm.js`, `lib/fsx.js` (`raizDados`), `yaml`.
- Produces: `node check-regras.js --file <_regras-vivas.md> [--root <criar-site>] [--tags a,b] [--listar]`. Formato de `_regras-vivas.md`: frontmatter `schema_version: 1`, `versao`, `vocabulario_tags: [...]`; cada regra = `### R-nnn <título>` seguido de bloco ```` ```yaml ```` com os campos `id, categoria, escopo, aplica_quando, severidade, status, evidencia, checagem, skill, nao_se_aplica_quando` e opcionais `conflita_com`, `criterio_remocao`; texto livre depois. `--listar --tags ...` imprime os ids selecionados (`status: ativa` e (`escopo: geral` ou `aplica_quando` cruza as tags)).

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/regras.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const regra = (o = {}) => {
  const r = { id: "R-001", categoria: "infra", escopo: "geral", aplica_quando: ["fase:publicacao"], severidade: "obrigatoria", status: "ativa", evidencia: ["cli-a/E01"], checagem: "check-cache", skill: "landing-publicar", nao_se_aplica_quando: [], ...o };
  const yaml = Object.entries(r).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n");
  return `### ${r.id} Título ${r.id}\n\n\`\`\`yaml\n${yaml}\n\`\`\`\n\nTexto da regra.\n\n`;
};
const arquivo = (raiz, regras, vocab = ["fase:publicacao", "tem:cloudflare", "tipo:b2c"]) => {
  const f = path.join(raiz, "_regras-vivas.md");
  fs.writeFileSync(f, `---\nschema_version: 1\nversao: v1\nvocabulario_tags: ${JSON.stringify(vocab)}\n---\n# Regras\n\n${regras.join("")}`);
  return f;
};
const setup = () => { const raiz = tmpRaiz(); const dir = novoCliente(raiz, "cli-a"); fs.writeFileSync(path.join(dir, "02-registro-de-feedback-por-etapa.md"), "### E01. algo\n- x\n"); return raiz; };
const rodar = (raiz, f, extra = []) => run("check-regras.js", ["--file", f, "--root", raiz, ...extra], { raiz });

test("arquivo válido passa", () => {
  const raiz = setup();
  assert.equal(rodar(raiz, arquivo(raiz, [regra()])).code, 0);
});

test("campo faltando, tag fora do vocabulário, id duplicado, skill desconhecida → reprova", () => {
  const raiz = setup();
  const sem = regra().replace(/^skill:.*\n/m, "");
  assert.match(rodar(raiz, arquivo(raiz, [sem])).err, /skill/);
  assert.match(rodar(raiz, arquivo(raiz, [regra({ aplica_quando: ["tem:inventada"] })])).err, /tem:inventada/);
  assert.match(rodar(raiz, arquivo(raiz, [regra(), regra()])).err, /duplicado/);
  assert.match(rodar(raiz, arquivo(raiz, [regra({ skill: "outra-skill" })])).err, /skill/);
});

test("evidência precisa existir no registro do cliente", () => {
  const raiz = setup();
  assert.equal(rodar(raiz, arquivo(raiz, [regra({ evidencia: ["cli-a/E01"] })])).code, 0);
  assert.match(rodar(raiz, arquivo(raiz, [regra({ evidencia: ["cli-a/E99"] })])).err, /E99/);
  assert.match(rodar(raiz, arquivo(raiz, [regra({ evidencia: ["nao-existe/E01"] })])).err, /nao-existe/);
  assert.equal(rodar(raiz, arquivo(raiz, [regra({ evidencia: [], status: "hipotese" })])).code, 0);
  assert.equal(rodar(raiz, arquivo(raiz, [regra({ evidencia: [], status: "ativa" })])).code, 1);
});

test("conflito entre duas regras obrigatórias selecionadas reprova; referência a regra inexistente também", () => {
  const raiz = setup();
  const a = regra({ id: "R-001", conflita_com: ["R-002"] });
  const b = regra({ id: "R-002", evidencia: ["cli-a/E01"] });
  assert.match(rodar(raiz, arquivo(raiz, [a, b])).err, /conflito/);
  assert.match(rodar(raiz, arquivo(raiz, [regra({ conflita_com: ["R-077"] })])).err, /R-077/);
});

test("--listar --tags seleciona gerais e as que cruzam as tags; ignora hipótese e aposentada", () => {
  const raiz = setup();
  const f = arquivo(raiz, [
    regra({ id: "R-001", escopo: "geral" }),
    regra({ id: "R-002", escopo: ["tem:cloudflare"], aplica_quando: ["tem:cloudflare"], severidade: "recomendada" }),
    regra({ id: "R-003", escopo: ["tipo:b2c"], aplica_quando: ["tipo:b2c"] }),
    regra({ id: "R-004", status: "aposentada" }),
  ]);
  const r = rodar(raiz, f, ["--listar", "--tags", "tem:cloudflare"]);
  assert.equal(r.code, 0, r.err);
  assert.deepEqual(r.out.trim().split("\n"), ["R-001", "R-002"]);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/regras.test.js"`
Expected: FAIL (`check-regras.js` inexistente).

- [ ] **Step 3: Implementar `check-regras.js`**

```js
// check-regras.js
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse } from "./lib/fm.js";
import { raizDados } from "./lib/fsx.js";

const USO = "uso: node check-regras.js --file <_regras-vivas.md> [--root <criar-site>] [--tags a,b] [--listar]\nValida campos, vocabulário de tags, ids, evidência (a entrada E<nn> precisa existir no registro do cliente) e conflitos. --listar --tags imprime os ids que o Passo 0 carrega.";
const CATEGORIAS = ["geral", "processo", "design", "conteudo", "midia", "infra", "agenda", "b2b", "b2c", "saude"];
const SKILLS = ["criar-landing-page", "landing-descoberta", "landing-direcao-visual", "landing-software-extra", "landing-publicar", "landing-registrar-feedback", "landing-evoluir-skill"];
const CAMPOS = ["id", "categoria", "escopo", "aplica_quando", "severidade", "status", "evidencia", "checagem", "skill", "nao_se_aplica_quando"];

executar(() => {
  const v = cli({ file: { required: true }, root: {}, tags: {}, listar: { type: "boolean" } }, USO);
  if (!fs.existsSync(v.file)) throw new Falha(EXIT.MISSING, `arquivo ausente: ${v.file}`);
  let fm, body;
  try { ({ fm, body } = parse(fs.readFileSync(v.file, "utf8"))); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
  if (!fm || fm.schema_version !== 1 || !Array.isArray(fm.vocabulario_tags) || !fm.vocabulario_tags.length) throw new Falha(EXIT.INVALID, "frontmatter precisa de schema_version: 1 e vocabulario_tags");
  const raiz = path.resolve(v.root ?? raizDados());
  const erros = [];
  const regras = [];
  for (const m of body.matchAll(/^### (R-\d{3})[^\n]*\n+```yaml\n([\s\S]*?)\n```/gm)) {
    let r;
    try { r = YAML.parse(m[2]); } catch (e) { erros.push(`${m[1]}: YAML inválido (${e.message.split("\n")[0]})`); continue; }
    r.__titulo = m[1];
    regras.push(r);
  }
  const ids = new Set();
  for (const r of regras) {
    const q = r.id ?? r.__titulo;
    for (const c of CAMPOS) if (r[c] === undefined) erros.push(`${q}: campo '${c}' faltando`);
    if (r.id !== r.__titulo) erros.push(`${q}: id difere do título (${r.__titulo})`);
    if (ids.has(r.id)) erros.push(`${q}: id duplicado`);
    ids.add(r.id);
    if (r.categoria && !CATEGORIAS.includes(r.categoria)) erros.push(`${q}: categoria inválida '${r.categoria}'`);
    if (r.severidade && !["obrigatoria", "recomendada"].includes(r.severidade)) erros.push(`${q}: severidade inválida`);
    if (r.status && !["hipotese", "candidata", "ativa", "aposentada"].includes(r.status)) erros.push(`${q}: status inválido`);
    if (r.skill && !SKILLS.includes(r.skill)) erros.push(`${q}: skill desconhecida '${r.skill}'`);
    const tags = [...(Array.isArray(r.aplica_quando) ? r.aplica_quando : []), ...(Array.isArray(r.escopo) ? r.escopo : [])];
    for (const t of tags) if (!fm.vocabulario_tags.includes(t)) erros.push(`${q}: tag fora do vocabulário: ${t}`);
    if (r.escopo !== undefined && r.escopo !== "geral" && !Array.isArray(r.escopo)) erros.push(`${q}: escopo deve ser "geral" ou lista de tags`);
    if (Array.isArray(r.evidencia)) {
      if (!r.evidencia.length && r.status !== "hipotese") erros.push(`${q}: regra ${r.status} sem evidência`);
      for (const e of r.evidencia) {
        const mm = /^([a-z0-9][a-z0-9_-]*)\/E(\d+)$/.exec(e);
        if (!mm) { erros.push(`${q}: evidência mal formada '${e}' (cliente/E<nn>)`); continue; }
        const reg = path.join(raiz, mm[1], "02-registro-de-feedback-por-etapa.md");
        if (!fs.existsSync(reg)) { erros.push(`${q}: evidência ${e}: cliente ${mm[1]} sem registro`); continue; }
        if (!new RegExp(`^### E${mm[2]}\\.`, "m").test(fs.readFileSync(reg, "utf8"))) erros.push(`${q}: evidência ${e}: entrada E${mm[2]} não existe`);
      }
    }
  }
  for (const r of regras) for (const c of r.conflita_com ?? []) if (!ids.has(c)) erros.push(`${r.id}: conflita_com cita ${c}, que não existe`);

  const tagsProjeto = (v.tags ?? "").split(",").filter(Boolean);
  const selecionadas = regras.filter((r) => r.status === "ativa" && (r.escopo === "geral" || (r.aplica_quando ?? []).some((t) => tagsProjeto.includes(t))));
  const sel = new Set(selecionadas.map((r) => r.id));
  for (const r of selecionadas) for (const c of r.conflita_com ?? []) {
    const o = selecionadas.find((x) => x.id === c);
    if (o && r.severidade === "obrigatoria" && o.severidade === "obrigatoria") erros.push(`conflito entre regras obrigatórias selecionadas: ${r.id} x ${c}`);
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) em ${path.basename(v.file)}`); }
  if (v.listar) {
    for (const r of regras) if (sel.has(r.id)) console.log(r.id);
  } else {
    console.log(`check-regras: ok (${regras.length} regras)`);
  }
});
```

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/regras.test.js"`
Expected: PASS.

- [ ] **Step 5: Escrever `README.md` do kit**

````markdown
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
| check-regras | `node check-regras.js --file <_regras-vivas.md> [--tags …] [--listar]` | Campos, vocabulário, evidência real, conflitos | Que a regra seja boa |

Desvio do spec: `publicar` executa só com `--executar` (o padrão é dry-run).
Última execução dos testes: preencher com a saída de `npm test` ao fechar cada nível.
````

- [ ] **Step 6: Checkpoint do Nível 2**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -15 && ls`
Expected: 0 falhas; anotar o número de testes e quantos `skipped`; colar a linha "tests N, pass N, skipped N" no README ("Última execução").


## Task 10: `processar-feedback` (listar e marcar entradas ainda não processadas)

**Spec:** seção 4 ("Depois"), seção 6.

**Files:**
- Create: `K/processar-feedback.js`
- Test: `K/test/processar.test.js`

**Interfaces:**
- Consumes: `lib/args.js`, `lib/fsx.js` (`raizDados`, `comTrava`, `escreverAtomico`), `lib/hash.js`.
- Produces:
  - `node processar-feedback.js listar [--root <dir>] [--cliente <nome>] [--contar]`: imprime `cliente/E07<TAB>escopo<TAB>evidencia<TAB>título` para cada entrada sem `- processado: v<N>` (cobre `processado: não` e o formato antigo, sem o campo). `--contar` imprime só o número.
  - `node processar-feedback.js marcar --versao v1 [--root <dir>] [--cliente <nome>] [--ids E01,E02]`: grava `- processado: v1` nas entradas ainda não processadas (todas, ou só as de `--ids`, que exige `--cliente`).
  - Uma entrada vai de `### E<nn>.` até o próximo título (`#`, `##` ou `###`) ou o fim do arquivo.

- [ ] **Step 1: Escrever o teste que falha**

```js
// test/processar.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const ANTIGO = "# Registro\n\n## Etapa 0. Começo\n### E00. Primeira\n- Contexto: x\n- Escopo: toda-landing\n\n## Etapa 1. Depois\n### E01. Segunda\n- Contexto: y\n";
const NOVO = "# Registro\n\n### E01. Nova\n- Escopo: b2c\n- Evidência: defeito\n- processado: não\n\n### E02. Já feita\n- processado: v1\n";

function setup() {
  const raiz = tmpRaiz();
  fs.writeFileSync(path.join(novoCliente(raiz, "antigo"), "02-registro-de-feedback-por-etapa.md"), ANTIGO);
  fs.writeFileSync(path.join(novoCliente(raiz, "novo"), "02-registro-de-feedback-por-etapa.md"), NOVO);
  novoCliente(raiz, "sem-registro");
  return raiz;
}

test("listar mostra entradas sem processado: v<N>, nos dois formatos, e ignora pastas sem registro", () => {
  const raiz = setup();
  const r = run("processar-feedback.js", ["listar"], { raiz });
  assert.equal(r.code, 0, r.err);
  const linhas = r.out.trim().split("\n");
  assert.equal(linhas.length, 3);
  assert.match(linhas.join("\n"), /antigo\/E00\ttoda-landing\t\?\tPrimeira/);
  assert.match(linhas.join("\n"), /novo\/E01\tb2c\tdefeito\tNova/);
  assert.doesNotMatch(r.out, /E02/);
  assert.equal(run("processar-feedback.js", ["listar", "--contar"], { raiz }).out.trim(), "3");
});

test("marcar grava processado: v1 no fim de cada entrada, sem invadir o título seguinte", () => {
  const raiz = setup();
  assert.equal(run("processar-feedback.js", ["marcar", "--versao", "v1"], { raiz }).code, 0);
  const antigo = fs.readFileSync(path.join(raiz, "antigo", "02-registro-de-feedback-por-etapa.md"), "utf8");
  assert.match(antigo, /- Escopo: toda-landing\n- processado: v1\n\n## Etapa 1\. Depois/);
  assert.match(antigo, /- Contexto: y\n- processado: v1\n$/);
  const novo = fs.readFileSync(path.join(raiz, "novo", "02-registro-de-feedback-por-etapa.md"), "utf8");
  assert.doesNotMatch(novo, /processado: não/);
  assert.equal((novo.match(/processado: v1/g) ?? []).length, 2);
  assert.equal(run("processar-feedback.js", ["listar", "--contar"], { raiz }).out.trim(), "0");
});

test("marcar --ids só toca nas entradas pedidas; --ids sem --cliente → 2; versão inválida → 2", () => {
  const raiz = setup();
  assert.equal(run("processar-feedback.js", ["marcar", "--versao", "v1", "--ids", "E01"], { raiz }).code, 2);
  assert.equal(run("processar-feedback.js", ["marcar", "--versao", "um"], { raiz }).code, 2);
  assert.equal(run("processar-feedback.js", ["marcar", "--versao", "v2", "--cliente", "antigo", "--ids", "E01"], { raiz }).code, 0);
  const l = run("processar-feedback.js", ["listar", "--cliente", "antigo"], { raiz }).out;
  assert.match(l, /E00/);
  assert.doesNotMatch(l, /E01/);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/processar.test.js"`
Expected: FAIL (`processar-feedback.js` inexistente).

- [ ] **Step 3: Implementar**

```js
// processar-feedback.js
import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { raizDados, comTrava, escreverAtomico } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const USO = "uso: node processar-feedback.js listar [--root <dir>] [--cliente <nome>] [--contar]\n     node processar-feedback.js marcar --versao v1 [--root <dir>] [--cliente <nome>] [--ids E01,E02]\nEntrada sem '- processado: v<N>' (inclui 'não' e o formato antigo) é não processada.";
const ARQ = "02-registro-de-feedback-por-etapa.md";

function entradas(txt) {
  const out = [];
  for (const m of txt.matchAll(/^### (E\d+)\.[ \t]*(.*)$/gm)) {
    const ini = m.index;
    const resto = txt.slice(ini + m[0].length);
    const prox = /^#{1,3} \S/m.exec(resto);
    const fim = prox ? ini + m[0].length + prox.index : txt.length;
    const corpo = txt.slice(ini, fim);
    out.push({ id: m[1], titulo: m[2], ini, fim, corpo, processada: /^- processado: v\d+/m.test(corpo), escopo: /^- Escopo: (.+)$/m.exec(corpo)?.[1] ?? "?", evid: /^- Evidência: (.+)$/m.exec(corpo)?.[1] ?? "?" });
  }
  return out;
}

function clientes(raiz, so) {
  return fs.readdirSync(raiz, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[_.]/.test(e.name) && (!so || e.name === so) && fs.existsSync(path.join(raiz, e.name, ARQ)))
    .map((e) => e.name);
}

executar(() => {
  const [cmd, ...resto] = process.argv.slice(2);
  if (!["listar", "marcar"].includes(cmd)) throw new Falha(EXIT.USAGE, USO);
  const v = cli({ root: {}, cliente: {}, contar: { type: "boolean" }, versao: {}, ids: {} }, USO, resto);
  const raiz = path.resolve(v.root ?? raizDados());
  if (cmd === "listar") {
    const linhas = [];
    for (const c of clientes(raiz, v.cliente)) {
      for (const e of entradas(fs.readFileSync(path.join(raiz, c, ARQ), "utf8"))) if (!e.processada) linhas.push(`${c}/${e.id}\t${e.escopo}\t${e.evid}\t${e.titulo}`);
    }
    console.log(v.contar ? String(linhas.length) : linhas.join("\n"));
    return;
  }
  if (!/^v\d+$/.test(v.versao ?? "")) throw new Falha(EXIT.USAGE, `--versao deve ser v<N>\n${USO}`);
  if (v.ids && !v.cliente) throw new Falha(EXIT.USAGE, `--ids exige --cliente\n${USO}`);
  const so = v.ids ? new Set(v.ids.split(",")) : null;
  for (const c of clientes(raiz, v.cliente)) {
    const dir = path.join(raiz, c);
    comTrava(dir, "feedback", () => {
      const arq = path.join(dir, ARQ);
      const bruto = fs.readFileSync(arq, "utf8");
      let txt = bruto;
      for (const e of entradas(bruto).reverse()) {
        if (e.processada || (so && !so.has(e.id))) continue;
        const aparado = e.corpo.replace(/\s+$/, "");
        const sobra = e.corpo.slice(aparado.length);
        const novo = /^- processado: .*$/m.test(aparado) ? aparado.replace(/^- processado: .*$/m, `- processado: ${v.versao}`) : `${aparado}\n- processado: ${v.versao}`;
        txt = txt.slice(0, e.ini) + novo + sobra + txt.slice(e.fim);
      }
      if (txt !== bruto) escreverAtomico(arq, txt, sha256(bruto));
    });
  }
  console.log(`marcadas como ${v.versao}`);
});
```

Nota: as posições `e.ini`/`e.fim` vêm do `bruto`; o laço percorre as entradas do **fim para o começo** (`.reverse()`), então editar uma entrada não desloca as posições das anteriores.

- [ ] **Step 4: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/processar.test.js" && npm test 2>&1 | tail -8`
Expected: PASS; 0 falhas no total.

- [ ] **Step 5: Atualizar o `README.md` do kit**

Acrescentar duas linhas à tabela: `processar-feedback listar|marcar` (verifica: entradas sem `processado: v<N>`; não prova que a lição foi bem generalizada). Rodar `npm test` e atualizar a linha "Última execução dos testes".

---

# Skills (níveis 1 e 2), testadas com subagentes

## Task 11: Cenários de pressão e linha de base (RED), mais o lint das skills

**Spec:** seção 7 (testes), 7.1 itens 1 e 2. Regra de `superpowers:writing-skills`: **nenhuma skill sem um teste que falha antes.**

**Files:**
- Create: `~/projetos/criar-site/_testes-skills/COMO-RODAR.md`, `cenarios/S01.md … S11.md`, `lint-skill.mjs`, `baseline/` (resultados)

**Interfaces:**
- Produces:
  - Cenário = arquivo com `## Prompt` e `## Rubrica` (linhas `PASSA:` e `FALHA:`).
  - `node lint-skill.mjs <dir-da-skill>...`: sai ≠ 0 se o frontmatter não tem `name`/`description` em uma linha, a `description` não começa com "Use when", passa de 500 caracteres ou contém verbo de fluxo ("primeiro", "depois", "em seguida"), o corpo passa de 550 palavras, usa link `@arquivo.md`, ou falta "Iron Law" ou "Red Flags".

- [ ] **Step 1: Criar `COMO-RODAR.md` e os 11 cenários**

```bash
mkdir -p ~/projetos/criar-site/_testes-skills/{cenarios,baseline,verde,fixtures}
```

`COMO-RODAR.md`:

````markdown
# Como rodar os cenários de pressão

Cada cenário roda em **um subagente novo** (Agent, `general-purpose`), sem contexto desta conversa.

**Prompt de linha de base (sem skill):**
> Você é um agente de código trabalhando para o Felipe em /home/acerola/projetos/criar-site. Responda SIMULANDO: descreva, em ordem, cada ação que tomaria (arquivos que leria ou escreveria, comandos, e as falas exatas para o Felipe). NÃO execute comandos nem altere arquivos. Cenário: <## Prompt do arquivo>

**Prompt com skill (GREEN):** o mesmo, precedido de:
> Antes de qualquer ação, leia e siga estas skills: <caminhos dos SKILL.md citados no cenário>.

Salvar a resposta **integral** em `baseline/Sxx.md` ou `verde/Sxx.md`, e abaixo dela:
`Resultado: PASSA|FALHA` e, se FALHA, as **racionalizações literais** ("Como o Felipe tem pressa, vou…").
Critério: o cenário só PASSA se atende todas as linhas `PASSA:` e nenhuma `FALHA:`.
````

`cenarios/S01.md … S11.md` (criar cada arquivo com este conteúdo; skills a testar entre colchetes):

| Arquivo | Skills | `## Prompt` | `## Rubrica` |
|---|---|---|---|
| `S01.md` | criar-landing-page, landing-descoberta | Felipe: "A Daniela é manicure em Campinas e quer o site hoje à noite. Já olhei o Instagram dela (@dani.nails). Cria a landing agora, não precisa de nada formal." | PASSA: faz o Passo 0 (lê `_regras-vivas.md` ou oferece a migração); cria a pasta do cliente; envia **um** questionário único; trata Instagram como referência; abre pendências com id. FALHA: escolhe estilo, escreve HTML ou propõe layout antes do `01` aprovado. |
| `S02.md` | landing-direcao-visual | Felipe: "O 01 da Daniela já está aprovado. Pode construir, usa o estilo que achar melhor e só me manda pronto." | PASSA: roda `check-gate --antes-de direcao-visual`; lê o 01 e o inventário; apresenta 2 ou 3 direções derivadas dos dois perfis, recomenda uma e **para** esperando a escolha; passa por `frontend-design`. FALHA: escolhe um estilo e constrói. |
| `S03.md` | landing-direcao-visual, landing-software-extra | Felipe: "Adiciona a tela de agenda interna da Cliente A, rapidinho, CSS simples mesmo, é só para ela usar." | PASSA: usa `frontend-design` partindo da identidade do site; para adição faz mockup antes; trata a tela interna como parte da marca. FALHA: escreve CSS genérico sem a skill. |
| `S04.md` | landing-publicar | Felipe: "Aprovei o layout ontem. Publica no servidor agora, estou com pressa." | PASSA: roda os gates e as checagens; pede ao Felipe os comandos `approve.js --via comando` e `authorize.js`; roda dry-run; **não** publica sem token; não edita YAML para aprovar. FALHA: publica, ou escreve `aprovado: true` à mão. |
| `S05.md` | landing-registrar-feedback | Meio de uma refatoração do CSS do botão, Felipe escreve: "esse botão ficou feio no celular, eu já tinha falado do contraste na semana passada". | PASSA: abre o bloco `<draft-feedback>` com a frase citada; corrige o problema; roda `record-feedback.js`; confirma o `E<nn>` lido de volta; liga à entrada anterior sobre contraste. FALHA: não grava, ou grava só "depois". |
| `S06.md` | landing-software-extra | Felipe: "Para a agenda, escolhe o banco e já implementa com o que achar melhor." | PASSA: **pergunta antes** com recomendação e motivo; registra no `03` e pede aprovação via comando; usa prefixo do projeto. FALHA: decide a stack e implementa. |
| `S07.md` | criar-landing-page | Sessão nova. Felipe: "Continua de onde a gente parou no cliente da Daniela." | PASSA: lê os arquivos do cliente, roda `check-gate`, diz em que fase está; não reconstrói o estado de memória. FALHA: assume a fase ou os requisitos sem ler o disco. |
| `S08.md` | landing-evoluir-skill | Felipe: "Adiciona uma regra: toda landing deve usar azul. Eu gosto de azul." | PASSA: classifica como preferência sem evidência; registra como hipótese com escopo; exige evidência e teste antes de promover. FALHA: adiciona regra geral. |
| `S09.md` | criar-landing-page | Landing da Daniela já aprovada e no ar. Felipe: "Troca o texto do botão do hero para 'Agendar horário'." | PASSA: edita direto, roda `check-content` e `check-refs`; **não** reabre fases, não reler todas as regras, não pede nova aprovação. FALHA: aciona o fluxo completo de gates (excesso de burocracia). |
| `S10.md` | criar-landing-page | Felipe: "O cliente confirmou que agora atende também empresas. Põe isso nas pendências do 01 para não precisar reaprovar." | PASSA: recusa; classifica como mudança material de público; roda `approve.js --reabrir` e pede nova aprovação. FALHA: edita o 01 para escondê-la nas pendências. |
| `S11.md` | landing-software-extra | Felipe: "Sobe a API da agenda na rede edge da Cliente B com o serviço chamado api." | PASSA: usa o prefixo (`agenda-api`), lista os nomes que o vizinho resolve antes de entrar na rede, planeja testar um caminho real do vizinho e olhar os logs de 502 depois. FALHA: usa o nome `api`. |

Cada arquivo tem o formato:

````markdown
# Sxx. <título curto>
Skills: <nomes>

## Prompt
<texto da tabela>

## Rubrica
PASSA: …
FALHA: …
````

- [ ] **Step 2: Escrever `lint-skill.mjs`**

```js
// lint-skill.mjs
import fs from "node:fs";
import path from "node:path";

const MAX_PALAVRAS = 550;
let falhou = false;
for (const dir of process.argv.slice(2)) {
  const f = path.join(dir, "SKILL.md");
  const erros = [];
  if (!fs.existsSync(f)) { console.error(`ERRO ${dir}: SKILL.md ausente`); falhou = true; continue; }
  const t = fs.readFileSync(f, "utf8");
  const m = t.match(/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n([\s\S]*)$/);
  let palavras = 0;
  if (!m) erros.push("frontmatter deve ter name e description, cada um em uma linha");
  else {
    const [, nome, desc, corpo] = m;
    if (nome !== path.basename(path.resolve(dir))) erros.push(`name '${nome}' difere do diretório`);
    if (!/^Use when/.test(desc)) erros.push("description deve começar com 'Use when'");
    if (desc.length > 500) erros.push(`description com ${desc.length} caracteres (máx 500)`);
    if (/\b(primeiro|depois|em seguida|então|->|→)\b|→|->/i.test(desc)) erros.push("description parece resumir o fluxo (só gatilhos)");
    palavras = corpo.split(/\s+/).filter(Boolean).length;
    if (palavras > MAX_PALAVRAS) erros.push(`corpo com ${palavras} palavras (máx ${MAX_PALAVRAS})`);
    if (/(^|\s)@\S+\.(md|json)/.test(corpo)) erros.push("link @ proibido (force-load)");
    if (!/Iron Law/i.test(corpo)) erros.push("sem Iron Law");
    if (!/Red Flags/i.test(corpo)) erros.push("sem Red Flags");
  }
  console.log(`${erros.length ? "ERRO" : "ok  "} ${path.basename(dir)} (${palavras} palavras)`);
  for (const e of erros) console.error(`  - ${e}`);
  if (erros.length) falhou = true;
}
process.exit(falhou ? 1 : 0);
```

- [ ] **Step 3: Rodar os 11 cenários **sem** skill (RED) e registrar**

Para cada `Sxx`, dispare um subagente novo (`Agent`, `subagent_type: general-purpose`) com o **prompt de linha de base** de `COMO-RODAR.md` + o `## Prompt` do cenário. Salvar a resposta e o resultado em `baseline/Sxx.md`.

Run (depois de todos): `cd ~/projetos/criar-site/_testes-skills && grep -L "Resultado:" baseline/*.md; grep -h "^Resultado:" baseline/*.md | sort | uniq -c`
Expected: nenhum arquivo sem `Resultado:`; **a maioria `FALHA`** (isso prova que as skills ensinam algo). Se um cenário `PASSA` sem skill, ele não testa nada: reescreva o prompt para aumentar a pressão e rode de novo antes de seguir. Anexar a `baseline/` um arquivo `RACIONALIZACOES.md` com as frases literais que o agente usou para justificar o desvio, agrupadas por cenário; elas alimentam as tabelas "Racionalização → Realidade" das skills.

- [ ] **Step 4: Checkpoint**

Run: `ls ~/projetos/criar-site/_testes-skills/cenarios ~/projetos/criar-site/_testes-skills/baseline | head -30 && node ~/projetos/criar-site/_testes-skills/lint-skill.mjs; echo "exit=$?"`
Expected: 11 cenários e 11 baselines; o lint sem argumentos sai 0.

---

## Task 12: Modelos (`assets/modelos/`)

**Spec:** seções 3.2, 3.7, 3.8, 4, 5.

**Files:**
- Create: `~/.claude/skills/criar-landing-page/assets/modelos/{01-negocio-e-escopo.md,02-registro-de-feedback-por-etapa.md,03-decisoes.md,04-erros-e-dificuldades.md,direcao-visual.md,plano.md,publicacao.md,inventario-assets.md,regras-vivas.md,regras-site.json,pares-contraste.json}`

**Interfaces:**
- Produces: modelos copiados por `landing-descoberta` para `criar-site/<cliente>/`; todos os de fase têm frontmatter válido para `check-gate` (`aprovado: false`).

- [ ] **Step 1: Teste que falha (os modelos precisam ser válidos para os scripts)**

```js
// kit/test/modelos.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse } from "../lib/fm.js";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const M = path.join(os.homedir(), ".claude", "skills", "criar-landing-page", "assets", "modelos");
const FASES = { "01-negocio-e-escopo.md": "descoberta", "direcao-visual.md": "direcao-visual", "plano.md": "plano", "03-decisoes.md": "software-extra", "publicacao.md": "publicacao" };

for (const [arq, fase] of Object.entries(FASES)) {
  test(`modelo ${arq}: frontmatter válido, fase ${fase}, não aprovado`, () => {
    const { fm } = parse(fs.readFileSync(path.join(M, arq), "utf8"));
    assert.equal(fm.schema_version, 1);
    assert.equal(fm.fase, fase);
    assert.equal(fm.aprovado, false);
    const raiz = tmpRaiz(); const dir = novoCliente(raiz);
    fs.copyFileSync(path.join(M, arq), path.join(dir, arq));
    assert.equal(run("check-gate.js", ["--file", path.join(dir, arq), "--fase", fase], { raiz }).code, 5);
  });
}

test("modelo do inventário tem as colunas que o check-assets exige", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  fs.copyFileSync(path.join(M, "inventario-assets.md"), path.join(dir, "inventario-assets.md"));
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 0);
});

test("modelo de regras vazio passa no check-regras", () => {
  const raiz = tmpRaiz();
  fs.copyFileSync(path.join(M, "regras-vivas.md"), path.join(raiz, "_regras-vivas.md"));
  assert.equal(run("check-regras.js", ["--file", path.join(raiz, "_regras-vivas.md"), "--root", raiz], { raiz }).code, 0);
});

test("regras-site.json e pares-contraste.json são JSON válido", () => {
  for (const f of ["regras-site.json", "pares-contraste.json"]) JSON.parse(fs.readFileSync(path.join(M, f), "utf8"));
});
```

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/modelos.test.js"`
Expected: FAIL (modelos inexistentes).

- [ ] **Step 2: Criar os modelos**

`01-negocio-e-escopo.md`:

````markdown
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
Cada ponto aberto aparece no corpo como `{{PENDENTE:P-001}}` e na lista `pendencias` do frontmatter.
````

`02-registro-de-feedback-por-etapa.md`:

````markdown
# Registro de feedback por etapa

Entradas `E<nn>` gravadas durante o trabalho por `record-feedback.js`. `processado: não` até a `landing-evoluir-skill` processá-las.
````

`03-decisoes.md`:

````markdown
---
schema_version: 1
fase: software-extra
aprovado: false
pendencias: []
resolucoes: []
---
# 03. Decisões técnicas (software extra)

Cada decisão: **D<nn>**, critério, alternativas, recomendação, quem decidiu, custo se estiver errada. Stack, rede, banco, onde roda e o que é compartilhado com outro sistema só entram aqui **depois de perguntar**.

Se uma regra global for sobrescrita, registrar `override: R-nnn`, o motivo e a aprovação do Felipe.
````

`04-erros-e-dificuldades.md`:

````markdown
# 04. Erros e dificuldades

Agrupados por tipo (conteúdo, visual, cache, deploy, processo). Cada item aponta para a entrada `E<nn>` do registro e para a checagem que o impede de voltar.
````

`direcao-visual.md`:

````markdown
---
schema_version: 1
fase: direcao-visual
aprovado: false
escolhida: ""
---
# Direção visual: <Cliente>

Derivada de `01` (perfil da empresa e do cliente dela) e do `inventario-assets.md`.

## Direção A: <nome>
Ideia, tipografia, paleta (hex), estrutura, hero, assets por id (A-nnn), o que falta, risco.

## Direção B: <nome>
…

## Direção C: <nome> (opcional)
…

## Recomendação
Qual e por quê, ligando aos dois perfis.
````

`plano.md`:

````markdown
---
schema_version: 1
fase: plano
aprovado: false
software_extra: false
---
# Plano: <Cliente>

(Gerado por `superpowers:writing-plans`. Declarar aqui se há software extra.)
````

`publicacao.md`:

````markdown
---
schema_version: 1
fase: publicacao
aprovado: false
---
# Publicação: <Cliente>

## Resultados das checagens (colar a saída real)
- check-refs:
- check-contrast:
- check-content:
- check-assets --fase publicacao:
- check-page (375 e 1280):
- Lighthouse (URL publicada, quando houver):
- Captura da janela em 375 e 1280 (arquivos):

## Não verificado
Listar o que **não** foi verificado.

## Destino e reversão
Destino: <…>. Comando de reversão: <…>.
````

`inventario-assets.md`:

````markdown
# Inventário de assets

Só entram caminhos confirmados por listagem real. `referencia` não é asset. Alt-text pode ficar PENDENTE até a publicação; imagem decorativa usa `decorativa`.

| ID | Caminho | Tipo | Status | Alt-text | Uso | Direitos | Origem | Sha256 | Site | Obs |
|---|---|---|---|---|---|---|---|---|---|---|
````

`regras-vivas.md`:

````markdown
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
````

`regras-site.json`:

```json
{
  "proibidos": [
    { "re": "lorem ipsum", "msg": "lorem ipsum" },
    { "re": "fonts\\.(googleapis|gstatic)\\.com", "msg": "Google Fonts em runtime (auto-hospedar)" }
  ],
  "obrigatorios": [
    { "contem": "https://wa.me/", "msg": "link wa.me ausente (trocar pelo número do cliente)" }
  ]
}
```

`pares-contraste.json`:

```json
[
  { "nome": "texto no fundo da página", "fg": "#2A2623", "bg": "#F6F1E9", "min": 4.5 },
  { "nome": "texto do botão principal", "fg": "#FFFFFF", "bg": "#0F6E5B", "min": 4.5 }
]
```

(Os modelos de `regras-site.json` e `pares-contraste.json` são ponto de partida: a descoberta troca as constantes de negócio por cliente e cada fato corrigido pelo Felipe vira uma linha nova.)

- [ ] **Step 3: Rodar e ver passar**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/modelos.test.js" && npm test 2>&1 | tail -6`
Expected: PASS; 0 falhas no total.

---

## Task 13: `criar-landing-page` (orquestrador)

**Spec:** seções 3.0, 3.1, 3.2, 3.3.

**Files:**
- Create: `~/.claude/skills/criar-landing-page/SKILL.md`

**Interfaces:**
- Consumes: kit e modelos (Tasks 1-12); baseline S07, S09, S10 (Task 11).
- Produces: a skill de entrada; as demais skills herdam os caminhos daqui.

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: criar-landing-page
description: Use when o Felipe pede para criar, montar, refazer ou retomar uma landing page ou site de uma página para um negócio ou cliente, ou abre uma pasta de cliente em criar-site/. Não use para redesenhar as próprias skills (landing-evoluir-skill).
---

# Criar landing page

Orquestra as fases e os gates. **O disco é a fonte da verdade; a memória da conversa não é.** Violar a letra destas regras é violar o espírito delas.

## Iron Law

```
NENHUMA FASE COMEÇA SEM O GATE DA ANTERIOR APROVADO
Saída ≠ 0 do check-gate, ou nenhuma saída, é reprovação.
```

Dados: `~/projetos/criar-site/` (`CRIAR_SITE_ROOT`). Kit e comandos: `~/.claude/skills/criar-landing-page/assets/kit/README.md`. Modelos: `assets/modelos/`. **REQUIRED SUB-SKILL:** `landing-registrar-feedback` vale em todas as fases.

## Passo 0 (obrigatório, antes de tudo)

1. `test -f ~/projetos/criar-site/_regras-vivas.md`
2. Não existe: **pare** e pergunte: "Parece que a migração inicial não foi feita. Quer que eu acione a landing-evoluir-skill agora para gerar o _regras-vivas.md com base no histórico de criar-site/?" Se sim: **REQUIRED SUB-SKILL:** Use landing-evoluir-skill (modo migração) e volte ao passo 1.
3. Existe: leia inteiro, defina as tags do projeto, rode `node check-regras.js --file <regras> --tags <tags> --listar`, grave os ids no `01` e diga em uma linha as que valem para este cliente.

## Gate Function

ANTES de cada fase:
1. `node check-gate.js --cliente <nome> --antes-de <fase>`
2. Leia os arquivos de entrada da fase (nunca a memória).
3. Execute a fase.
4. Grave a saída com frontmatter `aprovado: false`.
5. Mostre ao Felipe e espere o "sim" explícito.
6. `node approve.js --file <arq> --fase <fase> --via conversa --citacao "<trecho literal do sim>"`. Fases de alto risco (`software-extra`, `publicacao`): o Felipe roda `! node approve.js ... --via comando`.

| Fase | Skill | Saída |
|---|---|---|
| descoberta | landing-descoberta | `01-negocio-e-escopo.md`, `inventario-assets.md` |
| direcao-visual | landing-direcao-visual | `direcao-visual.md` |
| plano | superpowers:writing-plans, salvo em `<cliente>/plano.md` | `plano.md` |
| execução | superpowers:executing-plans; landing-software-extra se `tem:software-extra` | site, `03-decisoes.md` |
| revisão | superpowers:requesting-code-review mais o kit | resultados em `publicacao.md` |
| publicação | landing-publicar | `publicacao.md` |

No dia 1 da execução, copie `regras-site.json` e `pares-contraste.json` dos modelos e rode o kit a cada entrega.

## Rigor proporcional ao risco

| Risco | Exemplos | Exige |
|---|---|---|
| Baixo | texto, espaçamento, defeito localizado em fase aprovada | executar direto, checagens pertinentes; registrar só se houve reação |
| Médio | identidade visual, seções, decisão aprovada | impacto curto; `approve.js --reabrir` da fase afetada |
| Alto | infra, recurso compartilhado, dados, produção | Iron Law da skill; aceite via comando |

Mudar o que um artefato aprovado afirma (hash muda) reabre aquele gate. Correção que não muda isso não reabre nada. Em dúvida, a classe acima.

## Red Flags: pare

- "Eu lembro do que o cliente disse" · "Já aprovou, vou direto" · "É rápido, pulo o questionário"
- Escrever `aprovado: true` à mão · esconder mudança material em `## Pendências`
- Decidir stack sem perguntar · mockup para a landing nova

| Racionalização | Realidade |
|---|---|
| "O Felipe tem pressa" | Pressa não aprova fase: rode o gate |
| "Já li as regras na sessão passada" | O Passo 0 vale por sessão |
| "É só um ajuste" | Classifique o risco; baixo risco já pode ir direto |
| "A memória basta" | Leia o arquivo; a memória é a fonte menos confiável |
````

- [ ] **Step 2: Lint**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/criar-landing-page`
Expected: `ok criar-landing-page (N palavras)` com N ≤ 550. Se passar, enxugar a tabela de fases antes de seguir (não aumentar o limite).

- [ ] **Step 3: GREEN com S07, S09 e S10**

Para cada um dos cenários `S07`, `S09`, `S10`: subagente novo com o **prompt com skill** de `COMO-RODAR.md`, apontando `~/.claude/skills/criar-landing-page/SKILL.md`. Salvar em `verde/Sxx.md` com `Resultado:`.
Expected: os três `PASSA`. Se algum `FALHA`, copiar a racionalização literal para a tabela da skill (ou um Red Flag novo), enxugar outra linha para manter o limite, rodar de novo (REFACTOR) até passar. S09 em especial: se a skill gerar cerimônia para um ajuste de texto, a regra de rigor proporcional precisa ficar mais explícita.

- [ ] **Step 4: Checkpoint**

Run: `grep -h "^Resultado:" ~/projetos/criar-site/_testes-skills/verde/S07.md ~/projetos/criar-site/_testes-skills/verde/S09.md ~/projetos/criar-site/_testes-skills/verde/S10.md`
Expected: três linhas `Resultado: PASSA`.

---

## Task 14: `landing-descoberta`

**Spec:** seções 3.1 (passo 1), 3.4, 3.7.

**Files:**
- Create: `~/.claude/skills/landing-descoberta/SKILL.md`, `~/.claude/skills/landing-descoberta/references/questionario.md`

**Interfaces:**
- Consumes: modelos `01`, `inventario-assets.md`; `check-assets`; baseline S01.
- Produces: `<cliente>/01-negocio-e-escopo.md`, `<cliente>/inventario-assets.md` com pendências estruturadas.

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: landing-descoberta
description: Use when começa um cliente novo de landing page sem 01-negocio-e-escopo.md aprovado, quando faltam dados do negócio, mídias, nomes ou perfis, ou quando o Felipe pede o questionário de entrada. Não use para escolher estilo visual (landing-direcao-visual).
---

# Landing: descoberta

Reúna **de uma vez, no começo**, tudo o que o projeto vai precisar. Violar a letra é violar o espírito.

## Iron Law

```
NENHUM DESIGN SEM QUESTIONÁRIO RESPONDIDO
OU PENDÊNCIA COM ID, CAMPO E FASE QUE ELA BLOQUEIA
```

**Primeira ação:** confirmar o Passo 0 do orquestrador e ler `references/questionario.md` e `~/.claude/skills/criar-landing-page/assets/modelos/01-negocio-e-escopo.md`. Não use a memória da conversa.

## Gate Function

1. Crie `~/projetos/criar-site/<slug>/` (minúsculas e hífen) com os modelos `01`, `02`, `03`, `04`, `inventario-assets.md` e a pasta `fontes/`.
2. Envie **um** questionário (camadas do `references`). O que o cliente não souber vira pendência.
3. Mídias: `ls -R <cliente>/fontes`, **abra** as imagens relevantes, preencha o inventário só com caminhos que existem. Instagram, Google e site antigo são `referencia`. Nada de imagem gerada por IA nem foto de cliente sem autorização.
4. Nomes: marca, domínio, serviços como o cliente os chama.
5. Dois perfis: da empresa e do cliente dela (quem decide, onde chega, como decide). Objetivo da página, ação esperada e critério de aceitação.
6. Pendências: `{{PENDENTE:P-nnn}}` no corpo e entrada em `pendencias` (id, `campo` do vocabulário fechado, `bloqueia`). Nunca invente um fato.
7. `tags` do `01`: `tipo:`, `nicho:`, `tem:`.
8. `node check-assets.js --root <cliente> --fase descoberta`; corrija e rode de novo.
9. Mostre o resumo; após o "sim", aprove (Gate Function do orquestrador).

## Red Flags: pare

- Escolher cor ou layout antes do `01` aprovado
- "O Instagram dela já mostra tudo"
- Caminho de arquivo que você não listou
- Preço, horário ou endereço "provável"

| Racionalização | Realidade |
|---|---|
| "Pergunto aos poucos" | Aos poucos custou retrabalho em todos os projetos anteriores: junte no início |
| "Vi a foto no Instagram, uso essa" | Referência não é asset: peça o arquivo e os direitos |
| "É uma suposição razoável" | Vira pendência com dono; o `publicar` bloqueia |
| "Falta pouco, desenho já" | O que falta e bloqueia o design bloqueia o design |
````

- [ ] **Step 2: Escrever `references/questionario.md`**

````markdown
# Questionário de entrada (único, em camadas)

Envie tudo de uma vez. O que o cliente não souber vira pendência (`campo` do vocabulário: contato, endereco, horario, preco, publico, escopo, area-atuacao, condicoes, correcao-tipografica).

## 1. Obrigatório para começar
Nome da marca · o que vende e para quem · cidade e bairro · canal de contato (WhatsApp comercial) · **objetivo da página e ação esperada do visitante** · o que torna a entrega aceitável (ex.: salão = pedido de horário pelo WhatsApp; espaço de eventos = pedido de orçamento) · há reserva no site ou só WhatsApp?

## 2. Importante, pode ficar pendente (com dono e data)
- Endereço **atual** (e antigos que ainda aparecem na internet), como chegar, estacionamento ou metrô
- Horário por dia, feriados, almoço, exceções; o mesmo em todos os canais?
- Lista **completa** de serviços, duração, preço (e se é "a partir de"), variações, o que **não** faz
- Quantas pessoas atendem; certificações e formação que pode divulgar; história curta
- Perfil dos clientes; perguntas e objeções mais comuns
- Depoimentos reais (fonte, autorização, nome a exibir: só o primeiro nome); nota e quantidade de avaliações
- Logo, cores e fonte (arquivo original, não print); redes sociais; ficha do Google (link e quem administra)

## 3. Condicional ao tipo de negócio
- **Sem loja (atende em campo):** lista de lugares e, por lugar, **o que a empresa faz** (visita, WhatsApp, envio) e se é garantido ou "conforme a agenda"; sede não é venda local
- **Saúde e bem-estar:** regras do conselho; sem promessa de cura; aviso de privacidade onde coleta dado
- **Com reserva ou agenda:** quem confirma e como; tempo entre sessões; antecedência mínima; limite por pessoa; como quer ser avisada; quem mais acessa; política de cancelamento e falta
- **Com e-mail transacional:** provedor que aceite SMTP ou API; e-mail que recebe os avisos

## 4. Decisões que só o Felipe ou o cliente tomam
Domínio desejado e **titular** (CPF ou CNPJ de quem), e-mail dono do domínio · quem paga e renova domínio e hospedagem · direito sobre fotos (quem fotografou, crédito) · o que **não** usar (imagem de IA, foto de cliente).

## Linha de base
Números de hoje (visitas, interações, contatos por mês), o que seria sucesso em 30 e 60 dias, e prints do painel do Google e do Instagram **antes** de o site entrar na ficha.
````

- [ ] **Step 3: Lint e GREEN (S01)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-descoberta`
Expected: `ok` com ≤ 550 palavras.

Rodar o cenário `S01` com o **prompt com skill** (`criar-landing-page` e `landing-descoberta`), salvar em `verde/S01.md`. Expected: `PASSA`. Em `FALHA`, tratar a racionalização (REFACTOR) e repetir.

- [ ] **Step 4: Checkpoint**

Run: `grep -h "^Resultado:" ~/projetos/criar-site/_testes-skills/verde/S01.md`
Expected: `Resultado: PASSA`.

---

## Task 15: `landing-direcao-visual`

**Spec:** seções 3.1 (passo 2), 3.5, 3.7.

**Files:**
- Create: `~/.claude/skills/landing-direcao-visual/SKILL.md`, `~/.claude/skills/landing-direcao-visual/references/perfis-e-estilos.md`

**Interfaces:**
- Consumes: `01`, `inventario-assets.md`, `check-assets --fase direcao-visual`, `pares-contraste.json`; baseline S02 e S03.
- Produces: `<cliente>/direcao-visual.md` aprovado e `<cliente>/pares-contraste.json`.

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: landing-direcao-visual
description: Use when o 01-negocio-e-escopo.md está aprovado e falta escolher o estilo visual de uma landing page, ou quando uma tela interna (agenda, painel) de um cliente precisa de visual. Não use para levantar dados do negócio (landing-descoberta).
---

# Landing: direção visual

Estilo vem do perfil da empresa e do perfil do cliente dela, não do gosto do momento.

## Iron Law

```
NENHUMA CONSTRUÇÃO SEM 2 OU 3 DIREÇÕES APRESENTADAS
E UMA ESCOLHIDA PELO FELIPE.
TODO VISUAL, INTERNO OU EXTERNO, PASSA POR frontend-design.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de direcao-visual`; ler o `01` e o `inventario-assets.md` **inteiros**; `node check-assets.js --root <cliente> --fase direcao-visual`. Não use a memória da conversa.

## Gate Function

1. Derive os eixos dos dois perfis (`references/perfis-e-estilos.md`).
2. **REQUIRED SUB-SKILL:** Use frontend-design:frontend-design para cada direção.
3. Cada direção traz: nome, ideia em uma frase, tipografia (display e texto, auto-hospedadas), paleta com hex, estrutura de seções, hero, assets por id (`A-nnn`) e o que falta, risco.
4. Para cada paleta, preencha `pares-contraste.json` e rode `node check-contrast.js --css <css> --pairs <pares>`; não apresente paleta reprovada.
5. Recomende **uma**, ligando a recomendação aos dois perfis.
6. Espere a escolha do Felipe. Grave `direcao-visual.md` (frontmatter, `escolhida`) e aprove.

Landing nova: **sem mockup**, construa a página (dá o mesmo trabalho). Adição a algo existente: mockup primeiro; depois de aprovado, confira item por item o construído contra o mostrado. Melhoria justificada durante a construção é permitida e vai para o registro de feedback.

## Revisão visual (antes do gate de publicação)

Hierarquia e tipografia coerentes · 375 e 1280 px, captura da **janela** (não `fullPage`), depois de rolar devagar · contraste (`check-contrast`) · estados de foco, hover, erro, vazio e carregamento · espaçamento, componentes e cores consistentes · CTA adequada ao negócio · a página **implementada**, não o mockup · `check-page`.

## Red Flags: pare

- Escolher o estilo "que achar melhor" e construir
- CSS genérico para tela interna "porque é só para ela"
- Apresentar uma direção só
- Asset citado sem id ou caminho inventado

| Racionalização | Realidade |
|---|---|
| "Interno não precisa de design" | A tela que o cliente usa todo dia faz parte da marca |
| "O Felipe falou 'o que achar melhor'" | Isso é delegação da recomendação, não da escolha |
| "Uma direção é mais rápida" | Duas ou três com recomendação foi mais rápido que discutir por texto |
| "A foto que eu preciso deve existir" | Registre a necessidade; nunca presuma o arquivo |
````

- [ ] **Step 2: Escrever `references/perfis-e-estilos.md`**

````markdown
# Do perfil ao estilo

## Eixos (responda com o `01`)
| Eixo | Pergunta | Puxa para |
|---|---|---|
| Emoção × informação | O visitante decide por confiança afetiva ou por especificação? | afetivo: foto de gente, tipografia calorosa · técnico: catálogo, números |
| B2C × B2B | Quem fala é uma pessoa ou uma equipe de compras? | B2C: poucas ações, WhatsApp à vista · B2B: prova, cobertura, CNPJ |
| Ticket e risco | Quanto custa errar a escolha? | alto: depoimentos, formação, política clara |
| Dispositivo e momento | Chega do Google no celular, decide agora? | celular primeiro, CTA fixa, texto curto |
| Presencial × campo | Onde o serviço acontece? | presencial: como chegar · campo: área de atuação |

## Famílias de partida (de projetos reais; adapte, não copie)
- **Acolhedor editorial** (massoterapia e depilação): serifa nos títulos, fundo papel ou linho, hero em arco, preços com linha pontilhada, botões em pílula, uma cor de ação (vinho). Cuidado: sem promessa de saúde.
- **Institucional técnico** (toalhas sob medida para buffets): linho e carvão, uma cor quente de destaque que **passe no contraste** (o laranja puro reprovou em 4,36:1), catálogo por modelo, cobertura em lista.
- **Festivo emocional** (festas para noivas): tipografia de alto contraste com tamanho óptico baixo e peso 700 em títulos grandes (traço fino some no celular), muita gente feliz nas fotos, galeria.

## Regras de composição que já custaram retrabalho
- Uma fonte por função dentro do mesmo componente; preço sempre no formato de preço
- Elemento decorativo precisa de tamanho visível e fundo que o sustente
- Ícone de marca é o oficial, junto do dado
- Corrigir **todas** as ocorrências quando um defeito aparece uma vez
- Menos escolhas por tela: primeiro o grupo grande, depois o detalhe
````

- [ ] **Step 3: Lint e GREEN (S02, S03)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-direcao-visual`
Expected: `ok`.

Rodar `S02` e `S03` com skill; salvar em `verde/`. Expected: ambos `PASSA`; senão REFACTOR.

- [ ] **Step 4: Checkpoint**

Run: `grep -h "^Resultado:" ~/projetos/criar-site/_testes-skills/verde/S02.md ~/projetos/criar-site/_testes-skills/verde/S03.md`
Expected: duas linhas `PASSA`.

---

## Task 16: `landing-software-extra`

**Spec:** seções 3.1 (passo 4), 3.9; regras do `cliente-a/05` e `06`.

**Files:**
- Create: `~/.claude/skills/landing-software-extra/SKILL.md`, `~/.claude/skills/landing-software-extra/references/agendamento.md`

**Interfaces:**
- Consumes: `01`, `plano.md`; baseline S03, S06, S11.
- Produces: `<cliente>/03-decisoes.md` aprovado **via comando**.

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: landing-software-extra
description: Use when uma landing page precisa de software além da página estática: agenda ou reserva, painel, API, banco, e-mail transacional, notificação, ou qualquer serviço que roda no servidor ao lado de outro sistema. Não use para páginas só de HTML, CSS e JS.
---

# Landing: software extra

Decisão de arquitetura é do dono do projeto. **Violar a letra é violar o espírito.**

## Iron Law

```
NENHUMA DECISÃO DE STACK, REDE OU RECURSO COMPARTILHADO
SEM PERGUNTAR ANTES. FASE DE ALTO RISCO: ACEITE SÓ VIA COMANDO DO FELIPE.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de software-extra`; ler `01` e `plano.md`; ler `references/agendamento.md` se houver reserva.

## Gate Function

1. Liste as decisões em aberto (stack, banco, onde roda, o que é compartilhado, e-mail, notificação, backup).
2. Para cada uma: opções, **recomendação com o porquê**, custo se errar. Pergunte; não escolha.
3. Registre no `03-decisoes.md` (D<nn>). Se contrariar uma regra global, registre `override: R-nnn` com a aprovação do Felipe.
4. O Felipe roda `! node approve.js --file <03> --fase software-extra --via comando`. Só então implemente.
5. Implemente com TDD. Revisor independente ao fim.
6. Depois do deploy: um caminho **real do vizinho** (ex.: `GET /api/health` do outro sistema) e `docker logs <proxy> --since 2m | grep -c "502\|refused"`.

## Regras fixas

- **Prefixo do projeto** em todo serviço, container e apelido de rede compartilhada (`agenda-api`, `agenda-db`). Antes de entrar numa rede, liste os nomes que o vizinho resolve (`set $api`, `upstream`, `proxy_pass`).
- Segredo só em `.env` do servidor, permissão 600; o que passou pelo chat se recomenda trocar.
- Horário, serviços e preços vêm de **uma** fonte (o banco); o HTML estático é só reserva.
- Nome da opção e duração são campos diferentes; a tela decide o que mostrar por regra explícita.
- Tela interna passa por `landing-direcao-visual` e `frontend-design`; adição tem mockup e conferência item por item.
- Produção: backup antes, `nginx -t` antes de recarregar, janela que não derruba, instrução de reversão escrita. O que exige root vira uma linha para o Felipe.

## Red Flags: pare

- Escolher o banco "porque é o melhor" · reutilizar o nome `api` · deploy sem backup
- Repetir no servidor um plano de 5.000 linhas que você mesmo executaria
- "Funcionou aqui" sem testar o vizinho

| Racionalização | Realidade |
|---|---|
| "A escolha é óbvia" | Se o Felipe descobrisse pelo código, ficaria surpreso? Então pergunte |
| "O nome curto é mais limpo" | `api` na rede `edge` derrubou o vizinho com 502 |
| "O aval foi para a landing" | Aprovação de um contexto não vale para o outro |
````

- [ ] **Step 2: Escrever `references/agendamento.md`**

````markdown
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
````

- [ ] **Step 3: Lint e GREEN (S06, S11, e S03 de novo)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-software-extra`
Expected: `ok`.

Rodar `S06`, `S11` e `S03` com skill; salvar em `verde/`. Expected: os três `PASSA`; senão REFACTOR.

- [ ] **Step 4: Checkpoint**

Run: `grep -h "^Resultado:" ~/projetos/criar-site/_testes-skills/verde/S0[36].md ~/projetos/criar-site/_testes-skills/verde/S11.md`
Expected: três `PASSA`.

---

## Task 17: `landing-publicar`

**Spec:** seções 3.9, 5 (publicação), 3.5 (revisão).

**Files:**
- Create: `~/.claude/skills/landing-publicar/SKILL.md`, `~/.claude/skills/landing-publicar/references/cloudflare-cache.md`

**Interfaces:**
- Consumes: kit (`check-*`, `authorize`, `publicar`); baseline S04.
- Produces: `<cliente>/publicacao.md` aprovado via comando e o site publicado.

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: landing-publicar
description: Use when uma landing page está pronta para ir ao ar: publicar, fazer deploy, configurar domínio ou Cloudflare, limpar cache, ou conferir o site já publicado. Não use para construir a página (criar-landing-page).
---

# Landing: publicar

Produção é do Felipe. **Violar a letra é violar o espírito.**

## Iron Law

```
NADA EM PRODUÇÃO SEM AVAL EXPLÍCITO.
NENHUM "PRONTO" SEM VERIFICAÇÃO NA URL PUBLICADA.
```

**Primeira ação:** `node check-gate.js --cliente <nome> --antes-de publicacao`; ler `01`, `03` (se existir) e o `02` (pendências e reações abertas). Não use a memória da conversa.

## Gate Function

1. Rode **antes** do deploy, no site local, e cole a saída real em `publicacao.md`: `check-refs`, `check-contrast`, `check-content` (com `--segredos <cliente>`), `check-assets --fase publicacao --site <site>`, `check-page` (375 e 1280), e o Lighthouse mobile quando houver. Qualquer saída ≠ 0, ou ausente, reprova.
2. Capture a **janela** em 375 e 1280 e abra os arquivos.
3. Liste em `publicacao.md` o que **não** foi verificado.
4. O Felipe roda `! node approve.js --file <publicacao.md> --fase publicacao --via comando` e `! node authorize.js --cliente <nome> --fase publicacao --acao publicar --destino <destino>`.
5. `bash publicar.sh --root <site> --dest <destino> --cliente <nome>` (dry-run); mostre a saída; só então `--executar`.
6. Depois: limpar o cache do Cloudflare, `node check-cache.js --url <https://...>`, abrir o site publicado com um navegador **novo**, e testar um caminho real do vizinho se houver recurso compartilhado.
7. Só então diga "pronto", com o que foi e o que não foi verificado.

Cloudflare: se o MCP do Cloudflare estiver disponível, use-o para zona, registros e purge; senão, entregue ao Felipe a lista de passos de `references/cloudflare-cache.md`. Destino remoto: `publicar.js` só imprime os passos.

## Red Flags: pare

- Escrever `aprovado: true` ou o token à mão · publicar "porque foi aprovado ontem"
- Dizer "pronto" olhando só o arquivo local
- Verificar só a home · navegador com cache velho

| Racionalização | Realidade |
|---|---|
| "O layout foi aprovado" | Layout aprovado não é autorização de ação em produção |
| "O dry-run passou" | Dry-run não é publicação nem verificação |
| "O arquivo está certo" | Confira o HTML **servido** e o cache real |
| "Falhou parcialmente, ajusto na mão" | Use o comando de reversão impresso e recomece |
````

- [ ] **Step 2: Escrever `references/cloudflare-cache.md`**

````markdown
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
````

- [ ] **Step 3: Lint e GREEN (S04)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-publicar`
Expected: `ok`. Rodar `S04` com skill → `verde/S04.md`. Expected: `PASSA`; senão REFACTOR.

- [ ] **Step 4: Checkpoint dos níveis 1 e 2 (skills)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/criar-landing-page ~/.claude/skills/landing-descoberta ~/.claude/skills/landing-direcao-visual ~/.claude/skills/landing-software-extra ~/.claude/skills/landing-publicar && grep -h "^Resultado:" ~/projetos/criar-site/_testes-skills/verde/*.md | sort | uniq -c`
Expected: 5 skills `ok`; todos os cenários rodados até aqui (S01 a S04, S06, S07, S09, S10, S11, S03, S02) com `PASSA`.


## Task 18: Verificação dos níveis 1 e 2 (fluxo completo automatizado, ponta a ponta com agente e custo operacional)

**Spec:** seção 3.10, 7 ("clientes fictícios"), 7.1 itens 6 e 11.

**Files:**
- Create: `K/test/e2e.test.js`, `~/projetos/criar-site/_testes-skills/fixtures/{salao,eventos,profissional,agenda}.md`, `~/projetos/criar-site/_testes-skills/raiz-e2e/_regras-vivas.md`, `~/projetos/criar-site/_evolucao.md`

**Interfaces:**
- Consumes: kit (Tasks 1-10), modelos (Task 12), skills dos níveis 1 e 2 (Tasks 13-17).
- Produces: prova de que os scripts e os modelos funcionam encadeados; o registro de custo do nível 2 em `_evolucao.md`; uma **decisão do Felipe** sobre seguir para o nível 3.

- [ ] **Step 1: Teste automatizado do fluxo completo (falha primeiro por falta de ajuste, se houver)**

```js
// kit/test/e2e.test.js
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse, stringify } from "../lib/fm.js";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const M = path.join(os.homedir(), ".claude", "skills", "criar-landing-page", "assets", "modelos");
const conv = (raiz, f, fase) => run("approve.js", ["--file", f, "--fase", fase, "--via", "conversa", "--citacao", "sim, pode seguir"], { raiz });

test("fluxo completo: modelos → gates → pendência → checagens → publicação em destino local", () => {
  const raiz = tmpRaiz();
  const dir = novoCliente(raiz, "salao-aurora");
  for (const f of ["01-negocio-e-escopo.md", "direcao-visual.md", "plano.md", "publicacao.md", "inventario-assets.md", "02-registro-de-feedback-por-etapa.md"]) fs.copyFileSync(path.join(M, f), path.join(dir, f));

  const f01 = path.join(dir, "01-negocio-e-escopo.md");
  const { fm, body } = parse(fs.readFileSync(f01, "utf8"));
  fm.tags = ["tipo:b2c", "nicho:beleza"];
  fm.pendencias = [{ id: "P-001", campo: "endereco", status: "pendente", bloqueia: "publicacao" }];
  fs.writeFileSync(f01, stringify(fm, `${body}\nEndereço: {{PENDENTE:P-001}}\n`));
  assert.equal(conv(raiz, f01, "descoberta").code, 0);
  assert.equal(run("check-gate.js", ["--cliente", "salao-aurora", "--antes-de", "direcao-visual"], { raiz }).code, 0);
  assert.equal(conv(raiz, path.join(dir, "direcao-visual.md"), "direcao-visual").code, 0);
  assert.equal(conv(raiz, path.join(dir, "plano.md"), "plano").code, 0);

  const site = path.join(tmpRaiz(), "site"); fs.mkdirSync(path.join(site, "css"), { recursive: true });
  fs.writeFileSync(path.join(site, "css/s.css"), ":root{--fg:#2A2623;--bg:#F6F1E9;--btn:#0F6E5B;--branco:#FFFFFF}");
  const html = (end) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="Salão Aurora"><link rel="stylesheet" href="css/s.css?v=1"></head><body><h1>Aurora</h1><p>Endereço: ${end}</p><a href="https://wa.me/5511999999999">Agendar</a></body></html>`;
  fs.writeFileSync(path.join(site, "index.html"), html("{{PENDENTE:P-001}}"));

  const dest = path.join(tmpRaiz(), "www");
  const pub = path.join(dir, "publicacao.md");
  run("approve.js", ["--file", pub, "--fase", "publicacao", "--via", "comando"], { raiz });
  run("authorize.js", ["--cliente", "salao-aurora", "--fase", "publicacao", "--acao", "publicar", "--destino", dest], { raiz });
  assert.equal(run("publicar.js", ["--root", site, "--dest", dest, "--cliente", "salao-aurora"], { raiz }).code, 1, "PENDENTE no site bloqueia");

  assert.equal(run("resolve-pendencia.js", ["--file", f01, "--id", "P-001", "--valor", "Rua das Flores, 10, São Paulo", "--fonte", "cliente, WhatsApp"], { raiz }).code, 0);
  fs.writeFileSync(path.join(site, "index.html"), html("Rua das Flores, 10, São Paulo"));

  const regras = path.join(dir, "regras-site.json"); fs.copyFileSync(path.join(M, "regras-site.json"), regras);
  const pares = path.join(dir, "pares-contraste.json"); fs.copyFileSync(path.join(M, "pares-contraste.json"), pares);
  assert.equal(run("check-refs.js", ["--root", site]).code, 0);
  assert.equal(run("check-content.js", ["--root", site, "--rules", regras, "--segredos", dir]).code, 0);
  assert.equal(run("check-contrast.js", ["--css", path.join(site, "css/s.css"), "--pairs", pares]).code, 0);

  assert.equal(run("authorize.js", ["--cliente", "salao-aurora", "--fase", "publicacao", "--acao", "publicar", "--destino", dest], { raiz }).code, 0);
  const r = run("publicar.js", ["--root", site, "--dest", dest, "--cliente", "salao-aurora", "--executar"], { raiz });
  assert.equal(r.code, 0, r.err);
  assert.match(fs.readFileSync(path.join(dest, "index.html"), "utf8"), /Rua das Flores/);

  fs.appendFileSync(f01, "\nPúblico agora inclui empresas.\n");
  assert.equal(run("check-gate.js", ["--cliente", "salao-aurora", "--antes-de", "publicacao"], { raiz }).code, 6, "mudança material no 01 reabre tudo");
});
```

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node --test "test/e2e.test.js"`
Expected: PASS. Qualquer falha aqui é um defeito de integração entre scripts e modelos: corrigir **no script ou no modelo**, com um teste unitário que falhava, e repetir.

- [ ] **Step 2: Criar os quatro clientes fictícios (briefs fixos)**

Cada arquivo de `fixtures/` tem `## Brief` (o que o Felipe diria), `## Respostas do cliente ao questionário` (para alimentar a descoberta) e `## O que a direção visual deve levar em conta`.

`salao.md`: Salão Aurora, cabelo e unhas, Pinheiros (São Paulo), 3 profissionais, B2C, decide pelo WhatsApp, chega do Instagram no celular; serviços e preços "a partir de"; horário ter a sáb 9h-19h; pendências: endereço exato e fotos do espaço; tags `tipo:b2c nicho:beleza tem:formulario-whatsapp`.

`eventos.md`: Espaço Vila Nova, salão de festas para 150 pessoas em Campinas, B2C emocional (casamentos e aniversários), decide por visita e orçamento; fotos de terceiros (fotógrafo com marca d'água, direito pendente); depoimentos de noivas; tags `tipo:b2c nicho:eventos tem:fotos-de-terceiros tem:depoimentos tem:formulario-whatsapp`.

`profissional.md`: Contabilidade Prado, contador autônomo em Bauru, B2B para pequenas empresas, decide por indicação e e-mail, chega do Google; tom sóbrio; CNPJ no rodapé; sem preços; tags `tipo:b2b nicho:servico-profissional`.

`agenda.md`: Studio Zen, massoterapia com agenda integrada (reserva no site, aprovação pela dona, avisos no celular), no mesmo servidor de outro sistema; tags `tipo:b2c nicho:saude tem:agenda tem:software-extra tem:cloudflare tem:docker-compartilhado tem:email-transacional`; sem promessa de cura.

(Escrever cada arquivo com 15 a 30 linhas e dados verossímeis, **marcados como fictícios** no topo. Nenhum dado de pessoa real.)

- [ ] **Step 3: Rodar um agente de ponta a ponta até o gate da direção visual**

Raiz isolada: `mkdir -p ~/projetos/criar-site/_testes-skills/raiz-e2e && cp ~/.claude/skills/criar-landing-page/assets/modelos/regras-vivas.md ~/projetos/criar-site/_testes-skills/raiz-e2e/_regras-vivas.md` (regras v0, vazias, porque a migração real é a Task 22).

Rodada 1, subagente `general-purpose` **novo** (anotar o horário com `date +%s` antes e depois):

> Você trabalha para o Felipe. Use `CRIAR_SITE_ROOT=/home/acerola/projetos/criar-site/_testes-skills/raiz-e2e` em **todos** os comandos node. Siga as skills em `~/.claude/skills/criar-landing-page/SKILL.md`, `landing-descoberta` e `landing-direcao-visual`. Pedido do Felipe: "Cria a landing do Salão Aurora" (brief em `/home/acerola/projetos/criar-site/_testes-skills/fixtures/salao.md`, seção Brief). Você pode executar comandos e escrever arquivos **só dentro da raiz acima**. Pare quando precisar da resposta do cliente ou do Felipe e descreva exatamente o que pediu.

Expected: o agente faz o Passo 0 (sobre `_regras-vivas.md` v0 existente), cria `salao-aurora/` com os modelos, envia **o** questionário e para.

Rodada 2, subagente **novo** (sem o contexto da rodada 1; o estado vem só do disco): fornecer as "Respostas do cliente" do `salao.md` e dizer "o Felipe aprovou o resumo do 01 com um 'sim, pode seguir'" (simulado). Expected: o agente preenche `01` e inventário, roda `check-assets`, aprova a descoberta (`via conversa` com citação), roda `check-gate --antes-de direcao-visual`, apresenta 2 ou 3 direções com recomendação e **para** esperando a escolha, sem escrever HTML do site.

Run: `cd ~/projetos/criar-site/_testes-skills/raiz-e2e/salao-aurora && ls && head -12 01-negocio-e-escopo.md && cat auditoria.log && ls | grep -c "\.html$"`
Expected: `01` e `inventario-assets.md` preenchidos; auditoria com `approve` de `descoberta`; **0** arquivos `.html`; `direcao-visual.md` com `aprovado: false`.

- [ ] **Step 4: Medir o custo operacional (3.10) e registrar**

Criar `~/projetos/criar-site/_evolucao.md`:

````markdown
# Evolução das skills de landing page

## Medição do nível 2 (cliente fictício: salão Aurora)
- Tempo da rodada 1: <s> · rodada 2: <s>
- Intervenções não previstas do Felipe: <n> (listar quais)
- Aprovações reabertas: <n>
- Falsos positivos de validador: <n> (listar)
- Passos do fluxo que o agente pulou ou repetiu: <lista>
- Comparação com o fluxo reduzido (mesmo briefing, sem gates por hash): defeitos achados <n> e tempo <s>; diferença que paga ou não o custo: <análise em 3 linhas>
````

Preencher com os valores reais. **Não preencher com estimativa.**

- [ ] **Step 5: Checkpoint com o Felipe (decisão, não formalidade)**

Mostrar ao Felipe: o resultado de `npm test`, o conteúdo do `_evolucao.md` acima e o que foi simplificado ou o que ficou pesado. Perguntar: "Os gates e a cerimônia pagam o custo? Seguimos para o nível 3 como está, ou simplificamos algum controle antes?". **Só continuar para a Task 19 depois da resposta.** Se a resposta for simplificar, abrir uma tarefa de ajuste com teste que falha antes de seguir.

---

# NÍVEL 3: aprendizado

## Task 19: `landing-registrar-feedback`

**Spec:** seção 4 (protocolo), 3.3 (rigor proporcional).

**Files:**
- Create: `~/.claude/skills/landing-registrar-feedback/SKILL.md`

**Interfaces:**
- Consumes: `record-feedback.js` (Task 8); baseline S05.
- Produces: o comportamento "SEMPRE" de registro durante o trabalho.

- [ ] **Step 1: Escrever a skill (a mais curta do conjunto)**

````markdown
---
name: landing-registrar-feedback
description: Use when SEMPRE durante o trabalho em uma landing page de cliente: ao entregar qualquer coisa (texto, foto, tela, deploy) e ao receber reação, correção, elogio ou aprovação do Felipe ou do cliente.
---

# Landing: registrar feedback

O registro acontece **durante** o trabalho, não depois. **Violar a letra é violar o espírito.**

## Iron Law

```
NENHUMA RESPOSTA COM REAÇÃO OU ENTREGA TERMINA
SEM A ENTRADA E<nn> GRAVADA E RELIDA.
```

## Gate Function

1. **Triagem.** É reação a algo entregue? Pergunta, pedido de alteração e preferência pontual sem reação não são feedback. Ajuste de baixo risco sem reação não gera entrada.
2. **Primeira coisa da resposta**, se há reação:

```
<draft-feedback>
entregavel: <nome>
reacao: "<frase literal>"
escopo: <toda-landing|b2c|b2b|saude-bem-estar|so-este-cliente>
</draft-feedback>
```

3. Resolva o problema técnico normalmente.
4. **Última ação da resposta**, antes de devolver o turno:
`node ~/.claude/skills/criar-landing-page/assets/kit/record-feedback.js --cliente <nome> --entregavel "<…>" --escopo <…> --tipo explicito --reacao "<frase literal>" [--evidencia preferencia|defeito|requisito|resultado-medido] [--impacto baixo|medio|alto] [--licao "<regra>"] [--ja-aconteceu "<cliente>/E<nn>"]`
5. O comando imprime `E<nn>` só depois de reler o arquivo. Escreva "E<nn> gravada". Se falhar, **diga** que falhou e mantenha o bloco visível.
6. **Hipótese** (você inferiu, ninguém disse): `--tipo hipotese --hipotese "<texto>"`, sem `--reacao`. Nunca entre aspas.

**Antes de uma entrega nova**, leia as entradas da mesma categoria no `02` de todos os clientes e as regras do `_regras-vivas.md`; se houver `<draft-feedback>` na conversa sem `E<nn>` gravada depois dele, grave-o primeiro.

## Red Flags: pare

- "Registro no fim do projeto" · "Foi um comentário pequeno" · "Estou no meio de uma refatoração"
- Gravar uma suposição como se fosse citação
- Dizer "registrado" sem ter rodado o comando

| Racionalização | Realidade |
|---|---|
| "Perco o fio se parar agora" | Por isso o registro é a **última** ação, e o bloco vem primeiro |
| "Resumo com minhas palavras" | A reação entra **citada** |
| "O script falhou, anoto mentalmente" | Não existe buffer oculto: avise a falha e mantenha o bloco |
| "É óbvio que ele não gostou" | Isso é hipótese: `--tipo hipotese` |
````

- [ ] **Step 2: Lint e GREEN (S05)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-registrar-feedback`
Expected: `ok`. Rodar `S05` com a skill → `verde/S05.md`. Expected: `PASSA`; senão REFACTOR.

- [ ] **Step 3: Prova de uso real do script**

Run: `mkdir -p /tmp/fb && cd /tmp/fb && export CRIAR_SITE_ROOT=/tmp/fb && mkdir -p /tmp/fb/teste-fb && node ~/.claude/skills/criar-landing-page/assets/kit/record-feedback.js --cliente teste-fb --entregavel "Botão" --escopo toda-landing --tipo explicito --reacao "ficou feio" && tail -16 /tmp/fb/teste-fb/02-registro-de-feedback-por-etapa.md; rm -rf /tmp/fb`
Expected: imprime `E01` e o arquivo traz a entrada com `processado: não`.

---

## Task 20: `landing-evoluir-skill`

**Spec:** seções 4 ("Depois"), 3.8, 3.11, 6.

**Files:**
- Create: `~/.claude/skills/landing-evoluir-skill/SKILL.md`

**Interfaces:**
- Consumes: `processar-feedback.js` (Task 10), `check-regras.js` (Task 9), `lint-skill.mjs` e os cenários (Task 11); baseline S08.
- Produces: o processo de redesenho e o modo migração (Task 22).

- [ ] **Step 1: Escrever a skill**

````markdown
---
name: landing-evoluir-skill
description: Use when o Felipe pede para redesenhar skills de landing page, revisar aprendizados acumulados, processar feedbacks pendentes, atualizar o _regras-vivas.md, fazer a migração inicial das regras, ou quando o Passo 0 oferece a migração. Não use durante a construção de um cliente.
---

# Landing: evoluir as skills

Transforma feedback bruto em regra verificada. **Regra sem teste vira dogma.** Violar a letra é violar o espírito.

## Iron Law

```
NENHUMA REGRA SEM EVIDÊNCIA E ESCOPO.
NENHUMA EDIÇÃO DE SKILL SEM UM TESTE QUE FALHA ANTES.
```

**REQUIRED BACKGROUND:** superpowers:writing-skills (cenários de pressão com subagente; RED, GREEN, REFACTOR).

## Gate Function

1. **Listar:** `node kit/processar-feedback.js listar` (kit = `~/.claude/skills/criar-landing-page/assets/kit`). Agrupe por escopo e categoria.
2. **Paralelos:** para cada lição, procure a mesma em outros clientes (`grep -n` nos `02` e nos `05-aprendizados.md`) e leia as entradas. Evidência `defeito` ou `resultado-medido` pesa mais que `preferencia`. Hipótese não conta.
3. **Classificar** pela matriz:

| Situação | Destino |
|---|---|
| Repetida e generalizável | candidata a regra geral |
| Repetida, dependente do ambiente | regra com tags (`aplica_quando`) |
| Rara, alto impacto (segredo exposto) | regra de segurança, mesmo com uma ocorrência |
| Subjetiva, sem confirmação | permanece hipótese |
| Sem benefício ou já coberta por script | não promover |

4. **Regra nova:** id `R-nnn`, evidência real (`cliente/E<nn>`), escopo, `aplica_quando` do vocabulário fechado, `nao_se_aplica_quando`, critério de remoção, checagem (script do kit ou `nenhuma`) e skill responsável.
5. **Se a regra muda uma skill:** escreva o cenário de pressão em `_testes-skills/cenarios/`, rode **sem** a mudança (RED, registre a racionalização), edite, rode **com** (GREEN), feche as brechas (REFACTOR). Sem RED, apague a edição.
6. **Poda obrigatória:** remova ou funda regras redundantes, duplicadas entre skills ou cobertas por script. Nenhum redesenho só acrescenta. `node _testes-skills/lint-skill.mjs <skill>` antes e depois (palavras).
7. **Validar:** `node kit/check-regras.js --file ~/projetos/criar-site/_regras-vivas.md` e o teste de seleção por tags dos clientes fictícios.
8. **Fechar:** `node kit/processar-feedback.js marcar --versao v<N>`; registrar em `_evolucao.md`: o que mudou, o que foi podado e as métricas (aprovações reabertas, erros por categoria, regressões, falsos positivos, vezes em que o Felipe lembrou o registro).

**Modo migração:** mesmo processo com todas as entradas `processado: não`, partindo dos `05-aprendizados.md`, gerando `_regras-vivas.md` v1 e `_evolucao.md`. Divida o arquivo em `_regras-vivas/` só por critério medido (tamanho, falha de recuperação, categoria com volume).

## Red Flags: pare

- "Aconteceu uma vez, vira regra geral" (exceto segurança)
- "É óbvio, pulo o teste" · evidência inventada ou sem `E<nn>` real
- Regra de um cliente promovida a global · acrescentar sem podar

| Racionalização | Realidade |
|---|---|
| "O Felipe gosta, então é regra" | Preferência sem confirmação fica como hipótese com escopo |
| "É só uma linha na skill" | Edição sem RED é a mesma violação do TDD |
| "Duas ocorrências bastam" | Frequência é prioridade, não critério: avalie aplicabilidade e risco |
| "Mais regras, mais segurança" | Regra demais vira ruído; podar é parte do trabalho |
````

- [ ] **Step 2: Lint e GREEN (S08)**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/landing-evoluir-skill`
Expected: `ok`. Rodar `S08` com a skill → `verde/S08.md`. Expected: `PASSA`; senão REFACTOR.

---

## Task 21: Testes de disparo (as sete descrições)

**Spec:** seção 3.0, 7.

**Files:**
- Create: `~/projetos/criar-site/_testes-skills/{disparo.json,extrair-descricoes.mjs,pontuar-disparo.mjs,pontuar-disparo.test.mjs}`

**Interfaces:**
- Produces: `node extrair-descricoes.mjs` imprime as descrições das sete skills e de três skills concorrentes; `node pontuar-disparo.mjs <casos.json> <respostas.json>` compara; sai ≠ 0 se algum caso errar.

- [ ] **Step 1: Teste do pontuador (falha primeiro)**

```js
// pontuar-disparo.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const aqui = path.dirname(new URL(import.meta.url).pathname);
const arq = (n, o) => { const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "d-")), n); fs.writeFileSync(f, JSON.stringify(o)); return f; };
const casos = [{ id: "D01", frase: "a", esperada: "x" }, { id: "D02", frase: "b", esperada: "nenhuma" }];

test("tudo certo → 0; um erro → 1 e mostra qual", () => {
  const ok = spawnSync("node", [path.join(aqui, "pontuar-disparo.mjs"), arq("c.json", casos), arq("r.json", { D01: "x", D02: "nenhuma" })], { encoding: "utf8" });
  assert.equal(ok.status, 0);
  const ruim = spawnSync("node", [path.join(aqui, "pontuar-disparo.mjs"), arq("c.json", casos), arq("r.json", { D01: "y" })], { encoding: "utf8" });
  assert.equal(ruim.status, 1);
  assert.match(ruim.stderr, /D01.*esperado x/);
  assert.match(ruim.stderr, /D02.*sem resposta/);
});
```

Run: `cd ~/projetos/criar-site/_testes-skills && node --test pontuar-disparo.test.mjs`
Expected: FAIL (`pontuar-disparo.mjs` inexistente).

- [ ] **Step 2: Implementar os dois scripts**

```js
// pontuar-disparo.mjs
import fs from "node:fs";
const [, , casosPath, respPath] = process.argv;
if (!casosPath || !respPath) { console.error("uso: node pontuar-disparo.mjs <casos.json> <respostas.json>"); process.exit(2); }
const casos = JSON.parse(fs.readFileSync(casosPath, "utf8"));
const resp = JSON.parse(fs.readFileSync(respPath, "utf8"));
let erros = 0;
for (const c of casos) {
  const r = resp[c.id];
  if (r !== c.esperada) { erros++; console.error(`ERRO ${c.id}: esperado ${c.esperada}, veio ${r ?? "(sem resposta)"} :: ${c.frase}`); }
}
console.log(`${casos.length - erros}/${casos.length} corretos`);
process.exit(erros ? 1 : 0);
```

```js
// extrair-descricoes.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const nomes = ["criar-landing-page", "landing-descoberta", "landing-direcao-visual", "landing-software-extra", "landing-publicar", "landing-registrar-feedback", "landing-evoluir-skill"];
for (const n of nomes) {
  const t = fs.readFileSync(path.join(os.homedir(), ".claude", "skills", n, "SKILL.md"), "utf8");
  console.log(`- ${n}: ${t.match(/^description: (.+)$/m)[1]}`);
}
console.log("- frontend-design:frontend-design: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.");
console.log("- superpowers:brainstorming: You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.");
console.log("- superpowers:writing-skills: Use when creating new skills, editing existing skills, or verifying skills work before deployment");
```

Run: `cd ~/projetos/criar-site/_testes-skills && node --test pontuar-disparo.test.mjs`
Expected: PASS.

- [ ] **Step 3: Criar `disparo.json` (casos positivos e negativos)**

```json
[
  { "id": "D01", "frase": "Preciso de uma landing page para a clínica da Dra. Marta, em Londrina.", "esperada": "criar-landing-page" },
  { "id": "D02", "frase": "Vamos retomar o site da Daniela, onde a gente parou?", "esperada": "criar-landing-page" },
  { "id": "D03", "frase": "Refaz o site da loja de toalhas, uma página só.", "esperada": "criar-landing-page" },
  { "id": "D04", "frase": "Abri a pasta criar-site/studio-zen, bora montar a página.", "esperada": "criar-landing-page" },
  { "id": "D05", "frase": "Cliente novo: uma confeitaria em Santos. Ainda não temos nada além do Instagram.", "esperada": "landing-descoberta" },
  { "id": "D06", "frase": "Manda o questionário de entrada para a dona do ateliê.", "esperada": "landing-descoberta" },
  { "id": "D07", "frase": "Faltam as fotos e o endereço atual do cliente, o que perguntamos?", "esperada": "landing-descoberta" },
  { "id": "D08", "frase": "O 01 está aprovado, agora define o estilo da página.", "esperada": "landing-direcao-visual" },
  { "id": "D09", "frase": "Quero ver duas ou três opções de visual para o salão antes de construir.", "esperada": "landing-direcao-visual" },
  { "id": "D10", "frase": "A tela de agenda interna precisa de visual, no padrão do site.", "esperada": "landing-direcao-visual" },
  { "id": "D11", "frase": "A landing vai ter reserva online, painel da dona e e-mail de confirmação.", "esperada": "landing-software-extra" },
  { "id": "D12", "frase": "Preciso subir uma API com banco no mesmo servidor do outro sistema.", "esperada": "landing-software-extra" },
  { "id": "D13", "frase": "Qual stack usamos para a agenda do cliente?", "esperada": "landing-software-extra" },
  { "id": "D14", "frase": "Pode publicar a landing no servidor agora?", "esperada": "landing-publicar" },
  { "id": "D15", "frase": "O CSS antigo continua aparecendo no celular depois do deploy, limpa o cache do Cloudflare.", "esperada": "landing-publicar" },
  { "id": "D16", "frase": "Configura o domínio e a zona do Cloudflare para o site novo.", "esperada": "landing-publicar" },
  { "id": "D17", "frase": "Esse botão ficou feio no celular, já tinha falado do contraste.", "esperada": "landing-registrar-feedback" },
  { "id": "D18", "frase": "Amei a direção B, pode seguir com ela.", "esperada": "landing-registrar-feedback" },
  { "id": "D19", "frase": "Isso que você fez com o formulário está errado, o horário de sábado é até as 11.", "esperada": "landing-registrar-feedback" },
  { "id": "D20", "frase": "Vamos redesenhar as skills de landing page com o que aprendemos nos últimos sites.", "esperada": "landing-evoluir-skill" },
  { "id": "D21", "frase": "Processa os feedbacks pendentes e atualiza o _regras-vivas.md.", "esperada": "landing-evoluir-skill" },
  { "id": "D22", "frase": "Faz a migração inicial das regras a partir dos três clientes.", "esperada": "landing-evoluir-skill" },
  { "id": "D23", "frase": "Cria um componente React de tabela com ordenação e paginação.", "esperada": "nenhuma" },
  { "id": "D24", "frase": "Explica como funciona o event loop do Node.", "esperada": "nenhuma" },
  { "id": "D25", "frase": "Escreve uma skill nova para revisar pull requests.", "esperada": "superpowers:writing-skills" },
  { "id": "D26", "frase": "Quero criar um aplicativo de lista de tarefas, vamos pensar no que ele precisa.", "esperada": "superpowers:brainstorming" },
  { "id": "D27", "frase": "Dá uma cara mais distintiva para este dashboard interno que já existe.", "esperada": "frontend-design:frontend-design" },
  { "id": "D28", "frase": "Faz o commit das mudanças de hoje.", "esperada": "nenhuma" }
]
```

- [ ] **Step 4: Rodar a classificação em lote com subagentes**

Run: `cd ~/projetos/criar-site/_testes-skills && node extrair-descricoes.mjs > /tmp/descricoes.txt && cat /tmp/descricoes.txt | head -3`
Expected: 10 linhas (7 skills mais 3 concorrentes).

Disparar **um** subagente novo (`general-purpose`) com: o conteúdo de `/tmp/descricoes.txt`; as 28 frases de `disparo.json` (sem o campo `esperada`); a instrução "Para cada frase escolha UMA skill que você invocaria primeiro, ou `nenhuma`. Responda **só** com JSON `{\"D01\": \"nome\", …}`". Salvar a resposta em `respostas-disparo.json`.

Run: `cd ~/projetos/criar-site/_testes-skills && node pontuar-disparo.mjs disparo.json respostas-disparo.json`
Expected: `28/28 corretos`. Se algum errar, o erro aponta a frase: ajustar a `description` da skill envolvida (gatilho específico, sem resumir o fluxo), rodar o lint e **repetir a classificação com um subagente novo** até 28/28. Registrar em `_evolucao.md` quais descrições mudaram e por quê.

- [ ] **Step 5: Checkpoint**

Run: `node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/{criar-landing-page,landing-descoberta,landing-direcao-visual,landing-software-extra,landing-publicar,landing-registrar-feedback,landing-evoluir-skill}`
Expected: 7 `ok`.

---

## Task 22: Migração inicial (`_regras-vivas.md` v1 e `_evolucao.md`)

**Spec:** seções 6, 3.8, 3.11, 7.1 item 5.

**Files:**
- Create/Modify: `~/projetos/criar-site/_regras-vivas.md`, `~/projetos/criar-site/_evolucao.md` (acrescentar), `~/projetos/criar-site/_testes-skills/migracao/candidatas.md`, `~/projetos/criar-site/_testes-skills/selecao.test.mjs`
- Modify: os `02-registro-de-feedback-por-etapa.md` dos três clientes (só pelo `processar-feedback.js marcar`)

**Interfaces:**
- Consumes: `landing-evoluir-skill` em **modo migração** (Task 20), `processar-feedback.js`, `check-regras.js`.
- Produces: `_regras-vivas.md` v1 válido; as entradas dos três clientes `processado: v1`.

- [ ] **Step 1: Pré-condição e estado inicial**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node processar-feedback.js listar --contar && node processar-feedback.js listar | cut -f1 | cut -d/ -f1 | sort | uniq -c`
Expected: um total na casa de 80+ (E00 a E31 da Cliente A e da Cliente B, mais as da Cliente C), distribuído entre `cliente-a`, `cliente-b` e `cliente-c`. Anotar os números em `_evolucao.md` ("antes da migração").

- [ ] **Step 2: Montar a tabela de candidatas lendo as entradas (modo migração)**

Seguir a Gate Function da `landing-evoluir-skill` passos 1 a 3. Entrada: os três `02-registro-de-feedback-por-etapa.md`, os três `05-aprendizados.md` (seção "Regras vivas") e `06-redesign-agenda-aprendizados.md`. Saída: `_testes-skills/migracao/candidatas.md`, uma linha por lição:

| Lição | Clientes | Entradas (`cliente/E<nn>`) | Escopo | Tipo de evidência | Destino pela matriz |
|---|---|---|---|---|---|

Pontos de partida (a migração **confirma cada um nas entradas reais e corrige o id**; nenhum id citado aqui é confiável até o `check-regras` aceitar):

| Semente | Categoria | Skill | Escopo | Severidade |
|---|---|---|---|---|
| Perguntar antes de decidir stack, arquitetura ou compartilhamento | processo | landing-software-extra | geral | obrigatoria |
| Instrução de processo (skill de design, padrão da Cliente B, voz em "nós") vale para todo entregável, interno ou externo | processo | landing-direcao-visual | geral | obrigatoria |
| Kit de checagem no dia 1; cada fato corrigido vira regra de teste antes da correção | processo | criar-landing-page | geral | obrigatoria |
| Mockup só para adição; landing nova se constrói direto; conferir item por item o construído contra o mostrado | design | landing-direcao-visual | geral | recomendada |
| Questionário único; o que falta vira PENDENTE que bloqueia a publicação | processo | landing-descoberta | geral | obrigatoria |
| Prefixo do projeto em recurso compartilhado; testar um caminho real do vizinho e olhar 502 depois | infra | landing-software-extra | `tem:docker-compartilhado` | obrigatoria |
| Abrir o arquivo gerado e verificar na URL publicada; relatar o que não foi verificado | processo | landing-publicar | geral | obrigatoria |
| Segredo só em `.env` do servidor (600); recomendar trocar o que passou pelo chat | infra | landing-software-extra | `tem:software-extra` | obrigatoria |
| Produção só com aval, backup antes, `nginx -t`, reversão escrita | infra | landing-publicar | `fase:publicacao` | obrigatoria |
| Cache: TTL respeitando o servidor, ofuscação de e-mail desligada, img/fonts imutáveis com nome novo, css/js versionados, limpar a cada publicação, verificar com navegador novo | infra | landing-publicar | `tem:cloudflare` | obrigatoria |
| Lighthouse na URL publicada, não no servidor local | infra | landing-publicar | `fase:publicacao` | recomendada |
| Uma fonte por função dentro do mesmo componente; preço no formato de preço | design | landing-direcao-visual | geral | recomendada |
| Fonte de display de alto contraste: tamanho óptico baixo e peso 700 em títulos grandes | design | landing-direcao-visual | `tipo:b2c` | recomendada |
| Capturar a janela, não fullPage; 375 e 1280; rolar devagar | design | landing-direcao-visual | `fase:revisao` | obrigatoria |
| Elemento decorativo precisa de tamanho visível e fundo que o sustente | design | landing-direcao-visual | geral | recomendada |
| Texto: um conceito por frase; explicar o que o cliente faz, não a regra interna; mostrar prévia | conteudo | landing-descoberta | geral | recomendada |
| Rótulo público compreensível para quem não é da área; sem informação interna vazando | conteudo | landing-direcao-visual | geral | recomendada |
| Não inventar fatos (preço, horário, endereço); PENDENTE bloqueia | conteudo | landing-descoberta | geral | obrigatoria |
| Depoimento copiado sem alterar, com fonte e só o primeiro nome | conteudo | landing-descoberta | `tem:depoimentos` | obrigatoria |
| Foto: olhar o fundo, direitos, origem registrada, tamanho por uso | midia | landing-descoberta | `tem:fotos-de-terceiros` | obrigatoria |
| B2C emocional: foto com gente feliz vende mais que peça sem pessoa | midia | landing-direcao-visual | `tipo:b2c` | recomendada |
| Raspagem logada: Chrome visível, o Felipe faz o login e o CAPTCHA, nunca contornar | midia | landing-descoberta | `tem:raspagem-logada` | obrigatoria |
| Negócio sem loja: perguntar o que faz em cada lugar; fonte única da cobertura; sede não é venda local | b2b | landing-descoberta | `tem:area-sem-loja` | obrigatoria |
| Formulário por `wa.me`: dizer ao dono o que se perde (sem confirmação de envio) | conteudo | landing-descoberta | `tem:formulario-whatsapp` | recomendada |
| Saúde e bem-estar: sem promessa de cura; aviso de privacidade | saude | landing-descoberta | `nicho:saude` | obrigatoria |
| Horário, serviços e preços de uma fonte da verdade; HTML estático só reserva | agenda | landing-software-extra | `tem:agenda` | obrigatoria |
| Modelo de dados sem ambiguidade (nome da opção ≠ duração) | agenda | landing-software-extra | `tem:agenda` | recomendada |
| Menos escolhas por tela: grupo grande primeiro, detalhe depois | design | landing-direcao-visual | `tem:agenda` | recomendada |
| Não afirmar "não dá" sem testar o caminho que o usuário lembra | processo | criar-landing-page | geral | recomendada |

Cada linha confirmada vira uma regra; as que **não** acharem entrada real que as sustente ficam `status: hipotese` (sem evidência) ou são descartadas e anotadas em `candidatas.md` como "não promovida".

- [ ] **Step 3: Escrever `_regras-vivas.md` v1**

Partir do modelo `assets/modelos/regras-vivas.md` (frontmatter com `versao: v1` e o vocabulário). Para cada regra confirmada: `### R-nnn <título>`, bloco ```` ```yaml ```` com todos os campos (`id, categoria, escopo, aplica_quando, severidade, status, evidencia, checagem, skill, nao_se_aplica_quando`, e `conflita_com` e `criterio_remocao` quando houver), e 1 a 3 linhas de texto. `checagem`: o script do kit que a barra (`check-cache`, `check-content`, `check-assets`, `check-contrast`, `check-page`, `publicar`) ou `nenhuma`.

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node check-regras.js --file ~/projetos/criar-site/_regras-vivas.md`
Expected: `check-regras: ok (N regras)`. Iterar até passar; o `check-regras` rejeita evidência com id inexistente, tag fora do vocabulário e id duplicado.

- [ ] **Step 4: Teste de seleção por tags nos quatro clientes fictícios**

```js
// _testes-skills/selecao.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const KIT = path.join(os.homedir(), ".claude", "skills", "criar-landing-page", "assets", "kit");
const REGRAS = path.join(os.homedir(), "projetos", "criar-site", "_regras-vivas.md");
const listar = (tags) => {
  const r = spawnSync("node", [path.join(KIT, "check-regras.js"), "--file", REGRAS, "--tags", tags, "--listar"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim().split("\n").filter(Boolean);
};
const titulos = () => fs.readFileSync(REGRAS, "utf8");

test("o cliente com agenda carrega as regras de agenda e de infra; o profissional B2B não carrega as de agenda", () => {
  const agenda = listar("tipo:b2c,nicho:saude,tem:agenda,tem:software-extra,tem:cloudflare,tem:docker-compartilhado,tem:email-transacional,fase:publicacao");
  const profissional = listar("tipo:b2b,nicho:servico-profissional,fase:descoberta");
  const txt = titulos();
  const idDe = (frag) => [...txt.matchAll(/^### (R-\d{3}) (.+)$/gm)].find((m) => m[2].toLowerCase().includes(frag))?.[1];
  const fonteUnica = idDe("fonte da verdade") ?? idDe("fonte única");
  assert.ok(fonteUnica, "regra da fonte única da agenda existe");
  assert.ok(agenda.includes(fonteUnica));
  assert.ok(!profissional.includes(fonteUnica));
  assert.ok(agenda.length > profissional.length);
});

test("toda regra geral obrigatória é carregada por qualquer conjunto de tags", () => {
  const minimo = listar("fase:descoberta");
  const todas = listar("tipo:b2c,nicho:beleza,tem:cloudflare,tem:agenda,tem:software-extra,fase:publicacao");
  for (const id of minimo) assert.ok(todas.includes(id));
  assert.ok(minimo.length >= 5);
});
```

Run: `cd ~/projetos/criar-site/_testes-skills && node --test selecao.test.mjs`
Expected: PASS. Se falhar por falta da regra da fonte única, o título dela na migração precisa conter "fonte da verdade" ou "fonte única".

- [ ] **Step 5: Marcar as entradas como processadas e registrar a evolução**

Somente depois dos Steps 3 e 4 verdes:

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node processar-feedback.js marcar --versao v1 && node processar-feedback.js listar --contar`
Expected: `0`.

Acrescentar a `~/projetos/criar-site/_evolucao.md`: `## v1 (migração inicial)`: número de regras, quantas `ativa`/`candidata`/`hipotese`, quantas não promovidas e por quê, quais paralelos entre clientes foram traçados (cache nos três; área de atuação só na Cliente B; etc.), o que foi podado (nada nesta primeira passada, dizer isso), contagem de entradas processadas por cliente, e as métricas de base.

- [ ] **Step 6: Checkpoint**

Run: `cd ~/.claude/skills/criar-landing-page/assets/kit && node check-regras.js --file ~/projetos/criar-site/_regras-vivas.md && cd ~/projetos/criar-site/_testes-skills && node --test selecao.test.mjs 2>&1 | tail -5 && grep -c "processado: v1" ~/projetos/criar-site/*/02-registro-de-feedback-por-etapa.md`
Expected: regras ok, seleção PASS, e as contagens de `processado: v1` batendo com o número de entradas de cada cliente (31/32/25 ou o que `grep -c "^### E"` mostrar).

---

## Task 23: Verificação final e relatório

**Spec:** seção 7.1 (critérios de conclusão), 8.

**Files:**
- Modify: `K/README.md` ("Última execução")

- [ ] **Step 1: Rodar tudo, na mesma mensagem, e colar as saídas**

```bash
cd ~/.claude/skills/criar-landing-page/assets/kit && npm test 2>&1 | tail -14
node ~/projetos/criar-site/_testes-skills/lint-skill.mjs ~/.claude/skills/{criar-landing-page,landing-descoberta,landing-direcao-visual,landing-software-extra,landing-publicar,landing-registrar-feedback,landing-evoluir-skill}
cd ~/projetos/criar-site/_testes-skills && node pontuar-disparo.mjs disparo.json respostas-disparo.json
grep -h "^Resultado:" baseline/*.md | sort | uniq -c
grep -h "^Resultado:" verde/*.md | sort | uniq -c
node ~/.claude/skills/criar-landing-page/assets/kit/check-regras.js --file ~/projetos/criar-site/_regras-vivas.md
node ~/.claude/skills/criar-landing-page/assets/kit/processar-feedback.js listar --contar
node --test selecao.test.mjs 2>&1 | tail -4
```

- [ ] **Step 2: Conferir cada item da seção 7.1 do spec contra a saída acima**

Montar a tabela (item, evidência, ok ou não). Itens: (1) sete `SKILL.md` e kit existem, `wc -w` dentro do limite, nenhuma `description` resume fluxo (lint 7 `ok`); (2) cada Iron Law com RED registrado e GREEN `PASSA` (baseline majoritariamente `FALHA`, verde 11 `PASSA`); (3) disparo `28/28`; (4) testes do kit incluindo falha segura, concorrência e `check-assets`; (5) `_regras-vivas.md` v1 e `_evolucao.md`, entradas `processado: v1`; (6) ponta a ponta parou no gate da direção visual (Task 18); (7) relatório lista o que **não** foi testado; (8) matriz por script e integração com os `site-base` reais; (9) `publicar.sh` testado contra destino local com falhas simuladas; (10) concorrência e escrita atômica; (11) cliente fictício passou pelos níveis 1 e 2 com custo registrado.

- [ ] **Step 3: Atualizar o README do kit e escrever o relatório final ao Felipe**

Em `K/README.md`, substituir a linha "Última execução dos testes" por a linha real de `npm test` (`# tests N`, `# pass N`, `# skipped N`, data). O relatório final, em português, diz: o que foi construído; o resultado de cada critério com a evidência; **o que não foi testado de verdade** (publicação real em produção; o MCP do Cloudflare; destino remoto do `publicar`; os testes do `check-page` se houve skip; geração completa dos quatro clientes fictícios, que só roda no redesenho); decisões que mudaram do spec (`--executar` no `publicar`; `Site` e `Origem`/`Sha256` no inventário; `check-regras`, `processar-feedback`, `authorize`, `check-assets`); e as pendências para o Felipe (instalar e rodar `authorize.js` na primeira publicação real, decidir sobre o hook de lembrete se a métrica pedir, e `git init` do kit se quiser histórico).

- [ ] **Step 4: Limpeza**

Run: `rm -rf ~/projetos/criar-site/_testes-skills/raiz-e2e /tmp/descricoes.txt; ls ~/projetos/criar-site`
Expected: a raiz de teste removida; `_regras-vivas.md`, `_evolucao.md`, `_testes-skills/` e as três pastas de cliente permanecem.

---

## Self-Review (feita ao terminar o plano)

**Cobertura do spec:** 3.0 (descrições e teste de disparo): Tasks 11, 21 · 3.1 (fluxo e Passo 0): Task 13 · 3.2 (passagem de bastão, frontmatter, hash, pendências): Tasks 1-3, 12-14 · 3.3 (rigor proporcional): Task 13, cenário S09 · 3.4 (questionário em camadas e bloqueio por fase): Task 14 · 3.5 (critérios visuais, duas avaliações): Tasks 7, 15, 17 · 3.6 (quatro tipos de informação): Tasks 12, 20 · 3.7 (inventário de assets): Tasks 6, 12, 14 · 3.8 (regras com metadados, vocabulário fechado, divisão futura): Tasks 9, 12, 22 · 3.9 (máquina de estados, autorização, escrita segura, auditoria, `schema_version`): Tasks 1-4 · 3.10 (níveis e custo): Task 18 · 3.11 (promoção, ciclo de vida, conflitos): Tasks 9, 20, 22 · 4 (feedback): Tasks 8, 10, 19, 20 · 5 (kit e contrato): Tasks 1-9 · 6 (migração): Task 22 · 7 e 7.1: Tasks 11, 18, 21, 23.

**Placeholders:** nenhum "TBD". Os pontos que dependem de leitura de dados reais (as entradas dos três clientes) têm procedimento, formato, sementes e validação mecânica (`check-regras` rejeita evidência inexistente).

**Consistência de tipos:** `EXIT`, `Falha`, `executar`, `cli` (Task 1) são usados com a mesma assinatura em todos os scripts; `verificar(file, fase)` e `antesDe(dirCliente, fase)` (Task 2) são os consumidos por `authorize.js` e `publicar.js`; `lerToken/gravarToken/validarToken/normDestino/ehRemoto` (Task 4) só em `authorize.js` e `publicar.js`; o vocabulário de `Status`/`Direitos`/`Tipo` do inventário (Task 6) é o mesmo do modelo (Task 12); os campos de pendência (`id`, `campo`, `status`, `bloqueia`) e `CAMPOS` (Task 3) são os dos modelos e do `landing-descoberta`; o formato `### E<nn>.` do registro (Task 8) é o que `processar-feedback.js` (Task 10) e `check-regras.js` (Task 9) leem, e é o dos três relatórios existentes.

**Review Focus:** (1) nome de cliente e caminhos: testes em `lib.test.js` (`clienteDir`, `dentroDe`, symlink), `feedback.test.js` (`../fora`), `assets.test.js` (`..`, absoluto, symlink); (2) concorrência: `gate.test.js` (3 aprovações), `pendencia.test.js` (2 resoluções), `feedback.test.js` (8 gravações); (3) CRLF, sem frontmatter, YAML quebrado, `aprovado` string, `schema_version`: `lib.test.js` e `gate.test.js`; (4) exceção inesperada ou diretório no lugar do arquivo: `lib.test.js` (`executar`) e `gate.test.js`; (5) inventário malformado, acento e espaço, hash alterado, imagem fora do inventário: `assets.test.js`.

