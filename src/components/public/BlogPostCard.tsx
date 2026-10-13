import Image from 'next/image';
import Link from 'next/link';
import { formatPublishedDate, mediaKindLabel } from '@/lib/publicPortal';
import type { MediaPost } from '@/domains/media/types';

interface BlogPostCardProps {
  post: MediaPost;
  featured?: boolean;
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const published = formatPublishedDate(post.publishedAt ?? post.createdAt);

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group grid overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] no-underline hover:no-underline md:grid-cols-2"
      >
        {post.coverUrl ? (
          <div className="relative min-h-[220px] md:min-h-full">
            <Image
              src={post.coverUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        ) : null}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-strong)]">
            {mediaKindLabel(post.kind)}
            {published ? ` · ${published}` : ''}
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--color-brand-strong)] md:text-3xl">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-[var(--muted)]">{post.excerpt}</p>
          <span className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--color-brand-strong)]">
            Ler agora
            <span className="material-icons text-lg" aria-hidden>
              arrow_forward
            </span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)] no-underline hover:no-underline"
    >
      {post.coverUrl ? (
        <div className="relative h-44 w-full shrink-0">
          <Image
            src={post.coverUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      ) : (
        <div className="flex h-44 items-center justify-center bg-[var(--accent)] text-[var(--color-brand-strong)]" aria-hidden>
          <span className="material-icons text-5xl">article</span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-strong)]">
          {mediaKindLabel(post.kind)}
          {published ? ` · ${published}` : ''}
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-snug text-[var(--foreground)] group-hover:text-[var(--color-brand-strong)]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-[var(--muted)]">{post.excerpt}</p>
      </div>
    </Link>
  );
}
