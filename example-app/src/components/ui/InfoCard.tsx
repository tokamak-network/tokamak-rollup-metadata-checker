import React from 'react';
import Link from 'next/link';
import { Card } from './Card';

interface InfoItem {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface InfoCardProps {
  title: string;
  items: InfoItem[];
  headerLink?: {
    url: string;
    tooltip: string;
  };
  className?: string;
}

export function InfoCard({ title, items, headerLink, className = "" }: InfoCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        {headerLink && (
          <Link
            href={headerLink.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title={headerLink.tooltip}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
            <div className={`text-sm font-medium text-gray-900 dark:text-white ${item.className || ''}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}