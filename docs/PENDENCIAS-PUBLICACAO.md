# Pendências de publicação

Lista para o build definitivo e procedimento de troca: `docs/PUBLICACAO.md`.

O build final (`PUBLIC_REVISAO=0 npm run build`) **falha de propósito** enquanto os itens marcados com "trava" existirem.

## Impedem a publicação

| Pendência | Quem decide | Situação |
|---|---|---|
| Pessoa identificável no filme do hero, nos arquivos servidos (trava) | Revisão de privacidade e de publicidade médica, com João | Autorizada só para a prévia local. A publicação depende dessa revisão. Ver `docs/MONTAGEM-HERO.md` |
| Porta-retratos com pessoas na estante, ao fundo do filme vertical do hero | Revisão de privacidade | Visto no estudo do Cap. 04. Confirmar se as pessoas são identificáveis e se a imagem pode ficar |
| Certificados, equipamentos e letreiro de volta no filme do hero (trava, junto da pessoa identificável) | Revisão de publicidade médica | O filme completo voltou por decisão de João |
| Revisão de todos os textos médicos pelas regras do CFM (trava) | Dra. Aline e revisão CFM | Nada aprovado ainda |
| Registros, contatos e textos do hero, Cap. 01, Cap. 02 e Cap. 03 (trava) | Dra. Aline e João | Provisórios, com a origem em `src/data/site.ts` |
| Formação, registros, fala e o retrato do Cap. 04 (trava) | Dra. Aline e revisão CFM | Provisórios, com a origem em `src/data/site.ts`. Detalhes abaixo |
| Imagem e textos do Cap. 05 (trava) | João, Dra. Aline e revisão de publicação | Quadro copiado do filme: confirmar que o corredor é da clínica. Área e local a confirmar. O link para `clinicalongattivitae.com.br` foi informado por João |
| Conteúdo de `/sobre/` (trava) | Dra. Aline e revisão CFM | Tudo provisório, com paráfrases identificadas: ver `docs/CONTEUDO-SOBRE.md` |
| Canais e dados de `/contato/` (trava) | João e Dra. Aline | Provisórios. Ver "Contato: a decidir" abaixo |
| Organização do Cap. 03 em condições, procedimentos e áreas (trava) | Dra. Aline | Proposta em `docs/ORGANIZACAO-CAP03.md`, com as dúvidas listadas |
| Conteúdo de `/tratamentos/` (trava) | Dra. Aline e revisão CFM | Primeira versão com os 20 itens, tudo provisório: ver `docs/CONTEUDO-TRATAMENTOS.md` |
| Procedimentos citados em `/sobre/` (toxina botulínica, preenchimentos, peelings, lasers, pequenas cirurgias) | Dra. Aline e revisão de publicidade médica | Fora do índice até a confirmação |
| Destino de "Agendar consulta" (trava) | João | Pretendido: WhatsApp (62) 3157-3270. Falta confirmar que o número está ativo para agendamento. Hoje leva a `/contato/`. Trocar em `WHATSAPP_CONFIRMADO`, em `src/data/site.ts` |
| Nome do prédio e dados de contato do Cap. 06 (trava) | João e Dra. Aline | Nome informado por João: Órion Business & Health Complex. O site atual escreve "Edifício Óriom Complex". Confirmar a grafia, o telefone e o horário |
| Convênios | Dra. Aline | Fora do site até confirmação. O site antigo tinha logos de planos |
| Fluidez do vídeo mobile em aparelho físico | João | Conferir antes de publicar |
| Destino de `/depoimentos/`, de `/artigos/`, dos três artigos e de `/category/*` | João, na migração | Opções em `docs/redirecionamentos.csv`. Hoje dariam 404 no site novo |
| Três artigos do WordPress | Dra. Aline e revisão CFM | Preservados em `referencias/artigos-wordpress/`, sem publicar. Envelhecimento é a prioridade; os de pandemia estão arquivados |
| Política de Privacidade (trava) | Médica, clínica, hospedagem e revisão jurídica | Estrutura em `/politicas-privacidade/`. Ver `docs/POLITICA-PRIVACIDADE.md` |
| Configuração do deploy na Hostinger | João | Fluxo pronto, faltam acesso SSH e segredos no GitHub. Ver `docs/PUBLICACAO.md` |

## Identidade visual

Aprovada por João para o projeto local. Falta confirmar com quem criou a marca se o logo usa mesmo a Alex Brush, e conferir o lettering no Safari e em aparelhos reais. `size-adjust` da Alex Brush exige Safari 17 ou mais recente; em versões anteriores ela aparece menor, sem quebrar.

## Retirado até validação

**Prêmios e formação em Medicina Estética** saíram de `/sobre/` por decisão de João, até a confirmação da Dra. Aline e a revisão CFM. Os textos originais estão em `docs/CONTEUDO-SOBRE.md`.

**Medicina Integrativa** saiu do índice visível por decisão de João, até validação pela revisão CFM. Texto original de
`/tratamentos/` no site atual, em "Áreas Atendidas" de Nutrologia:

> Medicina Integrativa
> Integração entre ciência, hábitos de vida e suplementação médica para equilíbrio e bem-estar global

No índice, a descrição estava encurtada para "Integração entre ciência, hábitos de vida e suplementação médica.", com o id
`medicina-integrativa` na área de Nutrologia.

## Falta testar ou construir

- iPhone, Android e Safari reais e Firefox.
- Itálico no Safari real: no WebKit para Windows parecia mais pesado.
- Medição de campo de LCP, CLS e INP, na Etapa E.
- Demais páginas internas.

## Contato: a decidir

- **WhatsApp:** o site atual lista o mesmo número como "Telefone / WhatsApp", e parece ser um fixo. Confirmar que ele recebe mensagens e agendamentos.
- **Horário, e-mail e localização:** vêm do site atual e de João, provisórios. O e-mail é da clínica, em conta gratuita (`clinicalongattivitae@gmail.com`): confirmar se é o canal certo para pacientes.
- **Nome do prédio:** João informou "Órion Business & Health Complex"; o site atual escreve "Edifício Óriom Complex".
- **Formulário do site atual:** ficou de fora. Não foi possível avaliar o funcionamento nem o destino dos dados, porque as fontes do projeto só trazem o texto da página. Este site é estático e não tem como receber envios. Um formulário de saúde exigiria serviço de envio, consentimento e revisão de LGPD. Voltar só se João decidir que ele é necessário.
- **Instagram e Google:** o site atual cita os nomes, mas as fontes do projeto não trazem os endereços. Ficaram de fora até João informar.

## Cap. 04: a confirmar

- **Retrato:** foto do site atual (`WhatsApp-Image-2025-12-09…`), recortada. Confirmar autoria, autorização de uso e se é recente. A resolução é limitada em telas muito grandes.
- **Foto em consulta:** retirada por decisão de João. O capítulo fecha com a declaração da médica, sem segunda imagem. A declaração é assinada como "Dra. Aline Longatti" e o trecho literal precisa da aprovação dela.
- **Anos:** o site atual não informa o ano das titulações de especialista nem o da SBCD. Eles ficam sem ano, não foram estimados.
- **Fala:** trecho literal de `/sobre/`, com um itálico da composição. Precisa da aprovação da Dra. Aline.
- **Fora do capítulo até decisão:** Medicina Estética (é especialização, sem RQE, e as datas divergem), prêmios e capa de revista.

## Cap. 03: origem do conteúdo

- Nomes como estão em `/tratamentos/` no site atual. São 20 itens no total e 8 na Home, sem "Medicina Integrativa".
- Descrições encurtadas para retirar promessa de resultado, como "resultados sustentáveis", "eliminar" e "recuperação dos
  fios". Nada novo foi acrescentado.
- "Tratamento de Manchas na Pele" e "Tratamento para Queda de Cabelo" (áreas atendidas) foram unidos a "Manchas e Melasma"
  e "Queda de Cabelo" para não repetir o mesmo assunto.
- A frase de apoio está aprovada por João só para teste. As instruções de uso são propostas da Bonifácio, a aprovar.
