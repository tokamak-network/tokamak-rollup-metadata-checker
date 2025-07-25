import React from 'react';
import Link from 'next/link';
import { CopyIcon, ExternalLinkIcon } from './Icons';
import { Tooltip } from './Tooltip';

interface UrlDisplayProps {
  url: string;
  label: string;
  copyTooltip?: string;
  linkTooltip?: string;
  maxLength?: number;
}

export function UrlDisplay({
  url,
  label,
  copyTooltip = `Copy ${label}`,
  linkTooltip = `Open ${label}`,
  maxLength = 30
}: UrlDisplayProps) {
  const displayUrl = url.length > maxLength
    ? `${url.slice(0, maxLength)}...`
    : url;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-mono text-gray-900 dark:text-white max-w-xs truncate">
          {displayUrl}
        </span>
        <Tooltip content={copyTooltip}>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <CopyIcon />
          </button>
        </Tooltip>
        <Tooltip content={linkTooltip}>
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLinkIcon />
          </Link>
        </Tooltip>
      </div>
    </div>
  );
}