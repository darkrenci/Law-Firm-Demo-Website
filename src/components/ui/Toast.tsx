import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, description }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setMessages((prev) => [...prev, { id, type, title, description }]);
      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, description?: string) => {
    toast({ type: 'success', title, description });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    toast({ type: 'error', title, description });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    toast({ type: 'info', title, description });
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {messages.map((m) => {
          return (
            <div
              key={m.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 border bg-[#121217] shadow-xl transition-all duration-300 ${
                m.type === 'success'
                  ? 'border-[#c59b63] text-[#f7f4ee]'
                  : m.type === 'error'
                  ? 'border-red-600/80 text-[#f7f4ee]'
                  : 'border-[#2a2a35] text-[#f7f4ee]'
              }`}
            >
              {m.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#c59b63] flex-shrink-0 mt-0.5" />}
              {m.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
              {m.type === 'info' && <Info className="w-5 h-5 text-[#d4af7a] flex-shrink-0 mt-0.5" />}
              <div className="flex-1 text-left">
                <p className="font-cinzel text-xs font-semibold tracking-wider text-[#f7f4ee] uppercase">
                  {m.title}
                </p>
                {m.description && (
                  <p className="text-xs text-[#a8a199] mt-0.5 leading-relaxed">{m.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(m.id)}
                className="text-[#6e6860] hover:text-[#f7f4ee] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
