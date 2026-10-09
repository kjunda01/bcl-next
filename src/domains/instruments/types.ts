export type InstrumentFamily = 'woodwind' | 'brass' | 'percussion' | 'string' | 'keyboard';

export interface InstrumentDetails {
  family: InstrumentFamily;
  pitch?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
}

export const INSTRUMENT_FAMILY_LABEL: Record<InstrumentFamily, string> = {
  woodwind: 'Madeira',
  brass: 'Metal',
  percussion: 'Percussão',
  string: 'Cordas',
  keyboard: 'Teclado',
};
