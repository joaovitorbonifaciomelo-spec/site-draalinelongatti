# Plano de URLs

A tabela completa, independente de plataforma, está em `docs/redirecionamentos.csv`. Na Hostinger, `scripts/gerar-htaccess.mjs --final` a converte em `.htaccess`.

**Regras de João:** nada de redirecionar em massa para a Home ou para o índice de Artigos. Cada destino precisa ser relevante; sem destino relevante, a URL responde 410 (removida). Provisórios não entram no sitemap.

| Grupo | Situação |
|---|---|
| `/`, `/sobre/`, `/tratamentos/`, `/contato/` | Mesma URL |
| `/politicas-privacidade/` | Mesma URL. Estrutura travada até a validação |
| `/artigos/` | Só em revisão. Fora da versão publicada até haver artigo aprovado |
| Os três artigos | Preservados em `referencias/artigos-wordpress/`, sem publicar. Destino decidido na migração |
| `/depoimentos/` | Não migrar. Opções registradas, sem destino configurado |
| `/category/*` | Seguem a decisão dos artigos |
| `/author/...`, `/feed/`, sitemaps e modelos do WordPress | Definidos na tabela |
| Qualquer outra URL | Página 404 |

## Inventário de 4/11/2026

Conferido no sitemap público do site atual, só com leitura. Todas as URLs de páginas e artigos respondem 200 hoje.

**Artigos:** o projeto só guarda o resumo dos três artigos. O texto integral está no site atual, com cerca de 600 a 900 palavras cada, e deve ser copiado literalmente antes de qualquer mudança no servidor. A data de publicação não aparece nos metadados; o sitemap indica última alteração em 27/11/2025.

**Links internos do build:** nenhum quebrado. `/artigos/` e `/politicas-privacidade/` continuam "Em construção" e aparecem no rodapé de todas as páginas.
