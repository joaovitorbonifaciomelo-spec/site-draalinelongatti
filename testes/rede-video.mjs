// Reprodução da montagem em rede limitada: tempo até tocar, travadas, quadros perdidos e dados baixados.
// Em 3G simulado o próprio site troca para a versão leve: o arquivo é fixado aqui para comparar as versões.
// Uso: com o preview no ar, node testes/rede-video.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const REDES = { "4G 9 Mbps": [9e6, 170], "4G lento 1,6 Mbps": [1.6e6, 150], "3G 0,75 Mbps": [.75e6, 300] };
const CASOS = [
  ["celular 720p", "m", "hero-mobile.mp4"],
  ["celular 540p leve", "m", "hero-mobile-leve.mp4"],
  ["computador 1080p", "d", null],
];
const comLimite = (promessa, ms, rotulo) => Promise.race([promessa, new Promise((_, n) => setTimeout(() => n(new Error("limite de tempo: " + rotulo)), ms))]);
const browser = await chromium.launch({ channel: "chrome" });
for (const [nomeRede, [bps, lat]] of Object.entries(REDES)) for (const [nome, ap, troca] of CASOS) {
  const ctx = await browser.newContext(ap === "m" ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  if (troca) await page.route("**/hero-mobile*.mp4", r => r.continue({ url: `${BASE}/media/${troca}` }));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: lat, downloadThroughput: bps / 8, uploadThroughput: 750e3 / 8 });
  if (ap === "m") await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.addInitScript(() => {
    window.__v = { inicio: 0, tocou: 0, esperas: 0, ms: 0, desde: 0 };
    new MutationObserver((_, o) => {
      const v = document.querySelector(".hero1 video"); if (!v) return; o.disconnect();
      const w = window.__v;
      v.addEventListener("loadstart", () => { w.inicio ||= performance.now(); });
      v.addEventListener("playing", () => { w.tocou ||= performance.now(); if (w.desde) { w.ms += performance.now() - w.desde; w.desde = 0; } });
      v.addEventListener("waiting", () => { if (w.tocou) { w.esperas++; w.desde = performance.now(); } });
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto(`${BASE}/?limpo`, { waitUntil: "load", timeout: 90000 });
  await page.waitForTimeout(30000);
  try {
    const r = await comLimite(page.evaluate(() => {
      const v = document.querySelector(".hero1 video"), q = v?.getVideoPlaybackQuality?.();
      return { ...window.__v, total: q?.totalVideoFrames ?? 0, perdidos: q?.droppedVideoFrames ?? 0 };
    }), 15000, "leitura");
    const seg = r.tocou ? ((r.tocou - r.inicio) / 1000).toFixed(1) + " s" : "não tocou em 30 s";
    console.log(`${nomeRede} | ${nome} | até tocar: ${seg} | ${(r.ms / 1000).toFixed(1)} s parado | quadros: ${r.total}, perdidos ${r.perdidos}`);
  } catch (e) { console.log(`${nomeRede} | ${nome} | SEM RESULTADO: ${e.message}`); }
  await comLimite(ctx.close(), 10000, "fechar").catch(() => {});
}
await comLimite(browser.close(), 10000, "fechar").catch(() => {});
process.exit(0);
