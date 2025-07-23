import { l1BytecodeCache } from './l1-bytecode-cache';
import { ethers } from 'ethers';
import { CONTRACT_PROXY_TYPE_MAP } from '@/config/index';
import { getBytecodeByProxyType } from '@/utils/official-deployment';
import { getProxyImplementation } from '@/utils/abi';
import { L1_CONTRACT_NAMES } from '@/config/index';
import { MAINNET_RPC_URL, SEPOLIA_RPC_URL } from '@/config/index';


export async function verifyL1ContractBytecodeWithCache({
  name,
  network,
  rpcUrl,
  address
}: {
  name: string;
  network: string;
  rpcUrl: string|undefined;
  address: string;
}) {
  await l1BytecodeCache.initialize();

  if(!rpcUrl) {
    rpcUrl = network === 'mainnet' ? MAINNET_RPC_URL : SEPOLIA_RPC_URL;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const networkInfo = await provider.getNetwork();
  const actualChainId = Number(networkInfo.chainId);

  name = name.charAt(0).toUpperCase() + name.slice(1);

  // 1. 받은 name 의 이름 뒤에 Proxy 라는 단어를 붙인것이 L1 컨트랙 목록에 있으면 그것이 프록시 컨트랙 이름임
  const proxyName = name + 'Proxy';

  // 프록시 이름이 L1 컨트랙 목록에 있는지 확인
  const isProxy = L1_CONTRACT_NAMES.includes(proxyName);
  // console.log('isProxy', isProxy);

  if(!isProxy) {
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }

    const refImplBytecode = l1BytecodeCache.getBytecode(name);
    const match = refImplBytecode && onchainBytecode
                  ? onchainBytecode.toLowerCase() === refImplBytecode.toLowerCase()
                  : false;
    return {
      contract: name,
      isProxy,
      match,
      chainId: actualChainId
    }
  } else {
     // 2. 프록시 이름으로 L1 컨트랙 바이트 조회, 첫문자는 대문자
    const proxyBytecode = l1BytecodeCache.getBytecode(proxyName);
    // console.log('proxyBytecode', proxyBytecode);

    // 3. 입력받은 주소의 바이트코드 조회
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }

    // 4. 프록시 바이트코드 비교
    const isProxyMatch = onchainBytecode && proxyBytecode
    ? onchainBytecode.toLowerCase() === proxyBytecode.toLowerCase()
    : false;

    // console.log('isProxyMatch:', isProxyMatch);
    let isImplementationMatch = false;
    // 5. 프록시 바이트코드 비교 결과에 따라 구현체 바이트코드 비교
    if (isProxyMatch) {

      // 5.1 구현체 로직 주소 조회
      // L1CrossDomainMessenger 의 경우는 로직을 가져오는 방법을 다르게 가져와야 하는데.. addressManager로 가져와야 하는데.

      const implementationAddress = await getProxyImplementation(address, rpcUrl);
      // console.log('implementationAddress', implementationAddress);

      // 5.2 구현체 바이트코드 조회
      const implementationBytecode = await provider.getCode(implementationAddress as string);
      // console.log('implementationBytecode', implementationBytecode);

      // 5.3 구현체 바이트코드 캐시 비교
      const refImplBytecode = l1BytecodeCache.getBytecode(name);
      isImplementationMatch = refImplBytecode && implementationBytecode
      ? implementationBytecode.toLowerCase() === refImplBytecode.toLowerCase()
      : false;

      // console.log('isImplementationMatch', isImplementationMatch);
    }

    const match = isProxyMatch && isImplementationMatch;

    // console.log('matched', isProxyMatch);
    return {
      contract: name,
      isProxy,
      match,
      isProxyMatch,
      isImplementationMatch,
      chainId: actualChainId,
    };
  }
}