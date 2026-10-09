/** URL única da API, compartilhada pelo módulo de estudo. */
export function getApiUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  // No celular a porta 3001 do json-server não atravessa o WSL.
  // O browser usa o mesmo host da página; o Next encaminha para o mock.
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/bcl-api`;
  }
  return 'http://127.0.0.1:3001';
}
