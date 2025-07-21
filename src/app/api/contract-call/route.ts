import { NextRequest, NextResponse } from 'next/server';
import { createContract, findFunctionABI, getFunctionParamCount } from '@/utils/abi';
import { getRpcUrl } from '@/utils/rpc';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chainId = searchParams.get('chainId');
  const functionName = searchParams.get('function') || 'memo';
  const contractType = searchParams.get('contractType') || 'default';
  const params = searchParams.get('params'); // JSON 문자열로 전달된 파라미터들

  console.log('🚀 API Call - Address:', address, 'ChainId:', chainId, 'Function:', functionName, 'ContractType:', contractType, 'Params:', params);

  if (!address || !chainId) {
    console.error('❌ Missing required parameters');
    return NextResponse.json({ error: 'Address and chainId are required' }, { status: 400 });
  }

  try {
    // RPC URL 가져오기
    const rpcUrl = getRpcUrl(chainId);
    console.log('🌐 RPC URL:', rpcUrl);

    // 함수 ABI 확인
    const functionABI = findFunctionABI(functionName, contractType);
    if (!functionABI) {
      console.error('❌ Function ABI not found:', functionName);
      return NextResponse.json({ error: `Function ${functionName} not found in ABI` }, { status: 400 });
    }

    console.log('🔍 Function ABI:', functionABI);

        // 파라미터 파싱 및 검증
    let functionParams: any[] = [];
    if (params) {
      try {
        functionParams = JSON.parse(params);
        console.log('🔍 Parsed parameters:', functionParams);

        // 파라미터 개수 검증
        const expectedParamCount = getFunctionParamCount(functionName, contractType);
        if (functionParams.length !== expectedParamCount) {
          console.error('❌ Parameter count mismatch:', functionParams.length, 'expected:', expectedParamCount);
          return NextResponse.json({
            error: `Function ${functionName} expects ${expectedParamCount} parameters, but ${functionParams.length} were provided`
          }, { status: 400 });
        }
      } catch (parseError) {
        console.error('❌ Error parsing parameters:', parseError);
        return NextResponse.json({ error: 'Invalid parameters format' }, { status: 400 });
      }
    } else {
      // 파라미터가 없는데 필요한 경우 에러
      const expectedParamCount = getFunctionParamCount(functionName, contractType);
      if (expectedParamCount > 0) {
        console.error('❌ Missing required parameters for function:', functionName);
        return NextResponse.json({
          error: `Function ${functionName} requires ${expectedParamCount} parameters`
        }, { status: 400 });
      }
    }

    // ethers를 사용한 컨트랙트 호출
    console.log('📞 Creating contract instance and calling function...');

    let result;
    try {
      const contract = createContract(address, rpcUrl, contractType);

      // 함수 호출 (파라미터가 있으면 전달, 없으면 파라미터 없이 호출)
      if (functionParams.length > 0) {
        result = await contract[functionName](...functionParams);
      } else {
        result = await contract[functionName]();
      }
      console.log('✅ Contract call successful, result:', result);
    } catch (error) {
      console.error('❌ Contract call failed:', error);

      // 함수가 없거나 호출 실패를 의미하는 에러들
      if (error instanceof Error && (
        error.message.includes('execution reverted') ||
        error.message.includes('function not found') ||
        error.message.includes('call revert')
      )) {
        console.log('⚠️ Function not found or call reverted');
        return NextResponse.json({ result: null, error: 'Function not found or call reverted' });
      }
      throw error;
    }

    // 결과 처리
    if (result === null || result === undefined) {
      console.log('⚠️ Null/undefined result received');
      return NextResponse.json({ result: null });
    }

    // 주소 타입인 경우 0x0 체크
    if (functionABI.outputs[0].type === 'address' && result === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️ Zero address result');
      return NextResponse.json({ result: null });
    }

    console.log('✅ Final result:', result);
    return NextResponse.json({ result: result });
  } catch (error) {
    console.error('Error fetching contract call:', error);
    return NextResponse.json({ error: 'Failed to fetch contract call' }, { status: 500 });
  }
}