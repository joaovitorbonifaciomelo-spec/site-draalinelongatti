/* Uma só escuta de rolagem para o site inteiro, agrupada por quadro.
   A rolagem continua sendo a do navegador: nada aqui intercepta ou suaviza o gesto. */
type Tarefa = () => void;
const tarefas = new Set<Tarefa>();
let pendente = false;

function rodar() {
  pendente = false;
  tarefas.forEach(t => t());
}
export function pedirQuadro() {
  if (pendente) return;
  pendente = true;
  requestAnimationFrame(rodar);
}
export function aoRolar(t: Tarefa) {
  tarefas.add(t);
  t();
}

addEventListener("scroll", pedirQuadro, { passive: true });
addEventListener("resize", pedirQuadro);
/* As fontes podem alterar medidas ao chegar */
document.fonts?.ready.then(pedirQuadro);

/* "Reduzir movimento" também pode mudar com a página aberta */
const reduz = matchMedia("(prefers-reduced-motion: reduce)");
reduz.addEventListener("change", () => {
  document.documentElement.classList.toggle("anima", !reduz.matches);
  pedirQuadro();
});
export const animando = () => document.documentElement.classList.contains("anima");

export const lim = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const faixa = (p: number, a: number, b: number) => lim((p - a) / (b - a));
export const suave = (t: number) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const irPara = (top: number) => scrollTo({ top, behavior: "instant" as ScrollBehavior });
