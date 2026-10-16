import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { raizDados, comTrava, escreverAtomico } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const USO = "uso: node processar-feedback.js listar [--root <dir>] [--cliente <nome>] [--contar]\n     node processar-feedback.js marcar --versao v1 [--root <dir>] [--cliente <nome>] [--ids E01,E02]\nEntrada sem '- processado: v<N>' (inclui 'não' e o formato antigo) é não processada.";
const ARQ = "02-registro-de-feedback-por-etapa.md";

function entradas(txt) {
  const out = [];
  for (const m of txt.matchAll(/^### (E\d+)\.[ \t]*(.*)$/gm)) {
    const ini = m.index;
    const resto = txt.slice(ini + m[0].length);
    const prox = /^#{1,3} \S/m.exec(resto);
    const fim = prox ? ini + m[0].length + prox.index : txt.length;
    const corpo = txt.slice(ini, fim);
    out.push({ id: m[1], titulo: m[2], ini, fim, corpo, processada: /^- processado: v\d+/m.test(corpo), escopo: /^- Escopo: (.+)$/m.exec(corpo)?.[1] ?? "?", evid: /^- Evidência: (.+)$/m.exec(corpo)?.[1] ?? "?" });
  }
  return out;
}

function clientes(raiz, so) {
  return fs.readdirSync(raiz, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !/^[_.]/.test(e.name) && (!so || e.name === so) && fs.existsSync(path.join(raiz, e.name, ARQ)))
    .map((e) => e.name);
}

executar(() => {
  const [cmd, ...resto] = process.argv.slice(2);
  if (!["listar", "marcar"].includes(cmd)) throw new Falha(EXIT.USAGE, USO);
  const v = cli({ root: {}, cliente: {}, contar: { type: "boolean" }, versao: {}, ids: {} }, USO, resto);
  const raiz = path.resolve(v.root ?? raizDados());
  if (cmd === "listar") {
    const linhas = [];
    for (const c of clientes(raiz, v.cliente)) {
      for (const e of entradas(fs.readFileSync(path.join(raiz, c, ARQ), "utf8"))) if (!e.processada) linhas.push(`${c}/${e.id}\t${e.escopo}\t${e.evid}\t${e.titulo}`);
    }
    console.log(v.contar ? String(linhas.length) : linhas.join("\n"));
    return;
  }
  if (!/^v\d+$/.test(v.versao ?? "")) throw new Falha(EXIT.USAGE, `--versao deve ser v<N>\n${USO}`);
  if (v.ids && !v.cliente) throw new Falha(EXIT.USAGE, `--ids exige --cliente\n${USO}`);
  const so = v.ids ? new Set(v.ids.split(",")) : null;
  for (const c of clientes(raiz, v.cliente)) {
    const dir = path.join(raiz, c);
    comTrava(dir, "feedback", () => {
      const arq = path.join(dir, ARQ);
      const bruto = fs.readFileSync(arq, "utf8");
      let txt = bruto;
      for (const e of entradas(bruto).reverse()) {
        if (e.processada || (so && !so.has(e.id))) continue;
        const aparado = e.corpo.replace(/\s+$/, "");
        const sobra = e.corpo.slice(aparado.length);
        const novo = /^- processado: .*$/m.test(aparado) ? aparado.replace(/^- processado: .*$/m, `- processado: ${v.versao}`) : `${aparado}\n- processado: ${v.versao}`;
        txt = txt.slice(0, e.ini) + novo + sobra + txt.slice(e.fim);
      }
      if (txt !== bruto) escreverAtomico(arq, txt, sha256(bruto));
    });
  }
  console.log(`marcadas como ${v.versao}`);
});
