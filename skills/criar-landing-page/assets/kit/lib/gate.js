import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "./fm.js";
import { hashArtefato } from "./hash.js";
import { arquivoDeDados, lerAuditoria } from "./fsx.js";
import { EXIT } from "./args.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
export const fluxo = JSON.parse(fs.readFileSync(path.join(aqui, "..", "fluxo.json"), "utf8"));

export function verificar(file, fase) {
  const def = fluxo.fases[fase];
  if (!def) return { codigo: EXIT.INVALID, msg: `fase desconhecida: ${fase}` };
  let abs;
  try { abs = arquivoDeDados(file); }
  catch (e) { return { codigo: e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, msg: e.message }; }
  const texto = fs.readFileSync(abs, "utf8");
  let fm;
  try { ({ fm } = parse(texto)); } catch (e) { return { codigo: EXIT.INVALID, msg: `YAML inválido: ${e.message}` }; }
  if (!fm) return { codigo: EXIT.INVALID, msg: "sem frontmatter" };
  if (fm.schema_version !== 1) return { codigo: EXIT.INVALID, msg: `schema_version desconhecida: ${fm.schema_version}` };
  if (fm.fase !== fase) return { codigo: EXIT.INVALID, msg: `fase do arquivo (${fm.fase}) difere de ${fase}` };
  if (typeof fm.aprovado !== "boolean") return { codigo: EXIT.INVALID, msg: "aprovado deve ser booleano (true|false)" };
  if (!fm.aprovado) return { codigo: EXIT.NOT_APPROVED, msg: `fase ${fase} não aprovada` };
  const hash = hashArtefato(texto);
  if (hash !== fm.artefato_sha256) return { codigo: EXIT.STALE, msg: `${fase}: artefato mudou depois da aprovação (desatualizado)` };
  const registrado = lerAuditoria(path.dirname(abs)).some((e) => e.fase === fase && e.hash === hash && ["approve", "resolve"].includes(e.op));
  if (!registrado) return { codigo: EXIT.INVALID, msg: `${fase}: sem registro de auditoria para este hash` };
  if (def.alto_risco && fm.aprovacao?.via !== "comando") return { codigo: EXIT.NOT_APPROVED, msg: `${fase}: alto risco exige aprovação via comando do Felipe` };
  return { codigo: EXIT.OK, msg: `${fase} aprovada`, hash, fm, abs };
}

export function antesDe(dirCliente, fase) {
  const def = fluxo.fases[fase];
  if (!def) return { codigo: EXIT.INVALID, msg: `fase desconhecida: ${fase}` };
  const exigidas = [...def.requer];
  for (const [outra, tag] of Object.entries(def.requer_se ?? {})) {
    const r = verificar(path.join(dirCliente, fluxo.fases.descoberta.arquivo), "descoberta");
    if (r.codigo === EXIT.OK && (r.fm.tags ?? []).includes(tag)) exigidas.push(outra);
  }
  for (const f of exigidas) {
    const r = verificar(path.join(dirCliente, fluxo.fases[f].arquivo), f);
    if (r.codigo !== EXIT.OK) return r;
  }
  const d01 = verificar(path.join(dirCliente, fluxo.fases.descoberta.arquivo), "descoberta");
  if (d01.codigo === EXIT.OK) {
    const abertas = (d01.fm.pendencias ?? []).filter((p) => p.bloqueia === fase && p.status === "pendente");
    if (abertas.length) return { codigo: EXIT.FAIL, msg: `pendência(s) bloqueiam ${fase}: ${abertas.map((p) => `${p.id} (${p.campo})`).join(", ")}` };
  }
  return { codigo: EXIT.OK, msg: `pré-condições de ${fase} ok` };
}
