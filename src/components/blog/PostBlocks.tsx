import type { ReactNode } from 'react';
import { AlbumBlock } from '@/components/blog/AlbumBlock';
import { toEditorHtml } from '@/domains/media/richText';
import type { MediaSize, PostBlock, SectionLayout } from '@/domains/media/types';

const IMAGE_LIMIT: Record<MediaSize, string> = {
  small: 'max-h-56 max-w-xs',
  medium: 'max-h-80 max-w-xl',
  large: 'max-h-[32rem] max-w-4xl',
};

const naturalImageClass = 'mx-auto block h-auto w-auto max-w-full rounded-2xl shadow-[var(--shadow-soft)]';

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
    <figure className="m-0 min-w-0">
      {/* eslint-disable-next-line @next/next/no-img-element -- URLs definidos no post */}
      <img
        src={block.src}
        alt={block.alt}
        className={
          stacked
            ? `${naturalImageClass} ${IMAGE_LIMIT[block.size]}`
            : 'h-auto max-h-80 w-full rounded-2xl object-cover object-center shadow-[var(--shadow-soft)]'
        }
      />
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

function VideoFigure({ block }: { block: Extract<PostBlock, { type: 'video' }> }) {
  if (block.youtubeId) {
    return (
      <figure className="m-0 min-w-0">
        <div className="aspect-video overflow-hidden rounded-2xl bg-black">
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
    <figure className="m-0 min-w-0">
      <video src={block.src} controls className="aspect-video w-full rounded-2xl bg-black object-contain" />
      {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
    </figure>
  );
}

export function PostBlocks({ blocks }: { blocks: PostBlock[] }) {
  const rendered: ReactNode[] = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.type !== 'video') {
      rendered.push(<SingleBlock key={block.id} block={block} />);
      continue;
    }
    const videos: Extract<PostBlock, { type: 'video' }>[] = [];
    while (index < blocks.length && blocks[index].type === 'video') {
      videos.push(blocks[index] as Extract<PostBlock, { type: 'video' }>);
      index += 1;
    }
    index -= 1;
    rendered.push(
      <div key={videos[0].id} className={`grid gap-4 ${videos.length > 1 ? 'sm:grid-cols-2' : 'mx-auto w-full max-w-3xl'}`}>
        {videos.map((video) => (
          <VideoFigure key={video.id} block={video} />
        ))}
      </div>,
    );
  }

  return <div className="mt-8 space-y-8">{rendered}</div>;
}

function SingleBlock({ block }: { block: PostBlock }) {
  if (block.type === 'text') {
    if (!block.text.trim()) return null;
    return (
      <div
        className="post-rich-text text-base leading-relaxed text-[var(--foreground)]"
        dangerouslySetInnerHTML={{ __html: toEditorHtml(block.text) }}
      />
    );
  }

  if (block.type === 'section') {
    if (!block.text.trim() && !block.src) return null;
    return <SectionBlock block={block} />;
  }

  if (block.type === 'image') {
    if (!block.src) return null;
    return (
      <figure className="m-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- URLs definidos no post */}
        <img src={block.src} alt={block.alt} className={`${naturalImageClass} ${IMAGE_LIMIT[block.size]}`} />
        {block.caption ? <figcaption className="mt-2 text-sm text-[var(--muted)]">{block.caption}</figcaption> : null}
      </figure>
    );
  }

  if (block.type === 'album') {
    return <AlbumBlock images={block.images} layout={block.layout} caption={block.caption} />;
  }

  if (block.type === 'video') return <VideoFigure block={block} />;

  if (!block.src) return null;
  return (
    <figure className="m-0 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
      {block.title ? <figcaption className="mb-2 text-sm font-medium">{block.title}</figcaption> : null}
      <audio src={block.src} controls className="w-full" />
    </figure>
  );
}
