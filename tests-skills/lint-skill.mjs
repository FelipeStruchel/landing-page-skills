import fs from "node:fs";
import path from "node:path";

const MAX_PALAVRAS = 550;
let falhou = false;
for (const dir of process.argv.slice(2)) {
  const f = path.join(dir, "SKILL.md");
  const erros = [];
  if (!fs.existsSync(f)) { console.error(`ERRO ${dir}: SKILL.md ausente`); falhou = true; continue; }
  const t = fs.readFileSync(f, "utf8");
  const m = t.match(/^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n([\s\S]*)$/);
  let palavras = 0;
  if (!m) erros.push("frontmatter deve ter name e description, cada um em uma linha");
  else {
    const [, nome, desc, corpo] = m;
    if (nome !== path.basename(path.resolve(dir))) erros.push(`name '${nome}' difere do diretório`);
    if (!/^Use when/.test(desc)) erros.push("description deve começar com 'Use when'");
    if (desc.length > 500) erros.push(`description com ${desc.length} caracteres (máx 500)`);
    if (/\b(primeiro|depois|em seguida|então|->|→)\b|→|->/i.test(desc)) erros.push("description parece resumir o fluxo (só gatilhos)");
    palavras = corpo.split(/\s+/).filter(Boolean).length;
    if (palavras > MAX_PALAVRAS) erros.push(`corpo com ${palavras} palavras (máx ${MAX_PALAVRAS})`);
    if (/(^|\s)@\S+\.(md|json)/.test(corpo)) erros.push("link @ proibido (force-load)");
    if (!/Iron Law/i.test(corpo)) erros.push("sem Iron Law");
    if (!/Red Flags/i.test(corpo)) erros.push("sem Red Flags");
  }
  console.log(`${erros.length ? "ERRO" : "ok  "} ${path.basename(dir)} (${palavras} palavras)`);
  for (const e of erros) console.error(`  - ${e}`);
  if (erros.length) falhou = true;
}
process.exit(falhou ? 1 : 0);
