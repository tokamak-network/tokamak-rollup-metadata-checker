import React from 'react';
import Link from 'next/link';
import { getStatusColor } from '@/utils/ui';

interface Service {
  name: string;
  status: string;
  url: string;
}

interface ServiceListProps {
  title: string;
  services: Service[];
  emptyMessage?: string;
  className?: string;
}

export function ServiceList({
  title,
  services,
  emptyMessage = "No services available",
  className = ""
}: ServiceListProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {services && services.length > 0 ? (
            services.map((service, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.name}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
                <Link
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center space-x-1 text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title={`Open ${service.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <p className="text-sm">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}