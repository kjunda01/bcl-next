export const BLOG_SECTION_TYPES = ['header', 'filters', 'featured', 'list', 'cta'] as const;

export type BlogSectionType = (typeof BLOG_SECTION_TYPES)[number];

export const BLOG_SECTION_LABELS: Record<BlogSectionType, string> = {
  header: 'Cabeçalho',
  filters: 'Filtros',
  featured: 'Post em destaque',
  list: 'Lista de posts',
  cta: 'Chamada',
};

interface BlogSectionBase {
  type: BlogSectionType;
  enabled: boolean;
}

export interface BlogHeaderSection extends BlogSectionBase {
  type: 'header';
  eyebrow: string;
  title: string;
  description: string;
}

export interface BlogToggleSection extends BlogSectionBase {
  type: 'filters' | 'featured' | 'list';
}

export interface BlogCtaSection extends BlogSectionBase {
  type: 'cta';
  title: string;
  description: string;
  linkLabel: string;
  href: string;
}

export type BlogSection = BlogHeaderSection | BlogToggleSection | BlogCtaSection;

export interface BlogPageDocument {
  id: 'blog';
  updatedAt: string;
  postOrder: string[];
  sections: BlogSection[];
}

const UPDATED_AT = '2026-10-13T13:00:00.000Z';

export function defaultBlogPage(): BlogPageDocument {
  return {
    id: 'blog',
    updatedAt: UPDATED_AT,
    postOrder: ['media-3', 'media-2', 'media-1'],
    sections: [
      {
        type: 'header',
        enabled: true,
        eyebrow: 'Portal',
        title: 'Blog',
        description:
          'Histórias, fotos, vídeos e avisos da Banda Carmelitana Luminarense. Acompanhe o que acontece dentro e fora do palco.',
      },
      { type: 'filters', enabled: true },
      { type: 'featured', enabled: true },
      { type: 'list', enabled: true },
      {
        type: 'cta',
        enabled: true,
        title: 'Quer saber onde a banda toca?',
        description: 'A agenda pública reúne datas, locais e descrições dos próximos eventos abertos à comunidade.',
        linkLabel: 'Ver agenda',
        href: '/agenda',
      },
    ],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function sectionOf<T extends BlogSection>(type: T['type']): T {
  const found = defaultBlogPage().sections.find((section) => section.type === type);
  return structuredClone(found) as T;
}

function sanitizeSection(raw: unknown): BlogSection | null {
  if (!isRecord(raw) || typeof raw.type !== 'string') return null;
  if (!BLOG_SECTION_TYPES.includes(raw.type as BlogSectionType)) return null;
  const type = raw.type as BlogSectionType;
  const enabled = typeof raw.enabled === 'boolean' ? raw.enabled : true;

  if (type === 'header') {
    const base = sectionOf<BlogHeaderSection>('header');
    return {
      type,
      enabled,
      eyebrow: asString(raw.eyebrow, base.eyebrow),
      title: asString(raw.title, base.title),
      description: asString(raw.description, base.description),
    };
  }

  if (type === 'cta') {
    const base = sectionOf<BlogCtaSection>('cta');
    const href = asString(raw.href, base.href).trim();
    return {
      type,
      enabled,
      title: asString(raw.title, base.title),
      description: asString(raw.description, base.description),
      linkLabel: asString(raw.linkLabel, base.linkLabel),
      href: href.startsWith('/') && !href.startsWith('//') ? href : base.href,
    };
  }

  return { type, enabled };
}

export function parseBlogPage(payload: unknown): BlogPageDocument {
  const defaults = defaultBlogPage();
  const row = Array.isArray(payload)
    ? payload.find((item) => isRecord(item) && item.id === 'blog') ?? payload[0]
    : payload;
  if (!isRecord(row)) return defaults;

  const used = new Set<BlogSectionType>();
  const sections: BlogSection[] = [];
  if (Array.isArray(row.sections)) {
    for (const raw of row.sections) {
      const section = sanitizeSection(raw);
      if (!section || used.has(section.type)) continue;
      used.add(section.type);
      sections.push(section);
    }
  }
  for (const fallback of defaults.sections) {
    if (!used.has(fallback.type)) sections.push(fallback);
  }

  const postOrder = Array.isArray(row.postOrder)
    ? row.postOrder.flatMap((id) => {
        if (typeof id === 'number' && Number.isFinite(id)) return [String(id)];
        if (typeof id === 'string' && id.trim()) return [id.trim()];
        return [];
      })
    : defaults.postOrder;

  return {
    id: 'blog',
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : defaults.updatedAt,
    postOrder,
    sections,
  };
}

export function blogSection(document: BlogPageDocument, type: 'header'): BlogHeaderSection | null;
export function blogSection(document: BlogPageDocument, type: 'cta'): BlogCtaSection | null;
export function blogSection(document: BlogPageDocument, type: 'filters' | 'featured' | 'list'): BlogToggleSection | null;
export function blogSection(document: BlogPageDocument, type: BlogSectionType): BlogSection | null {
  return document.sections.find((item) => item.type === type && item.enabled) ?? null;
}
