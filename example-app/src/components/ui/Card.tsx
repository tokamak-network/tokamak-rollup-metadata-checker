import React from 'react';

interface CardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'custom';
  paddingX?: 'none' | 'sm' | 'md' | 'lg';
  paddingY?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  className?: string;
}

export function Card({
  children,
  padding = 'md',
  paddingX,
  paddingY,
  hover = false,
  className = ''
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    custom: '' // paddingX, paddingY로 개별 제어
  };

  const paddingXClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8'
  };

  const paddingYClasses = {
    none: 'py-0',
    sm: 'py-4',
    md: 'py-6',
    lg: 'py-8'
  };

  const getPaddingClass = () => {
    if (padding === 'custom' && (paddingX || paddingY)) {
      const px = paddingX ? paddingXClasses[paddingX] : '';
      const py = paddingY ? paddingYClasses[paddingY] : '';
      return `${px} ${py}`.trim();
    }
    return paddingClasses[padding];
  };

  const hoverClass = hover ? 'hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${getPaddingClass()} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
}