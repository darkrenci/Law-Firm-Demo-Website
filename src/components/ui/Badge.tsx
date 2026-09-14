import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'charcoal' | 'green' | 'blue' | 'red' | 'amber' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'text-[9px] px-2 py-0.5 tracking-[0.18em]',
    md: 'text-[10px] px-2.5 py-1 tracking-[0.16em]',
  };

  const variants = {
    gold: 'bg-[#c59b63]/15 text-[#e6d5bc] border border-[#c59b63]/40',
    charcoal: 'bg-[#1a1a22] text-[#c2bbb0] border border-[#2a2a35]',
    green: 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/60',
    blue: 'bg-sky-950/50 text-sky-300 border border-sky-800/60',
    red: 'bg-rose-950/50 text-rose-300 border border-rose-800/60',
    amber: 'bg-amber-950/50 text-amber-300 border border-amber-800/60',
    neutral: 'bg-white/5 text-[#d6cfc5] border border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center font-cinzel font-medium uppercase rounded-none select-none whitespace-nowrap ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
