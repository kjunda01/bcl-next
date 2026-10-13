import Link from 'next/link';

interface PublicSectionHeadingProps {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function PublicSectionHeading({ title, description, href, linkLabel = 'Ver tudo' }: PublicSectionHeadingProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-[var(--color-brand-strong)] no-underline hover:underline"
        >
          {linkLabel}
          <span className="material-icons text-lg" aria-hidden>
            arrow_forward
          </span>
        </Link>
      ) : null}
    </div>
  );
}
