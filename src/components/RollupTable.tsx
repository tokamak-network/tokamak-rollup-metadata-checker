import { useRouter } from 'next/navigation';
import { L2Status } from '@/types/metadata';
import { getNetworkName } from '@/utils/etherscan';
import { getStatusColor, getStatusIndicator } from '@/utils/ui';

interface RollupTableProps {
  rollups: L2Status[];
}

export function RollupTable({ rollups }: RollupTableProps) {
  const router = useRouter();

  return (
    <>
      <div className="overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                L2 Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sequencer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                RPC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Staking
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Check
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {rollups.map((rollup) => (
              <tr
                key={rollup.systemConfigAddress}
                onClick={() => router.push(`/rollup/${rollup.systemConfigAddress.toLowerCase()}`)}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {rollup.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Chain {rollup.l2ChainId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {getNetworkName(rollup.l1ChainId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rollup.status)}`}>
                    {rollup.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">{getStatusIndicator(rollup.sequencerStatus)}</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {rollup.sequencerStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">{getStatusIndicator(rollup.rpcStatus)}</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {rollup.rpcStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">{getStatusIndicator(rollup.stakingStatus)}</span>
                    <span className="text-gray-900 dark:text-white capitalize">
                      {rollup.stakingStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(rollup.lastChecked).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}