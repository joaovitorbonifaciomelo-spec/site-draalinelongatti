import type { APIRoute } from "astro";
import { REVISAO } from "../lib/provisorio";
import { montarRobots } from "../lib/publicacao";

export const GET: APIRoute = ({ site }) =>
  new Response(montarRobots(REVISAO, String(site)), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
