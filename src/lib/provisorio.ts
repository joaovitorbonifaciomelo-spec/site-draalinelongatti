/* Conteúdo não aprovado fica identificado na própria fonte de dados.
   Modo revisão (padrão): o texto recebe contorno tracejado e a página fica noindex.
   Modo final (PUBLIC_REVISAO=0): o build FALHA se ainda houver conteúdo provisório. */
export const REVISAO = import.meta.env.PUBLIC_REVISAO !== "0";

export type Conteudo<T = string> = { valor: T; provisorio?: string };

/** Atributos de marcação para um conteúdo. `provisorio` guarda a origem do texto. */
export function marca(c: Conteudo<unknown>) {
  if (!c.provisorio) return {};
  if (!REVISAO) throw new Error(`Conteúdo provisório em build final: ${JSON.stringify(c.valor)} (${c.provisorio})`);
  return { "data-prov": "", title: `Provisório · ${c.provisorio}` };
}
