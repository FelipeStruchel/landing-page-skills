import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { parse } from "./lib/fm.js";
import { raizDados } from "./lib/fsx.js";

const USO = "uso: node check-regras.js --file <_regras-vivas.md> [--root <criar-site>] [--tags a,b] [--listar]\nValida campos, vocabulário de tags, ids, evidência (a entrada E<nn> precisa existir no registro do cliente) e conflitos. --listar --tags imprime os ids que o Passo 0 carrega.";
const CATEGORIAS = ["geral", "processo", "design", "conteudo", "midia", "infra", "agenda", "b2b", "b2c", "saude"];
const SKILLS = ["criar-landing-page", "landing-descoberta", "landing-direcao-visual", "landing-software-extra", "landing-publicar", "landing-registrar-feedback", "landing-evoluir-skill"];
const CAMPOS = ["id", "categoria", "escopo", "aplica_quando", "severidade", "status", "evidencia", "checagem", "skill", "nao_se_aplica_quando"];

executar(() => {
  const v = cli({ file: { required: true }, root: {}, tags: {}, listar: { type: "boolean" } }, USO);
  if (!fs.existsSync(v.file)) throw new Falha(EXIT.MISSING, `arquivo ausente: ${v.file}`);
  let fm, body;
  try { ({ fm, body } = parse(fs.readFileSync(v.file, "utf8"))); } catch (e) { throw new Falha(EXIT.INVALID, `YAML inválido: ${e.message}`); }
  if (!fm || fm.schema_version !== 1 || !Array.isArray(fm.vocabulario_tags) || !fm.vocabulario_tags.length) throw new Falha(EXIT.INVALID, "frontmatter precisa de schema_version: 1 e vocabulario_tags");
  const raiz = path.resolve(v.root ?? raizDados());
  const erros = [];
  const regras = [];
  for (const m of body.matchAll(/^### (R-\d{3})[^\n]*\n+```yaml\n([\s\S]*?)\n```/gm)) {
    let r;
    try { r = YAML.parse(m[2]); } catch (e) { erros.push(`${m[1]}: YAML inválido (${e.message.split("\n")[0]})`); continue; }
    r.__titulo = m[1];
    regras.push(r);
  }
  const ids = new Set();
  for (const r of regras) {
    const q = r.id ?? r.__titulo;
    for (const c of CAMPOS) if (r[c] === undefined) erros.push(`${q}: campo '${c}' faltando`);
    if (r.id !== r.__titulo) erros.push(`${q}: id difere do título (${r.__titulo})`);
    if (ids.has(r.id)) erros.push(`${q}: id duplicado`);
    ids.add(r.id);
    if (r.categoria && !CATEGORIAS.includes(r.categoria)) erros.push(`${q}: categoria inválida '${r.categoria}'`);
    if (r.severidade && !["obrigatoria", "recomendada"].includes(r.severidade)) erros.push(`${q}: severidade inválida`);
    if (r.status && !["hipotese", "candidata", "ativa", "aposentada"].includes(r.status)) erros.push(`${q}: status inválido`);
    if (r.skill && !SKILLS.includes(r.skill)) erros.push(`${q}: skill desconhecida '${r.skill}'`);
    const tags = [...(Array.isArray(r.aplica_quando) ? r.aplica_quando : []), ...(Array.isArray(r.escopo) ? r.escopo : [])];
    for (const t of tags) if (!fm.vocabulario_tags.includes(t)) erros.push(`${q}: tag fora do vocabulário: ${t}`);
    if (r.escopo !== undefined && r.escopo !== "geral" && !Array.isArray(r.escopo)) erros.push(`${q}: escopo deve ser "geral" ou lista de tags`);
    if (Array.isArray(r.evidencia)) {
      if (!r.evidencia.length && r.status !== "hipotese") erros.push(`${q}: regra ${r.status} sem evidência`);
      for (const e of r.evidencia) {
        const mm = /^([a-z0-9][a-z0-9_-]*)\/E(\d+)$/.exec(e);
        if (!mm) { erros.push(`${q}: evidência mal formada '${e}' (cliente/E<nn>)`); continue; }
        const reg = path.join(raiz, mm[1], "02-registro-de-feedback-por-etapa.md");
        if (!fs.existsSync(reg)) { erros.push(`${q}: evidência ${e}: cliente ${mm[1]} sem registro`); continue; }
        if (!new RegExp(`^### E${mm[2]}\\.`, "m").test(fs.readFileSync(reg, "utf8"))) erros.push(`${q}: evidência ${e}: entrada E${mm[2]} não existe`);
      }
    }
  }
  for (const r of regras) for (const c of r.conflita_com ?? []) if (!ids.has(c)) erros.push(`${r.id}: conflita_com cita ${c}, que não existe`);

  const tagsProjeto = (v.tags ?? "").split(",").filter(Boolean);
  const selecionadas = regras.filter((r) => r.status === "ativa" && (r.escopo === "geral" || (r.aplica_quando ?? []).some((t) => tagsProjeto.includes(t))));
  const sel = new Set(selecionadas.map((r) => r.id));
  for (const r of selecionadas) for (const c of r.conflita_com ?? []) {
    const o = selecionadas.find((x) => x.id === c);
    if (o && r.severidade === "obrigatoria" && o.severidade === "obrigatoria") erros.push(`conflito entre regras obrigatórias selecionadas: ${r.id} x ${c}`);
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) em ${path.basename(v.file)}`); }
  if (v.listar) {
    for (const r of regras) if (sel.has(r.id)) console.log(r.id);
  } else {
    console.log(`check-regras: ok (${regras.length} regras)`);
  }
});
