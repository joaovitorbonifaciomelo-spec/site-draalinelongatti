# Política de Privacidade: estrutura e dependências

A página `/politicas-privacidade/` é uma estrutura, não uma política válida. Ela trava o build final e fica fora do sitemap.
Este documento não é parecer jurídico. Nenhum controlador, operador, prazo ou cláusula legal foi definido.

## Fatos técnicos confirmados no código (4/11/2026)

| Fato | Onde conferir |
|---|---|
| Não há formulário em nenhuma página | Build em `dist/` |
| O código do site não cria cookies | Busca por `document.cookie` em `src/` |
| Não há ferramenta de análise ou rastreamento | Busca por `gtag`, `googletagmanager`, `analytics`, `fbq` em `src/` |
| Fontes, imagens e vídeos são servidos pelo próprio site | Recursos externos do build |
| `aline-video-pausado`: guarda a pausa do vídeo no armazenamento da sessão do navegador | `src/scripts/midia.ts` |
| `aline-limpo`: guarda a exibição das marcas, só na versão de revisão | `src/scripts/cabecalho.ts`, `src/layouts/Base.astro` |
| Preferências de movimento e economia de dados são lidas no aparelho, e o código não as envia | `src/scripts/midia.ts` |
| Links para WhatsApp, Google Maps, site da clínica, telefone e e-mail só funcionam quando a pessoa clica | Páginas `/contato/` e Home |

## O que depende de quem

| Item | Médica | Clínica | Hospedagem | Revisão jurídica |
|---|---|---|---|---|
| Quem é o controlador e o contato para privacidade | x | x | | x |
| Quem atua como operador | | x | x | x |
| Finalidades e bases legais do que chega por telefone, WhatsApp e e-mail | x | x | | x |
| Prazos de retenção | x | x | | x |
| Com quem os dados são compartilhados | x | x | | x |
| Direitos do titular e como exercê-los | | | | x |
| Registros de acesso do servidor e transferência internacional | | | x | x |
| Uso de análise de visitas (o site antigo carrega o Google Tag Manager) | | x | | x |
| Data de vigência e redação final | x | | | x |

## Antes de publicar

1. Preencher as dependências acima e substituir a estrutura pelo texto aprovado.
2. Retirar a marca de provisório em `privacidade`, em `src/data/site.ts`.
3. Marcar `publicar: true` na rota em `rotasPublicas`, para ela entrar no sitemap.
