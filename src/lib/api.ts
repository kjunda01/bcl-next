import { getAccessToken } from '@/core/auth/accessToken';
import { getApiUrl } from '../config/environment';
import { UNDER_CONSTRUCTION_MESSAGE } from './userMessages';

export function apiAuthHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(headers);
  if (!merged.has('Content-Type')) {
    merged.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token && !merged.has('Authorization')) {
    merged.set('Authorization', `Bearer ${token}`);
  }
  return merged;
}

/** Erro HTTP da API com o status, para a tela decidir o que fazer (ex.: 404 no login Google). */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function errorMessage(text: string): string {
  try {
    const parsed = JSON.parse(text) as { error?: string };
    if (typeof parsed.error === 'string' && parsed.error.trim()) {
      const err = parsed.error.trim();
      if (/^(Not found|Invalid JSON|Method not allowed|Unauthorized)$/i.test(err)) {
        return UNDER_CONSTRUCTION_MESSAGE;
      }
      return err;
    }
  } catch {
    /* corpo que não é JSON */
  }
  return UNDER_CONSTRUCTION_MESSAGE;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      ...options,
      headers: apiAuthHeaders(options.headers),
    });
  } catch {
    throw new ApiError(UNDER_CONSTRUCTION_MESSAGE, 0);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(errorMessage(text), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
