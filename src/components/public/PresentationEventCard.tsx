import Image from 'next/image';
import Link from 'next/link';
import { formatPresentationWhen } from '@/lib/publicPortal';
import type { Presentation } from '@/domains/presentations/types';

interface PresentationEventCardProps {
  event: Presentation;
  compact?: boolean;
}

export function PresentationEventCard({ event, compact = false }: PresentationEventCardProps) {
  const when = formatPresentationWhen(event.startsAt);

  if (compact) {
    return (
      <article className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)]">
        {event.coverUrl ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
            <Image src={event.coverUrl} alt="" fill className="object-cover" sizes="80px" />
          </div>
        ) : (
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--color-brand-strong)]"
            aria-hidden
          >
            <span className="material-icons text-3xl">event</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-brand-strong)]">{when}</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-[var(--foreground)]">{event.title}</h3>
          <p className="mt-1 truncate text-sm text-[var(--muted)]">{event.venue}</p>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-soft)]">
      {event.coverUrl ? (
        <div className="relative h-44 w-full">
          <Image src={event.coverUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>
      ) : null}
      <div className="p-6">
        <p className="text-sm font-medium text-[var(--color-brand-strong)]">{when}</p>
        <h2 className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{event.title}</h2>
        <p className="mt-1 text-[var(--muted)]">{event.venue}</p>
        {event.description ? <p className="mt-3 leading-relaxed text-[var(--foreground)]">{event.description}</p> : null}
        <Link
          href="/agenda"
          className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--color-brand-strong)] no-underline hover:underline"
        >
          Ver na agenda
          <span className="material-icons text-base" aria-hidden>
            arrow_forward
          </span>
        </Link>
      </div>
    </article>
  );
}
