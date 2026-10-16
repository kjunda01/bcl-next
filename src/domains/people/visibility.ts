import type { AccessRoles } from '@/core/auth/roles';
import { peopleReadScope, shouldMaskSensitivePersonData } from '@/core/auth/permissions';
import { maskSensitiveFields, maskValue } from '@/core/auth/mask';
import type { Person } from './types';

export function filterPeopleForRole(
  people: Person[],
  roles: AccessRoles,
  permissions?: readonly string[] | null,
): Person[] {
  const scope = peopleReadScope(roles, permissions);
  const visible = people.filter((person) => {
    if (scope === 'none') return false;
    if (scope === 'students') return person.isStudent;
    return person.isStudent || person.isMusician;
  });

  const mask = shouldMaskSensitivePersonData(roles, permissions);
  if (!mask) return visible;
  return visible.map((person) => {
    const masked = maskSensitiveFields(person as unknown as Record<string, unknown>, true) as unknown as Person;
    delete masked.age;
    if (person.document) {
      masked.document = { ...person.document, number: maskValue(person.document.number) };
    }
    return masked;
  });
}
