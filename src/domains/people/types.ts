import type { Auditable, EntityId, RecordStatus } from '../shared';

export type GuardianRelationship = 'pai' | 'mae' | 'irmao' | 'tutor_legal';

export interface StudentProfile {
  enrollmentDate: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelationship?: GuardianRelationship;
}

export interface MusicianProfile {
  joinedAt: string;
  section?: string;
  instrumentIds?: EntityId[];
}

export interface Person extends Auditable {
  id: EntityId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  birthDate: string;
  photoUrl?: string;
  document?: string;
  isStudent: boolean;
  isMusician: boolean;
  student?: StudentProfile;
  musician?: MusicianProfile;
  status: RecordStatus;
}

export function personFullName(person: Pick<Person, 'firstName' | 'lastName'>): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

export function isPersonUnderage(birthDate: string): boolean {
  const parsed = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - parsed.getFullYear();
  const notYet =
    today.getMonth() < parsed.getMonth() ||
    (today.getMonth() === parsed.getMonth() && today.getDate() < parsed.getDate());
  if (notYet) age -= 1;
  return age < 18;
}
