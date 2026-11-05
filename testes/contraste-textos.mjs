// Contraste de todos os textos do hero, nos pixels reais: cada letra contra o que está atrás dela.
// Grava pares de imagens (com e sem texto) e os dados de cada estado; testes/contraste-textos.py faz a conta.
// Uso: com o preview no ar, node testes/contraste-textos.mjs <pasta>
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const OUT = process.argv[2];
mkdirSync(OUT, { recursive: true });
/* Tempos cobrem a cena da médica (com o movimento dela) e todos os outros planos */
const TEMPOS = [.5, 1.9, 2.1, 3.9, 4.1, 6, 7];   /* inclui os quadros vizinhos aos cortes da montagem */
const ESTADOS = [0, .05, .1, .15, .2, .25, .3, .35, .42, .48, .54, .6, .7, .8, .9];
const INDICE = [.02, .1, .25, .4, .55, .7, .85, .98];
const TELAS = {
  "1440x900": { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  "1024x768": { viewport: { width: 1024, height: 768 }, deviceScaleFactor: 2 },
  "390x844": { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  "360x640": { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const GRUPOS = {
  titulo: { meta: 3, sel: ".papel .h1-titulo, .h1-titulo--copia" },
  menu: { meta: 4.5, sel: "[data-nav] .marca, [data-nav] .nav-links a, [data-nav] .menu-btn, [data-nav] .cta, .hero1 .nav-copia .marca, .hero1 .nav-copia .nav-links a, .hero1 .nav-copia .menu-btn, .hero1 .nav-copia .cta" },
  texto: { meta: 4.5, sel: ".h1-intro .rotulo, .h1-intro .lead, .h1-intro .cta, .h1-intro .link-seta, .h1-cred dt, .h1-cred dd, .m-apoio, .m-rotulo" },
  indiceTitulos: { meta: 3, sel: ".idx-titulo, .idx-nome, .idx-painel-nome" },
  indiceTexto: { meta: 4.5, sel: ".idx-cap, .idx-apoio, .idx-atalhos a, .idx-grupo-nome, .idx-area-rotulo, .idx-n, .idx-painel-esp, .idx-painel-desc, .idx-conta, .idx-fim a, .idx-desc" },
  pausa: { meta: 4.5, sel: ".pausa-txt, .pausa svg" },
  ctaFixo: { meta: 4.5, sel: ".cta-celular, .cta-fixo, [data-cta-fixo], .barra-cta .cta" },
};
const SEM_TEXTO = `.palco *, .idx *, [data-nav] *, .cta-fixo, .cta-fixo * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }
  .pausa svg { fill: transparent !important; }`;

const browser = await chromium.launch({ channel: "chrome" });
for (const [tela, cfg] of Object.entries(TELAS)) {
  const ctx = await browser.newContext({ ...cfg, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/?limpo`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => { const v = document.querySelector(".hero1 video"); return v && !v.paused && v.currentTime > 0; }, null, { timeout: 60000 });
  /* Sem transições: esconder o texto precisa ser instantâneo, senão a letra meio apagada conta como fundo */
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });
  for (const p of ESTADOS) {
    await page.evaluate(p => { const e = document.querySelector("[data-palco]"); scrollTo({ top: e.offsetTop + (e.offsetHeight - innerHeight) * p, behavior: "instant" }); }, p);
    await page.waitForTimeout(1300); /* as cores do menu têm transição de .5 s */
    for (const t of TEMPOS) {
      await page.evaluate(t => new Promise(ok => { const v = document.querySelector(".hero1 video"); v.pause(); if (Math.abs(v.currentTime - t) < .01) return ok(); v.addEventListener("seeked", () => ok(), { once: true }); v.currentTime = t; }), t);
      await page.waitForTimeout(90);
      const dados = await page.evaluate(GRUPOS => {
        const saida = {};
        for (const [g, { meta, sel }] of Object.entries(GRUPOS)) {
          const itens = [];
          for (const el of document.querySelectorAll(sel)) {
            const r = el.getBoundingClientRect(), s = getComputedStyle(el);
            if (r.width < 1 || r.height < 1 || s.visibility === "hidden" || s.display === "none") continue;
            if (r.bottom < 0 || r.top > innerHeight) continue;
            itens.push({ x: r.left, y: r.top, w: r.width, h: r.height, cor: s.color });
          }
          saida[g] = { meta, itens };
        }
        return saida;
      }, GRUPOS);
      const base = join(OUT, `${tela}_p${Math.round(p * 100)}_t${t}`);
      await page.screenshot({ path: base + "_com.png" });
      const tag = await page.addStyleTag({ content: SEM_TEXTO });
      await page.waitForTimeout(40);
      await page.screenshot({ path: base + "_sem.png" });
      await tag.evaluate(n => n.remove());
      writeFileSync(base + ".json", JSON.stringify({ dpr: cfg.deviceScaleFactor, grupos: dados }));
    }
  }
  /* Cap. 03: superfícies sólidas, o filme não interfere */
  for (const k of INDICE) {
    await page.evaluate(k => { const s = document.querySelector("[data-indice]"); scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * k, behavior: "instant" }); }, k);
    await page.waitForTimeout(500);
    const dados = await page.evaluate(GRUPOS => {
      const saida = {};
      for (const [g, { meta, sel }] of Object.entries(GRUPOS)) {
        if (!g.startsWith("indice")) continue;
        const itens = [];
        for (const el of document.querySelectorAll(sel)) {
          const r = el.getBoundingClientRect(), s = getComputedStyle(el);
          if (r.width < 2 || r.height < 2 || s.visibility === "hidden" || s.display === "none" || r.bottom < 0 || r.top > innerHeight) continue;
          itens.push({ x: r.left, y: r.top, w: r.width, h: r.height, cor: s.color });
        }
        saida[g] = { meta, itens };
      }
      return saida;
    }, GRUPOS);
    const base = join(OUT, `${tela}_p${Math.round(k * 100) + 1000}_t0`);
    await page.screenshot({ path: base + "_com.png" });
    const tag = await page.addStyleTag({ content: SEM_TEXTO });
    await page.waitForTimeout(40);
    await page.screenshot({ path: base + "_sem.png" });
    await tag.evaluate(n => n.remove());
    writeFileSync(base + ".json", JSON.stringify({ dpr: cfg.deviceScaleFactor, grupos: dados }));
  }
  await ctx.close();
  console.log(tela, "ok");
}
await browser.close();
