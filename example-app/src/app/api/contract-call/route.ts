import { NextRequest, NextResponse } from 'next/server';
import { createContract, findFunctionABI, getFunctionParamCount } from '@/utils/abi';
import { getRpcUrl, getActualBlockTime, getActualGasLimit } from '@/utils/rpc';
import { ethers } from 'ethers';

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

  // contractType이 'code'인 경우 컨트랙트 코드를 가져옴
  if (contractType === 'code') {
    try {
      const rpcUrl = getRpcUrl(chainId);
      console.log('🌐 RPC URL for code fetch:', rpcUrl);

      const { getContractBytecode, analyzeContractType } = await import('@/utils/abi');

      // 바이트코드 가져오기
      const bytecode = await getContractBytecode(address, rpcUrl);
      console.log('📦 Bytecode length:', bytecode !== '0x' ? bytecode.length - 2 : 0);

      if (bytecode === '0x') {
        return NextResponse.json({
          result: null,
          error: 'Contract not found at this address',
          bytecodeExists: false
        });
      }

      // 컨트랙트 타입 분석
      const contractAnalysis = await analyzeContractType(address, rpcUrl);

      return NextResponse.json({
        result: {
          bytecode: bytecode,
          bytecodeLength: bytecode.length - 2, // 0x 제외
          bytecodeExists: true,
          contractType: contractAnalysis.contractType,
          proxyInfo: contractAnalysis.proxyInfo
        }
      });
    } catch (error) {
      console.error('❌ Error fetching contract code:', error);
      return NextResponse.json({
        error: 'Failed to fetch contract code',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  }

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

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl, mode } = await request.json();
    if (!rpcUrl) {
      return NextResponse.json({ error: 'rpcUrl is required' }, { status: 400 });
    }

    // 새 기능: L2 Gas Limit, L2 Block Time 조회
    if (mode === 'gasAndBlockTime') {
      try {
        // getActualBlockTime과 getActualGasLimit 함수 사용
        const [actualBlockTime, actualGasLimit] = await Promise.all([
          getActualBlockTime(rpcUrl),
          getActualGasLimit(rpcUrl)
        ]);

        // 최신 블록 번호도 가져오기
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const latestBlock = await provider.getBlock('latest');

        return NextResponse.json({
          success: true,
          gasLimit: actualGasLimit.toString(),
          blockTime: actualBlockTime,
          latestBlock: latestBlock?.number || 0,
        });
      } catch (e) {
        return NextResponse.json({ success: false, error: e instanceof Error ? e.message : e });
      }
    }

    // 기존: 단순 연결 확인
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const blockNumber = await provider.getBlockNumber();
      return NextResponse.json({ success: true, blockNumber });
    } catch (e) {
      return NextResponse.json({ success: false, error: e instanceof Error ? e.message : e });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}