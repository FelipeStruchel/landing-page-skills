import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { tmpRaiz, novoCliente, escreveArtefato, run, KIT } from "./helpers.js";

const FM = (fase, extra = {}) => ({ schema_version: 1, fase, aprovado: false, ...extra });
const conv = (raiz, f, fase) => run("approve.js", ["--file", f, "--fase", fase, "--via", "conversa", "--citacao", "sim, pode seguir"], { raiz });

function cenario({ inventario = true, pendencias = [], site = "<h1>novo</h1>" } = {}) {
  const raiz = tmpRaiz();
  const dir = novoCliente(raiz);
  const f01 = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta", { pendencias, resolucoes: [] }), "# 01\n");
  conv(raiz, f01, "descoberta");
  for (const [arq, fase] of [["direcao-visual.md", "direcao-visual"], ["plano.md", "plano"]]) conv(raiz, escreveArtefato(dir, arq, FM(fase)), fase);
  const pub = escreveArtefato(dir, "publicacao.md", FM("publicacao"));
  run("approve.js", ["--file", pub, "--fase", "publicacao", "--via", "comando"], { raiz });
  if (inventario) fs.copyFileSync(path.join(process.env.HOME, ".claude/skills/criar-landing-page/assets/modelos/inventario-assets.md"), path.join(dir, "inventario-assets.md"));
  const mk = (conteudo) => { const s = path.join(tmpRaiz(), "site"); fs.mkdirSync(s); fs.writeFileSync(path.join(s, "index.html"), conteudo); return s; };
  const destPai = tmpRaiz();
  return { raiz, dir, f01, pub, site: mk(site), mk, dest: path.join(destPai, "www"), destPai };
}
const auth = (c) => run("authorize.js", ["--cliente", "cli-teste", "--fase", "publicacao", "--acao", "publicar", "--destino", c.dest], { raiz: c.raiz });

test("C1: adulterar a citação depois da aprovação deixa o gate desatualizado (6)", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", FM("descoberta"));
  assert.equal(conv(raiz, f, "descoberta").code, 0);
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 0);
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("sim, pode seguir", "OUTRA COISA FABRICADA"));
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "descoberta"], { raiz }).code, 6);
});

test("C2: duas publicações concorrentes com o mesmo token: só uma passa", async () => {
  const c = cenario();
  assert.equal(auth(c).code, 0);
  const s2 = c.mk("<h1>outro</h1>");
  const lancar = (site) => new Promise((res) => {
    const p = spawn("node", [path.join(KIT, "publicar.js"), "--root", site, "--dest", c.dest, "--cliente", "cli-teste", "--executar"], { env: { ...process.env, CRIAR_SITE_ROOT: c.raiz, PUBLICAR_ATRASO_MS: "600" } });
    p.on("close", (code) => res(code));
  });
  const codes = await Promise.all([lancar(c.site), lancar(s2)]);
  assert.deepEqual(codes.slice().sort(), [0, 7]);
});

test("I5: pendência que bloqueia a fase impede o --antes-de até ser resolvida", () => {
  const c = cenario({ pendencias: [{ id: "P-001", campo: "midia", status: "pendente", bloqueia: "plano" }] });
  const antes = () => run("check-gate.js", ["--cliente", "cli-teste", "--antes-de", "plano"], { raiz: c.raiz });
  // o 01 foi aprovado com a pendência; o corpo do teste precisa do marcador para a resolução
  fs.appendFileSync(c.f01, "Fotos: {{PENDENTE:P-001}}\n");
  run("approve.js", ["--file", c.f01, "--fase", "descoberta", "--via", "comando", "--reabrir"], { raiz: c.raiz });
  conv(c.raiz, c.f01, "descoberta");
  const r = antes();
  assert.equal(r.code, 1);
  assert.match(r.err, /P-001/);
  assert.equal(run("resolve-pendencia.js", ["--file", c.f01, "--id", "P-001", "--valor", "4 fotos em fontes/", "--fonte", "cliente"], { raiz: c.raiz }).code, 0);
  assert.equal(antes().code, 0);
});

test("I5: pendência que bloqueia a publicação reprova o publicar mesmo sem a palavra PENDENTE no site", () => {
  const c = cenario({ pendencias: [{ id: "P-001", campo: "endereco", status: "pendente", bloqueia: "publicacao" }] });
  const r = run("publicar.js", ["--root", c.site, "--dest", c.dest, "--cliente", "cli-teste"], { raiz: c.raiz });
  assert.equal(r.code, 1);
  assert.match(r.err, /P-001/);
});

test("I6: publicar sem inventario-assets.md reprova em vez de pular a checagem", () => {
  const c = cenario({ inventario: false });
  const r = run("publicar.js", ["--root", c.site, "--dest", c.dest, "--cliente", "cli-teste"], { raiz: c.raiz });
  assert.equal(r.code, 1);
  assert.match(r.err, /inventario-assets/);
});
