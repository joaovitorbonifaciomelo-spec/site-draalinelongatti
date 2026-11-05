# Política de Privacidade: estrutura e dependências

A página `/politicas-privacidade/` traz só fatos do código e da hospedagem. Este documento não é parecer jurídico. Lacuna indispensável: definir formalmente o controlador dos dados (pessoa física ou clínica, com CNPJ) e os prazos de retenção dos contatos recebidos.

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
