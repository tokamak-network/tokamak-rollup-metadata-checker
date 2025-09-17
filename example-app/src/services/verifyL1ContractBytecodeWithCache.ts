import { l1BytecodeCache } from './l1-bytecode-cache';
import { ethers } from 'ethers';
import { CONTRACT_PROXY_TYPE_MAP } from '@/config/index';
import { getBytecodeByProxyType } from '@/utils/official-deployment';
import { getProxyImplementation, getProxyImplementationByProxyAdmin } from '@/utils/abi';
import { L1_CONTRACT_NAMES } from '@/config/index';
import { MAINNET_RPC_URL, SEPOLIA_RPC_URL } from '@/config/index';
import { isValidAddress } from '@/utils/validation';

/**
 * Mips 컨트랙트의 바이트코드를 비교하는 함수
 * 주어진 position, onchainBytecode 에서 해당 포지션의 값은 preimageOracleAddress 주소의 앞의 0x 빼고 같아야 하고,
onchainBytecode 와  refImplBytecode 의 포지션 이외의 바이트가 같아야 한다.
 */
function compareMipsBytecode(onchainBytecode: string, refImplBytecode: string, preimageOracleAddress: string): boolean {
  // 0x 제거
  const onchainClean = onchainBytecode.startsWith('0x') ? onchainBytecode.slice(2) : onchainBytecode;
  const refImplClean = refImplBytecode.startsWith('0x') ? refImplBytecode.slice(2) : refImplBytecode;
  const expectedAddress = preimageOracleAddress.startsWith('0x') ? preimageOracleAddress.slice(2).toLowerCase() : preimageOracleAddress.toLowerCase();

  // console.log('=== Mips 바이트코드 포지션 검증 시작 ===');
  // console.log('Expected preimageOracleAddress:', expectedAddress);
  // console.log('Onchain bytecode length:', onchainClean.length);
  // console.log('RefImpl bytecode length:', refImplClean.length);

  // console.log('Onchain bytecode:', onchainClean);
  // 알려진 주소 포지션들 (hex character positions)
  let positions = [
    { start: 380, end: 420 },      // 첫 번째 주소 위치
    { start: 3566, end: 3606 },    // 두 번째 주소 위치
  ];

  // 1. onchainBytecode의 포지션 값이 preimageOracleAddress와 일치하는지 검증
  // console.log('\n--- 포지션별 주소 검증 ---');
  let addressValidationPassed = true;

  positions.forEach((pos, index) => {
    const onchainAddressAtPos = onchainClean.substring(pos.start, pos.end).toLowerCase();
    // console.log(`포지션 ${index + 1} (${pos.start}-${pos.end}):`);
    // console.log(`  Onchain address: ${onchainAddressAtPos}`);
    // console.log(`  Expected address: ${expectedAddress}`);
    // console.log(`  Match: ${onchainAddressAtPos === expectedAddress}`);

    if (onchainAddressAtPos !== expectedAddress) {
      addressValidationPassed = false;
    }
  });

  // console.log(`\n주소 검증 결과: ${addressValidationPassed ? 'PASS' : 'FAIL'}`);

  // 첫 번째 검증이 실패하면 바로 false 반환
  if (!addressValidationPassed) {
    // console.log('\n=== 주소 검증 실패로 인한 조기 종료 ===');
    return false;
  }

  // 2. 포지션 안의 주소를 0으로 바꾸고 전체 바이트코드 비교
  // console.log('\n--- 포지션을 0으로 바꾸고 비교 ---');

  // 포지션 안의 주소를 0으로 바꾸는 함수
  function replacePositionsWithZero(bytecode: string): string {
    let result = bytecode;
    positions.forEach((pos, index) => {
      const beforePos = result.substring(0, pos.start);
      const afterPos = result.substring(pos.end);
      const zeroAddress = '0000000000000000000000000000000000000000'; // 20바이트 = 40 hex characters
      result = beforePos + zeroAddress + afterPos;
      // console.log(`포지션 ${index + 1} (${pos.start}-${pos.end})을 0으로 교체`);
    });
    return result;
  }

  // 두 바이트코드 모두에서 포지션을 0으로 바꾸기
  const onchainWithZero = replacePositionsWithZero(onchainClean);
  const refImplWithZero = replacePositionsWithZero(refImplClean);

  // console.log('Onchain with zero positions length:', onchainWithZero.length);
  // console.log('RefImpl with zero positions length:', refImplWithZero.length);

  // 전체 바이트코드 비교
  const byteComparisonPassed = onchainWithZero.toLowerCase() === refImplWithZero.toLowerCase();
  // console.log(`\n바이트 비교 결과: ${byteComparisonPassed ? 'PASS' : 'FAIL'}`);

  // if (!byteComparisonPassed) {
  //   // 차이점이 있는 경우 처음 500자 비교
  //   console.log('Onchain (first 500):', onchainWithZero.substring(0, 500));
  //   console.log('RefImpl (first 500):', refImplWithZero.substring(0, 500));
  // }

  const finalResult = addressValidationPassed && byteComparisonPassed;
  // console.log(`\n=== 최종 검증 결과: ${finalResult ? 'PASS' : 'FAIL'} ===`);

  return finalResult;
}


export async function verifyL1ContractBytecodeWithCache({
  name,
  network,
  rpcUrl,
  address,
  proxyAdminAddress = null,
  preimageOracleAddress = null,
}: {
  name: string;
  network: string;
  rpcUrl: string|undefined;
  address: string;
  proxyAdminAddress?: string | null;
  preimageOracleAddress?: string | null;
}) {
  await l1BytecodeCache.initialize();

  // console.log('verifyL1ContractBytecodeWithCache received params:', {
  //   name,
  //   network,
  //   rpcUrl,
  //   address,
  //   proxyAdminAddress,
  //   preimageOracleAddress
  // });

  if(!rpcUrl) {
    rpcUrl = network === 'mainnet' ? MAINNET_RPC_URL : SEPOLIA_RPC_URL;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const networkInfo = await provider.getNetwork();
  const actualChainId = Number(networkInfo.chainId);

  name = name.charAt(0).toUpperCase() + name.slice(1);

  console.log('name', name);
  console.log('proxyAdminAddress', proxyAdminAddress);
  console.log('preimageOracleAddress', preimageOracleAddress);

  if (name === 'L1CrossDomainMessenger' && ( proxyAdminAddress == null || !isValidAddress(proxyAdminAddress)) ) {
    // 프록시 어드민을 통해서 로직 주소를 조회해야 한다. 파리미터로 프록시 어드민 주소를 꼭 받아야만 가능하다.
    throw new Error('Missing proxy admin address');
  }

  // 1. 받은 name 의 이름 뒤에 Proxy 라는 단어를 붙인것이 L1 컨트랙 목록에 있으면 그것이 프록시 컨트랙 이름임
  const proxyName = name + 'Proxy';
  // console.log('proxyName', proxyName);

  // 프록시 이름이 L1 컨트랙 목록에 있는지 확인
  const isProxy = L1_CONTRACT_NAMES.includes(proxyName);
  // console.log('isProxy', isProxy);
  // console.log('L1_CONTRACT_NAMES', L1_CONTRACT_NAMES);
  // console.log('name', name); // 여기로 이동

  if(!isProxy) {
    let onchainBytecode = '';
    try {
      onchainBytecode = await provider.getCode(address);
    } catch (e) {
      throw new Error('Failed to fetch onchain bytecode: ' + (e instanceof Error ? e.message : e));
    }

    // console.log('onchainBytecode', onchainBytecode);

    const refImplBytecode = l1BytecodeCache.getBytecode(name);
    // console.log('refImplBytecode', refImplBytecode);
  // console.log('name', name);
  // console.log('preimageOracleAddress', preimageOracleAddress);
    // Mips 컨트랙트의 경우 주소 부분(26~65바이트)을 제외하고 비교
    let match = false;
    if (refImplBytecode && onchainBytecode) {
      if (name.toLowerCase() === 'mips') {
        // Mips 전용 바이트코드 비교 함수 사용
        if (!preimageOracleAddress) {
          // console.warn('Mips 컨트랙트 검증을 위해서는 preimageOracleAddress가 필요합니다. 일반 바이트코드 비교를 사용합니다.');
          match = onchainBytecode.toLowerCase() === refImplBytecode.toLowerCase();
        } else {
          match = compareMipsBytecode(onchainBytecode, refImplBytecode, preimageOracleAddress);
        }
      } else {
        // 일반적인 전체 바이트코드 비교
        match = onchainBytecode.toLowerCase() === refImplBytecode.toLowerCase();
      }
    }

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