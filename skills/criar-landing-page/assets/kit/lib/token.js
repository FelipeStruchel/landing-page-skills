import fs from "node:fs";
import path from "node:path";
import { escreverAtomico } from "./fsx.js";

export const ARQ = ".autorizacao";
const REMOTO = /^[^/.][^/]*:/;

export const normDestino = (d) => (REMOTO.test(d) ? d : path.resolve(d));
export const ehRemoto = (d) => REMOTO.test(d);

export function lerToken(dir) {
  const f = path.join(dir, ARQ);
  if (!fs.existsSync(f)) return null;
  try { return JSON.parse(fs.readFileSync(f, "utf8")); } catch { return null; }
}

export function gravarToken(dir, tok) {
  escreverAtomico(path.join(dir, ARQ), JSON.stringify(tok, null, 2));
}

export function validarToken(tok, { fase, acao, destino, hash, agora = Date.now() }) {
  if (!tok) return "sem autorização: peça ao Felipe para rodar authorize.js";
  if (tok.usado) return "autorização já foi usada";
  if (!(Date.parse(tok.expira) >= agora)) return "autorização expirada";
  if (tok.fase !== fase || tok.acao !== acao) return "autorização é de outra fase ou ação";
  if (tok.destino !== destino) return `autorização é para outro destino (${tok.destino})`;
  if (tok.hash !== hash) return "o artefato mudou depois da autorização";
  return null;
}
