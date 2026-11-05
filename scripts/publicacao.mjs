// Atualiza a branch `publicacao`, que contém só o site gerado, na raiz.
// A Hostinger publica o que chega nessa branch. Este script é o único caminho previsto até ela.
//
//   npm run publicacao -- --simular          roda todas as travas e não grava nada
//   npm run publicacao                       idem e, com a confirmação digitada, atualiza a branch
//   npm run publicacao -- --voltar <commit>  devolve a branch a uma versão anterior
//
// As travas não têm opção de desligar. Para liberar, resolva a causa. Ver docs/PUBLICACAO.md.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import { createInterface } from "node:readline/promises";

const BRANCH = "publicacao";
const REF_REMOTA = `refs/heads/${BRANCH}`;
const args = process.argv.slice(2);
const simular = args.includes("--simular");
const iVoltar = args.indexOf("--voltar");
const voltarPara = iVoltar >= 0 ? args[iVoltar + 1] : null;

const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const parar = msg => { console.error(`\nBLOQUEADO: ${msg}\nNada foi gravado.`); process.exit(1); };

function rodar(titulo, comando, argumentos, env = {}) {
  console.log(`\n== ${titulo}`);
  const r = spawnSync(comando, argumentos, { stdio: "inherit", env: { ...process.env, ...env } });
  return r.status === 0;
}

async function confirmar(frase, aviso) {
  // Só uma pessoa no terminal confirma: sem terminal interativo, não há como seguir
  if (!process.stdin.isTTY) parar("a confirmação precisa ser digitada em um terminal.");
  console.log(`\n${aviso}`);
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const resposta = await rl.question(`Para seguir, digite exatamente: ${frase}\n> `);
  rl.close();
  if (resposta.trim() !== frase) parar("confirmação diferente.");
}

function exigirMainLimpa() {
  if (git("rev-parse", "--abbrev-ref", "HEAD") !== "main") parar("rode a partir da branch main.");
  if (git("status", "--porcelain")) parar("há alterações não salvas em commit.");
  git("fetch", "origin", "main");
  if (git("rev-parse", "HEAD") !== git("rev-parse", "origin/main")) parar("a main local está diferente da main do GitHub.");
}

function pontaRemota() {
  git("fetch", "origin");
  const saida = git("ls-remote", "origin", REF_REMOTA);
  if (!saida) return null;
  const sha = saida.split(/\s+/)[0];
  git("fetch", "origin", REF_REMOTA);
  return sha;
}

function listar(pasta) {
  return readdirSync(pasta).flatMap(nome => {
    const c = join(pasta, nome);
    return statSync(c).isDirectory() ? listar(c) : [c];
  });
}

const sha256 = arquivo => createHash("sha256").update(readFileSync(arquivo)).digest("hex");

/** Confere o resultado do build. Devolve a lista de problemas. */
function conferirDist() {
  const erros = [];
  const arquivos = listar("dist");
  const rel = arquivos.map(a => relative("dist", a).split(sep).join("/"));
  for (const obrigatorio of ["index.html", "404.html", ".htaccess", "robots.txt", "sitemap.xml", "media/hero-desktop.mp4", "media/hero-mobile.mp4"]) {
    if (!rel.includes(obrigatorio)) erros.push(`falta ${obrigatorio}`);
  }
  const proibido = /^(src|docs|referencias|estudos|scripts|testes|node_modules|\.git|\.github)(\/|$)|^(package(-lock)?\.json|README\.md|CLAUDE\.md)$|(^|\/)\.env|\.map$/;
  rel.filter(r => proibido.test(r)).forEach(r => erros.push(`arquivo que não é do site: ${r}`));
  for (const a of arquivos.filter(x => x.endsWith(".html"))) {
    const html = readFileSync(a, "utf8");
    const r = relative("dist", a).split(sep).join("/");
    if (html.includes("data-prov")) erros.push(`marca de conteúdo provisório em ${r}`);
    if (r !== "404.html" && /<meta[^>]+noindex/i.test(html)) erros.push(`noindex em ${r}`);
  }
  if (existsSync("dist/robots.txt") && /Disallow:\s*\/\s*$/m.test(readFileSync("dist/robots.txt", "utf8"))) erros.push("robots.txt bloqueia o site");
  for (const v of ["hero-desktop.mp4", "hero-mobile.mp4"]) {
    if (existsSync(`dist/media/${v}`) && sha256(`dist/media/${v}`) !== sha256(`public/media/${v}`)) erros.push(`vídeo alterado no build: ${v}`);
  }
  return { erros, rel, bytes: arquivos.reduce((t, a) => t + statSync(a).size, 0) };
}

/** Cria o commit só com o conteúdo de dist/, na raiz, sem tocar nos arquivos do projeto. */
function criarCommit(pai, mensagem) {
  const pasta = mkdtempSync(join(tmpdir(), "publicacao-"));
  try {
    const env = { ...process.env, GIT_INDEX_FILE: join(pasta, "index") };
    const g = (...a) => execFileSync("git", ["-c", "core.autocrlf=false", "-c", "core.safecrlf=false", ...a], { encoding: "utf8", env }).trim();
    g("--work-tree=dist", "add", "-A", "-f", ".");
    const arvore = g("write-tree");
    return g("commit-tree", arvore, ...(pai ? ["-p", pai] : []), "-m", mensagem);
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

function conferirCommit(commit, rel) {
  const naBranch = git("ls-tree", "-r", "--name-only", "-z", commit).split("\0").filter(Boolean).sort();
  if (naBranch.join("\n") !== [...rel].sort().join("\n")) parar("o commit não ficou igual a dist/.");
  for (const v of ["hero-desktop.mp4", "hero-mobile.mp4"]) {
    if (git("rev-parse", `${commit}:media/${v}`) !== git("hash-object", "--no-filters", `dist/media/${v}`)) parar(`vídeo diferente no commit: ${v}`);
  }
}

async function voltar() {
  exigirMainLimpa();
  const ponta = pontaRemota();
  if (!ponta) parar(`a branch ${BRANCH} ainda não existe.`);
  const alvo = git("rev-parse", `${voltarPara}^{commit}`);
  try { git("merge-base", "--is-ancestor", alvo, ponta); } catch { parar(`esse commit não pertence à branch ${BRANCH}.`); }
  await confirmar(`VOLTAR ${alvo.slice(0, 7)}`, `A branch ${BRANCH} voltará ao conteúdo de ${alvo.slice(0, 7)}, e a Hostinger pode publicar em seguida.`);
  const commit = git("commit-tree", git("rev-parse", `${alvo}^{tree}`), "-p", ponta, "-m", `Volta ao conteúdo de ${alvo.slice(0, 7)}`);
  git("push", "origin", `${commit}:${REF_REMOTA}`);
  console.log(`\nBranch ${BRANCH} atualizada: ${commit.slice(0, 7)}. Limpe o cache do CDN no hPanel e confira o site.`);
}

async function publicar() {
  if (!simular) exigirMainLimpa();

  const node = process.execPath;
  const astro = "node_modules/astro/bin/astro.mjs";
  const falhas = [];
  if (!rodar("Vídeos iguais aos aprovados", node, ["scripts/verificar-videos.mjs"])) parar("vídeos diferentes dos aprovados.");
  if (!rodar("Código", node, [astro, "check"])) parar("erro na verificação do código.");

  // Roda as duas travas mesmo que a primeira falhe, para mostrar tudo o que falta de uma vez
  if (!rodar("Build definitivo: conteúdo médico, privacidade e imagens", node, [astro, "build"], { PUBLIC_REVISAO: "0" })) {
    falhas.push("conteúdo provisório: o build definitivo falhou (ver a mensagem acima)");
  }
  if (!rodar("Redirecionamentos", node, ["scripts/gerar-htaccess.mjs", "--final"])) {
    falhas.push("redirecionamentos pendentes ou bloqueados em docs/redirecionamentos.csv");
  }
  if (falhas.length) parar(`\n  - ${falhas.join("\n  - ")}\nA dist/ não serve para a prévia agora: rode npm run build para gerar a versão de revisão.`);

  const { erros, rel, bytes } = conferirDist();
  if (erros.length) parar(`\n  - ${erros.join("\n  - ")}`);

  const origem = git("rev-parse", "HEAD");
  console.log(`\nTravas ok. Origem: ${origem.slice(0, 7)}. ${rel.length} arquivos, ${(bytes / 1048576).toFixed(1)} MB.`);
  if (simular) { console.log("Simulação: nada foi gravado."); return; }

  await confirmar(`PUBLICAR ${origem.slice(0, 7)}`, `Confirme só com as aprovações registradas em docs/PUBLICACAO.md.\nSe a Hostinger estiver conectada a ${BRANCH}, este envio pode ir ao ar em seguida.`);
  const pai = pontaRemota();
  const commit = criarCommit(pai, `Site gerado a partir de ${origem.slice(0, 7)}`);
  conferirCommit(commit, rel);
  git("push", "origin", `${commit}:${REF_REMOTA}`);
  console.log(`\nBranch ${BRANCH} atualizada: ${commit.slice(0, 7)}.`);
}

if (iVoltar >= 0) {
  if (!voltarPara) parar("informe o commit: npm run publicacao -- --voltar <commit>");
  await voltar();
} else {
  await publicar();
}
