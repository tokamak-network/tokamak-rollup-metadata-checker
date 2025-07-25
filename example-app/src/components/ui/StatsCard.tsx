import React from 'react';

interface StatsCardProps {
  name: string;
  value: number;
  total?: number;
  color: string;
  bgColor: string;
  showPercentage?: boolean;
}

export function StatsCard({
  name,
  value,
  total,
  color,
  bgColor,
  showPercentage = true
}: StatsCardProps) {
  return (
    <div className={`card ${bgColor}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`text-2xl font-bold ${color}`}>
            {value}
          </div>
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {name}
          </div>
          {showPercentage && total && total > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {((value / total) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}