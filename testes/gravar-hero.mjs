// Grava a interação real em movimento: filme tocando, rolagem nativa, sem nada fixado.
// Grava os quadros da tela do navegador e monta um MP4 com o ffmpeg.
// Uso: node testes/gravar-hero.mjs <caminho-do-ffmpeg> [pasta-de-saída]
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const [FF, OUT = "testes/resultados/hero-c/gravacoes"] = process.argv.slice(2);
const BASE = process.env.BASE_URL || "http://localhost:4321";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

for (const [nome, cfg] of [
  ["desktop", { viewport: { width: 1440, height: 900 } }],
  ["mobile", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
]) {
  const ctx = await browser.newContext({ ...cfg, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?limpo`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => { const v = document.querySelector(".hero1 video"); return v && !v.paused && v.currentTime > 0; }, null, { timeout: 60000 });

  const pasta = resolve(OUT, `_q-${nome}`);
  rmSync(pasta, { recursive: true, force: true });
  mkdirSync(pasta, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const quadros = [];
  cdp.on("Page.screencastFrame", async f => {
    const n = `${String(quadros.length).padStart(5, "0")}.jpg`;
    writeFileSync(join(pasta, n), Buffer.from(f.data, "base64"));
    quadros.push({ n, t: f.metadata.timestamp });
    await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: cfg.viewport.width * (cfg.deviceScaleFactor || 1), maxHeight: cfg.viewport.height * (cfg.deviceScaleFactor || 1), everyNthFrame: 1 });

  /* Roteiro: repouso, abertura lenta, parada com o corte aberto, nova incisão, Cap. 01 */
  const rolar = (ate, ms) => page.evaluate(({ ate, ms }) => new Promise(ok => {
    const e = document.querySelector("[data-palco]"), total = e.offsetHeight - innerHeight;
    const y0 = scrollY, y1 = e.offsetTop + total * ate, t0 = performance.now();
    const passo = agora => {
      const k = Math.min(1, (agora - t0) / ms), s = k * k * (3 - 2 * k);
      scrollTo({ top: y0 + (y1 - y0) * s, behavior: "instant" });
      k < 1 ? requestAnimationFrame(passo) : ok();
    };
    requestAnimationFrame(passo);
  }), { ate, ms });
  await page.waitForTimeout(5000);
  await rolar(.42, 3500);
  await page.waitForTimeout(2500);
  await rolar(.54, 1300);
  await page.waitForTimeout(500);
  await rolar(1, 3200);
  await page.waitForTimeout(1200);
  await cdp.send("Page.stopScreencast");

  const lista = quadros.map((q, i) => `file '${q.n}'\nduration ${(quadros[i + 1] ? quadros[i + 1].t - q.t : .1).toFixed(4)}`).join("\n") + `\nfile '${quadros.at(-1).n}'\n`;
  writeFileSync(join(pasta, "lista.txt"), lista);
  const saida = resolve(OUT, `hero-${nome}.mp4`);
  execFileSync(FF, ["-hide_banner", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(pasta, "lista.txt"),
    "-vf", "fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", saida], { cwd: pasta });
  rmSync(pasta, { recursive: true, force: true });
  console.log(saida, `${quadros.length} quadros em ${(quadros.at(-1).t - quadros[0].t).toFixed(1)} s`);
  await ctx.close();
}
await browser.close();
