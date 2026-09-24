import React, { useState } from 'react';
import { db } from '../../services/db';
import { User } from '../../types';
import { Logo, LalusisLogoMark } from '../brand/Logo';
import { Button } from '../ui/Buttons';
import { useToast } from '../ui/Toast';
import { Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        db.setCurrentUser(match.id);
        toast.success('Authentication Verified', `Welcome back, ${match.name}`);
        onSuccess(match);
      } else {
        // Allow any entered email as authenticated for demo convenience
        const customUser: User = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: 'SUPER_ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          lastLogin: new Date().toISOString(),
        };
        toast.success('Authorized', `Authenticated session for ${email}`);
        onSuccess(customUser);
      }
      setIsSubmitting(false);
    }, 500);
  };

  const handleQuickLogin = (user: User) => {
    db.setCurrentUser(user.id);
    toast.success('Credential Authenticated', `Switched session to ${user.name} (${user.role.replace('_', ' ')})`);
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
        </div>

        {/* Login Box */}
        <div className="bg-[#121217] border border-[#262633] p-8 shadow-2xl space-y-6">
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
                Authenticate &amp; Enter CMS
              </Button>
            </div>
          </form>

          {/* Quick Role Simulation Picker */}
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
