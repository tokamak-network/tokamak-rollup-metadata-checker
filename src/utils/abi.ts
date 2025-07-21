import { ethers } from 'ethers';
import { CANDIDATE_ADD_ON_ABI } from './abi/candidate-add-on';
import { OPERATOR_MANAGER_ABI } from './abi/operator-manager';
import { ERC20_ABI } from './abi/erc20';

/**
 * 컨트랙트별 ABI 매핑
 */
export const CONTRACT_ABI_MAP = {
  'candidate-add-on': CANDIDATE_ADD_ON_ABI,
  'operator-manager': OPERATOR_MANAGER_ABI,
  'erc20': ERC20_ABI,
  'default': CANDIDATE_ADD_ON_ABI
};

/**
 * 함수명으로 ABI를 찾습니다.
 * @param functionName 함수명
 * @param contractType 컨트랙트 타입 (선택사항)
 * @returns 함수 ABI 또는 null
 */
export function findFunctionABI(functionName: string, contractType?: string): any {
  const abi = contractType ? CONTRACT_ABI_MAP[contractType as keyof typeof CONTRACT_ABI_MAP] : CANDIDATE_ADD_ON_ABI;

  return abi.find((item: any) =>
    item.type === 'function' && item.name === functionName
  ) || null;
}

/**
 * 함수의 파라미터 개수를 확인합니다.
 * @param functionName 함수명
 * @param contractType 컨트랙트 타입 (선택사항)
 * @returns 파라미터 개수
 */
export function getFunctionParamCount(functionName: string, contractType?: string): number {
  const functionABI = findFunctionABI(functionName, contractType);
  return functionABI ? functionABI.inputs.length : 0;
}

/**
 * 함수의 파라미터 타입들을 반환합니다.
 * @param functionName 함수명
 * @param contractType 컨트랙트 타입 (선택사항)
 * @returns 파라미터 타입 배열
 */
export function getFunctionParamTypes(functionName: string, contractType?: string): string[] {
  const functionABI = findFunctionABI(functionName, contractType);
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