// Testes da entrega. Com `npm run preview` no ar: node testes/qa.mjs
// Sai com código 1 se houver qualquer falha.
import { chromium, webkit } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const PAGINAS = ["/", "/tratamentos/", "/sobre/", "/artigos/", "/contato/", "/politicas-privacidade/"];
const TAMANHOS = [
  [320, 568], [360, 640], [375, 667], [390, 844], [414, 896], [430, 932], // celulares
  [667, 375], [844, 390], // celulares deitados
  [768, 1024], [820, 1180], [1024, 768], [1180, 820], // tablets
  [1280, 640], [1280, 720], [1366, 768], [1440, 900], [1536, 864], [1920, 1080], [2560, 1440], // computadores
];
mkdirSync("testes/resultados", { recursive: true });

const falhas = [];
const ok = (cond, msg) => { if (!cond) falhas.push(msg); return cond; };
const secao = t => console.log(`\n== ${t}`);

/* Registra tudo que o navegador reclamar */
function vigiar(page, rotulo) {
  page.on("console", m => { if (["error", "warning"].includes(m.type())) falhas.push(`[console ${rotulo}] ${m.text()}`); });
  page.on("pageerror", e => falhas.push(`[erro JS ${rotulo}] ${e.message}`));
  page.on("requestfailed", r => { if (!(/\.mp4$/.test(r.url()) && r.failure()?.errorText === "net::ERR_ABORTED")) falhas.push(`[requisição ${rotulo}] ${r.url()} ${r.failure()?.errorText}`); });
  page.on("response", r => { if (r.status() >= 400) falhas.push(`[HTTP ${r.status()} ${rotulo}] ${r.url()}`); });
}

const celular = w => w <= 760;
const cfgDe = ([width, height], extra = {}) => ({
  viewport: { width, height }, locale: "pt-BR",
  ...(width < 900 ? { isMobile: true, hasTouch: true } : {}),
  ...extra,
});
const rolar = async (page, y) => {
  await page.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y);
  await page.waitForTimeout(120);
};
const abrir = async (page, q = "?limpo") => {
  await page.goto(BASE + "/" + q);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(100);
};

const browser = await chromium.launch();

/* ---------- 1. Console em todas as páginas ---------- */
secao("Console e requisições (todas as páginas, celular e computador)");
for (const tam of [[390, 844], [1440, 900]]) {
  const ctx = await browser.newContext(cfgDe(tam));
  for (const p of PAGINAS) {
    const page = await ctx.newPage();
    vigiar(page, `${p} ${tam[0]}`);
    await page.goto(BASE + p, { waitUntil: "networkidle" });
    await page.close();
  }
  await ctx.close();
}
console.log(`${PAGINAS.length} páginas em 2 tamanhos`);

/* ---------- 2. Responsividade ---------- */
secao("Responsividade e colisões");
const sobrepoe = (a, b, folga = 0) => a && b && a.left < b.right - folga && b.left < a.right - folga && a.top < b.bottom - folga && b.top < a.bottom - folga;
for (const tam of TAMANHOS) {
  const [w, h] = tam;
  const rot = `${w}x${h}`;
  const ctx = await browser.newContext(cfgDe(tam));
  const page = await ctx.newPage();
  vigiar(page, rot);
  await abrir(page);

  const medir = sel => page.evaluate(s => {
    const el = document.querySelector(s);
    if (!el) return null;
    const c = getComputedStyle(el);
    if (c.display === "none" || c.visibility === "hidden") return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
  }, sel);
  const estouro = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // Hero
  ok((await estouro()) <= 0, `${rot}: estouro horizontal na página`);
  const titulo = await medir(".papel .h1-titulo");
  const intro = await medir(".h1-intro");
  const cred = await medir(".h1-cred");
  const nav = await medir("[data-nav]");
  const fixo = await medir(".cta-fixo");
  ok(titulo.right <= w, `${rot}: título do hero sai pela direita (${Math.round(titulo.right)})`);
  ok(!sobrepoe(titulo, intro, 1), `${rot}: título do hero colide com o bloco informativo`);
  ok(intro.top >= nav.bottom - 1, `${rot}: bloco informativo sob o cabeçalho`);
  ok(!fixo || !sobrepoe(cred, fixo), `${rot}: registros sob o CTA fixo`);

  // Cabeçalho sem quebra
  const quebra = await page.evaluate(() => {
    const n = document.querySelector("[data-nav]");
    return [...n.querySelectorAll("a, button")].some(e => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.top < 0 || r.bottom > n.getBoundingClientRect().bottom + 1);
    });
  });
  ok(!quebra, `${rot}: cabeçalho quebrou`);

  // Manifesto: fim do palco
  const y = await page.evaluate(() => { const e = document.querySelector("[data-palco]"); return e.offsetTop + e.offsetHeight - innerHeight; });
  await rolar(page, y);
  const frase = await medir(".m-frase");
  const apoio = await medir(".m-apoio");
  const rotulo = await medir(".m-rotulo");
  const larguraFrase = await page.evaluate(() => {
    const r = document.createRange(); r.selectNodeContents(document.querySelector(".m-frase"));
    const b = r.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom };
  });
  ok(larguraFrase.right <= w + 1, `${rot}: frase do manifesto sai pela direita (${Math.round(larguraFrase.right)})`);
  const linhasFrase = { ...larguraFrase, top: frase.top, bottom: frase.bottom };
  ok(!sobrepoe(linhasFrase, rotulo, 1), `${rot}: frase do manifesto colide com o rótulo`);
  ok(!apoio || !sobrepoe(linhasFrase, apoio, 1), `${rot}: frase do manifesto colide com o apoio`);
  ok(larguraFrase.top >= 0, `${rot}: frase do manifesto corta no topo`);
  if (fixo && apoio) ok(!sobrepoe(apoio, fixo), `${rot}: apoio sob o CTA fixo`);

  // Dois olhares, nos três estados da curva
  await page.evaluate(() => {
    const s = document.querySelector("[data-olhares]");
    scrollTo({ top: s.offsetTop + innerHeight * .56, behavior: "instant" });
  });
  await page.waitForTimeout(150);
  ok((await estouro()) <= 0, `${rot}: estouro horizontal em Dois olhares`);
  if (w >= 900) {
    const textos = async () => page.evaluate(() => {
      const r = s => { const b = document.querySelector(s).getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom }; };
      const sec = document.querySelector(".ol-fixo").getBoundingClientRect();
      return { n: r(".ol-base .ol-texto--n"), d: r(".ol-sobre .ol-texto--d"), t: r(".ol-base .ol-titulo"), sec };
    });
    const m = await textos();
    ok(m.n.top >= m.t.bottom - 1, `${rot}: Nutrologia colide com o título do capítulo`);
    ok(m.d.top >= m.t.bottom - 1, `${rot}: Dermatologia colide com o título do capítulo`);
    ok(m.n.bottom <= m.sec.bottom && m.d.bottom <= m.sec.bottom, `${rot}: texto cortado embaixo em Dois olhares`);
    // A curva não pode alcançar nenhum texto, em nenhum estado
    for (const [nome, x] of [["neutro", null], ["n", .1], ["d", .9]]) {
      if (x !== null) { await page.mouse.move(w * x, h * .7); await page.waitForTimeout(1200); }
      const curva = await page.evaluate(() => {
        const nums = [...document.querySelector(".ol-sobre").style.clipPath.matchAll(/([\d.]+)% ([\d.]+)%/g)].map(g => +g[1]);
        const metade = nums.slice(0, Math.floor(nums.length / 2));
        return { min: Math.min(...metade) * innerWidth / 100, max: Math.max(...metade) * innerWidth / 100 };
      });
      ok(curva.min > m.n.right, `${rot}: curva (${nome}) alcança Nutrologia`);
      ok(curva.max < m.d.left, `${rot}: curva (${nome}) alcança Dermatologia`);
      // Nem o título nem as palavras grandes: cada texto fica inteiro de um lado do vão
      const grandes = await page.evaluate(() => {
        const caixa = (s, primeiro) => {
          const el = document.querySelector(s), g = document.createRange();
          if (primeiro) g.selectNode(el.firstChild); else g.selectNodeContents(el);
          const b = g.getBoundingClientRect();
          return { left: b.left, right: b.right };
        };
        return { tEsq: caixa(".ol-base .ol-titulo", true), tDir: caixa(".ol-base .ol-titulo em"), pEsq: caixa(".ol-base .ol-pal--n"), pDir: caixa(".ol-base .ol-pal--d") };
      });
      ok(curva.min > Math.max(grandes.tEsq.right, grandes.pEsq.right), `${rot}: curva (${nome}) atravessa o texto da esquerda`);
      ok(curva.max < Math.min(grandes.tDir.left, grandes.pDir.left), `${rot}: curva (${nome}) atravessa o texto da direita`);
      ok(grandes.pEsq.left >= 0 && grandes.pDir.right <= w, `${rot}: palavra grande cortada na lateral`);
    }
    await page.mouse.move(0, 0);
  } else {
    const fora = await page.evaluate(() => [...document.querySelectorAll(".ol-pal, .ol-desc, .ol-link")]
      .filter(e => e.offsetParent && e.getBoundingClientRect().right > innerWidth + 1).length);
    ok(fora === 0, `${rot}: texto fora da tela em Dois olhares`);
  }

  // Alvos de toque no celular e tablet
  if (w < 900) {
    await rolar(page, 0);
    const pequenos = await page.evaluate(() => [...document.querySelectorAll("[data-nav] button, .cta-fixo, .ol-link")]
      .filter(e => e.offsetParent).map(e => e.getBoundingClientRect()).filter(r => r.height < 44).length);
    ok(pequenos === 0, `${rot}: ${pequenos} alvo(s) de toque abaixo de 44 px`);
  }
  await ctx.close();
  process.stdout.write(`${rot} `);
}
console.log();

/* ---------- 3. Teclado ---------- */
secao("Teclado");
for (const tam of [[1440, 900], [1024, 768]]) {
  const rot = `teclado ${tam[0]}`;
  const ctx = await browser.newContext({ viewport: { width: tam[0], height: tam[1] }, locale: "pt-BR" });
  const page = await ctx.newPage();
  vigiar(page, rot);
  await abrir(page);
  const ordem = [];
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press("Tab");
    /* A rolagem até o foco é suave: mede depois de assentar */
    await page.waitForFunction(() => new Promise(res => {
      let y = scrollY, parado = 0;
      const t = setInterval(() => { parado = scrollY === y ? parado + 1 : 0; y = scrollY; if (parado > 3) { clearInterval(t); res(true); } }, 50);
    }));
    const d = await page.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const r = e.getBoundingClientRect();
      const c = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const topo = document.elementFromPoint(c.x, c.y);
      return {
        nome: (e.getAttribute("aria-label") || e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34),
        tag: e.tagName, naTela: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
        coberto: !(topo && (e === topo || e.contains(topo) || topo.contains(e))),
        copia: !!e.closest("[aria-hidden='true']"),
        opacidade: +getComputedStyle(e.closest(".h1-intro") || e).opacity,
      };
    });
    if (!d) break;
    ordem.push(d.nome);
    ok(d.naTela, `${rot}: foco fora da tela em "${d.nome}"`);
    ok(!d.coberto, `${rot}: foco coberto em "${d.nome}"`);
    ok(!d.copia, `${rot}: cópia decorativa recebeu foco em "${d.nome}"`);
    ok(d.opacidade > .5, `${rot}: foco em texto apagado "${d.nome}"`);
  }
  console.log(`${rot}: ${ordem.join(" › ")}`);
  ok(ordem[0] === "Ir para o conteúdo", `${rot}: o primeiro Tab deveria ser "Ir para o conteúdo"`);
  for (const nome of ["Explorar Nutrologia", "Explorar Dermatologia"]) {
    ok(ordem.some(o => o.startsWith(nome)), `${rot}: "${nome}" não recebe foco`);
    ok(ordem.filter(o => o.startsWith(nome)).length === 1, `${rot}: "${nome}" recebe foco mais de uma vez`);
  }
  ok(!ordem.some(o => /Depoimentos/.test(o)), `${rot}: Depoimentos não deveria aparecer`);

  // Foco move a curva
  await rolar(page, 0);
  await page.focus(".ol-base .ol-texto--n a");
  await page.waitForTimeout(1200);
  const est = await page.evaluate(() => ({
    ativo: document.querySelector(".ol-base .ol-texto--n").classList.contains("ativo"),
    aberta: document.querySelector("[data-olhares]").classList.contains("ol-aberta"),
    naTela: (() => { const r = document.querySelector(".ol-base .ol-texto--n a").getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })(),
  }));
  ok(est.ativo, `${rot}: foco não aciona o lado Nutrologia`);
  ok(est.aberta, `${rot}: foco não abre a página de Dois olhares`);
  ok(est.naTela, `${rot}: link em foco fora da tela`);
  await ctx.close();
}

/* ---------- 4. Menu ---------- */
secao("Menu");
{
  const ctx = await browser.newContext(cfgDe([390, 844]));
  const page = await ctx.newPage();
  vigiar(page, "menu");
  await abrir(page);
  await page.focus("[data-nav] [data-menu-abrir]");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(700);
  ok(await page.evaluate(() => document.querySelector("#menu").open), "menu: não abriu");
  ok(await page.evaluate(() => document.activeElement.matches("[data-menu-fechar]")), "menu: foco não foi para Fechar");
  ok(await page.evaluate(() => document.querySelector("[data-nav] [data-menu-abrir]").getAttribute("aria-expanded") === "true"), "menu: aria-expanded");
  const dentro = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    dentro.push(await page.evaluate(() => !!document.activeElement.closest("#menu") || document.activeElement === document.body));
  }
  ok(dentro.every(Boolean), "menu: foco escapou do menu");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(700);
  ok(await page.evaluate(() => !document.querySelector("#menu").open), "menu: Esc não fechou");
  ok(await page.evaluate(() => document.activeElement.matches("[data-nav] [data-menu-abrir]")), "menu: foco não voltou ao botão");
  // Navegação real a partir do menu
  await page.click("[data-nav] [data-menu-abrir]");
  await page.waitForTimeout(700);
  await page.click(".menu-lista a[href='/sobre/']");
  await page.waitForURL("**/sobre/");
  ok(await page.evaluate(() => document.querySelector("h1").textContent.includes("Aline")), "menu: link não navegou");
  await ctx.close();
  console.log("abrir, foco preso, Esc, retorno do foco, navegação");
}

/* ---------- 5. Cabeçalho ---------- */
secao("Cabeçalho");
{
  const ctx = await browser.newContext(cfgDe([1440, 900]));
  const page = await ctx.newPage();
  vigiar(page, "cabeçalho");
  await abrir(page);
  const cls = () => page.evaluate(() => document.querySelector("[data-nav]").className);
  ok(/nav--quieta/.test(await cls()), "cabeçalho: CTA deveria começar em linha");
  const fim = await page.evaluate(() => { const e = document.querySelector("[data-palco]"); return e.offsetTop + e.offsetHeight - innerHeight; });
  await rolar(page, fim * .5);
  /* O menu fica na faixa marfim: a janela do filme começa abaixo dela */
  const faixa = await page.evaluate(() => { const n = document.querySelector("[data-nav]").getBoundingClientRect(); const t = document.elementFromPoint(n.left + 300, n.top + 4); return !t?.closest(".janela"); });
  ok(faixa, "cabeçalho: o filme não pode ocupar a faixa do menu");
  await rolar(page, fim + 200);
  await rolar(page, fim + 400);
  await page.waitForTimeout(500);
  ok(/nav--solida/.test(await cls()) && /nav--oculta/.test(await cls()), "cabeçalho: deveria sumir ao descer depois do hero");
  await rolar(page, fim + 300);
  ok(!/nav--oculta/.test(await cls()), "cabeçalho: deveria voltar ao subir");
  await ctx.close();
  console.log("estados: em linha › claro › sólido oculto › volta ao subir");
}

/* ---------- 6. Reduzir movimento ---------- */
secao("Reduzir movimento");
for (const tam of [[1440, 900], [390, 844], [844, 390]]) {
  const rot = `reduzido ${tam[0]}`;
  const ctx = await browser.newContext(cfgDe(tam, { reducedMotion: "reduce" }));
  const page = await ctx.newPage();
  vigiar(page, rot);
  await abrir(page);
  const e = await page.evaluate(() => ({
    anima: document.documentElement.classList.contains("anima"),
    alturaPalco: document.querySelector("[data-palco]").offsetHeight,
    posFixo: getComputedStyle(document.querySelector(".palco-fixo")).position,
    alturaOlhares: document.querySelector("[data-olhares]").offsetHeight,
    posOlhares: getComputedStyle(document.querySelector(".ol-fixo")).position,
    corte: getComputedStyle(document.querySelector(".camada-2")).clipPath,
    estouro: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    transicao: getComputedStyle(document.querySelector(".cta")).transitionDuration,
  }));
  ok(!e.anima, `${rot}: não deveria animar`);
  ok(e.posFixo === "relative" && e.posOlhares === "relative", `${rot}: não deveria haver trecho fixo`);
  ok(e.alturaPalco < tam[1] * 2.1, `${rot}: palco alto demais (${e.alturaPalco})`);
  ok(e.corte === "none", `${rot}: Cap. 01 não deveria estar recortado`);
  ok(e.estouro <= 0, `${rot}: estouro horizontal`);
  ok(/^(0\.00001s|1e-05s|0s)/.test(e.transicao), `${rot}: transição ativa (${e.transicao})`);
  // Todo o texto essencial visível
  const visivel = await page.evaluate(() => [".papel .h1-titulo", ".m-frase", ".ol-base .ol-texto--n a", ".ol-sobre .ol-texto--d a"]
    .every(s => { const el = document.querySelector(s); return el && el.getClientRects().length > 0 && +getComputedStyle(el).opacity > .9; }));
  ok(visivel, `${rot}: texto essencial escondido`);
  await ctx.close();
  console.log(`${rot}: sem palco, empilhado, palco ${e.alturaPalco}px`);
}

/* ---------- 7. Sem JavaScript ---------- */
secao("Sem JavaScript");
for (const tam of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext(cfgDe(tam, { javaScriptEnabled: false }));
  const page = await ctx.newPage();
  await page.goto(BASE + "/");
  const h = (await page.locator("[data-palco]").boundingBox()).height;
  ok(h < tam[1] * 2.1, `sem JS ${tam[0]}: palco alto demais (${h})`);
  for (const s of [".papel .h1-titulo", ".m-frase", ".ol-base .ol-texto--n a", ".ol-sobre .ol-texto--d a", ".rp-links a"]) {
    ok(await page.locator(s).first().isVisible(), `sem JS ${tam[0]}: ${s} invisível`);
  }
  await page.screenshot({ path: `testes/resultados/sem-js-${tam[0]}.png`, fullPage: true });
  await ctx.close();
}
console.log("conteúdo e links disponíveis");

/* ---------- 8. Interação em Dois olhares ---------- */
secao("Dois olhares");
{
  const ctx = await browser.newContext(cfgDe([1440, 900]));
  const page = await ctx.newPage();
  vigiar(page, "olhares");
  await abrir(page);
  await page.evaluate(() => { const s = document.querySelector("[data-olhares]"); scrollTo({ top: s.offsetTop + innerHeight * .56, behavior: "instant" }); });
  await page.waitForTimeout(200);
  const clip = () => page.evaluate(() => document.querySelector(".ol-sobre").style.clipPath);
  const neutro = await clip();
  await page.mouse.move(150, 500); await page.waitForTimeout(1200);
  const n = await clip();
  ok(n !== neutro, "olhares: mouse à esquerda não moveu a curva");
  await page.mouse.move(1300, 500); await page.waitForTimeout(1200);
  ok((await clip()) !== n, "olhares: mouse à direita não moveu a curva");
  // Link real clicável em todos os estados
  await page.click(".ol-sobre .ol-texto--d a");
  await page.waitForURL("**/tratamentos/#dermatologia");
  ok(await page.evaluate(() => !!document.getElementById("dermatologia")), "olhares: âncora de destino ausente");
  await ctx.close();

  // Link do hero chega com a página aberta
  const ctx2 = await browser.newContext(cfgDe([1440, 900]));
  const p2 = await ctx2.newPage();
  vigiar(p2, "âncora");
  await abrir(p2);
  await p2.click(".h1-acoes .link-seta");
  await p2.waitForFunction(() => document.querySelector("[data-olhares]").classList.contains("ol-aberta"), null, { timeout: 8000 }).catch(() => falhas.push("olhares: o link do hero não chega à página aberta"));
  await ctx2.close();

  // Tablet: toque troca o lado, link continua indo direto
  const ctx3 = await browser.newContext(cfgDe([1024, 768], { hasTouch: true }));
  const p3 = await ctx3.newPage();
  vigiar(p3, "tablet");
  await abrir(p3);
  await p3.evaluate(() => { const s = document.querySelector("[data-olhares]"); scrollTo({ top: s.offsetTop + innerHeight * .56, behavior: "instant" }); });
  await p3.waitForTimeout(200);
  await p3.touchscreen.tap(120, 200);
  await p3.waitForTimeout(1100);
  ok(await p3.evaluate(() => document.querySelector(".ol-base .ol-texto--n").classList.contains("ativo")), "olhares: toque não aciona o lado (simulado)");
  await ctx3.close();
  console.log("mouse, foco, toque simulado, links e âncora");
}

await browser.close();

/* ---------- 9. WebKit (motor do Safari) ---------- */
secao("WebKit (motor do Safari, no Windows)");
try {
  const wk = await webkit.launch();
  for (const tam of [[1440, 900], [390, 844]]) {
    const rot = `webkit ${tam[0]}`;
    const ctx = await wk.newContext({ viewport: { width: tam[0], height: tam[1] }, locale: "pt-BR" });
    const page = await ctx.newPage();
    page.on("pageerror", e => falhas.push(`[erro JS ${rot}] ${e.message}`));
    page.on("console", m => { if (m.type() === "error") falhas.push(`[console ${rot}] ${m.text()}`); });
    await abrir(page);
    const fim = await page.evaluate(() => { const e = document.querySelector("[data-palco]"); return e.offsetTop + e.offsetHeight - innerHeight; });
    ok(await page.evaluate(() => document.documentElement.classList.contains("anima")), `${rot}: não ativou o palco`);
    await page.screenshot({ path: `testes/resultados/webkit-${tam[0]}-hero.png` });
    await rolar(page, fim * .75); await page.waitForTimeout(200);
    await page.screenshot({ path: `testes/resultados/webkit-${tam[0]}-incisao.png` });
    await rolar(page, fim); await page.waitForTimeout(200);
    await page.screenshot({ path: `testes/resultados/webkit-${tam[0]}-manifesto.png` });
    await page.evaluate(() => { const s = document.querySelector("[data-olhares]"); scrollTo({ top: s.offsetTop + innerHeight * .56, behavior: "instant" }); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `testes/resultados/webkit-${tam[0]}-olhares.png` });
    await ctx.close();
    console.log(`${rot}: sem erro de JS`);
  }
  await wk.close();
} catch (e) {
  falhas.push(`WebKit não rodou: ${e.message.split("\n")[0]}`);
}

/* ---------- Resultado ---------- */
console.log(`\n${falhas.length ? "FALHAS: " + falhas.length : "Tudo passou."}`);
[...new Set(falhas)].forEach(f => console.log(" ✗ " + f));
process.exit(falhas.length ? 1 : 0);
