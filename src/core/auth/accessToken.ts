import { usesRemoteApi } from '@/config/environment';

export { usesRemoteApi };

const TOKEN_KEY = 'app.auth.token';

let memoryToken: string | null = null;

export function getAccessToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TOKEN_KEY);
  memoryToken = stored;
  return stored;
}

export function setAccessToken(token: string | null, keepLoggedIn: boolean) {
  memoryToken = token;
  if (typeof window === 'undefined') return;
  if (token && keepLoggedIn) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
}
