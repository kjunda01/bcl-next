import type { AccessRoles } from '@/core/auth/roles';
import { peopleReadScope, shouldMaskSensitivePersonData } from '@/core/auth/permissions';
import { maskSensitiveFields } from '@/core/auth/mask';
import type { Person, StudentProfile } from './types';

export function filterPeopleForRole(people: Person[], roles: AccessRoles): Person[] {
  const scope = peopleReadScope(roles);
  const visible = people.filter((person) => {
    if (scope === 'none') return false;
    if (scope === 'students') return person.isStudent;
    return person.isStudent || person.isMusician;
  });

  const mask = shouldMaskSensitivePersonData(roles);
  return visible.map((person) => {
    const masked = maskSensitiveFields(person as unknown as Record<string, unknown>, mask) as unknown as Person;
    if (mask && person.student) {
      masked.student = maskSensitiveFields(
        person.student as unknown as Record<string, unknown>,
        true,
      ) as unknown as StudentProfile;
    }
    return masked;
  });
}
