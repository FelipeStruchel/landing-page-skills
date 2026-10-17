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
  fs.copyFileSync(path.join(process.env.HOME, ".claude/skills/criar-landing-page/assets/modelos/inventario-assets.md"), path.join(dir, "inventario-assets.md"));
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
