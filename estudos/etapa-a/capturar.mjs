// Capturas da prancha da Etapa A.
// Uso: node estudos/etapa-a/capturar.mjs [heros|prancha|tudo]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire("C:/Projetos/site-bonifacio/package.json");
const { chromium } = require("@playwright/test");

const AQUI = dirname(fileURLToPath(import.meta.url));
const OUT = join(AQUI, "capturas");
mkdirSync(OUT, { recursive: true });
const url = (arq, q = "") => pathToFileURL(join(AQUI, arq)).href + q;
const modo = process.argv[2] || "tudo";

const telas = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const fases = [0, 0.25, 0.48, 0.7, 1];

const browser = await chromium.launch();
async function abrir(tela) {
  const ctx = await browser.newContext({ ...telas[tela], locale: "pt-BR" });
  return [ctx, await ctx.newPage()];
}
async function pronto(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

if (modo === "heros" || modo === "tudo") {
  for (const tela of Object.keys(telas)) {
    const [ctx, page] = await abrir(tela);
    for (const h of ["01", "02"]) {
      for (const tipo of ["a", "b"]) {
        const lista = tipo === "a" ? fases : [0];
        for (const p of lista) {
          await page.goto(url(`hero-${h}.html`, `?embed=1&tipo=${tipo}&p=${p}`));
          await pronto(page);
          const nome = `hero${h}-${tela}-tipo${tipo}-p${String(Math.round(p * 100)).padStart(3, "0")}.png`;
          await page.screenshot({ path: join(OUT, nome) });
          console.log("ok", nome);
        }
      }
    }
    await ctx.close();
  }
}

if (modo === "prancha" || modo === "tudo") {
  // Iframes não aparecem em captura de página inteira: capturamos por seção.
  const secoes = ["capa", "tipografia", "hero-1", "hero-2", "revelacao", "sistema", "manifesto", "decisoes"];
  for (const tela of Object.keys(telas)) {
    const [ctx, page] = await abrir(tela);
    await page.goto(url("index.html"));
    await pronto(page);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
    await page.waitForTimeout(3000);
    for (const [i, id] of secoes.entries()) {
      const nome = `prancha-${tela}-${String(i).padStart(2, "0")}-${id}`;
      const sel = id === "capa" ? ".capa" : `#${id}`;
      const temTela = await page.locator(`${sel} .telas`).count();
      if (temTela) {
        await page.locator(`${sel} .telas`).first().evaluate(e => e.scrollIntoView({ block: "center" }));
        await page.waitForTimeout(1200);
        await page.screenshot({ path: join(OUT, nome + ".png") });
      } else {
        await page.locator(sel).screenshot({ path: join(OUT, nome + ".png") });
      }
      console.log("ok", nome);
    }
    await ctx.close();
  }
}
await browser.close();
