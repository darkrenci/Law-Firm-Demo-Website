import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '4xl': 'max-w-6xl',
    full: 'max-w-[96vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${maxWidths[maxWidth]} bg-[#121217] border border-[#c59b63]/40 shadow-2xl p-6 sm:p-8 z-10 my-8 max-h-[90vh] flex flex-col text-left`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#252530] mb-5">
          <div>
            {title && (
              <h3 className="font-cinzel text-lg sm:text-xl font-medium tracking-[0.08em] text-[#f7f4ee]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#a8a199] mt-1 font-normal leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#a8a199] hover:text-[#c59b63] transition-colors p-1 -mr-2 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto pr-1 flex-1">{children}</div>
      </div>
    </div>
  );
};
