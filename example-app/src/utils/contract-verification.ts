import { ethers } from 'ethers';

/**
 * 컨트랙트 검증 결과 타입
 */
export interface ContractVerificationResult {
  address: string;
  chainId: number;
  networkType: 'l1' | 'l2';
  contractName: string;
  bytecodeExists: boolean;
  bytecodeLength: number;
  contractType: 'proxy' | 'implementation' | 'unknown';
  proxyInfo?: {
    implementation?: string;
    admin?: string;
    beacon?: string;
  };
  verificationStatus: 'verified' | 'unverified' | 'error';
  error?: string;
  details?: {
    bytecode?: string;
    bytecodeHash?: string;
    storageSlots?: Record<string, string>;
  };
}

/**
 * 컨트랙트 바이트코드를 가져옵니다.
 * @param address 컨트랙트 주소
 * @param rpcUrl RPC URL
 * @returns 바이트코드 (0x로 시작하는 hex 문자열)
 */
export async function getContractBytecode(address: string, rpcUrl: string): Promise<string> {
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
 * 컨트랙트 소스코드 해시를 계산합니다.
 * @param sourceCode 소스코드 문자열
 * @returns keccak256 해시
 */
export function calculateSourceCodeHash(sourceCode: string): string {

  return ethers.keccak256(ethers.toUtf8Bytes(sourceCode));
}