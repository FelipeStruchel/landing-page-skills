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
