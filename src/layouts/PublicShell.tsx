'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { PUBLIC_NAV } from '@/core/navigation/menus';

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-50 border-b border-[var(--sidebar-border)] bg-[var(--header-bg)] text-[var(--header-fg)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-3 text-[var(--header-fg)] no-underline hover:no-underline">
            <img src="/assets/logo.png" alt="Banda Carmelitana" className="h-10 w-10 shrink-0 rounded-full" />
            <span className="truncate font-semibold tracking-tight">Banda Carmelitana</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Páginas públicas">
            {PUBLIC_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm no-underline hover:no-underline ${
                    active ? 'bg-[var(--color-brand)] text-[var(--color-ink)]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="btn-primary min-h-11 px-4"
              onClick={() => router.push('/login')}
            >
              Entrar
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Páginas públicas">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm no-underline hover:no-underline ${
                pathname === item.href ? 'bg-[var(--color-brand)] text-[var(--color-ink)]' : 'text-white/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--card)] py-8 text-sm text-[var(--muted)]">
        <div className="mx-auto max-w-6xl px-4">
          Banda Carmelitana Luminarense · Portal público
        </div>
      </footer>
    </div>
  );
}
