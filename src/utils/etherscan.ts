/**
 * Etherscan URL utility functions
 */

interface NetworkConfig {
  name: string;
  baseUrl: string;
}

const NETWORK_CONFIGS: Record<number, NetworkConfig> = {
  1: {
    name: 'Ethereum Mainnet',
    baseUrl: 'https://etherscan.io'
  },
  11155111: {
    name: 'Sepolia',
    baseUrl: 'https://sepolia.etherscan.io'
  },
  5: {
    name: 'Goerli Testnet',
    baseUrl: 'https://goerli.etherscan.io'
  },
  17000: {
    name: 'Holesky Testnet',
    baseUrl: 'https://holesky.etherscan.io'
  }
};

/**
 * Get Etherscan block URL for a given chain ID and block number
 */
export function getEtherscanBlockUrl(chainId: number, blockNumber: number): string {
  const config = NETWORK_CONFIGS[chainId];

  if (!config) {
    // Fallback to mainnet Etherscan for unknown networks
    return `https://etherscan.io/block/${blockNumber}`;
  }

  return `${config.baseUrl}/block/${blockNumber}`;
}

/**
 * Get Etherscan transaction URL for a given chain ID and transaction hash
 */
export function getEtherscanTxUrl(chainId: number, txHash: string): string {
  const config = NETWORK_CONFIGS[chainId];

  if (!config) {
    return `https://etherscan.io/tx/${txHash}`;
  }

  return `${config.baseUrl}/tx/${txHash}`;
}

/**
 * Get Etherscan address URL for a given chain ID and address
 */
export function getEtherscanAddressUrl(chainId: number, address: string): string {
  const config = NETWORK_CONFIGS[chainId];

  if (!config) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${config.baseUrl}/address/${address}`;
}

/**
 * Get network name for a given chain ID
 */
export function getNetworkName(chainId: number): string {
  return NETWORK_CONFIGS[chainId]?.name || `Chain ${chainId}`;
}

/**
 * Check if a chain ID has Etherscan support
 */
export function hasEtherscanSupport(chainId: number): boolean {
  return chainId in NETWORK_CONFIGS;
}

/**
 * Get L2 explorer address URL for a given explorer URL and address
 */
export function getL2ExplorerAddressUrl(explorerUrl: string, address: string): string {
  // Remove trailing slash if present
  const baseUrl = explorerUrl.replace(/\/$/, '');
  return `${baseUrl}/address/${address}`;
}

/**
 * Get L2 explorer address URL from explorers array
 */
export function getL2ExplorerAddressUrlFromExplorers(explorers: Array<{status: string, url: string}>, address: string): string | null {
  const activeExplorer = explorers.find(e => e.status === 'active');

  if (!activeExplorer) {
    return null;
  }

  return getL2ExplorerAddressUrl(activeExplorer.url, address);
}