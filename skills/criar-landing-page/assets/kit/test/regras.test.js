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
