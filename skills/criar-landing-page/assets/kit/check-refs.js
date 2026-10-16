import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-refs.js --root <dir> [--html <arquivo>...]\nConfere que todo arquivo citado em HTML (src, href, srcset, data-grande, poster), CSS (url()) e JS (import estático) existe. --html padrão: index.html.\nNÃO prova que cada link leva ao destino certo.";
const EXTERNA = /^(https?:|mailto:|tel:|data:|#|\/\/|javascript:)/;

function varre(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varre(p, acc); else acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, html: { multiple: true } }, USO);
  const root = path.resolve(v.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Falha(EXIT.MISSING, `--root não é diretório: ${root}`);
  const refs = new Map();
  const add = (ref, origem, base) => {
    if (!ref || EXTERNA.test(ref.trim())) return;
    const limpo = ref.trim().split("#")[0].split("?")[0];
    if (!limpo) return;
    let dec = limpo;
    try { dec = decodeURI(limpo); } catch { /* usa o texto cru */ }
    refs.set(dec.startsWith("/") ? path.join(root, dec) : path.resolve(base, dec), origem);
  };
  for (const h of v.html?.length ? v.html : ["index.html"]) {
    const f = path.join(root, h);
    if (!fs.existsSync(f)) throw new Falha(EXIT.MISSING, `html ausente: ${h}`);
    const t = fs.readFileSync(f, "utf8");
    for (const m of t.matchAll(/\b(?:src|href|data-grande|poster)="([^"]+)"/g)) add(m[1], h, path.dirname(f));
    for (const m of t.matchAll(/\bsrcset="([^"]+)"/g)) for (const p of m[1].split(",")) add(p.trim().split(/\s+/)[0], `${h} srcset`, path.dirname(f));
  }
  for (const f of varre(root)) {
    const rel = path.relative(root, f);
    if (f.endsWith(".css")) {
      for (const m of fs.readFileSync(f, "utf8").matchAll(/url\(["']?([^"')]+)["']?\)/g)) add(m[1], rel, path.dirname(f));
    } else if (/\.(js|mjs)$/.test(f)) {
      const t = fs.readFileSync(f, "utf8");
      for (const m of t.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)["'](\.[^"']+)["']/g)) add(m[1], rel, path.dirname(f));
    }
  }
  let faltando = 0;
  for (const [p, origem] of refs) {
    if (!fs.existsSync(p)) { console.error(`FALTA ${path.relative(root, p)} <- ${origem}`); faltando++; }
  }
  console.log(`${refs.size} referências, ${faltando} faltando`);
  if (faltando) throw new Falha(EXIT.FAIL, "REPROVADO: referências faltando");
});
