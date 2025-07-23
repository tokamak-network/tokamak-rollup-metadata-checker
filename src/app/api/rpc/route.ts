import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl } = await request.json();
    if (!rpcUrl) {
      return NextResponse.json({ error: 'rpcUrl is required' }, { status: 400 });
    }
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      // 최신 블록
      const latestBlock = await provider.getBlock('latest');
      if (!latestBlock) {
        return NextResponse.json({ success: false, error: 'Failed to fetch latest block' });
      }
      // 이전 블록
      const prevBlock = await provider.getBlock(latestBlock.number - 1);
      if (!prevBlock) {
        return NextResponse.json({ success: false, error: 'Failed to fetch previous block' });
      }
      // Gas Limit
      const gasLimit = latestBlock.gasLimit.toString();
      // Block Time (초)
      let blockTime = null;
      if (latestBlock.timestamp && prevBlock.timestamp) {
        blockTime = latestBlock.timestamp - prevBlock.timestamp;
      }
      return NextResponse.json({
        success: true,
        gasLimit,
        blockTime,
        latestBlock: latestBlock.number,
      });
    } catch (e) {
      return NextResponse.json({ success: false, error: e instanceof Error ? e.message : e });
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}