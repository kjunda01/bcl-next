import type { AppUser } from '@/domains/users/types';
import type { AuthenticatedRole } from './roles';

/** Senha provisória até existir login real. Só administrador e maestro. */
const PRIVILEGED_PASSWORD = '#bcl.2026@';

/**
 * Contas de demonstração. Espelham `demo.sql` do backend: todo usuário é uma
 * pessoa e entra com nome de usuário (ou e-mail da pessoa) e senha.
 */
export const DEMO_USERS: Array<AppUser & { password: string }> = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@bcl.local',
    name: 'Ana Admin',
    roles: ['admin'],
    personId: 1,
    isActive: true,
    password: PRIVILEGED_PASSWORD,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 2,
    username: 'maestro',
    email: 'maestro@bcl.local',
    name: 'Marcos Maestro',
    roles: ['maestro', 'musico'],
    personId: 2,
    isActive: true,
    password: PRIVILEGED_PASSWORD,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 3,
    username: 'musico',
    email: 'helena.trompete@email.com',
    name: 'Helena Trompete',
    roles: ['musico'],
    personId: 3,
    isActive: true,
    password: 'musico',
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 4,
    username: 'aluno',
    email: 'pedro.clarineta@email.com',
    name: 'Pedro Clarineta',
    roles: ['aluno'],
    personId: 4,
    isActive: true,
    password: 'aluno',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-03-01T10:00:00.000Z',
  },
  {
    id: 5,
    username: 'ambos',
    email: 'luisa.sax@email.com',
    name: 'Luísa Sax',
    roles: ['aluno', 'musico'],
    personId: 6,
    isActive: true,
    password: 'ambos',
    createdAt: '2024-03-12T10:00:00.000Z',
    updatedAt: '2024-03-12T10:00:00.000Z',
  },
];

function withoutPassword(user: AppUser & { password: string }): AppUser {
  const { password: _ignored, ...safeUser } = user;
  void _ignored;
  return safeUser;
}

/** Encontra pela senha e por nome de usuário ou e-mail (sem diferenciar maiúsculas). */
export function findDemoUser(identifier: string, secret: string): AppUser | null {
  const needle = identifier.trim().toLowerCase();
  const match = DEMO_USERS.find(
    (user) =>
      user.password === secret &&
      (user.username.toLowerCase() === needle || (user.email ?? '').toLowerCase() === needle),
  );
  return match ? withoutPassword(match) : null;
}

export function demoUserByRole(role: AuthenticatedRole): AppUser {
  const match = DEMO_USERS.find((user) => user.roles.includes(role));
  if (!match) {
    throw new Error(`Usuário de demonstração não encontrado para o perfil ${role}`);
  }
  return withoutPassword(match);
}
