/** URL única da API, compartilhada pelo módulo de estudo. */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  return 'http://localhost:3001';
}
