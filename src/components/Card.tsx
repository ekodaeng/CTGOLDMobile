import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-700 transition-all duration-150 hover:border-ctgold-gold-soft ${
        onClick ? 'cursor-pointer hover:scale-[1.01] active:scale-[0.98] hover:shadow-ctgold-glow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
