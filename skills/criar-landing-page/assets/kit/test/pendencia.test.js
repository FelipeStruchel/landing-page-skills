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

test("campos de mídia e depoimentos são resolvíveis com --fonte (não são 'material')", () => {
  const { raiz, dir } = (() => { const r = tmpRaiz(); return { raiz: r, dir: novoCliente(r) }; })();
  const f = escreveArtefato(dir, "01-negocio-e-escopo.md", {
    schema_version: 1, fase: "descoberta", aprovado: false,
    pendencias: [{ id: "P-001", campo: "midia", status: "pendente", bloqueia: "direcao-visual" }, { id: "P-002", campo: "depoimentos", status: "pendente", bloqueia: "publicacao" }],
    resolucoes: [],
  }, "Fotos: {{PENDENTE:P-001}}\nDepoimentos: {{PENDENTE:P-002}}\n");
  assert.equal(resolve(raiz, f, "P-001", "4 fotos em fontes/").code, 2);
  assert.equal(resolve(raiz, f, "P-001", "4 fotos em fontes/", "Aurora, WhatsApp 16/10").code, 0);
  assert.equal(resolve(raiz, f, "P-002", "3 depoimentos autorizados", "Aurora, WhatsApp 16/10").code, 0);
});
