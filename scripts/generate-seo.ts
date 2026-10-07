import { mkdir, writeFile } from 'node:fs/promises';
import { loadEnv } from 'vite';
import { initialPages, initialAttorneys, initialPracticeAreas, initialSettings } from '../src/services/seedData';
import { businessSchema, siteOrigin } from '../src/lib/siteSeo';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const origin = siteOrigin(env.VITE_SITE_URL);
async function rows(table: string, query: string): Promise<any[] | null> {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: { apikey: env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Cannot generate current sitemap: ${table} returned ${response.status}`);
  return response.json();
}
const [pages, attorneys, practices, settingsRows] = await Promise.all([
  rows('pages', 'select=slug,is_published'),
  rows('attorneys', 'select=slug,is_published'),
  rows('practice_areas', 'select=slug,is_published'),
  rows('site_settings', 'select=settings&id=eq.firm_settings'),
]);
const settings = settingsRows?.[0]?.settings || initialSettings;
// Match the legacy address correction used by the public site.
if (settings.contact.address?.startsWith('110, Unit 20, Suite J, Future Point Plaza Suites')) {
  settings.contact.address = initialSettings.contact.address;
}
// These routes have built-in public view fallbacks even when CMS rows are absent.
const paths = new Set<string>(['/', '/about', '/attorneys', '/practice-areas', '/contact', '/consultation']);
const retired = new Set(['insights', 'news', 'faqs']);
function pagePath(slug: string) {
  return slug === 'home' || !slug ? '/' : slug === 'partners' ? '/attorneys' : '/' + slug;
}
for (const page of pages ?? initialPages.map(p => ({ slug: p.slug, is_published: p.isPublished }))) {
  if (page.is_published && !retired.has(page.slug) && !page.slug.startsWith('admin')) paths.add(pagePath(page.slug));
}
for (const item of attorneys ?? initialAttorneys.map(a => ({ slug: a.slug, is_published: a.isPublished }))) {
  if (item.is_published) paths.add('/attorneys/' + item.slug);
}
// Match DatabaseService.getPracticeAreas' legacy standardized-list fallback.
const effectivePractices = !practices || practices.length < 14 || !practices.some(p => p.slug === 'criminal-and-administrative-litigation')
  ? initialPracticeAreas.map(a => ({ slug: a.slug, is_published: a.status === 'published' })) : practices;
for (const item of effectivePractices) {
  if (item.is_published) paths.add('/practice-areas/' + item.slug);
}
const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
const publicPaths = settings.seo?.indexSite === false ? [] : [...paths].sort();
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + publicPaths.map(path => '  <url><loc>' + escapeXml(origin + path.split('/').map(encodeURIComponent).join('/')) + '</loc></url>').join('\n') + '\n</urlset>\n';
await mkdir('public', { recursive: true });
await writeFile('.prerender-routes.json', JSON.stringify([...paths].sort()));
await Promise.all([
  writeFile('public/sitemap.xml', sitemap),
  // Keep admin crawlable so its noindex response can be seen; authentication protects it.
  writeFile('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`),
  writeFile('public/business-schema.json', JSON.stringify(businessSchema(settings, origin), null, 2) + '\n'),
  writeFile('public/site.webmanifest', JSON.stringify({
    id: '/', name: settings.general.firmName, short_name: 'Lalusis & Partners',
    description: 'Legal counsel and representation in Quezon City.', lang: 'en-PH',
    start_url: '/', scope: '/', display: 'browser', background_color: '#0d0d11', theme_color: '#0d0d11',
    icons: [{ src: '/assets/lalusis-logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }, null, 2) + '\n'),
]);
console.log(`Generated sitemap with ${publicPaths.length} public URLs for ${origin}.`);
