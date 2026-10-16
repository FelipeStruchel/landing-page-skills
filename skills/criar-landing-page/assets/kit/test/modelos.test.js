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
