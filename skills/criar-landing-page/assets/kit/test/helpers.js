import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stringify } from "../lib/fm.js";

export const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function tmpRaiz() {
  return fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "kit-")));
}

export function run(script, args = [], { raiz, env = {}, input } = {}) {
  const r = spawnSync("node", [path.join(KIT, script), ...args], {
    encoding: "utf8",
    input,
    env: { ...process.env, ...(raiz ? { CRIAR_SITE_ROOT: raiz } : {}), ...env },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

export function novoCliente(raiz, nome = "cli-teste") {
  const d = path.join(raiz, nome);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

export function escreveArtefato(dir, arquivo, fm, body = "# corpo\n") {
  const f = path.join(dir, arquivo);
  fs.writeFileSync(f, stringify(fm, body));
  return f;
}
