/* Protótipo do Cap. 02 — Dois olhares.
   Computador: mouse, foco ou toque em um lado movem a curva. A informação nunca some.
   Celular: sem estado escondido; a rolagem normal abre as janelas e ondula a borda.
   Parâmetro de URL: ?estado=neutro|n|d|fechado (congela, para captura). */
(() => {
  const sec = document.getElementById("olhares");
  const sobre = sec.querySelector(".ol-sobre");
  const jn = sec.querySelector(".ol-janela--n");
  const jd = sec.querySelector(".ol-janela--d");
  const textos = { n: sec.querySelector(".ol-texto--n"), d: sec.querySelector(".ol-texto--d") };
  const reduz = matchMedia("(prefers-reduced-motion: reduce)");
  const largo = matchMedia("(min-width: 900px)");
  const q = new URLSearchParams(location.search);
  const congelado = q.get("estado");

  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const suave = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const TAU = Math.PI * 2;

  /* ---------- Computador ---------- */
  const ESQ = .345, DIR = .655, TOPO = .24, FOLGA = .006, N = 44;
  const ALVOS = {
    fechado: { cx: .5, A: 0, f: 1.1, ph: 0, ab: 0, zn: 1.1, zd: 1.2 },
    neutro: { cx: .5, A: .024, f: 1.1, ph: 0, ab: 1, zn: 1.06, zd: 1.12 },
    /* olhar aberto: curva ampla e lenta, plano sem aproximação */
    n: { cx: .605, A: .036, f: .8, ph: .6, ab: 1, zn: 1, zd: 1.12 },
    /* olhar próximo: corte quase reto e fino, a imagem se aproxima */
    d: { cx: .372, A: .012, f: 1.7, ph: -.4, ab: 1, zn: 1.06, zd: 1.26 },
  };
  let atual = { ...ALVOS[congelado && ALVOS[congelado] ? congelado : "fechado"] };
  let alvo = { ...atual };
  let lado = null, rodando = false, ultimo = 0;

  const xCurva = y => atual.cx + atual.A * Math.sin(TAU * atual.f * y + atual.ph);
  const pc = v => (v * 100).toFixed(2) + "%";

  function desenharLargo() {
    const c = [], n = [], d = [];
    for (let i = 0; i <= N; i++) {
      const y = i / N;
      c.push(`${pc(xCurva(y))} ${pc(y)}`);
      const ym = TOPO + (1 - TOPO) * y, x = xCurva(ym);
      n.push(`${pc(ESQ + (x - FOLGA - ESQ) * atual.ab)} ${pc(ym)}`);
      d.push(`${pc(DIR - (DIR - x - FOLGA) * atual.ab)} ${pc(ym)}`);
    }
    sobre.style.clipPath = `polygon(${c.join(",")},100% 100%,100% 0)`;
    jn.style.clipPath = `polygon(${pc(ESQ)} ${pc(TOPO)},${n.join(",")},${pc(ESQ)} 100%)`;
    jd.style.clipPath = `polygon(${pc(DIR)} ${pc(TOPO)},${d.join(",")},${pc(DIR)} 100%)`;
    jn.style.setProperty("--zoom", atual.zn.toFixed(4));
    jd.style.setProperty("--zoom", atual.zd.toFixed(4));
  }

  function animar(t) {
    if (!largo.matches) { rodando = false; return; }
    const dt = Math.min(50, t - ultimo || 16); ultimo = t;
    const k = 1 - Math.pow(.0022, dt / 1000); // ~0,9 s para assentar, sem mola
    let resta = false;
    for (const c in alvo) {
      atual[c] += (alvo[c] - atual[c]) * k;
      if (Math.abs(alvo[c] - atual[c]) > .0004) resta = true; else atual[c] = alvo[c];
    }
    desenharLargo();
    if (resta) requestAnimationFrame(animar); else rodando = false;
  }
  function irPara(nome) {
    alvo = { ...ALVOS[nome] };
    if (reduz.matches || congelado) { atual = { ...alvo }; desenharLargo(); return; }
    if (!rodando) { rodando = true; ultimo = 0; requestAnimationFrame(animar); }
  }
  function escolher(l) {
    if (l === lado) return;
    lado = l;
    textos.n.classList.toggle("ativo", l === "n");
    textos.d.classList.toggle("ativo", l === "d");
    irPara(l || "neutro");
  }

  if (!congelado) {
    sec.querySelectorAll("[data-lado]").forEach(el => {
      el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && largo.matches) escolher(el.dataset.lado); });
      /* toque em tablet: tocar fora dos links troca o lado; os links continuam indo direto */
      el.addEventListener("pointerup", e => { if (e.pointerType !== "mouse" && largo.matches && !e.target.closest("a")) escolher(lado === el.dataset.lado ? null : el.dataset.lado); });
    });
    sec.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") escolher(null); });
    sec.addEventListener("focusin", e => { const a = e.target.closest("[data-lado]"); if (a && largo.matches) escolher(a.dataset.lado); });
    sec.addEventListener("focusout", e => { if (!sec.contains(e.relatedTarget)) escolher(null); });
  } else if (congelado === "n" || congelado === "d") {
    textos[congelado].classList.add("ativo");
  }

  /* A curva nasce reta quando a seção entra na tela: é a incisão do hero voltando */
  if (!congelado && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (largo.matches && !lado) irPara("neutro");
    }, { threshold: .3 });
    io.observe(sec);
  } else if (!congelado) atual = { ...ALVOS.neutro };
  if (reduz.matches && !congelado) atual = { ...ALVOS.neutro };

  /* ---------- Celular ---------- */
  function abrirJanela(j, curvaEmbaixo) {
    const r = j.getBoundingClientRect(), vh = innerHeight;
    const k = reduz.matches ? 1 : suave(lim((vh - r.top - vh * .1) / (vh * .72)));
    const meia = .05 + .45 * k, pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, x = .5 - meia + 2 * meia * u;
      const onda = .018 * k * (1 + Math.sin(TAU * .9 * u + .8));
      pts.push(`${pc(x)} ${curvaEmbaixo ? pc(1 - onda) : pc(onda)}`);
    }
    const lateral = curvaEmbaixo ? [`${pc(.5 + meia)} 0`, `${pc(.5 - meia)} 0`] : [`${pc(.5 + meia)} 100%`, `${pc(.5 - meia)} 100%`];
    j.style.clipPath = `polygon(${pts.join(",")},${lateral.join(",")})`;
    return k;
  }
  function desenharEstreito() {
    const kn = abrirJanela(jn, true);
    const kd = abrirJanela(jd, false);
    jn.style.setProperty("--zoom", (1.1 - .1 * kn).toFixed(4));
    jd.style.setProperty("--zoom", (1.34 - .1 * kd).toFixed(4)); // o olhar próximo se mantém perto
    /* borda superior da Dermatologia: mesma curva da incisão, deitada */
    const h = sobre.offsetHeight, r = sobre.getBoundingClientRect();
    const fase = reduz.matches ? 0 : lim((innerHeight - r.top) / innerHeight) * 1.6;
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, yp = 22 * (1 + Math.sin(TAU * .85 * u + fase));
      pts.push(`${pc(u)} ${(yp / h * 100).toFixed(3)}%`);
    }
    sobre.style.clipPath = `polygon(${pts.join(",")},100% 100%,0 100%)`;
  }

  /* ---------- Conjunto ---------- */
  let pedido = false;
  function pintar() {
    pedido = false;
    if (largo.matches) desenharLargo(); else desenharEstreito();
  }
  const pedir = () => { if (!pedido) { pedido = true; requestAnimationFrame(pintar); } };
  addEventListener("scroll", () => { if (!largo.matches) pedir(); }, { passive: true });
  addEventListener("resize", pedir);
  largo.addEventListener("change", () => {
    [sobre, jn, jd].forEach(el => (el.style.clipPath = ""));
    pedir();
  });
  pintar();
})();
