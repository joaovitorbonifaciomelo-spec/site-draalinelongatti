# Publicação: GitHub → build Astro → Hostinger

Situação: fluxo preparado, WordPress intacto no ar. **Produção bloqueada**, e o bloqueio é intencional.

## Como o fluxo funciona

| Workflow | Quando roda | O que faz |
|---|---|---|
| `Verificar` | Todo push | Confere os vídeos, o código, o build de revisão, a tabela de redirecionamentos e informa a situação da trava. Não usa credenciais |
| `Testar conexão com a Hostinger` | Só à mão, em Actions | Valida a host key, testa o SSH só com leitura e simula o envio. Não tem opção de gravar |
| `Publicar na Hostinger` | Só à mão, em Actions | Gera o site e envia por SSH/rsync. Por padrão apenas simula |

Não existe publicação automática por push. O plano gratuito do GitHub não oferece revisores em repositório privado, então as travas ficam no próprio workflow.

## Travas que protegem o site

| Trava | Efeito |
|---|---|
| Conteúdo provisório | O build definitivo falha enquanto existir qualquer item marcado em `src/data/site.ts` |
| Redirecionamentos | `--final` falha enquanto houver linha `pendente` ou `bloqueado` em `docs/redirecionamentos.csv` |
| Vídeos | O build falha se os dois `.mp4` faltarem ou forem diferentes dos aprovados |
| `PRODUCAO_LIBERADA` | Sem o valor `sim`, a produção não roda |
| Confirmação | Envio real à produção exige digitar `SUBSTITUIR WORDPRESS`, a partir de `main` |
| `wp-config.php` no destino | Envio real é recusado enquanto o WordPress estiver na pasta |
| Sem `--delete` em produção | O envio não apaga nada no servidor |
| Homologação | Recusa o envio se a URL não responder 401 (senha) ou se o caminho for a raiz do site |

**Nenhuma trava deve ser desativada para publicar.** Para liberar, resolva a causa.

## Configuração no GitHub e na Hostinger

Em **Settings → Secrets and variables → Actions**:

| Tipo | Nome | Conteúdo |
|---|---|---|
| Secret | `HOSTINGER_SSH_HOST` | Em hPanel → Avançado → Acesso SSH |
| Secret | `HOSTINGER_SSH_PORTA` | Na mesma tela. A documentação da Hostinger indica 65002 em hospedagem compartilhada |
| Secret | `HOSTINGER_SSH_USUARIO` | Na mesma tela |
| Secret | `HOSTINGER_SSH_CHAVE` | Chave privada criada só para este deploy, sem senha |
| Secret | `HOSTINGER_KNOWN_HOSTS` | Linha ED25519 de `ssh-keyscan`, com a fingerprint conferida na tela de Acesso SSH do hPanel |
| Secret | `HOSTINGER_CAMINHO_PRODUCAO` | Normalmente `/home/<usuário>/domains/draalinelongatti.com/public_html` |
| Secret | `HOSTINGER_CAMINHO_HOMOLOGACAO` | Não criar agora. Homologação externa não autorizada enquanto as autorizações de imagem estiverem pendentes |
| Variável | `URL_HOMOLOGACAO` | Não criar agora, pelo mesmo motivo |
| Variável | `PRODUCAO_LIBERADA` | Só no dia da troca: `sim`. Depois, apagar |

No hPanel: ativar o SSH e cadastrar a chave pública. Guardar a chave privada em `G:\Meu Drive\COFRE - PRIVADO\Chaves de sistemas\site-aline\`. Nunca colocá-la no repositório.

### Identidade do servidor

A fingerprint oficial é a que a Hostinger mostra na tela de Acesso SSH do hPanel. Ela precisa ser igual à de `ssh-keyscan` antes de o resultado ir para `HOSTINGER_KNOWN_HOSTS`. Se forem diferentes, parar e falar com a Hostinger. Os dois workflows usam `StrictHostKeyChecking=yes`, e isso não deve ser desligado. Se a host key mudar depois, conferir a nova fingerprint no hPanel antes de trocar o secret.

### Teste de conexão

`Testar conexão com a Hostinger` confere que um servidor desconhecido é recusado, que a pasta existe e tem o WordPress, e simula o envio com `--dry-run`, sem `--delete`. O build usado é o de revisão, só para comparar a lista de arquivos, porque o definitivo continua travado. Passar neste teste não libera a publicação.

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
- [ ] Autorização da homologação com senha, se for usada: o filme só estava autorizado para prévia local

## Procedimento de substituição do WordPress

Fazer em horário de baixo movimento, com tudo acima resolvido. Tempo fora do ar esperado: alguns minutos.

**Antes do dia**

1. Conferir que o backup tem arquivos e banco de dados, e que pode ser restaurado. Registrar onde está.
2. Definir `PRODUCAO_LIBERADA = sim` e rodar `Publicar na Hostinger` com `producao` e `simular`. O build definitivo precisa passar. Depois, apagar a variável até o dia da troca.
3. Baixar a cópia atual do `.htaccess` da raiz e listar os e-mails do domínio. A troca não mexe em DNS nem em e-mail, mas é bom ter o registro.
4. Reduzir o que estiver agendado no WordPress e anotar os plugins com tarefas externas.

**Na troca**

1. Em `main`, definir `PRODUCAO_LIBERADA = sim`.
2. Por SSH ou gerenciador de arquivos, **mover** o WordPress para fora da raiz. Não apagar:
   ```
   cd ~/domains/draalinelongatti.com
   mkdir wordpress-arquivo-AAAA-MM-DD
   mv public_html/* public_html/.htaccess wordpress-arquivo-AAAA-MM-DD/
   ```
   Conferir antes se há outros arquivos ocultos ou de verificação na raiz, que precisem ficar.
3. Rodar `Publicar na Hostinger` com `producao`, `enviar` e a confirmação `SUBSTITUIR WORDPRESS`.
4. Limpar o cache do CDN no hPanel: o domínio passa pelo CDN da Hostinger.

**Conferência imediata**

- [ ] O passo "Conferir produção" do workflow passou
- [ ] `/`, `/sobre/`, `/tratamentos/`, `/contato/` e `/politicas-privacidade/` abrem por HTTPS, em celular e computador
- [ ] O filme toca e volta ao início
- [ ] `https://www.` e `http://` redirecionam para `https://draalinelongatti.com/`
- [ ] Cada linha `301` e `410` da tabela responde como previsto, e uma URL inventada mostra a página 404
- [ ] `robots.txt` libera o site e o `sitemap.xml` lista só o que foi liberado; as páginas não têm `noindex`

**Depois**

1. Apagar `PRODUCAO_LIBERADA`.
2. Enviar o sitemap novo ao Google Search Console.
3. Manter a pasta do WordPress e o banco de dados por um período definido por João, e só então removê-los. Até lá, eles não ficam acessíveis pela web, porque estão fora de `public_html`.

## Como voltar atrás

1. Mover o site novo para fora: `mkdir site-novo-AAAA-MM-DD && mv public_html/* public_html/.htaccess site-novo-AAAA-MM-DD/`.
2. Devolver o WordPress: `mv wordpress-arquivo-AAAA-MM-DD/* wordpress-arquivo-AAAA-MM-DD/.htaccess public_html/`.
3. Limpar o cache do CDN e conferir o site antigo.

O banco de dados não é alterado na troca, então não precisa ser restaurado.
