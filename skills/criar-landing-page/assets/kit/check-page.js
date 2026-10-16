import path from "node:path";
import { pathToFileURL } from "node:url";
import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-page.js --url <url|arquivo.html> [--larguras 375,1280]\nPlaywright: erros de console e de página (10), requisições falhas (11), overflow horizontal (12), foco invisível ao navegar com Tab (13), nome acessível ausente em link/botão/imagem (14). 20 = playwright ou navegador indisponível.\nNÃO substitui a captura da janela nem a inspeção visual. CHROMIUM_PATH aponta para um Chromium alternativo.";

executar(async () => {
  const v = cli({ url: { required: true }, larguras: {} }, USO);
  let pw;
  try { pw = await import("playwright"); } catch { throw new Falha(20, "playwright não instalado: rode `npm install` em assets/kit"); }
  const alvo = /^(https?|file):/.test(v.url) ? v.url : pathToFileURL(path.resolve(v.url)).href;
  let browser;
  try { browser = await pw.chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined }); }
  catch (e) { throw new Falha(20, `navegador indisponível: ${e.message.split("\n")[0]}`); }
  const prob = { 10: [], 11: [], 12: [], 13: [], 14: [] };
  try {
    for (const w of (v.larguras ?? "375,1280").split(",").map(Number)) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
      const page = await ctx.newPage();
      page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) prob[10].push(`[${w}] console: ${m.text()}`); });
      page.on("pageerror", (e) => prob[10].push(`[${w}] erro de página: ${e.message}`));
      page.on("requestfailed", (r) => prob[11].push(`[${w}] requisição falhou: ${r.url()}`));
      page.on("response", (r) => { if (r.status() >= 400) prob[11].push(`[${w}] ${r.status()} ${r.url()}`); });
      try { await page.goto(alvo, { waitUntil: "networkidle", timeout: 20000 }); }
      catch (e) { throw new Falha(EXIT.FAIL, `REPROVADO: não foi possível abrir ${alvo}: ${e.message.split("\n")[0]}`); }
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 1) prob[12].push(`[${w}] overflow horizontal de ${ov}px`);
      const nomes = await page.evaluate(() => {
        const vis = (e) => e.getClientRects().length > 0 || getComputedStyle(e).position === "fixed";
        const sem = [];
        for (const e of document.querySelectorAll("a[href],button,[role=button]")) {
          if (!vis(e)) continue;
          const nome = e.getAttribute("aria-label") || e.getAttribute("aria-labelledby") || e.textContent.trim() || e.getAttribute("title") || e.querySelector("img[alt]:not([alt=''])");
          if (!nome) sem.push(`${e.tagName.toLowerCase()} ${e.outerHTML.slice(0, 60)}`);
        }
        for (const i of document.querySelectorAll("img:not([alt])")) sem.push(`img sem atributo alt: ${i.outerHTML.slice(0, 60)}`);
        return sem;
      });
      for (const n of nomes) prob[14].push(`[${w}] sem nome acessível: ${n}`);
      const total = await page.evaluate(() => document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])").length);
      for (let i = 0; i < Math.min(total, 40); i++) {
        await page.keyboard.press("Tab");
        const info = await page.evaluate(() => {
          const e = document.activeElement;
          if (!e || e === document.body) return null;
          const cs = getComputedStyle(e);
          const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
          const sombra = cs.boxShadow && cs.boxShadow !== "none";
          return { visivel: outline || sombra, desc: `${e.tagName.toLowerCase()} ${e.outerHTML.slice(0, 50)}` };
        });
        if (info && !info.visivel) prob[13].push(`[${w}] sem foco visível: ${info.desc}`);
      }
      await ctx.close();
    }
  } finally { await browser.close(); }
  const codigos = Object.keys(prob).map(Number).filter((c) => prob[c].length).sort((a, b) => a - b);
  for (const c of codigos) for (const l of [...new Set(prob[c])]) console.error(`[${c}] ${l}`);
  if (codigos.length) throw new Falha(codigos[0], `REPROVADO: ${codigos.length} categoria(s) com problema`);
  console.log("check-page: ok");
});
