'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogPostCard } from '@/components/public/BlogPostCard';
import { PresentationEventCard } from '@/components/public/PresentationEventCard';
import { PublicSectionHeading } from '@/components/public/PublicSectionHeading';
import type { HomepageDocument, HomeSection } from '@/domains/homepage/types';
import type { MediaPost } from '@/domains/media/types';
import type { Presentation } from '@/domains/presentations/types';
import { upcomingPublicPresentations, publishedMediaPosts } from '@/lib/publicPortal';

interface HomePageContentProps {
  document: HomepageDocument;
  events: Presentation[];
  posts: MediaPost[];
  portalError: boolean;
  isLoggedIn: boolean;
  showEditorLink: boolean;
  postOrder?: string[];
}

const LINK_ICONS = ['event', 'article', 'info'] as const;

export function HomePageContent({
  document,
  events,
  posts,
  portalError,
  isLoggedIn,
  showEditorLink,
  postOrder = [],
}: HomePageContentProps) {
  const router = useRouter();
  const visible = document.sections.filter((section) => section.enabled);

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8 md:py-10">
      {showEditorLink ? (
        <div className="mb-4 flex justify-end">
          <Link href="/gestao/home" className="btn-outline-primary inline-flex min-h-11 items-center gap-2 px-4 text-sm">
            <span className="material-icons text-lg" aria-hidden>
              edit
            </span>
            Editar página inicial
          </Link>
        </div>
      ) : null}

      {visible.map((section) => (
        <HomeSectionBlock
          key={section.type}
          section={section}
          events={events}
          posts={posts}
          portalError={portalError}
          isLoggedIn={isLoggedIn}
          onCta={() => router.push(isLoggedIn ? '/gestao' : '/login')}
          postOrder={postOrder}
        />
      ))}
    </div>
  );
}

function HomeSectionBlock({
  section,
  events,
  posts,
  portalError,
  isLoggedIn,
  onCta,
  postOrder,
}: {
  section: HomeSection;
  events: Presentation[];
  posts: MediaPost[];
  portalError: boolean;
  isLoggedIn: boolean;
  onCta: () => void;
  postOrder: string[];
}) {
  if (section.type === 'hero') {
    return (
      <section id="portal-home-hero" className="portal-home-hero relative mb-10 overflow-hidden rounded-2xl md:mb-14">
        <div className="absolute inset-0">
          <Image src={section.imageUrl} alt="" fill className="object-cover" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/70 to-[var(--color-ink)]/40" />
        </div>
        <div className="relative z-10 px-4 py-10 text-center sm:px-6 sm:py-14 md:px-12 md:py-20">
          <Image
            src="/assets/logo.png"
            alt="Logo Banda Carmelitana"
            width={306}
            height={270}
            className="mx-auto h-auto w-24 object-contain"
          />
          <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-white/80">{section.eyebrow}</p>
          <h1 className="mt-3 text-[1.65rem] font-bold leading-tight tracking-tight text-white sm:text-3xl md:text-5xl">
            {section.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">{section.subtitle}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {section.links.map((link, index) =>
              link.label.trim() ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    index === 0
                      ? 'btn-primary inline-flex min-h-11 items-center justify-center gap-2 px-6'
                      : index === 1
                        ? 'btn-outline-primary inline-flex min-h-11 items-center justify-center gap-2 border-white/40 bg-white/10 px-6 text-white hover:bg-white/20'
                        : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] px-6 text-sm font-medium text-white/95 no-underline hover:bg-white/10'
                  }
                >
                  <span className="material-icons text-lg" aria-hidden>
                    {LINK_ICONS[index] ?? 'arrow_forward'}
                  </span>
                  {link.label}
                </Link>
              ) : null,
            )}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === 'highlights') {
    return (
      <section className="mb-10 grid gap-3 sm:grid-cols-3 md:mb-14">
        {section.items.map((item) => (
          <div
            key={`${item.value}-${item.label}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 text-center shadow-[var(--shadow-soft)]"
          >
            <p className="text-2xl font-bold text-[var(--color-brand-strong)]">{item.value}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.label}</p>
          </div>
        ))}
      </section>
    );
  }

  if (section.type === 'events') {
    const upcoming = upcomingPublicPresentations(events, section.limit);
    return (
      <section className="mb-10 md:mb-14">
        <PublicSectionHeading
          title={section.title}
          description={section.description}
          href="/agenda"
          linkLabel={section.linkLabel}
        />
        {portalError ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted)]">
            Não foi possível carregar os eventos agora. Acesse a{' '}
            <Link href="/agenda" className="text-[var(--color-brand-strong)]">
              agenda
            </Link>
            .
          </p>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <p className="text-[var(--muted)]">Nenhum evento público agendado no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {upcoming.map((event) => (
              <PresentationEventCard key={event.id} event={event} compact />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (section.type === 'blog') {
    const visiblePosts = publishedMediaPosts(posts, postOrder).slice(0, section.limit);
    return (
      <section className="mb-10 md:mb-14">
        <PublicSectionHeading
          title={section.title}
          description={section.description}
          href="/blog"
          linkLabel={section.linkLabel}
        />
        {visiblePosts.length === 0 && !portalError ? (
          <p className="text-[var(--muted)]">Em breve novas publicações.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {visiblePosts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (section.type === 'story') {
    return (
      <section className="mb-10 grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow-soft)] sm:p-6 md:mb-14 md:grid-cols-2 md:p-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-[var(--muted)]">{section.body}</p>
          <Link
            href="/sobre"
            className="mt-6 inline-flex min-h-11 items-center gap-1 font-medium text-[var(--color-brand-strong)] no-underline hover:underline"
          >
            {section.linkLabel}
            <span className="material-icons text-lg" aria-hidden>
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {section.images.map((image) => (
            <div key={image.src} className="relative aspect-square overflow-hidden rounded-xl">
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type === 'videos') {
    const ids = section.videoIds.slice(0, section.limit);
    return (
      <section className="mb-10 md:mb-14">
        <PublicSectionHeading title={section.title} description={section.description} />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ids.map((id, index) => (
            <div key={id} className="aspect-video overflow-hidden rounded-2xl shadow-[var(--shadow-soft)]">
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                title={`Vídeo ${index + 1} — Banda Carmelitana`}
                className="h-full w-full border-0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (section.type !== 'cta') return null;

  return (
    <section className="rounded-2xl bg-[var(--color-ink)] px-4 py-8 text-center text-[var(--header-fg)] sm:px-6 sm:py-10 md:px-10">
      <h2 className="text-2xl font-semibold">{isLoggedIn ? section.titleLoggedIn : section.titleLoggedOut}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
        {isLoggedIn ? section.bodyLoggedIn : section.bodyLoggedOut}
      </p>
      <button type="button" className="btn-primary mt-6 min-h-11 px-8" onClick={onCta}>
        {isLoggedIn ? section.buttonLoggedIn : section.buttonLoggedOut}
      </button>
    </section>
  );
}
