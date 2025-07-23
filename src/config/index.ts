// 서버(SSR)에서만 dotenv 적용
if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

export interface AppConfig {
  timeout: number;
  retryCount: number;
  metadataRepoUrl: string;
  jsDelivrApiUrl: string;
  supportedNetworks: string[];
  checkInterval: number;
  outputFormat: 'json' | 'table' | 'csv';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  l2BytecodeRepoUrl: string; // L2 컨트랙트 바이트코드 저장소 URL
}

export const config: AppConfig = {
  timeout: typeof window === 'undefined' ? parseInt(process.env.TIMEOUT || '10000') : 10000,
  retryCount: typeof window === 'undefined' ? parseInt(process.env.RETRY_COUNT || '3') : 3,
  // GitHub 저장소에서 메타데이터 파일을 직접 다운로드하는 URL
  metadataRepoUrl: typeof window === 'undefined'
    ? process.env.METADATA_REPO_URL || 'https://cdn.jsdelivr.net/gh/tokamak-network/tokamak-rollup-metadata-repository@main'
    : 'https://cdn.jsdelivr.net/gh/tokamak-network/tokamak-rollup-metadata-repository@main',
  // jsDelivr API를 통해 파일 목록을 가져오는 URL (JSDELIVR_API_URL 환경변수로 설정 가능)
  jsDelivrApiUrl: typeof window === 'undefined'
    ? process.env.JSDELIVR_API_URL || 'https://data.jsdelivr.com/v1/package/gh/tokamak-network/tokamak-rollup-metadata-repository@main/flat'
    : 'https://data.jsdelivr.com/v1/package/gh/tokamak-network/tokamak-rollup-metadata-repository@main/flat',
  supportedNetworks: typeof window === 'undefined'
    ? (process.env.SUPPORTED_NETWORKS || 'mainnet,sepolia').split(',')
    : ['mainnet', 'sepolia'],
  checkInterval: typeof window === 'undefined' ? parseInt(process.env.CHECK_INTERVAL || '60000') : 60000,
  outputFormat: typeof window === 'undefined'
    ? (process.env.OUTPUT_FORMAT as 'json' | 'table' | 'csv') || 'table'
    : 'table',
  logLevel: typeof window === 'undefined'
    ? (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info'
    : 'info',
  l2BytecodeRepoUrl: typeof window === 'undefined'
    ? process.env.L2_BYTECODE_REPO_URL || 'https://github.com/tokamak-network/tokamak-thanos/tree/feat/util-extract-onchain-bytecode/packages/tokamak/contracts-bedrock/bytecode/l2'
    : 'https://github.com/tokamak-network/tokamak-thanos/tree/feat/util-extract-onchain-bytecode/packages/tokamak/contracts-bedrock/bytecode/l2',
};

export const L2_BYTECODE_RAW_URL_TEMPLATE =
  'https://raw.githubusercontent.com/tokamak-network/tokamak-thanos/refs/heads/feat/util-extract-onchain-bytecode/packages/tokamak/contracts-bedrock/bytecode/l2/{contractName}.json';

export const L2_CONTRACT_NAMES = [
  "BaseFeeVault",
  "CrossL2Inbox",
  "DeployerWhitelist",
  "EAS",
  "ETH",
  "FiatTokenV2_2",
  "GasPriceOracle",
  "GovernanceToken",
  "L1Block",
  "L1BlockNumber",
  "L1FeeVault",
  "L1MessageSender",
  "L2CrossDomainMessenger",
  "L2ERC721Bridge",
  "L2StandardBridge",
  "L2ToL1MessagePasser",
  "L2ToL2CrossDomainMessenger",
  "L2UsdcBridge",
  "LegacyERC20NativeToken",
  "LegacyMessagePasser",
  "MasterMinter",
  "NFTDescriptor",
  "NonfungiblePositionManager",
  "NonfungibleTokenPositionDescriptor",
  "OptimismMintableERC20Factory",
  "OptimismMintableERC721Factory",
  "ProxyAdmin",
  "QuoterV2",
  "SchemaRegistry",
  "SequencerFeeVault",
  "SignatureChecker",
  "SwapRouter02",
  "TickLens",
  "UniswapInterfaceMulticall",
  "UniswapV3Factory",
  "UniversalRouter",
  "UnsupportedProtocol",
  "WETH",
];

export const L1_BYTECODE_RAW_URL_TEMPLATE =
  'https://raw.githubusercontent.com/tokamak-network/tokamak-thanos/refs/heads/feat/util-extract-onchain-bytecode/packages/tokamak/contracts-bedrock/bytecode/l1/{contractName}.json';

export const L1_CONTRACT_NAMES = [
  "AddressManager",
  "AnchorStateRegistry",
  "AnchorStateRegistryProxy",
  "DelayedWETH",
  "DelayedWETHProxy",
  "DisputeGameFactory",
  "DisputeGameFactoryProxy",
  "L1CrossDomainMessenger",
  "L1CrossDomainMessengerProxy",
  "L1ERC721Bridge",
  "L1ERC721BridgeProxy",
  "L1StandardBridge",
  "L1StandardBridgeProxy",
  "L1UsdcBridge",
  "L1UsdcBridgeProxy",
  "L2OutputOracle",
  "L2OutputOracleProxy",
  "Mips",
  "OptimismMintableERC20Factory",
  "OptimismMintableERC20FactoryProxy",
  "OptimismPortal",
  "OptimismPortal2",
  "OptimismPortalProxy",
  "PermissionedDelayedWETHProxy",
  "PreimageOracle",
  "ProtocolVersions",
  "ProtocolVersionsProxy",
  "ProxyAdmin",
  "SafeProxyFactory",
  "SafeSingleton",
  "SuperchainConfig",
  "SuperchainConfigProxy",
  "SystemConfig",
  "SystemConfigProxy",
  "SystemOwnerSafe"
];


/**
 * 컨트랙트별 프록시 타입 매핑
 */
export const CONTRACT_PROXY_TYPE_MAP = {
  'SystemConfig': 'Proxy',
  'OptimismPortal': 'Proxy',
  'L1StandardBridge': 'L1ChugSplashProxy',
  'L1CrossDomainMessenger': 'ResolvedDelegateProxy',
  'OptimismMintableERC20FactoryProxy': 'Proxy',
  'L2OutputOracle': 'Proxy',
  'L1ERC721Bridge': 'Proxy',
  'L1UsdcBridge': 'L1UsdcBridgeProxy',
  'DisputeGameFactory': 'Proxy',
  'DisputeGame': 'Proxy',
  'DelayedWETH': 'Proxy',
  'PermissionedDelayedWETH': 'Proxy',
  'AnchorStateRegistry': 'Proxy',
  'L2CrossDomainMessenger': 'Proxy',
  'L2StandardBridge': 'Proxy',
  'L2ToL1MessagePasser': 'Proxy',
  'L2ToL1MessagePasserProxy': 'Proxy',
};

// L1 컨트랙트 호출이 필요한 경우 아래 설정들을 다시 추가
// export const RPC_ENDPOINTS = { ... }
// export const CHAIN_IDS = { ... }
// export const CONTRACT_ABIS = { ... }

export const MAINNET_RPC_URL = 'https://ethereum.publicnode.com';
export const SEPOLIA_RPC_URL = 'https://ethereum-sepolia.publicnode.com';
