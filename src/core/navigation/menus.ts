import type { Action, Resource } from '@/core/auth/permissions';
import { can } from '@/core/auth/permissions';
import type { AccessRoles } from '@/core/auth/roles';
import { DOMAINS } from '@/domains/catalog';

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const PUBLIC_NAV: NavItem[] = [
  { href: '/', label: 'Início', icon: 'home' },
  { href: '/agenda', label: 'Agenda', icon: 'event' },
  { href: '/blog', label: 'Blog', icon: 'article' },
  { href: '/sobre', label: 'Sobre', icon: 'info' },
];

const MANAGEMENT_NAV_SOURCE: Array<NavItem & { resource: Resource; action?: Action }> = [
  { href: '/gestao', label: 'Painel', icon: 'dashboard', resource: 'portal', action: 'read' },
  { href: '/study', label: 'Estudo', icon: 'school', resource: 'songs', action: 'read' },
  ...DOMAINS.filter((domain) => domain.navGroup === 'management').map((domain) => ({
    href: domain.path,
    label: domain.label,
    icon: domain.icon,
    resource: domain.id,
    action: 'read' as const,
  })),
];

export function getManagementNav(roles: AccessRoles): NavItem[] {
  return MANAGEMENT_NAV_SOURCE.filter((item) => can(roles, item.resource, item.action ?? 'read')).map(
    ({ href, label, icon }) => ({ href, label, icon }),
  );
}

export function titleForPath(pathname: string): string {
  const path = pathname.split('?')[0];
  const match = [...PUBLIC_NAV, ...MANAGEMENT_NAV_SOURCE].find(
    (item) => item.href === path || (item.href !== '/' && path.startsWith(item.href)),
  );
  if (match) return match.label;
  if (path === '/login') return 'Entrar';
  if (path === '/profile') return 'Meu perfil';
  if (path === '/settings') return 'Configurações';
  if (path.startsWith('/study')) return 'Estudo';
  return 'Banda Carmelitana';
}
