export const DEFAULT_HTML_WRAPPER = (title: string, bodyHtml: string) => `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="ko">
  <head>
    <meta charset="utf-8"/>
    <title>${escapeXml(title || '')}</title>
  </head>
  <body>
    ${bodyHtml || ''}
  </body>
</html>`;

export const isFullHtmlDocument = (s: string) => {
    const t = (s || '').trim().toLowerCase();
    return t.startsWith('<!doctype') || t.startsWith('<?xml') || t.startsWith('<html');
};

export function escapeXml(unsafe: string) {
    return (unsafe || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}