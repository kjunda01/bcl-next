'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import type { MediaPost } from '@/domains/media/types';

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const [post, setPost] = useState<MediaPost | null | undefined>(undefined);

  const slug = params?.slug;

  useEffect(() => {
    if (!slug) return;
    apiFetch<MediaPost[]>('/media')
      .then((items) => setPost(items.find((item) => item.slug === slug) ?? null))
      .catch(() => setPost(null));
  }, [slug]);

  if (post === undefined) {
    return <div className="mx-auto max-w-3xl px-4 py-16">Carregando…</div>;
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold">Conteúdo não encontrado</h1>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{post.kind}</p>
      <h1 className="mt-2 text-4xl font-semibold">{post.title}</h1>
      <p className="mt-6 text-lg leading-relaxed">{post.body}</p>
    </article>
  );
}
