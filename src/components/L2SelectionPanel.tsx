import { useState, useMemo } from 'react';
import { L2BasicInfo } from '@/types/metadata';

interface L2SelectionPanelProps {
  availableL2s: L2BasicInfo[];
  selectedL2s: string[];
  onToggleL2: (address: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
  loading?: boolean;
}

export function L2SelectionPanel({
  availableL2s,
  selectedL2s,
  onToggleL2,
  onClearAll,
  onSelectAll,
  onRefresh,
  lastUpdated,
  loading = false
}: L2SelectionPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'maintenance':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'deprecated':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'shutdown':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };

  // 필터링된 L2 목록을 네트워크별로 그룹화
  const groupedL2s = useMemo(() => {
    const filtered = availableL2s.filter(l2 => {
      const searchMatch = l2.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l2.systemConfigAddress.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = statusFilter === 'all' || l2.status === statusFilter;
      const networkMatch = networkFilter === 'all' || l2.l1ChainId.toString() === networkFilter;
      return searchMatch && statusMatch && networkMatch;
    });

    // 네트워크별로 그룹화
    const grouped = filtered.reduce((acc, l2) => {
      const networkKey = `${l2.l1ChainId}-${getNetworkName(l2.l1ChainId)}`;
      if (!acc[networkKey]) {
        acc[networkKey] = {
          chainId: l2.l1ChainId,
          networkName: getNetworkName(l2.l1ChainId),
          l2s: []
        };
      }
      acc[networkKey].l2s.push(l2);
      return acc;
    }, {} as Record<string, { chainId: number; networkName: string; l2s: L2BasicInfo[] }>);

    // 각 그룹 내에서 L2를 이름순으로 정렬
    Object.values(grouped).forEach(group => {
      group.l2s.sort((a, b) => a.name.localeCompare(b.name));
    });

    // 네트워크 순서 정렬 (Mainnet 먼저, 그 다음 Sepolia, 나머지는 체인ID 순)
    return Object.values(grouped).sort((a, b) => {
      if (a.chainId === 1) return -1;
      if (b.chainId === 1) return 1;
      if (a.chainId === 11155111) return -1;
      if (b.chainId === 11155111) return 1;
      return a.chainId - b.chainId;
    });
  }, [availableL2s, searchTerm, statusFilter, networkFilter]);

  const totalFilteredCount = groupedL2s.reduce((sum, group) => sum + group.l2s.length, 0);

  // 사용 가능한 네트워크 목록 (주요 네트워크는 항상 표시)
  const availableNetworks = useMemo(() => {
    const dataNetworks = new Set(availableL2s.map(l2 => l2.l1ChainId));
    const allNetworks = new Set([1, 11155111, ...dataNetworks]); // 메인넷과 세폴리아는 항상 포함

    return Array.from(allNetworks).sort((a, b) => {
      if (a === 1) return -1;
      if (b === 1) return 1;
      if (a === 11155111) return -1;
      if (b === 11155111) return 1;
      return a - b;
    }).map(chainId => ({
      chainId,
      name: getNetworkName(chainId),
      hasData: dataNetworks.has(chainId)
    }));
  }, [availableL2s]);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">L2 Rollups</h2>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-tokamak-blue dark:hover:text-tokamak-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh L2 list and metadata from repository"
              >
                <svg
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            )}
          </div>
          {lastUpdated && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              L2 List Updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search L2s..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tokamak-blue focus:border-transparent"
          />
        </div>

        {/* 네트워크 필터 */}
        <div className="mb-3">
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-tokamak-blue focus:border-transparent"
          >
            <option value="all">All Networks</option>
            {availableNetworks.map(network => (
              <option key={network.chainId} value={network.chainId.toString()}>
                {network.name}{!network.hasData ? ' (No L2s)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 상태 필터 */}
        <div className="mb-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-tokamak-blue focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="deprecated">Deprecated</option>
            <option value="shutdown">Shutdown</option>
          </select>
        </div>
      </div>

      {/* L2 목록 */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tokamak-blue"></div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading L2s...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedL2s.map((group) => (
              <div key={group.chainId} className="space-y-2">
                {/* 네트워크 헤더 */}
                <div className="flex items-center justify-between px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-tokamak-blue"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {group.networkName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      (Chain {group.chainId})
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {group.l2s.length} L2{group.l2s.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* L2 목록 */}
                <div className="ml-2 space-y-1">
                  {group.l2s.map((l2) => (
                    <label
                      key={l2.systemConfigAddress}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedL2s.includes(l2.systemConfigAddress)}
                        onChange={() => onToggleL2(l2.systemConfigAddress)}
                        className="w-4 h-4 text-tokamak-blue border-gray-300 dark:border-gray-600 rounded focus:ring-tokamak-blue focus:ring-2 mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {l2.name}
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(l2.status)}`}>
                            {l2.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate mb-1">
                          {l2.systemConfigAddress}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {l2.rollupType}
                          </span>
                          {l2.isCandidate && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400">
                              Candidate
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택 정보 및 액션 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedL2s.length} / {availableL2s.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Showing: {totalFilteredCount}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onClearAll}
            disabled={selectedL2s.length === 0}
            className="flex-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
          <button
            onClick={() => onSelectAll()}
            disabled={selectedL2s.length === availableL2s.length}
            className="flex-1 text-sm text-tokamak-blue hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Select All
          </button>
        </div>
      </div>
    </div>
  );
}