/** Espelha `src/environments/environment.ts` do app Angular. */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  return 'http://localhost:3000';
}
