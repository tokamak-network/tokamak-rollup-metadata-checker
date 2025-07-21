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
import { ContractVerificationCard } from './ui/ContractVerificationCard';
import { verifyProxyAndImplementation } from '@/utils/abi';

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
}

const L1_CONTRACTS: { name: string; key: keyof L1Contracts }[] = [
  { name: 'SystemConfig', key: 'systemConfig' },
  { name: 'OptimismPortal', key: 'optimismPortal' },
  { name: 'L1StandardBridge', key: 'l1StandardBridge' },
  { name: 'L2OutputOracle', key: 'l2OutputOracle' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function RollupDetailView({ metadata, status, actualStats, explorerStatuses, onRefresh, loading }: RollupDetailViewProps) {
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

        const fetchCandidateMemo = async () => {
    if (!metadata.staking.candidateAddress) return;

    setMemoLoading(true);
    try {
      // ethers를 사용하여 컨트랙트의 memo() 함수 호출
      const url = `/api/contract-call?address=${metadata.staking.candidateAddress}&chainId=${metadata.l1ChainId}&function=memo&contractType=candidate-add-on`
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
      const response = await fetch(`/api/contract-call?address=${metadata.staking.candidateAddress}&chainId=${metadata.l1ChainId}&function=operator&contractType=candidate-add-on`);

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
      const response = await fetch(`/api/contract-call?address=${operatorAddress}&chainId=${metadata.l1ChainId}&function=manager&contractType=operator-manager`);

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
      if (!metadata.l1Contracts.systemConfig || !metadata.sequencer?.address) return;
      setSequencerLoading(true);
      try {
        const url = `/api/contract-call?address=${metadata.l1Contracts.systemConfig}&chainId=${metadata.l1ChainId}&function=unsafeBlockSigner&contractType=system-config`;
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
  }, [metadata.l1Contracts.systemConfig, metadata.l1ChainId, metadata.sequencer?.address]);

  const isSequencerMatch = onchainSequencer && metadata.sequencer.address
    ? onchainSequencer.toLowerCase() === metadata.sequencer.address.toLowerCase()
    : null;

  const verifyL1Contracts = async () => {
    setVerificationLoading(true);
    try {
      const results: any[] = [];
      const network = metadata.l1ChainId === 1 ? 'mainnet' : 'sepolia';
      const rpcUrl = metadata.l1ChainId === 1
        ? process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com'
        : process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo';

      for (const contract of L1_CONTRACTS) {
        const address = metadata.l1Contracts[contract.key] as string | undefined;
        if (!address) continue;
        try {
          const result = await verifyProxyAndImplementation(contract.name, network, rpcUrl, address);
          results.push(result);
        } catch (err) {
          results.push({ contractName: contract.name, error: err instanceof Error ? err.message : String(err) });
        }
      }
      setVerificationResults(results);
    } catch (error) {
      setVerificationResults([]);
    } finally {
      setVerificationLoading(false);
    }
  };

  useEffect(() => {
    if (metadata.l1Contracts) {
      verifyL1Contracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.l1Contracts]);

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
                return activeInMetadata.length > 0 ? 'Available' : 'Unavailable';
              })()} />
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Bridge</p>
            <div className="flex items-center space-x-2 mt-1">
              <StatusDisplay status={(() => {
                const activeCount = metadata.bridges?.filter(b => b.status === 'active').length || 0;
                return activeCount > 0 ? 'Available' : 'Unavailable';
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
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">L2 Block Time</span><div className="text-sm font-medium text-gray-900 dark:text-white"><span>⚙️ {metadata.networkConfig.blockTime}s</span>{actualStats && (actualStats.actualBlockTime && actualStats.actualBlockTime > 0 ? (<span className="ml-3">| 🔄 <span className="text-green-600 dark:text-green-400">{actualStats.actualBlockTime}s</span> (actual)</span>) : (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ RPC failed</span>))}</div></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">L2 Gas Limit</span><div className="text-sm font-medium text-gray-900 dark:text-white"><span>⚙️ {parseInt(metadata.networkConfig.gasLimit).toLocaleString()} gas</span>{actualStats && (actualStats.actualGasLimit && actualStats.actualGasLimit > 0 ? (<span className="ml-3">| ⛽ <span className="text-blue-600 dark:text-blue-400">{actualStats.actualGasLimit.toLocaleString()} gas</span> (actual)</span>) : (<span className="ml-3 text-red-400 dark:text-red-500">| ❌ RPC failed</span>))}</div></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Last Proposal</span><div className="text-right">{status.lastProposalTime > 0 ? (<span className="text-sm font-medium text-gray-900 dark:text-white">{formatTimestamp(status.lastProposalTime)}</span>) : (<div><span className="text-sm text-red-500 dark:text-red-400">Failed to fetch</span>{status.proposalError && (<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{status.proposalError}</div>)}</div>)}</div></div>
              <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-gray-400">Last Batch</span><div className="text-right">{status.lastBatchTime > 0 ? (<span className="text-sm font-medium text-gray-900 dark:text-white">{formatTimestamp(status.lastBatchTime)}</span>) : (<div><span className="text-sm text-red-500 dark:text-red-400">Failed to fetch</span>{status.batchError && (<div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{status.batchError}</div>)}</div>)}</div></div>
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
              url: `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/${metadata.l1ChainId === 1 ? 'mainnet' : 'sepolia'}/${metadata.l1Contracts.systemConfig.toLowerCase()}.json`,
              tooltip: "View metadata file in repository"
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
                    address={metadata.l2Contracts.nativeToken}
                    label=""
                    explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.nativeToken)}
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

        {/* Contract Verification */}
        <div className="mt-8">
          <ContractVerificationCard
            results={verificationResults}
            loading={verificationLoading}
            onRefresh={verifyL1Contracts}
          />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* L1 Contracts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">L1 Contracts</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">System Config</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {metadata.l1Contracts.systemConfig.slice(0, 6)}...{metadata.l1Contracts.systemConfig.slice(-4)}
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(metadata.l1Contracts.systemConfig)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Copy System Config Address"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <Link
                        href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.systemConfig)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View System Config on Etherscan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                  {metadata.l1Contracts.optimismPortal && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Portal</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismPortal.slice(0, 6)}...{metadata.l1Contracts.optimismPortal.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismPortal && navigator.clipboard.writeText(metadata.l1Contracts.optimismPortal)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Portal Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismPortal)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Portal on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1StandardBridge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 Standard Bridge</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1StandardBridge.slice(0, 6)}...{metadata.l1Contracts.l1StandardBridge.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1StandardBridge && navigator.clipboard.writeText(metadata.l1Contracts.l1StandardBridge)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 Standard Bridge Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1StandardBridge)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 Standard Bridge on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l2OutputOracle && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L2 Output Oracle</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l2OutputOracle.slice(0, 6)}...{metadata.l1Contracts.l2OutputOracle.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l2OutputOracle && navigator.clipboard.writeText(metadata.l1Contracts.l2OutputOracle)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L2 Output Oracle Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l2OutputOracle)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L2 Output Oracle on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.disputeGameFactory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Dispute Game Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.disputeGameFactory.slice(0, 6)}...{metadata.l1Contracts.disputeGameFactory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.disputeGameFactory && navigator.clipboard.writeText(metadata.l1Contracts.disputeGameFactory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Dispute Game Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.disputeGameFactory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Dispute Game Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1CrossDomainMessenger && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 Cross Domain Messenger</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1CrossDomainMessenger.slice(0, 6)}...{metadata.l1Contracts.l1CrossDomainMessenger.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1CrossDomainMessenger && navigator.clipboard.writeText(metadata.l1Contracts.l1CrossDomainMessenger)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 Cross Domain Messenger Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1CrossDomainMessenger)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 Cross Domain Messenger on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.l1ERC721Bridge && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">L1 ERC721 Bridge</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.l1ERC721Bridge.slice(0, 6)}...{metadata.l1Contracts.l1ERC721Bridge.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.l1ERC721Bridge && navigator.clipboard.writeText(metadata.l1Contracts.l1ERC721Bridge)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy L1 ERC721 Bridge Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1ERC721Bridge)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View L1 ERC721 Bridge on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.addressManager && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Address Manager</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.addressManager.slice(0, 6)}...{metadata.l1Contracts.addressManager.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.addressManager && navigator.clipboard.writeText(metadata.l1Contracts.addressManager)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Address Manager Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.addressManager)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Address Manager on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.optimismMintableERC20Factory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Mintable ERC20 Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismMintableERC20Factory.slice(0, 6)}...{metadata.l1Contracts.optimismMintableERC20Factory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismMintableERC20Factory && navigator.clipboard.writeText(metadata.l1Contracts.optimismMintableERC20Factory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Mintable ERC20 Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismMintableERC20Factory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Mintable ERC20 Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.optimismMintableERC721Factory && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Optimism Mintable ERC721 Factory</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {metadata.l1Contracts.optimismMintableERC721Factory.slice(0, 6)}...{metadata.l1Contracts.optimismMintableERC721Factory.slice(-4)}
                        </span>
                        <button
                          onClick={() => metadata.l1Contracts.optimismMintableERC721Factory && navigator.clipboard.writeText(metadata.l1Contracts.optimismMintableERC721Factory)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title="Copy Optimism Mintable ERC721 Factory Address"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <Link
                          href={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.optimismMintableERC721Factory)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tokamak-blue hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Optimism Mintable ERC721 Factory on Etherscan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )}
                  {metadata.l1Contracts.superchainConfig && (
                    <AddressDisplay
                      address={metadata.l1Contracts.superchainConfig}
                      label="Superchain Config"
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.superchainConfig)}
                      copyTooltip="Copy Superchain Config Address"
                      linkTooltip="View Superchain Config on Etherscan"
                    />
                  )}
                  {metadata.l1Contracts.l1UsdcBridge && (
                    <AddressDisplay
                      address={metadata.l1Contracts.l1UsdcBridge}
                      label="L1 USDC Bridge"
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1UsdcBridge)}
                      copyTooltip="Copy L1 USDC Bridge Address"
                      linkTooltip="View L1 USDC Bridge on Etherscan"
                    />
                  )}
                  {metadata.l1Contracts.l1Usdc && (
                    <AddressDisplay
                      address={metadata.l1Contracts.l1Usdc}
                      label="L1 USDC"
                      explorerUrl={getEtherscanAddressUrl(metadata.l1ChainId, metadata.l1Contracts.l1Usdc)}
                      copyTooltip="Copy L1 USDC Address"
                      linkTooltip="View L1 USDC on Etherscan"
                    />
                  )}
                </div>
              </div>

              {/* L2 Contracts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">L2 Contracts</h4>
                <div className="space-y-2">
                  <AddressDisplay
                    address={metadata.l2Contracts.nativeToken}
                    label="Native Token"
                    explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.nativeToken)}
                    copyTooltip="Copy Native Token Address"
                    linkTooltip="View Native Token on L2 Explorer"
                  />
                  {metadata.l2Contracts.l2StandardBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2StandardBridge}
                      label="L2 Standard Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2StandardBridge)}
                      copyTooltip="Copy L2 Standard Bridge Address"
                      linkTooltip="View L2 Standard Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2CrossDomainMessenger && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2CrossDomainMessenger}
                      label="L2 Cross Domain Messenger"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2CrossDomainMessenger)}
                      copyTooltip="Copy L2 Cross Domain Messenger Address"
                      linkTooltip="View L2 Cross Domain Messenger on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l1Block && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l1Block}
                      label="L1 Block"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l1Block)}
                      copyTooltip="Copy L1 Block Address"
                      linkTooltip="View L1 Block on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2ToL1MessagePasser && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2ToL1MessagePasser}
                      label="L2 To L1 Message Passer"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2ToL1MessagePasser)}
                      copyTooltip="Copy L2 To L1 Message Passer Address"
                      linkTooltip="View L2 To L1 Message Passer on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.gasPriceOracle && (
                    <AddressDisplay
                      address={metadata.l2Contracts.gasPriceOracle}
                      label="Gas Price Oracle"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.gasPriceOracle)}
                      copyTooltip="Copy Gas Price Oracle Address"
                      linkTooltip="View Gas Price Oracle on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2ERC721Bridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2ERC721Bridge}
                      label="L2 ERC721 Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2ERC721Bridge)}
                      copyTooltip="Copy L2 ERC721 Bridge Address"
                      linkTooltip="View L2 ERC721 Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l1FeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l1FeeVault}
                      label="L1 Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l1FeeVault)}
                      copyTooltip="Copy L1 Fee Vault Address"
                      linkTooltip="View L1 Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.sequencerFeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.sequencerFeeVault}
                      label="Sequencer Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.sequencerFeeVault)}
                      copyTooltip="Copy Sequencer Fee Vault Address"
                      linkTooltip="View Sequencer Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.baseFeeVault && (
                    <AddressDisplay
                      address={metadata.l2Contracts.baseFeeVault}
                      label="Base Fee Vault"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.baseFeeVault)}
                      copyTooltip="Copy Base Fee Vault Address"
                      linkTooltip="View Base Fee Vault on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2UsdcBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2UsdcBridge}
                      label="L2 USDC Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2UsdcBridge)}
                      copyTooltip="Copy L2 USDC Bridge Address"
                      linkTooltip="View L2 USDC Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.l2Usdc && (
                    <AddressDisplay
                      address={metadata.l2Contracts.l2Usdc}
                      label="L2 USDC"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.l2Usdc)}
                      copyTooltip="Copy L2 USDC Address"
                      linkTooltip="View L2 USDC on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.wrappedETH && (
                    <AddressDisplay
                      address={metadata.l2Contracts.wrappedETH}
                      label="Wrapped ETH"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.wrappedETH)}
                      copyTooltip="Copy Wrapped ETH Address"
                      linkTooltip="View Wrapped ETH on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.polygonZkEVMBridge && (
                    <AddressDisplay
                      address={metadata.l2Contracts.polygonZkEVMBridge}
                      label="Polygon zkEVM Bridge"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.polygonZkEVMBridge)}
                      copyTooltip="Copy Polygon zkEVM Bridge Address"
                      linkTooltip="View Polygon zkEVM Bridge on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.polygonZkEVMGlobalExitRoot && (
                    <AddressDisplay
                      address={metadata.l2Contracts.polygonZkEVMGlobalExitRoot}
                      label="Polygon zkEVM Global Exit Root"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.polygonZkEVMGlobalExitRoot)}
                      copyTooltip="Copy Polygon zkEVM Global Exit Root Address"
                      linkTooltip="View Polygon zkEVM Global Exit Root on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.multicall && (
                    <AddressDisplay
                      address={metadata.l2Contracts.multicall}
                      label="Multicall"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.multicall)}
                      copyTooltip="Copy Multicall Address"
                      linkTooltip="View Multicall on L2 Explorer"
                    />
                  )}
                  {metadata.l2Contracts.create2Deployer && (
                    <AddressDisplay
                      address={metadata.l2Contracts.create2Deployer}
                      label="Create2 Deployer"
                      explorerUrl={getL2ExplorerAddressUrlFromExplorers(metadata.explorers, metadata.l2Contracts.create2Deployer)}
                      copyTooltip="Copy Create2 Deployer Address"
                      linkTooltip="View Create2 Deployer on L2 Explorer"
                    />
                  )}
                </div>
              </div>
            </div>
          </Card>

      </div>
    </div>
  );
}