import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse, stringify } from "./lib/fm.js";
import { hashArtefato, sha256 } from "./lib/hash.js";
import { arquivoDeDados, escreverAtomico, comTrava, auditar } from "./lib/fsx.js";
import { CAMPOS } from "./lib/campos.js";

const USO = "uso: node resolve-pendencia.js --file <arquivo.md> --id <P-nnn> --valor <texto> [--fonte <texto>]\nSó troca o marcador {{PENDENTE:<id>}} pelo valor. Campos 'confirmado' exigem --fonte; campos 'material' são recusados (reabrir o gate).";

executar(() => {
  const v = cli({ file: { required: true }, id: { required: true }, valor: { required: true }, fonte: {} }, USO);
  let abs;
  try { abs = arquivoDeDados(v.file); }
  catch (e) { throw new Falha(e.code === "AUSENTE" ? EXIT.MISSING : EXIT.INVALID, e.message); }
  if (/[\n\r]/.test(v.valor) || v.valor.length > 200 || v.valor.includes("{{") || /^\s*#/.test(v.valor)) {
    throw new Falha(EXIT.INVALID, "valor inválido: uma linha, até 200 caracteres, sem '{{' e sem começar com '#'");
  }
  const dir = path.dirname(abs);
  comTrava(dir, "estado", () => {
    const bruto = fs.readFileSync(abs, "utf8");
    let fm, body;
    try { ({ fm, body } = parse(bruto)); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
    if (!fm) throw new Falha(EXIT.INVALID, "sem frontmatter");
    const p = (fm.pendencias ?? []).find((x) => x.id === v.id);
    if (!p) throw new Falha(EXIT.INVALID, `pendência ${v.id} não existe`);
    if (p.status !== "pendente") throw new Falha(EXIT.FAIL, `${v.id} já está ${p.status}`);
    const classe = CAMPOS[p.campo];
    if (!classe) throw new Falha(EXIT.INVALID, `campo desconhecido: ${p.campo}`);
    if (classe === "material") throw new Falha(EXIT.FORBIDDEN, `campo '${p.campo}' é material: reabra o gate (approve.js --reabrir) e peça nova aprovação`);
    if (classe === "confirmado" && !(v.fonte && v.fonte.trim())) throw new Falha(EXIT.USAGE, `campo '${p.campo}' exige --fonte (quem confirmou e como)`);
    const hashAntes = hashArtefato(bruto);
    if (fm.aprovado === true && fm.artefato_sha256 !== hashAntes) throw new Falha(EXIT.STALE, "artefato foi alterado fora do script depois da aprovação; reabra o gate");
    const marcador = `{{PENDENTE:${v.id}}}`;
    const n = body.split(marcador).length - 1;
    if (n !== 1) throw new Falha(EXIT.INVALID, `marcador ${marcador} deve aparecer exatamente 1 vez (achei ${n})`);
    p.status = "resolvida";
    fm.resolucoes = [...(fm.resolucoes ?? []), { id: v.id, campo: p.campo, valor: v.valor, fonte: v.fonte ?? null, data: new Date().toISOString().slice(0, 10), hash_anterior: hashAntes }];
    const novoBody = body.replace(marcador, () => v.valor);
    const hashNovo = hashArtefato(stringify(fm, novoBody));
    if (fm.aprovado === true) fm.artefato_sha256 = hashNovo;
    escreverAtomico(abs, stringify(fm, novoBody), sha256(bruto));
    auditar(dir, { op: "resolve", fase: fm.fase, hash: hashNovo, id: v.id, campo: p.campo, fonte: v.fonte ?? null });
    console.log(`${v.id} resolvida`);
  });
});
