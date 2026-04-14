export type StudyExampleOption = { id: string; label: string };

/** Mesma lista que `study.config.ts` no Angular. */
export const STUDY_EXAMPLES: ReadonlyArray<StudyExampleOption> = [
  { id: 'score.xml', label: 'Hino Francisco Diniz' },
  { id: 'nossa.xml', label: 'Nossa Senhora - Roberto Carlos' },
  { id: 'vento.musicxml', label: 'Vento Ventania' },
  { id: 'rock.musicxml', label: 'Rock you like a hurricane' },
  { id: 'vila.musicxml', label: 'Vila do sossego' },
];

export function getExampleLabel(assetName: string): string {
  const match = STUDY_EXAMPLES.find((o) => o.id === assetName);
  return match?.label ?? assetName;
}
