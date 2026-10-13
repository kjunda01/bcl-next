import { AlbumBlock } from '@/components/blog/AlbumBlock';
import { toEditorHtml } from '@/domains/media/richText';
import type { MediaSize, PostBlock, SectionLayout } from '@/domains/media/types';

const IMAGE_SIZE_CLASS: Record<MediaSize, string> = {
  small: 'w-full max-w-48',
  medium: 'w-full max-w-xl',
  large: 'w-full',
};

function sectionColumns(layout: SectionLayout, size: MediaSize): string {
  if (layout === 'stack-image' || layout === 'stack-text') return 'grid-cols-1';
  if (layout === 'text-image') {
    if (size === 'large') return 'md:grid-cols-[1fr_2fr]';
    if (size === 'small') return 'md:grid-cols-[2fr_1fr]';
    return 'md:grid-cols-2';
  }
  if (size === 'large') return 'md:grid-cols-[2fr_1fr]';
  if (size === 'small') return 'md:grid-cols-[1fr_2fr]';
  return 'md:grid-cols-2';
}

function SectionBlock({ block }: { block: Extract<PostBlock, { type: 'section' }> }) {
  const imageFirst = block.layout === 'image-text' || block.layout === 'stack-image';
  const stacked = block.layout === 'stack-image' || block.layout === 'stack-text';
  const text = block.text.trim() ? (
    <div className="post-rich-text min-w-0 text-base leading-relaxed text-[var(--foreground)]" dangerouslySetInnerHTML={{ __html: toEditorHtml(block.text) }} />
  ) : null;
  const image = block.src ? (
    <figure className={`m-0 min-w-0 ${stacked ? `mx-auto ${IMAGE_SIZE_CLASS[block.size]}` : 'w-full'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs definidos no post */}
      <img src={block.src} alt={block.alt} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]" />
      {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
    </figure>
  ) : null;

  return (
    <section>
      <div className={`grid items-center gap-6 ${sectionColumns(block.layout, block.size)}`}>
        {imageFirst ? (
          <>
            {image}
            {text}
          </>
        ) : (
          <>
            {text}
            {image}
          </>
        )}
      </div>
    </section>
  );
}

export function PostBlocks({ blocks }: { blocks: PostBlock[] }) {
  return (
    <div className="mt-8 space-y-8">
      {blocks.map((block) => {
        if (block.type === 'text') {
          if (!block.text.trim()) return null;
          return (
            <div
              key={block.id}
              className="post-rich-text text-base leading-relaxed text-[var(--foreground)]"
              dangerouslySetInnerHTML={{ __html: toEditorHtml(block.text) }}
            />
          );
        }

        if (block.type === 'section') {
          if (!block.text.trim() && !block.src) return null;
          return <SectionBlock key={block.id} block={block} />;
        }

        if (block.type === 'image') {
          if (!block.src) return null;
          return (
            <figure key={block.id} className={`m-0 ${IMAGE_SIZE_CLASS[block.size]}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs definidos no post */}
              <img src={block.src} alt={block.alt} className="w-full rounded-2xl object-cover shadow-[var(--shadow-soft)]" />
              {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (block.type === 'album') {
          return <AlbumBlock key={block.id} images={block.images} layout={block.layout} caption={block.caption} />;
        }

        if (block.type === 'video') {
          if (block.youtubeId) {
            return (
              <figure key={block.id} className="m-0">
                <div className="aspect-video overflow-hidden rounded-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/${block.youtubeId}`}
                    title={block.caption || 'Vídeo'}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
              </figure>
            );
          }
          if (!block.src) return null;
          return (
            <figure key={block.id} className="m-0">
              <video src={block.src} controls className="w-full rounded-2xl" />
              {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
            </figure>
          );
        }

        if (!block.src) return null;
        return (
          <figure key={block.id} className="m-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
            {block.title ? <figcaption className="mb-2 text-sm font-medium">{block.title}</figcaption> : null}
            <audio src={block.src} controls className="w-full" />
          </figure>
        );
      })}
    </div>
  );
}
