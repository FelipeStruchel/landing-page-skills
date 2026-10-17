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
  const forjado = { ...FM("descoberta"), aprovado: true, aprovacao: { via: "conversa", citacao: "x" } };
  const hash = hashArtefato(stringify(forjado, "# corpo\n"));
  const f = path.join(dir, "01-negocio-e-escopo.md");
  fs.writeFileSync(f, stringify({ ...forjado, artefato_sha256: hash }, "# corpo\n"));
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

test("rebaixar via:comando para conversa depois da aprovação invalida o hash (6)", () => {
  const { raiz, dir } = setup();
  const f = escreveArtefato(dir, "publicacao.md", FM("publicacao"));
  run("approve.js", ["--file", f, "--fase", "publicacao", "--via", "comando"], { raiz });
  fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace("via: comando", "via: conversa"));
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "publicacao"], { raiz }).code, 6);
});

test("LIMITE ACEITO (spec 3.9): YAML e auditoria forjados em conjunto passam no gate; alto risco por conversa ainda reprova (5)", () => {
  const { raiz, dir } = setup();
  const forjado = { ...FM("publicacao"), aprovado: true, aprovacao: { via: "conversa", citacao: "x" } };
  const hash = hashArtefato(stringify(forjado, "# corpo\n"));
  const f = path.join(dir, "publicacao.md");
  fs.writeFileSync(f, stringify({ ...forjado, artefato_sha256: hash }, "# corpo\n"));
  fs.appendFileSync(path.join(dir, "auditoria.log"), JSON.stringify({ ts: "x", op: "approve", fase: "publicacao", hash, via: "conversa" }) + "\n");
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "publicacao"], { raiz }).code, 5, "via conversa em fase de alto risco");
  const viaComando = { ...forjado, aprovacao: { via: "comando" } };
  const h2 = hashArtefato(stringify(viaComando, "# corpo\n"));
  fs.writeFileSync(f, stringify({ ...viaComando, artefato_sha256: h2 }, "# corpo\n"));
  fs.appendFileSync(path.join(dir, "auditoria.log"), JSON.stringify({ ts: "x", op: "approve", fase: "publicacao", hash: h2, via: "comando" }) + "\n");
  assert.equal(run("check-gate.js", ["--file", f, "--fase", "publicacao"], { raiz }).code, 0, "forja total é o limite declarado: o agente tem acesso ao disco");
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
