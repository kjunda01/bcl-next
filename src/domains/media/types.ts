import type { Auditable, EntityId } from '../shared';

export type MediaKind = 'article' | 'photo' | 'video';
export type MediaStatus = 'draft' | 'published';

export interface MediaPost extends Auditable {
  id: EntityId;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl?: string;
  videoUrl?: string;
  kind: MediaKind;
  status: MediaStatus;
  publishedAt?: string;
}
