import type { FirmSettings } from '../types';

export function siteOrigin(value = 'https://lawfirmdemowebsite.vercel.app') {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('VITE_SITE_URL must be a website origin, for example https://example.com');
  }
  return url.origin;
}

export function businessSchema(settings: FirmSettings, origin: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    '@id': origin + '/#law-firm',
    name: settings.general.firmName,
    url: origin + '/',
    telephone: settings.contact.telephone,
    email: settings.contact.email,
    image: origin + '/assets/founding-partners.jpg',
    logo: origin + '/assets/lalusis-logo.svg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.contact.address,
      addressLocality: 'Quezon City',
      addressCountry: 'PH',
    },
    areaServed: { '@type': 'City', name: 'Quezon City' },
  };
}
