import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GoldButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
}

export default function GoldButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}: GoldButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700] text-black font-bold shadow-lg shadow-[#FFD700]/50',
    secondary: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-[#FFD700]/30 font-semibold',
    ghost: 'bg-transparent text-[#FFD700] border border-[#FFD700]/50 font-semibold hover:bg-[#FFD700]/10',
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative px-8 py-4 rounded-2xl
        ${variants[variant]}
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {variant === 'primary' && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </motion.button>
  );
}
