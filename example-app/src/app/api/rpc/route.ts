import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { getActualBlockTime, getActualGasLimit } from '@/utils/rpc';

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl } = await request.json();
    if (!rpcUrl) {
      return NextResponse.json({ success: false, error: 'rpcUrl is required' }, { status: 400 });
    }
    try {
      // getActualBlockTime과 getActualGasLimit 함수 사용
      const [actualBlockTime, actualGasLimit] = await Promise.all([
        getActualBlockTime(rpcUrl),
        getActualGasLimit(rpcUrl)
      ]);

      if (actualBlockTime > 0 && actualGasLimit > 0) {
        return NextResponse.json({
          success: true,
          blockTime: actualBlockTime,
          gasLimit: actualGasLimit.toString()
        });
      } else {
        return NextResponse.json({ success: false, error: 'Failed to fetch valid block time or gas limit' });
      }
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Failed to fetch block info: ' + (e instanceof Error ? e.message : e) });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
}