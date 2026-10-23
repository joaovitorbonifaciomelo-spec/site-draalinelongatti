import { createRequire } from "node:module";
const require = createRequire("C:/Projetos/site-bonifacio/package.json");
const { chromium } = require("@playwright/test");

const OUT = process.argv[2];
const pages = ["", "sobre", "tratamentos", "depoimentos", "artigos", "contato", "politicas-privacidade"];
const views = [
  { nome: "computador", width: 1440, height: 900, mobile: false },
  { nome: "celular", width: 390, height: 844, mobile: true },
];

const browser = await chromium.launch();
for (const v of views) {
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: v.mobile, hasTouch: v.mobile, deviceScaleFactor: v.mobile ? 2 : 1, locale: "pt-BR" });
  const page = await ctx.newPage();
  for (const p of pages) {
    const url = `https://draalinelongatti.com/${p}${p ? "/" : ""}`;
    const nome = p || "home";
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
      // rola até o fim para carregar imagens com lazy-load
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/${v.nome}/${nome}.png`, fullPage: true });
      console.log("ok", v.nome, nome);
    } catch (e) { console.log("ERRO", v.nome, nome, e.message.split("\n")[0]); }
  }
  await ctx.close();
}
await browser.close();
