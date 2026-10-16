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
