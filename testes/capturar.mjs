// Capturas da entrega, sempre pela rolagem real (sem parâmetros de congelamento).
// Uso: com `npm run preview` no ar, `node testes/capturar.mjs [pasta-de-saída]`
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const OUT = process.argv[2] || "testes/resultados/capturas";
mkdirSync(OUT, { recursive: true });

const DESK = { viewport: { width: 1440, height: 900 }, locale: "pt-BR" };
const CEL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR" };

const browser = await chromium.launch();
const nova = async (cfg, q = "?limpo") => {
  const ctx = await browser.newContext(cfg);
  const page = await ctx.newPage();
  await page.goto(BASE + "/" + q);
  await page.evaluate(() => document.fonts.ready);
  return page;
};
const rolar = async (page, y) => {
  await page.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y);
  await page.waitForTimeout(450);
};
const foto = (page, nome) => page.screenshot({ path: join(OUT, nome + ".png") });

/* Posição de rolagem para um progresso do palco do hero */
const yHero = (page, p) => page.evaluate(v => {
  const el = document.querySelector("[data-palco]");
  return el.offsetTop + (el.offsetHeight - innerHeight) * v;
}, p);
/* Posição para um progresso do Cap. 02 (mesma conta de dois-olhares.ts) */
const yOlhares = (page, p) => page.evaluate(v => {
  const s = document.querySelector("[data-olhares]"), vh = innerHeight;
  return s.offsetTop - vh * .45 + (vh * .45 + s.offsetHeight - vh) * v;
}, p);

for (const [nome, cfg] of [["desktop", DESK], ["mobile", CEL]]) {
  const page = await nova(cfg);
  for (const p of [0, .2, .42, .56, .75, 1]) {
    await rolar(page, await yHero(page, p));
    await foto(page, `hero-${nome}-${String(Math.round(p * 100)).padStart(3, "0")}`);
  }
  if (nome === "desktop") {
    for (const p of [.12, .3, .48, .75]) {
      await rolar(page, await yOlhares(page, p));
      await foto(page, `olhares-desktop-passagem-${String(Math.round(p * 100)).padStart(3, "0")}`);
    }
    const y = await yOlhares(page, .8);
    await rolar(page, y);
    await foto(page, "olhares-desktop-neutro");
    await page.mouse.move(180, 500); await page.waitForTimeout(1300);
    await foto(page, "olhares-desktop-nutrologia");
    await page.mouse.move(1260, 500); await page.waitForTimeout(1300);
    await foto(page, "olhares-desktop-dermatologia");
    await page.mouse.move(0, 0);
    await rolar(page, await page.evaluate(() => document.documentElement.scrollHeight));
    await foto(page, "rodape-desktop");
  } else {
    const inicio = await page.evaluate(() => document.querySelector("[data-olhares]").offsetTop);
    const altura = await page.evaluate(() => document.querySelector("[data-olhares]").offsetHeight);
    for (let i = 0; i < 5; i++) {
      await rolar(page, inicio + i * (altura - 844) / 4);
      await foto(page, `olhares-mobile-${i + 1}`);
    }
    await rolar(page, await page.evaluate(() => document.documentElement.scrollHeight));
    await foto(page, "rodape-mobile");
    await rolar(page, 0);
    await page.click("[data-menu-abrir]"); await page.waitForTimeout(800);
    await foto(page, "menu-mobile");
  }
  await page.context().close();
}

/* Com as marcas de provisório visíveis */
for (const [nome, cfg] of [["desktop", DESK], ["mobile", CEL]]) {
  const page = await nova(cfg, "");
  await foto(page, `provisorio-hero-${nome}`);
  await rolar(page, await yHero(page, 1));
  await foto(page, `provisorio-manifesto-${nome}`);
  await page.context().close();
}

/* Movimento reduzido: página inteira, empilhada */
for (const [nome, cfg] of [["desktop", DESK], ["mobile", CEL]]) {
  const page = await nova({ ...cfg, reducedMotion: "reduce" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(OUT, `reduzido-${nome}.png`), fullPage: true });
  await page.context().close();
}
await browser.close();
console.log("Capturas em", OUT);
