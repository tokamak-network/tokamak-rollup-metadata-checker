/**
 * RPC utility functions for fetching blockchain data
 */

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any[];
  id: number;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id: number;
}

const RPC_TIMEOUT = 10000; // 10초 타임아웃

/**
 * Check if RPC URL is valid and should be attempted
 */
export function isValidRpcUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // 유효하지 않은 도메인들 체크
    const invalidDomains = [
      'example.com',
      'example-l2.com',
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      'test.com',
      'dummy.com',
      'placeholder.com',
      'rpc.example',
      'rpc.test',
      'rpc.dummy',
      'rpc.placeholder'
    ];

    // 더 엄격한 검증: 실제 RPC 서비스 도메인인지 확인
    const validRpcDomains = [
      'publicnode.com',
      'ankr.com',
      'llamarpc.com',
      'alchemy.com',
      'infura.io',
      'quicknode.com',
      'rpc.ankr.com',
      'eth.llamarpc.com',
      'ethereum.publicnode.com',
      'ethereum-sepolia.publicnode.com',
      'rpc.sepolia.org',
      'rpc2.sepolia.org',
      'sepolia.gateway.tenderly.co'
    ];

    // 유효하지 않은 도메인이 포함되어 있으면 false
    if (invalidDomains.some(domain => hostname.includes(domain))) {
      console.log('invalidDomains', invalidDomains);
      return false;
    }

    // 유효한 RPC 도메인이 포함되어 있으면 true
    // if (validRpcDomains.some(domain => hostname.includes(domain))) {
    //   console.log('validRpcDomains', validRpcDomains);
    //   return true;
    // }

    // 그 외의 경우는 더 보수적으로 처리 (개발/테스트 환경일 가능성)
    // return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Generic JSON-RPC call function
 */
export async function makeRpcCall(url: string, method: string, params: any[] = []): Promise<any> {
  // RPC URL 유효성 검사
  if (!isValidRpcUrl(url)) {
    throw new Error(`Invalid or placeholder RPC URL: ${url}`);
  }

  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    method,
    params,
    id: Date.now()
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RPC_TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: JsonRpcResponse = await response.json();

    if (data.error) {
      throw new Error(`RPC Error ${data.error.code}: ${data.error.message}`);
    }

    return data.result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`RPC call timed out after ${RPC_TIMEOUT}ms`);
    }
    throw error;
  }
}

/**
 * Get the latest block number from a blockchain RPC endpoint
 */
export async function getLatestBlockNumber(rpcUrl: string): Promise<number> {
  // RPC URL 유효성 검사
  if (!isValidRpcUrl(rpcUrl)) {
    console.warn(`Skipping invalid RPC URL: ${rpcUrl}`);
    throw new Error(`Invalid or placeholder RPC URL: ${rpcUrl}`);
  }

  try {
    const result = await makeRpcCall(rpcUrl, 'eth_blockNumber');

    // Convert hex string to number
    const blockNumber = parseInt(result, 16);

    if (isNaN(blockNumber)) {
      throw new Error('Invalid block number received from RPC');
    }

    return blockNumber;
  } catch (error) {
    console.error(`Failed to fetch latest block from ${rpcUrl}:`, error);
    throw error;
  }
}

/**
 * Get a safe (finalized) block number that's guaranteed to exist on Etherscan
 */
export async function getSafeBlockNumber(rpcUrl: string): Promise<number> {
  // RPC URL 유효성 검사
  if (!isValidRpcUrl(rpcUrl)) {
    console.warn(`Skipping invalid RPC URL: ${rpcUrl}`);
    throw new Error(`Invalid or placeholder RPC URL: ${rpcUrl}`);
  }

  try {
    // Try to get finalized block first
    try {
      const finalizedResult = await makeRpcCall(rpcUrl, 'eth_getBlockByNumber', ['finalized', false]);
      if (finalizedResult && finalizedResult.number) {
        const finalizedBlock = parseInt(finalizedResult.number, 16);
        if (!isNaN(finalizedBlock)) {
          console.log(`🔒 Using finalized block: ${finalizedBlock}`);
          return finalizedBlock;
        }
      }
    } catch (error) {
      console.warn('Finalized block not supported, falling back to latest with safety margin');
    }

    // Fallback: get latest block and subtract safety margin
    const latestBlock = await getLatestBlockNumber(rpcUrl);
    const safeBlock = latestBlock - 2; // 2 block safety margin
    console.log(`🛡️ Using safe block: ${safeBlock} (latest: ${latestBlock}, margin: 2)`);
    return Math.max(safeBlock, 0);
  } catch (error) {
    console.error(`Failed to fetch safe block from ${rpcUrl}:`, error);
    throw error;
  }
}

/**
 * Get RPC URL based on chain ID
 */
export function getRpcUrl(chainId: number | string): string {
  const chainIdNum = typeof chainId === 'string' ? parseInt(chainId) : chainId;

  if (chainIdNum === 11155111) {
    // Sepolia testnet
    return process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  } else {
    // Mainnet (default)
    return process.env.MAINNET_RPC_URL || 'https://ethereum.publicnode.com';
  }
}

/**
 * Get L1 latest block number based on chain ID
 */
export async function getL1LatestBlock(l1ChainId: number = 1): Promise<number> {
  let L1_RPC_URLS: string[];

  if (l1ChainId === 11155111) {
    // Sepolia testnet
    L1_RPC_URLS = [
      process.env.SEPOLIA_RPC_URL,
      'https://ethereum-sepolia-rpc.publicnode.com',
      'https://rpc.sepolia.org',
      'https://rpc2.sepolia.org',
      'https://sepolia.gateway.tenderly.co'
    ].filter(Boolean) as string[];
  } else {
    // Mainnet (default)
    L1_RPC_URLS = [
      process.env.MAINNET_RPC_URL,
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://eth.llamarpc.com'
    ].filter(Boolean) as string[];
  }

  console.log(`🌐 Attempting to fetch L1 block for chain ${l1ChainId} with ${L1_RPC_URLS.length} RPC URLs:`, L1_RPC_URLS);

  for (const rpcUrl of L1_RPC_URLS) {
    try {
      console.log(`🔗 Trying L1 RPC: ${rpcUrl}`);
      const blockNumber = await getSafeBlockNumber(rpcUrl);
      console.log(`✅ L1 safe block fetched successfully: ${blockNumber}`);
      return blockNumber;
    } catch (error) {
      console.warn(`❌ L1 RPC failed for ${rpcUrl} (Chain ID: ${l1ChainId}):`, error);
      continue;
    }
  }

  console.error(`❌ All L1 RPC endpoints failed for chain ID: ${l1ChainId}`);
  throw new Error(`All L1 RPC endpoints failed for chain ID: ${l1ChainId}`);
}

/**
 * Get L2 latest block number with fallback
 */
export async function getL2LatestBlock(primaryRpcUrl: string): Promise<number> {
  try {
    return await getLatestBlockNumber(primaryRpcUrl);
  } catch (error) {
    console.warn(`Primary L2 RPC failed for ${primaryRpcUrl}:`, error);
    throw error;
  }
}

/**
 * Batch fetch both L1 and L2 latest blocks (L1 uses safe/finalized blocks)
 */
export async function getLatestBlocks(l2RpcUrl: string, l1ChainId: number = 1): Promise<{
  l1Block: number;
  l2Block: number;
}> {
  try {
    // L1과 L2를 병렬로 조회 (L1은 안전한 블록 사용)
    const [l1Block, l2Block] = await Promise.allSettled([
      getL1LatestBlock(l1ChainId), // Already uses getSafeBlockNumber
      getL2LatestBlock(l2RpcUrl)
    ]);

    return {
      l1Block: l1Block.status === 'fulfilled' ? l1Block.value : 0,
      l2Block: l2Block.status === 'fulfilled' ? l2Block.value : 0
    };
  } catch (error) {
    console.error('Failed to fetch latest blocks:', error);
    return {
      l1Block: 0,
      l2Block: 0
    };
  }
}

/**
 * Get actual block time by calculating average interval between consecutive blocks from recent blocks
 * Returns the average time interval in seconds between consecutive L2 blocks
 */
export async function getActualBlockTime(rpcUrl: string): Promise<number> {
  // RPC URL 유효성 검사
  if (!isValidRpcUrl(rpcUrl)) {
    console.warn(`Skipping invalid RPC URL for block time calculation: ${rpcUrl}`);
    return 0;
  }

  try {
    const latestBlockNumber = await getLatestBlockNumber(rpcUrl);
    // console.log('latestBlockNumber', latestBlockNumber);
    const blockCount = 10; // 최근 10개 블록으로 평균 계산

    const blockPromises = [];
    for (let i = 0; i < blockCount; i++) {
      const blockNumber = `0x${(latestBlockNumber - i).toString(16)}`;
      blockPromises.push(makeRpcCall(rpcUrl, 'eth_getBlockByNumber', [blockNumber, false]));
    }
    // console.log('blockPromises', blockPromises);
    const blocks = await Promise.all(blockPromises);
    // console.log('blocks', blocks);

    // 블록 시간 차이 계산
    const timeDiffs = [];
    for (let i = 0; i < blocks.length - 1; i++) {
      const currentTime = parseInt(blocks[i].timestamp, 16);
      const previousTime = parseInt(blocks[i + 1].timestamp, 16);
      timeDiffs.push(currentTime - previousTime);
    }
    // console.log('timeDiffs', timeDiffs);

    // 평균 계산 (초 단위)
    const avgBlockTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
    const result = Math.round(avgBlockTime * 10) / 10; // 소수점 1자리

    // console.log(`🔍 Block Time Calculation - timeDiffs: ${JSON.stringify(timeDiffs)}, avgBlockTime: ${avgBlockTime}, result: ${result}`);

    return result;

  } catch (error) {
    console.error(`Failed to calculate actual block time for ${rpcUrl}:`, error);
    return 0;
  }
}

/**
 * Get actual gas limit from latest block
 */
export async function getActualGasLimit(rpcUrl: string): Promise<number> {
  // RPC URL 유효성 검사
  if (!isValidRpcUrl(rpcUrl)) {
    console.warn(`Skipping invalid RPC URL for gas limit calculation: ${rpcUrl}`);
    return 0;
  }

  try {
    const latestBlock = await makeRpcCall(rpcUrl, 'eth_getBlockByNumber', ['latest', false]);
    const gasLimit = parseInt(latestBlock.gasLimit, 16);
    return gasLimit;
  } catch (error) {
    console.error(`Failed to get actual gas limit for ${rpcUrl}:`, error);
    return 0;
  }
}

/**
 * Get both configured and actual network stats
 */
export async function getNetworkStats(l2RpcUrl: string, l1ChainId: number = 1): Promise<{
  blocks: { l1Block: number; l2Block: number };
  actualBlockTime: number;
  actualGasLimit: number;
}> {
  try {
    // 병렬로 모든 데이터 조회
    const [blocks, actualBlockTime, actualGasLimit] = await Promise.allSettled([
      getLatestBlocks(l2RpcUrl, l1ChainId),
      getActualBlockTime(l2RpcUrl),
      getActualGasLimit(l2RpcUrl)
    ]);

    return {
      blocks: blocks.status === 'fulfilled' ? blocks.value : { l1Block: 0, l2Block: 0 },
      actualBlockTime: actualBlockTime.status === 'fulfilled' ? actualBlockTime.value : 0,
      actualGasLimit: actualGasLimit.status === 'fulfilled' ? actualGasLimit.value : 0
    };
  } catch (error) {
    console.error('Failed to fetch network stats:', error);
    return {
      blocks: { l1Block: 0, l2Block: 0 },
      actualBlockTime: 0,
      actualGasLimit: 0
    };
  }
}