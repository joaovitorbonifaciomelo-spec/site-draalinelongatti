# Site Dra. Aline Longatti — contexto para o Claude

Redesign do site **draalinelongatti.com** (Nutrologia e Dermatologia, Goiânia — CRM 13210-GO,
RQE Nutrologia 11992, RQE Dermatologia 15427). Cliente da **Bonifácio** (estúdio de João Vitor).

## Leia antes de qualquer coisa
1. `referencias/DIRECAO-CRIATIVA.md` — direção criativa oficial ("Além da Superfície"). É a fonte de verdade.
2. `README.md` — etapas A–E e status atual.
3. `referencias/CONTEUDO-SITE-ATUAL.md` — textos e URLs do site atual (base, não aprovados).

## Como trabalhamos (Bonifácio Brand Method)
- **João (+ ChatGPT) dirige** conceito, estratégia e criação. **Claude executa**: escreve, programa,
  organiza, documenta. Não redefinir direção aprovada; havendo lacuna estratégica, responder
  **DECISÃO NECESSÁRIA** em vez de inventar.
- Seguir as etapas da direção criativa **em ordem**: A direção visual → B storyboard → C sistema e
  páginas → D desenvolvimento (começando pelo hero) → E qualidade e publicação. **Não começar a
  programar o site antes de a Etapa A estar aprovada por João.**
- Falar com João em português claro, simples e direto.

## Regras do projeto
- **Nunca** usar imagem gerada por IA como foto da Dra. Aline ou da clínica. As mídias de
  `referencias/midias-site-antigo/` são quase todas de IA (nomes `a-premium-…`, `ChatGPT-Image-…`).
- **Vídeos do hero: é proibido modificar a montagem sem autorização de João.** Os originais do Premiere
  (`hero final desktop.mp4`, `hero finalizado mobile.mp4`, na raiz) foram editados para funcionar em loop: começam
  e terminam na Dra. Aline. Só é permitida compressão que não altere cortes, duração, cor ou sequência. Nada de
  retirar cenas, reorganizar takes ou controlar o tempo por código. Ver `docs/MONTAGEM-HERO.md`.
- Os vídeos 01–03.mp4 do Drive são de social media, não do site.
- Cap. 05 é uma conexão curta com a Clínica Longatti Vitae. A experiência arquitetônica imersiva fica para o futuro
  site da clínica.
- Textos médicos: sem promessa de resultado; revisão pelas regras de publicidade médica do CFM.
- Preservar ou redirecionar as URLs atuais (lista no fim de `CONTEUDO-SITE-ATUAL.md`).
- Metas: LCP ≤ 2,5 s · CLS ≤ 0,1 · INP ≤ 200 ms · acessível por teclado · mobile como experiência própria.

## Fluxo de arquivos
- Desenvolver **só aqui** (`C:\Projetos\site-aline`, SSD). Nunca de dentro do Google Drive.
- Backup/histórico: GitHub `joaovitorbonifaciomelo-spec/site-draalinelongatti` (fazer push a cada marco).
- Publicação: Hostinger Business, por GitHub Actions acionado à mão. Procedimento e travas em `docs/PUBLICACAO.md`. Não desativar travas para publicar.
- Identidade visual e composições das quatro páginas principais aprovadas: sem novos estudos de paleta, fontes ou redesign sem necessidade concreta.
- Chaves (.env) nunca no GitHub: guardar em `G:\Meu Drive\COFRE - PRIVADO\Chaves de sistemas\site-aline\`.
- Pasta da cliente no Drive: `G:\Meu Drive\1 · BONIFÁCIO\1 · Clientes\08 · Dra Aline Longatti\`
  (site antigo `public_html.zip` em `3 · Site e Sistemas`).
