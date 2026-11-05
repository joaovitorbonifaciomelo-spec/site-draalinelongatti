/* Prancha da Etapa A — controles e cálculos */
(() => {
  const raiz = document.documentElement;
  const frames = () => [...document.querySelectorAll(".tela iframe")];
  const enviar = msg => frames().forEach(f => f.contentWindow && f.contentWindow.postMessage(msg, "*"));
  let estado = { tipo: "a", grade: false };

  /* Telas escaladas */
  const ro = new ResizeObserver(itens => itens.forEach(({ target: t }) => {
    const w = +t.dataset.w, h = +t.dataset.h, s = t.clientWidth / w;
    const f = t.querySelector("iframe");
    f.style.width = w + "px"; f.style.height = h + "px"; f.style.transform = `scale(${s})`;
    t.style.height = h * s + "px";
  }));
  document.querySelectorAll(".tela").forEach(t => ro.observe(t));
  frames().forEach(f => f.addEventListener("load", () => {
    f.contentWindow.postMessage({ tipo: estado.tipo, grade: estado.grade }, "*");
  }));

  /* Par tipográfico */
  document.querySelectorAll("[data-tipo-btn]").forEach(b => b.addEventListener("click", () => {
    estado.tipo = b.dataset.tipoBtn;
    raiz.dataset.tipo = estado.tipo;
    document.querySelectorAll("[data-tipo-btn]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    enviar({ tipo: estado.tipo });
  }));

  /* Grade */
  const bg = document.getElementById("btn-grade");
  bg.addEventListener("click", () => {
    estado.grade = !estado.grade;
    bg.setAttribute("aria-pressed", String(estado.grade));
    enviar({ grade: estado.grade });
  });

  /* Contraste (WCAG 2.x), calculado de verdade */
  const lum = hex => {
    const c = hex.match(/\w\w/g).map(x => parseInt(x, 16) / 255)
      .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const pares = [
    ["#241D1A", "#F4EEE7", "Marrom sobre marfim", "Todo texto"],
    ["#F4EEE7", "#241D1A", "Marfim sobre marrom", "Todo texto"],
    ["#F4EEE7", "#8B5147", "Marfim sobre terracota", "Botão de agendamento, texto ≥ 15px"],
    ["#8B5147", "#F4EEE7", "Terracota sobre marfim", "Links, rótulos, texto"],
    ["#6D615B", "#F4EEE7", "Cinza quente sobre marfim", "Texto secundário"],
    ["#CBB6A8", "#241D1A", "Areia sobre marrom", "Texto sobre fundo escuro"],
    ["#241D1A", "#CBB6A8", "Marrom sobre areia", "Todo texto"],
    ["#CBB6A8", "#F4EEE7", "Areia sobre marfim", "Só linhas e divisões; nunca texto"],
  ];
  const tb = document.querySelector("#tabela-contraste tbody");
  pares.forEach(([fg, bgc, nome, uso]) => {
    const r = razao(fg, bgc);
    const nivel = r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA grande" : "Não passa";
    const tr = document.createElement("tr");
    tr.innerHTML = `<td><span class="amostra" style="color:${fg};background:${bgc};box-shadow:0 0 0 1px rgba(109,97,91,.3)">${nome}</span></td>
      <td class="num">${r.toFixed(2)}:1</td><td class="${r >= 4.5 ? "ok" : "no"}">${nivel}</td><td class="uso">${uso}</td>`;
    tb.appendChild(tr);
  });

  /* Escala de espaçamento */
  const esp = document.getElementById("escala-esp");
  [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192].forEach((v, i) => {
    const d = document.createElement("div");
    d.innerHTML = `<span>e${i + 1}</span><span>${v}px</span><i style="width:${v}px;max-width:100%"></i>`;
    esp.appendChild(d);
  });

  /* Estudo de revelação */
  const rng = document.getElementById("rev-p"), out = document.getElementById("rev-out");
  const revFrames = [...document.querySelectorAll("[data-rev-frame]")];
  let hero = "01";
  const aplicar = () => {
    out.value = rng.value + "%";
    revFrames.forEach(f => f.contentWindow && f.contentWindow.postMessage({ p: rng.value / 100 }, "*"));
  };
  rng.addEventListener("input", aplicar);
  revFrames.forEach(f => f.addEventListener("load", aplicar));
  document.querySelectorAll("[data-rev]").forEach(b => b.addEventListener("click", () => {
    hero = b.dataset.rev;
    document.querySelectorAll("[data-rev]").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    revFrames.forEach(f => (f.src = `hero-${hero}.html?embed=1&p=${rng.value / 100}`));
  }));
  const play = document.getElementById("rev-play");
  let anim = null;
  play.addEventListener("click", () => {
    if (anim) { cancelAnimationFrame(anim); anim = null; play.textContent = "Reproduzir"; return; }
    const ini = performance.now(), dur = 6000;
    play.textContent = "Parar";
    const passo = t => {
      const k = Math.min(1, (t - ini) / dur);
      rng.value = Math.round(k * 100); aplicar();
      if (k < 1) anim = requestAnimationFrame(passo); else { anim = null; play.textContent = "Reproduzir"; }
    };
    anim = requestAnimationFrame(passo);
  });
})();
