import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { run } from "./helpers.js";
import { spawn } from "node:child_process";
import path from "node:path";
import { KIT } from "./helpers.js";

function servidor(rotas) {
  return new Promise((res) => {
    const s = http.createServer((req, rsp) => {
      const r = rotas[req.url.split("?")[0]];
      if (!r) { rsp.writeHead(404); return rsp.end("nao"); }
      rsp.writeHead(r.status ?? 200, { "content-type": r.tipo ?? "text/plain", ...(r.cc ? { "cache-control": r.cc } : {}) });
      rsp.end(r.corpo ?? "x");
    });
    s.listen(0, "127.0.0.1", () => res({ s, url: `http://127.0.0.1:${s.address().port}` }));
  });
}
const rodar = (args) => new Promise((res) => {
  const p = spawn("node", [path.join(KIT, "check-cache.js"), ...args]);
  let out = "", err = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
  p.on("close", (code) => res({ code, out, err }));
});

const HTML = (css = "css/s.css", js = "js/m.js") => `<link rel="stylesheet" href="${css}"><script src="${js}"></script><img src="img/a.webp">`;

test("css/js versionados ou com no-cache passam", async () => {
  const { s, url } = await servidor({
    "/": { tipo: "text/html", cc: "no-cache", corpo: HTML("css/s.css?v=abc", "js/m.js") },
    "/css/s.css": { cc: "public, max-age=31536000" }, "/js/m.js": { cc: "no-cache" }, "/img/a.webp": { cc: "public, max-age=31536000, immutable" },
  });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 0, r.err);
});

test("css sem versão e com cache longo reprova; HTML com cache longo reprova; 404 reprova", async () => {
  const { s, url } = await servidor({
    "/": { tipo: "text/html", cc: "public, max-age=86400", corpo: HTML() },
    "/css/s.css": { cc: "public, max-age=31536000" }, "/js/m.js": { cc: "no-cache" },
  });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 1);
  assert.match(r.err, /css\/s\.css.*sem versão/);
  assert.match(r.err, /HTML com cache longo/);
  assert.match(r.err, /404.*a\.webp/);
});

test("ofuscação de e-mail do Cloudflare no HTML reprova", async () => {
  const { s, url } = await servidor({ "/": { tipo: "text/html", cc: "no-cache", corpo: '<a href="/cdn-cgi/l/email-protection#abc">e</a>' } });
  const r = await rodar(["--url", url]); s.close();
  assert.equal(r.code, 1);
  assert.match(r.err, /ofuscação de e-mail/);
});

test("servidor inacessível é reprovação (falha segura), nunca aprovação", async () => {
  const r = await rodar(["--url", "http://127.0.0.1:1", "--timeout", "500"]);
  assert.equal(r.code, 1);
  assert.match(r.err, /não foi possível verificar/);
});
