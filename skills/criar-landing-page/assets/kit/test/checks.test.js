import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tmpRaiz, run } from "./helpers.js";

const site = (arquivos) => {
  const d = tmpRaiz();
  for (const [n, c] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(d, n)), { recursive: true }); fs.writeFileSync(path.join(d, n), c); }
  return d;
};

test("check-refs: tudo existe → 0; falta imagem, srcset, url() e import → 1 listando cada um", () => {
  const ok = site({ "index.html": '<img src="img/a.webp" srcset="img/a.webp 1x, img/b.webp 2x"><a href="#x">', "img/a.webp": "x", "img/b.webp": "x", "css/s.css": "a{background:url(../img/a.webp)}", "js/m.js": 'import "./u.js"', "js/u.js": "" });
  assert.equal(run("check-refs.js", ["--root", ok]).code, 0);
  const ruim = site({ "index.html": '<img src="img/falta.webp" srcset="img/falta2.webp 1x"><link href="css/s.css">', "css/s.css": "a{background:url(../img/nao.png)}", "js/m.js": 'import "./nao.js"' });
  const r = run("check-refs.js", ["--root", ruim]);
  assert.equal(r.code, 1);
  for (const f of ["img/falta.webp", "img/falta2.webp", "img/nao.png", "js/nao.js"]) assert.match(r.err, new RegExp(f.replace(".", "\\.")));
});

test("check-refs: ignora links externos, mailto, tel, data: e âncoras; aceita caminho com espaço e acento", () => {
  const d = site({ "index.html": '<a href="https://x.com">a</a><a href="mailto:a@b.c">b</a><a href="tel:1">c</a><img src="data:image/png;base64,AA"><img src="img/foto%20café.jpg">', "img/foto café.jpg": "x" });
  assert.equal(run("check-refs.js", ["--root", d]).code, 0);
});

test("check-refs: raiz inexistente → 3; sem --root → 2", () => {
  assert.equal(run("check-refs.js", ["--root", "/nao/existe"]).code, 3);
  assert.equal(run("check-refs.js", []).code, 2);
});

const pares = (d, lista) => { const f = path.join(d, "pares.json"); fs.writeFileSync(f, JSON.stringify(lista)); return f; };

test("check-contrast: passa com contraste suficiente, reprova abaixo do mínimo e par obsoleto", () => {
  const d = tmpRaiz();
  fs.writeFileSync(path.join(d, "s.css"), ":root{--fg:#2A2623;--bg:#F6F1E9;--claro:#CCCCCC;--branco:#fff}");
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "texto", fg: "#2A2623", bg: "#F6F1E9" }])]).code, 0);
  const r = run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "fraco", fg: "#CCCCCC", bg: "#FFF" }])]);
  assert.equal(r.code, 1);
  assert.match(r.out, /FALHA/);
  const obsoleto = run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "x", fg: "#123456", bg: "#F6F1E9" }])]);
  assert.equal(obsoleto.code, 1);
  assert.match(obsoleto.err + obsoleto.out, /não aparece no CSS/);
});

test("check-contrast: --min global e min por par; hex inválido → 4", () => {
  const d = tmpRaiz();
  fs.writeFileSync(path.join(d, "s.css"), "a{color:#767676;background:#fff}");
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "#767676", bg: "#FFFFFF" }]), "--min", "4.5"]).code, 0);
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "#767676", bg: "#FFFFFF", min: 7 }])]).code, 1);
  assert.equal(run("check-contrast.js", ["--css", path.join(d, "s.css"), "--pairs", pares(d, [{ nome: "a", fg: "azul", bg: "#FFFFFF" }])]).code, 4);
});

const regras = (d, r) => { const f = path.join(d, "regras.json"); fs.writeFileSync(f, JSON.stringify(r)); return f; };

test("check-content: proibidos, obrigatórios, PENDENTE exposto, img sem alt, JSON-LD inválido, description longa", () => {
  const html = `<html><head><meta name="description" content="${"x".repeat(170)}"><script type="application/ld+json">{quebrado</script></head><body><p>lorem ipsum</p><p>Endereço: PENDENTE</p><img src="a.png"></body></html>`;
  const d = site({ "index.html": html });
  const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/5511999999999", msg: "wa.me ausente" }] });
  const r = run("check-content.js", ["--root", d, "--rules", f]);
  assert.equal(r.code, 1);
  for (const m of ["lorem", "wa.me ausente", "PENDENTE", "sem alt", "JSON-LD", "description"]) assert.match(r.err, new RegExp(m));
});

test("check-content: página correta passa; alt vazio (decorativa) é aceito", () => {
  const d = site({ "index.html": '<html><head><meta name="description" content="curta"></head><body><a href="https://wa.me/5511999999999">zap</a><img src="a.png" alt=""></body></html>' });
  const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/5511999999999", msg: "wa" }] });
  assert.equal(run("check-content.js", ["--root", d, "--rules", f]).code, 0);
});

test("check-content --segredos: acha chave/token/senha com valor; ignora a palavra sozinha", () => {
  const d = site({ "index.html": '<p>ok</p>' });
  const f = regras(d, { proibidos: [], obrigatorios: [] });
  const dados = site({ "notas.md": "A senha do painel será trocada. Sem valor aqui." });
  assert.equal(run("check-content.js", ["--root", d, "--rules", f, "--segredos", dados]).code, 0);
  fs.writeFileSync(path.join(dados, ".env"), "API_KEY=abcdef1234567890\n");
  fs.writeFileSync(path.join(dados, "chave.md"), "ghp_" + "a".repeat(36));
  const r = run("check-content.js", ["--root", d, "--rules", f, "--segredos", dados]);
  assert.equal(r.code, 1);
  assert.match(r.err, /segredo/);
});

// Integração com os sites reais já entregues (site-base dos clientes anteriores). As imagens não foram copiadas para site-base.
const CRIAR = path.join(os.homedir(), "projetos", "criar-site");
for (const cliente of ["cliente-b", "cliente-c"]) {
  test(`integração ${cliente}: check-refs conta referências e só reclama de arquivos que não foram copiados`, (t) => {
    const base = path.join(CRIAR, cliente, "scripts", "site-base");
    if (!fs.existsSync(base)) return t.skip("site-base ausente");
    const r = run("check-refs.js", ["--root", base]);
    const m = r.out.match(/(\d+) referências, (\d+) faltando/);
    assert.ok(m, r.out + r.err);
    assert.ok(Number(m[1]) >= 20);
    for (const l of r.err.split("\n").filter((x) => x.startsWith("FALTA"))) assert.match(l, /FALTA (img\/|fonts\/|[^/ ]+\.png)/, l);
  });
  test(`integração ${cliente}: check-content aplica as regras genéricas e não trava`, (t) => {
    const base = path.join(CRIAR, cliente, "scripts", "site-base");
    if (!fs.existsSync(base)) return t.skip("site-base ausente");
    const d = tmpRaiz();
    const f = regras(d, { proibidos: [{ re: "lorem ipsum", msg: "lorem" }], obrigatorios: [{ contem: "https://wa.me/", msg: "wa.me ausente" }] });
    const r = run("check-content.js", ["--root", base, "--rules", f]);
    // Achado real do site entregue: a description da Cliente C tem 163 caracteres (máx 160). O script acerta ao reprovar.
    if (cliente === "cliente-c") {
      assert.equal(r.code, 1);
      assert.deepEqual(r.err.split("\n").filter((l) => l.startsWith("ERRO")), ["ERRO index.html: meta description com 163 caracteres (máx 160)"]);
    } else assert.equal(r.code, 0, r.err);
  });
}
