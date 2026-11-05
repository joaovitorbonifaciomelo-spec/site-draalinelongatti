/* Fonte única dos dados e textos do site.
   `provisorio` = origem de um conteúdo ainda não aprovado (ver src/lib/provisorio.ts). */
import { REVISAO } from "../lib/provisorio";
import type { Conteudo } from "../lib/provisorio";


/* Agendamento: o site oficial da clínica publica este número como WhatsApp (conferido em 5/11/2026). */
const WHATSAPP_CONFIRMADO = true;
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
    { rotulo: "Médica", texto: "CRM 13210-GO" },
    { rotulo: "Nutrologia", texto: "RQE 11992" },
    { rotulo: "Dermatologia", texto: "RQE 15427" },
  ],
};

export const agendamento: Conteudo<{ href: string }> = {
  valor: { href: rotas.agendar },
};

const PREDIO = "Edifício Orion Complex";
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
};

export const descricaoSite: Conteudo = {
  valor: "Dra. Aline Longatti, médica: Nutrologia e Dermatologia em Goiânia. CRM 13210-GO · RQE Nutrologia 11992 · RQE Dermatologia 15427.",
};

/* Cap. 04: tudo vem de /sobre/ no site atual. Nada foi acrescentado; o que o site não informa fica sem informar. */
export const medica = {
  retrato: {
    valor: { src: "/media/medica-retrato.webp", largura: 665, altura: 1540, alt: "Dra. Aline Longatti sorrindo, de cabelo longo e roupa branca de renda, com uma das mãos junto ao ombro." },
  } as Conteudo<{ src: string; largura: number; altura: number; alt: string }>,
  origem: {
    valor: { ano: "2006", titulo: "Graduação em Medicina", onde: "Faculdade de Medicina de Barbacena-MG" },
  } as Conteudo<{ ano: string; titulo: string; onde: string }>,
  /* O ano só aparece onde o site atual informa */
  nutrologia: {
    valor: [
      { titulo: "Especialista em Nutrologia", onde: "Associação Brasileira de Nutrologia (ABRAN)" },
      { titulo: "Membro titular", onde: "ABRAN" },
    ],
  } as Conteudo<{ titulo: string; onde: string }[]>,
  dermatologia: {
    valor: [
      { titulo: "Especialista em Dermatologia", onde: "Sociedade Brasileira de Dermatologia (SBD)" },
      { titulo: "Membro titular", onde: "SBD" },
    ],
  } as Conteudo<{ titulo: string; onde: string }[]>,
  /* Trecho literal de /sobre/. O itálico é só da composição */
  fala: {
    valor: { antes: "Minha forma de trabalho é individualizada e personalizada ", grifo: "para cada paciente", depois: " e necessidade específica." },
  } as Conteudo<{ antes: string; grifo: string; depois: string }>,
};

/* /sobre/: textos e citações. Prêmios e Medicina Estética estão fora até a validação. Status e originais em docs/CONTEUDO-SOBRE.md */
export const sobre = {
  lema: {
    valor: { antes: "Compromisso com a saúde, estética e qualidade de vida", grifo: "de cada paciente", depois: "." },
  } as Conteudo<{ antes: string; grifo: string; depois: string }>,
  vozes: [
    {
      lado: "n", nome: "Nutrologia",
      pratica: {
        valor: "Faz tratamentos de obesidade, performance esportiva e transtornos alimentares.",
      } as Conteudo,
      definicao: {
        valor: "Especialidade médica abrangente, voltada à saúde, ao equilíbrio nutricional e endócrino, à obesidade e à síndrome metabólica e suas repercussões.",
      } as Conteudo,
    },
    {
      lado: "d", nome: "Dermatologia",
      pratica: {
        valor: "No consultório, a maior parte dos casos envolve doenças de pele, pelo e unhas.",
      } as Conteudo,
      definicao: {
        valor: "Especialidade médica cuja área de conhecimento se concentra no diagnóstico, prevenção e tratamento de doenças e afecções relacionadas à pele, pelos, mucosas, cabelo e unhas.",
      } as Conteudo,
    },
  ],
  /* A única citação da página: a frase está inteira na fonte */
  sempre: {
    valor: { antes: "Sempre levando em consideração o equilíbrio nutricional, o bom funcionamento do organismo e", grifo: "as necessidades de cada paciente", depois: "." },
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
  } as Conteudo<{ src: string; largura: number; altura: number; srcMobile: string; largMobile: number; altMobile: number; alt: string }>,
  atendimento: {
    valor: { area: "Nutrologia e Dermatologia", local: "Setor Marista, Goiânia" },
  } as Conteudo<{ area: string; local: string }>,
};

export const hero = {
  /* Título aprovado: "A saúde tem muitas camadas." (está no markup, por causa do itálico e da quebra) */
  rotulo: "Nutrologia e Dermatologia · Goiânia",
  lead: {
    valor: "Atendimento individualizado e personalizado para cada paciente e necessidade específica.",
  } as Conteudo,
};

/* Enquanto esta marca existir, o build final falha. Motivo em docs/PENDENCIAS-PUBLICACAO.md */
export const filmeHero: Conteudo = {
  valor: "filme completo do hero (public/media/hero-*.mp4)",
  provisorio: "uso do filme autorizado por João em 5/11/2026; falta confirmar que nenhuma pessoa identificável é paciente (art. 75 do Código de Ética Médica)",
};

export const manifesto = {
  rotulo: "01 — Além do primeiro olhar",
  /* A frase grande vem da mensagem central da direção criativa. Sem assinatura: não é fala da médica. */
  frase: { valor: "O cuidado merece olhar para todas elas." } as Conteudo,
  apoio: {
    valor: "Cada paciente chega com uma história própria. Entender essa história é onde o cuidado começa.",
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
      valor: "Especialidade médica voltada à saúde, ao equilíbrio nutricional e endócrino, à obesidade e à síndrome metabólica e suas repercussões.",
    },
  },
  {
    lado: "d",
    nome: "Dermatologia",
    href: rotas.dermatologia,
    link: "Explorar Dermatologia",
    descricao: {
      valor: "Doenças e afecções da pele, pelos, mucosas, cabelo e unhas, além de procedimentos médicos estéticos e cirúrgicos.",
    },
  },
];

/* Cap. 03: só tratamentos documentados em /tratamentos/ do site atual (referencias/CONTEUDO-SITE-ATUAL.md).
   Nomes como estão lá. Descrições encurtadas para retirar promessa de resultado: todas a revisar (CFM).
   "Medicina Integrativa" está fora até validação: o texto original está em docs/PENDENCIAS-PUBLICACAO.md.
   `tipo` é a organização proposta, ainda sem validação médica: ver docs/ORGANIZACAO-CAP03.md. */
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
  apoio: { valor: "Dos cuidados clínicos aos procedimentos, conheça as diferentes possibilidades de atendimento." },
  instrucaoMouse: "Role a lista ou aponte um nome para ler a descrição",
  instrucaoToque: "Role a lista para ler a descrição de cada nome",
  origem: "",
  origemTipos: "",
  home: ["obesidade", "hipertrofia", "transtornos-da-alimentacao", "deficiencias-nutricionais", "manchas-e-melasma", "queda-de-cabelo", "tratamentos-esteticos-faciais", "cirurgia-da-pele"],
  grupos: [
    {
      id: "nutrologia",
      nome: "Nutrologia",
      itens: [
        { id: "sindromes-de-ma-absorcao", nome: "Síndromes de Má Absorção", tipo: "condicao", descricao: "Investigação e tratamento de alterações intestinais que impedem a absorção adequada de nutrientes." },
        { id: "obesidade", nome: "Obesidade", tipo: "condicao", descricao: "Tratamento médico da obesidade e de suas repercussões metabólicas." },
        { id: "deficiencias-nutricionais", nome: "Deficiências Nutricionais", tipo: "condicao", descricao: "Diagnóstico e reposição de vitaminas, minerais e nutrientes essenciais ao organismo." },
        { id: "transtornos-nutricionais", nome: "Transtornos Nutricionais", tipo: "condicao", descricao: "Avaliação e manejo de desequilíbrios nutricionais que afetam metabolismo, energia e bem-estar." },
        { id: "transtornos-da-alimentacao", nome: "Transtornos da Alimentação", tipo: "condicao", descricao: "Apoio clínico em quadros como compulsão alimentar, bulimia e anorexia, com foco em saúde e estabilidade metabólica." },
        { id: "doencas-nutricionais-e-metabolicas", nome: "Doenças Nutricionais e Metabólicas", tipo: "condicao", descricao: "Tratamentos voltados para condições que impactam metabolismo, composição corporal e funcionamento hormonal." },
        { id: "hipersensibilidade-alimentar", nome: "Hipersensibilidade Alimentar", tipo: "condicao", descricao: "Identificação e controle de reações alimentares que causam desconfortos, inflamações e alterações digestivas." },
        { id: "intolerancia-a-lactose", nome: "Intolerância à Lactose", tipo: "condicao", descricao: "Orientação e estratégias para reduzir sintomas e ajustar a alimentação." },
        { id: "emagrecimento", nome: "Emagrecimento", tipo: "area", descricao: "Acompanhamento médico para redução de peso, com foco em saúde e equilíbrio." },
        { id: "hipertrofia", nome: "Hipertrofia", tipo: "area", descricao: "Acompanhamento clínico-nutricional da composição corporal." },
        { id: "nutrologia-vegetariana", nome: "Nutrologia Vegetariana", tipo: "area", descricao: "Acompanhamento para ajustar nutrientes e prevenir deficiências em dietas vegetarianas e veganas." },
      ],
    },
    {
      id: "dermatologia",
      nome: "Dermatologia",
      itens: [
        { id: "acne", nome: "Acne", tipo: "condicao", descricao: "Tratamento clínico da acne, definido após avaliação médica." },
        { id: "onicomicose", nome: "Onicomicose (fungos nas unhas)", tipo: "condicao", descricao: "Terapia médica para infecções fúngicas das unhas." },
        { id: "queda-de-cabelo", nome: "Queda de Cabelo", tipo: "condicao", descricao: "Avaliação das causas e abordagem médica para queda, afinamento e desordens do couro cabeludo." },
        { id: "manchas-e-melasma", nome: "Manchas e Melasma", tipo: "condicao", descricao: "Tratamentos para melasma, hiperpigmentações, danos solares e irregularidades de tom." },
        { id: "cancer-de-pele", nome: "Câncer de Pele", tipo: "condicao", descricao: "Diagnóstico precoce e encaminhamento para manejo e tratamento adequado das lesões." },
        { id: "cirurgia-da-pele", nome: "Cirurgia da Pele", tipo: "procedimento", descricao: "Procedimentos dermatológicos para remoção de lesões, nevus e tratamentos clínicos específicos." },
        { id: "tratamentos-esteticos-faciais", nome: "Tratamentos Estéticos Faciais", tipo: "procedimento", descricao: "Procedimentos médicos estéticos para a pele do rosto, definidos após avaliação." },
        { id: "envelhecimento-facial", nome: "Envelhecimento Facial", tipo: "area", descricao: "Cuidados dermatológicos com a pele do rosto ao longo do tempo." },
        { id: "rugas-de-expressao", nome: "Rugas de Expressão", tipo: "area", descricao: "Avaliação médica e procedimentos dermatológicos relacionados às linhas de expressão." },
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
  { rota: rotas.privacidade, publicar: true },
];
export const rotasPublicas = ROTAS_DA_PUBLICACAO.filter(r => r.publicar).map(r => r.rota);

/* Política de Privacidade: só fatos conferidos no código e na hospedagem (docs/POLITICA-PRIVACIDADE.md) */
export const privacidade = {
  versao: "Versão de 5 de novembro de 2026",
  aviso: "Esta política explica como este site trata informações de quem o visita. Ele é informativo e não pede dados pessoais para ser usado.",
  fatos: [
    { titulo: "Sem formulário", texto: "Nenhuma página pede nem envia dados por formulário." },
    { titulo: "Sem cookies próprios", texto: "O código do site não cria cookies." },
    { titulo: "Sem rastreamento no código", texto: "Não há ferramenta de análise de visitas ou de publicidade no código do site." },
    { titulo: "Arquivos do próprio site", texto: "Fontes, imagens e vídeos são servidos pelo próprio site." },
    { titulo: "Preferência na sessão", texto: "Se a pessoa pausa o vídeo, o navegador guarda essa escolha só durante a sessão, no próprio aparelho." },
    { titulo: "Preferências do aparelho", texto: "Reduzir movimento e economia de dados são lidos no aparelho para ajustar o vídeo. O código não envia essas informações." },
    { titulo: "Hospedagem", texto: "O site fica na Hostinger. Como em outros sites, o servidor pode registrar dados técnicos de acesso, como endereço IP, navegador, página visitada e horário." },
  ],
  servicos: [
    { titulo: "WhatsApp, telefone e e-mail", texto: "Abrem o aplicativo escolhido pela pessoa, somente ao clicar. O que for enviado por esses canais é usado para responder ao contato." },
    { titulo: "Google Maps", texto: "Abre o endereço do consultório no serviço de mapas, somente ao clicar." },
    { titulo: "Site da clínica", texto: "O link leva a um site separado, que tem regras próprias." },
  ],
  direitos: [
    { titulo: "Responsável pelo site", texto: "Dra. Aline Longatti, médica, CRM 13210-GO. Av. Portugal, 1148, Sala B2406, Setor Marista, Goiânia." },
    { titulo: "Seus direitos", texto: "A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) garante direitos como confirmar o tratamento, acessar e corrigir seus dados e pedir informações sobre compartilhamento." },
    { titulo: "Como falar sobre privacidade", texto: "Escreva para clinicalongattivitae@gmail.com." },
  ],
};

/* /contato/: só canais documentados. O WhatsApp é o destino pretendido, ainda sem confirmação */
export const contatoPagina = {
  lead: { valor: "Escolha o canal mais simples para você." } as Conteudo,
  whatsapp: {
    valor: { href: WHATSAPP },
  } as Conteudo<{ href: string }>,
};

/* /tratamentos/: os textos de cada item ficam em `indice`. A classificação é proposta, a validar (docs/CONTEUDO-TRATAMENTOS.md) */
export const tiposTratamento: Conteudo<{ tipo: "condicao" | "procedimento" | "area"; nome: string; explica: string }[]> = {
  valor: [
    { tipo: "condicao", nome: "Condições clínicas", explica: "Doenças e quadros de saúde que são avaliados e acompanhados." },
    { tipo: "procedimento", nome: "Tratamentos e procedimentos", explica: "Intervenções médicas específicas." },
    { tipo: "area", nome: "Áreas de atendimento", explica: "Objetivos de cuidado e acompanhamento que não são, por si, uma doença." },
  ],
};
export const tratamentosPagina = {
  lead: { valor: "Condições clínicas, áreas de atendimento, tratamentos e procedimentos, organizados para você encontrar o seu assunto." } as Conteudo,
  fim: { valor: { titulo: "Não encontrou o seu assunto?", texto: "Cada caso precisa de avaliação médica. A consulta é o lugar para essa conversa." } } as Conteudo<{ titulo: string; texto: string }>,
  aviso: { valor: "Conteúdo informativo. Não substitui a avaliação médica." } as Conteudo,
};

/* Rotas atuais mantidas como páginas em construção. /depoimentos/ fica fora de propósito. */
export const paginasInternas: { slug: string; titulo: string; ancoras?: { id: string; nome: string; menor?: boolean }[] }[] = [
  ...(REVISAO || ARTIGOS_APROVADOS ? [{ slug: "artigos", titulo: "Artigos" }] : []),
];
