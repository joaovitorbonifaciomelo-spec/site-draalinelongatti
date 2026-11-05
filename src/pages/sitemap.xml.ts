import type { APIRoute } from "astro";
import { rotasPublicas } from "../data/site";
import { REVISAO } from "../lib/provisorio";
import { montarSitemap } from "../lib/publicacao";

/* Em revisão não há nada público. Na publicação entram só as rotas liberadas em `rotasPublicas` */
export const GET: APIRoute = ({ site }) =>
  new Response(montarSitemap(REVISAO ? [] : rotasPublicas, String(site)), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
