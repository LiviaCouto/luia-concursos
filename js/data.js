/* ============================================================
   LUIA CONCURSOS — dados do edital e configuração base
   Cargo: Agente de Polícia (PC-PE)
   Fonte: Edital nº 1/2023 — Cebraspe/SAD-PE (referência até
   publicação do edital 2026)

   Este arquivo é a única fonte de dados do edital. No futuro,
   basta trocar/gerar este array (ex: a partir de upload + IA)
   para carregar um edital diferente — o resto do app não muda.
   ============================================================ */

// Grupo de prioridade de estudo (definido no plano de estudos):
// A = maior peso / maior volume · B = peso relevante · C = manutenção
const GRUPOS = {
  "Língua Portuguesa": "A",
  "Direito Penal": "A",
  "Direito Processual Penal": "A",
  "Direito Constitucional": "B",
  "Direito Administrativo": "B",
  "Raciocínio Lógico": "B",
  "Legislação Estadual": "C",
  "Estatística": "C",
  "Contabilidade Geral": "C",
  "Informática": "C",
  "Redação": "C"
};

const EDITAL_AGENTE = [
  {
    disciplina: "Legislação Estadual",
    assuntos: [
      "Constituição do Estado de Pernambuco (arts. 101 a 105-B)",
      "Estatuto do Policial Civil (Lei nº 6.425/1972)",
      "Estatuto do Servidor do Estado de PE (Lei nº 6.123/1968)",
      "Leis Complementares nº 137/2008 e nº 317/2015"
    ]
  },
  {
    disciplina: "Direito Constitucional",
    assuntos: [
      "Constituição Federal de 1988 — princípios fundamentais",
      "Poderes Constituintes (Originário, Derivado, Decorrente)",
      "Aplicabilidade das normas constitucionais",
      "Direitos e garantias fundamentais",
      "Organização político-administrativa do Estado",
      "Administração pública — disposições gerais, servidores",
      "Poder Executivo",
      "Poder Legislativo",
      "Poder Judiciário e funções essenciais à justiça",
      "Segurança Pública na Constituição de PE"
    ]
  },
  {
    disciplina: "Direito Administrativo",
    assuntos: [
      "Estado, governo e administração pública",
      "Ato administrativo",
      "Poderes da administração (hierárquico, disciplinar, regulamentar, de polícia)",
      "Regime jurídico-administrativo — princípios",
      "Responsabilidade civil do Estado",
      "Serviços públicos",
      "Organização administrativa (centralização/descentralização)",
      "Controle da administração pública",
      "Improbidade administrativa",
      "Processo administrativo",
      "Licitações e contratos administrativos",
      "Agente público",
      "Cargo, emprego e função pública"
    ]
  },
  {
    disciplina: "Direito Penal",
    assuntos: [
      "Princípios básicos do Direito Penal",
      "Crime e Contravenção Penal",
      "Aplicação da lei penal (tempo, espaço, contagem de prazo)",
      "Crimes contra a pessoa",
      "Crimes contra o patrimônio",
      "Crimes contra a dignidade sexual",
      "Crimes contra a administração pública",
      "Crimes Hediondos (Lei nº 8.072/1990)",
      "Crimes de Preconceito de Raça ou Cor (Lei nº 7.716/1989)",
      "Abuso de Autoridade (Lei nº 13.869/2019)",
      "Crimes de Tortura (Lei nº 9.455/1997)",
      "Estatuto da Criança e do Adolescente (Lei nº 8.069/1990)",
      "Organizações Criminosas (Lei nº 12.850/2013)",
      "Crimes de Trânsito (Lei nº 9.503/1997)",
      "Violência doméstica e familiar contra a mulher (Lei Maria da Penha)",
      "Lei de Drogas (Lei nº 11.343/2006)",
      "Violência contra criança e adolescente (Lei nº 14.344/2022)",
      "Crimes Ambientais (Lei nº 9.605/1998)",
      "Estatuto do Desarmamento (Lei nº 10.826/2003)",
      "Disposições constitucionais aplicáveis ao Direito Penal"
    ]
  },
  {
    disciplina: "Direito Processual Penal",
    assuntos: [
      "Aplicação da lei processual no tempo, espaço e pessoas",
      "Inquérito policial",
      "Provas (exame de corpo de delito, testemunhas, busca e apreensão)",
      "Prisão e liberdade provisória",
      "Medidas cautelares diversas da prisão",
      "Prisão temporária (Lei nº 7.960/1989)",
      "Juizados Especiais Criminais (Lei nº 9.099/1995)",
      "Investigação Criminal (Lei nº 12.830/2013)",
      "Disposições constitucionais aplicáveis ao Processo Penal"
    ]
  },
  {
    disciplina: "Língua Portuguesa",
    assuntos: [
      "Compreensão e interpretação de textos",
      "Tipos e gêneros textuais",
      "Ortografia oficial",
      "Coesão textual (referenciação, conectores, tempos verbais)",
      "Estrutura morfossintática do período",
      "Reescrita de frases e parágrafos",
      "Correspondência oficial (Manual de Redação da Presidência)"
    ]
  },
  {
    disciplina: "Informática",
    assuntos: [
      "Sistema Operacional Windows",
      "Processador de texto (Word)",
      "Planilha eletrônica (Excel)",
      "Software de apresentação (PowerPoint)",
      "Redes de computadores, internet e nuvem",
      "Segurança da informação e backup"
    ]
  },
  {
    disciplina: "Raciocínio Lógico",
    assuntos: [
      "Conjuntos numéricos e sistema legal de medidas",
      "Razões, proporções, regra de três e porcentagens",
      "Equações e inequações de 1º e 2º graus",
      "Sistemas lineares",
      "Funções e gráficos",
      "Progressões aritméticas e geométricas",
      "Princípios de contagem e probabilidade",
      "Lógica de argumentação (analogias, inferências, deduções)",
      "Lógica sentencial (proposições, tabelas-verdade, equivalências)",
      "Leis de Morgan e diagramas lógicos",
      "Lógica de primeira ordem",
      "Operações com conjuntos"
    ]
  },
  {
    disciplina: "Estatística",
    assuntos: [
      "Estatística descritiva e análise exploratória de dados",
      "Probabilidade (definições, condicional, independência)",
      "Técnicas de amostragem"
    ]
  },
  {
    disciplina: "Contabilidade Geral",
    assuntos: [
      "Conceitos, objetivos e finalidades da contabilidade",
      "Patrimônio e equação fundamental",
      "Atos e fatos administrativos",
      "Contas — débitos, créditos e saldos",
      "Plano de contas",
      "Escrituração contábil",
      "Contabilização de operações diversas",
      "Balancete de verificação",
      "Balanço patrimonial",
      "Demonstração de resultado do exercício",
      "Normas Brasileiras de Contabilidade"
    ]
  },
  {
    disciplina: "Redação",
    assuntos: [
      "Atualidades e temas relevantes em Segurança Pública"
    ]
  }
];

// Ciclo de revisão espaçada (em dias)
const STAGES = [
  { label: "1 dia", days: 1 },
  { label: "7 dias", days: 7 },
  { label: "15 dias", days: 15 },
  { label: "30 dias", days: 30 }
];

// Cronograma padrão inicial (editável na aba Cronograma)
const CRONOGRAMA_PADRAO = {
  "Segunda":  ["Língua Portuguesa", "Direito Penal", "Raciocínio Lógico"],
  "Terça":    ["Direito Processual Penal", "Direito Constitucional", "Estatística"],
  "Quarta":   ["Língua Portuguesa", "Direito Administrativo", "Direito Penal"],
  "Quinta":   ["Direito Processual Penal", "Legislação Estadual", "Informática"],
  "Sexta":    ["Direito Constitucional", "Contabilidade Geral", "Raciocínio Lógico"],
  "Sábado":   ["Simulado completo", "Correção + revisão", "Redação"],
  "Domingo":  []
};

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
