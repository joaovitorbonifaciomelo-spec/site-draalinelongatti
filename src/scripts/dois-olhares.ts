/* Cap. 02 — Dois olhares.
   Computador: a rolagem traz o fio e abre a página; depois, mouse, foco ou toque movem a curva, e as palavras mudam de cor nela.
   Celular: sem estado escondido; a rolagem normal ondula a borda sobre "Dermatologia". */
import { animando, aoRolar, faixa, irPara, lim, pedirQuadro, suave } from "./rolagem";

const sec = document.querySelector<HTMLElement>("[data-olhares]")!;
{
  const sobre = sec.querySelector<HTMLElement>(".ol-sobre")!;
  const textos = { n: sec.querySelector(".ol-base .ol-texto--n")!, d: sec.querySelector(".ol-sobre .ol-texto--d")! };
  const largo = matchMedia("(min-width: 900px)");
  const comPalco = matchMedia("(min-width: 900px) and (min-height: 720px)");

  const TAU = Math.PI * 2;
  const pc = (v: number) => (v * 100).toFixed(2) + "%";
  const N = 44;

  /* Forma da curva em cada estado */
  type Forma = { cx: number; A: number; f: number; ph: number };
  const ALVOS: Record<"neutro" | "n" | "d", Forma> = {
    neutro: { cx: .5, A: .024, f: 1.1, ph: 0 },
    n: { cx: .605, A: .036, f: .8, ph: .6 },
    d: { cx: .372, A: .012, f: 1.7, ph: -.4 },
  };
  let atual: Forma = { ...ALVOS.neutro };
  let alvo: Forma = { ...atual };
  let lado: "n" | "d" | null = null;
  let rodando = false, ultimo = 0;
  /* Quanto a página já se abriu: 0 = só o fio, 1 = pronta para explorar */
  let abertura = 1;

  const xCurva = (y: number) => atual.cx + atual.A * abertura * Math.sin(TAU * atual.f * y + atual.ph);

  function desenharLargo() {
    const curva: string[] = [], borda: string[] = [];
    for (let i = 0; i <= N; i++) {
      const y = i / N, x = xCurva(y);
      curva.push(`${pc(x)} ${pc(y)}`);
      borda.unshift(`${pc(x + (1 - x) * abertura)} ${pc(y)}`);
    }
    sobre.style.clipPath = `polygon(${[...curva, ...borda].join(",")})`;
  }

  /* A curva assenta em ~0,9 s, sem mola */
  function animar(t: number) {
    if (!largo.matches) { rodando = false; return; }
    const dt = Math.min(50, t - ultimo || 16); ultimo = t;
    const k = 1 - Math.pow(.0022, dt / 1000);
    let resta = false;
    for (const c of Object.keys(alvo) as (keyof Forma)[]) {
      atual[c] += (alvo[c] - atual[c]) * k;
      if (Math.abs(alvo[c] - atual[c]) > .0004) resta = true; else atual[c] = alvo[c];
    }
    desenharLargo();
    if (resta) requestAnimationFrame(animar); else rodando = false;
  }
  function escolher(l: "n" | "d" | null) {
    if (l === lado) return;
    lado = l;
    textos.n.classList.toggle("ativo", l === "n");
    textos.d.classList.toggle("ativo", l === "d");
    if (l) sec.dataset.lado = l; else delete sec.dataset.lado;
    alvo = { ...ALVOS[l ?? "neutro"] };
    if (!animando()) { atual = { ...alvo }; desenharLargo(); return; }
    if (!rodando) { rodando = true; ultimo = 0; requestAnimationFrame(animar); }
  }

  /* Palco: da entrada da seção até o fim do trecho fixo */
  const ENTRADA = .45;
  const FIM_LINHA = .26, ABRE_DE = .24, ABRE_ATE = .66;
  const progresso = () => {
    const vh = innerHeight, total = vh * ENTRADA + sec.offsetHeight - vh;
    return lim((vh * ENTRADA - sec.getBoundingClientRect().top) / total);
  };
  const noPalco = () => animando() && comPalco.matches;

  function desenharPalco() {
    if (noPalco()) {
      const p = progresso();
      sec.style.setProperty("--linha", faixa(p, 0, FIM_LINHA).toFixed(4));
      abertura = suave(faixa(p, ABRE_DE, ABRE_ATE));
      /* O fio vira a borda da superfície escura: some assim que ela tem corpo */
      sec.style.setProperty("--linha-op", abertura > .004 ? "0" : "1");
    } else {
      abertura = 1;
    }
    sec.classList.toggle("ol-aberta", abertura >= 1);
    desenharLargo();
  }

  /* Mouse: a metade onde o ponteiro está. Como a curva foge dele, trocar de lado exige atravessá-la de fato. */
  sec.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || !largo.matches) return;
    const r = sec.getBoundingClientRect();
    escolher((e.clientX - r.left) / r.width < atual.cx ? "n" : "d");
  }, { passive: true });
  sec.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") escolher(null); });
  /* Toque em tablet: tocar fora dos links troca o lado; os links continuam indo direto */
  sec.addEventListener("pointerup", e => {
    if (e.pointerType === "mouse" || !largo.matches || (e.target as Element).closest("a")) return;
    const r = sec.getBoundingClientRect();
    const l = (e.clientX - r.left) / r.width < atual.cx ? "n" : "d";
    escolher(lado === l ? null : l);
  });
  /* Teclado: o foco aciona o lado e garante que a página já esteja aberta */
  sec.addEventListener("focusin", e => {
    const t = e.target as Element;
    if (!largo.matches) return;
    if (t.closest(".ol-texto--n")) escolher("n");
    else if (t.closest(".ol-texto--d")) escolher("d");
    if (noPalco() && progresso() < ABRE_ATE) {
      const vh = innerHeight, total = vh * ENTRADA + sec.offsetHeight - vh;
      irPara(sec.getBoundingClientRect().top + scrollY - vh * ENTRADA + total * ABRE_ATE);
      pedirQuadro();
    }
  });
  sec.addEventListener("focusout", e => { if (!sec.contains(e.relatedTarget as Node)) escolher(null); });

  /* ---------- Celular ---------- */
  function desenharEstreito() {
    /* Borda de entrada da superfície escura: a mesma curva da incisão, deitada, correndo sobre "Dermatologia" */
    const h = sobre.offsetHeight, r = sobre.getBoundingClientRect();
    const fase = animando() ? lim((innerHeight - r.top) / innerHeight) * 3.2 : 0;
    const pts: string[] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, yp = 26 * (1 + Math.sin(TAU * .85 * u + fase));
      pts.push(`${pc(u)} ${(yp / h * 100).toFixed(3)}%`);
    }
    sobre.style.clipPath = `polygon(${pts.join(",")},100% 100%,0 100%)`;
  }

  /* ---------- Conjunto ---------- */
  aoRolar(() => {
    const r = sec.getBoundingClientRect();
    /* Fora da tela não há nada a desenhar */
    if (r.bottom < -innerHeight * .1 || r.top > innerHeight * 1.1) return;
    if (largo.matches) desenharPalco(); else desenharEstreito();
  });
  largo.addEventListener("change", () => {
    sobre.style.clipPath = "";
    atual = { ...ALVOS.neutro }; alvo = { ...atual }; lado = null;
    delete sec.dataset.lado;
    textos.n.classList.remove("ativo"); textos.d.classList.remove("ativo");
    pedirQuadro();
  });
}
