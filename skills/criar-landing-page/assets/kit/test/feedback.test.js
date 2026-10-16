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
