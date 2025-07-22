import { ethers } from 'ethers';
import { CANDIDATE_ADD_ON_ABI } from './abi/candidate-add-on';
import { OPERATOR_MANAGER_ABI } from './abi/operator-manager';
import { ERC20_ABI } from './abi/erc20';
import { SYSTEM_CONFIG_ABI } from './abi/system-config';
import { fetchOfficialDeployment } from './official-deployment';



/**
 * 컨트랙트별 ABI 매핑
 */
export const CONTRACT_ABI_MAP = {
  'candidate-add-on': CANDIDATE_ADD_ON_ABI,
  'operator-manager': OPERATOR_MANAGER_ABI,
  'erc20': ERC20_ABI,
  'system-config': SYSTEM_CONFIG_ABI,
  'default': CANDIDATE_ADD_ON_ABI
};

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
} as const;

export type ProxyType = typeof CONTRACT_PROXY_TYPE_MAP[keyof typeof CONTRACT_PROXY_TYPE_MAP];

// 함수 시그니처 파싱 유틸
function parseFunctionSignature(signature: string): { name: string; paramTypes: string[] } {
  const match = signature.match(/^([^(]+)\(([^)]*)\)$/);
  if (!match) return { name: signature, paramTypes: [] };
  const name = match[1];
  const paramTypes = match[2].split(',').map(s => s.trim()).filter(Boolean);
  return { name, paramTypes };
}

/**
 * 함수명 또는 시그니처로 ABI를 찾습니다.
 * @param functionNameOrSignature 함수명 또는 시그니처 (예: foo(uint256))
 * @param contractType 컨트랙트 타입 (선택사항)
 * @returns 함수 ABI 또는 null
 */
export function findFunctionABI(functionNameOrSignature: string, contractType?: string): any {
  const abi = contractType ? CONTRACT_ABI_MAP[contractType as keyof typeof CONTRACT_ABI_MAP] : CANDIDATE_ADD_ON_ABI;
  const { name, paramTypes } = parseFunctionSignature(functionNameOrSignature);
  if (paramTypes.length > 0) {
    // 시그니처로 정확히 매칭
    return abi.find((item: any) =>
      item.type === 'function' &&
      item.name === name &&
      item.inputs &&
      item.inputs.length === paramTypes.length &&
      item.inputs.every((input: any, i: number) => input.type === paramTypes[i])
    ) || null;
  } else {
    // 함수명만 있을 때(구버전 호환)
    return abi.find((item: any) =>
      item.type === 'function' && item.name === name
    ) || null;
  }
}

export function getFunctionParamCount(functionNameOrSignature: string, contractType?: string): number {
  const functionABI = findFunctionABI(functionNameOrSignature, contractType);
  return functionABI ? functionABI.inputs.length : 0;
}

export function getFunctionParamTypes(functionNameOrSignature: string, contractType?: string): string[] {
  const functionABI = findFunctionABI(functionNameOrSignature, contractType);
  return functionABI ? functionABI.inputs.map((input: any) => input.type) : [];
}

/**
 * 컨트랙트 인스턴스를 생성합니다.
 * @param address 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @param contractType 컨트랙트 타입 (선택사항)
 * @returns ethers Contract 인스턴스
 */
export function createContract(address: string, rpcUrl: string, contractType?: string): ethers.Contract {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const abi = contractType ? CONTRACT_ABI_MAP[contractType as keyof typeof CONTRACT_ABI_MAP] : CANDIDATE_ADD_ON_ABI;

  return new ethers.Contract(address, abi, provider);
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 컨트랙트 바이트코드를 가져옵니다.
 * @param address 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 바이트코드 (0x로 시작하는 hex 문자열)
 */
export async function getContractBytecode(address: string, rpcUrl: string): Promise<string> {
  await sleep(500);
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const bytecode = await provider.getCode(address);
    return bytecode;
  } catch (error) {
    console.error('Error fetching contract bytecode:', error);
    throw new Error(`Failed to fetch bytecode for ${address}: ${error}`);
  }
}

/**
 * 컨트랙트 스토리지 슬롯을 읽습니다.
 * @param address 컨트랙트 주소
 * @param slot 스토리지 슬롯 (hex 문자열)
 * @param rpcUrl RPC URL
 * @returns 스토리지 값 (hex 문자열)
 */
export async function getStorageAt(address: string, slot: string, rpcUrl: string): Promise<string> {
  await sleep(500);
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const value = await provider.getStorage(address, slot);
    return value;
  } catch (error) {
    console.error('Error fetching storage at slot:', slot, error);
    throw new Error(`Failed to fetch storage at slot ${slot}: ${error}`);
  }
}

/**
 * EIP-1967 프록시 구현 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 구현 주소 또는 null
 */
export async function getProxyImplementation(address: string, rpcUrl: string): Promise<string | null> {
  try {
    // EIP-1967 implementation slot
    const implementationSlot = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';
    const implementation = await getStorageAt(address, implementationSlot, rpcUrl);

    if (implementation === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    // 20바이트 주소로 변환 (마지막 20바이트)
    return '0x' + implementation.slice(-40);
  } catch (error) {
    console.error('Error getting proxy implementation:', error);
    return null;
  }
}

/**
 * EIP-1967 프록시 관리자 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 관리자 주소 또는 null
 */
export async function getProxyAdmin(address: string, rpcUrl: string): Promise<string | null> {
  try {
    // EIP-1967 admin slot
    const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
    const admin = await getStorageAt(address, adminSlot, rpcUrl);

    if (admin === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    // 20바이트 주소로 변환 (마지막 20바이트)
    return '0x' + admin.slice(-40);
  } catch (error) {
    console.error('Error getting proxy admin:', error);
    return null;
  }
}

/**
 * EIP-1967 Beacon 프록시 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns Beacon 주소 또는 null
 */
export async function getProxyBeacon(address: string, rpcUrl: string): Promise<string | null> {
  try {
    // EIP-1967 beacon slot
    const beaconSlot = '0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50';
    const beacon = await getStorageAt(address, beaconSlot, rpcUrl);

    if (beacon === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    // 20바이트 주소로 변환 (마지막 20바이트)
    return '0x' + beacon.slice(-40);
  } catch (error) {
    console.error('Error getting proxy beacon:', error);
    return null;
  }
}

/**
 * L1ChugSplashProxy의 어드민 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 어드민 주소 또는 null
 */
export async function getL1ChugSplashProxyAdmin(address: string, rpcUrl: string): Promise<string | null> {
  try {
    // L1ChugSplashProxy admin slot
    const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
    const admin = await getStorageAt(address, adminSlot, rpcUrl);

    if (admin === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    // 20바이트 주소로 변환 (마지막 20바이트)
    return '0x' + admin.slice(-40);
  } catch (error) {
    console.error('Error getting L1ChugSplashProxy admin:', error);
    return null;
  }
}

/**
 * ResolvedDelegateProxy의 어드민 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 어드민 주소 또는 null
 */
export async function getResolvedDelegateProxyAdmin(address: string, rpcUrl: string): Promise<string | null> {
  // ResolvedDelegateProxy는 어드민을 따로 제공하지 않음
  return null;
}

/**
 * L1UsdcBridgeProxy의 어드민 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 어드민 주소 또는 null
 */
export async function getL1UsdcBridgeProxyAdmin(address: string, rpcUrl: string): Promise<string | null> {
  try {
    // L1UsdcBridgeProxy admin slot (일반적으로 EIP-1967과 동일)
    const adminSlot = '0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103';
    const admin = await getStorageAt(address, adminSlot, rpcUrl);

    if (admin === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null;
    }

    // 20바이트 주소로 변환 (마지막 20바이트)
    return '0x' + admin.slice(-40);
  } catch (error) {
    console.error('Error getting L1UsdcBridgeProxy admin:', error);
    return null;
  }
}

/**
 * 프록시 타입별로 어드민 주소를 가져옵니다.
 * @param address 프록시 컨트랙트 주소
 * @param proxyType 프록시 타입
 * @param rpcUrl RPC URL
 * @returns 어드민 주소 또는 null
 */
export async function getProxyAdminByType(
  address: string,
  proxyType: ProxyType,
  rpcUrl: string
): Promise<string | null> {
  switch (proxyType) {
    case 'Proxy':
      return await getProxyAdmin(address, rpcUrl);
    case 'L1ChugSplashProxy':
      return await getL1ChugSplashProxyAdmin(address, rpcUrl);
    case 'ResolvedDelegateProxy':
      return await getResolvedDelegateProxyAdmin(address, rpcUrl);
    case 'L1UsdcBridgeProxy':
      return await getL1UsdcBridgeProxyAdmin(address, rpcUrl);
    default:
      console.error('Unknown proxy type:', proxyType);
      return null;
  }
}

/**
 * 컨트랙트 타입을 판별합니다.
 * @param address 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 컨트랙트 타입과 프록시 정보
 */
export async function analyzeContractType(address: string, rpcUrl: string): Promise<{
  contractType: 'proxy' | 'implementation' | 'unknown';
  proxyInfo?: {
    implementation?: string;
    admin?: string;
    beacon?: string;
  };
}> {
  try {
    const implementation = await getProxyImplementation(address, rpcUrl);
    const admin = await getProxyAdmin(address, rpcUrl);
    const beacon = await getProxyBeacon(address, rpcUrl);

    if (implementation || admin || beacon) {
      return {
        contractType: 'proxy',
        proxyInfo: {
          implementation: implementation || undefined,
          admin: admin || undefined,
          beacon: beacon || undefined
        }
      };
    }

    // 프록시가 아닌 경우, 다른 컨트랙트의 구현체인지 확인
    const bytecode = await getContractBytecode(address, rpcUrl);
    if (bytecode !== '0x') {
      return {
        contractType: 'implementation'
      };
    }

    return {
      contractType: 'unknown'
    };
  } catch (error) {
    console.error('Error analyzing contract type:', error);
    return {
      contractType: 'unknown'
    };
  }
}



export async function verifyProxyAndImplementation(
  contractName: string,
  network: 'mainnet' | 'sepolia',
  rpcUrl: string,
  address: string // 검증할 주소
) {
  // L1CrossDomainMessenger는 제외
  if (contractName === 'L1CrossDomainMessenger') {
    throw new Error('L1CrossDomainMessenger is not supported yet. Please use a different contract.');
  }
  // 1. 프록시 타입 확인
  const expectedProxyType = CONTRACT_PROXY_TYPE_MAP[contractName as keyof typeof CONTRACT_PROXY_TYPE_MAP];
  console.log('expectedProxyType:', expectedProxyType);

  if (!expectedProxyType) {
    throw new Error(`Unknown contract: ${contractName}`);
  }

  // 1. 공식문서에서 바이트코드 조회 - 프록시 바이트 조회 및 구현체 바이트 조회
  // 프록시 바이트코드 조회
  const official = await fetchOfficialDeployment(expectedProxyType, network);
  const officialProxyBytecode = official.deployedBytecode;
  console.log('officialProxyBytecode:', officialProxyBytecode);
  console.log('officialProxyBytecode length:', officialProxyBytecode.length);
  // 입력받은 주소의 프로시 바이트코드 조회
  const inputProxyBytecode = await getContractBytecode(address, rpcUrl);
  console.log('inputProxyBytecode:', inputProxyBytecode);
  console.log('inputProxyBytecode length:', inputProxyBytecode.length);
  await sleep(100); // Rate limit 방지
  // 3. 프록시 바이트코드 비교
  const isProxy = inputProxyBytecode && officialProxyBytecode
    ? inputProxyBytecode.toLowerCase() === officialProxyBytecode.toLowerCase()
    : false;

  console.log('isProxy:', isProxy);

  // 구현체 바이트코드 조회
  const officialImplementation = await fetchOfficialDeployment(contractName, network);
  const officialImplBytecode = officialImplementation.bytecode;
  // 입력받은 주소의 implementation 주소 조회, admin 주소 조회
  const implementationAddress = await getProxyImplementation(address, rpcUrl);
  await sleep(100); // Rate limit 방지
  const implementationBytecode = implementationAddress ? await getContractBytecode(implementationAddress, rpcUrl) : null;

  await sleep(100); // Rate limit 방지

  let implementationMatch = false;
  if (implementationBytecode) {
    implementationMatch = implementationBytecode && officialImplBytecode
      ? implementationBytecode.toLowerCase() === officialImplBytecode.toLowerCase()
      : false;
  }

  // 5. 프록시 타입별 어드민 주소 가져오기 (프록시인 경우만)
  let adminAddress = null;
  if (expectedProxyType) {
    adminAddress = await getProxyAdminByType(address, expectedProxyType, rpcUrl);
  }

  return {
    contractName,
    address,
    isProxy,
    proxyMatch: isProxy,
    implementationAddress,
    implementationMatch,
    officialProxyBytecode,
    officialImplBytecode,
    inputProxyBytecode,
    implementationBytecode,
    adminAddress
  };
}

