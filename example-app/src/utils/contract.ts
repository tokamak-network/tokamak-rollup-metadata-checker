import { keccak256 } from 'ethers';

/**
 * 함수 시그니처를 계산하여 함수 선택자(selector)를 반환합니다.
 * @param functionName 함수명 (예: "memo", "transfer", "balanceOf")
 * @param params 매개변수 타입 배열 (예: ["address", "uint256"])
 * @returns 함수 선택자 (예: "0x58c3b870")
 */
export function calculateFunctionSelector(functionName: string, params: string[] = []): string {
  // 함수 시그니처 생성: "functionName(type1,type2,...)"
  const signature = params.length > 0
    ? `${functionName}(${params.join(',')})`
    : `${functionName}()`;

  // keccak256 해시 계산
  const hash = keccak256(Buffer.from(signature, 'utf8'));

  // 처음 4바이트(8자리) 반환
  return hash.slice(0, 10); // 0x + 8자리
}

/**
 * 일반적인 ERC20 함수들의 시그니처를 미리 계산한 객체
 */
export const ERC20_FUNCTION_SELECTORS = {
  'name()': calculateFunctionSelector('name'),
  'symbol()': calculateFunctionSelector('symbol'),
  'decimals()': calculateFunctionSelector('decimals'),
  'totalSupply()': calculateFunctionSelector('totalSupply'),
  'balanceOf(address)': calculateFunctionSelector('balanceOf', ['address']),
  'transfer(address,uint256)': calculateFunctionSelector('transfer', ['address', 'uint256']),
  'transferFrom(address,address,uint256)': calculateFunctionSelector('transferFrom', ['address', 'address', 'uint256']),
  'approve(address,uint256)': calculateFunctionSelector('approve', ['address', 'uint256']),
  'allowance(address,address)': calculateFunctionSelector('allowance', ['address', 'address'])
};

/**
 * 일반적인 컨트랙트 함수들의 시그니처를 미리 계산한 객체
 */
export const COMMON_FUNCTION_SELECTORS = {
  'memo()': calculateFunctionSelector('memo'),
  'getMemo()': calculateFunctionSelector('getMemo'),
  'description()': calculateFunctionSelector('description'),
  'getDescription()': calculateFunctionSelector('getDescription'),
  'info()': calculateFunctionSelector('info'),
  'getInfo()': calculateFunctionSelector('getInfo'),
  'data()': calculateFunctionSelector('data'),
  'getData()': calculateFunctionSelector('getData'),
  'operator()': calculateFunctionSelector('operator'),
  'manager()': calculateFunctionSelector('manager')
};

/**
 * 함수명으로 미리 계산된 선택자를 찾거나 동적으로 계산합니다.
 * @param functionName 함수명
 * @param params 매개변수 타입 배열
 * @returns 함수 선택자
 */
export function getFunctionSelector(functionName: string, params: string[] = []): string {
  // 매개변수가 없는 경우 미리 계산된 선택자에서 찾기
  if (params.length === 0) {
    const signature = `${functionName}()`;

    // ERC20 함수들 확인
    if (signature in ERC20_FUNCTION_SELECTORS) {
      return ERC20_FUNCTION_SELECTORS[signature as keyof typeof ERC20_FUNCTION_SELECTORS];
    }

    // 일반적인 함수들 확인
    if (signature in COMMON_FUNCTION_SELECTORS) {
      return COMMON_FUNCTION_SELECTORS[signature as keyof typeof COMMON_FUNCTION_SELECTORS];
    }
  }

  // 미리 계산된 것이 없으면 동적으로 계산
  return calculateFunctionSelector(functionName, params);
}