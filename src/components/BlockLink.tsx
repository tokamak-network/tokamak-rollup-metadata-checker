import { getEtherscanBlockUrl } from '@/utils/etherscan';

interface BlockLinkProps {
  chainId: number;
  blockNumber: number;
  className?: string;
  showIcon?: boolean;
}

export function BlockLink({
  chainId,
  blockNumber,
  className = "text-sm font-medium text-tokamak-blue dark:text-tokamak-blue hover:underline transition-colors",
  showIcon = true
}: BlockLinkProps) {
  if (!blockNumber || blockNumber === 0) {
    return (
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {blockNumber.toLocaleString()}
      </span>
    );
  }

  return (
    <a
      href={getEtherscanBlockUrl(chainId, blockNumber)}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} ${showIcon ? 'inline-flex items-center gap-1' : ''}`}
      title={`View block ${blockNumber} on Etherscan`}
    >
      {blockNumber.toLocaleString()}
      {showIcon && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </a>
  );
}