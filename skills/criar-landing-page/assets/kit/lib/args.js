import { parseArgs } from "node:util";

export const EXIT = { OK: 0, FAIL: 1, USAGE: 2, MISSING: 3, INVALID: 4, NOT_APPROVED: 5, STALE: 6, FORBIDDEN: 7 };

export class Falha extends Error {
  constructor(codigo, msg) { super(msg); this.codigo = codigo; }
}

export function fail(codigo, msg) {
  console.error(msg);
  process.exit(codigo);
}

export function cli(spec, uso, argv = process.argv.slice(2)) {
  const options = { help: { type: "boolean" } };
  for (const [k, s] of Object.entries(spec)) options[k] = { type: s.type ?? "string", multiple: !!s.multiple };
  let values;
  try { ({ values } = parseArgs({ args: argv, options, allowPositionals: false })); }
  catch (e) { fail(EXIT.USAGE, `${e.message}\n${uso}`); }
  if (values.help) { console.log(uso); process.exit(0); }
  for (const [k, s] of Object.entries(spec)) {
    if (s.required && values[k] === undefined) fail(EXIT.USAGE, `falta --${k}\n${uso}`);
  }
  return values;
}

export function executar(fn) {
  const trata = (e) => {
    if (e instanceof Falha) fail(e.codigo, e.message);
    fail(EXIT.FAIL, `erro inesperado (tratado como reprovação): ${e.message}`);
  };
  try {
    const r = fn();
    if (r && typeof r.then === "function") r.then(() => {}, trata);
  } catch (e) { trata(e); }
}
