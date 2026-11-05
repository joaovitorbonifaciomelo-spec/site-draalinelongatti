// Painel do Cap. 03 no celular: em cada posição da rolagem, com o preview no ar.
// Confere que o texto nunca fica cortado, que o fundo do painel nunca é recortado de lado
// e que o nome lido é o que está inteiro logo acima da linha. Mede também a área da lista.
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const browser = await chromium.launch();

/* Revisão criativa: 390 px. Auditoria: TODOS=1 */
for (const [w, h] of process.env.TODOS ? [[360, 640], [375, 667], [390, 844], [412, 915], [430, 932], [600, 900], [820, 1180]] : [[390, 844]]) {
  for (const rota of ["/?limpo"]) {
    const rot = `${w}x${h}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, locale: "pt-BR" });
    const page = await ctx.newPage();
    page.on("pageerror", e => falhas.push(`[erro JS ${rot}] ${e.message}`));
    await page.goto(BASE + rota);
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(async () => {
      const q = s => document.querySelector(s);
      const sec = q("[data-indice]"), painel = q("[data-idx-painel]"), txt = q("[data-idx-txt]");
      const cta = q(".cta-fixo"), ctaVisivel = cta && getComputedStyle(cta).display !== "none";
      const lis = [...document.querySelectorAll(".idx-base [data-idx]")];
      const inicio = scrollY + sec.getBoundingClientRect().top - innerHeight, fim = inicio + innerHeight * 2 + sec.offsetHeight;
      const quadro = () => new Promise(requestAnimationFrame);
      const res = { posicoes: 0, abertas: 0, cortes: [], lateral: 0, animacoes: 0, excesso: 0, vistos: new Set(), acima: 0, alturaPainel: 0, sobreCTA: 0 };
      for (let y = inicio; y < fim; y += 12) {
        scrollTo({ top: y, behavior: "instant" });
        await quadro(); await quadro();
        res.posicoes++;
        const cs = getComputedStyle(painel);
        /* O navegador abrevia inset(): de 1 a 4 valores, na ordem de cima, direita, baixo, esquerda */
        const v = cs.clipPath.replace(/^inset\(|\)$/g, "").split(" ").map(parseFloat);
        const clip = { cima: v[0], dir: v[1] ?? v[0], baixo: v[2] ?? v[0], esq: v[3] ?? v[1] ?? v[0] };
        const p = painel.getBoundingClientRect();
        if (clip.dir !== 0 || clip.esq !== 0) res.lateral++;
        res.animacoes += painel.getAnimations().length + txt.getAnimations().length;
        const c = lis.findIndex(l => l.classList.contains("ativa"));
        if (painel.classList.contains("aberto")) {
          res.abertas++;
          res.alturaPainel = p.height;
          const t = txt.getBoundingClientRect();
          if (t.top < p.top + clip.cima || t.bottom > p.bottom - clip.baixo) res.cortes.push(Math.round(y));
          if (ctaVisivel && t.bottom > cta.getBoundingClientRect().top) res.sobreCTA++;
          res.excesso = Math.max(res.excesso, painel.scrollHeight - painel.clientHeight);
          if (c >= 0) {
            res.vistos.add(c);
            /* Ao chegar a um novo nome, ele está inteiro acima da linha (só não vale no início, antes de o primeiro chegar) */
            const b = lis[c].getBoundingClientRect();
            if (b.bottom > p.top + 1 && c !== 0) res.acima++;
          }
        } else if (getComputedStyle(txt).visibility !== "hidden") res.cortes.push(`visível fechado ${Math.round(y)}`);
      }
      return { ...res, vistos: res.vistos.size, total: lis.length, areaLista: Math.round((innerHeight - res.alturaPainel) / innerHeight * 100), cortes: res.cortes.slice(0, 5), alturaTela: innerHeight };
    });
    ok(r.abertas > 0, `${rot}: o painel nunca abriu`);
    ok(!r.cortes.length, `${rot}: texto cortado em ${r.cortes.join(", ")}`);
    ok(r.lateral === 0, `${rot}: painel recortado de lado em ${r.lateral} posições`);
    ok(r.animacoes === 0, `${rot}: animação no painel em ${r.animacoes} posições`);
    ok(r.excesso <= 0, `${rot}: texto excede o painel em ${r.excesso}px`);
    ok(r.sobreCTA === 0, `${rot}: texto por baixo do botão fixo em ${r.sobreCTA} posições`);
    ok(r.vistos === r.total, `${rot}: painel passou por ${r.vistos} de ${r.total}`);
    ok(r.acima === 0, `${rot}: nome lido cortado pela linha em ${r.acima} posições`);
    console.log(`${rot}: ${r.posicoes} posições · painel ${Math.round(r.alturaPainel)}px · lista ${r.areaLista}% da tela · ${r.vistos}/${r.total} nomes`);
    await ctx.close();
  }
}

/* Teclado na tela estreita: o painel fixo não pode cobrir o nome focado */
{
  const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  await page.focus(".idx-base .idx-link");
  await page.keyboard.press("Shift+Tab");
  let n = 0;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(60);
    const d = await page.evaluate(() => {
      const e = document.activeElement, li = e.closest("[data-idx]");
      if (!li) return null;
      const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + 80, r.top + r.height / 2);
      return { nome: li.querySelector(".idx-nome").textContent, topo: !!t && (e === t || e.contains(t)), painel: document.querySelector("[data-idx-nome]").textContent };
    });
    if (!d) continue;
    n++;
    ok(d.topo, `teclado estreito: "${d.nome}" coberto`);
    ok(d.painel === d.nome, `teclado estreito: painel mostra "${d.painel}" e o foco está em "${d.nome}"`);
  }
  ok(n === 8, `teclado estreito: ${n} de 8`);
  console.log(`teclado na tela estreita: ${n} nomes com foco visível e painel acompanhando`);
  await ctx.close();
}

/* Salto para longe (âncora): o painel não pode ficar preso na tela */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => { const s = document.querySelector("[data-indice]"); scrollTo({ top: s.offsetTop + 500, behavior: "instant" }); });
  await page.waitForTimeout(200);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(200);
  const preso = await page.evaluate(() => { const p = document.querySelector("[data-idx-painel]"), cs = getComputedStyle(p); return p.classList.contains("aberto") || parseFloat(cs.getPropertyValue("--pt")) < p.offsetHeight; });
  ok(!preso, "salto ao topo: painel continuou na tela");
  await ctx.close();
}

await browser.close();
console.log(`\n${falhas.length ? "FALHAS: " + falhas.length : "Tudo passou."}`);
[...new Set(falhas)].forEach(f => console.log(" ✗ " + f));
process.exit(falhas.length ? 1 : 0);
