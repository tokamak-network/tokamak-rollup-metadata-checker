// 서버(SSR)에서만 dotenv 적용
if (typeof window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
}

export interface AppConfig {
  timeout: number;
  retryCount: number;
  jsDelivrApiUrl: string;
  supportedNetworks: string[];
  checkInterval: number;
  outputFormat: 'json' | 'table' | 'csv';
  logLevel: 'debug' | 'info' | 'warn' | 'error';

}

export const config: AppConfig = {
  timeout: typeof window === 'undefined' ? parseInt(process.env.TIMEOUT || '10000') : 10000,
  retryCount: typeof window === 'undefined' ? parseInt(process.env.RETRY_COUNT || '3') : 3,
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
};

export const METADATA_GITHUB_URL_TEMPLATE = `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/tree/main/data/{network}`;

export const METADATA_RAW_URL_TEMPLATE = `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/{network}/{address}.json`;

export const L1_BYTECODE_RAW_URL_TEMPLATE =
  'https://github.com/tokamak-network/tokamak-thanos/blob/fix/extract-implementation-prdeploys/packages/tokamak/contracts-bedrock/bytecode/l1/{contractName}.json';

export const L2_BYTECODE_RAW_URL_TEMPLATE =
  'https://github.com/tokamak-network/tokamak-thanos/blob/fix/extract-implementation-prdeploys/packages/tokamak/contracts-bedrock/bytecode/l2/{contractName}.json';

export const L2_CONTRACT_NAMES = [
  "BaseFeeVault",
"BaseFeeVaultProxy",
"DeployerWhitelist",
"DeployerWhitelistProxy",
"EAS",
"EASProxy",
"ETH",
"FiatTokenV2_2",
"FiatTokenV2_2Proxy",
"GasPriceOracle",
"GasPriceOracleProxy",
"GovernanceToken",
"L1Block",
"L1BlockNumber",
"L1BlockNumberProxy",
"L1BlockProxy",
"L1FeeVault",
"L1FeeVaultProxy",
"L2CrossDomainMessenger",
"L2CrossDomainMessengerProxy",
"L2ERC721Bridge",
"L2ERC721BridgeProxy",
"L2StandardBridge",
"L2StandardBridgeProxy",
"L2ToL1MessagePasser",
"L2ToL1MessagePasserProxy",
"L2UsdcBridge",
"L2UsdcBridgeProxy",
"LegacyERC20NativeToken",
"LegacyMessagePasser",
"LegacyMessagePasserProxy",
"MasterMinter",
"NFTDescriptor",
"NonfungiblePositionManager",
"NonfungibleTokenPositionDescriptor",
"NonfungibleTokenPositionDescriptorProxy",
"OptimismMintableERC20Factory",
"OptimismMintableERC20FactoryProxy",
"OptimismMintableERC721Factory",
"OptimismMintableERC721FactoryProxy",
"ProxyAdmin",
"ProxyAdminProxy",
"QuoterV2",
"SchemaRegistry",
"SchemaRegistryProxy",
"SequencerFeeVault",
"SequencerFeeVaultProxy",
"SignatureChecker",
"SwapRouter02",
"TickLens",
"UniswapInterfaceMulticall",
"UniswapV3Factory",
"UniversalRouter",
"UnsupportedProtocol",
"WETH"
];

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

