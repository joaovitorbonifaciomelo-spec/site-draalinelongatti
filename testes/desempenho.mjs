// Medição local indicativa de LCP, CLS, INP aproximado e peso, em celular simulado (CPU 4x, rede 4G).
// Não substitui a medição em campo da Etapa E. Com `npm run preview` no ar: node testes/desempenho.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const browser = await chromium.launch();

async function medir(rotulo, cfg, cpu, rede) {
  const ctx = await browser.newContext(cfg);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (rede) await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });

  const tipos = {};
  cdp.on("Network.loadingFinished", e => { tipos.total = (tipos.total || 0) + e.encodedDataLength; });
  await page.addInitScript(() => {
    window.__m = { lcp: 0, cls: 0, inp: 0, el: "" };
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.el = e.element?.className || e.element?.tagName || ""; } }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.inp = Math.max(window.__m.inp, e.duration); }).observe({ type: "event", durationThreshold: 16, buffered: true });
  });
  await page.goto(BASE + "/", { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(5000);

  /* Percorre a página para que o CLS inclua a rolagem */
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 300) {
    await page.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => { const s = document.querySelector("[data-olhares]"); scrollTo({ top: s.offsetTop + innerHeight * .56, behavior: "instant" }); });
  await page.waitForTimeout(200);
  /* Interações reais */
  if (cfg.isMobile) {
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(200);
    await page.tap("[data-nav] [data-menu-abrir]");
    await page.waitForTimeout(800);
    await page.tap("[data-menu-fechar]");
    await page.waitForTimeout(800);
  } else {
    await page.mouse.move(150, 500); await page.mouse.down(); await page.mouse.up();
    await page.waitForTimeout(800);
    await page.mouse.move(1300, 500); await page.mouse.down(); await page.mouse.up();
    await page.waitForTimeout(800);
  }
  const m = await page.evaluate(() => window.__m);
  console.log(`${rotulo}: LCP ${Math.round(m.lcp)} ms (${m.el}) · CLS ${m.cls.toFixed(3)} · maior interação ${Math.round(m.inp)} ms · transferido ${Math.round(tipos.total / 1024)} KB`);
  await ctx.close();
}

await medir("Celular (CPU 4x, 4G)", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 4, true);
await medir("Computador (sem limite)", { viewport: { width: 1440, height: 900 } }, 1, false);
await browser.close();
