import React from 'react';
import Link from 'next/link';
import { CopyIcon, ExternalLinkIcon } from './Icons';
import { Tooltip } from './Tooltip';

interface AddressDisplayProps {
  address: string;
  label: string;
  explorerUrl?: string | null;
  copyTooltip?: string;
  linkTooltip?: string;
  noExplorerTooltip?: string;
  showFullAddress?: boolean;
}

export function AddressDisplay({
  address,
  label,
  explorerUrl,
  copyTooltip = `Copy ${label}`,
  linkTooltip = `View ${label} on Explorer`,
  noExplorerTooltip = "No active explorer available",
  showFullAddress = false
}: AddressDisplayProps) {
  const displayAddress = showFullAddress
    ? address
    : `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-mono text-gray-900 dark:text-white max-w-xs truncate">
          {displayAddress}
        </span>
        <Tooltip content={copyTooltip}>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <CopyIcon />
          </button>
        </Tooltip>
        {explorerUrl ? (
          <Tooltip content={linkTooltip}>
            <Link
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ExternalLinkIcon />
            </Link>
          </Tooltip>
        ) : (
          <Tooltip content={noExplorerTooltip}>
            <span className="text-gray-400 cursor-not-allowed">
              <ExternalLinkIcon />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}