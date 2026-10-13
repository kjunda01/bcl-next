import { getApiUrl } from '@/config/environment';

export async function uploadMediaFile(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${getApiUrl()}/uploads`, {
    method: 'POST',
    body,
  });
  const payload = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok || !payload?.url) {
    throw new Error(payload?.error || 'Não foi possível enviar o arquivo.');
  }
  return payload.url;
}
