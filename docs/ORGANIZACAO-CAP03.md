# Cap. 03: organização do conteúdo e estudo da Home

A classificação médica é proposta e depende da Dra. Aline.

## Organização dos 20 itens

No site atual só havia "Principais tratamentos" e "Áreas atendidas". Essa divisão misturava as coisas: "Acne" é uma condição
e estava em tratamentos; "Cirurgia da Pele" é um procedimento e estava em áreas. A lista completa usa os três grupos
pedidos. Nenhum nome ou serviço foi criado, e as descrições não mudaram nesta rodada: só o grupo e a ordem de cada item.

| Especialidade | Condições clínicas | Procedimentos | Áreas de atendimento |
|---|---|---|---|
| **Nutrologia** | Síndromes de Má Absorção · Obesidade · Deficiências Nutricionais · Transtornos Nutricionais · Transtornos da Alimentação · Doenças Nutricionais e Metabólicas · Hipersensibilidade Alimentar · Intolerância à Lactose | Nenhum documentado | Emagrecimento · Hipertrofia · Nutrologia Vegetariana |
| **Dermatologia** | Acne · Onicomicose · Queda de Cabelo · Manchas e Melasma · Câncer de Pele | Cirurgia da Pele · Tratamentos Estéticos Faciais | Envelhecimento Facial · Rugas de Expressão |

### Para a Dra. Aline validar

Cada item abaixo é uma classificação incerta ou uma diferença entre páginas do site atual. Nada disso foi resolvido por conta própria.

1. **Emagrecimento e Obesidade:** ficaram separados porque o site atual os separa. Obesidade é condição; Emagrecimento foi tratado como área. Confirmar.
2. **Rugas de Expressão:** o nome parece condição, mas a descrição atual fala em procedimentos. Ficou em áreas.
3. **Envelhecimento Facial:** não é doença, por isso ficou em áreas. Confirmar.
4. **Tratamentos Estéticos Faciais:** é um conjunto de procedimentos, mas o nome é amplo. Ficou em procedimentos.
5. **Câncer de Pele:** `/tratamentos/` fala em "diagnóstico precoce e encaminhamento", enquanto `/sobre/` cita procedimentos "oncológicos". Definir o que a página deve dizer.
6. **Procedimentos citados só em `/sobre/`:** toxina botulínica, preenchimentos, peelings, lasers e pequenas cirurgias dermatológicas. Por decisão de João, aguardam a confirmação da médica e a revisão de publicidade médica. Não incluir automaticamente.
7. **Nomes citados em outras páginas:** "Nutrologia Clínica" e "Nutrologia Esportiva" (Home atual), e "vigorexia" (`/sobre/`). Também não entraram.

### Retirado até validação

"Medicina Integrativa" saiu do índice visível e das âncoras de `/tratamentos/`. O texto original está registrado em
`docs/PENDENCIAS-PUBLICACAO.md` e em `referencias/CONTEUDO-SITE-ATUAL.md`.

## Home com 8 itens (decisão de João)

A Home mostra 8 itens, sem subgrupos, e termina em "Explorar os atendimentos". Os 20 ficam em `src/data/site.ts` para a página
`/tratamentos/`, sujeitos à validação médica. O componente `Indice` com `completo` já monta a lista inteira, agrupada, para essa página.

| Nutrologia | Base em `/sobre/` | Dermatologia | Base em `/sobre/` |
|---|---|---|---|
| Obesidade | "tratamentos de obesidade" | Manchas e Melasma | doenças de pele |
| Hipertrofia | "performance esportiva", "ganho de massa muscular" | Queda de Cabelo | doenças de pelo |
| Transtornos da Alimentação | "compulsão alimentar, anorexia, bulimia" | Tratamentos Estéticos Faciais | "tratamentos estéticos" |
| Deficiências Nutricionais | "equilíbrio nutricional" | Cirurgia da Pele | "pequenas cirurgias dermatológicas" |

**Cap. 02 e Cap. 03:** o Cap. 02 apresenta as especialidades, com descrição e link. As listas de tratamentos saíram dele, e os
atendimentos ficam só no Cap. 03. Os itens do Cap. 02 eram: Obesidade, Emagrecimento, Hipertrofia, Deficiências nutricionais e
Transtornos da alimentação; Acne, Manchas e melasma, Queda de cabelo, Envelhecimento facial e Câncer de pele.

**Publicação:** os links dos 8 itens levam a âncoras de `/tratamentos/`, que hoje só tem os nomes. A página precisa existir antes de publicar.
