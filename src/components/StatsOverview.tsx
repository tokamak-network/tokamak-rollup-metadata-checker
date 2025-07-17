import { L2Status } from '@/types/metadata';

interface StatsOverviewProps {
  rollups: L2Status[];
}

export function StatsOverview({ rollups }: StatsOverviewProps) {
  const totalRollups = rollups.length;
  const activeRollups = rollups.filter(r => r.status === 'active').length;
  const candidateRollups = rollups.filter(r => r.stakingStatus === 'candidate').length;
  const healthyRpc = rollups.filter(r => r.rpcStatus === 'healthy').length;

  const stats = [
    {
      name: 'Total Rollups',
      value: totalRollups,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Active',
      value: activeRollups,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Staking Candidates',
      value: candidateRollups,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      name: 'Healthy RPC',
      value: healthyRpc,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.name} className={`card ${stat.bgColor}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {stat.name}
              </div>
              {totalRollups > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {((stat.value / totalRollups) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}