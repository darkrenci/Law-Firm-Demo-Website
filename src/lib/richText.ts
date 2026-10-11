const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'blockquote',
]);

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const escapeAttribute = (value: string) => escapeHtml(value).replace(/`/g, '&#096;');

export const normalizeRichTextLink = (rawValue: string): string | null => {
  const value = rawValue.trim();
  if (!value) return null;
  if (/^(\/|#|mailto:|tel:)/i.test(value)) return value;
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    return ['http:', 'https:'].includes(url.protocol) ? candidate : null;
  } catch {
    return null;
  }
};

export const hasRichTextMarkup = (value: string) =>
  /<\/?(?:p|br|strong|b|em|i|u|a|ul|ol|li|h2|h3|blockquote)\b/i.test(value);

export const plainTextToRichText = (value: string) => {
  const escaped = escapeHtml(value.trim());
  if (!escaped) return '';
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
};

export const sanitizeRichText = (input: string): string => {
  const source = hasRichTextMarkup(input) ? input : plainTextToRichText(input);
  return source
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|iframe|object|embed|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/?([a-z][a-z\d]*)\b([^>]*)>/gi, (full, rawTag: string, attributes: string) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return '';
      if (full.startsWith('</')) return tag === 'br' ? '' : `</${tag}>`;
      if (tag === 'br') return '<br>';
      if (tag !== 'a') return `<${tag}>`;

      const hrefMatch = attributes.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = normalizeRichTextLink(hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '');
      if (!href) return '';
      const external = /^https?:\/\//i.test(href);
      return `<a href="${escapeAttribute(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>`;
    });
};

