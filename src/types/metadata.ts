export interface RollupMetadata {
  l1ChainId: number;
  l2ChainId: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  rollupType: 'optimistic' | 'zk' | 'sovereign';
  stack: Stack;
  rpcUrl: string;
  wsUrl?: string;
  nativeToken: NativeToken;
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated' | 'shutdown';
  createdAt: string;
  lastUpdated: string;
  shutdown?: Shutdown;
  l1Contracts: L1Contracts;
  l2Contracts: L2Contracts;
  bridges: Bridge[];
  explorers: Explorer[];
  supportResources?: SupportResources;
  sequencer: Sequencer;
  staking: Staking;
  networkConfig: NetworkConfig;
  withdrawalConfig?: WithdrawalConfig;
  metadata: Metadata;
}

export interface Stack {
  name: string;
  version: string;
  commit?: string;
  documentation?: string;
  zkProofSystem?: 'plonk' | 'stark' | 'groth16' | 'fflonk';
}

export interface NativeToken {
  type: 'eth' | 'erc20';
  symbol: string;
  name: string;
  decimals: number;
  l1Address: string;
  logoUrl?: string;
  coingeckoId?: string;
}

export interface Shutdown {
  reason: string;
  shutdownAt: string;
  finalWithdrawalDeadline: string;
}

export interface L1Contracts {
  SystemConfig: string;
  systemConfig?: string;
  L1StandardBridge?: string;
  OptimismPortal?: string;
  L2OutputOracle?: string;
  DisputeGameFactory?: string;
  L1CrossDomainMessenger?: string;
  L1ERC721Bridge?: string;
  AddressManager?: string;
  OptimismMintableERC20Factory?: string;
  OptimismMintableERC721Factory?: string;
  SuperchainConfig?: string;
  L1UsdcBridge?: string;
  L1Usdc?: string;
  ProxyAdmin?: string;
  AnchorStateRegistry?: string;
  DelayedWETH?: string;
  Mips?: string;
  PermissionedDelayedWETH?: string;
  PreimageOracle?: string;
  ProtocolVersions?: string;
  SafeProxyFactory?: string;
  SafeSingleton?: string;
  SystemOwnerSafe?: string;
}

export interface L2Contracts {
  NativeToken: string;
  WETH?: string;
  L2ToL1MessagePasser?: string;
  DeployerWhitelist?: string;
  L2CrossDomainMessenger?: string;
  GasPriceOracle?: string;
  L2StandardBridge?: string;
  SequencerFeeVault?: string;
  OptimismMintableERC20Factory?: string;
  L1BlockNumber?: string;
  L1Block?: string;
  GovernanceToken?: string;
  LegacyMessagePasser?: string;
  L2ERC721Bridge?: string;
  OptimismMintableERC721Factory?: string;
  ProxyAdmin?: string;
  BaseFeeVault?: string;
  L1FeeVault?: string;
  ETH?: string;
  L2UsdcBridge?: string;
  L2Usdc?: string;
  WrappedETH?: string;
  PolygonZkEVMBridge?: string;
  PolygonZkEVMGlobalExitRoot?: string;
  Multicall?: string;
  Create2Deployer?: string;
}

export interface Bridge {
  name: string;
  type: 'native' | 'canonical' | 'third-party';
  url: string;
  status: 'active' | 'inactive' | 'maintenance' | 'none';
  supportedTokens?: SupportedToken[];
}

export interface SupportedToken {
  symbol: string;
  l1Address: string;
  l2Address: string;
  decimals: number;
  isNativeToken: boolean;
  isWrappedETH: boolean;
  logoUrl?: string;
}

export interface Explorer {
  name: string;
  url: string;
  type: 'blockscout' | 'etherscan' | 'custom';
  status: 'active' | 'inactive' | 'maintenance' | 'none';
  apiUrl?: string;
}

export interface SupportResources {
  statusPageUrl?: string;
  supportContactUrl?: string;
  documentationUrl?: string;
  communityUrl?: string;
  helpCenterUrl?: string;
  announcementUrl?: string;
}

export interface Sequencer {
  address: string;
  batcherAddress?: string;
  proposerAddress?: string;
  aggregatorAddress?: string;
  trustedSequencer?: string;
}

export interface Staking {
  isCandidate: boolean;
  candidateRegisteredAt?: string;
  candidateStatus?: 'not_registered' | 'pending' | 'active' | 'suspended' | 'terminated';
  registrationTxHash?: string;
  candidateAddress?: string;
  rollupConfigAddress?: string;
  stakingServiceName?: string;
}

export interface NetworkConfig {
  blockTime: number;
  gasLimit: string;
  baseFeePerGas?: string;
  priorityFeePerGas?: string;
  batchSubmissionFrequency?: number;
  outputRootFrequency?: number;
  batchTimeout?: number;
  trustedAggregatorTimeout?: number;
  forceBatchTimeout?: number;
}

export interface WithdrawalConfig {
  challengePeriod: number;
  expectedWithdrawalDelay: number;
  monitoringInfo?: {
    l2OutputOracleAddress: string;
    outputProposedEventTopic: string;
  };
}

export interface Metadata {
  version: string;
  signature: string;
  signedBy: string;
}

export interface L2Status {
  l1ChainId: number;
  l2ChainId: number;
  name: string;
  systemConfigAddress: string;
  rollupType: 'optimistic' | 'zk' | 'sovereign';
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated' | 'shutdown';
  stakingStatus: 'candidate' | 'not_candidate' | 'unknown';
  isActive: boolean;
  latestL2Block: number;
  latestL1Block: number;
  rpcStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  errors: string[];
}

export interface CheckerConfig {
  timeout: number;
  retryCount: number;
  networks: string[];
}

export interface L2BasicInfo {
  name: string;
  systemConfigAddress: string;
  l1ChainId: number;
  l2ChainId: number;
  rollupType: 'optimistic' | 'zk' | 'sovereign';
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated' | 'shutdown';
  network: string;
  isCandidate: boolean;
}