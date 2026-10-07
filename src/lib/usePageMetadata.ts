import { siteOrigin, businessSchema } from './siteSeo';
import { useEffect } from 'react';
import { db } from '../services/db';

const defaults: Record<string, [string, string]> = {
  home: ['Law Firm in Quezon City', 'Lalusis & Partners provides legal counsel and representation in Quezon City. Explore our practice areas, meet our partners, and request a consultation.'],
  about: ['About Our Law Firm in Quezon City', 'Learn about Lalusis & Partners, our firm history, and our approach to legal counsel and representation in Quezon City.'],
  attorneys: ['Our Partners', 'Meet the lawyers of Lalusis & Partners in Quezon City. Explore their professional backgrounds, qualifications, and areas of practice.'],
  'practice-areas': ['Legal Practice Areas in Quezon City', 'Explore legal services at Lalusis & Partners in Quezon City, including litigation, civil and family law, corporate law, labor, and estate settlement.'],
  contact: ['Contact Our Quezon City Office', 'Contact Lalusis & Partners at Future Point Plaza Suites, 110 Panay Avenue, South Triangle, Quezon City. Find our address, telephone, and office hours.'],
  consultation: ['Request a Legal Consultation', 'Request a consultation with Lalusis & Partners in Quezon City. Share a general summary of your legal matter and preferred appointment details.'],
};
const clean = (value?: string) => value?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';
function setMeta(key: string, value: string, property = false) {
  const attr = property ? 'property' : 'name';
  const matches = Array.from(document.head.querySelectorAll<HTMLMetaElement>(`meta[${attr}="${key}"]`));
  const element = matches.shift() || document.createElement('meta');
  matches.forEach(node => node.remove());
  element.setAttribute(attr, key);
  element.content = value;
  if (!element.isConnected) document.head.appendChild(element);
}
export function usePageMetadata(path: string) {
  useEffect(() => {
    const update = () => {
      const { settings, slug, title, description, noindex } = resolvePageMetadata(path);
      const origin = siteOrigin(import.meta.env.VITE_SITE_URL || undefined);
      const canonical = origin + (slug === 'home' ? '/' : '/' + slug.replace(/^partners\//, 'attorneys/'));
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (noindex) link?.remove();
      else {
        if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link); }
        link.href = canonical;
      }
      setMeta('og:url', canonical, true);
      setMeta('og:image', origin + '/assets/founding-partners.jpg', true);
      setMeta('twitter:image', origin + '/assets/founding-partners.jpg');
      let schema = document.getElementById('business-schema');
      if (noindex) schema?.remove();
      else {
        if (!schema) { schema = document.createElement('script'); schema.id = 'business-schema'; schema.setAttribute('type', 'application/ld+json'); document.head.appendChild(schema); }
        schema.textContent = JSON.stringify(businessSchema(settings, origin));
      }
      document.title = title;
      setMeta('description', description);
      setMeta('og:title', title, true);
      setMeta('og:description', description, true);
      setMeta('twitter:title', title);
      setMeta('twitter:description', description);
      setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow');
    };
    update();
    return db.subscribe(update);
  }, [path]);
}

export function resolvePageMetadata(path: string) {
      const settings = db.getSettings();
      const brand = clean(settings.general.firmName) || 'Lalusis & Partners';
      let slug = path.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '') || 'home';
      if (slug === 'partners') slug = 'attorneys';
      const page = db.getPages().find(p => (p.slug || 'home') === slug || (slug === 'attorneys' && p.slug === 'partners'));
      let title = clean(page?.seo?.metaTitle) || clean(page?.seoTitle);
      let description = clean(page?.seo?.metaDescription) || clean(page?.seoDescription);
      let noindex = settings.seo?.indexSite === false || page?.isPublished === false;
      if (slug === 'home') {
        title ||= clean(settings.seoDefaults?.metaTitle) || clean(settings.seo?.defaultTitle);
        description ||= clean(settings.seoDefaults?.metaDescription) || clean(settings.seo?.defaultDescription);
      }
      if (/^(attorneys|partners)\//.test(slug)) {
        const attorney = db.getAttorneys(false).find(a => a.slug === slug.split('/')[1]);
        title = attorney ? attorney.fullName + ' | ' + brand : 'Partner Not Found | ' + brand;
        description = attorney ? 'Meet ' + attorney.fullName + ' at ' + brand + ' in Quezon City. Read their professional biography and qualifications.' : 'The requested partner profile is unavailable.';
        noindex ||= !attorney;
      } else if (slug.startsWith('practice-areas/')) {
        const area = db.getPracticeAreas(false).find(item => item.slug === slug.split('/')[1]);
        title = area ? clean(area.seoTitle) || area.title + ' in Quezon City | ' + brand : 'Practice Area Not Found | ' + brand;
        description = area ? clean(area.seoDescription) || clean(area.shortDescription) : 'The requested practice area is unavailable.';
        noindex ||= !area;
      } else if (slug.startsWith('admin')) {
        title = 'Admin Portal | ' + brand;
        description = 'Authorized website administration.';
        noindex = true;
      } else if (!page && !defaults[slug]) {
        title = 'Page Not Found | ' + brand;
        description = 'The requested page is unavailable. Visit our home page to explore our firm and services.';
        noindex = true;
      }
      title ||= (defaults[slug]?.[0] || clean(page?.title) || 'Legal Services') + ' | ' + brand;
      description ||= defaults[slug]?.[1] || 'Learn about ' + clean(page?.title) + ' at ' + brand + ' in Quezon City. Contact our office for further information.';

  return { settings, slug, title, description, noindex };
}
