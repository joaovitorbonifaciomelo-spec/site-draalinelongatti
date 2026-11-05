// Converte docs/redirecionamentos.csv no .htaccess da Hostinger.
//   --verificar  só confere a tabela e mostra o que está pendente
//   --final      grava dist/.htaccess. Falha se houver destino pendente ou ainda bloqueado
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const modo = process.argv[2];
if (!["--verificar", "--final"].includes(modo)) {
  console.error("Uso: node scripts/gerar-htaccess.mjs --verificar | --final");
  process.exit(2);
}

const linhas = readFileSync("docs/redirecionamentos.csv", "utf8").trim().split(/\r?\n/).slice(1).map(l => {
  const [origem, acao, destino, situacao] = l.split(",");
  return { origem, acao, destino, situacao };
});

const pendentes = linhas.filter(l => l.acao === "pendente");
const bloqueadas = linhas.filter(l => l.situacao === "bloqueado");
const redirecionar = linhas.filter(l => l.acao === "301");
const remover = linhas.filter(l => l.acao === "410");

/* Trecho de expressão regular: escapa o que tem significado especial e tolera a barra final */
const padrao = origem => origem.replace(/^\//, "").replace(/\/$/, "").replace(/[.+?^${}()|[\]\\]/g, "\\$&");

const erros = [];
for (const l of linhas) {
  if (!["manter", "301", "410", "pendente"].includes(l.acao)) erros.push(`ação desconhecida em ${l.origem}: ${l.acao}`);
}
for (const l of redirecionar) {
  if (!l.destino) erros.push(`301 sem destino: ${l.origem}`);
  /* Regra de João: nada de redirecionar em massa para a Home ou para o índice de Artigos */
  if (["/", "/artigos/"].includes(l.destino)) erros.push(`destino genérico proibido: ${l.origem} → ${l.destino}`);
}

console.log(`Tabela: ${linhas.length} linhas. ${redirecionar.length} redirecionamentos, ${remover.length} removidas, ${pendentes.length} pendentes, ${bloqueadas.length} bloqueada(s).`);
for (const l of pendentes) console.log(`  pendente: ${l.origem}`);
for (const l of bloqueadas) console.log(`  bloqueada: ${l.origem}`);

if (erros.length) {
  erros.forEach(e => console.error(`ERRO: ${e}`));
  process.exit(1);
}
if (modo === "--verificar") process.exit(0);

if (pendentes.length || bloqueadas.length) {
  console.error("Bloqueado: resolva os itens acima em docs/redirecionamentos.csv antes do build definitivo.");
  process.exit(1);
}
if (!existsSync("dist")) {
  console.error("Rode o build antes de gerar o .htaccess.");
  process.exit(1);
}

const regras = [];
for (const l of remover) {
  if (l.origem.startsWith("/?")) {
    const parametro = l.origem.slice(2).replace(/=\*$/, "");
    regras.push(`RewriteCond %{QUERY_STRING} (^|&)${parametro}= [NC]`, "RewriteRule ^ - [G,L]");
  } else {
    regras.push(`RewriteRule ^${padrao(l.origem)}/?$ - [G,L]`);
  }
}
for (const l of redirecionar) regras.push(`RewriteRule ^${padrao(l.origem)}/?$ ${l.destino} [R=301,L]`);

const htaccess = `# Gerado por scripts/gerar-htaccess.mjs a partir de docs/redirecionamentos.csv. Não editar à mão.
Options -Indexes
ErrorDocument 404 /404.html
ErrorDocument 410 /404.html

RewriteEngine On

# HTTPS e domínio sem www
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} ^www\\. [NC]
RewriteRule ^ https://draalinelongatti.com%{REQUEST_URI} [R=301,L]

# URLs do site anterior
${regras.join("\n")}

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  <FilesMatch "\\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType font/woff2 "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType text/javascript "access plus 1 year"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType video/mp4 "access plus 1 month"
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/xml image/svg+xml text/plain
</IfModule>
`;
writeFileSync("dist/.htaccess", htaccess);
console.log("dist/.htaccess gravado.");
