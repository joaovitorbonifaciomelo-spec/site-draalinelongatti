// Testes do Cap. 03. Com `npm run preview` no ar: node testes/qa-cap03.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const browser = await chromium.launch();
const TOTAL = 8;

const irSecao = (page, k) => page.evaluate(k => { const s = document.querySelector("[data-indice]"); scrollTo({ top: s.offsetTop + (s.offsetHeight - innerHeight) * k, behavior: "instant" }); }, k);
const vigiar = (page, rot) => {
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") falhas.push(`[console ${rot}] ${m.text()}`); });
  page.on("pageerror", e => falhas.push(`[erro JS ${rot}] ${e.message}`));
};

/* Tamanhos: sem estouro, com a descrição mais longa inteira no painel */
const TODOS = [[320, 568, 1], [360, 640, 1], [390, 844, 1], [430, 932, 1], [600, 900, 1], [820, 1180, 0], [844, 390, 1], [899, 700, 0], [900, 720, 0], [1024, 768, 0], [1280, 720, 0], [1366, 768, 0], [1440, 900, 0], [1920, 1080, 0], [2560, 1440, 0]];
/* Revisão criativa: os dois tamanhos principais. Auditoria: TODOS=1 */
for (const [w, h, cel] of process.env.TODOS ? TODOS : [[390, 844, 1], [1440, 900, 0]]) {
  const rot = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: !!cel, hasTouch: !!cel, locale: "pt-BR" });
  const page = await ctx.newPage();
  vigiar(page, rot);
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  ok(await page.evaluate(() => document.querySelectorAll(".idx-base [data-idx]").length) === TOTAL, `${rot}: número de itens`);
  await irSecao(page, .1);
  await page.waitForTimeout(150);
  const estouro = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(estouro <= 0, `${rot}: estouro horizontal de ${estouro}px`);
  const modoPainel = await page.evaluate(() => getComputedStyle(document.querySelector("[data-idx-painel]")).display !== "none");
  if (modoPainel) {
    /* Passa por todos os itens, medindo o painel */
    const r = await page.evaluate(async () => {
      const lis = [...document.querySelectorAll(".idx-base [data-idx]")], painel = document.querySelector("[data-idx-painel]");
      const linha = parseFloat(getComputedStyle(document.querySelector("[data-indice]")).getPropertyValue("--y"));
      const vistos = new Set(); let pior = 0, excesso = 0;
      for (const li of lis) {
        scrollTo({ top: scrollY + li.getBoundingClientRect().top - (innerHeight * .5), behavior: "instant" });
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
      }
      const y0 = document.querySelector("[data-indice]").offsetTop - innerHeight;
      const fim = y0 + innerHeight + document.querySelector("[data-indice]").offsetHeight;
      for (let y = y0; y < fim; y += 30) {
        scrollTo({ top: y, behavior: "instant" });
        await new Promise(requestAnimationFrame); await new Promise(requestAnimationFrame);
        const a = document.querySelector(".idx-base .ativa");
        if (a) vistos.add(a.dataset.idx);
        excesso = Math.max(excesso, painel.scrollHeight - painel.clientHeight);
        const d = document.querySelector("[data-idx-desc]").getBoundingClientRect();
        pior = Math.max(pior, d.bottom - painel.getBoundingClientRect().bottom);
      }
      return { vistos: vistos.size, excesso, pior, linha };
    });
    ok(r.vistos === TOTAL, `${rot}: a linha passou por ${r.vistos} de ${TOTAL} itens`);
    ok(r.excesso <= 0 && r.pior <= 1, `${rot}: texto excede o painel (${r.excesso}, ${r.pior})`);
  } else {
    const vis = await page.evaluate(() => [...document.querySelectorAll(".idx-desc")].every(d => d.getBoundingClientRect().height > 10));
    ok(vis, `${rot}: sem painel, as descrições deveriam estar à vista`);
  }
  await ctx.close();
}
console.log("tamanhos: sem estouro; painel com o texto inteiro e passando por todos os itens");

/* Teclado no computador: foco visível, fora da camada de cima, sem repetir a cópia; painel acompanha */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "pt-BR" });
  const page = await ctx.newPage();
  vigiar(page, "teclado");
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  await page.focus(".idx-base .idx-link");
  await page.keyboard.press("Shift+Tab");
  let n = 0;
  const nomes = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(60);
    const d = await page.evaluate(() => {
      const e = document.activeElement, li = e.closest("[data-idx]");
      if (!li) return { fora: true, nome: e.textContent.trim().slice(0, 30), copia: !!e.closest("[aria-hidden='true']") };
      const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + 80, r.top + r.height / 2);
      return { nome: li.querySelector(".idx-nome").textContent, topo: !!t && (e === t || e.contains(t)), naTela: r.top >= 0 && r.bottom <= innerHeight,
        painel: document.querySelector("[data-idx-nome]").textContent, copia: !!e.closest("[aria-hidden='true']"), ativa: li.classList.contains("ativa") };
    });
    ok(!d.copia, `teclado: a cópia recebeu foco (${d.nome})`);
    if (d.fora) continue;
    n++; nomes.push(d.nome);
    ok(d.topo, `teclado: "${d.nome}" ficou coberto`);
    ok(d.naTela, `teclado: "${d.nome}" fora da tela`);
    ok(d.painel === d.nome && d.ativa, `teclado: painel não acompanhou "${d.nome}" (${d.painel})`);
  }
  ok(n === TOTAL, `teclado: ${n} de ${TOTAL} itens alcançados`);
  await page.keyboard.press("Shift+Tab");
  await ctx.close();
  console.log(`teclado: ${n} itens na ordem, com foco visível e painel acompanhando`);
}

/* Mouse: o nome sob o ponteiro é o lido, em qualquer camada; o clique leva ao assunto */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "pt-BR" });
  const page = await ctx.newPage();
  vigiar(page, "mouse");
  await page.goto(BASE + "/?limpo");
  await page.evaluate(() => document.fonts.ready);
  await irSecao(page, .25);
  await page.waitForTimeout(400);
  for (const camada of [".idx-base", ".idx-sobre"]) {
    const alvo = await page.evaluate(c => {
      const linha = parseFloat(getComputedStyle(document.documentElement).height) && innerHeight * .62;
      for (const li of document.querySelectorAll(`${c} [data-idx]`)) {
        const r = li.getBoundingClientRect(), meio = r.top + r.height / 2;
        if (r.top > 80 && r.bottom < innerHeight - 10 && (c === ".idx-base" ? r.bottom < linha : r.top > linha)) return { x: r.left + 200, y: meio, i: li.dataset.idx, nome: li.querySelector(".idx-nome").textContent };
      }
      return null;
    }, camada);
    ok(alvo, `mouse: nenhum item visível em ${camada}`);
    if (!alvo) continue;
    await page.mouse.move(alvo.x, alvo.y);
    await page.waitForTimeout(120);
    const nome = await page.evaluate(() => document.querySelector("[data-idx-nome]").textContent);
    ok(nome === alvo.nome, `mouse em ${camada}: painel mostra "${nome}", esperado "${alvo.nome}"`);
    if (camada === ".idx-sobre") {
      await Promise.all([page.waitForURL(/\/tratamentos\/#/), page.mouse.click(alvo.x, alvo.y)]);
      await page.waitForLoadState();
      ok(/\/tratamentos\/#/.test(page.url()), `mouse: clique levou a ${page.url()}`);
      const alvoExiste = await page.evaluate(() => !!document.querySelector(location.hash));
      ok(alvoExiste, "mouse: a âncora do tratamento não existe");
    }
  }
  await ctx.close();
  console.log("mouse: painel acompanha nas duas camadas; clique leva à âncora do tratamento");
}

/* Leitor de tela: uma única h2, cópia oculta, descrições no HTML */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/?limpo");
  const r = await page.evaluate(() => ({
    h2: [...document.querySelectorAll("[data-indice] h2")].length, h3: [...document.querySelectorAll("[data-indice] h3")].length,
    copiaOculta: document.querySelector(".idx-sobre").getAttribute("aria-hidden") === "true",
    painelOculto: document.querySelector("[data-idx-painel]").getAttribute("aria-hidden") === "true",
    desc: [...document.querySelectorAll(".idx-base .idx-desc")].filter(d => d.textContent.trim()).length,
    copiaTab: [...document.querySelectorAll(".idx-sobre a")].every(a => a.tabIndex === -1),
  }));
  ok(r.h2 === 1 && r.h3 === 2, `semântica: h2 ${r.h2}, h3 ${r.h3}`);
  ok(r.copiaOculta && r.painelOculto && r.copiaTab, "semântica: cópia ou painel expostos");
  ok(r.desc === TOTAL, `semântica: ${r.desc} descrições no HTML`);
  await ctx.close();
  console.log("semântica: títulos, cópia oculta e todas as descrições no HTML");
}

/* Sem animação e sem JS: lista parada com tudo à vista */
for (const [rot, cfg] of [["reduzir movimento", { viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" }], ["reduzir movimento celular", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" }], ["sem JS", { viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }], ["sem JS celular", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, javaScriptEnabled: false }]]) {
  const ctx = await browser.newContext({ ...cfg, locale: "pt-BR" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/?limpo");
  const shot = rot.replace(/\W+/g, "-");
  await page.locator("[data-indice]").screenshot({ path: `testes/resultados/cap03/${shot}.png` });
  const r = await page.evaluate(() => ({
    painel: getComputedStyle(document.querySelector("[data-idx-painel]")).display,
    copia: getComputedStyle(document.querySelector(".idx-sobre")).display,
    desc: [...document.querySelectorAll(".idx-base .idx-desc")].filter(d => d.getBoundingClientRect().height > 10).length,
  }));
  ok(r.painel === "none" && r.copia === "none", `${rot}: painel ou cópia deveriam sumir`);
  ok(r.desc === TOTAL, `${rot}: ${r.desc} descrições à vista`);
  await ctx.close();
}
console.log("reduzir movimento e sem JS: lista parada, com todas as descrições à vista");

await browser.close();
console.log(`\n${falhas.length ? "FALHAS: " + falhas.length : "Tudo passou."}`);
[...new Set(falhas)].forEach(f => console.log(" ✗ " + f));
process.exit(falhas.length ? 1 : 0);
