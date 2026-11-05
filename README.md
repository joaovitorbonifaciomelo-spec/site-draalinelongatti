# Site Dra. Aline Longatti — Redesign 2026

Cliente da Bonifácio (Drive: `1 · BONIFÁCIO\1 · Clientes\08 · Dra Aline Longatti`).
Conceito: **Além da Superfície**. Direção criativa completa em `referencias/DIRECAO-CRIATIVA.md`.

## Rodar o site

```
npm install
npm run dev       # desenvolvimento: http://localhost:4321
npm run build     # gera o site em dist/
npm run preview   # serve o build: http://localhost:4321
```

Política: na fase criativa, só o que a mudança afeta, em 1440 e 390 px; auditoria completa na estabilização e antes de publicar (`TODOS=1` nos testes do Cap. 03).

Testes, com o `preview` no ar: `npm run qa`, `node testes/qa-cap03.mjs`, `node testes/painel-cap03.mjs`, `node testes/qa-video.mjs`,
`node testes/rede-video.mjs`, `node testes/contraste-textos.mjs <pasta>` seguido de
`python testes/contraste-textos.py <pasta> --apagar` e `node testes/desempenho.mjs`. Resultados e capturas ficam em `testes/resultados/` (fora do Git).

## Etapas (definidas na direção criativa)

| Etapa | O quê | Status |
|---|---|---|
| A | Direção visual: conceito, hero, tipografia, cores, tratamento fotográfico | ✅ aprovada (`estudos/etapa-a/`) |
| B | Storyboard de interação (Revelação de profundidade · Dois olhares) | ✅ direção conceitual aprovada (`estudos/etapa-b/`) |
| C/D | Sistema, páginas e desenvolvimento | 👀 Hero C aprovado como base e estabilizado. Cap. 03: versão de 8 itens. Cap. 04: Direção 2 (Duas grafias) implementada, em avaliação visual. Cap. 05: "Onde ela atende" aprovado como base. Cap. 06: "O próximo encontro" implementado. Cap. 02 refeito só com tipografia e Cap. 04 sem a segunda foto. Home visualmente estabilizada (4/11/2026). Páginas `/sobre/`, `/tratamentos/` e `/contato/` estabilizadas. Complementares: 404, robots, sitemap, redirecionamentos e estrutura da privacidade preparados; artigos preservados sem publicar |
| E | Qualidade e publicação (performance, acessibilidade, SEO, CFM, mobile) | — |

## Decisões aprovadas

- Hero I — Incisão · Alex Brush, Bodoni Moda e Hanken Grotesk · Título: "A saúde tem muitas camadas."
- Dois olhares é conceito experimental. Plano aberto e próximo podem diferenciar as composições, mas
  não são regra por especialidade: ajustar às imagens reais (`composicao` em `src/data/site.ts`).
- Cap. 01: manifesto tipográfico curto, sem repetir o Cap. 02 e sem frase atribuída à médica.
- Depoimentos antigos não migram por enquanto. Plano da URL em `docs/PLANO-DE-URLS.md`.
- Hero: filme completo de 14 s, sem controle de tempo por JavaScript e sem troca dinâmica de qualidade: um arquivo por formato. Véu em 0,60.
- Cap. 03: aprovados a linguagem editorial, a tipografia, a divisão marfim e marrom, a linha e o painel. Home com 8 itens e 20 em `/tratamentos/`: `docs/ORGANIZACAO-CAP03.md`.
- Cap. 02 apresenta as especialidades, sem lista de tratamentos; os atendimentos ficam no Cap. 03.
- "Medicina Integrativa" fora do índice até validação.
- Tecnologia: Astro.
- Captação real: 8 takes horizontais e 8 verticais (atendimento, arquitetura, equipamentos, detalhes). Edição em andamento.
- Fluxo: ao concluir cada etapa, apresentar resultado e pendências antes de avançar. Commit, push e deploy só com autorização. Fluxo de publicação: `docs/PUBLICACAO.md`.

## Estrutura

| Onde | O quê |
|---|---|
| `src/data/site.ts` | Todos os textos e dados, com a origem do que é provisório |
| `src/components/` | Cabeçalho, menu, rodapé, mídia e capítulos da Home |
| `src/scripts/` | Rolagem, cabeçalho, hero, vídeo e Dois olhares |
| `src/styles/` | Tokens e base do sistema visual |
| `estudos/` | Estudos das Etapas A e B, mantidos como referência. Não entram no site |

## Conteúdo provisório

Texto não aprovado tem o campo `provisorio` em `src/data/site.ts`. No modo revisão (padrão) ele aparece com
contorno tracejado e toda página sai com `noindex`. `PUBLIC_REVISAO=0 npm run build` gera a versão final e
**falha de propósito** enquanto houver conteúdo provisório. `?limpo` na URL esconde as marcas.

## Vídeos

Instruções em `docs/MIDIAS.md`. Os pontos de ajuste estão no início do CSS de
`src/components/home/HeroIncisao.astro` (`--video-origem`, `--video-escala`, `--video-aproxima`,
`--incisao-x`, `--veu`, `--veu-altura`).

O site serve o filme completo, com 14 s: `docs/MONTAGEM-HERO.md`. A montagem de 8 s ficou em `estudos/etapa-c/montagem-8s/`.
As alternativas A e B ficaram guardadas em `estudos/etapa-c/`. Pendências: `docs/PENDENCIAS-PUBLICACAO.md`.

## Material disponível

- `referencias/midias-site-antigo/` — mídias extraídas do WordPress antigo (`public_html.zip` no Drive).
  ⚠️ A maioria das imagens é **gerada por IA** (nomes `a-premium-…`, `ChatGPT-Image-…`): **não usar**
  como foto da médica ou da clínica (regra da direção criativa). Reais: logos de convênios, fotos
  de WhatsApp, ícones SVG.
- `referencias/CONTEUDO-SITE-ATUAL.md` — textos e URLs extraídos de **draalinelongatti.com** em
  22/10/2026 (o zip não tem textos; eles ficavam no banco de dados do WordPress).
- Vídeos do site: originais na raiz do projeto (`hero final desktop.mp4`, `hero finalizado mobile.mp4`), fora do Git. Não alterar.
  Filme completo em `public/media/`: horizontal 1080p (8,1 MB) e vertical 720p (3,7 MB). Ver `docs/MONTAGEM-HERO.md`.
  (Os vídeos 01–03.mp4 do Drive são de social media.)

## Pendências de conteúdo

- Fotos reais da Dra. Aline e do espaço da clínica
- Filme do hero: uso confirmado por João em 5/11/2026 (ver `docs/PENDENCIAS-PUBLICACAO.md`)
- Textos aprovados: tratamentos, biografia, formação (base em `CONTEUDO-SITE-ATUAL.md`)
- Revisão dos conteúdos pelas regras de publicidade médica do CFM

## Antes e depois

- **Antes:** 14 prints de página inteira (7 páginas × computador 1440 px e celular 390 px), tirados em 22/10/2026, no Drive em `08 · Dra Aline Longatti\8 · Antes\Site antigo — prints 22-10-2026`.
- **Depois:** rodar `referencias/capturar-prints.mjs` com as mesmas medidas quando o site novo estiver no ar (ajustar a lista de páginas/URL se mudar).
- João vai gravar a tela do site antigo no celular para o vídeo de case.
