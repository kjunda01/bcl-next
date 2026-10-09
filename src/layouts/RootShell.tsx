'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/layouts/AppShell';
import { PublicShell } from '@/layouts/PublicShell';

export function RootShell({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname() ?? '/';
  const forcePublic = pathname === '/login';

  if (!isLoggedIn || forcePublic) {
    return <PublicShell>{children}</PublicShell>;
  }

  return <AppShell>{children}</AppShell>;
}
