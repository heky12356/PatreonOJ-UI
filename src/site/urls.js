const unsafeCharacters = (value) => Array.from(value).some((char) => char === '\\' || char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127);

export function safeSiteURL(value) {
  if (typeof value !== 'string' || !value || value.trim() !== value || unsafeCharacters(value)) return '';
  let decoded;
  try { decoded = decodeURIComponent(value); } catch { return ''; }
  if (unsafeCharacters(decoded)) return '';
  if (value.startsWith('/')) return decoded.startsWith('//') ? '' : value;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname && !url.username && !url.password ? value : '';
  } catch { return ''; }
}
