import { L2Status } from '@/types/metadata';

interface RollupCardProps {
  rollup: L2Status;
}

export function RollupCard({ rollup }: RollupCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 11155111:
        return 'Sepolia';
      default:
        return `Chain ${chainId}`;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{rollup.name}</h3>
        <span className={`status-badge ${getStatusColor(rollup.status)}`}>
          {rollup.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">L1 Network:</span>
          <span className="font-medium text-gray-900 dark:text-white">{getNetworkName(rollup.l1ChainId)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">L2 Chain ID:</span>
          <span className="font-medium text-gray-900 dark:text-white">{rollup.l2ChainId}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Rollup Type:</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize">{rollup.rollupType}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Sequencer:</span>
          <span className={`font-medium ${rollup.sequencerStatus === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {rollup.sequencerStatus}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">RPC Status:</span>
          <span className={`font-medium ${rollup.rpcStatus === 'healthy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {rollup.rpcStatus}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Staking:</span>
          <span className={`font-medium ${rollup.stakingStatus === 'candidate' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {rollup.stakingStatus}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Last checked:</span>
            <span>{new Date(rollup.lastChecked).toLocaleTimeString()}</span>
          </div>
        </div>

        {rollup.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            <div className="text-xs font-medium text-red-800 dark:text-red-400 mb-1">Errors:</div>
            <div className="text-xs text-red-700 dark:text-red-300">
              {rollup.errors.slice(0, 2).map((error, index) => (
                <div key={index}>{error}</div>
              ))}
              {rollup.errors.length > 2 && (
                <div>... and {rollup.errors.length - 2} more</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}