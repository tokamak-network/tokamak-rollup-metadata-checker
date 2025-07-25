import { NextRequest, NextResponse } from 'next/server';
import { verifyL2ContractBytecode } from '@/services/verifyL2ContractBytecode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, chainId, rpcUrl, l2ChainId } = body;
    if (!name || !address || !chainId || !rpcUrl || !l2ChainId) {
      return NextResponse.json({ error: 'name, address, chainId, l2ChainId, rpcUrl are required' }, { status: 400 });
    }

    try {
      const result = await verifyL2ContractBytecode({ name, address, rpcUrl, l2ChainId });
      // 바이트코드 일부만 응답에 포함
      return NextResponse.json({
        ...result,
      });
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

