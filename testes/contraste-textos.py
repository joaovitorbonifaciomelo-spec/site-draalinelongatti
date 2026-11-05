# Faz a conta do contraste a partir das imagens de contraste-textos.mjs e apaga as imagens.
# Só contam as letras com a cor cheia: durante um fade de saída o texto está de propósito semitransparente.
# Uso: python testes/contraste-textos.py <pasta> [--apagar]
import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

PASTA = Path(sys.argv[1])
APAGAR = "--apagar" in sys.argv


def lin(c):
    return np.where(c <= .03928, c / 12.92, ((c + .055) / 1.055) ** 2.4)


def lum(rgb):
    return lin(rgb) @ np.array([.2126, .7152, .0722])


linhas = []
for j in sorted(PASTA.glob("*.json")):
    d = json.loads(j.read_text(encoding="utf8"))
    base = str(j)[:-5]
    com = np.asarray(Image.open(base + "_com.png").convert("RGB"), dtype=float) / 255
    sem = np.asarray(Image.open(base + "_sem.png").convert("RGB"), dtype=float) / 255
    dpr = d["dpr"]
    tela, p, t = re.match(r"(.+)_p(\d+)_t(.+)", j.stem).groups()
    H, W = com.shape[:2]
    for g, info in d["grupos"].items():
        areas = np.zeros((H, W), bool)
        cores = set()
        for it in info["itens"]:
            x0, y0 = max(0, int(it["x"] * dpr)), max(0, int(it["y"] * dpr))
            areas[y0:int((it["y"] + it["h"]) * dpr), x0:int((it["x"] + it["w"]) * dpr)] = True
            m = re.findall(r"[\d.]+", it["cor"])
            if len(m) == 3 or (len(m) == 4 and float(m[3]) > .99):
                cores.add(tuple(float(v) / 255 for v in m[:3]))
        if not cores or not areas.any():
            continue
        dif = np.abs(com - sem).sum(axis=2) > .12
        melhor = None
        for c in cores:
            cc = np.array(c)
            cheio = areas & dif & (np.abs(com - cc).sum(axis=2) < .05)
            if lum(cc) < .2:
                # Cor escura só existe sobre o marfim. Pixel escuro ou médio sobre fundo escuro é a borda
                # suavizada de uma letra clara, não uma letra escura: não entra na conta.
                cheio &= lum(sem) > .5
            elif g.startswith("indice"):
                # No Cap. 03 as superfícies são sólidas: cor clara só existe sobre o marrom.
                cheio &= lum(sem) < .3
            if cheio.sum() < 8:
                continue
            Lt, Lb = lum(cc), lum(sem[cheio])
            r = (np.maximum(Lt, Lb) + .05) / (np.minimum(Lt, Lb) + .05)
            melhor = r if melhor is None else np.concatenate([melhor, r])
        if melhor is None:
            continue
        linhas.append((g, info["meta"], tela, int(p), float(t), melhor.min(), np.percentile(melhor, 1), (melhor < info["meta"]).mean() * 100, melhor.size))
    if APAGAR:
        Path(base + "_com.png").unlink()
        Path(base + "_sem.png").unlink()

saida = PASTA / "resultado.json"
saida.write_text(json.dumps([[float(x) if isinstance(x, (np.floating, float)) else x for x in l] for l in linhas]), encoding="utf8")
for g in ("titulo", "menu", "texto", "pausa", "ctaFixo", "indiceTitulos", "indiceTexto"):
    ls = [l for l in linhas if l[0] == g]
    if not ls:
        continue
    pior = min(ls, key=lambda l: l[5])
    falhos = [l for l in ls if l[5] < l[1]]
    print(f"{g:8} meta {ls[0][1]}:1 | casos {len(ls):4} | abaixo da meta em algum pixel: {len(falhos):4} | pior {pior[5]:.2f}:1 ({pior[2]} p{pior[3]} t{pior[4]}) | maior % abaixo {max(l[7] for l in ls):.1f}%")
