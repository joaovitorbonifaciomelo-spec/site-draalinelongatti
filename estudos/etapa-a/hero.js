/* Etapa A — motor de estudo dos heros.
   Converte a rolagem do palco em progresso (0–1) e publica variáveis CSS.
   Parâmetros de URL: ?tipo=a|b  ?grade=1  ?p=0..1 (congela o progresso)  ?embed=1  ?menu=1  ?pausa=1 */
(() => {
  const raiz = document.documentElement;
  const q = new URLSearchParams(location.search);
  if (q.get("tipo")) raiz.dataset.tipo = q.get("tipo");
  if (q.get("grade") === "1") raiz.dataset.grade = "1";
  if (q.get("embed") === "1") raiz.dataset.embed = "1";

  const reduz = matchMedia("(prefers-reduced-motion: reduce)");
  const economia = !!(navigator.connection && navigator.connection.saveData);
  const palco = document.querySelector("[data-palco]");
  const nav = document.querySelector(".nav");
  let fixo = q.has("p") ? parseFloat(q.get("p")) : null;

  const lim = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const faixa = (p, a, b) => lim((p - a) / (b - a));
  const suave = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const fases = window.FASES || (() => ({}));

  function progresso() {
    const r = palco.getBoundingClientRect();
    const total = palco.offsetHeight - innerHeight;
    return total > 0 ? lim(-r.top / total) : 0;
  }

  let pendente = false;
  let visivelPorFase = true;
  function desenhar() {
    pendente = false;
    const p = fixo != null ? fixo : reduz.matches ? 0 : progresso();
    const v = fases(p, { faixa, suave });
    for (const k in v.css || {}) palco.style.setProperty("--" + k, v.css[k].toFixed(4));
    if (nav) {
      nav.classList.toggle("nav--clara", !!v.navClara);
      nav.classList.toggle("nav--quieta", !!v.navQuieta);
    }
    document.body.classList.toggle("hero-passou", !!v.passou);
    if (v.extra) v.extra(palco);
    const vis = !v.passou;
    if (vis !== visivelPorFase) { visivelPorFase = vis; aplicarMidia(); }
  }
  const pedir = () => { if (!pendente) { pendente = true; requestAnimationFrame(desenhar); } };

  function medir() {
    raiz.style.setProperty("--vw", raiz.clientWidth + "px");
    pedir();
  }

  /* ---------- Vídeo, poster e pausa ----------
     Quem decide é a pessoa: "querTocar" só muda pelo botão (ou preferências do sistema).
     Sair da tela ou trocar de aba suspende o vídeo, sem alterar a escolha. */
  const TECLA = "aline-hero-pausado";
  let lembrado = false;
  try { lembrado = sessionStorage.getItem(TECLA) === "1"; } catch (e) { /* armazenamento bloqueado */ }
  let querTocar = !reduz.matches && !economia && !lembrado && q.get("pausa") !== "1";
  let naTela = true;
  const videos = [];

  document.querySelectorAll(".midia[data-video]").forEach(m => {
    const mobile = matchMedia("(max-width: 760px)").matches;
    const src = mobile ? m.dataset.videoMobile : m.dataset.video;
    if (!src) return;
    const v = document.createElement("video");
    v.muted = true; v.setAttribute("muted", ""); v.loop = true;
    v.playsInline = true; v.setAttribute("playsinline", ""); v.preload = "none";
    v.setAttribute("aria-hidden", "true"); v.tabIndex = -1;
    const poster = mobile ? m.dataset.posterMobile : m.dataset.poster;
    if (poster) v.poster = poster;
    v.addEventListener("loadeddata", () => m.classList.add("tem-video"));
    v.addEventListener("error", () => { const i = videos.indexOf(v); if (i >= 0) videos.splice(i, 1); v.remove(); }, true);
    m.prepend(v);
    v.dataset.src = src;
    videos.push(v);
  });

  function aplicarMidia() {
    const tocar = querTocar && naTela && visivelPorFase && !document.hidden;
    videos.forEach(v => {
      if (tocar) {
        if (!v.getAttribute("src")) v.src = v.dataset.src; // carrega só quando vai tocar
        const r = v.play();
        if (r && r.catch) r.catch(() => { /* autoplay bloqueado: fica o poster e o botão */ });
      } else v.pause();
    });
    rodando = tocar;
    document.querySelectorAll(".pausa").forEach(b => {
      b.dataset.estado = querTocar ? "tocando" : "pausado";
      const t = b.querySelector(".pausa-txt");
      if (t) t.textContent = querTocar ? "Pausar vídeo" : "Reproduzir vídeo";
    });
  }
  document.querySelectorAll(".pausa").forEach(b => b.addEventListener("click", () => {
    querTocar = !querTocar;
    try { sessionStorage.setItem(TECLA, querTocar ? "0" : "1"); } catch (e) { /* idem */ }
    aplicarMidia();
  }));
  document.addEventListener("visibilitychange", aplicarMidia);
  if ("IntersectionObserver" in window && palco) {
    new IntersectionObserver(([e]) => { naTela = e.isIntersecting; aplicarMidia(); }).observe(palco);
  }

  /* Timecode do quadro reservado (só existe enquanto não há vídeo) */
  const tcs = [...document.querySelectorAll(".tc")];
  let rodando = false, quadros = 7 * 24 + 12, ultimo = 0;
  function tick(t) {
    if (rodando && t - ultimo > 1000 / 24) {
      ultimo = t; quadros = (quadros + 1) % (15 * 24);
      const s = Math.floor(quadros / 24), f = quadros % 24;
      const txt = `TC 00:00:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
      tcs.forEach(el => (el.textContent = txt));
    }
    requestAnimationFrame(tick);
  }
  if (tcs.length) requestAnimationFrame(tick);

  /* ---------- Teclado: o foco nunca fica em algo invisível ----------
     A camada seguinte continua no tab normal; ao receber foco, a rolagem leva até ela. */
  document.addEventListener("focusin", e => {
    if (fixo != null || reduz.matches || !palco) return;
    const inicio = palco.getBoundingClientRect().top + scrollY;
    const fim = inicio + palco.offsetHeight - innerHeight;
    if (e.target.closest(".camada-2") && progresso() < .96) scrollTo(0, fim);
    else if (e.target.closest(".papel, .papel-escuro, .janela") && progresso() > .1) scrollTo(0, inicio);
  });

  /* ---------- Menu ---------- */
  const menu = document.getElementById("menu");
  const abreMenu = document.querySelector(".menu-btn");
  if (menu && abreMenu) {
    const fora = [...document.querySelectorAll("main, .cta-fixo")];
    const fechaMenu = menu.querySelector(".menu-fechar");
    const abrir = () => {
      menu.hidden = false;
      void menu.offsetWidth;
      menu.classList.add("aberto");
      abreMenu.setAttribute("aria-expanded", "true");
      fora.forEach(el => (el.inert = true));
      document.body.style.overflow = "hidden";
      fechaMenu.focus();
    };
    const fechar = () => {
      menu.classList.remove("aberto");
      abreMenu.setAttribute("aria-expanded", "false");
      fora.forEach(el => (el.inert = false));
      document.body.style.overflow = "";
      abreMenu.focus();
      const fim = () => { if (!menu.classList.contains("aberto")) menu.hidden = true; };
      if (reduz.matches) fim(); else setTimeout(fim, 600);
    };
    abreMenu.addEventListener("click", abrir);
    fechaMenu.addEventListener("click", fechar);
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", fechar));
    addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) fechar(); });
    if (q.get("menu") === "1") abrir();
  }

  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", medir);
  reduz.addEventListener("change", pedir);

  /* Mensagens da prancha (iframes) */
  addEventListener("message", e => {
    const d = e.data || {};
    if (d.tipo) raiz.dataset.tipo = d.tipo;
    if ("grade" in d) raiz.dataset.grade = d.grade ? "1" : "0";
    if ("p" in d) { fixo = d.p == null ? null : +d.p; pedir(); }
    if (d.tipo || "grade" in d) setTimeout(medir, 60);
  });

  medir();
  aplicarMidia();
})();
