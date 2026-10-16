import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { dentroDe, escreverAtomico, comTrava } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const USO = "uso: node check-assets.js --root <pasta-do-cliente> [--fase descoberta|direcao-visual|publicacao] [--site <dir>] [--gravar-hash]\nValida inventario-assets.md. --fase publicacao exige aprovado, direitos confirmados e alt resolvido; --site confere as imagens do HTML construído contra a coluna Site.\nNÃO substitui abrir e olhar os arquivos.";
const STATUS = ["pendente", "referencia", "disponivel", "aprovado", "rejeitado"];
const DIREITOS = ["confirmados", "pendentes", "nao-autorizados", "n/a"];
const TIPOS = { logo: /\.(svg|png|webp|jpe?g)$/i, foto: /\.(jpe?g|png|webp|avif|gif)$/i, icone: /\.(svg|png|ico|webp)$/i, video: /\.(mp4|webm|mov)$/i, fonte: /\.(woff2?|ttf|otf)$/i, documento: /\.pdf$/i };
const COLUNAS = ["id", "caminho", "tipo", "status", "alt-text", "uso", "direitos", "origem", "sha256", "site"];
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const celulas = (l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

function lerTabela(md) {
  const linhas = md.replace(/\r\n/g, "\n").split("\n");
  const i = linhas.findIndex((l) => /^\s*\|/.test(l));
  if (i < 0 || !/^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] ?? "")) return null;
  const cab = celulas(linhas[i]).map(norm);
  const falta = COLUNAS.filter((c) => !cab.includes(c));
  if (falta.length) return { falta };
  const rows = [];
  for (let j = i + 2; j < linhas.length && /^\s*\|/.test(linhas[j]); j++) {
    const c = celulas(linhas[j]);
    const o = Object.fromEntries(cab.map((k, n) => [k, (c[n] ?? "").replace(/^`|`$/g, "")]));
    rows.push({ o, linha: j });
  }
  return { linhas, cab, rows };
}

function imagensDoSite(site) {
  const out = new Set();
  const varre = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) varre(p);
      else if (e.name.endsWith(".html")) {
        const t = fs.readFileSync(p, "utf8");
        for (const m of t.matchAll(/<img\b[^>]*>/g)) {
          const alt = /\balt\s*=\s*"([^"]*)"/.exec(m[0])?.[1] ?? null;
          const refs = [];
          const src = /\bsrc\s*=\s*"([^"]+)"/.exec(m[0])?.[1]; if (src) refs.push(src);
          const ss = /\bsrcset\s*=\s*"([^"]+)"/.exec(m[0])?.[1]; if (ss) for (const x of ss.split(",")) refs.push(x.trim().split(/\s+/)[0]);
          for (const r of refs) {
            if (/^(https?:|data:|\/\/)/.test(r)) continue;
            out.add(JSON.stringify({ rel: path.relative(site, path.resolve(path.dirname(p), r.split("?")[0])), alt }));
          }
        }
      }
    }
  };
  varre(site);
  return [...out].map((s) => JSON.parse(s));
}

executar(() => {
  const v = cli({ root: { required: true }, fase: {}, site: {}, "gravar-hash": { type: "boolean" } }, USO);
  const root = path.resolve(v.root);
  const inv = path.join(root, "inventario-assets.md");
  if (!fs.existsSync(inv)) throw new Falha(EXIT.MISSING, `inventário ausente: ${inv}`);
  const bruto = fs.readFileSync(inv, "utf8");
  const tab = lerTabela(bruto);
  if (!tab) throw new Falha(EXIT.INVALID, "tabela do inventário não encontrada (cabeçalho e separador Markdown)");
  if (tab.falta) throw new Falha(EXIT.INVALID, `colunas faltando: ${tab.falta.join(", ")}`);

  const erros = [], avisos = [];
  const ids = new Set();
  const usadosNoInventario = new Set();
  let precisaGravar = false;
  for (const { o, linha } of tab.rows) {
    const q = `${o.id || "(sem id)"}`;
    if (!/^A-\d{3}$/.test(o.id)) erros.push(`${q}: id deve ser A-nnn`);
    if (ids.has(o.id)) erros.push(`${q}: id duplicado`);
    ids.add(o.id);
    if (!STATUS.includes(o.status)) erros.push(`${q}: status inválido '${o.status}'`);
    if (!DIREITOS.includes(o.direitos)) erros.push(`${q}: direitos inválido '${o.direitos}'`);
    if (!TIPOS[o.tipo]) erros.push(`${q}: tipo inválido '${o.tipo}'`);
    if (o.status === "referencia") continue;
    if (!o.caminho || path.isAbsolute(o.caminho) || o.caminho.split(/[\\/]/).includes("..")) { erros.push(`${q}: caminho deve ser relativo e dentro da pasta do cliente ('${o.caminho}')`); continue; }
    const abs = path.join(root, o.caminho);
    usadosNoInventario.add(path.relative(root, abs));
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) { erros.push(`${q}: arquivo não existe: ${o.caminho}`); continue; }
    if (!dentroDe(root, abs)) { erros.push(`${q}: caminho escapa da pasta do cliente: ${o.caminho}`); continue; }
    if (TIPOS[o.tipo] && !TIPOS[o.tipo].test(abs)) erros.push(`${q}: extensão incompatível com tipo '${o.tipo}': ${o.caminho}`);
    const h = sha256(fs.readFileSync(abs));
    if (o.sha256 && o.sha256 !== h) erros.push(`${q}: arquivo desatualizado (hash mudou depois da aprovação): ${o.caminho}`);
    if (!o.sha256 && o.status === "aprovado") {
      if (v["gravar-hash"]) {
        const cab = tab.cab; const c = celulas(tab.linhas[linha]); c[cab.indexOf("sha256")] = h;
        tab.linhas[linha] = `| ${c.join(" | ")} |`; precisaGravar = true;
      } else erros.push(`${q}: aprovado sem hash (rode com --gravar-hash)`);
    }
  }
  if (precisaGravar) comTrava(root, "inventario", () => escreverAtomico(inv, tab.linhas.join("\n"), sha256(bruto)));

  const pasta = path.join(root, "fontes");
  if (fs.existsSync(pasta)) {
    const lista = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? lista(path.join(d, e.name)) : [path.join(d, e.name)]));
    for (const f of lista(pasta)) if (!usadosNoInventario.has(path.relative(root, f))) avisos.push(`${path.relative(root, f)} em fontes/ sem linha no inventário`);
  }

  const porId = new Map(tab.rows.map(({ o }) => [o.id, o]));
  if (v.fase === "direcao-visual") {
    const dv = path.join(root, "direcao-visual.md");
    if (fs.existsSync(dv)) for (const id of new Set(fs.readFileSync(dv, "utf8").match(/A-\d{3}/g) ?? [])) {
      const o = porId.get(id);
      if (!o) erros.push(`direcao-visual.md cita ${id}, que não existe no inventário`);
      else if (!["disponivel", "aprovado"].includes(o.status)) erros.push(`direcao-visual.md cita ${id} com status '${o.status}' (precisa estar disponivel ou aprovado)`);
    }
  }
  if (v.fase === "publicacao") {
    for (const { o } of tab.rows) {
      if (o.status !== "aprovado") continue;
      if (o.direitos !== "confirmados") erros.push(`${o.id}: publicação exige direitos confirmados`);
      if (!o["alt-text"] || /^PENDENTE$/i.test(o["alt-text"])) erros.push(`${o.id}: alt-text pendente`);
    }
  }
  if (v.site) {
    const site = path.resolve(v.site);
    const publicados = new Map();
    for (const { o } of tab.rows) for (const s of (o.site ?? "").split(/\s+/).filter(Boolean)) {
      publicados.set(path.normalize(s), o);
      if (!fs.existsSync(path.join(site, s))) erros.push(`${o.id}: coluna Site cita ${s}, que não existe no site`);
    }
    for (const { rel, alt } of imagensDoSite(site)) {
      const o = publicados.get(path.normalize(rel));
      if (!o) { erros.push(`imagem do site fora do inventário: ${rel}`); continue; }
      if (o.status !== "aprovado" || o.direitos !== "confirmados") erros.push(`${o.id}: imagem ${rel} usada no site sem estar aprovada com direitos confirmados`);
      if (norm(o["alt-text"]) === "decorativa" && alt !== "") erros.push(`${o.id}: imagem decorativa deve ter alt="" em ${rel}`);
    }
  }
  for (const a of avisos) console.log(`AVISO ${a}`);
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) no inventário`); }
  console.log(`check-assets: ok (${tab.rows.length} linhas)`);
});
