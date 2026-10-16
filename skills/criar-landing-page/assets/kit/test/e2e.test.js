import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parse, stringify } from "../lib/fm.js";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const M = path.join(os.homedir(), ".claude", "skills", "criar-landing-page", "assets", "modelos");
const conv = (raiz, f, fase) => run("approve.js", ["--file", f, "--fase", fase, "--via", "conversa", "--citacao", "sim, pode seguir"], { raiz });

test("fluxo completo: modelos → gates → pendência → checagens → publicação em destino local", () => {
  const raiz = tmpRaiz();
  const dir = novoCliente(raiz, "salao-aurora");
  for (const f of ["01-negocio-e-escopo.md", "direcao-visual.md", "plano.md", "publicacao.md", "inventario-assets.md", "02-registro-de-feedback-por-etapa.md"]) fs.copyFileSync(path.join(M, f), path.join(dir, f));

  const f01 = path.join(dir, "01-negocio-e-escopo.md");
  const { fm, body } = parse(fs.readFileSync(f01, "utf8"));
  fm.tags = ["tipo:b2c", "nicho:beleza"];
  fm.pendencias = [{ id: "P-001", campo: "endereco", status: "pendente", bloqueia: "publicacao" }];
  fs.writeFileSync(f01, stringify(fm, `${body}\nEndereço: {{PENDENTE:P-001}}\n`));
  assert.equal(conv(raiz, f01, "descoberta").code, 0);
  assert.equal(run("check-gate.js", ["--cliente", "salao-aurora", "--antes-de", "direcao-visual"], { raiz }).code, 0);
  assert.equal(conv(raiz, path.join(dir, "direcao-visual.md"), "direcao-visual").code, 0);
  assert.equal(conv(raiz, path.join(dir, "plano.md"), "plano").code, 0);

  const site = path.join(tmpRaiz(), "site"); fs.mkdirSync(path.join(site, "css"), { recursive: true });
  fs.writeFileSync(path.join(site, "css/s.css"), ":root{--fg:#2A2623;--bg:#F6F1E9;--btn:#0F6E5B;--branco:#FFFFFF}");
  const html = (end) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="Salão Aurora"><link rel="stylesheet" href="css/s.css?v=1"></head><body><h1>Aurora</h1><p>Endereço: ${end}</p><a href="https://wa.me/5511999999999">Agendar</a></body></html>`;
  fs.writeFileSync(path.join(site, "index.html"), html("{{PENDENTE:P-001}}"));

  const dest = path.join(tmpRaiz(), "www");
  const pub = path.join(dir, "publicacao.md");
  run("approve.js", ["--file", pub, "--fase", "publicacao", "--via", "comando"], { raiz });
  run("authorize.js", ["--cliente", "salao-aurora", "--fase", "publicacao", "--acao", "publicar", "--destino", dest], { raiz });
  assert.equal(run("publicar.js", ["--root", site, "--dest", dest, "--cliente", "salao-aurora"], { raiz }).code, 1, "PENDENTE no site bloqueia");

  assert.equal(run("resolve-pendencia.js", ["--file", f01, "--id", "P-001", "--valor", "Rua das Flores, 10, São Paulo", "--fonte", "cliente, WhatsApp"], { raiz }).code, 0);
  fs.writeFileSync(path.join(site, "index.html"), html("Rua das Flores, 10, São Paulo"));

  const regras = path.join(dir, "regras-site.json"); fs.copyFileSync(path.join(M, "regras-site.json"), regras);
  const pares = path.join(dir, "pares-contraste.json"); fs.copyFileSync(path.join(M, "pares-contraste.json"), pares);
  assert.equal(run("check-refs.js", ["--root", site]).code, 0);
  assert.equal(run("check-content.js", ["--root", site, "--rules", regras, "--segredos", dir]).code, 0);
  assert.equal(run("check-contrast.js", ["--css", path.join(site, "css/s.css"), "--pairs", pares]).code, 0);

  assert.equal(run("authorize.js", ["--cliente", "salao-aurora", "--fase", "publicacao", "--acao", "publicar", "--destino", dest], { raiz }).code, 0);
  const r = run("publicar.js", ["--root", site, "--dest", dest, "--cliente", "salao-aurora", "--executar"], { raiz });
  assert.equal(r.code, 0, r.err);
  assert.match(fs.readFileSync(path.join(dest, "index.html"), "utf8"), /Rua das Flores/);

  fs.appendFileSync(f01, "\nPúblico agora inclui empresas.\n");
  assert.equal(run("check-gate.js", ["--cliente", "salao-aurora", "--antes-de", "publicacao"], { raiz }).code, 6, "mudança material no 01 reabre tudo");
});
