'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { L2Status, L2BasicInfo } from '@/types/metadata';
import { L2SelectionPanel } from '@/components/L2SelectionPanel';
import { SelectedL2Dashboard } from '@/components/SelectedL2Dashboard';
import { useSelectedL2s } from '@/hooks/useSelectedL2s';
import { ErrorMessage } from '@/components/ErrorMessage';

export default function Dashboard() {
  const [availableL2s, setAvailableL2s] = useState<L2BasicInfo[]>([]);
  const [rollupStatuses, setRollupStatuses] = useState<L2Status[]>([]);
  const [l2sLoading, setL2sLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [l2ListLastUpdated, setL2ListLastUpdated] = useState<Date | null>(null);

  const { selectedL2s, toggleL2, clearAll, selectAll } = useSelectedL2s();

  // L2 기본 정보 가져오기
  const fetchL2List = useCallback(async () => {
    try {
      console.log('🔄 Starting fetchL2List, setting loading to true');
      setL2sLoading(true);
      setError(null);

      const response = await fetch('/api/l2-list');
      if (!response.ok) {
        throw new Error('Failed to fetch L2 list');
      }

      const data = await response.json();
      console.log('✅ fetchL2List success, data length:', data.length);
      setAvailableL2s(data);
      setL2ListLastUpdated(new Date());
    } catch (err) {
      console.error('❌ fetchL2List error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('🏁 fetchL2List finally, setting loading to false');
      setL2sLoading(false);
    }
  }, []);

  // 선택된 L2들의 상태 가져오기 (디바운싱 적용)
  const fetchSelectedL2Status = useCallback(async () => {
    console.log('🔍 fetchSelectedL2Status called with selectedL2s:', selectedL2s);

    if (selectedL2s.length === 0) {
      console.log('⚠️ No L2s selected, clearing statuses');
      setRollupStatuses([]);
      return;
    }

    try {
      setStatusLoading(true);
      setError(null);

      const addresses = selectedL2s.join(',');
      console.log('📡 Fetching rollup status for addresses:', addresses);

      const response = await fetch(`/api/rollups?addresses=${addresses}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rollup status');
      }

      const data = await response.json();
      console.log('✅ Received rollup data:', data);
      setRollupStatuses(data);
    } catch (err) {
      console.error('❌ Error fetching rollup status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setStatusLoading(false);
    }
  }, [selectedL2s]);

  // 초기 L2 목록 로드
  useEffect(() => {
    fetchL2List();
  }, []);

  // 선택된 L2가 변경될 때마다 상태 업데이트 (디바운싱 적용)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSelectedL2Status();
    }, 300); // 300ms 디바운싱

    return () => clearTimeout(timeoutId);
  }, [selectedL2s, fetchSelectedL2Status]);

  const handleSelectAll = useCallback(() => {
    selectAll(availableL2s.map(l2 => l2.systemConfigAddress));
  }, [availableL2s, selectAll]);



  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage message={error} onRetry={fetchL2List} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 왼쪽 L2 선택 패널 */}
      <L2SelectionPanel
        availableL2s={availableL2s}
        selectedL2s={selectedL2s}
        onToggleL2={toggleL2}
        onClearAll={clearAll}
        onSelectAll={handleSelectAll}
        onRefresh={fetchL2List}
        lastUpdated={l2ListLastUpdated}
        loading={l2sLoading}
      />

      {/* 오른쪽 선택된 L2 대시보드 */}
      <SelectedL2Dashboard
        selectedL2s={selectedL2s}
        rollupStatuses={rollupStatuses}
        loading={statusLoading || l2sLoading}
      />
    </div>
  );
}