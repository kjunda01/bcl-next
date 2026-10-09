import type { Auditable, EntityId, RecordStatus } from '../shared';

export interface SongScore {
  fileName: string;
  mimeType: 'application/vnd.recordare.musicxml+xml' | 'application/xml' | 'text/xml';
  url: string;
}

export interface Song extends Auditable {
  id: EntityId;
  title: string;
  composer: string;
  arranger?: string;
  genre?: string;
  key?: string;
  durationSeconds?: number;
  scores: SongScore[];
  status: RecordStatus;
}
