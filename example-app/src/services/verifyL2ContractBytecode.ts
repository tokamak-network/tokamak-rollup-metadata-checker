import { l2BytecodeCache } from './l2-bytecode-cache';
import { ethers } from 'ethers';
import { CONTRACT_PROXY_TYPE_MAP } from '@/config/index';
import { getBytecodeByProxyType } from '@/utils/official-deployment';
import { getProxyImplementation } from '@/utils/abi';
import { L1_FEE_VAULT_ABI } from '@/utils/abi/l1-fee-vault';
import { getRpcUrl } from '@/utils/rpc';

export async function verifyL2ContractBytecode({
  name,
  address,
  rpcUrl,
  l2ChainId,
}: {
  name: string;
  address: string;
  rpcUrl: string;
  l2ChainId: number;
}) {
  await l2BytecodeCache.initialize();
  // console.log('name', name);

  if(name === 'wrappedETH' || name === 'WrappedETH' || name === 'WNativeToken' ) {
    name = 'WETH';
  }

  if (name === 'NativeToken' || name === 'nativeToken' ) {
    name = 'LegacyERC20NativeToken';
  }

  let isProxy = true;
  const proxyType = "Proxy"

  // 1. L2 contracts use proxy pattern except WETH (WNativeToken) and GovernanceToken
  if (name === 'WETH' || name === 'GovernanceToken' || name === 'LegacyERC20NativeToken' || name === 'ETH' ) {
    isProxy = false;
  }

  // console.log('proxyType', proxyType);
  // console.log('isProxy', isProxy);

  // Always get chainId from RPC
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();
  const actualChainId = Number(network.chainId);
  const chainIdMatch = actualChainId === Number(l2ChainId);
  const chainIdSource = chainIdMatch ? 'param' : 'rpc';
  const usedChainId = chainIdMatch ? l2ChainId : actualChainId;

  if (!isProxy) {
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }

    const refImplBytecode = l2BytecodeCache.getBytecode(name);
    const match = refImplBytecode && onchainBytecode
                  ? onchainBytecode.toLowerCase() === refImplBytecode.toLowerCase()
                  : false;
    return {
      contract: name,
      isProxy,
      match,
      chainId: usedChainId,
      l2ChainIdParam: l2ChainId,
      l2ChainIdRpc: actualChainId,
      chainIdSource,
    }
  } else {

    // 2. 프록시의 바이트 조회
    const proxyBytecode = await getBytecodeByProxyType(proxyType);
    // console.log('proxyBytecode', name, proxyBytecode);

    // 3. 입력받은 주소의 바이트코드 조회
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }
    // console.log('Proxy onchainBytecode', name, onchainBytecode);

    // 4. 프록시 바이트코드 비교
    const isProxyMatch = onchainBytecode && proxyBytecode
    ? onchainBytecode.toLowerCase() === proxyBytecode.toLowerCase()
    : false;

    // console.log('isProxyMatch:', isProxyMatch);
    let isImplementationMatch = false;
    // 5. 프록시 바이트코드 비교 결과에 따라 구현체 바이트코드 비교
    if (isProxyMatch) {
      // console.log('address: ', address);
      // 5.1 구현체 로직 주소 조회
      const implementationAddress = await getProxyImplementation(address, rpcUrl);
      // console.log('implementationAddress', name, implementationAddress);

      // 5.2 구현체 바이트코드 조회
      const implementationBytecode = await provider.getCode(implementationAddress as string);
      // console.log('implementationBytecode', name, implementationBytecode);

      // 5.3 구현체 바이트코드 캐시 비교
      const refImplBytecode = l2BytecodeCache.getBytecode(name);
      // console.log('refImplBytecode', name, refImplBytecode);

      if (name === 'L1FeeVault') {
        isImplementationMatch = await compareL1FeeVaultBytecode({
          onchainBytes: implementationBytecode,
          gitBytes: refImplBytecode as string
        });

      } else if (name === 'SequencerFeeVault') {
        isImplementationMatch = await compareSequencerFeeVaultBytecode({
          onchainBytes: implementationBytecode,
          gitBytes: refImplBytecode as string
        });

      } else if (name === 'BaseFeeVault') {
        isImplementationMatch = await compareBaseFeeVaultBytecode({
          onchainBytes: implementationBytecode,
          gitBytes: refImplBytecode as string
        });
      } else {
        isImplementationMatch = refImplBytecode && implementationBytecode
        ? implementationBytecode.toLowerCase() === refImplBytecode.toLowerCase()
        : false;
      }

      console.log('isImplementationMatch', isImplementationMatch);
    }

    const match = isProxyMatch && isImplementationMatch;

    // console.log('matched', match);
    return {
      contract: name,
      isProxy,
      match,
      isProxyMatch,
      isImplementationMatch,
      chainId: usedChainId,
      l2ChainIdParam: l2ChainId,
      l2ChainIdRpc: actualChainId,
      chainIdSource,
    };
  }
}


// 재사용 가능한 기본 바이트코드 비교 함수
async function compareBytecodeWithAddressPositions({
  onchainBytes,
  gitBytes,
  expectedLength,
  addressPositions
}: {
  onchainBytes: string;
  gitBytes: string;
  expectedLength: number;
  addressPositions: Array<{ start: number; end: number }>;
}) {
  // 1. Length check
  if (onchainBytes.length !== expectedLength || gitBytes.length !== expectedLength) {
    return false;
  }

  // 2. Check if all address positions in onchainBytes have the same value
  const onchainAddresses = addressPositions.map(pos =>
    onchainBytes.substring(pos.start, pos.end + 1)
  );
  const firstOnchainAddress = onchainAddresses[0];
  for (const address of onchainAddresses) {
    if (address !== firstOnchainAddress) {
      return false; // onchainBytes의 주소들이 모두 같지 않음
    }
  }

  // 3. Check if all address positions in gitBytes have the same value
  const gitAddresses = addressPositions.map(pos =>
    gitBytes.substring(pos.start, pos.end + 1)
  );
  const firstGitAddress = gitAddresses[0];
  for (const address of gitAddresses) {
    if (address !== firstGitAddress) {
      return false; // gitBytes의 주소들이 모두 같지 않음
    }
  }

  // 4. Make sure everything except the address location is the same
  let lastEnd = 0;
  for (const pos of addressPositions) {
    // 주소 위치 이전 부분 비교
    const beforeAddress = onchainBytes.substring(lastEnd, pos.start);
    const beforeAddressGit = gitBytes.substring(lastEnd, pos.start);

    if (beforeAddress !== beforeAddressGit) {
      return false;
    }

    lastEnd = pos.end + 1;
  }

  // Compare the part after the last address
  const afterLastAddress = onchainBytes.substring(lastEnd);
  const afterLastAddressGit = gitBytes.substring(lastEnd);

  if (afterLastAddress !== afterLastAddressGit) {
    return false;
  }

  return true;
}

export async function compareL1FeeVaultBytecode({
  onchainBytes,
  gitBytes
}: {
  onchainBytes: string;
  gitBytes: string;
}) {
  const addressPositions = [
    { start: 296, end: 335 },   // 위치 296-335
    { start: 1482, end: 1521 }, // 위치 1482-1521
    { start: 1768, end: 1807 }, // 위치 1768-1807
    { start: 2068, end: 2107 }, // 위치 2068-2107
    { start: 2786, end: 2825 }  // 위치 2786-2825
  ];

  return compareBytecodeWithAddressPositions({
    onchainBytes,
    gitBytes,
    expectedLength: 3912,
    addressPositions
  });
}

export async function compareSequencerFeeVaultBytecode({
  onchainBytes,
  gitBytes
}: {
  onchainBytes: string;
  gitBytes: string;
}) {
  const addressPositions = [
    { start: 318, end: 357 },   // 위치 318-357
    { start: 1024, end: 1063 }, // 위치 1024-1063
    { start: 1606, end: 1645 }, // 위치 1606-1645
    { start: 1892, end: 1931 }, // 위치 1892-1931
    { start: 2192, end: 2231 }, // 위치 2192-2231
    { start: 2910, end: 2949 }  // 위치 2910-2949
  ];

  return compareBytecodeWithAddressPositions({
    onchainBytes,
    gitBytes,
    expectedLength: 4036,
    addressPositions
  });
}

export async function compareBaseFeeVaultBytecode({
  onchainBytes,
  gitBytes
}: {
  onchainBytes: string;
  gitBytes: string;
}) {
  const addressPositions = [
    { start: 296, end: 335 },   // 위치 296-335
    { start: 1482, end: 1521 }, // 위치 1482-1521
    { start: 1768, end: 1807 }, // 위치 1768-1807
    { start: 2068, end: 2107 }, // 위치 2068-2107
    { start: 2786, end: 2825 }  // 위치 2786-2825
  ];

  return compareBytecodeWithAddressPositions({
    onchainBytes,
    gitBytes,
    expectedLength: 3912,
    addressPositions
  });
}

