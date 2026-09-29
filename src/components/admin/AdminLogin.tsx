import React, { useState } from 'react';
import { Button } from '../ui/Buttons';
import { useToast } from '../ui/Toast';
import { LalusisLogoMark } from '../brand/Logo';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getApprovedAdmin } from '../../lib/adminAuth';

export const AdminLogin: React.FC<{ onSuccess: () => void; onCancel: () => void }> = ({ onSuccess, onCancel }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || !isSupabaseConfigured) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error('Unable to sign in. Check your email and password.');
      if (!await getApprovedAdmin()) {
        await supabase.auth.signOut();
        throw new Error('This account does not have approved administrator access. Contact the website owner.');
      }
      setPassword('');
      onSuccess();
    } catch (error) { toast.error('Sign-in Failed', (error as Error).message); }
    finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <LalusisLogoMark className="w-20 h-20 mx-auto" />
        <h1 className="font-cormorant text-3xl text-[#f7f4ee] text-center">Chamber Administrative Portal</h1>
        <p className="text-sm text-[#a8a199] text-center">Sign in with your approved administrator account.</p>
        {!isSupabaseConfigured && <p role="alert" className="text-amber-300 text-sm">Admin sign-in is unavailable until the website connection is configured.</p>}
        <form onSubmit={submit} className="bg-[#121217] border border-[#262633] p-8 space-y-5">
          <label className="block text-sm text-[#d4af7a]">Email
            <input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full bg-[#0d0d11] border border-[#2a2a35] p-3 text-[#f7f4ee]" />
          </label>
          <label className="block text-sm text-[#d4af7a]">Password
            <input type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full bg-[#0d0d11] border border-[#2a2a35] p-3 text-[#f7f4ee]" />
          </label>
          <Button type="submit" className="w-full" isLoading={busy} disabled={!isSupabaseConfigured}>Sign In</Button>
        </form>
        <button onClick={onCancel} className="w-full text-sm text-[#c59b63]">Return to the website</button>
      </div>
    </div>
  );
};
