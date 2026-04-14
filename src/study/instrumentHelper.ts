export const INSTRUMENTS_TYPES = {
  TRUMPET: 'Trompete',
  TROMBONE: 'Trombone',
  SAX_ALTO: 'Sax Alto',
  SAX_TENOR: 'Sax Tenor',
  SAX_SOPRANO: 'Sax Soprano',
  SAX_BARITONE: 'Sax Barítono',
  BASS_TUBA: 'Baixo/Tuba',
  CLARINET: 'Clarinete',
  FLUTE: 'Flauta',
  FLUTELET: 'Flautim',
  PERCUSSION: 'Percussão',
  DRUMS: 'Bateria',
  CORDAS: 'Cordas',
  TIMPANI: 'Tímpani',
  GLOCKENSPIEL: 'Glockenspiel',
  XYLOPHONE: 'Xilofone',
  VIBRAPHONE: 'Vibrafone',
  MARIMBA: 'Marimba',
  BASS_DRUM: 'Surdo',
  SNARE_DRUM: 'Caixa',
  CYMBALS: 'Pratos',
  TAMBOURINE: 'Pandeiro',
  TRIANGLE: 'Triângulo',
  BOMBARDINO: 'Bombardino',
  FRENCH_HORN: 'Trompa francesa',
  OBOE: 'Oboé',
  BASSOON: 'Fagote',
  CONTRABASSO: 'Contrabaixo',
  HARP: 'Harpa',
  CELLO: 'Violoncelo',
  VIOLA: 'Viola',
  VIOLIN: 'Violino',
  TROMPA: 'Trompa',
} as const;

export type InstrumentTypeId = (typeof INSTRUMENTS_TYPES)[keyof typeof INSTRUMENTS_TYPES];

export interface IInstrumentMetadata {
  name: string;
  iconPath: string;
  title: string;
}

export const DEFAULT_INSTRUMENT_METADATA: IInstrumentMetadata = {
  name: 'Instrumento',
  iconPath: 'assets/instruments/default.png',
  title: 'Instrumento',
};

const normalizeInstrumentKey = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const INSTRUMENT_METADATA: Record<InstrumentTypeId, IInstrumentMetadata> = {
  [INSTRUMENTS_TYPES.TRUMPET]: { name: 'Trompete', iconPath: 'assets/instruments/trumpet.png', title: 'Trompete' },
  [INSTRUMENTS_TYPES.TROMBONE]: { name: 'Trombone', iconPath: 'assets/instruments/trombone.png', title: 'Trombone' },
  [INSTRUMENTS_TYPES.SAX_ALTO]: { name: 'Sax Alto', iconPath: 'assets/instruments/altoSax.png', title: 'Saxofone alto Mi bemol' },
  [INSTRUMENTS_TYPES.SAX_TENOR]: { name: 'Sax Tenor', iconPath: 'assets/instruments/tenorSax.png', title: 'Saxofone tenor Si bemol' },
  [INSTRUMENTS_TYPES.SAX_SOPRANO]: { name: 'Sax Soprano', iconPath: 'assets/instruments/sopranoSax.png', title: 'Saxofone soprano' },
  [INSTRUMENTS_TYPES.SAX_BARITONE]: { name: 'Sax Barítono', iconPath: 'assets/instruments/baritonSax.png', title: 'Saxofone barítono' },
  [INSTRUMENTS_TYPES.BASS_TUBA]: { name: 'Baixo/Tuba', iconPath: 'assets/instruments/tuba.png', title: 'Baixo/Tuba' },
  [INSTRUMENTS_TYPES.CLARINET]: { name: 'Clarinete', iconPath: 'assets/instruments/clarinete.png', title: 'Clarinete' },
  [INSTRUMENTS_TYPES.FLUTE]: { name: 'Flauta', iconPath: 'assets/instruments/flauta.png', title: 'Flauta transversal' },
  [INSTRUMENTS_TYPES.FLUTELET]: { name: 'Flautim', iconPath: 'assets/instruments/flautim.png', title: 'Flautin/Piccolo' },
  [INSTRUMENTS_TYPES.PERCUSSION]: { name: 'Percussão', iconPath: 'assets/instruments/percussao.png', title: 'Acessórios Percussão' },
  [INSTRUMENTS_TYPES.DRUMS]: { name: 'Bateria', iconPath: 'assets/instruments/bateria.png', title: 'Bateria Americana' },
  [INSTRUMENTS_TYPES.CORDAS]: { name: 'Cordas', iconPath: 'assets/instruments/cordas.png', title: 'Cordas' },
  [INSTRUMENTS_TYPES.TIMPANI]: { name: 'Tímpani', iconPath: 'assets/instruments/timpano.png', title: 'Tímpani' },
  [INSTRUMENTS_TYPES.GLOCKENSPIEL]: { name: 'Glockenspiel', iconPath: 'assets/instruments/xilofone.png', title: 'Glockenspiel' },
  [INSTRUMENTS_TYPES.XYLOPHONE]: { name: 'Xilofone', iconPath: 'assets/instruments/xilofone.png', title: 'Xilofone' },
  [INSTRUMENTS_TYPES.VIBRAPHONE]: { name: 'Vibrafone', iconPath: 'assets/instruments/vibraphone.png', title: 'Vibrafone' },
  [INSTRUMENTS_TYPES.MARIMBA]: { name: 'Marimba', iconPath: 'assets/instruments/marimba.png', title: 'Marimba' },
  [INSTRUMENTS_TYPES.BASS_DRUM]: { name: 'Surdo', iconPath: 'assets/instruments/surdo.png', title: 'Surdo' },
  [INSTRUMENTS_TYPES.SNARE_DRUM]: { name: 'Caixa', iconPath: 'assets/instruments/caixa.png', title: 'Caixa' },
  [INSTRUMENTS_TYPES.CYMBALS]: { name: 'Pratos', iconPath: 'assets/instruments/pratos.png', title: 'Pratos' },
  [INSTRUMENTS_TYPES.TAMBOURINE]: { name: 'Pandeiro', iconPath: 'assets/instruments/pandeiro.png', title: 'Pandeiro' },
  [INSTRUMENTS_TYPES.TRIANGLE]: { name: 'Triângulo', iconPath: 'assets/instruments/triangulo.png', title: 'Triângulo' },
  [INSTRUMENTS_TYPES.BOMBARDINO]: { name: 'Bombardino', iconPath: 'assets/instruments/bombardino.png', title: 'Bombardino' },
  [INSTRUMENTS_TYPES.FRENCH_HORN]: { name: 'Trompa francesa', iconPath: 'assets/instruments/trompa.png', title: 'Trompa' },
  [INSTRUMENTS_TYPES.OBOE]: { name: 'Oboé', iconPath: 'assets/instruments/oboe.png', title: 'Oboé' },
  [INSTRUMENTS_TYPES.BASSOON]: { name: 'Fagote', iconPath: 'assets/instruments/fagote.png', title: 'Fagote' },
  [INSTRUMENTS_TYPES.CONTRABASSO]: { name: 'Contrabaixo', iconPath: 'assets/instruments/contrabaixo.png', title: 'Contrabaixo' },
  [INSTRUMENTS_TYPES.HARP]: { name: 'Harpa', iconPath: 'assets/instruments/harpa.png', title: 'Harpa' },
  [INSTRUMENTS_TYPES.CELLO]: { name: 'Violoncelo', iconPath: 'assets/instruments/cello.png', title: 'Violoncelo' },
  [INSTRUMENTS_TYPES.VIOLA]: { name: 'Viola', iconPath: 'assets/instruments/viola.png', title: 'Viola' },
  [INSTRUMENTS_TYPES.VIOLIN]: { name: 'Violino', iconPath: 'assets/instruments/violino.png', title: 'Violino' },
  [INSTRUMENTS_TYPES.TROMPA]: { name: 'Trompa', iconPath: 'assets/instruments/trompa.png', title: 'Trompa' },
};

export const INSTRUMENT_ALIASES: Record<InstrumentTypeId, string[]> = {
  [INSTRUMENTS_TYPES.TRUMPET]: ['trompete', 'trumpet', 'trompete em si bemol', 'trumpet in Bb', 'trompete em Bb', 'trompete em si bemol', 'trumpet in B flat', 'trompete em b flat'],
  [INSTRUMENTS_TYPES.TROMBONE]: ['trombone'],
  [INSTRUMENTS_TYPES.SAX_ALTO]: [
    'sax alto',
    'alto sax',
    'alto saxophone',
    'saxofone alto',
    'saxophone alto',
  ],
  [INSTRUMENTS_TYPES.SAX_TENOR]: [
    'sax tenor',
    'tenor sax',
    'tenor saxophone',
    'saxofone tenor',
    'saxophone tenor',
  ],
  [INSTRUMENTS_TYPES.SAX_SOPRANO]: [
    'sax soprano',
    'soprano sax',
    'soprano saxophone',
    'saxofone soprano',
    'saxophone soprano',
  ],
  [INSTRUMENTS_TYPES.SAX_BARITONE]: [
    'sax baritono',
    'sax baritone',
    'baritone sax',
    'baritone saxophone',
    'saxofone baritono',
    'saxophone baritone',
  ],
  [INSTRUMENTS_TYPES.BASS_TUBA]: ['tuba', 'bass tuba', 'baixo', 'bass', 'bombardino baixo'],
  [INSTRUMENTS_TYPES.CLARINET]: ['clarinete', 'clarinet', 'Clarinete em Bb', 'clarinet in Bb', 'clarinete em si bemol'],
  [INSTRUMENTS_TYPES.FLUTE]: ['flauta', 'flauta transversal', 'flute', 'concert flute'],
  [INSTRUMENTS_TYPES.FLUTELET]: ['flautim', 'flauta piccolo', 'piccolo', 'piccolo flute'],
  [INSTRUMENTS_TYPES.PERCUSSION]: ['percussao', 'percussao acessorios', 'percussion', 'perc'],
  [INSTRUMENTS_TYPES.DRUMS]: ['bateria', 'drum', 'drums', 'drum set', 'drumset', 'kit'],
  [INSTRUMENTS_TYPES.CORDAS]: ['cordas', 'strings', 'string section'],
  [INSTRUMENTS_TYPES.TIMPANI]: ['timpani', 'timpano', 'timpani drums'],
  [INSTRUMENTS_TYPES.GLOCKENSPIEL]: ['glockenspiel', 'glock'],
  [INSTRUMENTS_TYPES.XYLOPHONE]: ['xilofone', 'xylophone'],
  [INSTRUMENTS_TYPES.VIBRAPHONE]: ['vibrafone', 'vibraphone', 'vibes'],
  [INSTRUMENTS_TYPES.MARIMBA]: ['marimba'],
  [INSTRUMENTS_TYPES.BASS_DRUM]: ['surdo', 'bass drum', 'bombo', 'bumbo'],
  [INSTRUMENTS_TYPES.SNARE_DRUM]: ['caixa', 'snare', 'snare drum'],
  [INSTRUMENTS_TYPES.CYMBALS]: ['pratos', 'cymbals', 'cymbal'],
  [INSTRUMENTS_TYPES.TAMBOURINE]: ['pandeiro', 'tambourine'],
  [INSTRUMENTS_TYPES.TRIANGLE]: ['triangulo', 'triangle'],
  [INSTRUMENTS_TYPES.BOMBARDINO]: ['bombardino', 'euphonium', 'eufonio', 'tenor tuba'],
  [INSTRUMENTS_TYPES.FRENCH_HORN]: [
    'trompa francesa',
    'french horn',
    'french_horn',
    'trompa',
    'horn',
    'corne',
    'Trompa em F 2'
  ],
  [INSTRUMENTS_TYPES.OBOE]: ['oboe', 'oboé'],
  [INSTRUMENTS_TYPES.BASSOON]: ['fagote', 'bassoon'],
  [INSTRUMENTS_TYPES.CONTRABASSO]: ['contrabaixo', 'double bass', 'contrabass', 'string bass'],
  [INSTRUMENTS_TYPES.HARP]: ['harpa', 'harp'],
  [INSTRUMENTS_TYPES.CELLO]: ['violoncelo', 'cello', 'violoncello'],
  [INSTRUMENTS_TYPES.VIOLA]: ['viola', 'alto'],
  [INSTRUMENTS_TYPES.VIOLIN]: ['violino', 'violin'],
  [INSTRUMENTS_TYPES.TROMPA]: ['trompa'],
};

const INSTRUMENT_ALIAS_LOOKUP: Record<string, InstrumentTypeId> = (() => {
  const lookup: Record<string, InstrumentTypeId> = {};
  for (const type of Object.values(INSTRUMENTS_TYPES) as InstrumentTypeId[]) {
    const meta = INSTRUMENT_METADATA[type];
    const aliases = new Set<string>([
      meta?.name,
      meta?.title,
      ...(INSTRUMENT_ALIASES[type] ?? []),
    ]);
    aliases.forEach((alias) => {
      if (!alias) return;
      lookup[normalizeInstrumentKey(alias)] = type;
    });
  }
  return lookup;
})();

export const resolveInstrumentMetadata = (name: string): IInstrumentMetadata | null => {
  if (!name) return null;
  const key = normalizeInstrumentKey(name);
  const type = INSTRUMENT_ALIAS_LOOKUP[key];
  return type ? INSTRUMENT_METADATA[type] : null;
};

export const resolveInstrumentMetadataOrDefault = (name: string): IInstrumentMetadata =>
  resolveInstrumentMetadata(name) ?? DEFAULT_INSTRUMENT_METADATA;
