# Etapa A — Prancha de direção visual (estudo)

Área isolada. Não é o código do site e não deve ser publicada.

## Abrir
- **Computador:** dois cliques em `index.html` (precisa de internet para as fontes do Google Fonts).
- **Celular (mesma rede Wi-Fi):** nesta pasta, rodar `python -m http.server 8080 --bind 0.0.0.0`
  e abrir `http://IP-DO-COMPUTADOR:8080` no celular. Para os heros em tela cheia, abrir
  `hero-01.html` e `hero-02.html` e rolar a página.

## Arquivos
| Arquivo | O quê |
|---|---|
| `index.html` · `prancha.css` · `prancha.js` | A prancha (tipografia, heros, revelação, sistema, Cap. 01, decisões) |
| `hero-01.html` | Hero I — Incisão (computador + celular + revelação na rolagem) |
| `hero-02.html` | Hero II — Plano (computador + celular + revelação na rolagem) |
| `base.css` · `hero.js` | Tokens, componentes e motor da revelação |
| `capturar.mjs` | Gera as capturas em `capturas/` (`node estudos/etapa-a/capturar.mjs`) |

## Parâmetros dos heros
`?tipo=b` (par tipográfico B) · `?grade=1` (grade) · `?p=0.5` (congela a revelação em 50%) · `?menu=1` (menu aberto) · `?pausa=1` (vídeo pausado).

## Vídeo
Colocar `media/hero-desktop.mp4` (16:9) e `media/hero-mobile.mp4` (9:16) nesta pasta: os
heros passam a mostrar o vídeo no lugar da área reservada. `*.mp4` está no `.gitignore`.
