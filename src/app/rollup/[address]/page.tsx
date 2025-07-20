'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RollupMetadata, L2Status } from '@/types/metadata';
import { RollupDetailView } from '@/components/RollupDetailView';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ExplorerStatus } from '@/utils/explorer-checker';

interface RollupDetailData {
  metadata: RollupMetadata;
  status: L2Status;
  actualStats?: {
    actualBlockTime: number;
    actualGasLimit: number;
  };
  explorerStatuses?: ExplorerStatus[];
}

export default function RollupDetailPage() {
  const params = useParams();
  const address = params.address as string;

  const [rollupData, setRollupData] = useState<RollupDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRollupDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Fetching rollup detail for address: ${address}`);

      const response = await fetch(`/api/rollup/${address}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('L2 rollup not found');
        }
        throw new Error('Failed to fetch rollup details');
      }

      const data = await response.json();
      console.log('✅ Received rollup detail data:', data);
      setRollupData(data);
    } catch (err) {
      console.error('❌ Error fetching rollup detail:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchRollupDetail();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tokamak-blue mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading rollup details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorMessage message={error} onRetry={fetchRollupDetail} />
      </div>
    );
  }

  if (!rollupData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unable to load details for this rollup.
          </p>
        </div>
      </div>
    );
  }

  return <RollupDetailView
    metadata={rollupData.metadata}
    status={rollupData.status}
    actualStats={rollupData.actualStats}
    explorerStatuses={rollupData.explorerStatuses}
    onRefresh={fetchRollupDetail}
    loading={loading}
  />;
}