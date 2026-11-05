# Estudo de identidade visual

Área isolada: não é o site. As direções são aplicadas só na captura, por CSS injetado sobre as páginas reais (mesma estrutura, mesmo conteúdo, mesmos vídeos). Nada entra em `src/` antes da decisão de João.

## O que existe da marca

| Evidência | Origem | Dado |
|---|---|---|
| Logo vetorial da clínica | `referencia-marca/logo_longatti_vitae-1.svg`, baixado do site da clínica | Cores no arquivo: `#B05C5B`, `#848688`, `#F0D9C7`, `#E5BBBA` |
| Tema do site da clínica | `longatti.css` e HTML | `#AE5452`, `#5F1A1B`; fonte Blogger Sans |
| Site da médica | HTML | Acento `#C57E77`; fontes Open Sans e Quicksand |
| Logo do site da médica | PNG em `referencias/midias-site-antigo/` | Outra árvore: pêssego perto de `#D2AE8A` e cinza perto de `#727272` |
| Letreiro físico | Filme do hero | Metal e árvore escura. A cor é afetada por luz e grading: não serve como referência |

**Não encontrei manual de marca nem arquivos originais de identidade.** Nenhuma cor aqui é "oficial": as do logo são as mais próximas disso, e existem pelo menos três versões da árvore.

**Fontes:** o lettering está convertido em curvas no SVG, sem fonte identificável. Na primeira rodada, nenhuma direção a imitava; ver "Alex Brush" abaixo. A única fonte confirmada da marca é a Blogger Sans, usada no site da clínica.

## Licenças

| Fonte | Licença | Observação |
|---|---|---|
| Bodoni Moda, Fraunces, Hanken Grotesk, Schibsted Grotesk, Instrument Serif | OFL 1.1 | Livres para o site, com arquivos locais |
| Blogger Sans (Sergiy Tkachenko) | CC BY-ND 4.0, nos metadados do arquivo | Exige atribuição e proíbe derivados. Converter para WOFF2 ou recortar pode contar como derivado: confirmar antes de usar. O OTF inteiro pesa cerca de 100 KB por estilo |

## Verificação técnica de 4/11/2026

`npm run qa` e `testes/qa-video.mjs`. O vídeo passou. O teste geral acusou uma falha, "menu: link não navegou", que é um **falso alarme**: o teste ainda espera o título antigo "A médica" em `/sobre/`, hoje "Dra. Aline Longatti". O menu navegou nas três repetições em 390 px. Falta atualizar essa linha do teste.

## Para a implementação, depois da decisão

- Há cores fixas fora dos tokens: `rgba` de areia e marrom no hero, no rodapé, no menu, no índice e no Cap. 06. Precisam virar tokens.
- O Cap. 02, o Cap. 04 e o Cap. 05 têm tamanhos calibrados para a Newsreader. Cada fonte exige novo ajuste: a Bodoni estourou a largura e precisou de correção neste estudo.
- O código usa só romano e itálico da mesma família: a Direção C exige tratar o itálico como outra família.

## Alex Brush (estudo de João)

Comparada com o lettering do logo publicado: mesmos desenhos de letra, proporção e densidade quase iguais (`alex-brush-gabarito.png`, `alex-brush-sobreposicao.png`). É forte indício de que o logo foi feito com ela, ainda sem confirmação de quem criou a marca.

Fonte em `fontes/alex-brush-latin-400-normal.woff2`, licença OFL 1.1 em `fontes/alex-brush-LICENSE.txt`. Opções em `alex-brush-a.css` (títulos integrais) e `alex-brush-b.css` (assinaturas com Bodoni Moda de apoio). Os dois CSS são injetados só na captura.

## Decisão de João (4/11/2026)

Paleta B e Opção B aplicadas ao projeto local, em `src/styles/tokens.css` e `src/styles/base.css`: Alex Brush nas palavras de assinatura, Bodoni Moda nos títulos e Hanken Grotesk em textos e interface. As três têm licença OFL, com arquivos hospedados pelo próprio site. Direções A e C e os CSS deste estudo ficam só como registro.
