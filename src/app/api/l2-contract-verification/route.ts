import { NextRequest, NextResponse } from 'next/server';

// TODO: L2 컨트랙트 검증 유틸리티 import 예정
// import { verifyL2Contract } from '@/utils/l2-abi';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, chainId, rpcUrl } = body;
    if (!name || !address || !chainId || !rpcUrl) {
      return NextResponse.json({ error: 'name, address, chainId, rpcUrl are required' }, { status: 400 });
    }

    // TODO: 실제 L2 컨트랙트 검증 로직 호출
    // const result = await verifyL2Contract(name, address, chainId, rpcUrl);
    const result = { message: 'L2 contract verification result will be here.' };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
