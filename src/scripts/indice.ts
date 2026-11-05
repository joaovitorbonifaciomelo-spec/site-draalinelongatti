/* Cap. 03: a incisão fixa. Publica a posição da linha na seção e marca o nome que está sobre ela.
   A rolagem é a do navegador. Mouse e teclado também escolhem o nome lido, sem mover o conteúdo.
   No celular a borda do painel é a linha: o painel fica parado na tela e só é revelado pela rolagem. */
import { animando, aoRolar, irPara, lim, pedirQuadro } from "./rolagem";

const sec = document.querySelector<HTMLElement>("[data-indice]");
if (sec) {
  const base = [...sec.querySelectorAll<HTMLElement>(".idx-base [data-idx]")];
  const sobre = [...sec.querySelectorAll<HTMLElement>(".idx-sobre [data-idx]")];
  const corpo = sec.querySelector<HTMLElement>(".idx-base .idx-corpo")!;
  const painel = sec.querySelector<HTMLElement>("[data-idx-painel]")!;
  const txt = sec.querySelector<HTMLElement>("[data-idx-txt]")!;
  const esp = sec.querySelector<HTMLElement>("[data-idx-esp]")!;
  const nome = sec.querySelector<HTMLElement>("[data-idx-nome]")!;
  const desc = sec.querySelector<HTMLElement>("[data-idx-desc]")!;
  const conta = sec.querySelector<HTMLElement>("[data-idx-conta]")!;
  const grupo = (e: string) => base.filter(b => b.dataset.esp === e);

  const preencher = (b: HTMLElement) => {
    const e = b.dataset.esp ?? "";
    esp.textContent = e;
    nome.textContent = b.querySelector(".idx-nome")?.textContent ?? "";
    nome.style.fontStyle = e === "Dermatologia" ? "italic" : "";
    desc.textContent = b.querySelector(".idx-desc")?.textContent ?? "";
  };

  /* Mede a linha pelo próprio CSS, que define a posição por tipo de tela */
  const medida = document.createElement("div");
  medida.style.cssText = "position:absolute;visibility:hidden;height:var(--idx-linha,0px);width:0";
  sec.append(medida);

  let ativo = -1, escolhido = -1, yEscolha = 0, ultimaTroca = 0;
  let linha = 0, marcos: number[] = [], medidaDe = "", larguraPainel = 0, fixo = false, alturaPainel = 0, peTexto = 0;

  /* A altura do painel é a da descrição mais longa nesta largura: nada sobra vazio e nada é cortado,
     mesmo com o texto ampliado. Sem passar de 60% da tela, para a lista continuar navegável. */
  const medirPainel = () => {
    painel.style.height = "auto";
    let maior = 0;
    for (const b of base) { preencher(b); maior = Math.max(maior, painel.offsetHeight); }
    painel.style.height = "";
    sec.style.setProperty("--idx-painel-h", `${Math.ceil(Math.min(maior, innerHeight * .6))}px`);
    if (ativo >= 0) preencher(base[ativo]);
  };

  const medir = () => {
    const c = `${innerWidth}x${innerHeight}`;
    if (c === medidaDe) return;
    medidaDe = c;
    fixo = getComputedStyle(painel).position === "fixed";
    if (!fixo) { sec.style.removeProperty("--idx-painel-h"); larguraPainel = 0; }
    else if (larguraPainel !== innerWidth) { larguraPainel = innerWidth; medirPainel(); }
    const t = sec.getBoundingClientRect().top;
    if (fixo) {
      alturaPainel = painel.offsetHeight;
      linha = innerHeight - alturaPainel;
      peTexto = parseFloat(getComputedStyle(painel).paddingBottom) || 0;
    } else {
      linha = medida.offsetHeight;
    }
    /* Computador: o nome muda de cor ao cruzar a linha. Celular: o nome lido é o último inteiro acima do painel */
    marcos = base.map(b => { const r = b.getBoundingClientRect(); return (fixo ? r.bottom : r.top) - t; });
  };
  document.fonts?.ready.then(() => { medidaDe = ""; larguraPainel = 0; pedirQuadro(); });

  const ativar = (i: number) => {
    if (i === ativo) return;
    if (ativo >= 0) { base[ativo]?.classList.remove("ativa"); sobre[ativo]?.classList.remove("ativa"); }
    ativo = i;
    if (i < 0) return;
    const b = base[i];
    b.classList.add("ativa");
    sobre[i]?.classList.add("ativa");
    preencher(b);
    const e = b.dataset.esp ?? "", g = grupo(e);
    conta.textContent = `${e} · ${String(g.indexOf(b) + 1).padStart(2, "0")} de ${String(g.length).padStart(2, "0")}`;
    /* Sem fade. No computador, o texto entra por um corte, sempre com o contraste inteiro, e só quando dá tempo de lê-lo.
       No celular a troca é direta: nenhum estado intermediário com texto cortado. O fundo do painel nunca é recortado aqui. */
    const agora = performance.now();
    if (!fixo && agora - ultimaTroca > 300) txt.animate?.([{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 360, easing: "cubic-bezier(.2,.7,.1,1)" });
    ultimaTroca = agora;
  };

  /* Revela o painel entre o começo da lista e o fim da seção. O texto só aparece sem nenhum corte */
  const revelar = (r: DOMRect) => {
    const cima = lim(Math.round(corpo.getBoundingClientRect().top - linha), 0, alturaPainel);
    const baixo = lim(Math.round(innerHeight - r.bottom), 0, alturaPainel);
    painel.style.setProperty("--pt", `${cima}px`);
    painel.style.setProperty("--pb", `${baixo}px`);
    painel.classList.toggle("aberto", cima === 0 && baixo <= peTexto);
  };

  aoRolar(() => {
    if (!animando()) return;
    medir();
    if (!linha) return;
    const r = sec.getBoundingClientRect();
    if (fixo) revelar(r);
    if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
    const y = linha - r.top;
    /* Pixel inteiro: uma linha fracionada borraria uma fileira de letras */
    sec.style.setProperty("--y", `${Math.round(y)}px`);
    /* Foco de teclado: enquanto o item estiver na tela, é ele que se lê */
    const foco = document.activeElement?.closest<HTMLElement>(".idx-base [data-idx]");
    if (foco && document.activeElement!.matches(":focus-visible")) {
      const f = foco.getBoundingClientRect();
      if (f.bottom > 0 && f.top < innerHeight) return ativar(+foco.dataset.idx!);
    }
    /* O ponteiro escolhe o nome até a pessoa voltar a rolar */
    if (escolhido >= 0 && Math.abs(scrollY - yEscolha) < 6) return ativar(escolhido);
    escolhido = -1;
    let i = 0;
    for (let k = 0; k < marcos.length; k++) if (marcos[k] <= y) i = k;
    ativar(i);
  });

  const escolher = (i: number) => {
    escolhido = i; yEscolha = scrollY;
    ativar(i);
  };
  sec.addEventListener("pointerover", e => {
    if ((e as PointerEvent).pointerType !== "mouse") return;
    const li = (e.target as Element).closest<HTMLElement>("[data-idx]");
    if (li) escolher(+li.dataset.idx!);
  });
  /* Teclado: leva o nome focado até logo acima da linha. Assim ele fica na camada de cima, com o contorno à vista */
  sec.addEventListener("focusin", e => {
    if (!animando() || !linha) return;
    const alvo = e.target as HTMLElement;
    if (!alvo.matches(":focus-visible") || !alvo.closest(".idx-base")) return;
    const li = alvo.closest<HTMLElement>("[data-idx]");
    /* Depois da rolagem do próprio navegador até o foco */
    requestAnimationFrame(() => {
      const fundo = (li ?? alvo).getBoundingClientRect().bottom;
      if (li || fundo > linha) irPara(scrollY + fundo - linha + 4);
      pedirQuadro();
    });
    if (li) ativar(+li.dataset.idx!);
  });
}
