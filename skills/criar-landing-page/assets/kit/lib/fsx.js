import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { sha256 } from "./hash.js";

export const raizDados = () => path.resolve(process.env.CRIAR_SITE_ROOT ?? path.join(os.homedir(), "projetos", "criar-site"));

export function dentroDe(base, alvo) {
  const b = fs.realpathSync(base);
  const a = fs.existsSync(alvo)
    ? fs.realpathSync(alvo)
    : path.join(fs.realpathSync(path.dirname(alvo)), path.basename(alvo));
  const rel = path.relative(b, a);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

export function clienteDir(nome) {
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(nome ?? "")) throw new Error(`nome de cliente inválido: '${nome}'`);
  const raiz = raizDados();
  const dir = path.join(raiz, nome);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw new Error(`pasta do cliente não existe: ${dir}`);
  if (!dentroDe(raiz, dir)) throw new Error(`fora da raiz de dados: ${dir}`);
  return fs.realpathSync(dir);
}

export function arquivoDeDados(file) {
  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) { const e = new Error(`ausente: ${abs}`); e.code = "AUSENTE"; throw e; }
  if (!fs.statSync(abs).isFile()) throw new Error(`não é um arquivo: ${abs}`);
  if (!dentroDe(raizDados(), abs)) throw new Error(`fora da raiz de dados: ${abs}`);
  return fs.realpathSync(abs);
}

export function escreverAtomico(file, conteudo, sha256DoBrutoAnterior) {
  if (sha256DoBrutoAnterior !== undefined) {
    const atual = fs.existsSync(file) ? sha256(fs.readFileSync(file, "utf8")) : "";
    if (atual !== sha256DoBrutoAnterior) throw new Error(`conflito: ${file} mudou durante a operação`);
  }
  const tmp = `${file}.tmp-${process.pid}-${randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tmp, conteudo);
  fs.renameSync(tmp, file);
}

const dorme = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

export function comTrava(dir, nome, fn, { espera = 10000, obsoleta = 30000 } = {}) {
  const trava = path.join(dir, `.trava-${nome}`);
  const ini = Date.now();
  for (;;) {
    try { fs.mkdirSync(trava); break; }
    catch (e) {
      if (e.code !== "EEXIST") throw e;
      try { if (Date.now() - fs.statSync(trava).mtimeMs > obsoleta) { fs.rmdirSync(trava); continue; } } catch { /* outra execução liberou */ }
      if (Date.now() - ini > espera) throw new Error(`trava ocupada: ${trava}`);
      dorme(20);
    }
  }
  try { return fn(); } finally { try { fs.rmdirSync(trava); } catch { /* já liberada */ } }
}

export function auditar(dir, entrada) {
  fs.appendFileSync(path.join(dir, "auditoria.log"), JSON.stringify({ ts: new Date().toISOString(), ...entrada }) + "\n");
}

export function lerAuditoria(dir) {
  const f = path.join(dir, "auditoria.log");
  if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, "utf8").split("\n").filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } })
    .filter(Boolean);
}
