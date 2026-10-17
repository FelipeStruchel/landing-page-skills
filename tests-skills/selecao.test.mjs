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
