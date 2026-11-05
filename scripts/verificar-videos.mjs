// Garante que o build leva os vídeos aprovados, sem nenhuma alteração.
// Sem esta checagem, o site gera normalmente sem o filme: src/lib/midia.ts só usa o que existe.
// Se João aprovar um novo arquivo do hero, atualize o código de verificação abaixo no mesmo commit.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const APROVADOS = {
  "public/media/hero-desktop.mp4": "7a3dc24dca5c29daafb89180511046263d67c2e737b0a4fc03231fbaf1b6dd92",
  "public/media/hero-mobile.mp4": "a304da5ea25ee0e88b00e4ef546769f642ff5a73cab47c4228d984da9cd672ca",
};

let falhou = false;
for (const [arquivo, esperado] of Object.entries(APROVADOS)) {
  if (!existsSync(arquivo)) {
    console.error(`FALTA: ${arquivo}`);
    falhou = true;
    continue;
  }
  const atual = createHash("sha256").update(readFileSync(arquivo)).digest("hex");
  if (atual !== esperado) {
    console.error(`DIFERENTE DO APROVADO: ${arquivo}\n  esperado ${esperado}\n  atual    ${atual}`);
    falhou = true;
  } else {
    console.log(`ok ${arquivo}`);
  }
}
process.exit(falhou ? 1 : 0);
