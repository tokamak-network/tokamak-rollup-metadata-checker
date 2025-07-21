import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  showText?: boolean;
  centered?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  showText = true,
  centered = true,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const containerClasses = centered
    ? 'flex items-center justify-center'
    : 'flex items-center';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-tokamak-blue ${sizeClasses[size]}`}></div>
      {showText && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}