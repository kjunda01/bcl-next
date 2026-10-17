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
import { UNDER_CONSTRUCTION_MESSAGE } from '@/lib/userMessages';
import styles from './HomePageContent.module.scss';

interface HomePageContentProps {
  document: HomepageDocument;
  events: Presentation[];
  posts: MediaPost[];
  portalError: boolean;
  isLoggedIn: boolean;
  showEditorLink: boolean;
  postOrder?: string[];
  proposal?: string;
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
  proposal,
}: HomePageContentProps) {
  const router = useRouter();
  const visible = document.sections.filter((section) => section.enabled);
  const order: HomeSection['type'][] = ['cta', 'events', 'blog', 'highlights', 'story', 'videos'];
  const editorialLayout = proposal === undefined || proposal === 'capa-materias';
  const hero = visible.find((section) => section.type === 'hero');
  const ordered = order.map((type) => visible.find((section) => section.type === type)).filter((section): section is HomeSection => Boolean(section));
  const feedStart = ordered.findIndex((section) => section.type === 'events' || section.type === 'blog');
  const feedSections = ordered.filter((section) => section.type === 'events' || section.type === 'blog');
  const renderSection = (section: HomeSection) => (
    <HomeSectionBlock
      key={section.type}
      section={section}
      events={events}
      posts={posts}
      portalError={portalError}
      isLoggedIn={isLoggedIn}
      onCta={() => router.push(isLoggedIn ? '/gestao' : '/login')}
      postOrder={postOrder}
      prototypeEditorial={editorialLayout}
    />
  );
  const pageSections = proposal === undefined && feedStart >= 0
    ? <>
        {ordered.slice(0, feedStart).map(renderSection)}
        <div data-home-feed-block="true" className={`${styles.feedBlock} ${feedSections.length === 1 ? styles.singleFeedBlock : ''}`}>
          {feedSections.map(renderSection)}
        </div>
        {ordered.slice(feedStart).filter((section) => section.type !== 'events' && section.type !== 'blog').map(renderSection)}
      </>
    : ordered.map(renderSection);

  return (
    <div className={styles.page} data-proposal={proposal}>
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

      {hero ? <HomeSectionBlock key="hero" section={hero} events={events} posts={posts} portalError={portalError} isLoggedIn={isLoggedIn} onCta={() => router.push(isLoggedIn ? '/gestao' : '/login')} postOrder={postOrder} prototypeEditorial={editorialLayout} /> : null}
      <div data-home-content="true" className={styles.content}>
        {pageSections}
      </div>
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
  prototypeEditorial,
}: {
  section: HomeSection;
  events: Presentation[];
  posts: MediaPost[];
  portalError: boolean;
  isLoggedIn: boolean;
  onCta: () => void;
  postOrder: string[];
  prototypeEditorial: boolean;
}) {
  if (section.type === 'hero') {
    const agendaIndex = section.links.findIndex((link) => link.href === '/agenda');
    const primaryIndex = agendaIndex >= 0 ? agendaIndex : 0;

    return (
      <section id="portal-home-hero" data-home-section="hero" className={`${styles.hero} portal-home-hero`}>
        <div data-home-copy="true" className={styles.heroCopy}>
          <p data-home-eyebrow="true" className={styles.eyebrow}>{section.eyebrow}</p>
          <h1>
            {section.title}
          </h1>
          <p data-home-subtitle="true" className={styles.heroSubtitle}>{section.subtitle}</p>
          <div data-home-actions="true" className={styles.heroActions}>
            {section.links.map((link, index) =>
              link.label.trim() ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    index === primaryIndex
                      ? `btn-primary ${styles.primaryAction}`
                      : styles.secondaryAction
                  }
                  data-home-primary={index === primaryIndex ? 'true' : undefined}
                >
                  <span className="material-icons" aria-hidden>
                    {LINK_ICONS[index] ?? 'arrow_forward'}
                  </span>
                  {link.label}
                </Link>
              ) : null,
            )}
          </div>
        </div>
        <div data-home-image="true" className={styles.heroImage}><Image src={section.imageUrl} alt="" fill className="object-cover" priority sizes="(max-width: 700px) 100vw, 42vw" /></div>
      </section>
    );
  }

  if (section.type === 'highlights') {
    return (
      <section data-home-section="highlights" className={`${styles.highlights} mb-10 grid gap-3 sm:grid-cols-3 md:mb-14`}>
        {section.items.map((item) => (
          <div
            key={`${item.value}-${item.label}`}
            data-home-highlight="true"
            className={styles.highlight}
          >
            <p>{item.value.trim() === '1910' ? '1912' : item.value}</p>
            <span>{item.value.trim() === '1910' ? 'Primeiro estatuto da Corporação' : item.label}</span>
          </div>
        ))}
      </section>
    );
  }

  if (section.type === 'events') {
    const upcoming = upcomingPublicPresentations(events, section.limit);
    return (
      <section data-home-section="events" className={`${styles.section} ${styles.eventsSection}`}>
        <PublicSectionHeading
          title={section.title}
          description={section.description}
          href="/agenda"
          linkLabel={section.linkLabel}
        />
        {portalError ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-[var(--muted)]">
            {UNDER_CONSTRUCTION_MESSAGE}
          </p>
        ) : upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <p className="text-[var(--muted)]">Nenhum evento público agendado no momento.</p>
          </div>
        ) : (
          <div data-home-event-grid="true" className="grid gap-4 md:grid-cols-3">
            {upcoming.map((event) => (
              <PresentationEventCard key={event.id} event={event} compact />
            ))}
          </div>
        )}
      </section>
    );
  }

  if (section.type === 'blog') {
    const visiblePosts = publishedMediaPosts(posts, prototypeEditorial ? [] : postOrder).slice(0, section.limit);
    return (
      <section data-home-section="blog" className={`${styles.section} ${styles.blogSection}`}>
        <PublicSectionHeading
          title={section.title}
          description={section.description}
          href={prototypeEditorial ? undefined : '/blog'}
          linkLabel={section.linkLabel}
        />
        {visiblePosts.length === 0 && !portalError ? (
          <p className="text-[var(--muted)]">Em breve novas publicações.</p>
        ) : (
          <div data-home-post-grid="true" className={styles.postGrid}>
            {visiblePosts.map((post, index) => (
              <BlogPostCard key={post.id} post={post} featured={index === 0} />
            ))}
          </div>
        )}
        {prototypeEditorial ? (
          <Link href="/blog" className={styles.blogMoreLink}>
            Ver mais matérias
            <span className="material-icons" aria-hidden>arrow_forward</span>
          </Link>
        ) : null}
      </section>
    );
  }

  if (section.type === 'story') {
    return (
      <section data-home-section="story" className={`${styles.section} ${styles.storySection}`}>
        <div data-home-story-copy="true" className={styles.storyCopy}>
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
        <div data-home-gallery="true" className={styles.storyGallery}>
          {section.images.map((image) => (
            <div key={image.src} className={styles.storyImage}>
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
      <section data-home-section="videos" className={styles.section}>
        <PublicSectionHeading title={section.title} description={section.description} />
        <div className={styles.videoGrid}>
          {ids.map((id, index) => (
            <div key={id} className={styles.videoFrame}>
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
    <section data-home-section="cta" className={`${styles.section} ${styles.ctaSection}`}>
      <div>
        <h2>{isLoggedIn ? section.titleLoggedIn : section.titleLoggedOut}</h2>
        <p>{isLoggedIn ? section.bodyLoggedIn : section.bodyLoggedOut}</p>
      </div>
      <button type="button" className="btn-primary min-h-11 px-8" onClick={onCta}>
        {isLoggedIn ? section.buttonLoggedIn : section.buttonLoggedOut}
      </button>
    </section>
  );
}
