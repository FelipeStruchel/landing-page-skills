import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { cli, executar, EXIT, Falha } from "./lib/args.js";
import { clienteDir, comTrava, auditar } from "./lib/fsx.js";
import { fluxo, verificar, antesDe } from "./lib/gate.js";
import { lerToken, gravarToken, validarToken, normDestino, ehRemoto } from "./lib/token.js";

const aqui = path.dirname(fileURLToPath(import.meta.url));
const USO = "uso: bash publicar.sh --root <dir-do-site> --dest <diretório|host:caminho> --cliente <nome> [--executar] [--dry-run]\nSem --executar (ou com --dry-run) só valida e mostra o plano. --executar exige token de authorize.js. Destino remoto: só imprime os passos manuais.";

function arquivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc); else acc.push(p);
  }
  return acc;
}

executar(() => {
  const v = cli({ root: { required: true }, dest: { required: true }, cliente: { required: true }, executar: { type: "boolean" }, "dry-run": { type: "boolean" } }, USO);
  const executando = v.executar && !v["dry-run"];
  const root = path.resolve(v.root);
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Falha(EXIT.MISSING, `--root não é diretório: ${root}`);
  let dir;
  try { dir = clienteDir(v.cliente); } catch (e) { throw new Falha(EXIT.INVALID, e.message); }

  const todos = arquivos(root);
  const comPendente = todos.filter((f) => /\.(html|css|js|json|txt|xml)$/.test(f) && /PENDENTE/.test(fs.readFileSync(f, "utf8")));
  if (comPendente.length) throw new Falha(EXIT.FAIL, `REPROVADO: PENDENTE no site: ${comPendente.map((f) => path.relative(root, f)).join(", ")}`);

  const pre = antesDe(dir, "publicacao");
  if (pre.codigo !== EXIT.OK) throw new Falha(pre.codigo, `REPROVADO: ${pre.msg}`);
  const g = verificar(path.join(dir, fluxo.fases.publicacao.arquivo), "publicacao");
  if (g.codigo !== EXIT.OK) throw new Falha(g.codigo, `REPROVADO: ${g.msg}`);

  if (fs.existsSync(path.join(dir, "inventario-assets.md"))) {
    const r = spawnSync("node", [path.join(aqui, "check-assets.js"), "--root", dir, "--fase", "publicacao", "--site", root], { encoding: "utf8", env: process.env });
    if (r.status !== 0) throw new Falha(EXIT.FAIL, `REPROVADO: check-assets\n${r.stdout}${r.stderr}`);
  }

  const destino = normDestino(v.dest);
  const ts = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const bak = `${destino}.bak-${ts}`;
  const reversao = `rm -rf '${destino}' && mv '${bak}' '${destino}'`;

  if (ehRemoto(v.dest)) {
    const [host, caminho] = [v.dest.split(":")[0], v.dest.slice(v.dest.indexOf(":") + 1)];
    console.log(`não executo destino remoto. Passos manuais (Felipe):\n  1. ssh ${host} "cp -a '${caminho}' '${caminho}.bak-${ts}'"\n  2. rsync -a --delete '${root}/' '${v.dest}/'\n  3. node check-cache.js --url <https://dominio>\n  reverter: ssh ${host} "rm -rf '${caminho}' && mv '${caminho}.bak-${ts}' '${caminho}'"`);
    return;
  }
  if (!fs.existsSync(path.dirname(destino))) throw new Falha(EXIT.MISSING, `diretório pai do destino não existe: ${path.dirname(destino)}`);

  if (!executando) {
    console.log(`DRY-RUN: ${todos.length} arquivos de ${root} → ${destino}\n  backup: ${fs.existsSync(destino) ? bak : "(destino novo, sem backup)"}\n  reverter: ${reversao}\n  para executar: authorize.js (Felipe) e depois --executar`);
    return;
  }

  const erro = validarToken(lerToken(dir), { fase: "publicacao", acao: "publicar", destino, hash: g.hash });
  if (erro) throw new Falha(EXIT.FORBIDDEN, erro);
  comTrava(dir, "estado", () => gravarToken(dir, { ...lerToken(dir), usado: true, usado_em: new Date().toISOString() }));

  const novo = `${destino}.novo-${ts}`;
  const existia = fs.existsSync(destino);
  try {
    fs.cpSync(root, novo, { recursive: true });
    if (process.env.PUBLICAR_FALHA_APOS === "copia") throw new Error("falha simulada após a cópia");
    if (existia) fs.renameSync(destino, bak);
    if (process.env.PUBLICAR_FALHA_APOS === "swap") throw new Error("falha simulada no swap");
    fs.renameSync(novo, destino);
  } catch (e) {
    if (existia && fs.existsSync(bak) && !fs.existsSync(destino)) fs.renameSync(bak, destino);
    fs.rmSync(novo, { recursive: true, force: true });
    auditar(dir, { op: "publicar-falhou", fase: "publicacao", hash: g.hash, destino, motivo: e.message });
    throw new Falha(EXIT.FAIL, `publicação falhou e foi revertida: ${e.message}`);
  }
  auditar(dir, { op: "publicar", fase: "publicacao", hash: g.hash, destino, backup: existia ? bak : null });
  console.log(`publicado em ${destino}\n  backup: ${existia ? bak : "(nenhum)"}\n  reverter: ${reversao}\n  agora: node check-cache.js --url <https://dominio> e abrir o site publicado`);
});
