import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { tmpRaiz, novoCliente, run } from "./helpers.js";

const CAB = "| ID | Caminho | Tipo | Status | Alt-text | Uso | Direitos | Origem | Sha256 | Site | Obs |\n|---|---|---|---|---|---|---|---|---|---|---|\n";
const linha = (o) => `| ${o.id ?? "A-001"} | ${o.caminho ?? "fontes/logo.svg"} | ${o.tipo ?? "logo"} | ${o.status ?? "aprovado"} | ${o.alt ?? "Logo X"} | ${o.uso ?? "header"} | ${o.direitos ?? "confirmados"} | ${o.origem ?? "cliente, WhatsApp 15/10"} | ${o.sha ?? ""} | ${o.site ?? ""} | |\n`;

function setup(linhas, arquivos = { "fontes/logo.svg": "<svg/>" }) {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  for (const [n, c] of Object.entries(arquivos)) { fs.mkdirSync(path.dirname(path.join(dir, n)), { recursive: true }); fs.writeFileSync(path.join(dir, n), c); }
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), `# Inventário\n\n${CAB}${linhas.join("")}`);
  return { raiz, dir };
}
const rodar = (s, extra = []) => run("check-assets.js", ["--root", s.dir, ...extra], { raiz: s.raiz });

test("inventário válido passa; hash ausente em aprovado é cobrado e --gravar-hash resolve", () => {
  const s = setup([linha({})]);
  assert.equal(rodar(s).code, 1);
  assert.match(rodar(s).err, /sem hash/);
  assert.equal(rodar(s, ["--gravar-hash"]).code, 0);
  assert.equal(rodar(s).code, 0);
});

test("arquivo alterado depois da aprovação → desatualizado", () => {
  const s = setup([linha({})]);
  rodar(s, ["--gravar-hash"]);
  fs.writeFileSync(path.join(s.dir, "fontes/logo.svg"), "<svg>mudou</svg>");
  const r = rodar(s);
  assert.equal(r.code, 1);
  assert.match(r.err, /desatualizado/);
});

test("arquivo inexistente, caminho com .., caminho absoluto e link simbólico para fora → reprova", () => {
  for (const caminho of ["fontes/nao.png", "../fora.png", "/etc/hostname"]) {
    const s = setup([linha({ caminho, tipo: "foto" })]);
    assert.equal(rodar(s).code, 1, caminho);
  }
  const s = setup([linha({ caminho: "fontes/link.png", tipo: "foto", status: "disponivel" })]);
  const fora = tmpRaiz(); fs.writeFileSync(path.join(fora, "x.png"), "x");
  fs.symlinkSync(path.join(fora, "x.png"), path.join(s.dir, "fontes/link.png"));
  assert.equal(rodar(s).code, 1);
});

test("id duplicado, status/direitos/tipo inválidos e extensão incompatível → reprova", () => {
  const s = setup([linha({}), linha({ caminho: "fontes/logo.svg" })]);
  assert.match(rodar(s).err, /duplicado/);
  for (const o of [{ status: "ok" }, { direitos: "talvez" }, { tipo: "gif" }, { tipo: "foto", caminho: "fontes/doc.txt" }]) {
    const t = setup([linha(o)], { "fontes/logo.svg": "x", "fontes/doc.txt": "x" });
    assert.equal(rodar(t).code, 1, JSON.stringify(o));
  }
});

test("referência (instagram) não precisa de arquivo; arquivo solto em fontes/ vira aviso, não erro", () => {
  const s = setup([linha({ id: "A-003", caminho: "instagram.com/p/abc", tipo: "foto", status: "referencia", alt: "n/a", uso: "inspiração", direitos: "n/a" }), linha({})], { "fontes/logo.svg": "<svg/>", "fontes/solto.png": "x" });
  rodar(s, ["--gravar-hash"]);
  const r = rodar(s);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /AVISO.*solto\.png/);
});

test("caminho com acento e espaço funciona", () => {
  const s = setup([linha({ caminho: "fontes/foto café.jpg", tipo: "foto" })], { "fontes/foto café.jpg": "x" });
  assert.equal(rodar(s, ["--gravar-hash"]).code, 0);
});

test("tabela malformada (sem cabeçalho, coluna faltando) → 4; inventário ausente → 3", () => {
  const raiz = tmpRaiz(); const dir = novoCliente(raiz);
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 3);
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), "# nada de tabela aqui\n");
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 4);
  fs.writeFileSync(path.join(dir, "inventario-assets.md"), "| ID | Caminho |\n|---|---|\n| A-001 | x |\n");
  assert.equal(run("check-assets.js", ["--root", dir], { raiz }).code, 4);
});

test("fase direcao-visual: cita id inexistente ou só pendente → reprova", () => {
  const s = setup([linha({})]);
  rodar(s, ["--gravar-hash"]);
  fs.writeFileSync(path.join(s.dir, "direcao-visual.md"), "usa A-001 no header");
  assert.equal(rodar(s, ["--fase", "direcao-visual"]).code, 0);
  fs.writeFileSync(path.join(s.dir, "direcao-visual.md"), "usa A-009 no hero");
  assert.match(rodar(s, ["--fase", "direcao-visual"]).err, /A-009/);
});

test("fase publicacao: direitos pendentes, alt PENDENTE → reprova; decorativa aceita", () => {
  const s = setup([linha({ direitos: "pendentes" })]);
  rodar(s, ["--gravar-hash"]);
  assert.equal(rodar(s, ["--fase", "publicacao"]).code, 1);
  const t = setup([linha({ alt: "PENDENTE" })]); rodar(t, ["--gravar-hash"]);
  assert.equal(rodar(t, ["--fase", "publicacao"]).code, 1);
  const u = setup([linha({ alt: "decorativa" })]); rodar(u, ["--gravar-hash"]);
  assert.equal(rodar(u, ["--fase", "publicacao"]).code, 0);
});

test("--site: imagem do HTML fora do inventário reprova; decorativa exige alt vazio", () => {
  const s = setup([linha({ caminho: "fontes/f.jpg", tipo: "foto", site: "img/f-640.webp", alt: "Fachada" })], { "fontes/f.jpg": "x" });
  rodar(s, ["--gravar-hash"]);
  const site = tmpRaiz(); fs.mkdirSync(path.join(site, "img"));
  fs.writeFileSync(path.join(site, "img/f-640.webp"), "x");
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="Fachada">');
  assert.equal(rodar(s, ["--fase", "publicacao", "--site", site]).code, 0);
  fs.writeFileSync(path.join(site, "img/intruso.webp"), "x");
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="Fachada"><img src="img/intruso.webp" alt="x">');
  assert.match(rodar(s, ["--fase", "publicacao", "--site", site]).err, /intruso/);
  const d = setup([linha({ caminho: "fontes/f.jpg", tipo: "foto", site: "img/f-640.webp", alt: "decorativa" })], { "fontes/f.jpg": "x" });
  rodar(d, ["--gravar-hash"]);
  fs.writeFileSync(path.join(site, "index.html"), '<img src="img/f-640.webp" alt="descrição">');
  assert.match(rodar(d, ["--fase", "publicacao", "--site", site]).err, /decorativa/);
});
