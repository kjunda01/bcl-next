const ALLOWED_TAGS = new Set(['p', 'div', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a', 'h2', 'h3']);

/** Remove tags e atributos fora da lista permitida. O resultado é igual no servidor e no cliente. */
export function sanitizeRichText(html: string): string {
  const withoutDanger = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  return withoutDanger.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return '';
    if (name === 'br') return '<br>';
    if (match.startsWith('</')) return `</${name}>`;
    if (name !== 'a') return `<${name}>`;
    const hrefMatch = attrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    const href = (hrefMatch?.[1] ?? hrefMatch?.[2] ?? '').trim();
    if (href.startsWith('https://') || href.startsWith('/') || href.startsWith('mailto:')) {
      return `<a href="${href}" rel="noopener noreferrer" target="_blank">`;
    }
    return '<a>';
  });
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Texto antigo, só com quebras de linha, vira parágrafos. HTML já formatado é só higienizado. */
export function toEditorHtml(text: string): string {
  if (/<\/?[a-z][^>]*>/i.test(text)) return sanitizeRichText(text);
  return text
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `<p>${escapeText(line)}</p>`)
    .join('');
}

export function plainTextFromHtml(html: string): string {
  return sanitizeRichText(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h2|h3|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
