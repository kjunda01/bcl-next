import type { Auditable, EntityId } from '../shared';

export type MediaKind = 'article' | 'photo' | 'video';
export type MediaStatus = 'draft' | 'published';

export type AlbumLayout = 'carousel' | 'thumbnails' | 'gallery';
export type MediaSize = 'small' | 'medium' | 'large';
export type SectionLayout = 'text-image' | 'image-text' | 'stack-image' | 'stack-text';

export interface AlbumImage {
  src: string;
  alt: string;
  size: MediaSize;
}

export type PostBlock =
  | { id: string; type: 'text'; text: string }
  | { id: string; type: 'section'; layout: SectionLayout; text: string; src: string; alt: string; caption: string; size: MediaSize }
  | { id: string; type: 'image'; src: string; alt: string; caption: string; size: MediaSize }
  | { id: string; type: 'album'; layout: AlbumLayout; caption: string; images: AlbumImage[] }
  | { id: string; type: 'video'; youtubeId: string; src: string; caption: string }
  | { id: string; type: 'audio'; src: string; title: string };

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
  blocks?: PostBlock[];
}
