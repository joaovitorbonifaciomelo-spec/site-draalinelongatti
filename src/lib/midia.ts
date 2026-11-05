/* Descobre no build (e a cada atualização em modo dev) quais mídias já existem em public/.
   Assim, entregar o vídeo é só copiar o arquivo, e nenhum 404 aparece enquanto ele não chega. */
import { existsSync } from "node:fs";
import { join } from "node:path";

const existe = (url: string) => existsSync(join(process.cwd(), "public", url));

export const achar = (url?: string) => (url && existe(url) ? url : undefined);

/** Aceita o poster em qualquer um dos formatos, do mais leve ao mais pesado. */
export const acharPoster = (base?: string) =>
  base ? [".avif", ".webp", ".jpg", ".png"].map(e => base + e).find(existe) : undefined;
