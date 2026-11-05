Vídeos e posters do site. Basta colocar os arquivos em public/media/ com estes nomes e gerar o site de novo:

  hero-desktop.mp4          vídeo horizontal do hero (16:9)
  hero-mobile.mp4           vídeo vertical do hero (9:16)
  hero-desktop-poster.jpg   primeiro quadro do horizontal (também aceita .avif e .webp)
  hero-mobile-poster.jpg    primeiro quadro do vertical (também aceita .avif e .webp)

Sem os arquivos, o site mostra a área reservada e não cria o controle de pausa.
Hoje public/media/ tem o filme completo do hero (docs/MONTAGEM-HERO.md). Os originais ficam na raiz do projeto, fora do Git.
Os dois .mp4 de public/media/ ficam no repositório privado, porque o build do GitHub precisa deles, e scripts/verificar-videos.mjs confere se são os aprovados. Os originais continuam fora do Git.
