import type { AppUser } from '@/domains/users/types';
import type { AuthenticatedRole } from './roles';

/** Senha provisória até existir login real. Só administrador e maestro. */
const PRIVILEGED_PASSWORD = '#bcl.2026@';

export const DEMO_USERS: Array<AppUser & { password: string }> = [
  {
    id: 'user-admin',
    email: 'admin@bcl.local',
    name: 'Ana Admin',
    roles: ['admin'],
    isActive: true,
    password: PRIVILEGED_PASSWORD,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 'user-maestro',
    email: 'maestro@bcl.local',
    name: 'Marcos Maestro',
    roles: ['maestro'],
    personId: 'person-maestro',
    isActive: true,
    password: PRIVILEGED_PASSWORD,
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 'user-musico',
    email: 'musico@bcl.local',
    name: 'Helena Trompete',
    roles: ['musico'],
    personId: 'person-helena',
    isActive: true,
    password: 'musico',
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
  },
  {
    id: 'user-aluno',
    email: 'aluno@bcl.local',
    name: 'Pedro Clarineta',
    roles: ['aluno'],
    personId: 'person-pedro',
    isActive: true,
    password: 'aluno',
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-03-01T10:00:00.000Z',
  },
  {
    id: 'user-ambos',
    email: 'ambos@bcl.local',
    name: 'Luísa Sax',
    roles: ['aluno', 'musico'],
    personId: 'person-luisa',
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

export function findDemoUser(email: string, secret: string): AppUser | null {
  const match = DEMO_USERS.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === secret,
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
