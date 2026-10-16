export const BOOK = {
  author: 'Hugo Nicodemos Biavati',
  title: 'A Presença da Música na História Luminarense (1894 a 1978)',
  year: 2023,
  edition: '1ª edição, 400 exemplares',
  publisher: 'Editora Vinhático',
  organizer: 'Antonio de Souza Neto',
  period: '1894 a 1978',
  pdfHref: '/historia/livro',
  pdfInlineHref: '/historia/livro?inline=1',
  downloadName: 'Biavati-A-Presenca-da-Musica-na-Historia-Luminarense-2023.pdf',
  coverSrc: '/imgs/historia-livro-capa.png',
  authorPhotoSrc: '/imgs/historia-autor-hugo.jpg',
} as const;

export const BAND_CONTACT = {
  phone: '(35) 99727-5401',
  email: 'bandacarmelitanalms@gmail.com',
  sobreHref: '/sobre#contato',
} as const;

export const PHYSICAL_BOOK_WHATSAPP = (() => {
  const digits = BAND_CONTACT.phone.replace(/\D/g, '');
  const text = encodeURIComponent(
    `Olá! Tenho interesse em adquirir o livro físico ${BOOK.title}, de ${BOOK.author}.`,
  );
  return `https://wa.me/55${digits}?text=${text}`;
})();

export const PHYSICAL_BOOK_MAILTO = `mailto:${BAND_CONTACT.email}?subject=${encodeURIComponent(
  `Livro físico — ${BOOK.title}`,
)}&body=${encodeURIComponent(
  `Olá,\n\nGostaria de informações para adquirir o livro físico ${BOOK.title}, de ${BOOK.author}.\n`,
)}`;

export type HistoriaSectionId =
  | 'fonte'
  | 'fundacao'
  | 'primeiros-anos'
  | 'tres-bandas'
  | 'sede'
  | 'bandinha'
  | 'mestres'
  | 'galeria'
  | 'livro';

export const SECTION_NAV: ReadonlyArray<{ id: HistoriaSectionId; label: string }> = [
  { id: 'fonte', label: 'O livro' },
  { id: 'fundacao', label: 'Fundação' },
  { id: 'primeiros-anos', label: 'Primeiros anos' },
  { id: 'tres-bandas', label: 'Três bandas' },
  { id: 'sede', label: 'Sede' },
  { id: 'bandinha', label: 'Bandinha' },
  { id: 'mestres', label: 'Mestres' },
  { id: 'galeria', label: 'Fotos' },
  { id: 'livro', label: 'Baixar / comprar' },
];

export interface HistoriaPhoto {
  src: string;
  alt: string;
  caption: string;
  fromBook: boolean;
}

export const GALLERY: readonly HistoriaPhoto[] = [
  {
    src: '/imgs/historia-1894-americo.jpg',
    alt: 'Retrato de Américo José da Costa',
    caption: 'Américo José da Costa, fundador da Corporação Musical Carmelitana Luminarense em 1894.',
    fromBook: true,
  },
  {
    src: '/imgs/historia-1910-vitorinos.jpg',
    alt: 'Banda dos Vitorinos em 1910',
    caption: 'Banda dos Vitorinos, 1910. Américo Costa (clarinete) está entre os músicos que formou.',
    fromBook: true,
  },
  {
    src: '/imgs/historia-1926-cavalhadas.jpg',
    alt: 'Cavalhadas de 1926 com as três bandas',
    caption: 'Cavalhadas de 1926, onde hoje é a Praça dos Expedicionários: BCL, Vitorinos/Euterpe e o clube.',
    fromBook: true,
  },
  {
    src: '/imgs/historia-bcl-1940.jpg',
    alt: 'Banda Carmelitana na década de 1940 ou 1950',
    caption: 'Banda Carmelitana Luminarense, década de 1940/1950, na Rua Cel. Diniz.',
    fromBook: true,
  },
  {
    src: '/imgs/historia-banda-meninos.jpg',
    alt: 'Banda dos Meninos com o maestro Sinhô',
    caption: 'A Banda dos Meninos, formação mais famosa da BCL, ensaiada por Sinhô a partir de 1954.',
    fromBook: true,
  },
  {
    src: '/imgs/historia-sede-antes-1979.jpg',
    alt: 'Sede da BCL antes da reforma de 1979',
    caption: 'Sede na Rua Silva Pinto, ainda antes da reforma de 1979.',
    fromBook: true,
  },
];

export interface TimelineBeat {
  when: string;
  title: string;
  text: string;
  image?: HistoriaPhoto;
}

export const TIMELINE: readonly TimelineBeat[] = [
  {
    when: '1894',
    title: 'Fundação da corporação',
    text: 'Américo José da Costa, escrivão civil chegado de São Tomé das Letras no ano anterior, reuniu quem no arraial já tocava sopro e fundou a Corporação Musical Carmelitana Luminarense, em homenagem a Nossa Senhora do Carmo. Essa corporação é a BCL de hoje.',
    image: GALLERY[0],
  },
  {
    when: '1912',
    title: 'Primeiro estatuto',
    text: 'A corporação ganha estatuto impresso na tipografia do Ginásio de Lavras. Um exemplar ficou com a família de Sinhô.',
  },
  {
    when: '1915',
    title: 'Tirar reis a cavalo',
    text: 'Dez músicos cavalgaram cerca de 200 km e doze dias pelas fazendas, entre Natal e o Dia de Reis. Arrecadaram 400 mil réis e compraram um baixo novo; Oswaldo estreou-o na festa da padroeira em 16 de julho de 1916.',
  },
  {
    when: '1924',
    title: 'A sede na Silva Pinto',
    text: 'Entre 1921 e 1924 o pedreiro Antonio Furtado construiu a sede, com dinheiro de tirar reis e doações. Das três bandas do arraial, só a BCL chegou a ter patrimônio próprio.',
    image: GALLERY[5],
  },
  {
    when: '1925',
    title: 'Nasce a Euterpe Aparecida',
    text: 'Américo e João Fonseca, com músicos dos Vitorinos e da BCL, fundam a Euterpe Aparecida. Houve rivalidade institucional com a Carmelitana, mas os músicos eram amigos.',
  },
  {
    when: '1926',
    title: 'As três bandas nas Cavalhadas',
    text: 'A foto das Cavalhadas reúne a BCL, a Euterpe (com músicos dos Vitorinos) e o clube. O livro a considera um dos maiores documentos da música luminarense. No mesmo ano, a morte de Joaquim quase extingue a Banda dos Vitorinos.',
    image: GALLERY[2],
  },
  {
    when: '1943',
    title: 'Sinhô assume a BCL',
    text: 'Em 25 de julho de 1943, Dico Eduardo passa a direção a Messias Furtado Sobrinho — o Sinhô. Ele rege a corporação por cerca de 46 anos, ensina sem remuneração e conserta instrumentos.',
  },
  {
    when: '1954',
    title: 'A Banda dos Meninos',
    text: 'Sinhô reúne meninos de 7 a 14 anos. Em cerca de dez meses estreiam o Tantum Ergo na Matriz. Foi a formação mais famosa da BCL: tocaram em Lavras, Cruzília, Três Corações, São Lourenço e fazendas.',
    image: GALLERY[4],
  },
  {
    when: '1956',
    title: 'Escola Luminarense de Música',
    text: 'Fundada e registrada em cartório, com Sinhô como professor. Funcionou com regularidade até 1962. O livro trata a ELM como um capítulo próprio — não a confunde com a estrutura atual da banda.',
  },
  {
    when: '1978',
    title: 'O telhado cai; o recorte se encerra',
    text: 'Em 12 de janeiro o telhado da sede desmorona. Zé Chico reconstrói e pede usucapião do terreno. O volume de Biavati cobre até 1978 e pede que o que veio depois seja escrito por outra pessoa.',
  },
];

export interface MasterCard {
  id: string;
  name: string;
  /** Período de regência (ou o possível, quando o livro não fecha a data). */
  tenure: string;
  tenureKind: 'confirmed' | 'possible';
  role: string;
  text: string;
  fromBook: boolean;
  photo?: HistoriaPhoto;
}

export const BOOK_MASTERS: readonly MasterCard[] = [
  {
    id: 'americo',
    name: 'Américo José da Costa',
    tenure: '1894–c. 1920',
    tenureKind: 'possible',
    role: 'Fundador · “pai” da música no arraial',
    text: 'Escrivão civil, mestre e maestro. Ensinava de graça com a “Artinha”. Fundou a BCL em 1894 e, com João Fonseca, a Euterpe em 1925. Também tocou com os Vitorinos. Por volta de 1920 afastou-se da BCL. Faleceu no Palmital do Cervo, em cova rasa.',
    fromBook: true,
    photo: {
      src: '/imgs/historia-1894-americo.jpg',
      alt: 'Retrato de Américo José da Costa',
      caption: 'Américo José da Costa',
      fromBook: true,
    },
  },
  {
    id: 'dico',
    name: 'Adelino Inácio de Oliveira',
    tenure: '1922–1943',
    tenureKind: 'confirmed',
    role: '“Dico Eduardo” · requinta · maestro da BCL',
    text: 'Um dos primeiros alunos de Américo nascidos no arraial. Agricultor, fazia o carro de boi Luminárias–Paulo Freitas. Em 25 de julho de 1943 passou a direção da BCL a Sinhô.',
    fromBook: true,
    photo: {
      src: '/imgs/historia-dico.jpg',
      alt: 'Retrato de Dico Eduardo',
      caption: 'Adelino Inácio de Oliveira, o Dico Eduardo',
      fromBook: true,
    },
  },
  {
    id: 'joao-fonseca',
    name: 'João Fonseca',
    tenure: 'Euterpe a partir de 1925',
    tenureKind: 'possible',
    role: 'Mestre da Euterpe Aparecida',
    text: 'De Carrancas; sapateiro. Bombardino, clarineta e canto sacro. Fundou a Euterpe com Américo em 1925. Compôs a marcha “Sto. Antônio”, “São de Maio estas florinhas” (ainda cantada nas coroações) e marchas fúnebres. Faleceu em 26 de julho de 1961. O livro não fecha o fim da regência.',
    fromBook: true,
    photo: {
      src: '/imgs/historia-joao-fonseca.jpg',
      alt: 'João Fonseca em pé, com chapéu na mão',
      caption: 'João Fonseca',
      fromBook: true,
    },
  },
  {
    id: 'sinho',
    name: 'Messias Furtado Sobrinho',
    tenure: '1943–1976',
    tenureKind: 'possible',
    role: '“Sinhô” · mestre da Bandinha',
    text: 'Regente, copista, baixista, pistonista e consertador. Direção da BCL a partir de 25 de julho de 1943. Ensinava na clave de sol, sem remuneração. A casa do casal servia de sede da Banda dos Meninos. Com a visão já fraca, Nem assume ensaios e tocatas a partir de 1976; Sinhô faleceu em 10 de novembro de 1991.',
    fromBook: true,
    photo: {
      src: '/imgs/historia-sinho.jpg',
      alt: 'Retrato de Sinhô na velhice',
      caption: 'Messias Furtado Sobrinho, o Sinhô',
      fromBook: true,
    },
  },
  {
    id: 'nem',
    name: 'Aristeu Antônio de Oliveira',
    tenure: '1976–2002',
    tenureKind: 'confirmed',
    role: '“Nem” · clarinetista',
    text: 'Com Sinhô idoso e com pouca visão, passou a dirigir ensaios e tocatas da BCL desde 1976. Pedreiro de profissão; o livro o chama de “rei da valsa”. Compôs “Recordação de Luminárias”, valsa que não ficou escrita. Faleceu em 1º de junho de 2002, sepultado ao som da BCL.',
    fromBook: true,
    photo: {
      src: '/imgs/historia-nem.jpg',
      alt: 'Nem tocando clarinete',
      caption: 'Aristeu Antônio de Oliveira, o Nem',
      fromBook: true,
    },
  },
];

export const LATER_MASTERS: readonly MasterCard[] = [
  {
    id: 'tonho',
    name: 'Antonio de Souza Neto',
    tenure: '2002–2011 e 2017–2025 e professor da Escola Luminarense de Música de 2002 à 2011 e 2017 até hoje',
    tenureKind: 'confirmed',
    role: '“Tonho” · maestro da BCL',
    text: 'Dois períodos à frente da BCL: 2002 a 2012 e 2016 a 2025. O livro o cita como maestro na organização do volume (2023); as datas de regência abaixo não estão no livro. Além disso, Tonho é professor da Escola Luminarense de Música de 2002 à 2011 e 2017 até hoje, ajudando a manter a música na cidade e fornecendo grandes talentos para a banda.',
    fromBook: false,
    photo: {
      src: '/imgs/historia-tonho.jpg',
      alt: 'Tonho tocando violão',
      caption: 'Antonio de Souza Neto, o Tonho',
      fromBook: false,
    },
  },
  {
    id: 'josias',
    name: 'Josias Felipe',
    tenure: '2013–2016',
    tenureKind: 'confirmed',
    role: 'Maestro da BCL',
    text: 'Regência da BCL de 2013 a 2016, entre os dois períodos de Tonho. Assumiu a regência em um momento que a banda estava em crise e sem maestro.',
    fromBook: false,
    photo: {
      src: '/imgs/historia-josias.jpg',
      alt: 'Josias tocando flauta',
      caption: 'Josias Felipe',
      fromBook: false,
    },
  },
  {
    id: 'tiago',
    name: 'Tiago Henrique Teodoro Silva',
    tenure: '2025–atual',
    tenureKind: 'confirmed',
    role: 'Maestro da BCL',
    text: 'Assume a regência da BCL em 2025 e permanece no cargo atualmente. Também foi presidente da Banda Carmelitana Luminarense de 2020 a 2023.',
    fromBook: false,
    photo: {
      src: '/imgs/historia-tiago.jpg',
      alt: 'Tiago tocando violão',
      caption: 'Tiago Henrique Teodoro Silva',
      fromBook: false,
    },
  },
];

export const CORPORATIONS = [
  {
    id: 'bcl',
    year: '1894',
    name: 'Banda Carmelitana Luminarense',
    text: 'Fundada por Américo José da Costa. É a única das três que ainda existia com patrimônio quando o autor descreveu a sede. Historicamente não recebia ajuda do poder público: os músicos pagavam mensalidade e ainda doavam.',
  },
  {
    id: 'vitorinos',
    year: 'início do séc. XX',
    name: 'Banda dos Vitorinos',
    text: 'Também chamada Banda dos Crioulos do Mata-Boi. A família aprendeu com Américo. Tocava aos domingos no Cruzeirinho. Mecenas: o fazendeiro Joaquim Ferreira, do Cafundó. Quase se extinguiu em 1926, com a morte de Joaquim, o baixista mais velho.',
  },
  {
    id: 'euterpe',
    year: '1925',
    name: 'Euterpe Aparecida',
    text: 'Fundada por João Fonseca e Américo Costa, com músicos dos Vitorinos e da BCL. Houve rivalidade institucional com a Carmelitana; os músicos, porém, eram amigos.',
  },
] as const;
