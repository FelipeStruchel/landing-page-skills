import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-content.js --root <dir-do-site> --rules <regras.json> [--segredos <dir>]\nregras.json: {\"proibidos\":[{\"re\":\"regex\",\"msg\":\"...\",\"flags\":\"i\"}],\"obrigatorios\":[{\"contem\":\"texto\",\"msg\":\"...\"}]}\nEmbutido: PENDENTE exposto, <img> sem alt (alt=\"\" é aceito), JSON-LD inválido, meta description > 160. --segredos varre a pasta por padrões de chave/token/senha. NÃO prova ausência de dado sensível fora dos padrões.";
const SEGREDOS = [
  [/AKIA[0-9A-Z]{16}/, "chave AWS"],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "chave privada"],
  [/gh[pousr]_[A-Za-z0-9]{36}/, "token GitHub"],
  [/\bsk-[A-Za-z0-9]{20,}/, "chave sk-"],
  [/xox[abp]-[A-Za-z0-9-]{10,}/, "token Slack"],
  [/(?:senha|password|passwd|secret|token|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-./+=]{8,}/i, "credencial com valor"],
];

function varre(dir, ext, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git"].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) varre(p, ext, acc); else if (!ext || ext.test(e.name)) acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, rules: { required: true }, segredos: {} }, USO);
  if (!fs.existsSync(v.root)) throw new Falha(EXIT.MISSING, `--root ausente: ${v.root}`);
  let regras;
  try { regras = JSON.parse(fs.readFileSync(v.rules, "utf8")); } catch (e) { throw new Falha(EXIT.INVALID, `regras.json inválido: ${e.message}`); }
  const erros = [];
  for (const f of varre(v.root, /\.html$/)) {
    const rel = path.relative(v.root, f);
    const html = fs.readFileSync(f, "utf8");
    for (const r of regras.proibidos ?? []) if (new RegExp(r.re, r.flags ?? "i").test(html)) erros.push(`${rel}: ${r.msg}`);
    if (/PENDENTE/.test(html)) erros.push(`${rel}: PENDENTE exposto no site`);
    for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt\s*=/.test(m[0])) erros.push(`${rel}: img sem alt: ${m[0].slice(0, 60)}`);
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { erros.push(`${rel}: JSON-LD inválido`); } }
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1];
    if (desc !== undefined && desc.length > 160) erros.push(`${rel}: meta description com ${desc.length} caracteres (máx 160)`);
    if (path.basename(f) === "index.html") for (const o of regras.obrigatorios ?? []) if (!html.includes(o.contem)) erros.push(`${rel}: ${o.msg}`);
  }
  if (v.segredos) {
    if (!fs.existsSync(v.segredos)) throw new Falha(EXIT.MISSING, `--segredos ausente: ${v.segredos}`);
    for (const f of varre(v.segredos, /\.(md|json|txt|env|js|mjs|html|sh|ya?ml)$|^\.env/)) {
      const t = fs.readFileSync(f, "utf8");
      for (const [re, nome] of SEGREDOS) if (re.test(t)) erros.push(`segredo (${nome}) em ${path.relative(v.segredos, f)}`);
    }
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s)`); }
  console.log("check-content: ok");
});
