import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createServer, loadEnv } from 'vite';
import { siteOrigin, businessSchema } from '../src/lib/siteSeo';

// Browser storage is replaced with a process-local public content cache for SSR.
const cache = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => cache.get(key) ?? null,
  setItem: (key: string, value: string) => cache.set(key, value),
  removeItem: (key: string) => cache.delete(key),
} });
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = siteOrigin(env.VITE_SITE_URL);
const vite = await createServer({ mode: 'production', server: { middlewareMode: true }, appType: 'custom' });
try {
  const entry = await vite.ssrLoadModule('/src/prerender.tsx');
  await entry.loadPublicContent();
  const template = await readFile('dist/index.html', 'utf8');
  // Keep a separate empty shell exclusively for the authenticated application.
  await writeFile('dist/admin.html', template.replace('</head>', '<meta name="robots" content="noindex, nofollow" /></head>'));
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  const paths: string[] = JSON.parse(await readFile('.prerender-routes.json', 'utf8'));
  const escape = (text: string) => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
  for (const path of [...new Set(['/', ...paths]), '/404']) {
    const result = entry.render(decodeURI(path));
    const canonical = origin + path;
    let html = template.replace('<div id="root"></div>', '<div id="root">' + result.html + '</div>');
    html = html.replace(/<title>.*?<\/title>/s, '<title>' + escape(result.title) + '</title>');
    html = html.replace(/<meta\s+(?:name|property)="(?:description|og:title|og:description|og:url|twitter:title|twitter:description|robots)"[^>]*>/g, '');
    html = html.replace(/<script[^>]*id="business-schema"[^>]*>[\s\S]*?<\/script>/g, '');
    const metadata = [
      ['name', 'description', result.description], ['property', 'og:title', result.title],
      ['property', 'og:description', result.description], ['property', 'og:url', canonical],
      ['name', 'twitter:title', result.title], ['name', 'twitter:description', result.description],
      ['property', 'og:image', origin + '/assets/founding-partners.jpg'],
      ['name', 'twitter:image', origin + '/assets/founding-partners.jpg'],
      ['name', 'robots', result.noindex ? 'noindex, nofollow' : 'index, follow'],
    ].map(([attr, name, content]) => `<meta ${attr}="${name}" content="${escape(content)}" />`).join('\n');
    const schema = result.noindex ? '' : '<link rel="canonical" href="' + escape(canonical) + '" /><script type="application/ld+json" id="business-schema">' + JSON.stringify(businessSchema(result.settings, origin)).replace(/</g, '\\u003c') + '</script>';
    html = html.replace('</head>', metadata + schema + '</head>');
    const snapshot = JSON.stringify(Object.fromEntries(cache)).replace(/</g, '\\u003c');
    html = html.replace('</body>', '<script id="public-snapshot" type="application/json">' + snapshot + '</script></body>');
    const file = resolve('dist', path === '/' ? 'index.html' : path.slice(1) + '.html');
    if (!file.startsWith(resolve('dist') + '/'.replace('/', process.platform === 'win32' ? '\\' : '/'))) throw new Error('Unsafe page path');
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  console.log(`Pre-rendered ${new Set(['/', ...paths]).size} public pages and a 404 page.`);
} finally {
  await vite.close();
}
