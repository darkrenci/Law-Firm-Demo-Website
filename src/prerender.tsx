import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { resolvePageMetadata } from './lib/usePageMetadata';
import { supabaseService } from './services/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';

export async function loadPublicContent() {
  if (!isSupabaseConfigured) return;
  if (!await supabaseService.checkSchemaReady()) throw new Error('Public CMS schema is unavailable for pre-rendering.');
  const entries = await Promise.all([
    ['settings', supabaseService.getSettings()],
    ['pages', supabaseService.getPages()],
    ['attorneys', supabaseService.getAttorneys()],
    ['practice_areas', supabaseService.getPracticeAreas()],
    ['nav', supabaseService.getNavigation()],
  ].map(async ([key, request]) => [key, await request] as const));
  for (const [key, value] of entries) {
    if (value === null) throw new Error('Cannot read public CMS content: ' + key);
    // Never include drafts or private tables in generated HTML.
    const publicValue = Array.isArray(value) ? value.filter((item: any) => item.isPublished !== false && (!item.status || item.status === 'published')) : value;
    localStorage.setItem('lp_cms_' + key + '_v1', JSON.stringify(publicValue));
  }
}

export function render(path: string) {
  return { html: renderToString(<App initialPath={path} prerender />), ...resolvePageMetadata(path) };
}
