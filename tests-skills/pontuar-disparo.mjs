import fs from "node:fs";
const [, , casosPath, respPath] = process.argv;
if (!casosPath || !respPath) { console.error("uso: node pontuar-disparo.mjs <casos.json> <respostas.json>"); process.exit(2); }
const casos = JSON.parse(fs.readFileSync(casosPath, "utf8"));
const resp = JSON.parse(fs.readFileSync(respPath, "utf8"));
let erros = 0;
for (const c of casos) {
  const r = resp[c.id];
  if (r !== c.esperada) { erros++; console.error(`ERRO ${c.id}: esperado ${c.esperada}, veio ${r ?? "(sem resposta)"} :: ${c.frase}`); }
}
console.log(`${casos.length - erros}/${casos.length} corretos`);
process.exit(erros ? 1 : 0);
