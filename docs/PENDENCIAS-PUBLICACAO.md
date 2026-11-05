# Pendências de publicação

Procedimento: `docs/PUBLICACAO.md`.

## Trava restante

**Filme do hero: confirmar que ninguém identificável é paciente.**

Confirmação registrada: em 5/11/2026, João confirmou que há autorização para manter o filme completo, incluindo as pessoas e imagens que aparecem nele. Os vídeos não mudam.

Essa autorização não resolve o caso de paciente. O filme mostra um homem identificável em cena semelhante a uma consulta e, na versão de celular, um porta-retratos com pessoas. O projeto não registra quem são.

- Código de Ética Médica, art. 75: é vedado exibir pacientes ou imagens que os tornem reconhecíveis em anúncios profissionais, "mesmo com autorização do paciente".
- Resolução CFM nº 2.336/2023, art. 14: imagem de paciente só com finalidade educativa e com anonimato garantido, mesmo com autorização.
- Se não forem pacientes: art. 9º, I, permite vídeo do ambiente de trabalho, da própria imagem e da equipe. Terceiros ficam cobertos pela autorização confirmada.

A marca `filmeHero`, em `src/data/site.ts`, sai só depois dessa confirmação.

## Conferência de publicidade médica de 5/11/2026

Conferência interna do projeto, sobre o texto da norma. Não é parecer jurídico nem manifestação do CFM ou do CRM.

| Ponto | Situação |
|---|---|
| Nome, CRM com "Médica", especialidades e RQE (arts. 4º, 6º e 13) | Presentes. Até 2 especialidades, como permite o art. 13 |
| Promessa de resultado (art. 11, XII) | Expressões retiradas dos textos |
| Equipamentos no filme (art. 9º, I e IX) | Ambiente de trabalho é permitido. O InBody 270 aparece só em imagem, sem anúncio |
| Certificado de Medicina Estética no filme (art. 13, §1º, c) | Especialista pode anunciar pós-graduação relacionada à especialidade |
| Homenagem da Assembleia "Destaque" no filme (art. 11, XIII e XVI) | Risco a avaliar: pode ser lida como autopromoção. Não é vedação clara |

## Fechamento de 5/11/2026, por decisão de João

As marcas de provisório saíram com base em fontes verificáveis ou na decisão dele. **Isso não é aprovação da Dra. Aline nem revisão de conformidade**, e nenhuma das duas foi feita.

| Item | Base |
|---|---|
| CRM e RQE | Site da clínica (RQE) e diretórios médicos (CRM-GO 13210) |
| Palavra "médica" junto do CRM | Art. 4º, I, da Resolução CFM nº 2.336/2023 |
| Formação e títulos em ABRAN e SBD | Site da clínica |
| WhatsApp e nome do prédio | Site da clínica |
| Telefone, horário, e-mail e ano de graduação | Site antigo |
| Retrato | Foto do site antigo da própria médica |
| Corredor | Quadro do filme, sem pessoas |
| Textos e tratamentos | Site antigo e site da clínica, sem termos de promessa |

## Retirado por falta de confirmação

Anos de titulação; SBCD; "oncológicos" no texto de Dermatologia; expressões de resultado nos tratamentos. Também seguem fora: prêmios, Medicina Estética, procedimentos estéticos nominais, Medicina Integrativa, planos de saúde e os três artigos, preservados em `referencias/artigos-wordpress/`.

## Lacuna jurídica

Definir formalmente o controlador dos dados e os prazos de retenção dos contatos recebidos. Ver `docs/POLITICA-PRIVACIDADE.md`.
