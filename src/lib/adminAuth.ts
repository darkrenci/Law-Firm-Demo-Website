import { isMysqlBackend, mysqlAuth } from './mysqlClient';
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '../types';

// The database checks a protected allowlist, not editable profile metadata.
export async function getApprovedAdmin(): Promise<User | null> {
  if (isMysqlBackend) {
    const {data:{user}}=await mysqlAuth.getUser();
    return user ? {id:user.id,email:user.email,name:user.email,role:'ADMINISTRATOR',isActive:true,createdAt:''} : null;
  }
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const { data: approved, error: permissionError } = await supabase.rpc('is_lawfirm_admin');
    if (permissionError || approved !== true) return null;
    return { id: user.id, email: user.email || '', name: user.user_metadata?.full_name || user.email || 'Administrator',
      role: 'ADMINISTRATOR', isActive: true, createdAt: user.created_at };
  } catch { return null; }
}
