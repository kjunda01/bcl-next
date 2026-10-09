function serverSideMockApiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (site) return `${site}/bcl-api`;

  const port = process.env.PORT ?? '3000';
  return `http://127.0.0.1:${port}/bcl-api`;
}

/** URL única da API, compartilhada pelo módulo de estudo. */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/bcl-api`;
  }
  return serverSideMockApiBase();
}
