import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RollupMetadata, L2Status, L1Contracts } from '@/types/metadata';
import { BlockLink } from './BlockLink';
import { getEtherscanAddressUrl, getL2ExplorerAddressUrlFromExplorers, getNetworkName } from '@/utils/etherscan';
import { ExplorerStatus } from '@/utils/explorer-checker';
import { getStatusColor, getStatusIndicator } from '@/utils/ui';
import { AddressDisplay } from './ui/AddressDisplay';
import { UrlDisplay } from './ui/UrlDisplay';
import { ExternalLinkIcon, RefreshIcon } from './ui/Icons';
import { StatusBadge } from './ui/StatusBadge';
import { StatusDisplay } from './ui/StatusDisplay';
import { Card } from './ui/Card';
import { ServiceList } from './ui/ServiceList';
import { InfoCard } from './ui/InfoCard';
import { ContractAddressGrid } from './ui/ContractAddressGrid';
// import { verifyL1ContractBytecode } from '@/utils/abi';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface RollupDetailViewProps {
  metadata: RollupMetadata;
  status: L2Status;
  actualStats?: {
    actualBlockTime: number;
    actualGasLimit: number;
  };
  explorerStatuses?: ExplorerStatus[];
  onRefresh?: () => void;
  loading?: boolean;
  contractTimestamps?: {
    lastProposalTime: number;
    lastBatchTime: number;
  };
}

// If you need to support lowerCamelCase keys for legacy data, use bracket notation with type assertion as shown above for real-time fallback.

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function RollupDetailView({ metadata, status, actualStats: initialActualStats, explorerStatuses, onRefresh, loading, contractTimestamps }: RollupDetailViewProps) {
  const [candidateMemo, setCandidateMemo] = useState<string>('');
  const [memoLoading, setMemoLoading] = useState(false);
  const [operatorAddress, setOperatorAddress] = useState<string>('');
  const [operatorLoading, setOperatorLoading] = useState(false);
  const [managerAddress, setManagerAddress] = useState<string>('');
  const [managerLoading, setManagerLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [onchainSequencer, setOnchainSequencer] = useState<string | null>(null);
  const [sequencerLoading, setSequencerLoading] = useState(false);
  const [actualStats, setActualStats] = useState<{ actualBlockTime: number; actualGasLimit: number } | undefined>(initialActualStats);
  const [actualStatsLoading, setActualStatsLoading] = useState(false);
  const [actualStatsError, setActualStatsError] = useState<string | null>(null);
  const [l2VerifyResults, setL2VerifyResults] = useState<{ [name: string]: { result: any; loading: boolean; error: string | null } }>({});
  const [l1VerifyResults, setL1VerifyResults] = useState<{ [name: string]: { result: any; loading: boolean; error: string | null } }>({});

        const fetchCandidateMemo = async () => {
    if (!metadata.staking.candidateAddress) return;

    setMemoLoading(true);
    try {
      // ethers를 사용하여 컨트랙트의 memo() 함수 호출
      const url = `/api/contract-call?address=${metadata.staking.candidateAddress}&chainId=${metadata.l1ChainId}&function=memo()&contractType=candidate-add-on`
      console.log(url)

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          setCandidateMemo(data.result);
        } else if (data.error) {
          setCandidateMemo('No memo function found');
        } else {
          setCandidateMemo('No memo found');
        }
      } else {
        setCandidateMemo('Failed to fetch memo');
      }
    } catch (error) {
      console.error('Error fetching candidate memo:', error);
      setCandidateMemo('Error loading memo');
    } finally {
      setMemoLoading(false);
    }
  };

  const fetchOperatorAddress = async () => {
    if (!metadata.staking.candidateAddress) return;

    setOperatorLoading(true);
    try {
      const response = await fetch(`/api/contract-call?address=${metadata.staking.candidateAddress}&chainId=${metadata.l1ChainId}&function=operator()&contractType=candidate-add-on`);

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result !== '0x0000000000000000000000000000000000000000') {
          setOperatorAddress(data.result);
        } else {
          setOperatorAddress('No operator found');
        }
      } else {
        setOperatorAddress('Failed to fetch operator');
      }
    } catch (error) {
      console.error('Error fetching operator:', error);
      setOperatorAddress('Error loading operator');
    } finally {
      setOperatorLoading(false);
    }
  };

  const fetchManagerAddress = async () => {
    if (!operatorAddress || operatorAddress === 'No operator found' || operatorAddress === 'Failed to fetch operator' || operatorAddress === 'Error loading operator') return;

    setManagerLoading(true);
    try {
      const response = await fetch(`/api/contract-call?address=${operatorAddress}&chainId=${metadata.l1ChainId}&function=manager()&contractType=operator-manager`);

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result !== '0x0000000000000000000000000000000000000000') {
          setManagerAddress(data.result);
        } else {
          setManagerAddress('No manager found');
        }
      } else {
        setManagerAddress('Failed to fetch manager');
      }
    } catch (error) {
      console.error('Error fetching manager:', error);
      setManagerAddress('Error loading manager');
    } finally {
      setManagerLoading(false);
    }
  };

  useEffect(() => {
    if (metadata.staking.candidateAddress) {
      fetchCandidateMemo();
      fetchOperatorAddress();
    }
  }, [metadata.staking.candidateAddress, metadata.l1ChainId]);

  useEffect(() => {
    if (operatorAddress && operatorAddress !== 'No operator found' && operatorAddress !== 'Failed to fetch operator' && operatorAddress !== 'Error loading operator') {
      fetchManagerAddress();
    }
  }, [operatorAddress, metadata.l1ChainId]);

  useEffect(() => {
    async function fetchOnchainSequencer() {
      if (!metadata.l1Contracts.SystemConfig || !metadata.sequencer?.address) return;
      setSequencerLoading(true);
      try {
        const url = `/api/contract-call?address=${metadata.l1Contracts.SystemConfig}&chainId=${metadata.l1ChainId}&function=unsafeBlockSigner()&contractType=system-config`;
        const res = await fetch(url);
        const data = await res.json();
        setOnchainSequencer(data.result);
      } catch (e) {
        setOnchainSequencer(null);
      } finally {
        setSequencerLoading(false);
      }
    }
    fetchOnchainSequencer();
  }, [metadata.l1Contracts.SystemConfig, metadata.l1ChainId, metadata.sequencer?.address]);

  useEffect(() => {
    async function fetchActualStats() {
      if (!metadata.rpcUrl) return;
      setActualStatsLoading(true);
      setActualStatsError(null);
      try {
        const res = await fetch('/api/rpc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rpcUrl: metadata.rpcUrl })
        });
        const data = await res.json();
        if (data.success) {
          setActualStats({
            actualBlockTime: data.blockTime,
            actualGasLimit: parseInt(data.gasLimit)
          });
        } else {
          setActualStatsError(data.error || 'Failed to fetch actual stats');
        }
      } catch (e) {
        setActualStatsError(e instanceof Error ? e.message : String(e));
      } finally {
        setActualStatsLoading(false);
      }
    }
    fetchActualStats();
  }, [metadata.rpcUrl]);

  useEffect(() => {
    let cancelled = false;
    async function verifyAllL2Contracts() {
      const entries = Object.entries(metadata.l2Contracts).filter(([_, address]) => !!address);
      for (const [name, address] of entries) {
        if (cancelled) break;
        setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: true, error: null } }));
        try {
          // Capitalize first letter of contract name
          const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
          const res = await fetch('/api/l2-contract-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: capitalized, address, l2ChainId: metadata.l2ChainId, rpcUrl: metadata.rpcUrl, chainId: metadata.l2ChainId }),
          });
          const data = await res.json();
          if (data.error) {
            setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: data.error } }));
          } else {
            setL2VerifyResults(prev => ({ ...prev, [name]: { result: data, loading: false, error: null } }));
          }
        } catch (e) {
          setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: e instanceof Error ? e.message : String(e) } }));
        }
      }
    }
    verifyAllL2Contracts();
    return () => { cancelled = true; };
  }, [metadata.l2Contracts, metadata.l2ChainId, metadata.rpcUrl]);

  useEffect(() => {
    let cancelled = false;
    async function verifyAllL1Contracts() {
      // setVerificationLoading(true);
      // setL1VerifyResults({});

      const entries = Object.entries(metadata.l1Contracts).filter(([_, address]) => !!address);

      for (const [name, address] of entries) {
        if (cancelled) break;
        setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: true, error: null } }));
        try {
          // Capitalize first letter of contract name
          const capitalized = name.charAt(0).toUpperCase() + name.slice(1);

          const params = {
            name: capitalized,
            address,
            chainId: metadata.l1ChainId,
            proxyAdminAddress: metadata.l1Contracts.ProxyAdmin
          }

          const res = await fetch('/api/l1-contract-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          });
          const data = await res.json();
          console.log('l1-contract-verification', params, data)
          if (data.error) {
            setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: data.error } }));
          } else {
            setL1VerifyResults(prev => ({ ...prev, [name]: { result: data, loading: false, error: null } }));
          }
        } catch (e) {
          setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: e instanceof Error ? e.message : String(e) } }));
        }
      }
    }
    verifyAllL1Contracts();
    return () => { cancelled = true; };
  }, [metadata.l1Contracts, metadata.l1ChainId]);

  // l1VerifyResults 상태 변화 추적용 useEffect 추가
  useEffect(() => {
    console.log('l1VerifyResults 상태 변경', l1VerifyResults);
  }, [l1VerifyResults]);

  const isSequencerMatch = onchainSequencer && metadata.sequencer.address
    ? onchainSequencer.toLowerCase() === metadata.sequencer.address.toLowerCase()
    : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Add handler for single L1 contract verification
  const handleL1Verify = async (name: string, address: string) => {
    setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: true, error: null } }));
    try {
      const network = metadata.l1ChainId === 1 ? 'mainnet' : 'sepolia';
      const rpcUrl = metadata.l1ChainId === 1
        ? process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
        : process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';
      const res = await fetch('/api/l1-contract-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contracts: [{ name, address }],
          network,
          rpcUrl,
        }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.results) && data.results[0]) {
        const r = data.results[0];
        if (r.error) {
          setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: r.error } }));
        } else {
          setL1VerifyResults(prev => ({ ...prev, [name]: { result: r, loading: false, error: null } }));
        }
      }
    } catch (e) {
      setL1VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: e instanceof Error ? e.message : String(e) } }));
    }
  };

  // Add handler for single L2 contract verification
  const handleL2Verify = async (name: string, address: string) => {
    setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: true, error: null } }));
    try {
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      const res = await fetch('/api/l2-contract-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: capitalized, address, l2ChainId: metadata.l2ChainId, rpcUrl: metadata.rpcUrl, chainId: metadata.l2ChainId }),
      });
      const data = await res.json();
      if (data.error) {
        setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: data.error } }));
      } else {
        setL2VerifyResults(prev => ({ ...prev, [name]: { result: data, loading: false, error: null } }));
      }
    } catch (e) {
      setL2VerifyResults(prev => ({ ...prev, [name]: { result: null, loading: false, error: e instanceof Error ? e.message : String(e) } }));
    }
  };

  const safeContractTimestamps = contractTimestamps || { lastProposalTime: 0, lastBatchTime: 0 };

  // Example for SystemConfig usage:
  const systemConfigAddress = metadata.l1Contracts.SystemConfig || (metadata.l1Contracts as any).systemConfig;
  if (!systemConfigAddress) {
    console.error("[RollupDetailView] SystemConfig address is missing in metadata:", metadata);
    return <div className="text-red-500">SystemConfig address is missing in metadata. Please check the metadata source.</div>;
  }


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
        {/* 맨 위 상태 정보 4열 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">L2 RPC</p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusDisplay status={status.rpcStatus} />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Block Explorers</p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusDisplay status={(() => {
                if (!metadata.explorers?.length) return 'Unavailable';
                const activeInMetadata = metadata.explorers.filter(e => e.status === 'active');
                return activeInMetadata.length > 0 ? 'Active' : 'Unavailable';
              })()} />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridge</p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusDisplay status={(() => {
                const activeCount = metadata.bridges?.filter(b => b.status === 'active').length || 0;
                return activeCount > 0 ? 'Active' : 'Unavailable';
              })()} />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Staking</p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusDisplay status={status.stakingStatus} />
            </div>
          </Card>
        </div>

        {/* 2열: Network Information / Network Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InfoCard
            title="Network Information"
            items={[
              { label: "Rollup Type", value: <span className="capitalize">{metadata.rollupType}</span> },
              { label: "Stack", value: `${metadata.stack.name} v${metadata.stack.version}` },
              { label: "L1 Chain ID", value: metadata.l1ChainId },
              { label: "L2 Chain ID", value: metadata.l2ChainId },
              { label: "L2 RPC URL", value: <UrlDisplay url={metadata.rpcUrl} label="" copyTooltip="Copy RPC URL" linkTooltip="Open RPC URL" /> },
              ...(metadata.wsUrl ? [{ label: "L2 WebSocket URL", value: <UrlDisplay url={metadata.wsUrl} label="" copyTooltip="Copy WebSocket URL" linkTooltip="Open WebSocket URL" /> }] : [])
            ]}
          />
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Latest L2 Block</span><span className="text-sm font-medium text-gray-900 dark:text-white">{status.latestL2Block.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Latest L1 Block</span><BlockLink chainId={metadata.l1ChainId} blockNumber={status.latestL1Block} /></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">L2 Block Time</span><div className="text-sm font-medium text-gray-900 dark:text-white"><span>⚙️ {metadata.networkConfig.blockTime}s</span>{actualStatsLoading ? (<span className="ml-3 text-gray-400">| Loading...</span>) : actualStatsError ? (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ {actualStatsError}</span>) : actualStats && (actualStats.actualBlockTime && actualStats.actualBlockTime > 0 ? (<span className="ml-3">| 🔄 <span className="text-green-600 dark:text-green-400">{actualStats.actualBlockTime}s</span> (actual)</span>) : (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ RPC failed</span>))}</div></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">L2 Gas Limit</span><div className="text-sm font-medium text-gray-900 dark:text-white"><span>⚙️ {parseInt(metadata.networkConfig.gasLimit).toLocaleString()} gas</span>{actualStatsLoading ? (<span className="ml-3 text-gray-400">| Loading...</span>) : actualStatsError ? (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ {actualStatsError}</span>) : actualStats && (actualStats.actualGasLimit && actualStats.actualGasLimit > 0 ? (<span className="ml-3">| ⛽ <span className="text-blue-600 dark:text-blue-400">{actualStats.actualGasLimit.toLocaleString()} gas</span> (actual)</span>) : (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ RPC failed</span>))}</div></div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">Last Proposal</span>
                <div className="text-right">{safeContractTimestamps.lastProposalTime > 0 ? (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTimestamp(safeContractTimestamps.lastProposalTime)}</span>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Not yet supported</span>
                )}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">Last Batch</span>
                <div className="text-right">{safeContractTimestamps.lastBatchTime > 0 ? (
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{formatTimestamp(safeContractTimestamps.lastBatchTime)}</span>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Not yet supported</span>
                )}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <div><b>Last Proposal:</b> The timestamp of the most recent L2 → L1 state root submission.<br/>This feature is not yet supported. Will be available in a future update.</div>
              <div><b>Last Batch:</b> The timestamp of the most recent L2 → L1 transaction batch submission.<br/>This feature is not yet supported. Will be available in a future update.</div>
            </div>
          </Card>
        </div>

        {/* 2열: Block Explorers / Bridges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ServiceList
            title="Block Explorers"
            services={metadata.explorers || []}
            emptyMessage="No block explorers available"
          />
          <ServiceList
            title="Bridges"
            services={metadata.bridges || []}
            emptyMessage="No bridges available"
          />
        </div>

        {/* 2열: Metadata / Sequencer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <InfoCard
            title="Metadata"
            items={[
              { label: "Created At", value: formatTimestamp(new Date(metadata.createdAt).getTime()) },
              { label: "Last Updated", value: formatTimestamp(new Date(metadata.lastUpdated).getTime()) }
            ]}
            headerLink={{
              url: systemConfigAddress
                ? `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/${metadata.l1ChainId === 1 ? 'mainnet' : 'sepolia'}/${systemConfigAddress.toLowerCase()}.json`
                : '#',
              tooltip: systemConfigAddress
                ? "View metadata file in repository"
                : "SystemConfig address not available"
            }}
          />
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sequencer Information</h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">
                    Sequencer Address
                    {sequencerLoading && <span className="ml-2 text-gray-400">...</span>}
                    {isSequencerMatch === true && <span className="ml-2 text-green-600">✅</span>}
                    {isSequencerMatch === false && <span className="ml-2 text-red-600">❌</span>}
                  </span>
                  <AddressDisplay
                    address={metadata.sequencer?.address || '-'}
                    label=""
                    explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer?.address || '')}
                    copyTooltip="Copy Sequencer Address"
                    linkTooltip="View on Etherscan"
                  />
                </div>
                {metadata.sequencer?.batcherAddress && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Batcher Address</span>
                    <AddressDisplay
                      address={metadata.sequencer.batcherAddress}
                      label=""
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.batcherAddress)}
                      copyTooltip="Copy Batcher Address"
                      linkTooltip="View on Etherscan"
                    />
                  </div>
                )}
                {metadata.sequencer?.proposerAddress && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Proposer Address</span>
                    <AddressDisplay
                      address={metadata.sequencer.proposerAddress}
                      label=""
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.proposerAddress)}
                      copyTooltip="Copy Proposer Address"
                      linkTooltip="View on Etherscan"
                    />
                  </div>
                )}
                {metadata.sequencer?.aggregatorAddress && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aggregator Address</span>
                    <AddressDisplay
                      address={metadata.sequencer.aggregatorAddress}
                      label=""
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.aggregatorAddress)}
                      copyTooltip="Copy Aggregator Address"
                      linkTooltip="View on Etherscan"
                    />
                  </div>
                )}
                {metadata.sequencer?.trustedSequencer && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Trusted Sequencer</span>
                    <AddressDisplay
                      address={metadata.sequencer.trustedSequencer}
                      label=""
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.sequencer.trustedSequencer)}
                      copyTooltip="Copy Trusted Sequencer Address"
                      linkTooltip="View on Etherscan"
                    />
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* 2열: Native Token / Staking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Native Token</h3>
            <div className="space-y-3">
              <InfoRow label="Symbol" value={<span className="font-mono">{metadata.nativeToken.symbol}</span>} />
              <InfoRow label="Name" value={metadata.nativeToken.name} />
              <InfoRow label="Decimals" value={metadata.nativeToken.decimals} />
              <InfoRow
                label="L1 Address"
                value={
                  <AddressDisplay
                    address={metadata.nativeToken.l1Address}
                    label=""
                    explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.nativeToken.l1Address)}
                    copyTooltip="Copy L1 Address"
                    linkTooltip="View on Etherscan"
                  />
                }
              />
              <InfoRow
                label="L2 Address"
                value={
                  <AddressDisplay
                    address={metadata.l2Contracts.NativeToken}
                    label=""
                    explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.NativeToken)}
                    copyTooltip="Copy L2 Address"
                    linkTooltip="View on L2 Explorer"
                  />
                }
              />
              {metadata.nativeToken.logoUrl && (
                <InfoRow
                  label="Icon"
                  value={<img src={metadata.nativeToken.logoUrl} alt="Token Icon" className="w-6 h-6 rounded-full" />}
                />
              )}
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Staking Information</h3>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Is Candidate</span>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      metadata.staking.isCandidate
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {metadata.staking.isCandidate ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>

                {metadata.staking.candidateStatus && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Candidate Status</span>
                    <span className={`text-sm font-medium capitalize ${
                      metadata.staking.candidateStatus === 'active' ? 'text-green-600 dark:text-green-400' :
                      metadata.staking.candidateStatus === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                      metadata.staking.candidateStatus === 'suspended' || metadata.staking.candidateStatus === 'terminated' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {metadata.staking.candidateStatus.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {metadata.staking.candidateRegisteredAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Registered At</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatTimestamp(new Date(metadata.staking.candidateRegisteredAt).getTime())}
                    </span>
                  </div>
                )}

                {metadata.staking.candidateAddress && (
                  <>
                    <AddressDisplay
                      address={metadata.staking.candidateAddress}
                      label="Candidate Address"
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.staking.candidateAddress)}
                      copyTooltip="Copy Candidate Address"
                      linkTooltip="View on Etherscan"
                    />
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Candidate Memo</span>
                      <div className="text-right max-w-xs">
                        {memoLoading ? (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                        ) : candidateMemo ? (
                          <span className="text-sm font-medium text-gray-900 dark:text-white break-words">
                            {candidateMemo}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No memo available</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        OperatorManager Contract
                        <span className="ml-2 text-yellow-500" title="시뇨리지 받는 컨트랙트">💰</span>
                      </span>
                      <div className="text-right">
                        {operatorLoading ? (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                        ) : operatorAddress && operatorAddress !== 'No operator found' && operatorAddress !== 'Failed to fetch operator' && operatorAddress !== 'Error loading operator' ? (
                          <AddressDisplay
                            address={operatorAddress}
                            label=""
                            explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, operatorAddress)}
                            copyTooltip="Copy Operator Address"
                            linkTooltip="View Operator on Etherscan"
                          />
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">{operatorAddress || 'No operator available'}</span>
                        )}
                      </div>
                    </div>
                    {operatorAddress && operatorAddress !== 'No operator found' && operatorAddress !== 'Failed to fetch operator' && operatorAddress !== 'Error loading operator' && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Manager of OperatorManager</span>
                        <div className="text-right">
                          {managerLoading ? (
                            <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                          ) : managerAddress && managerAddress !== 'No manager found' && managerAddress !== 'Failed to fetch manager' && managerAddress !== 'Error loading manager' ? (
                            <AddressDisplay
                              address={managerAddress}
                              label=""
                              explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, managerAddress)}
                              copyTooltip="Copy Manager Address"
                              linkTooltip="View Manager on Etherscan"
                            />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{managerAddress || 'No manager available'}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {metadata.staking.rollupConfigAddress && (
                  <AddressDisplay
                    address={metadata.staking.rollupConfigAddress}
                    label="Rollup Config Address"
                    explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.staking.rollupConfigAddress)}
                    copyTooltip="Copy Rollup Config Address"
                    linkTooltip="View on Etherscan"
                  />
                )}

                {metadata.staking.registrationTxHash && (
                  <AddressDisplay
                    address={metadata.staking.registrationTxHash}
                    label="Registration Tx Hash"
                    explorerUrl={`${metadata.l1ChainId === 1 ? 'https://etherscan.io' : 'https://sepolia.etherscan.io'}/tx/${metadata.staking.registrationTxHash}`}
                    copyTooltip="Copy Transaction Hash"
                    linkTooltip="View on Etherscan"
                  />
                )}

                {metadata.staking.stakingServiceName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Staking Service</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {metadata.staking.stakingServiceName}
                    </span>
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* Contract Addresses */}
        <Card
          padding="custom"
          paddingX="md"
          paddingY="md"
          hover={true}
          className="mt-8"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contract Addresses
            </h3>
            {/* L1 Contracts Card */}
            <Card className="mb-8">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">L1 Contracts</h4>
              <div>
                <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verification</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {Object.entries(metadata.l1Contracts).map(([key, value]) => {

                      //1. name 의 첫글자를 대문자로 수정
                      const name = key.charAt(0).toUpperCase() + key.slice(1)
                      const address = value
                      const verify = l1VerifyResults[name] || { result: null, loading: verificationLoading, error: null };

                      return (
                        <tr key={name}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{name}</td>
                          <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                            {verify.loading && <LoadingSpinner size="sm" />}
                            {/* Verified 표시 조건 보완: 단일 객체 또는 results 배열 모두 지원 */}
                            {verify.result && !verify.loading && (
                              (verify.result.match === true ||
                                (Array.isArray(verify.result.results) && verify.result.results[0]?.match === true)) && (
                                <span className="text-xs font-bold text-green-600 dark:text-green-400">Verified</span>
                              )
                            )}
                            {verify.result && !verify.loading && (
                              (verify.result.match === false ||
                                (Array.isArray(verify.result.results) && verify.result.results[0]?.match === false)) && (
                                <span className="text-xs font-bold text-red-600 dark:text-red-400">Not Match</span>
                              )
                            )}
                            {verify.error && <span className="text-xs text-red-500 truncate">{verify.error}</span>}
                            <button
                              className="ml-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Retry verification"
                              onClick={() => {
                                console.log('리플래쉬 버튼 클릭', name, address);
                                handleL1Verify(name, address);
                              }}
                              disabled={verify.loading}
                              aria-label={`Retry verification for ${name}`}
                            >
                              <RefreshIcon className={verify.loading ? 'animate-spin' : ''} />
                            </button>

                          </td>
                          <td className="px-4 py-2 truncate max-w-[180px]">
                            <AddressDisplay
                              address={address}
                              label=""
                              explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, address)}
                              copyTooltip={`Copy ${name} Address`}
                              linkTooltip={`View ${name} on Etherscan`}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
            {/* L2 Contracts Card */}
            <Card>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">L2 Contracts</h4>
              <div>
                <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Verification</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {Object.entries(metadata.l2Contracts).map(([key, address]) => (
                      address ? (
                        <tr key={key}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{key}</td>
                          <td className="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                            {l2VerifyResults[key]?.loading && <LoadingSpinner size="sm" />}
                            {l2VerifyResults[key]?.result && l2VerifyResults[key]?.result.match && !l2VerifyResults[key]?.loading && (
                              <span className="text-xs font-bold text-green-600 dark:text-green-400">Verified</span>
                            )}
                            {l2VerifyResults[key]?.result && !l2VerifyResults[key]?.result.match && !l2VerifyResults[key]?.loading && (
                              <span className="text-xs font-bold text-red-600 dark:text-red-400">Not Match</span>
                            )}
                            {l2VerifyResults[key]?.error && <span className="text-xs text-red-500 truncate">{l2VerifyResults[key]?.error}</span>}
                            <button
                              className="ml-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              title="Retry verification"
                              onClick={() => handleL2Verify(key, address)}
                              disabled={l2VerifyResults[key]?.loading}
                              aria-label={`Retry verification for ${key}`}
                            >
                              <RefreshIcon className={l2VerifyResults[key]?.loading ? 'animate-spin' : ''} />
                            </button>
                          </td>
                          <td className="px-4 py-2 truncate max-w-[180px]">
                            <AddressDisplay
                              address={address}
                              label=""
                              explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, address)}
                              copyTooltip={`Copy ${key} Address`}
                              linkTooltip={`View ${key} on L2 Explorer`}
                            />
                          </td>
                        </tr>
                      ) : null
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Card>

      </div>
    </div>
  );
}

function L2ContractVerificationRow({ name, address, l2ChainId, rpcUrl, result, loading, error }: {
  name: string;
  address: string;
  l2ChainId: number;
  rpcUrl: string;
  result: null | { match: boolean; isProxy?: boolean; isProxyMatch?: boolean; isImplementationMatch?: boolean; error?: string };
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col w-full py-1">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{name}</span>
          {result && result.match && (
            <span className="text-xs font-bold text-green-600 dark:text-green-400 whitespace-nowrap">Verified</span>
          )}
        </div>
        <div className="flex items-center space-x-2 min-w-0">
          <AddressDisplay
            address={address}
            label=""
            explorerUrl={getL2ExplorerAddressUrlFromExplorers([], address)}
            copyTooltip={`Copy ${name} Address`}
            linkTooltip={`View ${name} on L2 Explorer`}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2 mt-1 min-h-[1.5rem]">
        {loading && <LoadingSpinner size="sm" />}
        {result && !result.match && !loading && (
          <span className="text-xs font-bold text-red-600 dark:text-red-400">Not Match</span>
        )}
        {error && <span className="text-xs text-red-500 truncate">{error}</span>}
      </div>
    </div>
  );
}