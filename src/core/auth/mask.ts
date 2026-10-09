const SENSITIVE_PERSON_KEYS = [
  'email',
  'phone',
  'address',
  'birthDate',
  'guardianName',
  'guardianPhone',
  'document',
] as const;

export type SensitivePersonKey = (typeof SENSITIVE_PERSON_KEYS)[number];

export function maskValue(value: string | null | undefined): string {
  if (!value) return '••••';
  if (value.includes('@')) {
    const [user, domain] = value.split('@');
    const visible = user.slice(0, 1);
    return `${visible}•••@${domain}`;
  }
  if (value.length <= 4) return '••••';
  return `${value.slice(0, 2)}••••${value.slice(-2)}`;
}

export function maskSensitiveFields<T extends Record<string, unknown>>(
  entity: T,
  enabled: boolean,
): T {
  if (!enabled) return entity;

  const next = { ...entity };
  for (const key of SENSITIVE_PERSON_KEYS) {
    if (key in next && typeof next[key] === 'string') {
      (next as Record<string, unknown>)[key] = maskValue(next[key] as string);
    }
  }
  return next;
}
