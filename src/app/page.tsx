'use client';

import { useEffect, useState } from 'react';
import { HomePageContent } from '@/components/public/HomePageContent';
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/core/auth/permissions';
import { defaultBlogPage, parseBlogPage } from '@/domains/blog/layout';
import { defaultHomepage, parseHomepagePayload, type HomepageDocument } from '@/domains/homepage/types';
import type { MediaPost } from '@/domains/media/types';
import type { Presentation } from '@/domains/presentations/types';
import { apiFetch } from '@/lib/api';

export default function HomePage() {
  const { isLoggedIn, isHydrated, roles } = useAuth();
  const [homepage, setHomepage] = useState<HomepageDocument>(defaultHomepage);
  const [events, setEvents] = useState<Presentation[]>([]);
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [postOrder, setPostOrder] = useState<string[]>(defaultBlogPage().postOrder);
  const [portalError, setPortalError] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiFetch<unknown>('/homepage'),
      apiFetch<Presentation[]>('/presentations'),
      apiFetch<MediaPost[]>('/media'),
      apiFetch<unknown>('/blogpage').catch(() => null),
    ])
      .then(([home, presentations, media, blog]) => {
        if (!active) return;
        setHomepage(parseHomepagePayload(home));
        setEvents(presentations);
        setPosts(media);
        if (blog) setPostOrder(parseBlogPage(blog).postOrder);
        setPortalError(false);
      })
      .catch(() => {
        if (!active) return;
        setHomepage(defaultHomepage());
        setPortalError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <HomePageContent
      document={homepage}
      events={events}
      posts={posts}
      portalError={portalError}
      isLoggedIn={isLoggedIn}
      showEditorLink={isHydrated && can(roles, 'homepage', 'update')}
      postOrder={postOrder}
    />
  );
}
