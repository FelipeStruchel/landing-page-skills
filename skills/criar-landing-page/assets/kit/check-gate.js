import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { verificar, antesDe } from "./lib/gate.js";
import { clienteDir } from "./lib/fsx.js";

const USO = `uso: node check-gate.js --file <arquivo.md> --fase <nome>
     node check-gate.js --cliente <nome> --antes-de <fase>
saída 0 só se a fase estiver aprovada, com hash atual e auditoria; qualquer outra saída é reprovação.`;

executar(() => {
  const v = cli({ file: {}, fase: {}, cliente: {}, "antes-de": {} }, USO);
  let r;
  if (v["antes-de"]) {
    if (!v.cliente) throw new Falha(EXIT.USAGE, USO);
    let dir;
    try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
    r = antesDe(dir, v["antes-de"]);
  } else {
    if (!v.file || !v.fase) throw new Falha(EXIT.USAGE, USO);
    r = verificar(v.file, v.fase);
  }
  if (r.codigo !== EXIT.OK) throw new Falha(r.codigo, `REPROVADO: ${r.msg}`);
  console.log(`OK: ${r.msg}`);
});
