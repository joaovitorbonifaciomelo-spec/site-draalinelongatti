// Capturas com o vídeo real: cada plano do filme em cada estado da revelação.
// A rolagem é real; só o tempo do vídeo é fixado, para a captura não depender da sorte.
// Usa o Chrome instalado, porque o Chromium do Playwright não decodifica H.264.
// Com `npm run preview` no ar: node testes/capturar-video.mjs [pasta-de-saída]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const OUT = process.argv[2] || "testes/resultados/hero-c";
mkdirSync(OUT, { recursive: true });

const PLANOS = { medica: 1, quadros: 3, luz: 5, final: 7 };
const ESTADOS = [0, .15, .3, .42, .5, .6, .75, .9];
const APARELHOS = {
  desktop: { viewport: { width: 1440, height: 900 }, locale: "pt-BR" },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR" },
};
const browser = await chromium.launch({ channel: "chrome" });
const fixar = (page, t) => page.evaluate(t => new Promise(ok => {
  const v = document.querySelector(".hero1 video");
  v.pause();
  if (Math.abs(v.currentTime - t) < .01) return ok();
  v.addEventListener("seeked", () => ok(), { once: true });
  v.currentTime = t;
}), t);
const yHero = (page, p) => page.evaluate(v => {
  const el = document.querySelector("[data-palco]");
  return el.offsetTop + (el.offsetHeight - innerHeight) * v;
}, p);

for (const [nome, cfg] of Object.entries(APARELHOS)) {
  const ctx = await browser.newContext(cfg);
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") console.log("[console]", m.text()); });
  page.on("pageerror", e => console.log("[erro JS]", e.message));
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => { const v = document.querySelector(".hero1 video"); return v && !v.paused && v.currentTime > 0; }, null, { timeout: 60000 });
  await page.waitForTimeout(800);
  for (const [plano, t] of Object.entries(PLANOS)) {
    for (const p of ESTADOS) {
      await page.evaluate(v => scrollTo({ top: v, behavior: "instant" }), await yHero(page, p));
      await page.waitForTimeout(250);
      await fixar(page, t);
      await page.waitForTimeout(150);
      await page.screenshot({ path: join(OUT, `${nome}-${plano}-${String(Math.round(p * 100)).padStart(3, "0")}.png`) });
    }
  }
  await ctx.close();
  console.log(nome, "ok");
}
await browser.close();
