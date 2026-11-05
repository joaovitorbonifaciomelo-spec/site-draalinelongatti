# Publicação: integração Git nativa da Hostinger

Decisão de João: deploy só pela integração Git do hPanel, sem SSH e sem GitHub Actions de deploy. O workflow `Verificar` continua: ele não publica nem usa credenciais.

**Situação: bloqueada, de propósito.** A branch `publicacao` só passa a existir no primeiro envio aprovado.

## Como funciona

| Branch | Conteúdo | Vai ao ar? |
|---|---|---|
| `main` | Desenvolvimento | Não. **Nunca selecionar no hPanel**: publicaria o código, os estudos e os documentos |
| `publicacao` | Só o site gerado, na raiz | Sim, assim que a Hostinger receber o envio |

A Hostinger não faz build nessa integração: o que está na branch é o que vai ao ar.

## Travas

| Trava | Efeito |
|---|---|
| Conteúdo médico, privacidade e imagens | O build definitivo falha enquanto houver item marcado como provisório em `src/data/site.ts`, inclusive o filme, o retrato e o corredor |
| Redirecionamentos | Falha com linha `pendente` ou `bloqueado` em `docs/redirecionamentos.csv` |
| Vídeos | Falha se os dois `.mp4` forem diferentes dos aprovados, antes ou depois do build |
| Conferência do resultado | Falha se houver marca provisória, `noindex` fora da 404, `robots.txt` bloqueando ou arquivo que não é do site |
| Origem | O envio real só sai da `main` limpa e igual à do GitHub |
| Confirmação | O envio real exige digitar `PUBLICAR <commit>` em um terminal |

**Nenhuma trava deve ser desativada para publicar.** Para liberar, resolva a causa. Só retire a marca de provisório de um item depois da aprovação correspondente.

O plano gratuito do GitHub não protege branch em repositório privado. Por isso, nunca envie nada à `publicacao` por outro caminho.

## Como atualizar a publicação

1. Com as pendências abaixo resolvidas e aprovadas, deixe tudo em commit na `main` e envie ao GitHub.
2. Confira o resultado sem gravar nada: `npm run publicacao -- --simular`
3. Envie, digitando a confirmação pedida: `npm run publicacao`
4. Limpe o cache do CDN no hPanel e faça a conferência abaixo.

## Configuração no hPanel

Só no dia combinado, depois de existir a branch `publicacao` aprovada:

- Repositório: `joaovitorbonifaciomelo-spec/site-draalinelongatti`
- Branch: `publicacao`. Selecionar e implantar coloca o site no ar
- Diretório: `public_html`
- Auto-deployment: desligar, se João preferir publicar só pelo botão de deploy

A documentação da Hostinger não esclarece se o deploy apaga arquivos que não estão no repositório, se deixa `.git` acessível e se respeita nosso `.htaccess`. Conferir no primeiro deploy.

## O que falta para o build definitivo

### Conteúdo, com a Dra. Aline e a revisão CFM

Cada item trava o build em `src/data/site.ts`:

- [ ] CRM, RQE, telefone, horário, e-mail e endereço
- [ ] Textos do hero, Cap. 01 e Cap. 02
- [ ] Índice do Cap. 03 e os 20 itens de `/tratamentos/`, com a classificação proposta e o texto de Câncer de Pele
- [ ] Formação, associações e declaração do Cap. 04, com a assinatura
- [ ] Textos de `/sobre/`, inclusive as paráfrases (`docs/CONTEUDO-SOBRE.md`)
- [ ] Textos de apoio de `/tratamentos/` e `/contato/`

### Imagens e autorizações

- [ ] Filme do hero: pessoa identificável, certificados, equipamentos, letreiro e porta-retratos
- [ ] Retrato da Dra. Aline: autoria, autorização de uso e se é recente
- [ ] Corredor de luz do Cap. 05: confirmar que é da clínica e o uso

### Agendamento e dados com João

- [ ] WhatsApp (62) 3157-3270 recebe agendamentos? Se sim, `WHATSAPP_CONFIRMADO = true`
- [ ] Grafia do prédio: "Órion Business & Health Complex" ou "Edifício Óriom Complex"
- [ ] O e-mail da clínica é o canal certo para pacientes?

### Privacidade, com revisão jurídica

- [ ] Política de Privacidade (`docs/POLITICA-PRIVACIDADE.md`): controlador, operador, finalidades, retenção, compartilhamento, direitos, registros do servidor e vigência
- [ ] Análise de visitas: o site antigo carrega o Google Tag Manager; o novo não

### URLs, em `docs/redirecionamentos.csv`

- [ ] `/depoimentos/`: `/sobre/`, `/contato/` ou 410
- [ ] `/artigos/` e os três artigos, com `/category/*`: publicar revisados na mesma URL, ou 410

### Técnico

- [ ] Testes em Safari, iPhone e Android reais, inclusive a fluidez do vídeo a 60 fps
- [ ] Contraste medido e desempenho (LCP, CLS, INP)
- [ ] Auditoria completa de teclado e leitor de tela

## Conferência depois de publicar

- [ ] `/`, `/sobre/`, `/tratamentos/`, `/contato/` e `/politicas-privacidade/` abrem por HTTPS, em celular e computador
- [ ] O filme toca e volta ao início
- [ ] `/.git/HEAD` não abre
- [ ] `https://www.` e `http://` redirecionam para `https://draalinelongatti.com/`
- [ ] Cada linha `301` e `410` da tabela responde como previsto, e uma URL inventada mostra a página 404
- [ ] `robots.txt` libera o site e o `sitemap.xml` lista só o que foi liberado; as páginas não têm `noindex`

Depois: enviar o sitemap ao Google Search Console.

## Como voltar atrás

- **Para uma versão anterior do site novo:** veja os commits em `git log origin/publicacao --oneline` e rode `npm run publicacao -- --voltar <commit>`. Depois, limpe o cache do CDN.
- **Para parar de publicar:** desligue o Auto-deployment ou desconecte o repositório no hPanel. O que já está no ar continua no ar.
- **WordPress antigo:** João o removeu no hPanel, e o domínio passou a mostrar a página "Em breve". Não será restaurado, salvo nova decisão de João. Só o backup permitiria voltar.
