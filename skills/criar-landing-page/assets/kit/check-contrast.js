import fs from "node:fs";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-contrast.js --css <arquivo.css> --pairs <pares.json> [--min <número>]\npares.json: [{\"nome\":\"texto no fundo\",\"fg\":\"#RRGGBB\",\"bg\":\"#RRGGBB\",\"min\":4.5}]\nCores que não aparecem no CSS reprovam (par obsoleto). NÃO prova que a página inteira é acessível.";

const hex = (c) => {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(c));
  if (!m) throw new Falha(EXIT.INVALID, `cor inválida: ${c}`);
  const h = m[1].length === 3 ? [...m[1]].map((x) => x + x).join("") : m[1];
  return `#${h.toLowerCase()}`;
};
const lum = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const expande = (css) => css.toLowerCase().replace(/#([0-9a-f])([0-9a-f])([0-9a-f])\b/g, "#$1$1$2$2$3$3");

executar(() => {
  const v = cli({ css: { required: true }, pairs: { required: true }, min: {} }, USO);
  if (!fs.existsSync(v.css)) throw new Falha(EXIT.MISSING, `css ausente: ${v.css}`);
  if (!fs.existsSync(v.pairs)) throw new Falha(EXIT.MISSING, `pares ausente: ${v.pairs}`);
  const css = expande(fs.readFileSync(v.css, "utf8"));
  const padrao = v.min ? Number(v.min) : 4.5;
  let pares;
  try { pares = JSON.parse(fs.readFileSync(v.pairs, "utf8")); } catch (e) { throw new Falha(EXIT.INVALID, `pares.json inválido: ${e.message}`); }
  let falhou = false;
  for (const p of pares) {
    const fg = hex(p.fg), bg = hex(p.bg);
    for (const c of [fg, bg]) if (!css.includes(c)) { console.error(`FALHA ${p.nome}: ${c} não aparece no CSS (par obsoleto)`); falhou = true; }
    const min = p.min ?? padrao;
    const r = razao(fg, bg);
    const ok = r >= min;
    if (!ok) falhou = true;
    console.log(`${ok ? "OK   " : "FALHA"} ${r.toFixed(2)} (min ${min})  ${p.nome}`);
  }
  if (falhou) throw new Falha(EXIT.FAIL, "REPROVADO: contraste");
});
