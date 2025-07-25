import { L2Status } from '@/types/metadata';
import { StatsOverview } from './StatsOverview';
import { RollupTable } from './RollupTable';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface SelectedL2DashboardProps {
  selectedL2s: string[];
  rollupStatuses: L2Status[];
  loading: boolean;
}

export function SelectedL2Dashboard({
  selectedL2s,
  rollupStatuses,
  loading
}: SelectedL2DashboardProps) {
  if (selectedL2s.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-24 w-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No L2s Selected</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Select L2 rollups from the left panel to monitor their status and performance metrics in real-time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Selected L2 Status ({selectedL2s.length})
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Real-time monitoring of your selected L2 rollups
            </p>
          </div>
        </div>

        {/* 통계 개요 */}
        {rollupStatuses.length > 0 && (
          <div className="mb-6">
            <StatsOverview rollups={rollupStatuses} />
          </div>
        )}

        {/* 롤업 상태 카드들 */}
        {loading && rollupStatuses.length === 0 ? (
          <div className="py-12">
            <LoadingSpinner size="lg" text="Loading L2 status..." className="py-4" />
          </div>
        ) : rollupStatuses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unable to load status for the selected L2 rollups. Please try refreshing.
            </p>
          </div>
        ) : (
          <RollupTable rollups={rollupStatuses} />
        )}
      </div>
    </div>
  );
}