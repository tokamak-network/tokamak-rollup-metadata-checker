import { l1BytecodeCache } from './l1-bytecode-cache';
import { ethers } from 'ethers';
import { CONTRACT_PROXY_TYPE_MAP } from '@/config/index';
import { getBytecodeByProxyType } from '@/utils/official-deployment';
import { getProxyImplementation, getProxyImplementationByProxyAdmin } from '@/utils/abi';
import { L1_CONTRACT_NAMES } from '@/config/index';
import { MAINNET_RPC_URL, SEPOLIA_RPC_URL } from '@/config/index';
import { isValidAddress } from '@/utils/validation';


export async function verifyL1ContractBytecodeWithCache({
  name,
  network,
  rpcUrl,
  address,
  proxyAdminAddress = null,
}: {
  name: string;
  network: string;
  rpcUrl: string|undefined;
  address: string;
  proxyAdminAddress?: string | null
}) {
  await l1BytecodeCache.initialize();

  if(!rpcUrl) {
    rpcUrl = network === 'mainnet' ? MAINNET_RPC_URL : SEPOLIA_RPC_URL;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const networkInfo = await provider.getNetwork();
  const actualChainId = Number(networkInfo.chainId);

  name = name.charAt(0).toUpperCase() + name.slice(1);

  if (name === 'L1CrossDomainMessenger' && ( proxyAdminAddress == null || !isValidAddress(proxyAdminAddress)) ) {
    // 프록시 어드민을 통해서 로직 주소를 조회해야 한다. 파리미터로 프록시 어드민 주소를 꼭 받아야만 가능하다.
    throw new Error('Missing proxy admin address');
  }

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
    // console.log('refImplBytecode', refImplBytecode);

    const match = refImplBytecode && onchainBytecode
                  ? onchainBytecode.toLowerCase() === refImplBytecode.toLowerCase()
                  : false;

    // console.log('match', match);

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
      let implementationAddress = null
      // 5.1 구현체 로직 주소 조회
      // L1CrossDomainMessenger 의 경우는 로직을 가져오는 방법을 다르게 가져와야 하는데.. addressManager로 가져와야 하는데.
      if (name === 'L1CrossDomainMessenger') {
        // 프록시 어드민에서 주소 조회
        implementationAddress = await getProxyImplementationByProxyAdmin(proxyAdminAddress!, address, rpcUrl);
      } else {
        implementationAddress = await getProxyImplementation(address, rpcUrl);
      }
      // console.log('implementationAddress', implementationAddress);

      // 5.2 구현체 바이트코드 조회
      const implementationBytecode = await provider.getCode(implementationAddress as string);
      // console.log('implementationBytecode', implementationBytecode);

      // 5.3 구현체 바이트코드 캐시 비교
      const refImplBytecode = l1BytecodeCache.getBytecode(name);
      // console.log('refImplBytecode', refImplBytecode);
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