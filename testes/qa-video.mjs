// Testa a integração do vídeo com os arquivos de public/media (hero-desktop.mp4, hero-mobile.mp4).
// Usa o Chrome instalado, porque o Chromium do Playwright não decodifica H.264.
// Com `npm run preview` no ar: node testes/qa-video.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://localhost:4321";
const falhas = [];
const ok = (c, m) => { if (!c) falhas.push(m); };
const browser = await chromium.launch({ channel: "chrome" });
const DESK = { viewport: { width: 1440, height: 900 }, locale: "pt-BR" };
const CEL = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "pt-BR" };

async function nova(cfg, init) {
  const ctx = await browser.newContext(cfg);
  const page = await ctx.newPage();
  const pedidos = [];
  page.on("request", r => { if (/\.mp4/.test(r.url())) pedidos.push(r.url()); });
  page.on("console", m => { if (m.type() === "error") falhas.push(`[console] ${m.text()}`); });
  page.on("pageerror", e => falhas.push(`[erro JS] ${e.message}`));
  if (init) await page.addInitScript(init);
  return { ctx, page, pedidos };
}
const estado = page => page.evaluate(() => {
  const v = document.querySelector(".hero1 video"), b = document.querySelector("[data-pausa]");
  return { src: v?.getAttribute("src"), pausado: v?.paused, tempo: v?.currentTime, temVideo: document.querySelector(".hero1 .midia").classList.contains("tem-video"),
    botao: b?.dataset.estado, texto: b?.querySelector(".pausa-txt").textContent, poster: !!document.querySelector(".hero1 picture img") };
});
/* O controle não tem presença visual: quem o aciona é o teclado ou o leitor de tela */
const acionar = async page => { await page.focus("[data-pausa]"); await page.keyboard.press("Enter"); };
const tocando = page => page.waitForFunction(() => { const v = document.querySelector(".hero1 video"); return v && !v.paused && v.currentTime > 0; }, null, { timeout: 30000 }).then(() => true).catch(() => false);

/* Computador */
{
  const { ctx, page, pedidos } = await nova(DESK);
  await page.goto(BASE + "/?limpo");
  ok(await tocando(page), "desktop: vídeo não tocou");
  let e = await estado(page);
  ok(e.src === "/media/hero-desktop.mp4", `desktop: arquivo errado (${e.src})`);
  ok(pedidos.every(u => !u.includes("hero-mobile")), "desktop: baixou o vídeo do celular");
  ok(e.poster, "desktop: poster ausente");
  ok(e.texto === "Pausar vídeo", "desktop: rótulo do botão");
  await page.waitForTimeout(700);
  await page.screenshot({ path: "testes/resultados/video-desktop.png" });

  // Sem presença visual: invisível e sem receber o ponteiro, até o foco do teclado
  const aparencia = () => page.evaluate(() => { const s = getComputedStyle(document.querySelector("[data-pausa]")); return { op: s.opacity, ponteiro: s.pointerEvents }; });
  let a = await aparencia();
  ok(a.op === "0" && a.ponteiro === "none", `desktop: controle de pausa aparece sem foco (${JSON.stringify(a)})`);
  ok(await page.evaluate(() => { const b = document.querySelector("[data-pausa]"), r = b.getBoundingClientRect(); return !b.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)); }), "desktop: controle de pausa recebe clique sem aparecer");

  // Pausa pelo teclado
  await page.focus("[data-pausa]");
  a = await aparencia();
  ok(a.op === "1", "desktop: controle de pausa não aparece no foco do teclado");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  e = await estado(page);
  ok(e.pausado && e.botao === "pausado" && e.texto === "Reproduzir vídeo", "desktop: pausa pelo teclado");
  await page.screenshot({ path: "testes/resultados/video-desktop-pausado.png" });

  // Lembra na sessão
  await page.reload();
  await page.waitForTimeout(800);
  e = await estado(page);
  ok(e.pausado && e.botao === "pausado", "desktop: não lembrou a pausa na sessão");
  await acionar(page);
  ok(await tocando(page), "desktop: não voltou a tocar");

  // Suspende quando coberto pelo Cap. 01, sem mudar a escolha
  await page.evaluate(() => { const e = document.querySelector("[data-palco]"); scrollTo({ top: e.offsetTop + e.offsetHeight - innerHeight, behavior: "instant" }); });
  await page.waitForTimeout(400);
  e = await estado(page);
  ok(e.pausado, "desktop: vídeo segue tocando coberto pelo Cap. 01");
  ok(e.botao === "tocando", "desktop: suspensão alterou a escolha da pessoa");
  ok(await page.evaluate(() => getComputedStyle(document.querySelector(".h1-controles")).visibility === "hidden"), "desktop: botão deveria sair quando não há vídeo visível");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  ok(await tocando(page), "desktop: não retomou ao voltar");
  await ctx.close();
  console.log("computador: arquivo certo, poster, pausa por teclado, sessão, suspensão e retomada");
}

/* Loop: ao chegar ao fim, o filme recomeça sem parar */
for (const [nome, cfg] of [["computador", DESK], ["celular", CEL]]) {
  const { ctx, page } = await nova(cfg);
  await page.goto(BASE + "/?limpo");
  await tocando(page);
  const r = await page.evaluate(() => new Promise(ok => {
    const v = document.querySelector(".hero1 video");
    let esperas = 0;
    v.addEventListener("waiting", () => esperas++);
    v.currentTime = v.duration - .6;
    const antes = performance.now();
    const t = setInterval(() => {
      if (v.currentTime < 1 && v.currentTime > 0 && !v.paused) { clearInterval(t); ok({ voltou: true, dur: v.duration, esperas }); }
      else if (performance.now() - antes > 8000) { clearInterval(t); ok({ voltou: false, dur: v.duration, esperas }); }
    }, 20);
  }));
  ok(r.voltou, `${nome}: loop não recomeçou`);
  console.log(`${nome}: loop recomeça (duração ${r.dur.toFixed(2)} s, esperas ${r.esperas})`);
  await ctx.close();
}

/* Poster: fica visível enquanto o vídeo não chega e continua se o arquivo falhar */
for (const [nome, cfg, arquivo] of [["computador", DESK, "hero-desktop-poster"], ["celular", CEL, "hero-mobile-poster"]]) {
  const { ctx, page } = await nova(cfg);
  await page.route("**/*.mp4", r => r.abort());
  await page.goto(BASE + "/?limpo");
  await page.waitForTimeout(1200);
  const r = await page.evaluate(() => {
    const i = document.querySelector(".hero1 picture img"), b = document.querySelector("[data-pausa]");
    return { atual: i?.currentSrc ?? "", largura: i?.naturalWidth ?? 0, video: !!document.querySelector(".hero1 video"), botaoFora: !!b?.hidden };
  });
  ok(r.atual.includes(arquivo) && r.largura > 0, `${nome}: poster errado (${r.atual})`);
  ok(!r.video && r.botaoFora, `${nome}: arquivo falhou e o vídeo ou o botão continuaram`);
  await page.screenshot({ path: `testes/resultados/video-real/poster-${nome}.png` });
  await ctx.close();
  console.log(`${nome}: poster certo; sem vídeo, o botão de pausa sai`);
}
/* A falha acima foi provocada: o erro de rede dela não conta */
falhas.splice(0, falhas.length, ...falhas.filter(f => !/ERR_FAILED|Failed to load resource/.test(f)));

/* Montagem: curta, com o arquivo certo. O filme toca sem controle de tempo por código */
{
  const { ctx, page } = await nova(DESK);
  await page.goto(BASE + "/?limpo");
  await tocando(page);
  const dur = await page.evaluate(() => document.querySelector(".hero1 video").duration);
  ok(dur > 13.5 && dur < 14.5, `filme: duração inesperada (${dur})`);
  await ctx.close();
  console.log(`filme completo: ${dur.toFixed(2)} s`);
}

/* Em movimento: rolagem real com o filme tocando. Nenhum texto do hero pode estar em fade ou em transição de cor */
for (const [nome, cfg] of [["computador", DESK], ["celular", CEL]]) {
  const { ctx, page } = await nova(cfg);
  await page.goto(BASE + "/?limpo");
  await tocando(page);
  const r = await page.evaluate(() => new Promise(ok => {
    const e = document.querySelector("[data-palco]"), total = e.offsetHeight - innerHeight, y0 = e.offsetTop, t0 = performance.now(), ms = 9000;
    const sel = ".h1-titulo, .h1-intro, .h1-intro *, .h1-vertical, [data-nav] .marca, [data-nav] .nav-links a, [data-nav] .cta";
    const v = document.querySelector(".hero1 video");
    const achados = new Set(); let quadros = 0;
    const passo = agora => {
      const k = Math.min(1, (agora - t0) / ms);
      scrollTo({ top: y0 + total * k, behavior: "instant" });
      quadros++;
      for (const el of document.querySelectorAll(sel)) {
        const s = getComputedStyle(el);
        let o = 1;
        for (let p = el; p && p !== document.body; p = p.parentElement) o *= +getComputedStyle(p).opacity;
        if (o < .999 && s.visibility !== "hidden") achados.add(`opacidade ${el.className || el.tagName}`);
      }
      for (const a of document.getAnimations()) {
        const p = a.transitionProperty, t = a.effect?.target;
        if (p && /color|opacity/.test(p) && t?.matches?.(sel)) achados.add(`transição ${p} em ${t.className || t.tagName}`);
      }
      k < 1 ? requestAnimationFrame(passo) : ok({ achados: [...achados], quadros, tocou: !v.paused || k >= 1 });
    };
    requestAnimationFrame(passo);
  }));
  ok(!r.achados.length, `${nome}: em movimento: ${r.achados.join("; ")}`);
  console.log(`${nome}: em movimento, ${r.quadros} quadros de rolagem sem fade nem transição de cor nos textos`);
  await ctx.close();
}

/* Botão de agendar do hero: legível até ser coberto; coberto, não recebe clique nem foco */
{
  const { ctx, page } = await nova(DESK);
  await page.goto(BASE + "/?limpo");
  const y = p => page.evaluate(p => { const e = document.querySelector("[data-palco]"); scrollTo({ top: e.offsetTop + (e.offsetHeight - innerHeight) * p, behavior: "instant" }); }, p);
  const estadoCta = () => page.evaluate(() => {
    const c = document.querySelector(".h1-intro .cta"), r = c.getBoundingClientRect(), s = getComputedStyle(c);
    const clip = document.querySelector(".janela").getBoundingClientRect();
    const pontos = [.1, .5, .9].map(k => { const t = document.elementFromPoint(r.left + r.width * k, r.top + r.height / 2); return !!t && (t === c || c.contains(t)); });
    return { visivel: s.visibility, fundo: s.backgroundColor, pontos };
  });
  await y(0); await page.waitForTimeout(150);
  let e = await estadoCta();
  ok(e.visivel === "visible" && e.pontos.every(Boolean), "botão do hero: em repouso deveria ser clicável por inteiro");
  /* Parcialmente coberto: o pedaço visível clica; o coberto, não */
  let parcial = false;
  for (let p = .05; p < .42; p += .01) {
    await y(p); await page.waitForTimeout(30);
    e = await estadoCta();
    if (e.visivel === "visible" && e.pontos[0] && !e.pontos[2]) { parcial = true; break; }
  }
  ok(parcial, "botão do hero: não houve estado com parte visível clicável e parte coberta bloqueada");
  await y(.42); await page.waitForTimeout(150);
  e = await estadoCta();
  ok(e.visivel === "hidden", "botão do hero: coberto, deveria sair do foco");
  await page.evaluate(() => document.querySelector(".h1-intro .cta").focus());
  ok(await page.evaluate(() => document.activeElement !== document.querySelector(".h1-intro .cta")), "botão do hero: coberto, ainda recebeu foco");
  await ctx.close();
  console.log("botão do hero: legível até ser coberto; a parte coberta não clica; coberto, sai do foco");
}

/* 3G (simulado): fica o poster, sem baixar o vídeo, e o botão toca se a pessoa pedir */
for (const [nome, cfg, esperado] of [["celular", CEL, "/media/hero-mobile.mp4"], ["computador", DESK, "/media/hero-desktop.mp4"]]) {
  const { ctx, page } = await nova(cfg, () => {
    Object.defineProperty(navigator, "connection", { value: { saveData: false, effectiveType: "3g" } });
  });
  const pedidos = [];
  page.on("request", r => { if (r.url().endsWith(".mp4")) pedidos.push(r.url()); });
  await page.goto(BASE + "/?limpo");
  await page.waitForTimeout(1200);
  ok(!pedidos.length, `3G, ${nome}: baixou o vídeo sem a pessoa pedir`);
  await acionar(page);
  ok(await tocando(page), `3G, ${nome}: o botão não fez o vídeo tocar`);
  const e = await estado(page);
  ok(e.src === esperado, `3G, ${nome}: arquivo errado (${e.src})`);
  await ctx.close();
}
console.log("3G: fica o poster; o controle de teclado toca o vídeo");

/* Celular: arquivo vertical */
{
  const { ctx, page, pedidos } = await nova(CEL);
  await page.goto(BASE + "/?limpo");
  ok(await tocando(page), "celular: vídeo não tocou");
  const e = await estado(page);
  ok(e.src === "/media/hero-mobile.mp4", `celular: arquivo errado (${e.src})`);
  ok(pedidos.every(u => !u.includes("hero-desktop")), "celular: baixou o vídeo do computador");
  const r = await page.evaluate(() => { const b = document.querySelector("[data-pausa]").getBoundingClientRect(); return { w: b.width, h: b.height }; });
  ok(r.w >= 44 && r.h >= 44, "celular: botão de pausa menor que 44 px");
  await page.waitForTimeout(700);
  await page.screenshot({ path: "testes/resultados/video-mobile.png" });
  await ctx.close();
  console.log("celular: arquivo vertical, sem baixar o horizontal, botão de 44 px");
}

/* Tablet em pé recebe o vertical */
{
  const { ctx, page } = await nova({ viewport: { width: 820, height: 1180 }, locale: "pt-BR" });
  await page.goto(BASE + "/?limpo");
  ok(await tocando(page), "tablet: vídeo não tocou");
  const e = await estado(page);
  ok(e.src === "/media/hero-mobile.mp4", `tablet em pé: arquivo errado (${e.src})`);
  await ctx.close();
}

/* Reduzir movimento: nada é baixado até a pessoa pedir */
{
  const { ctx, page, pedidos } = await nova({ ...DESK, reducedMotion: "reduce" });
  await page.goto(BASE + "/?limpo");
  await page.waitForTimeout(800);
  let e = await estado(page);
  ok(pedidos.length === 0, "reduzido: baixou vídeo sem pedir");
  ok(e.botao === "pausado", "reduzido: botão deveria oferecer reprodução");
  await page.screenshot({ path: "testes/resultados/video-real/reduzido-desktop.png" });
  await acionar(page);
  ok(await tocando(page), "reduzido: não toca quando a pessoa pede");
  await ctx.close();
  console.log("reduzir movimento: não baixa nem toca até a pessoa pedir");
}

/* Economia de dados (simulada) */
{
  const { ctx, page, pedidos } = await nova(DESK, () => {
    Object.defineProperty(navigator, "connection", { value: { saveData: true, effectiveType: "4g" } });
  });
  await page.goto(BASE + "/?limpo");
  await page.waitForTimeout(800);
  ok(pedidos.length === 0, "economia: baixou vídeo");
  ok((await estado(page)).botao === "pausado", "economia: botão deveria oferecer reprodução");
  await page.screenshot({ path: "testes/resultados/video-real/economia-desktop.png" });
  await ctx.close();
  console.log("economia de dados: não baixa até a pessoa pedir");
}

/* O vídeo não entra antes do carregamento da página */
{
  const { ctx, page } = await nova(DESK);
  const ordem = [];
  page.on("request", r => { if (/\.mp4/.test(r.url())) ordem.push("video"); });
  await page.exposeFunction("marcarLoad", () => ordem.push("load"));
  await page.addInitScript(() => addEventListener("load", () => window.marcarLoad()));
  await page.goto(BASE + "/?limpo");
  await tocando(page);
  ok(ordem[0] === "load", `carregamento: vídeo pedido antes do load (${ordem.join(",")})`);
  await ctx.close();
}

await browser.close();
console.log(`\n${falhas.length ? "FALHAS: " + falhas.length : "Tudo passou."}`);
[...new Set(falhas)].forEach(f => console.log(" ✗ " + f));
process.exit(falhas.length ? 1 : 0);
