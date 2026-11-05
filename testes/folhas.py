# Monta folhas de contato das capturas, para revisão rápida.
# Uso: python testes/folhas.py
from pathlib import Path
from PIL import Image

PASTA = Path("testes/resultados/capturas")


def folha(nomes, saida, largura, colunas):
    ims = [Image.open(PASTA / f"{n}.png").convert("RGB") for n in nomes]
    altura = int(ims[0].height * largura / ims[0].width)
    linhas = (len(ims) + colunas - 1) // colunas
    F = Image.new("RGB", (colunas * (largura + 8), linhas * (altura + 8)), "#888")
    for i, im in enumerate(ims):
        F.paste(im.resize((largura, altura)), ((i % colunas) * (largura + 8), (i // colunas) * (altura + 8)))
    F.save(PASTA / f"{saida}.png")


folha([f"hero-desktop-{p}" for p in ("000", "020", "042", "056", "075", "100")], "_folha-hero-desktop", 640, 3)
folha([f"hero-mobile-{p}" for p in ("000", "020", "042", "056", "075", "100")], "_folha-hero-mobile", 260, 6)
folha(
    [f"olhares-desktop-passagem-{p}" for p in ("012", "030", "048", "075")]
    + ["olhares-desktop-nutrologia", "olhares-desktop-dermatologia"],
    "_folha-olhares-desktop", 640, 3,
)
folha([f"olhares-mobile-{i}" for i in range(1, 6)] + ["rodape-mobile"], "_folha-olhares-mobile", 260, 6)
folha(["provisorio-hero-desktop", "provisorio-manifesto-desktop", "rodape-desktop"], "_folha-provisorio-desktop", 640, 3)
folha(["provisorio-hero-mobile", "provisorio-manifesto-mobile", "menu-mobile"], "_folha-provisorio-mobile", 260, 3)
