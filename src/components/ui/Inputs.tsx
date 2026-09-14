import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#121216] border ${
            error ? 'border-red-500' : 'border-[#2a2a35] focus:border-[#c59b63]'
          } rounded-none px-4 py-2.5 text-sm text-[#f7f4ee] placeholder:text-[#6e6860] focus:outline-none focus:ring-1 focus:ring-[#c59b63]/50 transition-colors ${className}`}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] text-[#8e877e] leading-relaxed">{helperText}</p>
        )}
        {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', rows = 4, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-[#121216] border ${
            error ? 'border-red-500' : 'border-[#2a2a35] focus:border-[#c59b63]'
          } rounded-none px-4 py-2.5 text-sm text-[#f7f4ee] placeholder:text-[#6e6860] focus:outline-none focus:ring-1 focus:ring-[#c59b63]/50 transition-colors ${className}`}
          {...props}
        />
        {helperText && !error && (
          <p className="text-[11px] text-[#8e877e] leading-relaxed">{helperText}</p>
        )}
        {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block font-cinzel text-[11px] font-semibold tracking-[0.15em] text-[#d4af7a] uppercase">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-[#121216] border ${
            error ? 'border-red-500' : 'border-[#2a2a35] focus:border-[#c59b63]'
          } rounded-none px-4 py-2.5 text-sm text-[#f7f4ee] focus:outline-none focus:ring-1 focus:ring-[#c59b63]/50 transition-colors cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#121216] text-[#f7f4ee]">
              {opt.label}
            </option>
          ))}
        </select>
        {helperText && !error && (
          <p className="text-[11px] text-[#8e877e] leading-relaxed">{helperText}</p>
        )}
        {error && <p className="text-[11px] text-red-400 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
