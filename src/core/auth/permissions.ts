import type { AccessRoles, Role } from './roles';
import { hasRole, isPrivilegedRole } from './roles';

export const RESOURCES = [
  'portal',
  'users',
  'people',
  'songs',
  'patrimony',
  'instruments',
  'presentations',
  'media',
  'homepage',
  'blogpage',
] as const;

export type Resource = (typeof RESOURCES)[number];

export const ACTIONS = ['read', 'create', 'update', 'delete', 'manage_roles', 'assign_admin'] as const;
export type Action = (typeof ACTIONS)[number];

export type Permission = `${Resource}:${Action}`;

/** Domínios com formulário genérico. A home tem editor próprio. */
export type CrudResource = Exclude<Resource, 'portal' | 'homepage' | 'blogpage'>;

export type PeopleReadScope = 'none' | 'students' | 'members';

const FULL_CRUD: Action[] = ['read', 'create', 'update', 'delete'];

const ROLE_ACTIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  public: {
    portal: ['read'],
  },
  aluno: {
    portal: ['read'],
    songs: ['read'],
    instruments: ['read'],
    people: ['read'],
    presentations: ['read'],
  },
  musico: {
    portal: ['read'],
    songs: ['read'],
    patrimony: ['read'],
    instruments: ['read'],
    people: ['read'],
    presentations: ['read'],
  },
  maestro: {
    portal: ['read'],
    media: FULL_CRUD,
    songs: FULL_CRUD,
    patrimony: FULL_CRUD,
    instruments: FULL_CRUD,
    people: FULL_CRUD,
    presentations: FULL_CRUD,
    users: [...FULL_CRUD, 'manage_roles'],
  },
  admin: {
    portal: ['read'],
    media: FULL_CRUD,
    songs: FULL_CRUD,
    patrimony: FULL_CRUD,
    instruments: FULL_CRUD,
    people: FULL_CRUD,
    presentations: FULL_CRUD,
    users: [...FULL_CRUD, 'manage_roles', 'assign_admin'],
    homepage: ['read', 'update'],
    blogpage: ['read', 'update'],
  },
};

export function can(roles: AccessRoles, resource: Resource, action: Action): boolean {
  return roles.some((role) => ROLE_ACTIONS[role][resource]?.includes(action) ?? false);
}

export function peopleReadScope(roles: AccessRoles): PeopleReadScope {
  if (roles.some((role) => role === 'musico' || isPrivilegedRole(role))) return 'members';
  if (hasRole(roles, 'aluno')) return 'students';
  return 'none';
}

export function shouldMaskSensitivePersonData(roles: AccessRoles): boolean {
  if (roles.some(isPrivilegedRole)) return false;
  return hasRole(roles, 'aluno') || hasRole(roles, 'musico');
}

export function canAssignRole(actorRoles: AccessRoles, targetRole: Role): boolean {
  if (hasRole(actorRoles, 'admin')) return true;
  if (hasRole(actorRoles, 'maestro')) return targetRole !== 'admin';
  return false;
}
