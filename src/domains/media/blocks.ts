import { plainTextFromHtml } from './richText';
import type { MediaKind, MediaPost, MediaStatus, PostBlock, SectionLayout } from './types';

const BLOCK_TYPES = ['text', 'section', 'image', 'album', 'video', 'audio'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function safeMediaUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  if (trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('data:audio/')) return trimmed;
  return '';
}

export function youtubeIdFromInput(value: string): string {
  const trimmed = value.trim();
  if (/^[\w-]{6,20}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,20})/);
  return match?.[1] ?? '';
}

export function slugifyTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sectionLayout(value: unknown): SectionLayout {
  if (value === 'image-text' || value === 'stack-image' || value === 'stack-text' || value === 'text-image') return value;
  return 'text-image';
}

function mediaSize(value: unknown): 'small' | 'medium' | 'large' {
  return value === 'small' || value === 'large' ? value : 'medium';
}

function nextBlockId(blocks: PostBlock[]): string {
  const used = new Set(blocks.map((block) => block.id));
  let index = blocks.length + 1;
  while (used.has(`block-${index}`)) index += 1;
  return `block-${index}`;
}

export function createBlock(type: PostBlock['type'], blocks: PostBlock[]): PostBlock {
  const id = nextBlockId(blocks);
  if (type === 'text') return { id, type, text: '' };
  if (type === 'section') return { id, type, layout: 'text-image', text: '', src: '', alt: '', caption: '', size: 'medium' };
  if (type === 'image') return { id, type, src: '', alt: '', caption: '', size: 'medium' };
  if (type === 'album') return { id, type, layout: 'gallery', caption: '', images: [] };
  if (type === 'video') return { id, type, youtubeId: '', src: '', caption: '' };
  return { id, type, src: '', title: '' };
}

function sanitizeBlock(raw: unknown, index: number): PostBlock | null {
  if (!isRecord(raw) || typeof raw.type !== 'string') return null;
  if (!BLOCK_TYPES.includes(raw.type as PostBlock['type'])) return null;
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `block-${index + 1}`;
  if (raw.type === 'text') {
    return { id, type: 'text', text: typeof raw.text === 'string' ? raw.text : '' };
  }
  if (raw.type === 'section') {
    return {
      id,
      type: 'section',
      layout: sectionLayout(raw.layout),
      text: typeof raw.text === 'string' ? raw.text : '',
      src: safeMediaUrl(typeof raw.src === 'string' ? raw.src : ''),
      alt: typeof raw.alt === 'string' ? raw.alt : '',
      caption: typeof raw.caption === 'string' ? raw.caption : '',
      size: mediaSize(raw.size),
    };
  }
  if (raw.type === 'image') {
    return {
      id,
      type: 'image',
      src: safeMediaUrl(typeof raw.src === 'string' ? raw.src : ''),
      alt: typeof raw.alt === 'string' ? raw.alt : '',
      caption: typeof raw.caption === 'string' ? raw.caption : '',
      size: mediaSize(raw.size),
    };
  }
  if (raw.type === 'album') {
    const layout = raw.layout === 'carousel' || raw.layout === 'thumbnails' || raw.layout === 'gallery' ? raw.layout : 'gallery';
    const images = Array.isArray(raw.images)
      ? raw.images.flatMap((item) => {
          if (!isRecord(item)) return [];
          const src = safeMediaUrl(typeof item.src === 'string' ? item.src : '');
          if (!src) return [];
          return [{ src, alt: typeof item.alt === 'string' ? item.alt : '', size: mediaSize(item.size) }];
        })
      : [];
    return {
      id,
      type: 'album',
      layout,
      caption: typeof raw.caption === 'string' ? raw.caption : '',
      images,
    };
  }
  if (raw.type === 'video') {
    return {
      id,
      type: 'video',
      youtubeId: youtubeIdFromInput(typeof raw.youtubeId === 'string' ? raw.youtubeId : ''),
      src: safeMediaUrl(typeof raw.src === 'string' ? raw.src : ''),
      caption: typeof raw.caption === 'string' ? raw.caption : '',
    };
  }
  return {
    id,
    type: 'audio',
    src: safeMediaUrl(typeof raw.src === 'string' ? raw.src : ''),
    title: typeof raw.title === 'string' ? raw.title : '',
  };
}

export function blocksFromLegacy(post: Pick<MediaPost, 'body' | 'videoUrl'>): PostBlock[] {
  const blocks: PostBlock[] = [];
  if (post.body.trim()) blocks.push({ id: 'block-1', type: 'text', text: post.body });
  const youtubeId = youtubeIdFromInput(post.videoUrl ?? '');
  const src = safeMediaUrl(post.videoUrl ?? '');
  if (youtubeId || src) {
    blocks.push({
      id: 'block-video',
      type: 'video',
      youtubeId,
      src: youtubeId ? '' : src,
      caption: '',
    });
  }
  return blocks.length > 0 ? blocks : [{ id: 'block-1', type: 'text', text: '' }];
}

export function readBlocks(post: Pick<MediaPost, 'body' | 'videoUrl' | 'blocks'>): PostBlock[] {
  if (Array.isArray(post.blocks) && post.blocks.length > 0) {
    const parsed = post.blocks.flatMap((block, index) => {
      const next = sanitizeBlock(block, index);
      return next ? [next] : [];
    });
    if (parsed.length > 0) return parsed;
  }
  return blocksFromLegacy(post);
}

export function bodyFromBlocks(blocks: PostBlock[]): string {
  return blocks
    .flatMap((block) => (block.type === 'text' || block.type === 'section' ? [plainTextFromHtml(block.text)] : []))
    .filter(Boolean)
    .join('\n\n');
}

export function emptyPostDraft(): Omit<MediaPost, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    coverUrl: '',
    videoUrl: '',
    kind: 'article',
    status: 'draft',
    blocks: [{ id: 'block-1', type: 'text', text: '' }],
  };
}

export function parseMediaPost(raw: unknown): MediaPost | null {
  if (!isRecord(raw) || raw.id === undefined || raw.id === null) return null;
  const kind: MediaKind = raw.kind === 'photo' || raw.kind === 'video' ? raw.kind : 'article';
  const status: MediaStatus = raw.status === 'published' ? 'published' : 'draft';
  const post: MediaPost = {
    id: String(raw.id),
    title: typeof raw.title === 'string' ? raw.title : '',
    slug: typeof raw.slug === 'string' ? raw.slug : '',
    excerpt: typeof raw.excerpt === 'string' ? raw.excerpt : '',
    body: typeof raw.body === 'string' ? raw.body : '',
    coverUrl: typeof raw.coverUrl === 'string' ? raw.coverUrl : '',
    videoUrl: typeof raw.videoUrl === 'string' ? raw.videoUrl : '',
    kind,
    status,
    publishedAt: typeof raw.publishedAt === 'string' ? raw.publishedAt : undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date(0).toISOString(),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(0).toISOString(),
    blocks: Array.isArray(raw.blocks) ? raw.blocks.flatMap((block, index) => {
      const next = sanitizeBlock(block, index);
      return next ? [next] : [];
    }) : undefined,
  };
  post.blocks = readBlocks(post);
  post.body = bodyFromBlocks(post.blocks);
  const video = post.blocks.find((block) => block.type === 'video');
  post.videoUrl = video?.youtubeId
    ? `https://www.youtube.com/embed/${video.youtubeId}`
    : video?.src || '';
  return post;
}

export function validatePost(post: Pick<MediaPost, 'title' | 'slug' | 'excerpt' | 'status' | 'blocks'>): string | null {
  if (!post.title.trim()) return 'Informe o título.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
    return 'O endereço do post deve usar letras minúsculas, números e hífens.';
  }
  if (!post.excerpt.trim()) return 'Informe o resumo que aparece na listagem.';
  const blocks = post.blocks ?? [];
  if (blocks.length === 0) return 'Adicione ao menos um bloco de conteúdo.';
  if (post.status === 'published' && blocks.every((block) => block.type === 'text' && !block.text.trim())) {
    return 'Um post publicado precisa de conteúdo.';
  }
  return null;
}
