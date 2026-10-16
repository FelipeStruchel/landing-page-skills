import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { tmpRaiz, run } from "./helpers.js";

const pagina = (corpo, head = "") => { const d = tmpRaiz(); const f = path.join(d, "index.html"); fs.writeFileSync(f, `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${head}</head><body>${corpo}</body></html>`); return f; };

function chromium() {
  const base = path.join(os.homedir(), ".cache", "ms-playwright");
  if (!fs.existsSync(base)) return undefined;
  for (const d of fs.readdirSync(base).filter((n) => /^chromium-\d+$/.test(n)).sort().reverse()) {
    for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome"]) { const p = path.join(base, d, sub); if (fs.existsSync(p)) return p; }
  }
}
const rodar = (f, extra = []) => {
  let r = run("check-page.js", ["--url", f, "--larguras", "375,1280", ...extra]);
  if (r.code === 20 && chromium()) r = run("check-page.js", ["--url", f, "--larguras", "375,1280", ...extra], { env: { CHROMIUM_PATH: chromium() } });
  return r;
};

test("página correta passa (0)", (t) => {
  const r = rodar(pagina('<main><h1>Oi</h1><a href="#x">Ir para x</a><button>Enviar</button><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" alt="ponto"></main>'));
  if (r.code === 20) return t.skip(`navegador indisponível: ${r.err}`);
  assert.equal(r.code, 0, r.err + r.out);
});

test("página com problemas: reporta todas as categorias e sai com o menor código (10)", (t) => {
  const f = pagina(
    '<div style="width:2000px">largo</div><a class="sf" href="#a">link</a><button></button><img src="nao-existe.png" alt="x"><script>console.error("quebrou")</script>',
    "<style>.sf:focus,.sf:focus-visible{outline:none;box-shadow:none}</style>"
  );
  const r = rodar(f);
  if (r.code === 20) return t.skip(`navegador indisponível: ${r.err}`);
  assert.equal(r.code, 10, r.err + r.out);
  const tudo = r.err + r.out;
  for (const m of ["console", "falhou|404", "overflow horizontal", "sem foco visível", "sem nome acessível"]) assert.match(tudo, new RegExp(m));
});

test("--url ausente → 2; arquivo inexistente é reprovação", () => {
  assert.equal(run("check-page.js", []).code, 2);
  assert.notEqual(run("check-page.js", ["--url", "/nao/existe.html"]).code, 0);
});
