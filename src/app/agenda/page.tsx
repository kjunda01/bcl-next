'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { Presentation } from '@/domains/presentations/types';

export default function AgendaPage() {
  const [items, setItems] = useState<Presentation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Presentation[]>('/presentations')
      .then((list) => setItems(list.filter((item) => item.isPublic)))
      .catch(() => setError('Não foi possível carregar a agenda. Suba a API mock na porta 3001.'));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Portal</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">Agenda</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        Apresentações públicas da banda. Eventos internos só aparecem após o login.
      </p>
      {error && <p className="mt-6 text-[var(--destructive)]">{error}</p>}
      <div className="mt-10 space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)]">
            <p className="text-sm text-[var(--color-brand-strong)]">
              {new Date(item.startsAt).toLocaleString('pt-BR')}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">{item.title}</h2>
            <p className="mt-1 text-[var(--muted)]">{item.venue}</p>
            {item.description && <p className="mt-3">{item.description}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
