import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse, stringify } from "./lib/fm.js";
import { hashArtefato, sha256 } from "./lib/hash.js";
import { arquivoDeDados, escreverAtomico, comTrava, auditar } from "./lib/fsx.js";
import { fluxo } from "./lib/gate.js";

const USO = "uso: node approve.js --file <arquivo.md> --fase <nome> --via <comando|conversa> [--citacao <texto>] [--reabrir]\n--via conversa exige --citacao (trecho literal do 'sim' do Felipe); fases de alto risco só aceitam --via comando (rodado pelo Felipe com '!').";

executar(() => {
  const v = cli({ file: { required: true }, fase: { required: true }, via: {}, citacao: {}, reabrir: { type: "boolean" } }, USO);
  const def = fluxo.fases[v.fase];
  if (!def) throw new Falha(EXIT.INVALID, `fase desconhecida: ${v.fase}`);
  let abs;
  try { abs = arquivoDeDados(v.file); }
  catch (e) { throw new Falha(e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, e.message); }
  const dir = path.dirname(abs);
  comTrava(dir, "estado", () => {
    const bruto = fs.readFileSync(abs, "utf8");
    let fm, body;
    try { ({ fm, body } = parse(bruto)); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
    if (!fm || fm.fase !== v.fase || fm.schema_version !== 1) throw new Falha(EXIT.INVALID, "frontmatter ausente, fase diferente ou schema_version != 1");
    if (v.reabrir) {
      const hashAntes = hashArtefato(bruto);
      fm.aprovado = false; delete fm.artefato_sha256; delete fm.aprovacao;
      escreverAtomico(abs, stringify(fm, body), sha256(bruto));
      auditar(dir, { op: "reabrir", fase: v.fase, hash: hashAntes, via: v.via ?? "n/d" });
      console.log("reaberta");
      return;
    }
    if (!["comando", "conversa"].includes(v.via)) throw new Falha(EXIT.USAGE, USO);
    if (v.via === "conversa" && !(v.citacao && v.citacao.trim())) throw new Falha(EXIT.USAGE, "--via conversa exige --citacao");
    if (v.via === "conversa" && def.alto_risco) throw new Falha(EXIT.FORBIDDEN, `fase ${v.fase} é de alto risco: o Felipe deve rodar o comando (--via comando)`);
    fm.aprovado = true;
    fm.data = new Date().toISOString().slice(0, 10);
    fm.aprovacao = { via: v.via, ...(v.citacao ? { citacao: v.citacao } : {}) };
    const hash = hashArtefato(stringify(fm, body));
    fm.artefato_sha256 = hash;
    escreverAtomico(abs, stringify(fm, body), sha256(bruto));
    auditar(dir, { op: "approve", fase: v.fase, hash, via: v.via, citacao: v.citacao ?? null });
    console.log(`aprovada ${hash}`);
  });
});
