// Capturas do storyboard da Etapa B.
// Uso: node estudos/etapa-b/capturar.mjs [quadros|prancha|tudo]
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire("C:/Projetos/site-bonifacio/package.json");
const { chromium } = require("@playwright/test");

const AQUI = dirname(fileURLToPath(import.meta.url));
const OUT = join(AQUI, "capturas");
mkdirSync(OUT, { recursive: true });
const url = (rel, q = "") => pathToFileURL(join(AQUI, rel)).href + q;
const modo = process.argv[2] || "tudo";
const DESK = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "pt-BR" };
const CEL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR" };
const HERO = "../etapa-a/hero-01.html", OLH = "dois-olhares.html";

const browser = await chromium.launch();
const pronto = async p => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(350); };

if (modo !== "prancha") {
  for (const [nome, cfg] of [["desktop", DESK], ["mobile", CEL]]) {
    const ctx = await browser.newContext(cfg); const page = await ctx.newPage();
    for (const p of [0, .2, .42, .56, .75, 1]) {
      await page.goto(url(HERO, `?embed=1&p=${p}`)); await pronto(page);
      await page.screenshot({ path: join(OUT, `incisao-${nome}-${String(Math.round(p * 100)).padStart(3, "0")}.png`) });
    }
    await page.goto(url(HERO, "?embed=1&p=0&pausa=1")); await pronto(page);
    await page.screenshot({ path: join(OUT, `pausado-${nome}.png`) });
    if (nome === "mobile") {
      await page.goto(url(HERO, "?embed=1&p=0&menu=1")); await pronto(page); await page.waitForTimeout(800);
      await page.screenshot({ path: join(OUT, "menu-mobile.png") });
      await page.goto(url(OLH)); await pronto(page);
      const alturas = await page.evaluate(() => {
        const y = s => document.querySelector(s).getBoundingClientRect().top + scrollY;
        return [y("#ol-t") - 120, y(".ol-texto--n") - 500, y(".ol-sobre") - 260, y(".ol-texto--d") - 120];
      });
      for (const [i, v] of alturas.entries()) {
        await page.evaluate(a => scrollTo(0, a), v); await page.waitForTimeout(250);
        await page.screenshot({ path: join(OUT, `olhares-mobile-${i + 1}.png`) });
      }
    } else {
      for (const e of ["fechado", "neutro", "n", "d"]) {
        await page.goto(url(OLH, `?estado=${e}`)); await pronto(page);
        await page.locator("#olhares").evaluate(x => x.scrollIntoView());
        await page.waitForTimeout(150);
        await page.screenshot({ path: join(OUT, `olhares-desktop-${e}.png`) });
      }
    }
    await ctx.close();
  }
  console.log("quadros ok");
}

if (modo !== "quadros") {
  const secoes = ["capa", "mapa", "incisao", "olhares", "micro", "contingencia", "pendencias"];
  for (const [nome, cfg] of [["desktop", DESK], ["mobile", CEL]]) {
    const ctx = await browser.newContext(cfg); const page = await ctx.newPage();
    await page.goto(url("index.html")); await pronto(page);
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.addStyleTag({ content: ".barra{position:static!important}" }); // a barra fixa não entra nas capturas
    await page.waitForTimeout(600);
    console.log(nome, "overflow", await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    for (const [i, s] of secoes.entries()) {
      await page.locator("#" + s).screenshot({ path: join(OUT, `storyboard-${nome}-${String(i).padStart(2, "0")}-${s}.png`) });
    }
    await ctx.close();
  }
  console.log("prancha ok");
}
await browser.close();
