import { l2BytecodeCache } from './l2-bytecode-cache';
import { ethers } from 'ethers';
import { CONTRACT_PROXY_TYPE_MAP } from '@/config/index';
import { getBytecodeByProxyType } from '@/utils/official-deployment';
import { getProxyImplementation } from '@/utils/abi';

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
    // console.log('proxyBytecode', proxyBytecode);

    // 3. 입력받은 주소의 바이트코드 조회
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }
    // console.log('onchainBytecode', onchainBytecode);

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
      // console.log('implementationAddress', implementationAddress);

      // 5.2 구현체 바이트코드 조회
      const implementationBytecode = await provider.getCode(implementationAddress as string);
      // console.log('implementationBytecode', implementationBytecode);

      // 5.3 구현체 바이트코드 캐시 비교
      const refImplBytecode = l2BytecodeCache.getBytecode(name);
      // console.log('refImplBytecode', refImplBytecode);
      isImplementationMatch = refImplBytecode && implementationBytecode
      ? implementationBytecode.toLowerCase() === refImplBytecode.toLowerCase()
      : false;

      // console.log('isImplementationMatch', isImplementationMatch);
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