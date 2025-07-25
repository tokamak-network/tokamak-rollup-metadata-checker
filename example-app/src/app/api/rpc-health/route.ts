import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const { rpcUrl } = await request.json();
    if (!rpcUrl) {
      return NextResponse.json({ healthy: false, error: 'rpcUrl is required' }, { status: 400 });
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    let blockNumber, block, gasLimit, blockTime;
    try {
      blockNumber = await provider.getBlockNumber();
      block = await provider.getBlock(blockNumber);
      gasLimit = block?.gasLimit?.toString();
      blockTime = block?.timestamp;
    } catch (e) {
      return NextResponse.json({ healthy: false, error: 'Failed to fetch block info: ' + (e instanceof Error ? e.message : e) });
    }
    if (blockNumber && gasLimit && blockTime && gasLimit !== '0' && blockTime !== 0) {
      return NextResponse.json({ healthy: true });
    } else {
      return NextResponse.json({ healthy: false, error: 'Missing or invalid blockTime or gasLimit' });
    }
  } catch (error) {
    return NextResponse.json({ healthy: false, error: error instanceof Error ? error.message : String(error) });
  }
}