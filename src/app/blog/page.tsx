'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import type { MediaPost } from '@/domains/media/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MediaPost[]>('/media')
      .then((items) => setPosts(items.filter((item) => item.status === 'published')))
      .catch(() => setError('Não foi possível carregar o blog. Suba a API mock na porta 3001.'));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Portal</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Histórias, fotos e avisos da Banda Carmelitana Luminarense.
      </p>
      {error && <p className="mt-6 text-[var(--destructive)]">{error}</p>}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] no-underline shadow-[var(--shadow-soft)] hover:no-underline"
          >
            {post.coverUrl && (
              <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverUrl})` }} />
            )}
            <div className="p-5">
              <p className="text-xs uppercase tracking-wide text-[var(--color-brand-strong)]">{post.kind}</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--foreground)]">{post.title}</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">{post.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
