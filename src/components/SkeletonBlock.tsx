interface SkeletonBlockProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function SkeletonBlock({
  width = 'w-full',
  height = 'h-4',
  className = '',
  rounded = 'md'
}: SkeletonBlockProps) {
  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  }[rounded];

  return (
    <div
      className={`${width} ${height} ${roundedClass} bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}
