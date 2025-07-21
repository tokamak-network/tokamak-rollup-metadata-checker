import { useRouter } from 'next/navigation';
import { L2Status } from '@/types/metadata';
import { getNetworkName } from '@/utils/etherscan';
import { getStatusColor, getStatusIndicator } from '@/utils/ui';
import { StatusBadge } from './ui/StatusBadge';
import { StatusDisplay } from './ui/StatusDisplay';

interface RollupTableProps {
  rollups: L2Status[];
}

export function RollupTable({ rollups }: RollupTableProps) {
  const router = useRouter();

  return (
    <>
      <div className="overflow-x-auto shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 rounded-lg">
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
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Chain {rollup.l2ChainId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-900 dark:text-white">
                    {getNetworkName(rollup.l1ChainId)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={rollup.status} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusDisplay status={rollup.rpcStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusDisplay status={rollup.stakingStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400">
                  <div>
                    <div>{new Date(rollup.lastChecked).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</div>
                    <div>{new Date(rollup.lastChecked).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZoneName: 'short'
                    })}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}