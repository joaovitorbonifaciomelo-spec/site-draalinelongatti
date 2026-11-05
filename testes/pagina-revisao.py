# Monta uma página local com o hero consolidado, o Cap. 03 e os testes. Não é publicada.
# Uso: python testes/pagina-revisao.py
from pathlib import Path

R = Path("testes/resultados")


def img(arq, leg):
    return f'<figure><a href="{arq}"><img src="{arq}" alt="{leg}" loading="lazy"></a><figcaption>{leg}</figcaption></figure>' if (R / arq).exists() else ""


def vid(arq, leg):
    return f'<figure class="v"><video src="{arq}" controls muted loop playsinline preload="metadata"></video><figcaption>{leg}</figcaption></figure>' if (R / arq).exists() else ""


SECOES = [
    ("Hero em movimento", vid, [("hero-c/gravacoes/hero-desktop.mp4", "Computador"), ("hero-c/gravacoes/hero-mobile.mp4", "Celular")]),
    ("Hero: estados da revelação", img, [("hero-c/_revelacao-desktop.png", "Computador"), ("hero-c/_revelacao-mobile.png", "Celular")]),
    ("Hero: planos da montagem, corte fechado", img, [("hero-c/_planos-corte-desktop.png", "Computador"), ("hero-c/_planos-corte-mobile.png", "Celular")]),
    ("Hero: planos da montagem, corte aberto", img, [("hero-c/_planos-aberto-desktop.png", "Computador"), ("hero-c/_planos-aberto-mobile.png", "Celular")]),
    ("Capítulo 03 em movimento", vid, [("cap03/cap03-desktop.mp4", "Computador"), ("cap03/cap03-mobile.mp4", "Celular")]),
    ("Capítulo 03: rolagem", img, [("cap03/_folha-desktop.png", "Computador"), ("cap03/_folha-mobile.png", "Celular")]),
    ("Capítulo 03: sem animação e sem JavaScript", img, [("cap03/reduzir-movimento.png", "Reduzir movimento, computador"), ("cap03/reduzir-movimento-celular.png", "Reduzir movimento, celular")]),
]
corpo = ""
for titulo, f, itens in SECOES:
    html = "".join(f(a, l) for a, l in itens)
    if html:
        corpo += f"<section><h2>{titulo}</h2><div class='g'>{html}</div></section>"
for nome in ("hero-c/contraste.txt", "hero-c/rede.txt"):
    p = R / nome
    if p.exists():
        corpo += f"<section><h2>{nome}</h2><pre>{p.read_text(encoding='utf8')}</pre></section>"
(R / "revisao.html").write_text(f"""<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Revisão</title>
<style>body{{font:16px system-ui;margin:32px;background:#F4EEE7;color:#241D1A}}h1,h2{{font-weight:500}}h2{{margin-top:48px}}
.g{{display:grid;gap:16px}}figure{{margin:0}}img,video{{max-width:100%;display:block}}.v video{{max-height:80vh}}
figcaption{{font-size:14px;margin-top:6px;color:#6D615B}}pre{{white-space:pre-wrap;font-size:13px}}</style></head>
<body><h1>Revisão: Hero C e Capítulo 03</h1><p>Material de trabalho local. Contém pessoas identificáveis: não publicar nem encaminhar sem a revisão ética e jurídica.</p>{corpo}</body></html>""", encoding="utf8")
print(R / "revisao.html")
