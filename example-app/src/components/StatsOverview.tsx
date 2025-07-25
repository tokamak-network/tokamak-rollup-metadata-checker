import { L2Status } from '@/types/metadata';
import { StatsCard } from './ui/StatsCard';

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
        <StatsCard
          key={stat.name}
          name={stat.name}
          value={stat.value}
          total={totalRollups}
          color={stat.color}
          bgColor={stat.bgColor}
        />
      ))}
    </div>
  );
}