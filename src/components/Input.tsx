import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-gray-800/70 backdrop-blur-sm text-gray-100 border ${
              error ? 'border-red-500' : 'border-gray-700'
            } rounded-xl px-4 ${
              icon ? 'pl-12' : ''
            } py-3.5 focus:outline-none focus:ring-2 ${
              error
                ? 'focus:ring-red-500/50'
                : 'focus:ring-[#F5C542]/50'
            } focus:border-transparent transition-all duration-200 placeholder:text-gray-500 ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span>•</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
