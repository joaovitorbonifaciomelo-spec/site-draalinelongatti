# Filme do hero

> **Regra de João:** é proibido modificar a montagem sem a autorização dele. Os vídeos foram editados no Premiere para
> funcionar em loop, com início e fim na Dra. Aline. Só é permitida compressão que não altere cortes, duração, cor ou sequência.
> A montagem de 8 s, descrita no histórico abaixo, está descontinuada: fica só como registro e não deve voltar a ser servida.

## Validação do loop (4/11/2026)

| | Computador | Celular |
|---|---|---|
| Quadros, original e servido | 423 e 423 (14,11 s) | 842 e 842 (14,03 s) |
| Cortes nos mesmos instantes | Sim, 6 cortes e 7 planos | Sim, 6 cortes e 7 planos |
| Diferença por quadro, original x servido (0 a 255) | média 0,20, pior 0,30 | média 0,41, pior 0,64 |
| Emenda, último para o primeiro quadro | 2,35 (um corte real passa de 90) | 3,47 (um corte real passa de 90) |
| Volta ao início no Chrome | 49 ms entre os quadros | 28 ms entre os quadros |

Nenhum código altera o tempo, a velocidade ou o arquivo durante a reprodução. O áudio não é servido, porque o vídeo toca sem som.
O hero só pausa o filme quando ele está coberto ou fora da tela, e retoma do mesmo ponto.

## Situação atual (decisão de João)

O site serve o **filme completo**, com 14 s, em um arquivo por formato. Ele traz certificados, equipamentos e letreiro, o que substitui as
decisões anteriores de retirá-los. A publicação continua dependendo da revisão de privacidade e de publicidade médica. A montagem de 8 s
está guardada em `estudos/etapa-c/montagem-8s/`. Os originais ficam intactos na raiz do projeto.

| Formato | Arquivo | Qualidade | Peso |
|---|---|---|---|
| Computador | `hero-desktop.mp4` | 1080p, 29,97 fps, H.264 CRF 20, sem áudio | 8,1 MB |
| Celular e tablet em pé | `hero-mobile.mp4` | 720p, 60 fps, H.264 CRF 20, sem áudio | 3,6 MB |

A escolha é feita por dispositivo, sem troca dinâmica de qualidade. Economia de dados, 2G, 3G e "reduzir movimento" ficam no poster, com o botão para tocar.
Internet abaixo de cerca de 6 Mbps no computador ou 3 Mbps no celular pode fazer o filme parar de vez em quando.

## Celular a 60 fps (aprovado por João em 4/11/2026)

720p a 60 fps, com os mesmos 842 quadros e cortes do original. A fluidez em aparelho físico será conferida antes da publicação. A versão anterior, de 30 fps, está guardada em `testes/resultados/hero-fps/` e não é servida.

## Enquadramento e véu

- **Computador:** a janela do filme termina entre as duas linhas do título. "tem" atravessa o corte, e a borda de baixo passa pela segunda linha na abertura.
- **Celular:** a primeira linha continua atravessando o corte. O filme aproxima a partir do alto com o corte fechado (`--video-escala: 1.18`), o que tira o letreiro de trás do título.
- **Véu:** continua em 0,60. O 0,76 foi comparado em movimento: quase não apaga o texto filmado e escurece mais o filme.
- **Limite conhecido:** com o corte aberto, o título ainda passa sobre o letreiro e os certificados. Se incomodar, a solução é reenquadrar esses planos na edição.

O restante deste documento é o histórico da montagem de 8 s.

# Histórico: a montagem de 8 s

Os originais ficam intactos na raiz do projeto, fora do Git. O site serve uma **montagem própria**, gerada a partir
deles: certificados, equipamentos e letreiro não estão nos arquivos entregues ao navegador.

## Decisão de João

Montagem atual mantida, com cerca de 8 s, e abertura aceita provisoriamente sobre quadros e luz. Sem nova captação por agora
e sem voltar ao controle de tempo por JavaScript. A outra pessoa na cena está autorizada para a prévia local: não precisa
sair por decisão criativa, mas a publicação depende da revisão de privacidade e de publicidade médica.

## O que foi comparado

| | Controle de tempo por JavaScript | Montagem própria (adotada) |
|---|---|---|
| Diferença entre quadros na emenda da cena da médica | 33,8 no horizontal e 73,2 no vertical, de 255 | 4,3 e 6,9, quase o mesmo que dois quadros vizinhos (3,0 e 5,1) |
| Texto filmado no arquivo servido | Continua no arquivo, só é pulado | Não existe no arquivo |
| Peso | 4,7 MB e 2,6 MB | 2,6 MB e 1,1 MB |
| Código de controle do filme | Sim | Nenhum |
| Abertura sempre na médica | Sim, com corte forçado no momento da rolagem | Não: pode abrir em quadros ou luz |

A montagem é melhor em continuidade, peso e adequação do arquivo. O custo é a última linha: quem começa a rolar nos
cerca de 4 s de quadros e luz abre o corte sobre esses planos, e a médica volta em até 4 s por um corte normal do filme.

## Ordem atual

| Ordem | Trecho do original (horizontal / vertical) | Duração |
|---|---|---|
| 1 | Médica: 0,00 a 2,00 / 0,00 a 2,07 | 2,0 s / 2,1 s |
| 2 | Quadros: 4,01 a 6,00 / 4,125 a 6,09 | 2,0 s |
| 3 | Linhas de luz: 2,01 a 4,00 / 2,09 a 4,11 | 2,0 s |
| 4 | Médica: 12,15 ao fim / 12,70 ao fim | 2,0 s / 1,3 s |

Total: 7,9 s no horizontal e 7,4 s no vertical. O fim encadeia no início, e o loop não tem salto.
No vertical, o trecho 4 começa em 12,70 porque antes disso a cabeça da outra pessoa cobre o rosto da médica.

## Limites desta montagem

- **Duração:** fica abaixo dos 10 a 15 s da direção criativa, porque só há cerca de 4 s da médica sem salto.
- **Pessoa identificável:** a cena da médica tem a outra pessoa em todos os quadros. Autorizada para a prévia local; a
  publicação depende da revisão de privacidade e de publicidade médica.
- **Recorte no próprio arquivo não resolve:** no horizontal, tirar a cabeça exigiria usar só cerca de 52% da largura,
  ampliando 1,9 vez, e o braço e o relógio continuariam. No vertical, a pessoa chega a se sobrepor à médica, então não há
  recorte possível.

## Se a captação voltar a ser considerada

Uma edição no Premiere com **um take da Dra. Aline sozinha, longo e contínuo**, se existir no material bruto. Eu só tive
acesso aos dois filmes finalizados e não sei se esse take existe.

| Ordem | Conteúdo | Duração |
|---|---|---|
| 1 | Dra. Aline sozinha, à direita do quadro, com a área inferior esquerda calma para o título | 6 a 8 s |
| 2 | Quadros | 2 s |
| 3 | Linhas de luz | 2 s |
| 4 | Continuação do take da Dra. Aline, terminando no primeiro quadro do filme | 2 a 3 s |

Isso dá 12 a 15 s, com a médica em mais de 60% do tempo, sem outra pessoa e com loop limpo. Pedir horizontal e vertical
em H.264 de alta qualidade, sem precisar comprimir: a versão do site é gerada aqui.

Por decisão de João, isso não é necessário neste momento.

Certificados, equipamentos e letreiro podem voltar em capítulos sem título por cima, como arquivos separados, depois da
revisão pelas regras do CFM.

## Como os arquivos do site foram gerados

| Arquivo | Formato | Peso |
|---|---|---|
| `public/media/hero-desktop.mp4` | 1080p, 29,97 fps, sem áudio | 2,6 MB |
| `public/media/hero-mobile.mp4` | 720p, 30 fps, sem áudio | 1,1 MB |
| `public/media/hero-mobile-leve.mp4` | 540p, 30 fps, sem áudio, entregue quando o navegador informa 3G | 0,6 MB |

Em H.264, com prioridade para áreas suaves e tons de pele, a partir dos originais. Os posters são o primeiro quadro de cada filme.
