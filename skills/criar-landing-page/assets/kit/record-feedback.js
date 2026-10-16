import fs from "node:fs";
import path from "node:path";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, escreverAtomico } from "./lib/fsx.js";
import { sha256 } from "./lib/hash.js";

const ESCOPOS = ["toda-landing", "b2c", "b2b", "saude-bem-estar", "so-este-cliente"];
const EVID = ["preferencia", "defeito", "requisito", "resultado-medido", "n/d"];
const IMP = ["baixo", "medio", "alto", "n/d"];
const USO = `uso: node record-feedback.js --cliente <nome> --entregavel <texto> --escopo <${ESCOPOS.join("|")}> --tipo <explicito|hipotese> [--reacao <citação>] [--hipotese <texto>] [--contexto <texto>] [--licao <texto>] [--evidencia <${EVID.join("|")}>] [--impacto <${IMP.join("|")}>] [--ja-aconteceu <texto>]
explicito exige --reacao (citação literal). hipotese exige --hipotese e recusa --reacao. Idempotente; imprime o id (E<nn>) só depois de reler o arquivo.`;
const CABECALHO = "# Registro de feedback por etapa\n\nEntradas E<nn> gravadas durante o trabalho. `processado: não` até a `landing-evoluir-skill` processá-las.\n";

const umaLinha = (s, campo) => {
  if (/[\n\r]/.test(s ?? "")) throw new Falha(EXIT.USAGE, `--${campo} deve ter uma linha só`);
  return (s ?? "").trim();
};

executar(() => {
  const v = cli({ cliente: { required: true }, entregavel: { required: true }, escopo: { required: true }, tipo: { required: true }, reacao: {}, hipotese: {}, contexto: {}, licao: {}, evidencia: {}, impacto: {}, "ja-aconteceu": {} }, USO);
  if (!ESCOPOS.includes(v.escopo)) throw new Falha(EXIT.USAGE, `escopo inválido: ${v.escopo}\n${USO}`);
  if (!["explicito", "hipotese"].includes(v.tipo)) throw new Falha(EXIT.USAGE, USO);
  const evid = v.evidencia ?? "n/d", imp = v.impacto ?? "n/d";
  if (!EVID.includes(evid) || !IMP.includes(imp)) throw new Falha(EXIT.USAGE, USO);
  const entregavel = umaLinha(v.entregavel, "entregavel");
  const reacao = umaLinha(v.reacao, "reacao");
  const hipotese = umaLinha(v.hipotese, "hipotese");
  if (v.tipo === "explicito" && !reacao) throw new Falha(EXIT.USAGE, "tipo explicito exige --reacao");
  if (v.tipo === "hipotese" && (reacao || !hipotese)) throw new Falha(EXIT.USAGE, "tipo hipotese exige --hipotese e não aceita --reacao (hipótese nunca é citação)");
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }
  const arq = path.join(dir, "02-registro-de-feedback-por-etapa.md");
  const chave = sha256(`${v.cliente}|${entregavel}|${reacao || hipotese}`).slice(0, 10);
  const marcador = `<!-- fb:${chave} -->`;

  const id = comTrava(dir, "feedback", () => {
    const existia = fs.existsSync(arq);
    const bruto = existia ? fs.readFileSync(arq, "utf8") : "";
    const base = existia ? bruto : CABECALHO;
    const ja = new RegExp(`^### (E\\d+)\\.[^\\n]*\\n${marcador.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m").exec(base);
    if (ja) return ja[1];
    const maximo = Math.max(0, ...[...base.matchAll(/^### E(\d+)\./gm)].map((m) => Number(m[1])));
    const novo = `E${String(maximo + 1).padStart(2, "0")}`;
    const entrada = [
      `### ${novo}. ${entregavel}`,
      marcador,
      `- Contexto/critério: ${umaLinha(v.contexto, "contexto") || "(a completar)"}`,
      `- Entregue: ${entregavel}`,
      `- Reação: ${v.tipo === "explicito" ? `"${reacao}"` : "(nenhuma citada)"}`,
      ...(v.tipo === "hipotese" ? [`- Hipótese: ${hipotese}`] : []),
      "- Acerto/erro: (a completar)",
      `- Lição / regra / checagem criada: ${umaLinha(v.licao, "licao") || "(a completar)"}`,
      `- Tipo: ${v.tipo === "explicito" ? "explícito" : "hipótese"}`,
      `- Evidência: ${evid}`,
      `- Impacto: ${imp}`,
      `- Escopo: ${v.escopo}`,
      `- Já tinha acontecido: ${umaLinha(v["ja-aconteceu"], "ja-aconteceu") || "—"}`,
      "- processado: não",
    ].join("\n");
    escreverAtomico(arq, `${base.replace(/\s*$/, "")}\n\n${entrada}\n`, existia ? sha256(bruto) : "");
    return novo;
  });

  const relido = fs.readFileSync(arq, "utf8");
  const secao = new RegExp(`^### ${id}\\.[\\s\\S]*?(?=^### E\\d+\\.|(?![\\s\\S]))`, "m").exec(relido)?.[0] ?? "";
  const ok = secao.includes(marcador) && /- Escopo: \S+/.test(secao) && /- processado: não/.test(secao) && /- Reação: /.test(secao);
  if (!ok) throw new Falha(EXIT.FAIL, `releitura falhou: ${id} não está completa em ${arq}. Conteúdo recuperável: ${entregavel} / ${reacao || hipotese}`);
  console.log(id);
});
