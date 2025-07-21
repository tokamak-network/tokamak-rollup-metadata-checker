import React from 'react';
import { getStatusIndicator } from '@/utils/ui';

interface StatusDisplayProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusDisplay({
  status,
  size = 'md',
  showIcon = true,
  className = ''
}: StatusDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const textClasses = `font-semibold text-gray-900 dark:text-white capitalize ${sizeClasses[size]}`;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <span>{getStatusIndicator(status)}</span>}
      <span className={textClasses}>
        {status}
      </span>
    </div>
  );
}