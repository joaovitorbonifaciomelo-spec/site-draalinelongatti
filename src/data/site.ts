/* Fonte única dos dados e textos do site.
   `provisorio` = origem de um conteúdo ainda não aprovado (ver src/lib/provisorio.ts). */
import { REVISAO } from "../lib/provisorio";
import type { Conteudo } from "../lib/provisorio";

const SITE_ATUAL = (p: string) => `texto do site atual (${p}), a revisar`;
const REGISTRO = "dado do site atual, a confirmar com a Dra. Aline";

/* Agendamento: destino configurável. Mude para true quando João confirmar que o número atende agendamentos.
   Isso troca todos os botões "Agendar consulta" do site e retira a marca de provisório. */
const WHATSAPP_CONFIRMADO = false;
const WHATSAPP = "https://wa.me/556231573270";

export const rotas = {
  nutrologia: "/tratamentos/#nutrologia",
  dermatologia: "/tratamentos/#dermatologia",
  tratamentos: "/tratamentos/",
  medica: "/sobre/",
  clinica: "https://clinicalongattivitae.com.br/",
  artigos: "/artigos/",
  contato: "/contato/",
  privacidade: "/politicas-privacidade/",
  agendar: WHATSAPP_CONFIRMADO ? WHATSAPP : "/contato/",
};

export const navegacao = [
  { nome: "Nutrologia", href: rotas.nutrologia },
  { nome: "Dermatologia", href: rotas.dermatologia },
  { nome: "Tratamentos", href: rotas.tratamentos },
  { nome: "A médica", href: rotas.medica },
  { nome: "Contato", href: rotas.contato },
];

/* O menu completo acrescenta Artigos. Depoimentos fica de fora: ver docs/PLANO-DE-URLS.md. */
/* Na versão publicada, Artigos só aparece quando houver artigo aprovado: nunca uma página vazia. */
const ARTIGOS_APROVADOS = false;
export const navegacaoCompleta = [...navegacao.slice(0, 4), ...(REVISAO || ARTIGOS_APROVADOS ? [{ nome: "Artigos", href: rotas.artigos }] : []), navegacao[4]];

export const registros: Conteudo<{ rotulo: string; texto: string }[]> = {
  valor: [
    { rotulo: "Registro", texto: "CRM 13210-GO" },
    { rotulo: "Nutrologia", texto: "RQE 11992" },
    { rotulo: "Dermatologia", texto: "RQE 15427" },
  ],
  provisorio: REGISTRO,
};

export const agendamento: Conteudo<{ href: string }> = {
  valor: { href: rotas.agendar },
  provisorio: WHATSAPP_CONFIRMADO ? undefined : "destino pretendido: WhatsApp (62) 3157-3270, a confirmar se está ativo para agendamento. Até lá, leva a /contato/",
};

const PREDIO = "Órion Business & Health Complex";
const LOGRADOURO = "Av. Portugal, 1148, Sala B2406";
const BAIRRO = "Setor Marista, Goiânia";

export const contato: Conteudo<{
  telefone: string; telefoneHref: string; horario: string; endereco: string; email: string;
  predio: string; logradouro: string; bairro: string; mapa: string;
}> = {
  valor: {
    telefone: "(62) 3157-3270",
    telefoneHref: "tel:+556231573270",
    horario: "Segunda a sexta, 8h às 18h",
    endereco: "Av. Portugal, 1148 · Sala B2406 · Setor Marista · Goiânia",
    predio: PREDIO,
    logradouro: LOGRADOURO,
    bairro: BAIRRO,
    mapa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${PREDIO}, Av. Portugal, 1148, ${BAIRRO}`)}`,
    email: "clinicalongattivitae@gmail.com",
  },
  provisorio: "dado do site atual, a confirmar",
};

export const descricaoSite: Conteudo = {
  valor: "Dra. Aline Longatti: Nutrologia e Dermatologia em Goiânia. CRM 13210-GO · RQE Nutrologia 11992 · RQE Dermatologia 15427.",
  provisorio: REGISTRO,
};

/* Cap. 04: tudo vem de /sobre/ no site atual. Nada foi acrescentado; o que o site não informa fica sem informar. */
const FORMACAO = "dado do site atual (/sobre/), a confirmar com a Dra. Aline";
export const medica = {
  retrato: {
    valor: { src: "/media/medica-retrato.webp", largura: 665, altura: 1540, alt: "Dra. Aline Longatti sorrindo, de cabelo longo e roupa branca de renda, com uma das mãos junto ao ombro." },
    provisorio: "foto do site atual: confirmar autoria, autorização de uso e se é recente",
  } as Conteudo<{ src: string; largura: number; altura: number; alt: string }>,
  origem: {
    valor: { ano: "2006", titulo: "Graduação em Medicina", onde: "Faculdade de Medicina de Barbacena-MG" },
    provisorio: FORMACAO,
  } as Conteudo<{ ano: string; titulo: string; onde: string }>,
  /* O ano só aparece onde o site atual informa */
  nutrologia: {
    valor: [
      { titulo: "Especialista em Nutrologia", onde: "Associação Brasileira de Nutrologia (ABRAN)" },
      { titulo: "Membro titular", onde: "ABRAN, 2017" },
    ],
    provisorio: FORMACAO,
  } as Conteudo<{ titulo: string; onde: string }[]>,
  dermatologia: {
    valor: [
      { titulo: "Especialista em Dermatologia", onde: "Sociedade Brasileira de Dermatologia (SBD)" },
      { titulo: "Membro titular", onde: "SBD, 2021" },
      { titulo: "Membro titular", onde: "Sociedade Brasileira de Cirurgia Dermatológica (SBCD)" },
    ],
    provisorio: FORMACAO,
  } as Conteudo<{ titulo: string; onde: string }[]>,
  /* Trecho literal de /sobre/. O itálico é só da composição */
  fala: {
    valor: { antes: "Minha forma de trabalho é individualizada e personalizada ", grifo: "para cada paciente", depois: " e necessidade específica." },
    provisorio: "trecho literal de /sobre/, a aprovar pela Dra. Aline",
  } as Conteudo<{ antes: string; grifo: string; depois: string }>,
};

/* /sobre/: textos e citações. Prêmios e Medicina Estética estão fora até a validação. Status e originais em docs/CONTEUDO-SOBRE.md */
const SOBRE_LITERAL = "texto literal de /sobre/ no site atual, a aprovar pela Dra. Aline e pela revisão CFM";
const SOBRE_PARAFRASE = "paráfrase provisória de /sobre/ (não é citação), a validar pela Dra. Aline e pela revisão CFM";
export const sobre = {
  lema: {
    valor: { antes: "Compromisso com a saúde, estética e qualidade de vida", grifo: "de cada paciente", depois: "." },
    provisorio: SOBRE_LITERAL,
  } as Conteudo<{ antes: string; grifo: string; depois: string }>,
  vozes: [
    {
      lado: "n", nome: "Nutrologia",
      pratica: {
        valor: "Faz tratamentos de obesidade, performance esportiva e transtornos alimentares.",
        provisorio: SOBRE_PARAFRASE,
      } as Conteudo,
      definicao: {
        valor: "Especialidade médica abrangente, voltada à saúde, ao equilíbrio nutricional e endócrino, à obesidade e à síndrome metabólica e suas repercussões.",
        provisorio: SOBRE_PARAFRASE,
      } as Conteudo,
    },
    {
      lado: "d", nome: "Dermatologia",
      pratica: {
        valor: "No consultório, a maior parte dos casos envolve doenças de pele, pelo e unhas.",
        provisorio: SOBRE_PARAFRASE,
      } as Conteudo,
      definicao: {
        valor: "Especialidade médica cuja área de conhecimento se concentra no diagnóstico, prevenção e tratamento de doenças e afecções relacionadas à pele, pelos, mucosas, cabelo e unhas.",
        provisorio: SOBRE_LITERAL,
      } as Conteudo,
    },
  ],
  /* A única citação da página: a frase está inteira na fonte */
  sempre: {
    valor: { antes: "Sempre levando em consideração o equilíbrio nutricional, o bom funcionamento do organismo e", grifo: "as necessidades de cada paciente", depois: "." },
    provisorio: SOBRE_LITERAL,
  } as Conteudo<{ antes: string; grifo: string; depois: string }>,
};

/* Cap. 05: só a passagem para a clínica. A experiência institucional fica no futuro site da Longatti Vitae */
export const clinica = {
  imagem: {
    valor: {
      src: "/media/clinica-corredor.webp", largura: 1920, altura: 1080,
      srcMobile: "/media/clinica-corredor-vertical.webp", largMobile: 720, altMobile: 1280,
      alt: "Corredor com linhas de luz nas paredes e no teto, convergindo para uma passagem escura.",
    },
    provisorio: "quadro copiado do filme do hero: confirmar que o corredor é da clínica e passar pela mesma revisão de publicação",
  } as Conteudo<{ src: string; largura: number; altura: number; srcMobile: string; largMobile: number; altMobile: number; alt: string }>,
  atendimento: {
    valor: { area: "Nutrologia e Dermatologia", local: "Setor Marista, Goiânia" },
    provisorio: "dado do site atual e do letreiro da clínica, a confirmar",
  } as Conteudo<{ area: string; local: string }>,
};

export const hero = {
  /* Título aprovado: "A saúde tem muitas camadas." (está no markup, por causa do itálico e da quebra) */
  rotulo: "Nutrologia e Dermatologia · Goiânia",
  lead: {
    valor: "Atendimento individualizado e personalizado para cada paciente e necessidade específica.",
    provisorio: SITE_ATUAL("/sobre/"),
  } as Conteudo,
};

/* Pendência de publicação: o filme tem pessoa identificável. Enquanto isto existir, o build final falha. */
export const filmeHero: Conteudo = {
  valor: "filme completo do hero (public/media/hero-*.mp4)",
  provisorio: "filme com pessoa identificável, certificados, equipamentos e letreiro: autorizado só para a prévia local; publicação depende da revisão de privacidade e de publicidade médica",
};

export const manifesto = {
  rotulo: "01 — Além do primeiro olhar",
  /* A frase grande vem da mensagem central da direção criativa. Sem assinatura: não é fala da médica. */
  frase: { valor: "O cuidado merece olhar para todas elas.", provisorio: "mensagem central proposta na direção criativa, a aprovar" } as Conteudo,
  apoio: {
    valor: "Cada paciente chega com uma história própria. Entender essa história é onde o cuidado começa.",
    provisorio: "proposta de texto da Bonifácio, a aprovar",
  } as Conteudo,
};

export type Lado = "n" | "d";

export const especialidades: {
  lado: Lado; nome: string; href: string; link: string;
  descricao: Conteudo;
}[] = [
  {
    lado: "n",
    nome: "Nutrologia",
    href: rotas.nutrologia,
    link: "Explorar Nutrologia",
    descricao: {
      valor: "Equilibrar o metabolismo, corrigir deficiências nutricionais e promover saúde, performance e longevidade, com abordagem médica precisa e personalizada.",
      provisorio: SITE_ATUAL("/tratamentos/"),
    },
  },
  {
    lado: "d",
    nome: "Dermatologia",
    href: rotas.dermatologia,
    link: "Explorar Dermatologia",
    descricao: {
      valor: "Doenças e afecções da pele, pelos, mucosas, cabelo e unhas, além de procedimentos médicos estéticos, cirúrgicos e oncológicos.",
      provisorio: SITE_ATUAL("/sobre/"),
    },
  },
];

/* Cap. 03: só tratamentos documentados em /tratamentos/ do site atual (referencias/CONTEUDO-SITE-ATUAL.md).
   Nomes como estão lá. Descrições encurtadas para retirar promessa de resultado: todas a revisar (CFM).
   "Medicina Integrativa" está fora até validação: o texto original está em docs/PENDENCIAS-PUBLICACAO.md.
   `tipo` é a organização proposta, ainda sem validação médica: ver docs/ORGANIZACAO-CAP03.md. */
const ORIGEM_INDICE = "texto do site atual (/tratamentos/), encurtado para retirar promessa; a revisar pelas regras do CFM";
export type TipoItem = "condicao" | "procedimento" | "area";
export type ItemIndice = { id: string; nome: string; tipo: TipoItem; descricao: string };
export const tiposIndice: { id: TipoItem; nome: string }[] = [
  { id: "condicao", nome: "Condições clínicas" },
  { id: "procedimento", nome: "Procedimentos" },
  { id: "area", nome: "Áreas de atendimento" },
];
export const indice: {
  rotulo: string; apoio: Conteudo; instrucaoMouse: string; instrucaoToque: string; origem: string; origemTipos: string;
  /* A Home mostra estes 8. Os 20 ficam em `grupos`, para /tratamentos/ (decisão de João). */
  home: string[];
  grupos: { id: string; nome: string; itens: ItemIndice[] }[];
} = {
  rotulo: "03 — Medicina em detalhes",
  /* Texto e instrução de uso ficam separados: a instrução só existe onde há o painel. */
  apoio: { valor: "Dos cuidados clínicos aos procedimentos, conheça as diferentes possibilidades de atendimento.", provisorio: "texto aprovado por João para teste, ainda provisório; a revisar pelas regras do CFM" },
  instrucaoMouse: "Role a lista ou aponte um nome para ler a descrição",
  instrucaoToque: "Role a lista para ler a descrição de cada nome",
  origem: ORIGEM_INDICE,
  origemTipos: "organização proposta pela Bonifácio, a validar pela Dra. Aline; no site atual os grupos eram só \"Principais tratamentos\" e \"Áreas atendidas\"",
  home: ["obesidade", "hipertrofia", "transtornos-da-alimentacao", "deficiencias-nutricionais", "manchas-e-melasma", "queda-de-cabelo", "tratamentos-esteticos-faciais", "cirurgia-da-pele"],
  grupos: [
    {
      id: "nutrologia",
      nome: "Nutrologia",
      itens: [
        { id: "sindromes-de-ma-absorcao", nome: "Síndromes de Má Absorção", tipo: "condicao", descricao: "Investigação e tratamento de alterações intestinais que impedem a absorção adequada de nutrientes." },
        { id: "obesidade", nome: "Obesidade", tipo: "condicao", descricao: "Tratamento médico voltado para controle metabólico e prevenção de riscos." },
        { id: "deficiencias-nutricionais", nome: "Deficiências Nutricionais", tipo: "condicao", descricao: "Diagnóstico e reposição de vitaminas, minerais e nutrientes essenciais ao organismo." },
        { id: "transtornos-nutricionais", nome: "Transtornos Nutricionais", tipo: "condicao", descricao: "Avaliação e manejo de desequilíbrios nutricionais que afetam metabolismo, energia e bem-estar." },
        { id: "transtornos-da-alimentacao", nome: "Transtornos da Alimentação", tipo: "condicao", descricao: "Apoio clínico em quadros como compulsão alimentar, bulimia e anorexia, com foco em saúde e estabilidade metabólica." },
        { id: "doencas-nutricionais-e-metabolicas", nome: "Doenças Nutricionais e Metabólicas", tipo: "condicao", descricao: "Tratamentos voltados para condições que impactam metabolismo, composição corporal e funcionamento hormonal." },
        { id: "hipersensibilidade-alimentar", nome: "Hipersensibilidade Alimentar", tipo: "condicao", descricao: "Identificação e controle de reações alimentares que causam desconfortos, inflamações e alterações digestivas." },
        { id: "intolerancia-a-lactose", nome: "Intolerância à Lactose", tipo: "condicao", descricao: "Orientação e estratégias para reduzir sintomas e ajustar a alimentação." },
        { id: "emagrecimento", nome: "Emagrecimento", tipo: "area", descricao: "Acompanhamento médico para redução de peso, com foco em saúde e equilíbrio." },
        { id: "hipertrofia", nome: "Hipertrofia", tipo: "area", descricao: "Estratégias clínico-nutricionais para ganho de massa magra, desempenho e recuperação muscular." },
        { id: "nutrologia-vegetariana", nome: "Nutrologia Vegetariana", tipo: "area", descricao: "Acompanhamento para ajustar nutrientes e prevenir deficiências em dietas vegetarianas e veganas." },
      ],
    },
    {
      id: "dermatologia",
      nome: "Dermatologia",
      itens: [
        { id: "acne", nome: "Acne", tipo: "condicao", descricao: "Tratamento clínico personalizado para controle da acne e prevenção de marcas e inflamações." },
        { id: "onicomicose", nome: "Onicomicose (fungos nas unhas)", tipo: "condicao", descricao: "Terapia médica para infecções fúngicas das unhas." },
        { id: "queda-de-cabelo", nome: "Queda de Cabelo", tipo: "condicao", descricao: "Avaliação das causas e abordagem médica para queda, afinamento e desordens do couro cabeludo." },
        { id: "manchas-e-melasma", nome: "Manchas e Melasma", tipo: "condicao", descricao: "Tratamentos para melasma, hiperpigmentações, danos solares e irregularidades de tom." },
        { id: "cancer-de-pele", nome: "Câncer de Pele", tipo: "condicao", descricao: "Diagnóstico precoce e encaminhamento para manejo e tratamento adequado das lesões." },
        { id: "cirurgia-da-pele", nome: "Cirurgia da Pele", tipo: "procedimento", descricao: "Procedimentos dermatológicos para remoção de lesões, nevus e tratamentos clínicos específicos." },
        { id: "tratamentos-esteticos-faciais", nome: "Tratamentos Estéticos Faciais", tipo: "procedimento", descricao: "Protocolos personalizados de rejuvenescimento e estímulo de colágeno." },
        { id: "envelhecimento-facial", nome: "Envelhecimento Facial", tipo: "area", descricao: "Cuidados com firmeza, vitalidade e qualidade da pele ao longo do tempo." },
        { id: "rugas-de-expressao", nome: "Rugas de Expressão", tipo: "area", descricao: "Procedimentos para suavizar linhas de expressão." },
      ],
    },
  ],
};

/* Sitemap público: só o que está liberado. Em revisão ele sai vazio. Provisórios não entram */
const ROTAS_DA_PUBLICACAO: { rota: string; publicar: boolean }[] = [
  { rota: "/", publicar: true },
  { rota: rotas.medica, publicar: true },
  { rota: rotas.tratamentos, publicar: true },
  { rota: rotas.contato, publicar: true },
  { rota: rotas.artigos, publicar: ARTIGOS_APROVADOS },
  { rota: rotas.privacidade, publicar: false },
];
export const rotasPublicas = ROTAS_DA_PUBLICACAO.filter(r => r.publicar).map(r => r.rota);

/* Estrutura da Política de Privacidade. Sem cláusula legal: só fatos do código e títulos a preencher (docs/POLITICA-PRIVACIDADE.md) */
const PRIVACIDADE = "estrutura sem validade legal: depende da médica, da clínica, da hospedagem e da revisão jurídica";
export const privacidade = {
  aviso: { valor: "Esta é uma estrutura em preparação, não uma política válida. Ela reúne só o que já foi confirmado no código deste site.", provisorio: PRIVACIDADE } as Conteudo,
  fatos: {
    valor: [
      { titulo: "Sem formulário", texto: "Nenhuma página pede nem envia dados por formulário." },
      { titulo: "Sem cookies próprios", texto: "O código do site não cria cookies." },
      { titulo: "Sem rastreamento no código", texto: "Não há ferramenta de análise de visitas ou de publicidade no código do site." },
      { titulo: "Arquivos do próprio site", texto: "Fontes, imagens e vídeos são servidos pelo próprio site." },
      { titulo: "Preferência na sessão", texto: "Se a pessoa pausa o vídeo, o navegador guarda essa escolha só durante a sessão, no próprio aparelho." },
      { titulo: "Preferências do aparelho", texto: "Reduzir movimento e economia de dados são lidos no aparelho para ajustar o vídeo. O código não envia essas informações." },
    ],
    provisorio: PRIVACIDADE,
  } as Conteudo<{ titulo: string; texto: string }[]>,
  servicos: {
    valor: [
      { titulo: "WhatsApp, telefone e e-mail", texto: "Abrem o aplicativo escolhido pela pessoa, somente ao clicar." },
      { titulo: "Google Maps", texto: "Abre o endereço do consultório no serviço de mapas, somente ao clicar." },
      { titulo: "Site da clínica", texto: "O link leva a um site separado, que tem regras próprias." },
    ],
    provisorio: PRIVACIDADE,
  } as Conteudo<{ titulo: string; texto: string }[]>,
  pendencias: {
    valor: [
      { titulo: "Controlador e contato para privacidade", depende: "médica, clínica e revisão jurídica" },
      { titulo: "Operador", depende: "clínica, hospedagem e revisão jurídica" },
      { titulo: "Finalidades e bases legais", depende: "médica, clínica e revisão jurídica" },
      { titulo: "Prazos de retenção", depende: "médica, clínica e revisão jurídica" },
      { titulo: "Compartilhamento de dados", depende: "médica, clínica e revisão jurídica" },
      { titulo: "Direitos do titular", depende: "revisão jurídica" },
      { titulo: "Registros do servidor", depende: "hospedagem e revisão jurídica" },
      { titulo: "Análise de visitas", depende: "clínica e revisão jurídica" },
      { titulo: "Vigência e redação final", depende: "médica e revisão jurídica" },
    ],
    provisorio: PRIVACIDADE,
  } as Conteudo<{ titulo: string; depende: string }[]>,
};

/* /contato/: só canais documentados. O WhatsApp é o destino pretendido, ainda sem confirmação */
export const contatoPagina = {
  lead: { valor: "Escolha o canal mais simples para você.", provisorio: "texto da Bonifácio, a validar" } as Conteudo,
  whatsapp: {
    valor: { href: WHATSAPP },
    provisorio: "número do site atual: confirmar que o WhatsApp está ativo para agendamento",
  } as Conteudo<{ href: string }>,
};

/* /tratamentos/: os textos de cada item ficam em `indice`. A classificação é proposta, a validar (docs/CONTEUDO-TRATAMENTOS.md) */
const TRAT_BONIFACIO = "texto da Bonifácio para orientar a leitura, sem afirmação médica; a validar pela Dra. Aline e pela revisão CFM";
export const tiposTratamento: Conteudo<{ tipo: "condicao" | "procedimento" | "area"; nome: string; explica: string }[]> = {
  valor: [
    { tipo: "condicao", nome: "Condições clínicas", explica: "Doenças e quadros de saúde que são avaliados e acompanhados." },
    { tipo: "procedimento", nome: "Tratamentos e procedimentos", explica: "Intervenções médicas específicas." },
    { tipo: "area", nome: "Áreas de atendimento", explica: "Objetivos de cuidado e acompanhamento que não são, por si, uma doença." },
  ],
  provisorio: TRAT_BONIFACIO,
};
export const tratamentosPagina = {
  lead: { valor: "Condições clínicas, áreas de atendimento, tratamentos e procedimentos, organizados para você encontrar o seu assunto.", provisorio: TRAT_BONIFACIO } as Conteudo,
  fim: { valor: { titulo: "Não encontrou o seu assunto?", texto: "Cada caso precisa de avaliação médica. A consulta é o lugar para essa conversa." }, provisorio: TRAT_BONIFACIO } as Conteudo<{ titulo: string; texto: string }>,
  aviso: { valor: "Conteúdo informativo. Não substitui a avaliação médica.", provisorio: TRAT_BONIFACIO } as Conteudo,
};

/* Rotas atuais mantidas como páginas em construção. /depoimentos/ fica fora de propósito. */
export const paginasInternas: { slug: string; titulo: string; ancoras?: { id: string; nome: string; menor?: boolean }[] }[] = [
  ...(REVISAO || ARTIGOS_APROVADOS ? [{ slug: "artigos", titulo: "Artigos" }] : []),
];
