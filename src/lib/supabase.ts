import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const envUrl = metaEnv.VITE_SUPABASE_URL || '';
const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Allow fallback from localStorage for instant testing or environments pending redeploy
const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('lalusis_supabase_url') || '' : '';
const storedKey = typeof window !== 'undefined' ? localStorage.getItem('lalusis_supabase_anon_key') || '' : '';

const effectiveUrl = envUrl || storedUrl;
const effectiveKey = envKey || storedKey;

export const isSupabaseConfigured = Boolean(
  effectiveUrl &&
  effectiveKey &&
  effectiveUrl !== 'https://your-project-id.supabase.co' &&
  !effectiveUrl.includes('placeholder')
);

// Fallback dummy URL to allow client initialization without crashing if env vars are pending
const validUrl = isSupabaseConfigured ? effectiveUrl : 'https://placeholder.supabase.co';
const validKey = isSupabaseConfigured ? effectiveKey : 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const STORAGE_BUCKET = 'media';

export function saveManualSupabaseCredentials(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lalusis_supabase_url', url.trim());
    localStorage.setItem('lalusis_supabase_anon_key', key.trim());
    window.location.reload();
  }
}

export function clearManualSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lalusis_supabase_url');
    localStorage.removeItem('lalusis_supabase_anon_key');
    window.location.reload();
  }
}
