import React, { useState } from 'react';
import { db } from '../../services/db';
import { User } from '../../types';
import { Logo, LalusisLogoMark } from '../brand/Logo';
import { Button } from '../ui/Buttons';
import { useToast } from '../ui/Toast';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2, Cloud, Database } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminLoginProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const toast = useToast();
  const users = db.getUsers();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (isSupabaseConfigured) {
      try {
        if (authMode === 'signin') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            toast.error('Authentication Failed', error.message);
            setIsSubmitting(false);
            return;
          }

          if (data?.user) {
            const adminUser: User = {
              id: data.user.id,
              name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              role: 'SUPER_ADMIN',
              isActive: true,
              createdAt: data.user.created_at,
              avatarUrl: '/assets/atty-levy-lalusis.svg',
              lastLogin: new Date().toISOString(),
            };
            db.setCurrentUser(adminUser.id);
            toast.success('Supabase Auth Verified', `Welcome back, ${adminUser.name}`);
            onSuccess(adminUser);
          }
        } else {
          // Sign up initial admin
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: email.split('@')[0],
                role: 'SUPER_ADMIN',
              },
            },
          });

          if (error) {
            if (error.message.toLowerCase().includes('rate limit')) {
              toast.error(
                'Supabase Email Rate Limit',
                'Create user in Supabase Dashboard → Auth → Users → "Add user", or disable "Confirm email" in Auth Settings.'
              );
            } else {
              toast.error('Registration Failed', error.message);
            }
            setIsSubmitting(false);
            return;
          }

          if (data?.user) {
            toast.success('Admin Created in Supabase', 'Account created! Logging in...');
            const adminUser: User = {
              id: data.user.id,
              name: email.split('@')[0],
              email: data.user.email || email,
              role: 'SUPER_ADMIN',
              isActive: true,
              createdAt: data.user.created_at,
              avatarUrl: '/assets/atty-levy-lalusis.svg',
              lastLogin: new Date().toISOString(),
            };
            db.setCurrentUser(adminUser.id);
            onSuccess(adminUser);
          }
        }
      } catch (err: any) {
        toast.error('Login Error', err?.message || 'Failed to authenticate with Supabase');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Fallback if Supabase credentials are not configured yet
    setTimeout(() => {
      const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        db.setCurrentUser(match.id);
        toast.success('Authentication Verified', `Welcome back, ${match.name}`);
        onSuccess(match);
      } else {
        const customUser: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'SUPER_ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          avatarUrl: '/assets/atty-levy-lalusis.svg',
          lastLogin: new Date().toISOString(),
        };
        toast.success('Authorized', `Local session started for ${email}`);
        onSuccess(customUser);
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleQuickLogin = (user: User) => {
    db.setCurrentUser(user.id);
    toast.success('Credential Authenticated', `Switched session to ${user.name}`);
    onSuccess(user);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0d] flex items-center justify-center p-4 sm:p-6 text-left relative overflow-hidden">
      {/* Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c59b63]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Chambers Logo */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 text-[#c59b63] mx-auto drop-shadow-lg">
            <LalusisLogoMark className="w-full h-full" />
          </div>
          <div>
            <span className="font-cinzel text-xs font-semibold tracking-[0.24em] text-[#c59b63] uppercase block">
              Lalusis &amp; Partners
            </span>
            <h1 className="font-cormorant text-3xl font-light text-[#f7f4ee] mt-1">
              Chamber Administrative Portal
            </h1>
            <p className="text-xs text-[#8a837a] mt-1">
              Restricted access to the CMS, conflict docket, and publishing tools.
            </p>
          </div>

          {/* Backend Architecture Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#14141c] border border-[#2a2a38] text-[10px] font-mono">
            {isSupabaseConfigured ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Supabase Cloud PostgreSQL &amp; Auth</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[#c59b63]">Supabase Pending Setup · Fallback Mode</span>
              </>
            )}
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-[#121217] border border-[#262633] p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1f1f28] pb-3">
            <span className="font-cinzel text-xs font-semibold text-[#f7f4ee] uppercase tracking-wider">
              {authMode === 'signin' ? 'Sign In with Supabase' : 'Create Admin Account'}
            </span>
            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-[10px] font-cinzel uppercase text-[#c59b63] hover:underline cursor-pointer"
              >
                {authMode === 'signin' ? 'Create Account' : 'Back to Sign In'}
              </button>
            )}
          </div>

          {authMode === 'signup' && (
            <div className="p-3 bg-[#0d0d12] border border-[#2a2a38] text-[11px] text-[#a8a199] space-y-2">
              <div className="flex items-center gap-1.5 text-[#d4af7a] font-semibold font-cinzel text-[10px] uppercase">
                <Shield className="w-3.5 h-3.5 text-[#c59b63]" />
                <span>Supabase Admin Quick Creation</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Supabase free tier rate-limits public signup emails. If you see <em>"email rate limit exceeded"</em>:
              </p>
              <div className="p-2 bg-[#14141d] border border-[#232330] space-y-1 text-[#f7f4ee]">
                <p className="font-semibold text-emerald-400">Recommended 10-Second Fix:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-[#ded6c9]">
                  <li>Open <strong>Supabase Dashboard → Authentication → Users</strong></li>
                  <li>Click <strong>"Add user"</strong> → <strong>"Create user"</strong></li>
                  <li>Enter your email &amp; password (auto-confirmed, no email limit!)</li>
                  <li>Return here and click <strong>"Back to Sign In"</strong></li>
                </ol>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                Bar / Chambers Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6860]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@lalusislaw.com"
                  className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] pl-10 pr-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-cinzel text-[11px] font-semibold tracking-wider text-[#d4af7a] uppercase mb-1.5">
                Security Passcode
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e6860]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0d0d11] border border-[#2a2a35] focus:border-[#c59b63] pl-10 pr-3.5 py-2.5 text-xs text-[#f7f4ee] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isSubmitting}
              >
                {authMode === 'signin' ? 'Authenticate & Enter CMS' : 'Register Admin & Enter CMS'}
              </Button>
            </div>
          </form>

          {/* Quick Role Simulation Picker (For Offline / Demo Mode) */}
          {!isSupabaseConfigured && (
            <div className="pt-4 border-t border-[#1f1f28] space-y-2.5">
              <span className="font-cinzel text-[10px] text-[#8e877e] uppercase tracking-wider block text-center">
                Quick Role-Based Access Demo
              </span>
              <div className="grid grid-cols-2 gap-2">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleQuickLogin(u)}
                    className="p-2.5 bg-[#171720] border border-[#262633] hover:border-[#c59b63] text-left transition-colors cursor-pointer group"
                  >
                    <p className="font-cinzel text-[11px] font-semibold text-[#f7f4ee] group-hover:text-[#c59b63] truncate">
                      {u.name}
                    </p>
                    <p className="text-[9px] font-mono text-[#8e877e] uppercase">
                      {u.role.replace('_', ' ')}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-xs font-cinzel uppercase tracking-wider text-[#a8a199] hover:text-[#c59b63] transition-colors cursor-pointer"
          >
            ← Return to Public Firm Website
          </button>
        </div>
      </div>
    </div>
  );
};
