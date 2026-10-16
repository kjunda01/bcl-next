/**
 * Em produção o backend ainda não está publicado: o site usa o mock `/bcl-api`.
 * Quando a API real estiver no ar, defina NEXT_PUBLIC_USE_REMOTE_API=true e NEXT_PUBLIC_API_URL.
 */
export function usesRemoteApi(): boolean {
  if (process.env.NEXT_PUBLIC_USE_REMOTE_API === 'true') return true;
  if (process.env.NODE_ENV === 'production') return false;
  const url = process.env.NEXT_PUBLIC_API_URL?.trim() ?? '';
  return url.length > 0 && !url.includes('/bcl-api');
}

function embeddedMockBase(): string {
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (site) return `${site}/bcl-api`;
  const port = process.env.PORT ?? '3000';
  return `http://127.0.0.1:${port}/bcl-api`;
}

/** URL única da API, compartilhada pelo módulo de estudo. */
export function getApiUrl(): string {
  if (!usesRemoteApi()) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/bcl-api`;
    }
    return embeddedMockBase();
  }
  return (process.env.NEXT_PUBLIC_API_URL ?? '').trim();
}
