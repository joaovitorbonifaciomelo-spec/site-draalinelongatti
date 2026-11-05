/* Estados do cabeçalho e abertura do menu. */
import { animando, aoRolar } from "./rolagem";

const nav = document.querySelector<HTMLElement>("[data-nav]")!;
const palco = document.querySelector<HTMLElement>("[data-palco]");

/* Só um CTA cheio por vez: o hero avisa enquanto o dele estiver disponível */
export function definirQuieta(quieta: boolean) {
  if (!nav.classList.contains("nav--solida")) nav.classList.toggle("nav--quieta", quieta);
}

let yAnterior = scrollY;
aoRolar(() => {
  const y = scrollY;
  /* Barra sólida assim que o Cap. 01 começa a subir: nada de texto correndo por baixo do cabeçalho */
  const solida = !palco ? y > 0 : animando() ? palco.getBoundingClientRect().bottom <= innerHeight + 1 : y > 10;
  nav.classList.toggle("nav--solida", solida);
  if (solida) nav.classList.remove("nav--quieta");
  const delta = y - yAnterior;
  if (!solida || y < 80) nav.classList.remove("nav--oculta");
  else if (delta > 4) nav.classList.add("nav--oculta");
  else if (delta < -4) nav.classList.remove("nav--oculta");
  yAnterior = y;
});

/* Celular: o botão fixo sai quando o botão principal do Cap. 06 aparece, e não volta sobre o rodapé */
const principal = document.querySelector("[data-cta-principal]");
const fixo = document.querySelector(".cta-fixo");
if (principal && fixo) {
  aoRolar(() => fixo.classList.toggle("cta-fixo--fora", principal.getBoundingClientRect().top < innerHeight));
}

/* ---------- Menu ---------- */
const menu = document.querySelector<HTMLDialogElement>("#menu")!;
const abrirBtn = document.querySelector<HTMLButtonElement>("[data-nav] [data-menu-abrir]")!;
const tempoFechar = () => (document.documentElement.classList.contains("anima") ? 560 : 0);

function abrir() {
  menu.showModal();
  void menu.offsetWidth;
  menu.classList.add("aberto");
  abrirBtn.setAttribute("aria-expanded", "true");
}
function fechar() {
  menu.classList.remove("aberto");
  abrirBtn.setAttribute("aria-expanded", "false");
  setTimeout(() => menu.close(), tempoFechar());
}
document.querySelectorAll("[data-menu-abrir]").forEach(b => b.addEventListener("click", abrir));
menu.querySelector("[data-menu-fechar]")!.addEventListener("click", fechar);
/* Esc: mantém a animação de saída em vez do fechamento seco do navegador */
menu.addEventListener("cancel", e => { e.preventDefault(); fechar(); });
/* Ao voltar pelo histórico, a página pode reaparecer com o menu aberto */
addEventListener("pageshow", () => { if (menu.open) { menu.classList.remove("aberto"); menu.close(); abrirBtn.setAttribute("aria-expanded", "false"); } });

/* ---------- Marcas de provisório (só em modo revisão) ---------- */
const marcas = document.querySelector<HTMLButtonElement>("[data-marcas]");
if (marcas) {
  const raiz = document.documentElement;
  const rotular = () => (marcas.textContent = raiz.classList.contains("limpo") ? "Mostrar marcas" : "Ocultar marcas");
  rotular();
  marcas.addEventListener("click", () => {
    const limpo = raiz.classList.toggle("limpo");
    try { sessionStorage.setItem("aline-limpo", limpo ? "1" : "0"); } catch { /* armazenamento bloqueado */ }
    rotular();
  });
}
