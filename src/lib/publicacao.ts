/* Arquivos técnicos da publicação. Funções puras, sem dependência do Astro.
   Em modo revisão nada é indexado: robots bloqueia tudo e o sitemap sai vazio. */

export function montarRobots(revisao: boolean, site: string) {
  if (revisao) return "User-agent: *\nDisallow: /\n";
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`;
}

export function montarSitemap(rotas: string[], site: string) {
  const urls = rotas.map(r => `  <url><loc>${new URL(r, site).href}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}${urls ? "\n" : ""}</urlset>\n`;
}
