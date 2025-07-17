import Link from 'next/link';
import { RollupMetadata, L2Status } from '@/types/metadata';

interface RollupDetailViewProps {
  metadata: RollupMetadata;
  status: L2Status;
}

export function RollupDetailView({ metadata, status }: RollupDetailViewProps) {
  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 11155111:
        return 'Sepolia Testnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'inactive':
      case 'unhealthy':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'maintenance':
      case 'candidate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIndicator = (status: string) => {
    if (status === 'active' || status === 'healthy') {
      return '🟢';
    } else if (status === 'maintenance' || status === 'candidate') {
      return '🟡';
    } else {
      return '🔴';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
              {metadata.website && (
                <Link
                  href={metadata.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-tokamak-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Visit Website
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sequencer</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{getStatusIndicator(status.sequencerStatus)}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {status.sequencerStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">RPC</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridge</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{getStatusIndicator(status.bridgeStatus)}</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                    {status.bridgeStatus}
                  </span>
                </div>
              </div>
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
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest L2 Block</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.latestL2Block.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Latest L1 Block</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {status.latestL1Block.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Block Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.networkConfig.blockTime}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Gas Limit</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {parseInt(metadata.networkConfig.gasLimit).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stack & Infrastructure */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stack & Infrastructure
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stack</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {metadata.stack.name} v{metadata.stack.version}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">RPC URL</span>
                  <Link
                    href={metadata.rpcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View Endpoint
                  </Link>
                </div>
                {metadata.wsUrl && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">WebSocket URL</span>
                    <Link
                      href={metadata.wsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Endpoint
                    </Link>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Proposal</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimestamp(status.lastProposalTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Batch</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatTimestamp(status.lastBatchTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Created At</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(metadata.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(metadata.lastUpdated)}
                  </span>
                </div>
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
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">L1 Address</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {metadata.nativeToken.l1Address.slice(0, 6)}...{metadata.nativeToken.l1Address.slice(-4)}
                  </span>
                </div>
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
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">System Config</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {metadata.l1Contracts.systemConfig.slice(0, 6)}...{metadata.l1Contracts.systemConfig.slice(-4)}
                    </span>
                  </div>
                  {metadata.l1Contracts.optimismPortal && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Portal</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l1Contracts.optimismPortal.slice(0, 6)}...{metadata.l1Contracts.optimismPortal.slice(-4)}
                      </span>
                    </div>
                  )}
                  {metadata.l1Contracts.l1StandardBridge && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 Standard Bridge</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l1Contracts.l1StandardBridge.slice(0, 6)}...{metadata.l1Contracts.l1StandardBridge.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* L2 Contracts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">L2 Contracts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Native Token</span>
                    <span className="text-sm font-mono text-gray-900 dark:text-white">
                      {metadata.l2Contracts.nativeToken.slice(0, 6)}...{metadata.l2Contracts.nativeToken.slice(-4)}
                    </span>
                  </div>
                  {metadata.l2Contracts.l2StandardBridge && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L2 Standard Bridge</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l2Contracts.l2StandardBridge.slice(0, 6)}...{metadata.l2Contracts.l2StandardBridge.slice(-4)}
                      </span>
                    </div>
                  )}
                  {metadata.l2Contracts.l2CrossDomainMessenger && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L2 Cross Domain Messenger</span>
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l2Contracts.l2CrossDomainMessenger.slice(0, 6)}...{metadata.l2Contracts.l2CrossDomainMessenger.slice(-4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bridges and Explorers */}
        {(metadata.bridges.length > 0 || metadata.explorers.length > 0) && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bridges */}
            {metadata.bridges.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Bridges
                  </h3>
                  <div className="space-y-3">
                    {metadata.bridges.map((bridge, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {bridge.name}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(bridge.status)}`}>
                            {bridge.status}
                          </span>
                        </div>
                        <Link
                          href={bridge.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Visit
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Explorers */}
            {metadata.explorers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Block Explorers
                  </h3>
                  <div className="space-y-3">
                    {metadata.explorers.map((explorer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {explorer.name}
                          </span>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(explorer.status)}`}>
                            {explorer.status}
                          </span>
                        </div>
                        <Link
                          href={explorer.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Visit
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}