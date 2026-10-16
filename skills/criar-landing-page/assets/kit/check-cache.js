import { cli, executar, EXIT, Falha } from "./lib/args.js";

const USO = "uso: node check-cache.js --url <https://...> [--paths /,/outra] [--timeout <ms>]\nConfere status e cabeçalhos de cache do HTML servido e dos css/js/imagens/fontes que ele cita. Falha ao acessar = reprovado.\nNÃO prova que todos os visitantes recebem a versão nova (cache do navegador e do CDN variam).";
const LONGO = /max-age=(\d+)/;

executar(async () => {
  const v = cli({ url: { required: true }, paths: {}, timeout: {} }, USO);
  const base = new URL(v.url);
  const ms = Number(v.timeout ?? 10000);
  const erros = [];
  const buscar = async (url) => {
    try { return await fetch(url, { signal: AbortSignal.timeout(ms), redirect: "follow" }); }
    catch (e) { throw new Falha(EXIT.FAIL, `REPROVADO: não foi possível verificar ${url}: ${e.cause?.code ?? e.message}`); }
  };
  for (const p of (v.paths ?? "/").split(",")) {
    const r = await buscar(new URL(p, base));
    if (r.status !== 200) { erros.push(`${p}: status ${r.status}`); continue; }
    const cc = r.headers.get("cache-control") ?? "";
    const html = await r.text();
    const max = Number(LONGO.exec(cc)?.[1] ?? 0);
    if (/text\/html/.test(r.headers.get("content-type") ?? "") ) {
      if (max > 3600 && !/must-revalidate|no-cache/.test(cc)) erros.push(`${p}: HTML com cache longo (${cc}); publicação pode não aparecer`);
      if (/cdn-cgi\/l\/email-protection/.test(html)) erros.push(`${p}: ofuscação de e-mail do Cloudflare ativa`);
      const refs = new Set();
      for (const m of html.matchAll(/\b(?:href|src)="([^"#]+)"/g)) {
        if (/^(mailto:|tel:|data:|javascript:)/.test(m[1])) continue;
        const u = new URL(m[1], new URL(p, base));
        if (u.origin === base.origin && /\.(css|js|mjs|webp|avif|png|jpe?g|svg|woff2?)$/i.test(u.pathname)) refs.add(u.href);
      }
      for (const href of refs) {
        const a = await buscar(href);
        const nome = new URL(href).pathname;
        if (a.status !== 200) { erros.push(`${a.status} ${nome}`); continue; }
        const c = a.headers.get("cache-control") ?? "";
        const m = Number(LONGO.exec(c)?.[1] ?? 0);
        if (/\.(css|m?js)$/i.test(nome)) {
          const versionado = new URL(href).searchParams.has("v");
          if (!versionado && m > 0 && !/no-cache|no-store/.test(c)) erros.push(`${nome}: css/js sem versão (?v=) e com cache longo (${c})`);
        } else if (m < 31536000) console.log(`AVISO ${nome}: imagem/fonte sem cache de 1 ano (${c || "sem cache-control"})`);
        console.log(`${a.status} ${nome} cache-control: ${c || "(nenhum)"} cf-cache-status: ${a.headers.get("cf-cache-status") ?? "-"}`);
      }
    }
  }
  if (erros.length) { for (const e of erros) console.error(`ERRO ${e}`); throw new Falha(EXIT.FAIL, `REPROVADO: ${erros.length} problema(s) de cache`); }
  console.log("check-cache: ok");
});
