// Capturas e gravações do Cap. 03, pela rolagem real.
// Uso: com o preview no ar, node testes/capturar-cap03.mjs <caminho-do-ffmpeg>
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const FF = process.argv[2];
const BASE = process.env.BASE_URL || "http://localhost:4321";
const OUT = process.env.SAIDA || "testes/resultados/cap03";
const ROTA = process.env.ROTA || "/?limpo";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const APAR = {
  desktop: { viewport: { width: 1440, height: 900 }, locale: "pt-BR" },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR" },
};
for (const [nome, cfg] of Object.entries(APAR)) {
  const ctx = await browser.newContext(cfg);
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "error") console.log("[console]", m.text()); });
  page.on("pageerror", e => console.log("[erro JS]", e.message));
  await page.goto(BASE + ROTA);
  await page.evaluate(() => document.fonts.ready);
  const alvo = await page.evaluate(() => { const s = document.querySelector("[data-indice]"), r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  const passos = [-.55, -.2, 0, .1, .3, .5, .72, .9].map(k => k < 0 ? alvo.top + k * cfg.viewport.height : alvo.top + k * (alvo.h - cfg.viewport.height));
  let i = 0;
  for (const y of passos) {
    await page.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y);
    await page.waitForTimeout(650);
    await page.screenshot({ path: join(OUT, `${nome}-${String(i++).padStart(2, "0")}.png`) });
  }
  await ctx.close();
  /* Gravação em movimento */
  const c2 = await browser.newContext(cfg);
  const p2 = await c2.newPage();
  await p2.goto(BASE + ROTA);
  await p2.evaluate(() => document.fonts.ready);
  const a2 = await p2.evaluate(() => { const s = document.querySelector("[data-indice]"), r = s.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height }; });
  await p2.evaluate(y => scrollTo({ top: y, behavior: "instant" }), a2.top - cfg.viewport.height * .5);
  await p2.waitForTimeout(400);
  const pasta = resolve(OUT, `_q-${nome}`);
  rmSync(pasta, { recursive: true, force: true });
  mkdirSync(pasta, { recursive: true });
  const cdp = await c2.newCDPSession(p2);
  const q = [];
  cdp.on("Page.screencastFrame", async f => {
    const n = `${String(q.length).padStart(5, "0")}.jpg`;
    writeFileSync(join(pasta, n), Buffer.from(f.data, "base64"));
    q.push({ n, t: f.metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  const esc = cfg.deviceScaleFactor || 1;
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: cfg.viewport.width * esc, maxHeight: cfg.viewport.height * esc });
  await p2.evaluate(({ y1, ms }) => new Promise(ok => {
    const y0 = scrollY, t0 = performance.now();
    const f = a => { const k = Math.min(1, (a - t0) / ms); scrollTo({ top: y0 + (y1 - y0) * k, behavior: "instant" }); k < 1 ? requestAnimationFrame(f) : ok(); };
    requestAnimationFrame(f);
  }), { y1: a2.top + a2.h - cfg.viewport.height * .8, ms: 22000 });
  await p2.waitForTimeout(800);
  await cdp.send("Page.stopScreencast");
  const lista = q.map((x, i) => `file '${x.n}'\nduration ${(q[i + 1] ? q[i + 1].t - x.t : .1).toFixed(4)}`).join("\n") + `\nfile '${q.at(-1).n}'\n`;
  writeFileSync(join(pasta, "lista.txt"), lista);
  execFileSync(FF, ["-hide_banner", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(pasta, "lista.txt"), "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", resolve(OUT, `cap03-${nome}.mp4`)], { cwd: pasta });
  rmSync(pasta, { recursive: true, force: true });
  await c2.close();
  console.log(nome, "ok", q.length, "quadros");
}
await browser.close();
