import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100';

    const variantStyles = {
      primary: 'bg-gradient-to-r from-[#F5C542] to-[#D6B25E] text-[#0B0F1A] hover:shadow-[#F5C542]/40 hover:scale-[1.02] hover:brightness-110 active:scale-[0.99]',
      secondary: 'bg-gray-800/70 backdrop-blur-sm text-gray-100 border border-gray-700 hover:bg-gray-700/70 hover:border-gray-600',
      ghost: 'bg-transparent text-gray-300 hover:bg-gray-800/50 hover:text-white'
    };

    const sizeStyles = {
      sm: 'py-2 px-4 text-sm',
      md: 'py-3.5 px-6 text-base',
      lg: 'py-4 px-8 text-lg'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span>Memproses...</span>
        ) : (
          <>
            {leftIcon && <span>{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span>{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
