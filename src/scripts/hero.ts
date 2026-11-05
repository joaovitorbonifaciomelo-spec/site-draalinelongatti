/* Incisão: converte a rolagem do palco em progresso e publica as fases em variáveis CSS.
   a: o corte cresce até o quadro inteiro · l: a nova incisão aparece · c: ela abre e empurra o filme, revelando o Cap. 01.
   O filme é uma montagem própria (docs/MONTAGEM-HERO.md): nenhum código controla o tempo dele. */
import { animando, aoRolar, faixa, irPara, lim, pedirQuadro, suave } from "./rolagem";
import { definirQuieta } from "./cabecalho";
import { marcarForaDeFase } from "./midia";

const palco = document.querySelector<HTMLElement>("[data-palco]")!;
{
  const midia = palco.querySelector(".hero1 .midia");
  const quadro = palco.querySelector<HTMLElement>(".hero1")!;
  const intro = palco.querySelector<HTMLElement>(".h1-intro")!;

  /* Ponto em que o corte cobre o bloco de texto, medido uma vez por tamanho de tela */
  const medida = document.createElement("div");
  medida.style.cssText = "position:absolute;visibility:hidden;width:var(--l0);height:var(--b0)";
  palco.append(medida);
  let l0 = 0, b0 = 0, introEsq = 0, introPe = 0, medidaDe = "";
  const medir = () => {
    const chave = `${innerWidth}x${innerHeight}`;
    if (chave === medidaDe) return;
    medidaDe = chave;
    const r = intro.getBoundingClientRect(), q = quadro.getBoundingClientRect();
    l0 = medida.offsetWidth; b0 = medida.offsetHeight;
    introEsq = r.left - q.left; introPe = q.bottom - r.bottom;
  };
  /* O texto pode ter sido medido antes das fontes */
  document.fonts?.ready.then(() => { medidaDe = ""; pedirQuadro(); });

  const progresso = () => {
    const total = palco.offsetHeight - innerHeight;
    return total > 0 ? lim(-palco.getBoundingClientRect().top / total) : 0;
  };

  aoRolar(() => {
    medir();
    const p = animando() ? progresso() : 0;
    const a = suave(faixa(p, .04, .42)), l = suave(faixa(p, .44, .54)), c = suave(faixa(p, .54, .95));
    const s = palco.style;
    s.setProperty("--a", a.toFixed(4)); s.setProperty("--l", l.toFixed(4)); s.setProperty("--c", c.toFixed(4));
    const coberto = l0 * (1 - a) <= introEsq && b0 * (1 - a) <= introPe;
    palco.classList.toggle("textos-fora", coberto);
    palco.classList.toggle("hero-passou", c > .9);
    marcarForaDeFase(midia, c > .9);
    definirQuieta(!coberto);
  });

  /* Teclado: o foco em um texto parcialmente coberto traz a rolagem de volta. Coberto, ele já saiu do Tab */
  palco.addEventListener("focusin", e => {
    if (!animando() || !(e.target as Element).closest(".papel") || progresso() < .04) return;
    irPara(palco.getBoundingClientRect().top + scrollY);
    pedirQuadro();
  });
}
