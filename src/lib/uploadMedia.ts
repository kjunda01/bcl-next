import { getAccessToken } from '@/core/auth/accessToken';
import { getApiUrl } from '@/config/environment';
import { UNDER_CONSTRUCTION_MESSAGE } from '@/lib/userMessages';

export async function uploadMediaFile(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const token = getAccessToken();
  const response = await fetch(`${getApiUrl()}/uploads`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });
  const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok || !payload?.url) {
    throw new Error(UNDER_CONSTRUCTION_MESSAGE);
  }
  return payload.url;
}
