'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { PortalIntroSplash } from '@/components/public/PortalIntroSplash';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/layouts/AppShell';
import { PublicShell } from '@/layouts/PublicShell';

export function RootShell({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname() ?? '/';
  const forcePublic = pathname === '/login';
  const [homeIntroKey, setHomeIntroKey] = useState(0);

  useEffect(() => {
    if (pathname !== '/') {
      setHomeIntroKey(0);
      return;
    }
    setHomeIntroKey((key) => key + 1);
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (href !== '/') return;
      if (pathname !== '/') return;
      setHomeIntroKey((key) => key + 1);
    };
    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [pathname]);

  const shell =
    !isLoggedIn || forcePublic ? (
      <PublicShell>{children}</PublicShell>
    ) : (
      <AppShell>{children}</AppShell>
    );

  return (
    <>
      {homeIntroKey > 0 ? <PortalIntroSplash key={homeIntroKey} playKey={homeIntroKey} /> : null}
      {shell}
    </>
  );
}
