import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'gold-outline' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-cinzel font-medium tracking-[0.14em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none text-center';

  const sizes = {
    sm: 'text-[11px] px-3.5 py-1.5 gap-1.5',
    md: 'text-xs px-5 py-2.5 gap-2',
    lg: 'text-xs sm:text-sm px-7 py-3.5 gap-2.5',
  };

  const variants = {
    primary:
      'bg-[#c59b63] text-[#0d0d10] font-semibold hover:bg-[#d4af7a] active:bg-[#b88849] shadow-sm border border-[#d4af7a]',
    'gold-outline':
      'border border-[#c59b63]/70 text-[#f4e6d0] hover:border-[#c59b63] hover:bg-[#c59b63]/10 hover:text-white active:bg-[#c59b63]/20',
    secondary:
      'bg-[#1a1a22] text-[#f4e6d0] border border-[#2a2a35] hover:bg-[#252530] hover:border-[#c59b63]/40 active:bg-[#15151c]',
    ghost:
      'text-[#c59b63] hover:text-[#f4e6d0] hover:bg-white/5 border border-transparent',
    danger:
      'bg-red-950/60 border border-red-800/80 text-red-200 hover:bg-red-900/80 active:bg-red-950',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
