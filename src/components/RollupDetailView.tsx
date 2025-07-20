import Link from 'next/link';
import { RollupMetadata, L2Status } from '@/types/metadata';
import { BlockLink } from './BlockLink';
import { getEtherscanAddressUrl, getL2ExplorerAddressUrlFromExplorers, getNetworkName } from '@/utils/etherscan';
import { ExplorerStatus } from '@/utils/explorer-checker';
import { getStatusColor, getStatusIndicator } from '@/utils/ui';
import { AddressDisplay } from './ui/AddressDisplay';
import { UrlDisplay } from './ui/UrlDisplay';
import { ExternalLinkIcon, RefreshIcon } from './ui/Icons';

interface RollupDetailViewProps {
  metadata: RollupMetadata;
  status: L2Status;
  actualStats?: {
    actualBlockTime: number;
    actualGasLimit: number;
  };
  explorerStatuses?: ExplorerStatus[];
  onRefresh?: () => void;
  loading?: boolean;
}

export function RollupDetailView({ metadata, status, actualStats, explorerStatuses, onRefresh, loading }: RollupDetailViewProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ← Back to Dashboard
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Rollup Details
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {metadata.logo && (
                  <img
                    src={metadata.logo}
                    alt={`${metadata.name} logo`}
                    className="w-16 h-16 rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {metadata.name}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                    {metadata.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metadata.status)}`}>
                      {metadata.status}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getNetworkName(metadata.l1ChainId)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Chain ID: {metadata.l2ChainId}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh data"
                  >
                    <RefreshIcon className={loading ? 'animate-spin' : ''} />
                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                )}
                {metadata.website && (
                  <Link
                    href={metadata.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-tokamak-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>Visit Website</span>
                    <ExternalLinkIcon size="sm" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">L2 RPC</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{getStatusIndicator(status.rpcStatus)}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {status.rpcStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Block Explorers</p>
                <div className="flex items-center space-x-2 mt-1">
                  {(() => {
                    if (!metadata.explorers?.length) {
                      const statusText = 'Unavailable';
                      return (
                        <>
                          <span>{getStatusIndicator(statusText)}</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {statusText}
                          </span>
                        </>
                      );
                    }

                    const inactiveCount = metadata.explorers.filter(e => e.status === 'inactive').length;
                    const activeInMetadata = metadata.explorers.filter(e => e.status === 'active');

                    if (activeInMetadata.length === 0) {
                      const statusText = 'Unavailable';
                      return (
                        <>
                          <span>{getStatusIndicator(statusText)}</span>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {statusText}
                          </span>
                        </>
                      );
                    }

                    let statusText;
                    if (explorerStatuses) {
                      const workingCount = explorerStatuses.filter(e => e.isActive).length;
                      const unhealthyCount = activeInMetadata.length - workingCount;

                      if (workingCount === 0 && unhealthyCount > 0) {
                        statusText = `${unhealthyCount} Unhealthy`;
                      } else if (workingCount === activeInMetadata.length) {
                        statusText = `${workingCount} Available`;
                      } else if (workingCount > 0 && unhealthyCount > 0) {
                        statusText = `${workingCount} Available, ${unhealthyCount} Unhealthy`;
                      } else {
                        statusText = `${workingCount} Available`;
                      }
                    } else {
                      statusText = `${activeInMetadata.length} Available`;
                    }

                    return (
                      <>
                        <span>{getStatusIndicator(statusText)}</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {statusText}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              {metadata.explorers?.find(e => e.status === 'active') && (
                <Link
                  href={metadata.explorers.find(e => e.status === 'active')!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Open first active explorer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridge</p>
                <div className="flex items-center space-x-2 mt-1">
                  {(() => {
                    const activeCount = metadata.bridges?.filter(b => b.status === 'active').length || 0;
                    const totalCount = metadata.bridges?.length || 0;

                    let statusText;
                    if (activeCount === 0) {
                      statusText = 'Unavailable';
                    } else if (activeCount === totalCount) {
                      statusText = `${totalCount} Available`;
                    } else {
                      statusText = `${activeCount}/${totalCount} Available`;
                    }

                    return (
                      <>
                        <span>{getStatusIndicator(statusText)}</span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {statusText}
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>
              {metadata.bridges?.find(b => b.status === 'active') && (
                <Link
                  href={metadata.bridges.find(b => b.status === 'active')!.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Open first active bridge"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staking</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{getStatusIndicator(status.stakingStatus)}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {status.stakingStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Network Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Network Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rollup Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {metadata.rollupType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stack</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.stack.name} v{metadata.stack.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">L1 Chain ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.l1ChainId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">L2 Chain ID</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.l2ChainId}
                  </span>
                </div>
                <UrlDisplay
                  url={metadata.rpcUrl}
                  label="L2 RPC URL"
                  copyTooltip="Copy RPC URL"
                  linkTooltip="Open RPC URL"
                />
                {metadata.wsUrl && (
                  <UrlDisplay
                    url={metadata.wsUrl}
                    label="L2 WebSocket URL"
                    copyTooltip="Copy WebSocket URL"
                    linkTooltip="Open WebSocket URL"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Network Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Network Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest L2 Block</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.latestL2Block.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest L1 Block</span>
                  <BlockLink
                    chainId={metadata.l1ChainId}
                    blockNumber={status.latestL1Block}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">L2 Block Time</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    <span>⚙️ {metadata.networkConfig.blockTime}s</span>
                    {actualStats && (
                      actualStats.actualBlockTime && actualStats.actualBlockTime > 0 ? (
                        <span className="ml-3">
                          | 🔄 <span className="text-green-600 dark:text-green-400">{actualStats.actualBlockTime}s</span> (actual)
                        </span>
                      ) : (
                        <span className="ml-3 text-red-400 dark:text-red-500">
                          | ❌ RPC failed
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">L2 Gas Limit</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    <span>⚙️ {parseInt(metadata.networkConfig.gasLimit).toLocaleString()} gas</span>
                    {actualStats && (
                      actualStats.actualGasLimit && actualStats.actualGasLimit > 0 ? (
                        <span className="ml-3">
                          | ⛽ <span className="text-blue-600 dark:text-blue-400">{actualStats.actualGasLimit.toLocaleString()} gas</span> (actual)
                        </span>
                      ) : (
                        <span className="ml-3 text-red-400 dark:text-red-500">
                          | ❌ RPC failed
                        </span>
                      )
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Proposal</span>
                  <div className="text-right">
                    {status.lastProposalTime > 0 ? (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTimestamp(status.lastProposalTime)}
                      </span>
                    ) : (
                      <div>
                        <span className="text-sm text-red-500 dark:text-red-400">Failed to fetch</span>
                        {status.proposalError && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {status.proposalError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Batch</span>
                  <div className="text-right">
                    {status.lastBatchTime > 0 ? (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatTimestamp(status.lastBatchTime)}
                      </span>
                    ) : (
                      <div>
                        <span className="text-sm text-red-500 dark:text-red-400">Failed to fetch</span>
                        {status.batchError && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {status.batchError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Metadata
                </h3>
                <Link
                  href={`https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/${metadata.l1ChainId === 1 ? 'mainnet' : 'sepolia'}/${metadata.l1Contracts.systemConfig.toLowerCase()}.json`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  title="View metadata file in repository"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created At</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimestamp(new Date(metadata.createdAt).getTime())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimestamp(new Date(metadata.lastUpdated).getTime())}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sequencer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Sequencer
                </h3>
              </div>
              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sequencer Address</span>
                    {/* Sequencer Verification Status */}
                    {status.sequencerVerified !== undefined && (
                      <div>
                        {status.sequencerVerified === true ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            ✅ Verified
                          </span>
                        ) : status.sequencerVerificationError ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                            ❓ Unable to verify
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            ⚠️ Differs from on-chain
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.sequencer.address.slice(0, 6)}...{metadata.sequencer.address.slice(-4)}
                        </span>
                        <button
                          onClick={() => navigator.clipboard.writeText(metadata.sequencer.address)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Sequencer Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.address)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>

                    </div>
                  </div>
                </div>
                {metadata.sequencer.batcherAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Batcher Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.sequencer.batcherAddress.slice(0, 6)}...{metadata.sequencer.batcherAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => metadata.sequencer.batcherAddress && navigator.clipboard.writeText(metadata.sequencer.batcherAddress)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy Batcher Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.batcherAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View on Etherscan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
                {metadata.sequencer.proposerAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proposer Address</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.sequencer.proposerAddress.slice(0, 6)}...{metadata.sequencer.proposerAddress.slice(-4)}
                      </span>
                      <button
                        onClick={() => metadata.sequencer.proposerAddress && navigator.clipboard.writeText(metadata.sequencer.proposerAddress)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy Proposer Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.proposerAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View on Etherscan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}
                {metadata.sequencer.aggregatorAddress && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aggregator Address</span>
                    <Link
                      href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.aggregatorAddress)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-mono"
                    >
                      {metadata.sequencer.aggregatorAddress.slice(0, 6)}...{metadata.sequencer.aggregatorAddress.slice(-4)}
                    </Link>
                  </div>
                )}
                {metadata.sequencer.trustedSequencer && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trusted Sequencer</span>
                    <Link
                      href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.trustedSequencer)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-mono"
                    >
                      {metadata.sequencer.trustedSequencer.slice(0, 6)}...{metadata.sequencer.trustedSequencer.slice(-4)}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Block Explorers Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Block Explorers
              </h3>
              <div className="space-y-3">
                {metadata.explorers && metadata.explorers.length > 0 ? (
                  metadata.explorers.map((explorer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {explorer.name}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(explorer.status)}`}>
                            {explorer.status}
                          </span>
                        </div>
                        {(
                          <Link
                            href={explorer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center space-x-1 text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No block explorers available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bridges Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Bridges
              </h3>
              <div className="space-y-3">
                {metadata.bridges && metadata.bridges.length > 0 ? (
                  metadata.bridges.map((bridge, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {bridge.name}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bridge.status)}`}>
                            {bridge.status}
                          </span>
                        </div>
                        {(
                          <Link
                            href={bridge.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center space-x-1 text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">No block explorers available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Native Token */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Native Token
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Symbol</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.nativeToken.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Name</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.nativeToken.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                    {metadata.nativeToken.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Decimals</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.nativeToken.decimals}
                  </span>
                </div>
                <AddressDisplay
                  address={metadata.nativeToken.l1Address}
                  label="L1 Address"
                  explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.nativeToken.l1Address)}
                  copyTooltip="Copy L1 Native Token Address"
                  linkTooltip="View L1 Native Token on Etherscan"
                />
                <AddressDisplay
                  address={metadata.l2Contracts.nativeToken}
                  label="L2 Address"
                  explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.nativeToken)}
                  copyTooltip="Copy L2 Native Token Address"
                  linkTooltip="View L2 Native Token on L2 Explorer"
                />
              </div>
            </div>
          </div>

          {/* Staking Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Staking Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Is Candidate</span>
                  <span className={`text-sm font-medium ${metadata.staking.isCandidate ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                    {metadata.staking.isCandidate ? 'Yes' : 'No'}
                  </span>
                </div>
                {metadata.staking.candidateStatus && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Candidate Status</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {metadata.staking.candidateStatus.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {metadata.staking.candidateRegisteredAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Registered At</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(metadata.staking.candidateRegisteredAt)}
                    </span>
                  </div>
                )}
                {metadata.staking.stakingServiceName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service Name</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metadata.staking.stakingServiceName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Contract Addresses */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contract Addresses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* L1 Contracts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">L1 Contracts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">System Config</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l1Contracts.systemConfig.slice(0, 6)}...{metadata.l1Contracts.systemConfig.slice(-4)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(metadata.l1Contracts.systemConfig)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy System Config Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.systemConfig)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View System Config on Etherscan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  {metadata.l1Contracts.optimismPortal && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Portal</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismPortal.slice(0, 6)}...{metadata.l1Contracts.optimismPortal.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismPortal && navigator.clipboard.writeText(metadata.l1Contracts.optimismPortal)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Portal Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismPortal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Portal on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1StandardBridge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 Standard Bridge</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1StandardBridge.slice(0, 6)}...{metadata.l1Contracts.l1StandardBridge.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1StandardBridge && navigator.clipboard.writeText(metadata.l1Contracts.l1StandardBridge)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 Standard Bridge Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1StandardBridge)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 Standard Bridge on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l2OutputOracle && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L2 Output Oracle</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l2OutputOracle.slice(0, 6)}...{metadata.l1Contracts.l2OutputOracle.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l2OutputOracle && navigator.clipboard.writeText(metadata.l1Contracts.l2OutputOracle)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L2 Output Oracle Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l2OutputOracle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L2 Output Oracle on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.disputeGameFactory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dispute Game Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.disputeGameFactory.slice(0, 6)}...{metadata.l1Contracts.disputeGameFactory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.disputeGameFactory && navigator.clipboard.writeText(metadata.l1Contracts.disputeGameFactory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Dispute Game Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.disputeGameFactory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Dispute Game Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1CrossDomainMessenger && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 Cross Domain Messenger</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1CrossDomainMessenger.slice(0, 6)}...{metadata.l1Contracts.l1CrossDomainMessenger.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1CrossDomainMessenger && navigator.clipboard.writeText(metadata.l1Contracts.l1CrossDomainMessenger)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 Cross Domain Messenger Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1CrossDomainMessenger)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 Cross Domain Messenger on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1ERC721Bridge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 ERC721 Bridge</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1ERC721Bridge.slice(0, 6)}...{metadata.l1Contracts.l1ERC721Bridge.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1ERC721Bridge && navigator.clipboard.writeText(metadata.l1Contracts.l1ERC721Bridge)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 ERC721 Bridge Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1ERC721Bridge)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 ERC721 Bridge on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.addressManager && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Address Manager</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.addressManager.slice(0, 6)}...{metadata.l1Contracts.addressManager.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.addressManager && navigator.clipboard.writeText(metadata.l1Contracts.addressManager)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Address Manager Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.addressManager)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Address Manager on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.optimismMintableERC20Factory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Mintable ERC20 Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismMintableERC20Factory.slice(0, 6)}...{metadata.l1Contracts.optimismMintableERC20Factory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismMintableERC20Factory && navigator.clipboard.writeText(metadata.l1Contracts.optimismMintableERC20Factory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Mintable ERC20 Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismMintableERC20Factory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Mintable ERC20 Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.optimismMintableERC721Factory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Mintable ERC721 Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismMintableERC721Factory.slice(0, 6)}...{metadata.l1Contracts.optimismMintableERC721Factory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismMintableERC721Factory && navigator.clipboard.writeText(metadata.l1Contracts.optimismMintableERC721Factory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Mintable ERC721 Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismMintableERC721Factory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Mintable ERC721 Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.superchainConfig && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Superchain Config</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.superchainConfig.slice(0, 6)}...{metadata.l1Contracts.superchainConfig.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.superchainConfig && navigator.clipboard.writeText(metadata.l1Contracts.superchainConfig)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Superchain Config Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.superchainConfig)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Superchain Config on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1UsdcBridge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 USDC Bridge</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1UsdcBridge.slice(0, 6)}...{metadata.l1Contracts.l1UsdcBridge.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1UsdcBridge && navigator.clipboard.writeText(metadata.l1Contracts.l1UsdcBridge)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 USDC Bridge Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1UsdcBridge)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 USDC Bridge on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1Usdc && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 USDC</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1Usdc.slice(0, 6)}...{metadata.l1Contracts.l1Usdc.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1Usdc && navigator.clipboard.writeText(metadata.l1Contracts.l1Usdc)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 USDC Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1Usdc)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 USDC on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* L2 Contracts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">L2 Contracts</h4>
                <div className="space-y-2">
                  <AddressDisplay
                    address={metadata.l2Contracts.nativeToken}
                    label="Native Token"
                    explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.nativeToken)}
                    copyTooltip="Copy Native Token Address"
                    linkTooltip="View Native Token on L2 Explorer"
                  />
                  {metadata.l2Contracts.l2StandardBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2StandardBridge}
                      label="L2 Standard Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2StandardBridge)}
                      copyTooltip="Copy L2 Standard Bridge Address"
                      linkTooltip="View L2 Standard Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2CrossDomainMessenger && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2CrossDomainMessenger}
                      label="L2 Cross Domain Messenger"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2CrossDomainMessenger)}
                      copyTooltip="Copy L2 Cross Domain Messenger Address"
                      linkTooltip="View L2 Cross Domain Messenger on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l1Block && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l1Block}
                      label="L1 Block"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l1Block)}
                      copyTooltip="Copy L1 Block Address"
                      linkTooltip="View L1 Block on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2ToL1MessagePasser && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2ToL1MessagePasser}
                      label="L2 To L1 Message Passer"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2ToL1MessagePasser)}
                      copyTooltip="Copy L2 To L1 Message Passer Address"
                      linkTooltip="View L2 To L1 Message Passer on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.gasPriceOracle && (
                    <AddressDisplay
                      address={metadata.l2Contracts.gasPriceOracle}
                      label="Gas Price Oracle"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.gasPriceOracle)}
                      copyTooltip="Copy Gas Price Oracle Address"
                      linkTooltip="View Gas Price Oracle on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2ERC721Bridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2ERC721Bridge}
                      label="L2 ERC721 Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2ERC721Bridge)}
                      copyTooltip="Copy L2 ERC721 Bridge Address"
                      linkTooltip="View L2 ERC721 Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l1FeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l1FeeVault}
                      label="L1 Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l1FeeVault)}
                      copyTooltip="Copy L1 Fee Vault Address"
                      linkTooltip="View L1 Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.sequencerFeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.sequencerFeeVault}
                      label="Sequencer Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.sequencerFeeVault)}
                      copyTooltip="Copy Sequencer Fee Vault Address"
                      linkTooltip="View Sequencer Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.baseFeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.baseFeeVault}
                      label="Base Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.baseFeeVault)}
                      copyTooltip="Copy Base Fee Vault Address"
                      linkTooltip="View Base Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2UsdcBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2UsdcBridge}
                      label="L2 USDC Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2UsdcBridge)}
                      copyTooltip="Copy L2 USDC Bridge Address"
                      linkTooltip="View L2 USDC Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2Usdc && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2Usdc}
                      label="L2 USDC"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2Usdc)}
                      copyTooltip="Copy L2 USDC Address"
                      linkTooltip="View L2 USDC on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.wrappedETH && (
                    <AddressDisplay
                      address={metadata.l2Contracts.wrappedETH}
                      label="Wrapped ETH"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.wrappedETH)}
                      copyTooltip="Copy Wrapped ETH Address"
                      linkTooltip="View Wrapped ETH on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.polygonZkEVMBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.polygonZkEVMBridge}
                      label="Polygon zkEVM Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.polygonZkEVMBridge)}
                      copyTooltip="Copy Polygon zkEVM Bridge Address"
                      linkTooltip="View Polygon zkEVM Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.polygonZkEVMGlobalExitRoot && (
                    <AddressDisplay
                      address={metadata.l2Contracts.polygonZkEVMGlobalExitRoot}
                      label="Polygon zkEVM Global Exit Root"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.polygonZkEVMGlobalExitRoot)}
                      copyTooltip="Copy Polygon zkEVM Global Exit Root Address"
                      linkTooltip="View Polygon zkEVM Global Exit Root on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.multicall && (
                    <AddressDisplay
                      address={metadata.l2Contracts.multicall}
                      label="Multicall"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.multicall)}
                      copyTooltip="Copy Multicall Address"
                      linkTooltip="View Multicall on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.create2Deployer && (
                    <AddressDisplay
                      address={metadata.l2Contracts.create2Deployer}
                      label="Create2 Deployer"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.create2Deployer)}
                      copyTooltip="Copy Create2 Deployer Address"
                      linkTooltip="View Create2 Deployer on L2 Explorer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}