export const ROLES = ['public', 'aluno', 'musico', 'maestro', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  public: 'Público',
  aluno: 'Aluno',
  musico: 'Músico',
  maestro: 'Maestro',
  admin: 'Administrador',
};

export const AUTHENTICATED_ROLES = ['aluno', 'musico', 'maestro', 'admin'] as const;
export type AuthenticatedRole = (typeof AUTHENTICATED_ROLES)[number];
export type AccessRoles = readonly Role[];

export const PUBLIC_ROLES: AccessRoles = ['public'];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function isPrivilegedRole(role: Role): boolean {
  return role === 'admin' || role === 'maestro';
}

export function hasRole(roles: AccessRoles, role: Role): boolean {
  return roles.includes(role);
}

export function roleLabels(roles: AccessRoles): string {
  return roles.map((role) => ROLE_LABEL[role]).join(', ');
}
