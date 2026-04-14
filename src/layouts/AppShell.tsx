"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const BOTTOM_NAV = [
  { icon: 'home', label: 'Início', to: '/' },
  { icon: 'menu_book', label: 'Partituras', to: '/study' },
  { icon: 'school', label: 'Alunos', to: '/students' },
  { icon: 'library_music', label: 'Repertório', to: '/songs' },
] as const;

const MORE_ITEMS = [
  { icon: 'photo_library', label: 'Galeria', to: '/gallery-view' },
  { icon: 'spatial_audio_off', label: 'Músicos', to: '/musicians' },
  { icon: 'cast_for_education', label: 'Apresentações', to: '/presentations' },
  { icon: 'inventory_2', label: 'Patrimônio', to: '/patrimony' },
  { icon: 'music_note', label: 'Instrumentos', to: '/instruments' },
  { icon: 'photo_library', label: 'Galeria (admin)', to: '/gallery' },
] as const;

function titleForPath(pathname: string): string {
  const path = pathname.split('?')[0];
  if (path === '/' || path === '/home') return 'Início';
  if (path === '/login') return 'Entrar';
  if (path === '/profile') return 'Meu perfil';
  if (path.startsWith('/study')) return 'Partituras';
  if (path.startsWith('/students')) return 'Alunos';
  if (path.startsWith('/songs')) return 'Repertório';
  if (path.startsWith('/musicians')) return 'Músicos';
  if (path.startsWith('/presentations')) return 'Apresentações';
  if (path.startsWith('/gallery')) return 'Galeria';
  if (path.startsWith('/patrimony')) return 'Patrimônio';
  if (path.startsWith('/instruments')) return 'Instrumentos';
  return 'Banda Carmelitana';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [desktop, setDesktop] = useState(false);
  const [sidenavCollapsed, setSidenavCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userMenuOpenMobile, setUserMenuOpenMobile] = useState(false);
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)');
    const onMediaChange = () => setDesktop(mq.matches);

    const hydrateState = () => {
      setDesktop(mq.matches);
      const savedCollapse = window.localStorage.getItem('app.sidenavCollapsed');
      setSidenavCollapsed(savedCollapse === 'true');
    };

    requestAnimationFrame(hydrateState);
    mq.addEventListener('change', onMediaChange);
    return () => mq.removeEventListener('change', onMediaChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.user-menu')) {
        setUserMenuOpen(false);
      }
      if (userMenuOpenMobile && !(event.target as Element).closest('.user-menu-mobile')) {
        setUserMenuOpenMobile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, userMenuOpenMobile]);

  const contentMargin = desktop ? (sidenavCollapsed ? 56 : 300) : 0;
  const pageTitle = titleForPath(pathname);
  const isActiveRoute = (to: string) => pathname === to || (to !== '/' && pathname.startsWith(to));
  const toggleCollapsed = () => {
    const next = !sidenavCollapsed;
    setSidenavCollapsed(next);
    localStorage.setItem('app.sidenavCollapsed', String(next));
  };

  const { theme, setTheme } = useTheme();

  return (
    <div
      className="relative min-h-screen md:min-h-screen w-full flex app-shell-container"
      style={{ ['--content-margin' as string]: `${contentMargin}px` }}
    >
      {/* Sidenav */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-[100] flex flex-col shadow-lg transition-all duration-200 app-shell-sidenav ${
          sidenavCollapsed ? 'w-14 min-w-[3.5rem]' : 'w-[300px]'
        } ${desktop ? '' : 'hidden'}`}
        style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}
        aria-label={desktop ? 'Navegação principal' : 'Menu Mais'}
      >
        {/* Sidenav Header */}
        <div className={`flex-shrink-0 ${!sidenavCollapsed ? 'px-4 py-4' : 'px-1 py-1'} bg-primary text-white flex items-center justify-center gap-4`}>
          <Image src="/assets/logo.png" alt="Banda Carmelitana" className="w-16 h-16" width={60} height={60} />
          {!sidenavCollapsed && <span className="font-bold text-lg">Banda Carmelitana</span>}
        </div>

        <hr className="border-t border-gray-200 dark:border-gray-700 m-0" />

        {/* Sidenav Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {BOTTOM_NAV.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 px-4 py-3 text-foreground no-underline cursor-pointer transition-colors hover:bg-secondary ${
                isActiveRoute(item.to)
                  ? 'bg-secondary text-primary font-semibold'
                  : ''
              } ${sidenavCollapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <span className="material-icons text-2xl w-5.5 flex-shrink-0">{item.icon}</span>
              {!sidenavCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}

          {!sidenavCollapsed && (
            <div className="px-4 py-2 text-xs font-semibold uppercase text-muted">Mais</div>
          )}

          {MORE_ITEMS.map((item) => (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3 px-4 py-3 text-foreground no-underline cursor-pointer transition-colors hover:bg-secondary ${
                isActiveRoute(item.to)
                  ? 'bg-secondary text-primary font-semibold'
                  : ''
              } ${sidenavCollapsed ? 'justify-center px-0' : ''}`}
              title={item.label}
            >
              <span className="material-icons text-2xl w-5.5 flex-shrink-0">{item.icon}</span>
              {!sidenavCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}

          {desktop && (
            <>
              <hr className="border-t border-muted my-2" />
              {!auth.isLoggedIn && (
                <button
                  type="button"
                  className={`w-full flex items-center gap-3 px-4 py-3 text-foreground no-underline cursor-pointer transition-colors hover:bg-secondary ${
                    sidenavCollapsed ? 'justify-center px-0' : ''
                  }`}
                  onClick={() => router.push('/settings')}
                >
                  <span className="material-icons text-2xl w-5.5 flex-shrink-0">settings</span>
                  {!sidenavCollapsed && <span className="text-sm">Configurações</span>}
                </button>
              )}
              <button
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 text-foreground no-underline cursor-pointer transition-colors hover:bg-secondary ${
                  sidenavCollapsed ? 'justify-center px-0' : ''
                }`}
                onClick={() => router.push(auth.isLoggedIn ? '/profile' : '/login')}
              >
                <span className="material-icons text-2xl w-5.5 flex-shrink-0">account_circle</span>
                {!sidenavCollapsed && (
                  <span className="text-sm">
                    {auth.isLoggedIn ? `Olá, ${auth.displayName}` : 'Entrar'}
                  </span>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Sidenav Footer */}
        {desktop && (
          <div className="flex-shrink-0 px-2 py-2 border-t border-muted flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-secondary cursor-pointer text-foreground"
              onClick={toggleCollapsed}
              aria-label={sidenavCollapsed ? 'Expandir menu' : 'Recolher menu'}
              title={sidenavCollapsed ? 'Expandir menu' : 'Recolher menu'}
            >
              <span className="material-icons">
                {sidenavCollapsed ? 'chevron_right' : 'chevron_left'}
              </span>
            </button>
          </div>
        )}
        <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="mt-2 px-4 py-2 bg-primary text-white rounded"
            >
              Alternar Tema
            </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header (Mobile) */}
        {!desktop && (
          <header className="sticky top-0 z-50 flex items-center gap-2 px-4 h-14 bg-primary text-white shadow-md" suppressHydrationWarning>
            <button
              type="button"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-white/10 cursor-pointer text-white"
              aria-label="Abrir menu Mais"
              onClick={() => setMoreOpen((v) => !v)}
            >
              <span className="material-icons">menu</span>
            </button>
            <span className="font-bold text-base">{pageTitle}</span>
            <span className="flex-1" />
            {auth.isLoggedIn ? (
              <div className="relative user-menu-mobile">
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-white/10 cursor-pointer text-white"
                  aria-label="Conta"
                  onClick={() => setUserMenuOpenMobile(!userMenuOpenMobile)}
                >
                  <span className="material-icons">account_circle</span>
                </button>
                {userMenuOpenMobile && (
                  <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-48" suppressHydrationWarning>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary text-sm"
                      onClick={() => {
                        setUserMenuOpenMobile(false);
                        router.push('/profile');
                      }}
                    >
                      <span className="material-icons text-lg">person</span>
                      Perfil
                    </button>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary text-sm"
                      onClick={() => {
                        setUserMenuOpenMobile(false);
                        router.push('/settings');
                      }}
                    >
                      <span className="material-icons text-lg">settings</span>
                      Configurações
                    </button>
                    <hr className="border-t border-muted" />
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary text-sm"
                      onClick={() => {
                        setUserMenuOpenMobile(false);
                        auth.logout();
                        router.push('/');
                      }}
                    >
                      <span className="material-icons text-lg">logout</span>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="bg-transparent border-0 text-white font-semibold cursor-pointer text-sm hover:opacity-80"
                onClick={() => router.push('/login')}
              >
                Entrar
              </button>
            )}
          </header>
        )}

        {/* Mobile Drawer Backdrop */}
        {!desktop && moreOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-120"
            onClick={() => setMoreOpen(false)}
            aria-hidden
          />
        )}

        {/* Mobile Drawer */}
        {!desktop && moreOpen && (
          <aside className="fixed top-0 left-0 bottom-0 w-80/100 max-w-280px z-130 shadow-2xl flex flex-col" style={{ backgroundColor: 'var(--sidebar-bg)' }} aria-label="Menu">
            <div className="flex items-center justify-between px-4 py-4 font-semibold border-b border-muted flex-shrink-0">
              <span className="text-foreground font-semibold">Menu</span>
              <button
                type="button"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-transparent hover:bg-secondary cursor-pointer text-foreground"
                onClick={() => setMoreOpen(false)}
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <nav className="overflow-y-auto py-2">
              {[...BOTTOM_NAV, ...MORE_ITEMS].map((item) => (
                <Link
                  key={`${item.to}-${item.label}`}
                  href={item.to}
                  className="flex items-center gap-3 px-4 py-3 text-foreground no-underline text-sm hover:bg-secondary"
                  onClick={() => setMoreOpen(false)}
                >
                  <span className="material-icons text-2xl">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto px-2.5 pt-4 app-shell-main ${desktop ? 'ml-[var(--content-margin)]' : ''} ${!desktop ? 'pb-16' : ''}`}>
          {children}
        </main>

        {/* Bottom Navigation (Mobile) */}
        {!desktop && (
          <nav className="fixed bottom-0 left-0 right-0 z-60 flex h-14 shadow-lg" style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--nav-border)' }} aria-label="Navegação principal">
            {BOTTOM_NAV.map((item) => (
              <Link
                key={item.to}
                href={item.to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-muted no-underline cursor-pointer ${
                  isActiveRoute(item.to) ? 'text-primary font-semibold' : ''
                }`}
              >
                <span className="material-icons text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              type="button"
              className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs text-muted bg-transparent border-0 cursor-pointer hover:bg-secondary"
              onClick={() => setMoreOpen(true)}
            >
              <span className="material-icons text-2xl">more_horiz</span>
              <span>Mais</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
