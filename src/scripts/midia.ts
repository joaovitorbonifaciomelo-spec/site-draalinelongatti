/* Vídeos do site: só carregam quando vão tocar e nunca atrasam o conteúdo.
   Quem decide é a pessoa: "querTocar" só muda pelo controle de teclado e leitores de tela, ou pelas preferências do sistema.
   Sair da tela ou trocar de aba suspende o vídeo, sem alterar essa escolha. */
const TECLA = "aline-video-pausado";
const reduz = matchMedia("(prefers-reduced-motion: reduce)");
/* Mesmo critério do poster: tablet em pé também recebe o vídeo vertical */
const vertical = matchMedia("(max-width: 760px), (orientation: portrait)");
const conexao = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
/* Economia de dados, 2G e 3G: fica o poster. Só alguns navegadores informam isso (o Safari não) */
const economia = !!conexao?.saveData || /^(slow-2g|2g|3g)$/.test(conexao?.effectiveType ?? "");

let lembrado = false;
try { lembrado = sessionStorage.getItem(TECLA) === "1"; } catch { /* armazenamento bloqueado */ }
let querTocar = !reduz.matches && !economia && !lembrado;
let paginaPronta = document.readyState === "complete";

type Item = { raiz: HTMLElement; video: HTMLVideoElement; naTela: boolean; foraDeFase: boolean };
const itens: Item[] = [];
const botoes = [...document.querySelectorAll<HTMLButtonElement>("[data-pausa]")];

const fonte = (raiz: HTMLElement) => (vertical.matches ? raiz.dataset.videoMobile : raiz.dataset.video) ?? "";

function aplicar() {
  for (const i of itens) {
    const tocar = querTocar && paginaPronta && i.naTela && !i.foraDeFase && !document.hidden;
    if (tocar) {
      const src = fonte(i.raiz);
      if (i.video.getAttribute("src") !== src) i.video.src = src;
      i.video.play().catch(() => {
        /* Navegador bloqueou (ex.: modo de economia do iOS): fica o poster */
        querTocar = false;
        rotular();
      });
    } else i.video.pause();
  }
  rotular();
}
function rotular() {
  for (const b of botoes) {
    b.dataset.estado = querTocar ? "tocando" : "pausado";
    const t = b.querySelector(".pausa-txt");
    if (t) t.textContent = querTocar ? "Pausar vídeo" : "Reproduzir vídeo";
  }
}

const io = "IntersectionObserver" in window
  ? new IntersectionObserver(es => {
      for (const e of es) {
        const i = itens.find(x => x.raiz === e.target);
        if (i) i.naTela = e.isIntersecting;
      }
      aplicar();
    })
  : null;

document.querySelectorAll<HTMLElement>(".midia[data-video]").forEach(raiz => {
  const video = document.createElement("video");
  video.muted = true; video.defaultMuted = true; video.loop = true; video.playsInline = true;
  video.preload = "none"; video.disablePictureInPicture = true; video.tabIndex = -1;
  video.setAttribute("muted", ""); video.setAttribute("playsinline", ""); video.setAttribute("aria-hidden", "true");
  video.addEventListener("playing", () => raiz.classList.add("tem-video"));
  video.addEventListener("error", () => {
    /* Arquivo com problema: fica o poster, e um botão sem função sai de cena */
    video.remove();
    const pos = itens.findIndex(i => i.video === video);
    if (pos >= 0) itens.splice(pos, 1);
    if (!itens.length) botoes.forEach(b => (b.hidden = true));
  });
  raiz.append(video);
  const item: Item = { raiz, video, naTela: true, foraDeFase: false };
  itens.push(item);
  io?.observe(raiz);
});

/* O botão nasce oculto: sem JavaScript, ou sem vídeo, ele não teria função */
if (itens.length) botoes.forEach(b => (b.hidden = false));

/* O hero usa isto: depois da nova incisão o filme fica coberto, mas o observador não sabe disso */
export function marcarForaDeFase(raiz: Element | null, fora: boolean) {
  const i = itens.find(x => x.raiz === raiz);
  if (i && i.foraDeFase !== fora) { i.foraDeFase = fora; aplicar(); }
}

botoes.forEach(b => b.addEventListener("click", () => {
  querTocar = !querTocar;
  try { sessionStorage.setItem(TECLA, querTocar ? "0" : "1"); } catch { /* idem */ }
  aplicar();
}));
document.addEventListener("visibilitychange", aplicar);
vertical.addEventListener("change", aplicar);
reduz.addEventListener("change", () => { if (reduz.matches) { querTocar = false; aplicar(); } });

/* O vídeo só começa depois do carregamento: o que é medido como LCP é o título e o poster */
if (!paginaPronta) addEventListener("load", () => { paginaPronta = true; aplicar(); }, { once: true });
aplicar();
