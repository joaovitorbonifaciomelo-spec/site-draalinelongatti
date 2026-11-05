# Folhas de revisão do hero com vídeo real. Uso: python testes/folhas-video.py [pasta]
import sys
from pathlib import Path
from PIL import Image

PASTA = Path(sys.argv[1] if len(sys.argv) > 1 else "testes/resultados/hero-c")
PLANOS = ["medica", "quadros", "luz", "final"]
ESTADOS = ["000", "015", "030", "042", "050", "060", "075", "090"]


def folha(nomes, saida, largura, colunas):
    ims = [Image.open(PASTA / f"{n}.png").convert("RGB") for n in nomes]
    altura = int(ims[0].height * largura / ims[0].width)
    linhas = (len(ims) + colunas - 1) // colunas
    F = Image.new("RGB", (colunas * (largura + 6), linhas * (altura + 6)), "#888")
    for i, im in enumerate(ims):
        F.paste(im.resize((largura, altura), Image.LANCZOS), ((i % colunas) * (largura + 6), (i // colunas) * (altura + 6)))
    F.save(PASTA / f"{saida}.png")


for a, l1, l2 in (("desktop", 640, 480), ("mobile", 230, 230)):
    folha([f"{a}-medica-{e}" for e in ESTADOS], f"_revelacao-{a}", l1, 4 if a == "desktop" else 8)
    folha([f"{a}-{p}-000" for p in PLANOS], f"_planos-corte-{a}", l2, 4 if a == "desktop" else 7)
    folha([f"{a}-{p}-042" for p in PLANOS], f"_planos-aberto-{a}", l2, 4 if a == "desktop" else 7)
