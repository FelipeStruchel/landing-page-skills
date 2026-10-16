import path from "node:path";
import { randomBytes } from "node:crypto";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, auditar } from "./lib/fsx.js";
import { fluxo, verificar } from "./lib/gate.js";
import { gravarToken, normDestino } from "./lib/token.js";

const USO = "uso: node authorize.js --cliente <nome> --fase <nome> --acao <acao> --destino <destino>\nRodado pelo Felipe (com '!'). Grava um token de uso único, válido por 15 minutos, amarrado ao hash atual da fase e ao destino exato.";

executar(() => {
  const v = cli({ cliente: { required: true }, fase: { required: true }, acao: { required: true }, destino: { required: true } }, USO);
  const def = fluxo.fases[v.fase];
  if (!def?.alto_risco) throw new Falha(EXIT.INVALID, "authorize só vale para fases de alto risco");
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
  const r = verificar(path.join(dir, def.arquivo), v.fase);
  if (r.codigo !== EXIT.OK) throw new Falha(r.codigo, `fase não está pronta: ${r.msg}`);
  const destino = normDestino(v.destino);
  const agora = Date.now();
  const tok = { id: randomBytes(6).toString("hex"), fase: v.fase, acao: v.acao, destino, hash: r.hash, criada: new Date(agora).toISOString(), expira: new Date(agora + 15 * 60 * 1000).toISOString(), usado: false };
  comTrava(dir, "estado", () => {
    gravarToken(dir, tok);
    auditar(dir, { op: "authorize", fase: v.fase, hash: r.hash, destino, id: tok.id, via: "comando" });
  });
  console.log(`autorização ${tok.id}: ${v.acao} em ${destino}, válida por 15 minutos, uso único`);
});
