import { createHash } from "node:crypto";
import { parse } from "./fm.js";

const EXCLUIDOS = ["aprovado", "data", "aprovacao", "artefato_sha256"];
export const sha256 = (s) => createHash("sha256").update(s).digest("hex"); // aceita string ou Buffer

const ordena = (v) =>
  Array.isArray(v) ? v.map(ordena)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordena(v[k])]))
  : v;

export function hashArtefato(text) {
  const { fm, body } = parse(text);
  const mantido = Object.fromEntries(Object.entries(fm ?? {}).filter(([k]) => !EXCLUIDOS.includes(k)));
  return sha256(JSON.stringify({ fm: ordena(mantido), body: body.replace(/\s+$/, "") }));
}
